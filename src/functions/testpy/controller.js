import { queueTask } from '../utils/common.js';
import { ConsoleEvents, EventTypes } from '../../taskpane/utils/constants.js';
export const testpy_worker = new Worker(new URL('testpy-worker.js', import.meta.url));

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

export async function testPython({ code, arg1 }) {
    if (!code) {
        throw new Error('Code is not defined.');
    }

    try {
        const { result, stdout } = await messageWorker(testpy_worker, { code, arg1 });

        if (stdout) {
            ConsoleEvents.emit(EventTypes.LOG, stdout);
        }

        return result;

    } catch (error) {
        const errorMessage = error.error || error.message;
        const stdout = error.stdout || '';
        console.error('Error in testPython:', errorMessage);

        if (stdout) {
            ConsoleEvents.emit(EventTypes.LOG, stdout);
        }
        ConsoleEvents.emit(EventTypes.ERROR, errorMessage);

        return [[`Error, see console for details.`]];
    }
}

export async function testPy(code, arg1) {
    const args = { code, arg1 };
    return await queueTask(args, testPython);
}