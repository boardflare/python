---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'run_in_terminal', 'get_terminal_output', 'list_dir', 'pyodide_install-packages', 'get_errors']
description: 'Create or edit a Python function'
---

This is a prompt for a language model to review a Python function that will be used from within Excel.  Follow the instructions below to complete the task.  After you create or edit a file, use the `get_errors` tool to check for any errors in the code.  If there are errors, use the `insert_edit_into_file` tool to fix them.

## Instructions

1. **Read the Files**: Use the `list_dir` tool to list all the files in the folder, and then use the `read_file` tool to read all of the files, not just portions of them.
2. **Check the Files**: Think step by step whether the function conforms to to the documentation and make note of any inconsistencies.  Ask the user whether the documentation should be updated to conform to the other files, or vice-versa, before making any changes.
3. **Final Test**: Once any changes are made, execute the tests using the `run_in_terminal` tool:
    ```powershell
    python -m pytest examples/text/category/my_function/test_my_function.py
    ```
4. **Build Examples**: If all the tests pass, run the `build_examples.py` script using the `run_in_terminal` tool to update the consolidated example file:
    ```powershell
    python examples/build_examples.py
    ```