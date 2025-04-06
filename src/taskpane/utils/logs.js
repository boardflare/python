import {
    initializeDB,
    getTokenClaims,
    getUserId,
    saveLogToIndexedDB,
    getAllLogs,
    clearLogs
} from "./indexedDB";
import { release } from "./constants";

let browserData = null;
let uid = null;
let isFlushing = false;

export async function initialize() {
    const adapter = await navigator.gpu.requestAdapter();

    // Helper function to check if WebView2 is present and return its version
    const getWebView2Version = () => {
        if (!navigator?.userAgentData?.brands) return null;
        const webView2Brand = navigator.userAgentData.brands.find(
            brand => brand.brand === "Microsoft Edge WebView2"
        );
        return webView2Brand ? webView2Brand.version : null;
    };

    browserData = {
        gpuF16: adapter?.features.has('shader-f16'),
        memory: navigator?.deviceMemory,
        cores: navigator?.hardwareConcurrency,
        webview2: getWebView2Version()
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
                    release,
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
                await fetch("https://boardflare.table.core.windows.net/PylogsMar29?sv=2019-02-02&st=2025-03-29T02%3A24%3A33Z&se=2035-03-30T02%3A24%3A00Z&sp=a&sig=ksRmh6uSUcA20Xg3wTSgWMnW0bjBrss5gi8DAZ%2Ff68c%3D&tn=PylogsMar29", { method: 'POST', headers, body });
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
