export const DISPLAY_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"`;

export const DEFAULT_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"

# ⬅️ Drag task pane open for more room.
# ⚠️ Code MUST BE A FUNCTION!
# Ranges are converted 2D lists.
# Return must be 2D list or scalar.`;

export const EventTypes = {
    LOG: 'console:log',
    ERROR: 'console:error',
    CLEAR: 'console:clear'
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