---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'run_in_terminal', 'get_terminal_output', 'list_dir', 'pyodide_install-packages', 'get_errors']
description: 'Create or edit a Python function'
---

You are reviewing a Python function that will be used from within Excel.  

Step by step, provide your thoughts on whether the function conforms to the documentation, and make note of any inconsistencies.

**In particular, check that:**
- The function arguments and outputs are of the correct types (2D lists or scalars of float, string, or bool, as described in the documentation).
- The function handles input validation gracefully.
- The function's docstring is detailed and accurate.
- If the function fetches data from the internet, it uses the `requests` library and prepends the CORS proxy as required.
- Any required Python packages are available in Pyodide.
- The test cases are formatted correctly:
  - Each test case includes a `"demo": true/false` flag.
  - Each test case includes an `"expected_rows": number` parameter, set according to the function's return type.
  - For list-generating functions, prompts explicitly ask for a specific number of items.
  - Test case descriptions use Excel terminology and reflect realistic business use cases.
  - For AI-based functions, test cases follow the guidelines in the documentation.

Ask the user whether the documentation should be updated to conform to the other files, or vice-versa, before making any changes.

Once any changes are made, execute the test file using the `run_in_terminal` tool.

If all the tests pass, run the `build_examples.py` script using the `run_in_terminal` tool to update the consolidated example file:
    ```powershell
    python examples/build_examples.py
    ```