import { getStoredToken } from "../../functions/utils/auth";
import { TokenExpiredError } from "./drive";

/**
 * Encodes a sharing URL for Microsoft Graph API
 * @param {string} sharingUrl - The URL to encode
 * @returns {string} The encoded URL with u! prefix
 */
function encodeSharingUrl(sharingUrl) {
    // 1. Base64 encode the URL
    const base64 = btoa(sharingUrl);

    // 2. Convert to unpadded base64url format
    const base64url = base64
        .replace(/=/g, '')
        .replace(/\//g, '_')
        .replace(/\+/g, '-');

    // 3. Append u! to the beginning
    return `u!${base64url}`;
}

/**
 * Lists files from a shared library URL
 * @param {string} url - OneDrive/SharePoint shared folder URL
 * @returns {Promise<{files: Array, folderUrl: string, folderName: string}>} List of files and folder info
 */
export async function listSharedFiles(url) {
    const accessToken = await getStoredToken();
    try {
        const cleanUrl = url.trim();
        console.log('Original URL:', cleanUrl);

        const encodedUrl = encodeSharingUrl(cleanUrl);
        console.log('Encoded URL:', encodedUrl);

        console.log('Fetching folder from:', `https://graph.microsoft.com/v1.0/shares/${encodedUrl}/driveItem?$expand=children`);
        const response = await fetch(`https://graph.microsoft.com/v1.0/shares/${encodedUrl}/driveItem?$expand=children`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'redeemSharingLink'
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        const files = data.children?.filter(file => !file.folder && file.name.endsWith('.ipynb')) || [];
        console.log('Filtered files:', files);

        return {
            files,
            folderUrl: cleanUrl,
            folderName: data.name || 'Shared Library',
            parentReference: data.parentReference
        };
    } catch (error) {
        console.error('Error listing shared files:', {
            error,
            message: error.message,
            stack: error.stack
        });
        if (error.message.includes('Invalid sharing URL')) {
            throw new Error('Please provide a valid OneDrive or SharePoint sharing link');
        }
        throw error;
    }
}

/**
 * Reads a file from a shared library
 * @param {string} fileId - File ID from the shared library
 * @param {string} url - Shared folder URL
 * @param {object} parentReference - Parent reference for the shared library
 */
export async function readSharedFile(fileId, url, parentReference) {
    const accessToken = await getStoredToken();
    try {
        console.log('Reading file:', fileId, 'with parent reference:', parentReference);

        // Use driveId and itemId approach instead of path
        const fileUrl = `https://graph.microsoft.com/v1.0/drives/${parentReference.driveId}/items/${fileId}/content`;

        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error reading shared file:', error);
        throw error;
    }
}

/**
 * Loads function files from a shared library
 * @param {string} url - Shared folder URL
 * @returns {Promise<{sharedFunctions: Array, folderUrl: string, folderName: string}>} Array of function objects and folder info 
 */
export async function loadSharedFunctionFiles(url) {
    try {
        const { files, folderUrl, folderName, parentReference } = await listSharedFiles(url);
        const sharedFunctions = [];

        for (const file of files) {
            try {
                const notebook = await readSharedFile(file.id, url, parentReference);
                if (notebook.cells && notebook.cells.length > 0) {
                    const firstCell = notebook.cells[0];
                    if (firstCell.metadata) {
                        sharedFunctions.push({
                            name: firstCell.metadata.name,
                            code: firstCell.source.join(''),
                            signature: firstCell.metadata.signature,
                            description: firstCell.metadata.description,
                            resultLine: firstCell.metadata.resultLine,
                            formula: firstCell.metadata.formula,
                            fileName: file.name,
                            fileId: file.id,
                            source: 'shared'
                        });
                    }
                }
            } catch (e) {
                console.warn(`Failed to load shared file ${file.name}:`, e);
            }
        }
        return { sharedFunctions, folderUrl, folderName };
    } catch (error) {
        console.error('Error loading shared function files:', error);
        throw error;
    }
}
