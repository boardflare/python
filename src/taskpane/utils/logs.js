const pythonlogs_url = "https://boardflare.table.core.windows.net/PythonLogs?sv=2019-02-02&st=2025-01-10T13%3A22%3A09Z&se=2035-01-11T13%3A22%3A00Z&sp=a&sig=wI1bR8fclUbVW36qtYTzLzi80B0LtYA49ECUlIsLl7M%3D&tn=PythonLogs";
const feedback_url = "https://boardflare.table.core.windows.net/Feedback?sv=2019-02-02&st=2025-01-10T13%3A55%3A06Z&se=2035-01-11T13%3A55%3A00Z&sp=a&sig=u%2F%2BYYEe17NGq1MhnWJYfk3P2wwxTwSY4Xsps9HsHUxA%3D&tn=Feedback"

let browserData = null;
let uid = null;

export async function initialize() {
    const adapter = await navigator.gpu.requestAdapter();
    browserData = {
        supportsF16: adapter?.features.has('shader-f16'),
        memory: navigator.deviceMemory,
        cores: navigator.hardwareConcurrency
    };
    uid = await getUserId();
}

const getUserId = async () => {
    try {
        const dbName = 'Boardflare';
        const storeName = 'User';
        const storageKey = 'anonymous_id';

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(storeName);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const getRequest = store.get(storageKey);

                getRequest.onsuccess = () => {
                    let userId = getRequest.result;
                    if (!userId) {
                        userId = crypto.randomUUID();
                        store.put(userId, storageKey);
                    }
                    resolve(userId);
                };

                getRequest.onerror = () => {
                    reject(getRequest.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

let logQueue = [];
let processingTimer = null;

async function processQueue() {
    if (logQueue.length === 0) {
        processingTimer = null;
        return;
    }

    // Take first 20 items and clear them from queue
    const itemsToProcess = logQueue.slice(0, 20);
    logQueue = logQueue.slice(20);

    const headers = {
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json',
        'x-ms-date': new Date().toUTCString(),
        'x-ms-version': '2024-05-04',
        'Prefer': 'return-no-content'
    };

    for (const logEntity of itemsToProcess) {
        const body = JSON.stringify(logEntity);
        headers['Content-Length'] = body.length.toString();

        try {
            await fetch(pythonlogs_url, {
                method: 'POST',
                headers,
                body
            });
        } catch (error) {
            console.error('Error processing log:', error);
        }
    }
}

function scheduleQueueProcessing() {
    if (processingTimer === null) {
        processingTimer = setTimeout(processQueue, 5000);
    }
}

export async function pyLogs(data) {
    try {
        if (!browserData || !uid) await initialize();

        const logEntity = {
            PartitionKey: new Date().toISOString(),
            RowKey: uid,
            BrowserData: JSON.stringify(browserData),
            Office: Office?.context ? JSON.stringify({
                diagnostics: Office.context?.diagnostics,
                displayLanguage: Office.context?.displayLanguage
            }) : 'not available',
            Data: JSON.stringify(data)
        };

        logQueue.push(logEntity);
        scheduleQueueProcessing();
        return true;
    } catch (error) {
        console.error('Error in pyLogs:', error);
        return false;
    }
}

export async function feedback(data) {
    if (!browserData || !uid) await initialize();

    const feedbackEntity = {
        PartitionKey: new Date().toISOString(),
        RowKey: "Python",
        BrowserData: JSON.stringify(browserData),
        uid,
        ...data
    };

    const body = JSON.stringify(feedbackEntity);

    const headers = {
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json',
        'Content-Length': body.length.toString(),
        'x-ms-date': new Date().toUTCString(),
        'x-ms-version': '2024-05-04',
        'Prefer': 'return-no-content'
    };

    try {
        const response = await fetch(feedback_url, {
            method: 'POST',
            headers,
            body
        });
        return response.ok;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}
