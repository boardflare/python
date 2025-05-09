---
applyTo: '**/func_*.py'
---
## Python Implementation File (e.g. `my_function.py`)

Contains the main Python function implementation. 

-   Imports should be at the top.
-   The main function should accept 2D lists or scalars as input.
-   Return either a 2D list or scalar as output.
-   Handle input validation gracefully.
-   Document the function with detailed docstrings.
- When implementing functions that fetch data from the internet, always use the `requests` library for HTTP requests instead of `urllib`.
- For any network request to a public internet address, prepend the URL with the CORS proxy `https://cors.boardflare.com/`, e.g. `https://cors.boardflare.com/https://example.com`.
-   Use placeholders in the code for API keys that need to be replaced by the user since variables cannot be set in the Pyodide environment, unless the documentation specifies setting the API key as a function argument. 
-   If Python packages beyond the standard library are required you must check whether they are available in Pyodide by attempting to install them using the `pyodide_install-packages` tool. If that tool throws an error, then the package cannot be used.

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