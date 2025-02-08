import { getFunction } from './getfunction.js';
import { ConsoleEvents, EventTypes } from '../../taskpane/utils/constants.js';
import { pyLogs } from '../../taskpane/utils/logs.js';
import { getStoredToken } from '../utils/auth.js';

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

export async function execPython({ code, arg1 }) {
    try {
        code = await getFunction(code);
        const graphToken = await getStoredToken();
        const { result, stdout } = await messageWorker(execPyWorker, {
            code,
            arg1,
            graphToken
        });
        pyLogs({ code, ref: "execPython" });
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