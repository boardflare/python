---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'run_in_terminal', 'get_terminal_output', 'list_dir', 'pyodide_install-packages', 'get_errors']
description: 'Create or edit a Python function'
---

This is a prompt for a language model to create a Python function that will be used from within Excel.  Follow the instructions below to complete the task.  After you create or edit a file, use the `get_errors` tool to check for any errors in the code.  If there are errors, use the `insert_edit_into_file` tool to fix them.

1. **Read the Files**: Read any files provided using `read_file`.  If a folder has been added to the context, use the `list_dir` tool to list all the files in the folder, and then use the `read_file` tool to read them.  Make sure you read **all** the files.
2. **Explain the Solution**: Before you start writing code, think step by step and explain how you will solve the problem.  This should include your understanding of the problem and requirements.  Plan the structure of the new function, including inputs, outputs, and any necessary libraries or dependencies.
3. **Write Function Code**: Implement the function in a `my_function.py` file using the `create_file` tool. See this [example](../../examples/text/ai_ask/ai_ask.py).
4. **Write Tests**: Create a `test_my_function.py` file and a `test_cases.json` file with parameterized test cases using the `create_file` tool. The demo test cases should follow from the examples defined in the documentation. Read the [example test file](../../examples/text/ai_ask/test_cases.json) and [example test_cases data file](../../examples/text/ai_ask/test_ai_ask.py) using the `read_file` tool for reference.
5. **Run Tests**: Execute the tests using the `run_in_terminal` tool:
    ```powershell
    python -m pytest examples/text/category/my_function/test_my_function.py
    ```
6. **Ensure Tests Pass**: Verify that all tests pass successfully by using the `get_terminal_output` tool. Debug and repeat steps 2-5 if necessary.  
7. **Ensure Files are in Sync**.  Once all the tests have passed, use the `think` tool to consider if the documentation, function tests, and test cases are all in sync. If they are not, update those files as needed.
8. **Build Examples**: Run the `build_examples.py` script using the `run_in_terminal` tool to update the consolidated example file:
    ```powershell
    python examples/build_examples.py
    ```