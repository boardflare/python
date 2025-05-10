import { getStoredToken } from "./indexedDB";

class TokenExpiredError extends Error {
    constructor(message = 'Sign in on Home tab to access OneDrive functions.') {
        super(message);
        this.name = 'TokenExpiredError';
    }
}

const DRIVE_APPROOT = 'https://graph.microsoft.com/v1.0/me/drive/special/approot:';
const BATCH_SIZE_LIMIT = 20;

// Gets the Graph API token from stored credentials
// @throws {TokenExpiredError} If token is not available or invalid
async function getGraphToken() {
    const tokenObj = await getStoredToken();
    if (!tokenObj?.graphToken) {
        throw new TokenExpiredError();
    }
    return tokenObj.graphToken;
}

async function handleResponse(response) {
    if (response.status === 401) {
        throw new TokenExpiredError();
    }
    if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
    }
    return response;
}

// Makes batch requests to Graph API with size limit handling
async function makeBatchRequests(requests) {
    const accessToken = await getGraphToken();
    const chunks = [];
    for (let i = 0; i < requests.length; i += BATCH_SIZE_LIMIT) {
        chunks.push(requests.slice(i, i + BATCH_SIZE_LIMIT));
    }

    const allResponses = [];
    for (const chunk of chunks) {
        const batchRequests = chunk.map((req) => ({
            id: req.id,
            method: req.method || 'GET',
            url: req.url.replace(/^https:\/\/graph\.microsoft\.com\/v1\.0\//, '')
        }));

        const response = await fetch('https://graph.microsoft.com/v1.0/$batch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests: batchRequests })
        });

        await handleResponse(response);
        const batchResponse = await response.json();
        allResponses.push(...batchResponse.responses);
    }
    return allResponses;
}

// Fetches content from a redirect URL
async function fetchRedirectContent(redirectUrl) {
    try {
        const response = await fetch(redirectUrl, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Request to redirect failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching redirect content:', error);
        throw error;
    }
}

// Creates or updates a file in the app's special folder
export async function saveFile(content, fileName) {
    const accessToken = await getGraphToken();
    try {
        const response = await fetch(`${DRIVE_APPROOT}/${fileName}:/content`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: typeof content === 'string' ? content : JSON.stringify(content)
        });

        await handleResponse(response);
        return await response.json();
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
}

// Reads a file from the app's special folder
export async function readFile(fileName) {
    const accessToken = await getGraphToken();
    try {
        const response = await fetch(`${DRIVE_APPROOT}/${fileName}:/content`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        await handleResponse(response);
        return await response.json();
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}

// Deletes a file from the app's special folder
export async function deleteFile(fileName) {
    const accessToken = await getGraphToken();
    try {
        const response = await fetch(`${DRIVE_APPROOT}/${fileName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        await handleResponse(response);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// Lists all files in the app's special folder
export async function listFiles() {
    const accessToken = await getGraphToken();
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/special/approot/children`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        await handleResponse(response);
        const data = await response.json();
        // Accept both .file and @microsoft.graph.downloadUrl as file indicators
        const files = data.value.filter(file =>
            (file.file || file['@microsoft.graph.downloadUrl']) && file.name
        );
        // Get the folder URL from the first file if available
        const folderUrl = files.length > 0 ?
            files[0].webUrl.substring(0, files[0].webUrl.lastIndexOf('/')) :
            null;
        return { files, folderUrl };
    } catch (error) {
        throw error;
    }
}

// Loads all function files from OneDrive and their contents
export async function loadFunctionFiles() {
    try {
        const { files, folderUrl } = await listFiles();
        const functionFiles = files.filter(f => f.name.endsWith('.ipynb'));

        if (functionFiles.length === 0) {
            return { driveFunctions: [], folderUrl };
        }

        // Separate files with downloadUrl (personal accounts) and those without (work/school)
        const filesWithDownloadUrl = functionFiles.filter(f => f['@microsoft.graph.downloadUrl']);
        const filesWithoutDownloadUrl = functionFiles.filter(f => !f['@microsoft.graph.downloadUrl']);

        // Prepare batch requests for files without downloadUrl
        const requests = filesWithoutDownloadUrl.map((file, index) => ({
            id: index.toString(),
            url: `${DRIVE_APPROOT}/${encodeURIComponent(file.name)}:/content`,
            method: 'GET',
            fileRef: file
        }));

        // Fetch batch responses (work/school accounts)
        let responses = [];
        if (requests.length > 0) {
            responses = await makeBatchRequests(requests);
        }

        // Map for associating responses with files
        const fileMap = {};
        filesWithoutDownloadUrl.forEach((file, index) => {
            fileMap[index.toString()] = file;
        });

        // Process batch responses
        const batchPromises = responses.map(async (response) => {
            if (response.status === 302 && response.headers && response.headers.Location) {
                const file = fileMap[response.id];
                if (!file) {
                    console.error(`No file found for response ID ${response.id}`);
                    return null;
                }
                try {
                    const notebook = await fetchRedirectContent(response.headers.Location);
                    if (notebook && notebook.cells && notebook.cells.length > 0) {
                        const firstCell = notebook.cells[0];
                        if (firstCell.metadata) {
                            return {
                                name: firstCell.metadata.name || file.name.replace('.ipynb', ''),
                                code: Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source,
                                signature: firstCell.metadata.signature,
                                description: firstCell.metadata.description,
                                resultLine: firstCell.metadata.resultLine,
                                formula: firstCell.metadata.formula,
                                fileName: file.name,
                                source: 'onedrive'
                            };
                        } else {
                            console.warn(`No metadata found in notebook cell for ${file.name}`);
                        }
                    } else {
                        console.warn(`No valid cells found in notebook for ${file.name}`);
                    }
                } catch (e) {
                    console.error(`Error processing notebook for ${file.name}:`, e);
                }
            } else if (response.status === 200) {
                const file = fileMap[response.id];
                if (!file) {
                    console.error(`No file found for response ID ${response.id}`);
                    return null;
                }
                try {
                    const notebook = response.body;
                    if (notebook && notebook.cells && notebook.cells.length > 0) {
                        const firstCell = notebook.cells[0];
                        if (firstCell.metadata) {
                            return {
                                name: firstCell.metadata.name || file.name.replace('.ipynb', ''),
                                code: Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source,
                                signature: firstCell.metadata.signature,
                                description: firstCell.metadata.description,
                                resultLine: firstCell.metadata.resultLine,
                                formula: firstCell.metadata.formula,
                                fileName: file.name,
                                source: 'onedrive'
                            };
                        } else {
                            console.warn(`No metadata found in notebook cell for ${file.name}`);
                        }
                    } else {
                        console.warn(`No valid cells found in notebook for ${file.name}`);
                    }
                } catch (e) {
                    console.error(`Error processing notebook for ${file.name}:`, e);
                }
            } else {
                console.warn(`Failed to load file with response ID ${response.id}: Status ${response.status}`);
                if (response.body && response.body.error) {
                    console.error("Error details:", response.body.error);
                }
            }
            return null;
        });

        // Fetch files with downloadUrl (personal accounts)
        const downloadUrlPromises = filesWithDownloadUrl.map(async (file) => {
            try {
                console.log(`[OneDrive] Attempting to fetch file from downloadUrl:`, file.name, file['@microsoft.graph.downloadUrl']);
                const response = await fetch(file['@microsoft.graph.downloadUrl']);
                console.log(`[OneDrive] Fetch response for`, file.name, 'status:', response.status, 'content-type:', response.headers.get('content-type'));
                if (!response.ok) {
                    console.error(`[OneDrive] Failed to fetch file from downloadUrl: ${response.statusText}`);
                    return null;
                }
                let notebook;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    notebook = await response.json();
                } else {
                    // For application/octet-stream or other types, read as text and parse as JSON
                    const text = await response.text();
                    console.log(`[OneDrive] Raw text for`, file.name, ':', text.slice(0, 200));
                    try {
                        notebook = JSON.parse(text);
                    } catch (e) {
                        console.error(`[OneDrive] Failed to parse notebook JSON for ${file.name}:`, e);
                        return null;
                    }
                }
                console.log(`[OneDrive] Parsed notebook for`, file.name, ':', notebook);
                if (notebook && notebook.cells && notebook.cells.length > 0) {
                    const firstCell = notebook.cells[0];
                    if (firstCell.metadata) {
                        console.log(`[OneDrive] Extracted function metadata for`, file.name, ':', firstCell.metadata);
                        return {
                            name: firstCell.metadata.name || file.name.replace('.ipynb', ''),
                            code: Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source,
                            signature: firstCell.metadata.signature,
                            description: firstCell.metadata.description,
                            resultLine: firstCell.metadata.resultLine,
                            formula: firstCell.metadata.formula,
                            fileName: file.name,
                            source: 'onedrive'
                        };
                    } else {
                        console.warn(`[OneDrive] No metadata found in notebook cell for ${file.name}`);
                    }
                } else {
                    console.warn(`[OneDrive] No valid cells found in notebook for ${file.name}`);
                }
            } catch (e) {
                console.error(`[OneDrive] Error processing notebook for ${file.name}:`, e);
            }
            return null;
        });

        // Wait for all promises to resolve
        const results = await Promise.all([...batchPromises, ...downloadUrlPromises]);
        const driveFunctions = results.filter(Boolean);

        return { driveFunctions, folderUrl };
    } catch (error) {
        throw error;
    }
}

// Formats a Python function and its metadata into an IPython notebook format
export function formatAsNotebook(parsedFunction) {
    return {
        cells: [{
            cell_type: "code",
            source: [parsedFunction.code],
            execution_count: null,
            metadata: { "name": parsedFunction.name, "description": parsedFunction.description },
            outputs: []
        }],
        metadata: {
            kernelspec: {
                name: "python3",
                display_name: "Python 3",
                language: "python"
            }
        },
        nbformat: 4,
        nbformat_minor: 4
    };
}

export { TokenExpiredError };
