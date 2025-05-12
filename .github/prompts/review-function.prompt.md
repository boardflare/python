---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'run_in_terminal', 'get_terminal_output', 'list_dir', 'pyodide_install-packages', 'get_errors']
description: 'Create or edit a Python function'
---

You are reviewing a Python function that will be used from within Excel.  

Provide the user your thoughts step by step on whether the function conforms to to the documentation and make note of any inconsistencies.

Ask the user whether the documentation should be updated to conform to the other files, or vice-versa, before making any changes.

Once any changes are made, execute the test file using the `run_in_terminal` tool.

If all the tests pass, run the `build_examples.py` script using the `run_in_terminal` tool to update the consolidated example file:
    ```powershell
    python examples/build_examples.py
    ```