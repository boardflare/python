import { getStoredToken } from "../../functions/utils/auth";

class TokenExpiredError extends Error {
    constructor(message = 'Sign in on Home tab to access OneDrive functions.') {
        super(message);
        this.name = 'TokenExpiredError';
    }
}

const DRIVE_APPROOT = 'https://graph.microsoft.com/v1.0/me/drive/special/approot:';
const BATCH_SIZE_LIMIT = 20;

async function handleResponse(response) {
    if (response.status === 401) {
        throw new TokenExpiredError();
    }
    if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
    }
    return response;
}

/**
 * Makes batch requests to Graph API with size limit handling
 * @param {Array} requests - Array of request objects with url, method, and file reference
 * @returns {Promise<Array>} Combined responses from all batches with file references
 */
async function makeBatchRequests(requests) {
    const accessToken = await getStoredToken();
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

        console.log("Sending batch request:", JSON.stringify({ requests: batchRequests }));

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
        console.log("Batch response:", JSON.stringify(batchResponse));
        allResponses.push(...batchResponse.responses);
    }
    return allResponses;
}

/**
 * Fetches content from a redirect URL
 * @param {string} redirectUrl - The URL to fetch content from
 * @returns {Promise<Object>} The parsed JSON response
 */
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

/**
 * Creates or updates a file in the app's special folder
 * @param {Object|string} content - Content to store
 * @param {string} fileName - Name of the file
 */
export async function saveFile(content, fileName) {
    const accessToken = await getStoredToken();
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

/**
 * Reads a file from the app's special folder
 * @param {string} fileName - Name of the file
 */
export async function readFile(fileName) {
    const accessToken = await getStoredToken();
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

/**
 * Deletes a file from the app's special folder
 * @param {string} fileName - Name of the file
 */
export async function deleteFile(fileName) {
    const accessToken = await getStoredToken();
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

/**
 * Lists all files in the app's special folder
 * @returns {Promise<{files: Array, folderUrl: string}>} List of files and folder URL
 */
export async function listFiles() {
    const accessToken = await getStoredToken();
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/special/approot/children`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        await handleResponse(response);
        const data = await response.json();
        const files = data.value.filter(file => !file.folder);
        // Get the folder URL from the first file if available
        const folderUrl = files.length > 0 ?
            files[0].webUrl.substring(0, files[0].webUrl.lastIndexOf('/')) :
            null;
        return { files, folderUrl };
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
}

/**
 * Loads all function files from OneDrive and their contents
 * @returns {Promise<{functions: Array, folderUrl: string}>} Array of function objects with their contents and folder URL
 */
export async function loadFunctionFiles() {
    try {
        const { files, folderUrl } = await listFiles();
        console.log("Files found:", files.length);
        const functionFiles = files.filter(f => f.name.endsWith('.ipynb'));
        console.log("IPython files found:", functionFiles.length);

        if (functionFiles.length === 0) {
            return { driveFunctions: [], folderUrl };
        }

        // Create requests with unique IDs that match file indices
        const requests = functionFiles.map((file, index) => ({
            id: index.toString(),
            url: `${DRIVE_APPROOT}/${encodeURIComponent(file.name)}:/content`,
            method: 'GET',
            fileRef: file
        }));

        console.log("Requests prepared:", requests.length);
        const responses = await makeBatchRequests(requests);
        console.log("Responses received:", responses.length);

        // Create a map to associate responses with their files using the ID
        const fileMap = {};
        functionFiles.forEach((file, index) => {
            fileMap[index.toString()] = file;
        });

        const driveFunctions = [];
        // Process all responses and match them to their files
        const promises = responses.map(async (response) => {
            console.log(`Processing response ID ${response.id}, status: ${response.status}`);
            if (response.status === 302 && response.headers && response.headers.Location) {
                const file = fileMap[response.id];
                if (!file) {
                    console.error(`No file found for response ID ${response.id}`);
                    return null;
                }

                try {
                    console.log(`Following redirect for ${file.name}...`);
                    const notebook = await fetchRedirectContent(response.headers.Location);
                    console.log(`Notebook for ${file.name}:`, notebook ? "Found" : "Missing");

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
                    return null; // Using return instead of continue
                }

                try {
                    const notebook = response.body;
                    console.log(`Notebook for ${file.name}:`, notebook ? "Found" : "Missing");

                    if (notebook && notebook.cells && notebook.cells.length > 0) {
                        const firstCell = notebook.cells[0];
                        if (firstCell.metadata) {
                            return {  // Return the function object instead of pushing to array
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

        // Wait for all promises to resolve
        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean);
        driveFunctions.push(...validResults);

        console.log("Total functions loaded:", driveFunctions.length);
        return { driveFunctions, folderUrl };
    } catch (error) {
        console.error('Error loading function files:', error);
        throw error;
    }
}

/**
 * Formats a Python function and its metadata into an IPython notebook format
 * @param {Object} parsedFunction - Function metadata containing code and other properties
 * @returns {Object} Notebook formatted object
 */
export function formatAsNotebook(parsedFunction) {
    return {
        cells: [{
            cell_type: "code",
            source: [parsedFunction.code],
            execution_count: null,
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
