import { getStoredToken } from "../../functions/utils/auth";

const DRIVE_APPROOT = 'https://graph.microsoft.com/v1.0/me/drive/special/approot:';

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

        if (!response.ok) throw new Error(`Failed to save file: ${response.statusText}`);
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

        if (!response.ok) throw new Error(`Failed to read file: ${response.statusText}`);
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

        if (!response.ok) throw new Error(`Failed to delete file: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

/**
 * Lists all files in the app's special folder
 * @returns {Promise<Array>} List of files
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

        if (!response.ok) throw new Error(`Failed to list files: ${response.statusText}`);
        const data = await response.json();
        return data.value.filter(file => !file.folder); // Filter out folders
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
}

/**
 * Loads all function files from OneDrive and their contents
 * @returns {Promise<Array>} Array of function objects with their contents
 */
export async function loadFunctionFiles() {
    try {
        const files = await listFiles();
        const functionFiles = files.filter(f => f.name.endsWith('.ipynb'));

        const driveFunctions = [];
        for (const file of functionFiles) {
            try {
                const notebook = await readFile(file.name);
                if (notebook.cells && notebook.cells.length > 0) {
                    const firstCell = notebook.cells[0];
                    // Extract function metadata from the cell
                    if (firstCell.metadata) {
                        driveFunctions.push({
                            name: firstCell.metadata.name,
                            code: firstCell.source.join(''),
                            signature: firstCell.metadata.signature,
                            description: firstCell.metadata.description,
                            resultLine: firstCell.metadata.resultLine,
                            formula: firstCell.metadata.formula,
                            fileName: file.name,
                            source: 'onedrive'
                        });
                    }
                }
            } catch (e) {
                console.warn(`Failed to load ${file.name}:`, e);
            }
        }
        return driveFunctions;
    } catch (error) {
        console.error('Error loading function files:', error);
        throw error;
    }
}

/**
 * Formats a Python function and its metadata into an IPython notebook format
 * @param {Object} metadata - Function metadata containing code and other properties
 * @returns {Object} Notebook formatted object
 */
export function formatAsNotebook(metadata) {
    const { code, ...cellMetadata } = metadata;
    return {
        cells: [{
            cell_type: "code",
            source: [code],
            metadata: cellMetadata,
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
