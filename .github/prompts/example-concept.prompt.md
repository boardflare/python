## Overview

You are creating a Python function that can be run as a custom function from within Excel using pyodide.  Each function can only use a 2D list or scalar as input and must return a 2D list or scalar as output.  The types supported are float, string, and bool.  For example, a function that takes a range as an argument will pass a 2D list to the function.  Similarly, a function that returns a 2D list will output a range in Excel.

## Folder Structure:

Each function is stored in its own folder which contains the function, pytest, and documentation as separate files.  An example of he folder structure is as follows:

```
files
├── text
│   ├── text_distance
│   │   ├── text_distance.py
│   │   ├── test_text_distance.py
│   │   └── text_distance.md
│   ├── vader-sentiment
│   │   ├── vader-sentiment.py
│   │   ├── test_vader-sentiment.py
│   │   └── vader-sentiment.md
```

When you are passed a folder as context, make sure to read all the files in the folder. 

### Concept Guidelines:
- The function file should be named after the folder (e.g. text_distance.py) and contain only the function implementation.
- Imports should be at the top of the file.
- The main function should accept 2D lists or scalars as input
- Return either a 2D list or scalar as output
- Handle input validation gracefully
- Document the function with detailed docstrings
- For API-based functions, use placeholders for API keys that need to be replaced

### Testing Guidelines:
- Use pytest for unit testing
- Include tests for both success and failure paths
- All examples given in the dcumentation should be tested
- Test with various parameter combinations
- Do not mock any API calls

### Documentation Guidelines:
- Include an overview section
- Detail function usage with argument descriptions
- Provide clear examples
- Include formatted tables for parameters and return values

## Other Guidelines:

- All terminal commands should use Windows Command prompt syntax.
- The Python virtual environment is in the /.venv directory.

## Development Process:

When you have finished editing a python function file (e.g. text_distance.py), make sure to update the corresponding test file (e.g. test_text_distance.py) and then run the tests (e.g. .venv\Scripts\python -m pytest examples\files\text\text_distance\test_text_distance.py) to ensure that the function works as expected.  If all the tests pass, update the documentation file (e.g. text_distance.md) if needed and then run the #file:examples\build_examples.py script to build the examples.