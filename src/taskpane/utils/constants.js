export const DEFAULT_CODE = `def hello(first, last):
    """ Returns a greeting. 
    Args:
        first: first name of the person
        last: last name of the person
    """
    greeting = f"Hello {first} {last}!"
    return greeting
    
# Used to test the function
test_cases = [["Nancy", "Morgan"], ["Ming", "Lee"]]`;

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