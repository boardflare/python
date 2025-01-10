import { queueTask } from './queue.js';
import { fetchCode } from './fetchcode.js';
import { ConsoleEvents, EventTypes } from '../../taskpane/utils/constants.js';

const pyworker = new Worker(new URL('./pyodide-worker.js', import.meta.url));

async function messageWorker(worker, message) {
    return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            const { result, stdout, error } = event.data;
            if (error) {
                console.error('Worker successfully returned message but with an error:', error, 'stdout:', stdout);
                reject({ error, stdout });
            } else {
                resolve({ result, stdout });
            }
        };
        worker.onerror = (error) => {
            console.error('Worker onerror:', error.message);
            reject({ error: error.message });
        };
        worker.postMessage(message);
    });
}

export async function runPython({ code, arg1 }) {
    if (!code) {
        throw new Error('Code is not defined.');
    }

    try {
        code = await fetchCode(code);
        const { result, stdout } = await messageWorker(pyworker, { code, arg1 });

        if (stdout.trim()) {
            ConsoleEvents.emit(EventTypes.LOG, stdout.trim());
        }

        if (window.isChromiumOrEdge) {
            window.gtag('event', 'py', { code_length: code.length });
        }

        return result;

    } catch (error) {
        const errorMessage = error.error || error.message;
        const stdout = error.stdout || '';
        console.error('Error in runPython:', errorMessage);

        if (stdout.trim()) {
            ConsoleEvents.emit(EventTypes.LOG, stdout.trim());
        }
        ConsoleEvents.emit(EventTypes.ERROR, errorMessage);

        // if (isChromiumOrEdge) {
        //     window.gtag('event', 'py_err', { error: errorMessage });
        // }
        return [[`Error, see Output tab for details.`]];
    }
}

export async function runPy(code, arg1) {
    const args = { code, arg1 };
    return await queueTask(args, runPython);
}