import {
    initializeDB,
    getTokenClaims,
    getUserId,
    saveLogToIndexedDB,
    getAllLogs,
    clearLogs
} from "./indexedDB";

let browserData = null;
let uid = null;
let isFlushing = false;

export async function initialize() {
    const adapter = await navigator.gpu.requestAdapter();
    browserData = {
        gpuF16: adapter?.features.has('shader-f16'),
        memory: navigator.deviceMemory,
        cores: navigator.hardwareConcurrency
    };
    uid = await getUserId();
}

// Remove getUserId, getTokenClaims, and saveLogToIndexedDB functions
// Keep the rest of the file as is, but update to use imported functions

async function flushLogs() {
    if (isFlushing) return;
    isFlushing = true;
    if (!uid) await initialize();

    try {
        const allLogs = await getAllLogs();
        if (allLogs.length) {
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
                await fetch("https://boardflare.table.core.windows.net/PylogsMar23?sv=2019-02-02&st=2025-03-23T02%3A44%3A59Z&se=2035-03-24T02%3A44%3A00Z&sp=a&sig=ZSigr8C%2BvsYBvC2y7%2Bhw0sh57VBj7fyGz7uH1Jn%2Fm3c%3D&tn=PylogsMar23", { method: 'POST', headers, body });
                await clearLogs();
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
