let browserData = null;
let uid = null;
let isFlushing = false;

// Helper to open IndexedDB; used for both 'User' and 'BoardflareLogs' stores.
function openDatabase(dbName, version, upgradeCallback) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            upgradeCallback && upgradeCallback(db);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function initialize() {
    const adapter = await navigator.gpu.requestAdapter();
    browserData = {
        gpuF16: adapter?.features.has('shader-f16'),
        memory: navigator.deviceMemory,
        cores: navigator.hardwareConcurrency
    };
    uid = await getUserId();
}

async function getUserId() {
    const db = await openDatabase('Boardflare', 1, (db) => {
        if (!db.objectStoreNames.contains('User')) {
            db.createObjectStore('User');
        }
    });
    return new Promise((resolve, reject) => {
        const tx = db.transaction('User', 'readwrite');
        const store = tx.objectStore('User');
        const storageKey = 'anonymous_id';
        const request = store.get(storageKey);
        request.onsuccess = () => {
            let userId = request.result;
            if (!userId) {
                userId = crypto.randomUUID();
                store.put(userId, storageKey);
            }
            resolve(userId);
        };
        request.onerror = () => reject(request.error);
    });
}

async function getTokenClaims() {
    const db = await openDatabase('Boardflare', 1, (db) => {
        if (!db.objectStoreNames.contains('User')) {
            db.createObjectStore('User');
        }
    });
    return new Promise((resolve, reject) => {
        const tx = db.transaction('User', 'readonly');
        const store = tx.objectStore('User');
        const request = store.get('tokenClaims');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

async function saveLogToIndexedDB(logEntity) {
    const db = await openDatabase('BoardflareLogs', 1, (db) => {
        if (!db.objectStoreNames.contains('Logs')) {
            db.createObjectStore('Logs', { autoIncrement: true });
        }
    });
    return new Promise((resolve, reject) => {
        const tx = db.transaction('Logs', 'readwrite');
        const store = tx.objectStore('Logs');
        const request = store.add(logEntity);
        request.onsuccess = () => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
    });
}

async function flushLogs() {
    if (isFlushing) {
        return;
    }
    isFlushing = true;
    if (!uid) await initialize();

    try {
        const db = await openDatabase('BoardflareLogs', 1, (db) => {
            if (!db.objectStoreNames.contains('Logs')) {
                db.createObjectStore('Logs', { autoIncrement: true });
            }
        });
        const tx = db.transaction('Logs', 'readwrite');
        const store = tx.objectStore('Logs');

        // Retrieve all logs
        const allLogs = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (allLogs.length) {
            // Only take the first 100 logs
            const logsToFlush = allLogs.slice(0, 100);
            const tokenClaims = await getTokenClaims();

            let aggregatedLogs = {
                Config: JSON.stringify({
                    ...browserData,
                    ...Office?.context?.diagnostics,
                    lang: Office?.context?.displayLanguage,
                    docUrl: Office?.context?.document?.url,
                    test: !window.location.pathname.includes('prod'),
                    tokenClaims
                })
            };

            // Add individual logs
            logsToFlush.forEach((log, index) => {
                aggregatedLogs["Log" + index] = JSON.stringify({
                    Timestamp: log.Timestamp,
                    Data: log.Data
                });
            });

            const body = JSON.stringify({
                PartitionKey: new Date().toISOString(),
                RowKey: uid,
                ...aggregatedLogs
            });
            const headers = {
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json',
                'x-ms-date': new Date().toUTCString(),
                'x-ms-version': '2024-05-04',
                'Prefer': 'return-no-content',
                'Content-Length': body.length.toString()
            };
            try {
                // Send logs to server
                await fetch("https://boardflare.table.core.windows.net/PylogsMar16?sv=2019-02-02&st=2025-03-17T02%3A55%3A17Z&se=2035-03-18T02%3A55%3A00Z&sp=a&sig=pEFZYq0Dgi1e6j5biBKA0M1E0ngavzeHvZYU35SgjtQ%3D&tn=PylogsMar16", { method: 'POST', headers, body });
                // Clear the logs store
                await new Promise((resolve, reject) => {
                    const clearTx = db.transaction('Logs', 'readwrite');
                    const clearStore = clearTx.objectStore('Logs');
                    const req = clearStore.clear();
                    req.onsuccess = () => resolve();
                    req.onerror = () => reject(req.error);
                });
            } catch (err) {
            }
        } else {
        }
    } catch (error) {
    }
    isFlushing = false;
}

// Replace the scheduleFlush with a single async loop.
async function runFlushLoop() {
    while (true) {
        await flushLogs();
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

// Guard to ensure only one flush loop is running.
if (!window.__flushLoopStarted) {
    window.__flushLoopStarted = true;
    runFlushLoop();
}

export async function pyLogs(data) {
    try {

        const execMapped = CustomFunctions?._association?.mappings?.EXEC?.length?.toString();

        if (!browserData || !uid) await initialize();
        const logEntity = {
            Timestamp: new Date().toISOString(),
            Data: { ...data, execMapped },
        };
        await saveLogToIndexedDB(logEntity);
        return true;
    } catch (error) {
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
        const response = await fetch("https://boardflare.table.core.windows.net/Feedback?sv=2019-02-02&st=2025-01-10T13%3A55%3A06Z&se=2035-01-11T13%3A55%3A00Z&sp=a&sig=u%2F%2BYYEe17NGq1MhnWJYfk3P2wwxTwSY4Xsps9HsHUxA%3D&tn=Feedback", { method: 'POST', headers, body });
        return response.ok;
    } catch (error) {
        return false;
    }
}
