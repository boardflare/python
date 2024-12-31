export const DEFAULT_CODE = `# Some comment
def hello(name):
    """ Returns a greeting. """
    greeting = f"Hello {name}!"
    return greeting
    
# Example arguments.
examples = ["Nancy", "Ming", "Zara"]`;

export const EventTypes = {
    LOG: 'console:log',
    ERROR: 'console:error',
    CLEAR: 'console:clear'
};

export const ConsoleEvents = {
    emit: (type, payload) => {
        window.dispatchEvent(new CustomEvent(type, { detail: payload }));
    }
};
