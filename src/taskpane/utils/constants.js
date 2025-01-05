export const DEFAULT_CODE = `def hello(first, last):
    """ Returns a greeting. 
    Args:
        first: first name of the person
        last: last name of the person
    """
    greeting = f"Hello {first} {last}!"
    return greeting
    
# Example arguments:
examples = [["Nancy", "Morgan"], ["Ming", "Lee"]]`;

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

const comments = `# Quick overview in comments below, see docs for details:
#
# Naming:
# Function names must be unique, otherwise overwrites existing function.
# def hello(first, last) becomes =HELLO(first, last) in Excel.
#
# Docstrings:
# First line in docstring is the function description in Excel.
# Args with descriptions are required.
#
# Types:
# Type hints are required on args and return.
# Array arguments in Excel are converted to Pandas DataFrames.
#
# Examples:
# examples variable holds test cases and is required.
# Each nested list is a set of arguments for a test case.`