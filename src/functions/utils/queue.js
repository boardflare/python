import PQueue from "p-queue";

// Queue management
export const queue = new PQueue({ concurrency: 1 });
export const abortController = new AbortController();
export const signal = abortController.signal;

export async function queueTask(args, task) {
    try {
        return await queue.add(async ({ signal }) => {
            const request = task(args);
            signal.addEventListener('abort', () => {
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

