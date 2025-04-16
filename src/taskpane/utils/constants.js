export const release = "1.3.8";

export const DISPLAY_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"`;

export const DEFAULT_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"


   
"""
⬅️ Drag task pane open for more room.
📄 https://www.boardflare.com/apps/excel/python

How it works:
- Write a Python function, e.g. hello(name).
- Save to create an Excel custom function.
- e.g. =HELLO("World") returns "Hello World!".

🚀Click Save to try it now!
"""`;

export const EventTypes = {
    LOG: 'console:log',
    ERROR: 'console:error',
    CLEAR: 'console:clear',
    SAVE: 'SAVE_STATUS_EVENT'
};

export const ConsoleEvents = {
    emit: (type, payload) => {
        window.dispatchEvent(new CustomEvent(type, { detail: payload }));
    },
    on: (type, callback) => {
        const wrappedCallback = (event) => callback(event.detail);
        window.addEventListener(type, wrappedCallback);
        return () => window.removeEventListener(type, wrappedCallback);
    },
    off: (type, callback) => {
        window.removeEventListener(type, callback);
    }
};

export const DEBUG_FLAGS = {
    FORCE_NAME_MANAGER_FAIL: false,  // Simulate name manager failures
    FORCE_CELL_EDIT_MODE_ERROR: false,  // Simulate InvalidOperationInCellEditMode errors
};

export const LLM_ENDPOINT = "https://codepy.boardflare.workers.dev";

export function getExecEnv() {
    if (window.location.hostname === 'localhost') {
        return 'LOCAL.EXEC';
    } else if (window.location.pathname.toLowerCase().includes('preview')) {
        return 'PREVIEW.EXEC';
    } else if (window.location.hostname === 'python-insider.boardflare.com') {
        return 'BFINSIDER.EXEC';
    }
    return 'BOARDFLARE.EXEC';
}