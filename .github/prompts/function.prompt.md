---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'run_in_terminal', 'get_terminal_output', 'list_dir', 'pyodide_install-packages', 'get_errors']
description: 'Create or edit a Python function'
---
You are working on Python function.  If you have only been given a documentation file, you will need to create the function, pytest, and test_cases files, which should be placed in the same folder as the documentation file.  Otherwise, you will be editing one or more of these files.  Either way, follow the instructions below to complete the task.  After you create a file, use the `get_errors` tool to check for any errors in the code.  If there are errors, use the `insert_edit_into_file` tool to fix them.

1. **Read the Files**: Use the `list_dir` tool to list all the files in the folder you have been provided, and then use the `read_file` tool to read them.  Make sure you read **all** the files.  This includes the documentation file, any existing Python files, and test_cases files.
2. **Think About the Solution**: Use the `think` tool to carefully consider the design of the function given the documentation and any request for changes you have received.
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