const DRIVE_APPROOT = 'https://graph.microsoft.com/v1.0/me/drive/special/approot:';

/**
 * Creates or updates a file in the app's special folder
 * @param {Object|string} content - Content to store
 * @param {string} fileName - Name of the file
 * @param {string} accessToken - Microsoft Graph access token
 */
export async function saveFile(content, fileName, accessToken) {
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
 * @param {string} accessToken - Microsoft Graph access token
 */
export async function readFile(fileName, accessToken) {
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
 * @param {string} accessToken - Microsoft Graph access token
 */
export async function deleteFile(fileName, accessToken) {
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
