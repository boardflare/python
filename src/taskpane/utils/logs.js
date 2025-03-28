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
        memory: navigator?.deviceMemory,
        cores: navigator?.hardwareConcurrency,
        brands: navigator?.userAgentData?.brands
    };
    uid = await getUserId();
}

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
                    license: Office?.context?.license,
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
                await fetch("https://boardflare.table.core.windows.net/PylogsMar26?sv=2019-02-02&st=2025-03-26T16%3A09%3A41Z&se=2035-03-27T16%3A09%3A00Z&sp=a&sig=64GgwXn%2BdsAem%2FU%2FfyMcIoRVUSWb2AGGVYXMHahI32E%3D&tn=PylogsMar26", { method: 'POST', headers, body });
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
