import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function fetchWithRetry(url, options, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
            }

            return response;
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

async function getAccessToken() {
    const response = await fetchWithRetry(
        'https://login.microsoftonline.com/30520885-0a26-49e9-a66d-b53f7e1f958b/oauth2/v2.0/token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.SP_CLIENT_ID,
                client_secret: process.env.SP_CLIENT_SECRET,
                scope: 'https://graph.microsoft.com/.default',
                grant_type: 'client_credentials',
            }),
        }
    );

    const tokenResponseData = await response.json();
    return tokenResponseData.access_token;
}

async function getAllListItems(listName) {
    try {
        const access_token = await getAccessToken();
        let nextLink = `https://graph.microsoft.com/v1.0/sites/boardflare.sharepoint.com:/sites/dev:/lists/${listName}/items?$expand=fields&$top=100`;
        const allItems = [];
        let pageCount = 0;

        while (nextLink) {
            pageCount++;
            console.log(`Fetching page ${pageCount}...`);

            const response = await fetchWithRetry(
                nextLink,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();
            console.log("Data", JSON.stringify(data));

            if (!data.value || !Array.isArray(data.value)) {
                console.error('Invalid response structure:', data);
                throw new Error('Invalid response structure - missing value array');
            }

            console.log(`Received ${data.value.length} items`);
            allItems.push(...data.value);

            // Check if there are more pages
            nextLink = data['@odata.nextLink'] || null;
        }

        console.log(`Total items fetched: ${allItems.length}`);
        return allItems;
    } catch (error) {
        console.error('Error fetching list items:', error);
        throw error;
    }
}

async function downloadNotebookContent(item) {
    try {
        const access_token = await getAccessToken();
        const fileName = item.fields.FileLeafRef;
        const itemId = item.id;

        console.log(`Downloading notebook content for ${fileName} (ID: ${itemId})`);

        const siteId = item.parentReference?.siteId || 'boardflare.sharepoint.com:/sites/dev:';
        const listName = 'Functions';

        const response = await fetchWithRetry(
            `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items/${itemId}/driveItem/content`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );

        const content = await response.text();
        console.log('\n=== NOTEBOOK CONTENT ===');
        console.log('Raw content:', content);
        console.log('=== END NOTEBOOK CONTENT ===\n');

        const parsedContent = JSON.parse(content);
        console.log('\n=== PARSED NOTEBOOK ===');
        console.log(JSON.stringify(parsedContent, null, 2));
        console.log('=== END PARSED NOTEBOOK ===\n');

        return parsedContent;
    } catch (error) {
        console.error(`Error downloading notebook ${item.fields.FileLeafRef}:`, error);
        throw error;
    }
}

async function processNotebooks(items, listName) {
    const processedItems = [];
    console.log(`Starting to process ${items.length} items`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const fileName = item.fields.FileLeafRef;

        if (fileName.endsWith('.ipynb')) {
            console.log(`Processing notebook ${i + 1}/${items.length}: ${fileName}`);

            try {
                const notebookContent = await downloadNotebookContent(item);
                console.log(`Successfully downloaded notebook: ${fileName}`);

                const codeCells = notebookContent.cells.filter(cell =>
                    cell.cell_type === 'code' &&
                    cell.metadata?.name
                );

                console.log(`Found ${codeCells.length} code cells with metadata`);

                for (const cell of codeCells) {
                    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

                    processedItems.push({
                        ...cell.metadata,
                        code: source,
                        fileName,
                        fileId: item.id
                    });

                    console.log(`Added function ${cell.metadata.name} to processed items`);
                }
            } catch (error) {
                console.error(`Error processing notebook ${fileName}:`, error);
            }
        }
    }

    console.log(`Total functions processed: ${processedItems.length}`);
    return processedItems;
}

async function saveItemsToJson(items, listName) {
    try {
        const assetsDir = path.join(process.cwd(), 'assets');

        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        const filename = path.join(assetsDir, 'example_functions.json');

        if (!Array.isArray(items)) {
            throw new Error('Items must be an array');
        }

        if (items.length === 0) {
            console.warn('Warning: No items to save to JSON file');
        }

        console.log(`Writing ${items.length} items to ${filename}`);
        console.log('First item preview:', items[0] ? JSON.stringify(items[0], null, 2) : 'No items');

        fs.writeFileSync(
            filename,
            JSON.stringify(items, null, 2),
            'utf8'
        );

        // Verify the file was written
        const stats = fs.statSync(filename);
        console.log(`File written successfully. Size: ${stats.size} bytes`);

        return filename;
    } catch (error) {
        console.error('Error saving items to JSON:', error);
        throw error;
    }
}

async function main() {
    try {
        // Use the list name from the URL
        const listName = 'Functions';
        console.log(`Downloading all items from list: ${listName}`);

        // Get list items metadata
        const items = await getAllListItems(listName);

        if (items && items.length > 0) {
            console.log(`Processing ${items.length} notebooks...`);

            // Process each notebook to extract function data
            const processedFunctions = await processNotebooks(items, listName);

            // Save the processed function data
            const savedFile = await saveItemsToJson(processedFunctions, listName);
            console.log(`Successfully processed ${processedFunctions.length} functions and saved to ${savedFile}`);
        } else {
            console.log('No items found or error occurred');
        }
    } catch (error) {
        console.error('Process failed:', error);
        process.exit(1);
    }
}

// Execute the script
main();
