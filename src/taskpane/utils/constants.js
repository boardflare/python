export const DISPLAY_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"`;

export const DEFAULT_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"






    
# Quick tips, see website for details.

# ⬅️ Drag task pane open for more room.
# ⚠️ Code MUST BE A FUNCTION!
# 💻 NO local file system access.
# Pass data as args, not xl("B3") refs.
# Use in Excel like a regular function.

# Range args are converted to 2D lists.
# e.g. a single cell is 1
# e.g. a row of two cells is [[1, 2]]
# e.g. a column of two cells is [[1], [2]]

# Return value must be a 2D list or scalar.
# e.g. 24 returns a single cell
# e.g. [["age", 24]] returns a row
# e.g. [["age"], [24]] returns a column`;

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

export const DEBUG_FLAGS = {
    FORCE_NAME_MANAGER_FAIL: false,  // Set to true to simulate name manager failures
    FORCE_GET_FUNCTIONS_FAIL: true  // Set to true to simulate failures when retrieving functions
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