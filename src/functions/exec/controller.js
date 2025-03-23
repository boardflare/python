import { getFunction } from './getfunction.js';
import { ConsoleEvents, EventTypes } from '../../taskpane/utils/constants.js';
import { pyLogs } from '../../taskpane/utils/logs.js';
import { getStoredToken } from '../../taskpane/utils/indexedDB.js';

const execPyWorker = new Worker(new URL('./execpy-worker.js', import.meta.url));

async function messageWorker(worker, message) {
    return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            const { result, stdout, error } = event.data;
            if (error) {
                reject({ error, stdout });
            } else {
                resolve({ result, stdout });
            }
        };
        worker.onerror = (error) => {
            reject({ error: error.message });
        };
        worker.postMessage(message);
    });
}

export async function execPython({ code, arg1 }, isName = true) {
    try {
        if (isName) {
            code = await getFunction(code);
        }
        const tokens = await getStoredToken();
        const graphToken = tokens?.graphToken;
        const { result, stdout } = await messageWorker(execPyWorker, {
            code,
            arg1,
            graphToken
        });
        try {
            if (window.isChromiumOrEdge) {
                window.gtag('event', 'py', { code_length: code.length });
            }
            pyLogs({ code, ref: "execPython" });
        } catch (logError) {
            console.error('Logging error in execPython:', logError);
        }
        if (stdout.trim()) {
            ConsoleEvents.emit(EventTypes.LOG, stdout.trim());
        }
        return result;

    } catch (error) {
        const errorMessage = error.error || error.message;
        const stdout = error.stdout || '';
        pyLogs({ errorMessage, stdout, code, ref: "execPythonError" });
        console.error('Error in execPython:', errorMessage);
        // Log any stdout before error message
        if (stdout.trim()) {
            ConsoleEvents.emit(EventTypes.LOG, stdout.trim());
        }
        ConsoleEvents.emit(EventTypes.ERROR, errorMessage);
        return [[`Error, see Output tab for details.`]];
    }
}