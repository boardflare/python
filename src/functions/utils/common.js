import PQueue from "p-queue";

export const pyworker = new Worker(new URL('../runpy/pyodide-worker.js', import.meta.url));

// Queue management
export const queue = new PQueue({ concurrency: 1 });
export const abortController = new AbortController();
export const signal = abortController.signal;

export async function queueTask(args, task) {
    try {
        return await queue.add(async ({ signal }) => {
            const request = task(args);
            signal.addEventListener('abort', () => {
                pyworker.terminate();
                abortController.abort();
            });

            try {
                return await request;
            } catch (error) {
                if (error instanceof DOMException) {
                    return "Request aborted";
                } else {
                    throw error;
                }
            }
        }, { signal: abortController.signal });
    } catch (error) {
        if (error instanceof DOMException) {
            return "Request aborted";
        } else {
            throw error;
        }
    }
}

// Excel range (matrix) to object
export function matrixToObject(matrix) {
    if (!Array.isArray(matrix) || matrix.some(row => !Array.isArray(row) || row.length !== 2)) {
        return null;
    }

    const result = {};
    matrix.forEach(row => {
        const [key, value] = row;
        result[key] = value;
    });
    return result;
}
