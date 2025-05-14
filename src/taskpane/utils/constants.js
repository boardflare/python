export const release = "1.3.13";

export const DISPLAY_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"`;

export const DEFAULT_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"


   
"""
Overview:
🚀 Excel functions using Python!
🆓 Unlimited free use
🌐 Internet access
📦 Import custom packages
📖 https://www.boardflare.com/apps/excel/python

How to use:
⬅️ Drag task pane open for space
💾 Save to create Excel function
▶️ Run in Excel: =HELLO("World")
✨ Create function using AI


Click Run▶️ below to try =HELLO!
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