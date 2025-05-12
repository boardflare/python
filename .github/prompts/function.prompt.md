---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'run_in_terminal', 'get_terminal_output', 'list_dir', 'pyodide_install-packages', 'get_errors']
description: 'Create or edit a Python function for Excel, ensuring all related files are in sync and follow best practices.'
---

This is a prompt for a language model to create or edit a Python function for use in Excel. Follow the steps below, ensuring all files (documentation, implementation, tests, and test cases) are consistent and follow best practices. Use the AI Ask function in `examples/text/ai_ask/` as a reference for each step.

### 1. Load Example Files
- Before proceeding, explicitly load the following example files and ensure their contents are available in your context for reference in all subsequent steps:
  - `examples/text/ai_ask/ai_ask.md`
  - `examples/text/ai_ask/ai_ask.py`
  - `examples/text/ai_ask/test_ai_ask.py`
  - `examples/text/ai_ask/test_cases.json`
- Use the `read_file` tool to load these files, unless their contents are already provided as attachments in the current context.

After you create or edit a file, use the `get_errors` tool to check for any errors in the code. If there are errors, use the `insert_edit_into_file` tool to fix them.

### 2. Documentation: Create or Review
- If creating a new function, create a documentation file (e.g., `my_function.md`) following the [AI Ask example](../../examples/text/ai_ask/ai_ask.md).
- If editing, review and update the documentation to reflect any requested changes or new behavior.

### 3. Implementation: Create or Edit Function
- Create or update the Python implementation file (e.g., `my_function.py`).
- Requirements:
  - Main function must accept 2D lists or scalars as input and return a 2D list or scalar.
  - Input validation should be graceful.
  - For HTTP requests, use the `requests` library and prepend URLs with `https://cors.boardflare.com/`.
  - Use placeholders for API keys unless specified as a function argument.
  - Only use packages available in Pyodide. Test all imports with `pyodide_install-packages` to ensure compatibility.
  - Supported types: float, string, bool, 2D list, or scalar.
  - Excel/Python type conversions:
    | Excel Type | Python Type | Example |
    |------------|-------------|---------|
    | Number     | int/float   | 42/3.14 |
    | String     | str         | "hello" |
    | Boolean    | bool        | True    |
    | Array      | 2D List     | [[1,2]] |
    | Null       | None        | None    |
    | Date       | int         | 45678   |
  - Return types must be compatible with Excel (see table in instructions).
  - See [ai_ask.py](../../examples/text/ai_ask/ai_ask.py) for an example.

### 4. Tests: Create or Edit Test File
- Create or update the test file (e.g., `test_my_function.py`) using `pytest`.
- Tests should:
  - Load test cases from `test_cases.json`.
  - Cover both success and failure paths.
  - Use only generic assertions (type checks, non-emptiness, structure).
  - Avoid content-specific assertions.
  - Do not mock external APIs; use live calls with placeholder/test keys.
  - See [test_ai_ask.py](../../examples/text/ai_ask/test_ai_ask.py) for an example.

### 5. Test Cases: Create or Edit Test Cases File
- Create or update `test_cases.json` with structured test data.
- Each test case should include:
  - ID, description (Excel user perspective), input arguments, expected outcomes/checks.
  - `"demo": true/false` (true for documentation/demo, false for internal/edge cases).
  - `"expected_rows"`: 1 for scalars, estimated rows for 2D lists.
  - For list-generating functions, prompts must specify the number of items.
  - Demo cases must be realistic, practical, and business-focused.
  - For AI functions, use clear, unambiguous choices and broad validation.
  - See [test_cases.json](../../examples/text/ai_ask/test_cases.json) for an example.

### 6. Run Tests
- Execute the tests (replace the path below with the actual path to your function's test file):
  ```powershell
  python -m pytest examples/text/ai_ask/test_ai_ask.py
  ```
- Ensure all tests pass. If not, debug and repeat steps 1–4 as needed.

### 7. Sync and Build Examples
- Confirm that documentation, function, tests, and test cases are in sync.
- Run the example builder:
  ```powershell
  python examples/build_examples.py
  ```