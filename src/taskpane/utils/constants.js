export const DISPLAY_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"`;

export const DEFAULT_CODE = `def hello(name):
    """ Returns a greeting. """
    return f"Hello {name}!"
    
# Quick tips:

# ⬅️ Drag task pane open for more room.
# ⚠️ Code MUST BE A FUNCTION!
# 💻 NO local file system access.
# Pass data as args, not xl("B3") refs.

# Range args are converted as follows:
# - Single cell is a scalar.
# - Row of two cells is [[1, 2]]
# - Column of two cells is [[1], [2]]

# Return value must be a 2D list or scalar.
# - 24 returns a single cell
# - [["age", 24]] returns a row
# - [["age"], [24]] returns a column`;

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