## Overview

You are working on Python functions that can be used from within Excel using pyodide.

## Input and Output Types

Each function can only use a 2D list or scalar as input and must return a 2D list or scalar as output. The types supported are float, string, and bool. For example, a function that takes a range as an argument will pass a 2D list to the function. Similarly, a function that returns a 2D list will output a range in Excel.

The following type conversions will take place on the arguments passed to your function from Excel:

| Excel Type | Excel Example                  | Python Type | Python Example          |
|------------|--------------------------------|-------------|-------------------------|
| Number     | 42                             | int         | 42                      |
| Number     | 3.14                           | float       | 3.14                    |
| String     | "hello"                        | str         | "hello"                 |
| Boolean    | TRUE                           | bool        | True                    |
| Array      | `{1, 2, 3}`                    | 2D List     | [[1, 2, 3]]             |
| Array      | A1:B2                          | 2D List     | [[1, 2], [3, 4]]        |
| Null       | Reference to an empty cell     | None        | None                    |
| Null       | Unset optional LAMBDA argument | None        | None                    |
| Null       | Arg skipped with `,`           | None        | None                    |
| Date       | 45678 (serial format)          | int         | 45678 - not converted*  |

*Excel stores dates as numbers in serial format, and since we have no way to distinguish these from non-date numbers, they are not converted to datetime objects, and simply become a Python int. If you want to convert an Excel serial to a Python `datetime`, you can use the following code:

```python
from datetime import datetime, timedelta

def excel_date_to_datetime(serial):
    return datetime(1899, 12, 30) + timedelta(days=serial)
```

The value returned by your Python function will similarly be converted to the corresponding Excel type as follows:

| Python Type             | Python Example              | Excel Type | Excel Example                |
|-------------------------|-----------------------------|------------|------------------------------|
| int                     | 42                          | Number     | 42                           |
| float                   | 3.14                        | Number     | 3.14                         |
| str                     | "hello"                     | String     | "hello"                      |
| bool                    | True                        | Boolean    | TRUE                         |
| 2D list (Matrix)        | [[1, 2], [3, 4]]            | Array      | A1:B2*                       |
| 2D list (Column Vector) | [[1], [2], [3]]             | Array      | A1:A3*                       |
| 2D list (Row Vector)    | [[1, 2, 3]]                 | Array      | A1:C1*                       |
| None                    | None                        | Null       | Empty cell                   |
| datetime                | datetime(2022, 1, 1)        | Date       | 44519                        |
| tuple                   | (1, 2, 3)                   | Array      | A1:A3                        |

*Assumes formula is in cell A1.

If your function returns other Python types such as a list, set, or other non-scalar types, an error will be thrown.

## Folder Structure

Each function is stored in its own folder. This folder contains all necessary files for the function: the Python implementation, pytest tests, test case data, and documentation.

Example structure for a function named `my_function`:

```
files
└── category
    └── my_function
        ├── my_function.py        # The main Python function code.
        ├── test_my_function.py   # Pytest unit tests for the function.
        ├── test_cases.json       # JSON file containing parameterized test cases.
        └── my_function.md        # Documentation for the function in Markdown format.
```

## Python Implementation File (`my_function.py`)

Contains the main Python function implementation. [See example](../../examples/files/text/ai_ask/ai_ask.py)

-   Imports should be at the top.
-   The main function should accept 2D lists or scalars as input.
-   Return either a 2D list or scalar as output.
-   Handle input validation gracefully.
-   Document the function with detailed docstrings.
-   For API-based functions, use placeholders for API keys that need to be replaced by the user. Note: Environment variables cannot be set in the Pyodide environment; secrets must be hard-coded (using placeholders for users to replace) or passed as function arguments.
-   If your function requires packages beyond the standard library or those built into Pyodide, you must install them using `micropip`. Since the code runs asynchronously, use `await micropip.install(['package1', 'package2'])` at the top of your function. `micropip` is pre-imported. Only pure Python packages or those with OS-independent wheels on PyPI are supported.
-   Testing for package availability: Before using an external package, test whether it is available in the Pyodide distribution by attempting to import it using the `pyodide_install-packages` tool. If this tool throws an error, then the package is not available in the standard library and must be installed using `micropip`. If the package is available, you do not need to install it with `micropip`.

## Test File (`test_my_function.py`)

Contains unit tests using `pytest`. [See example](../../examples/files/text/ai_ask/test_ai_ask.py)

-   Should load test cases from `test_cases.json`.
-   Include tests for both success and failure paths.
-   All examples given in the documentation should ideally be covered by tests.
-   Test with various parameter combinations.
-   Do not mock any external API calls; tests should run against live APIs if applicable (using placeholder or test keys if necessary).

## Test Cases File (`test_cases.json`)

Stores structured test data used by `test_my_function.py`. [See example](../../examples/files/text/ai_ask/test_cases.json)

-   Allows for easy addition and management of multiple test scenarios.
-   Each test case can include an ID, description, input arguments, and expected outcomes or checks.
-   Includes a `"demo": true/false` flag. Cases marked `true` should correspond to examples in the `my_function.md` documentation and represent typical usage. Cases marked `false` are for internal testing (e.g., edge cases, parameter variations, error handling) and should not be included in the user-facing documentation.
-   Includes an `"expected_rows": number` parameter that estimates how many rows the function's output will occupy when displayed in Excel. This parameter should be set based on the function's return type:
    -   For functions returning a single scalar value (string, number, boolean): set to 1
    -   For functions returning a 2D list: estimate the typical number of rows in the returned array
-   The demo system uses this parameter to properly space examples in the Excel sheet with two empty rows between each example.
-   All test case descriptions must be written from the perspective of an Excel user, using Excel terminology (e.g., refer to 2D lists as "ranges").
-   Demo test cases and documentation examples must reflect realistic business use cases. Examples should be as detailed, clear, and practical as possible, showing how the function can be applied to solve real-world business problems in Excel. Avoid trivial or artificial examples. Use meaningful data, realistic scenarios, and provide context for the example's purpose.
-   For AI-based functions (e.g., classification, text generation), design test cases with the following guidelines:
    -   Use simple, distinct, and unambiguous choices that are easy for AI models to differentiate
    -   Provide clear context that strongly indicates the expected answer
    -   Prefer shorter option labels (e.g., "High Priority" instead of "P2 - High (Significant Impact)")
    -   For validation tests, use `expected_contains_any` instead of exact matching where appropriate
    -   Avoid edge cases where multiple similar answers could be considered correct
    -   Test expected failures with clear error messages

## Documentation File (`my_function.md`)

Provides user-facing documentation. [See example](../../examples/files/text/ai_ask/ai_ask.md)

-   Include an overview section.
-   Detail function usage with argument descriptions in a table.
-   Provide clear, detailed examples, mirroring the `test_cases.json` entries where `"demo": true`. These examples must be realistic business use cases, not trivial or artificial data.
-   Include formatted tables for parameters and return values.
-   Each example should clearly explain the business context and expected outcome, so users understand how to apply the function in their own work.

## Other Guidelines:

-   All terminal commands should use Windows PowerShell syntax.
-   The Python virtual environment is assumed to be activated in the terminal.

## Development Process:

1.  Edit Function: Modify the `my_function.py` file with the required changes.
2.  Update Tests: Adjust `test_my_function.py` and/or `test_cases.json` to reflect the changes and add new test cases if necessary. Ensure `demo` flags are set appropriately.
3.  Run Tests: Execute the tests from the workspace root using the following command structure (replace `category` and `my_function`). Assumes the virtual environment is active:
    ```powershell
    python -m pytest examples/files/category/my_function/test_my_function.py
    ```
4.  Ensure Tests Pass: Verify that all tests pass successfully. Debug and repeat steps 1-3 if necessary.
5.  Update Documentation: If the function's behavior, arguments, or examples have changed, update the `my_function.md` file accordingly, ensuring examples match `test_cases.json` entries where `demo: true` and that all examples are realistic business use cases.
6.  Build Examples: Run the `build_examples.py` script from the workspace root to update the consolidated example file:
    ```powershell
    python examples/build_examples.py
    ```
