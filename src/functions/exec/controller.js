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

        // If the code is a function name, retrieve the function code from workbook settings
        if (isName) {
            try {
                code = await getFunction(code);
            } catch (error) {
                return [[error.message || 'Error loading function code from workbook settings.']];
            }
        }

        // If graph token retrieval fails, log a warning but continue execution
        let graphToken = null;
        try {
            const tokens = await getStoredToken();
            graphToken = tokens?.graphToken;
        } catch (tokenError) {
            ConsoleEvents.emit(EventTypes.LOG, 'Warning: Failed to retrieve graph token.');
        }

        // Proceed with executing the Python code
        const { result, stdout } = await messageWorker(execPyWorker, {
            code,
            arg1,
            graphToken
        });

        // Log the execution details
        try {
            if (window.isChromiumOrEdge) {
                window.gtag('event', 'py', { code_length: code.length });
            }
            pyLogs({ code, ref: "execPython" });
        } catch (logError) {
            console.error('Logging error in execPython:', logError);
        }

        // Emit stdout messages to the output tab
        if (stdout.trim()) {
            ConsoleEvents.emit(EventTypes.LOG, stdout.trim());
        }

        // Return the result
        return result;

    } catch (error) {
        const message = error.error || error.message;
        const stdout = error.stdout || '';
        pyLogs({ message, stdout, code, ref: "execPythonError" });
        if (stdout.trim()) {
            ConsoleEvents.emit(EventTypes.LOG, stdout.trim());
        }
        ConsoleEvents.emit(EventTypes.ERROR, message);
        return [[`Error, also see Help tab: ${message} \n${stdout}`]];
    }
}