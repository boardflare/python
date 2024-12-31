export const DEFAULT_CODE = `def hello(name):
    """ Returns a greeting. """
    greeting = f"Hello {name}!"
    return greeting
    
# Example arguments.
examples = ["Nancy", "Ming", "Zara"]

# Instructions, see docs link above for details:
# Creates a named LAMBDA, e.g. def hello(name) becomes HELLO(name)
# Examples list is used for test cases on demo sheet.
# Save updates code if name is unchanged, delete in Formulas > Name Manager.
# Use "Load function..." to edit existing functions.
# Drag task pane open for more room!🚀
`;



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
