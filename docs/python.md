---
title: Python for Excel
---

# Python for Excel

## Overview

Install the [add-in](https://go.microsoft.com/fwlink/?linkid=2261819&templateid=WA200007447&templatetitle=Python%20for%20Excel).  Create an Excel function from a Python function in two easy steps as follows:
 
### 1. Write a Python function
Using the add-in code editor, write or paste your function code, e.g.:
```python
def inches_to_mm(inches):
    """ Converts inches to millimeters. """
    return inches * 25.4
```
 
### 2. Run as an Excel function
Python code is stored in workbook settings, and the function is added to the name manager as follows:
```excel
=LAMBDA(inches, BOARDFLARE.EXEC("inches_to_mm", inches))
```
  
The function is now available for use in the workbook as follows:
```excel
=INCHES_TO_MM(inches)
```

See the [slideshow](https://addins.boardflare.com/python/prod/assets/Python-v1.3.5.pdf) for a quick overview of usage.

## How it works

Let's use another example to explain the process in more detail.  Suppose you have the following Python function:

```python
def hello(first, last):
    """ Returns a greeting. """
    greeting = f"Hello {first, last}!"
    return greeting
```

When you save this code, the Python function name `hello` and arguments `first, last` are parsed to create a LAMBDA function `=LAMBDA(first, last, BOARDFLARE.EXEC("hello", first, last))` which is saved to the name manager with the name `HELLO`.  The Python code for the function named `hello` is saved to the [workbook settings](https://learn.microsoft.com/en-us/office/dev/add-ins/excel/excel-add-ins-workbooks#access-document-settings) so it is embedded in the workbook.  The first line of the Python function docstring is also added as a comment to the name manager to provide an autocomplete description.

![Hello Function](/images/hello-function.png)

Each time the function is invoked, `BOARDFLARE.EXEC` loads the code from the workbook settings and runs it with the arguments.  Since the code and LAMBDA are both stored in the workbook, anyone who uses the workbook can use the function.  If they don't have the add-in installed, Excel will automatically prompt them to do so.

## Features

Some key features of the add-in are as follows:

✅ Use Python in formulas and LAMBDA functions.<br/>
🆓 Free add-in, no Office 365 license required.<br/>
🌐 Works in Excel for web as well as desktop.<br/>
☁️ Runtime has network access for API calls (needs CORS).<br/>
📦 Import custom packages (pure Python only).<br/>
🔒 Code is stored in your workbook and runs locally.<br/>

## Limitations

- Your Python code must be a function.  All data is passed to the function as arguments.
- Range references, e.g. `xl("Sheet1!A1:A10")`, cannot be used to pass data to the code.
- See [Excel Type Conversion](#type-conversion) for how Excel types are converted to Python types.
- `*args` and `**kwargs` are not supported because LAMBDA functions do not support repeating arguments.
- If your version of Excel does not support LAMBDA functions, functions will be inserted in `EXEC MODE`, e.g. `=BOARDFLARE.EXEC("hello", "John", "Doe")` instead of `=HELLO("John", "Doe")`.  Otherwise the work the same.
- Note all packages can be imported, and some may not work as expected.  See [Importing Packages](#importing-packages) for more details.

## Importing Packages

[Pyodide](https://pyodide.org/en/stable/index.html) is the Python runtime used by the add-in, and includes a number of [built-in packages](https://pyodide.org/en/stable/usage/packages-in-pyodide.html). You can import any of these packages as well as those from the Python standard library. Any imports for external Python packages will be loaded from [PyPI](https://pypi.org/), but only if they are pure Python, and depend on any packages that are either built into pyodide or also pure Python.  Packages tagged as [OS-independent](https://pypi.org/search/?q=&o=&c=Operating+System+%3A%3A+OS+Independent) on PyPI should work.  If you try to import an external package (not part of the Python standard library or one of the built-in packages) for which there is not a pure Python wheel available on PyPI, an error will be thrown

Your code will be scanned for imports and any packages needed will be installed for you using `micropip`.  However, specific imports (e.g., `from azure.core.credentials import AzureKeyCredential`) will not be handled automatically, so you need to install these manually using `await micropip.install(['package1', 'package2'])`. `micropip` has already been imported for you, and since the Python code is executed async, you can use a top-level await as follows:

```python
await micropip.install(['azure-ai-textanalytics'])
from azure.core.credentials import AzureKeyCredential
# Continue with your code...
```

## Type Conversion

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

*Excel stores dates as numbers in serial format, and since we have no way to distinguish these from non-date numbers, they are not converted to datetime objects, and simply become a Python int.  If you want to convert an Excel serial to a Python `datetime`, you can use the following code:

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

If your function returns another Python type such as a list, set, or other non-scalar types, an error will be thrown.  We have support for converting numpy and pandas types to help reduce errors, but recommend you not rely on these.

## FAQ

<details>
  <summary>Why am I getting Excel errors like `#VALUE!`, `#NAME?`, `#BUSY!`?</summary>
  - `#VALUE!`:  An argument to a function is missing or it is the wrong type (e.g. incorrect range reference).
  - `#NAME?`:  The function name is spelled incorrectly, e.g. `BOARDFLARE.RUNPYY`.
  - `#BUSY!`:  This is normal for 5-10 seconds if you are importing libraries for the first time and have a slow internet connection. 

  To the left of the bottom of the task pane, you may also see additional errors such as the following:

  - `Error loading add-ins`
  - `We're starting the add-ins runtime, just a moment...`

  Sometimes Excel will throw various errors when the custom function is not properly initialized, in which case you can try restarting Excel, or reloading the browser window.
</details>

<details>
  <summary>Can Python code access the network?</summary>
  You should be able to access any public API that supports [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
</details>

<details>
  <summary>Can I build a LAMBDA function using the native Excel PY?</summary>
  No, that is the original reason we built this add-in.  At this time the Excel PY function does not allow you to call it from a formula.
</details>

<details>
  <summary>Can I access local files on my machine?</summary>
  No. The Pyodide runtime runs in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) in the browser which does not have access to your local machine.  This is a browser security feature.
</details>

<details>
  <summary>Where is `stdout` or `stderr` is displayed?</summary>
  Any output to `stdout` or `stderr` is displayed in the `Output` tab of the add-in task pane, but it is only returned at the completion of the execution of your code.  
</details>

## Changelog

See GitHub [releases](https://github.com/boardflare/python/releases) for the latest updates.

