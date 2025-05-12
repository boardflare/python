---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think',  'get_errors']
description: 'Create or edit documentation for a Python function'
---

# Documentation for a Python Function

This is a prompt for a language model to create documentation for a Python function that will be used from within Excel using pyodide. Using the user's input, create the documentation following the format and process outlined below. 

## Documentation format

The documentation must include:
  - **Overview**: A clear summary of what the function does and its business value.
  - **Usage**: Show how the function is called from Excel, using the parameter names in the formula (not an example with actual arguments). For example:
    ```
    =MY_FUNCTION(param1, param2, ...)
    ```
    Briefly describe how to use the function and what the parameters represent.
  - **Parameters**: A table describing each parameter, its type, and its purpose.
    - Only use 2D lists or scalars as input. Supported types: float, string, and bool. (This is a guide for the model and should not appear in the documentation.)
  - **Return Value**: A table describing the return value(s) and their types.
    - Only use 2D lists or scalars as output. Supported types: float, string, and bool. (This is a guide for the model and should not appear in the documentation.)
  - **Examples**: At least two realistic business scenarios, using Excel terminology and showing how the function can be applied to solve real-world problems. For each example:
    - Use cases should be relevant to common business scenarios in Excel, simple, easy to understand, and realistic for business users.
    - Clearly explain the business context and expected outcome.
    - Use ranges, formulas, and data as an Excel user would encounter them.
    - Be detailed, practical, and non-trivial.
  - **Limitations**: Briefly describe any important edge cases, limitations, or error handling relevant to Excel users.
  - **Benefits**: Explain whether and how this functionality could be achieved using Excel out of the box and if so how. If it can be done, provide a specific example of how it would be implemented natively in Excel (using formulas, features, or built-in tools). Then, discuss why using this Python function may be preferable, highlighting differences in usability, flexibility, or business value.

See this [example](../../examples/text/ai_ask/ai_ask.md) for a reference.

## Process

1. **Think About the Solution**: Use the `think` tool to carefully consider the function's purpose, business context, and how it will be used in Excel. Plan the documentation structure and examples before writing.
2. **Draft Documentation**: Write the documentation in a Markdown file named after the function (e.g., `my_function.md`). Place this file in a new folder for the function under the appropriate category in the `examples` directory (e.g., `examples/text/my_function/my_function.md`). The folder name and the function name must be identical.
3. **Review your Work**: Use the `think` tool to check for clarity, completeness, and accuracy.
4. **Request Feedback**: Share the draft with the user for review and iterate as needed until the documentation is approved. Repeat edits to the documentation file using the `insert_edit_into_file` tool as many times as needed until the user confirms it is good enough to proceed.

Do not proceed to generate code or test generation until the documentation is approved.