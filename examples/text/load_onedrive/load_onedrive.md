# Load a CSV file from OneDrive using the global graph_token variable.

## Overview
This function retrieves a CSV file from the user's Microsoft OneDrive using the Microsoft Graph API and a global variable `graphToken` for authentication, which is set if the user is signed in.  It returns the CSV contents as a 2D list, suitable for use in Excel.

## Usage

Make sure you are signed in to access your OneDrive files. You can do this by clicking the `Login` button next to the OneDrive section on the Functions tab.

```excel
=LOAD_ONEDRIVE_CSV(file_path)
```

| Argument    | Type   | Description                                                      | Default      |
|-------------|--------|------------------------------------------------------------------|--------------|
| file_path   | string | The path to the CSV file in OneDrive (e.g., '/Documents/data.csv')| _(required)_ |

| Return Value | Type    | Description                                 |
|--------------|---------|---------------------------------------------|
| table        | 2D list | The contents of the CSV file as a 2D array. |

## Example: Loading a CSV from OneDrive
A business analyst wants to quickly load a data file stored in their OneDrive for further analysis in Excel.

**Sample Input Data:**
_(File: `/Documents/data.csv` in OneDrive)_
| Name      | Value |
|-----------|-------|
| Alice     | 10    |
| Bob       | 20    |
| Carol     | 30    |
| Dave      | 40    |
| Eve       | 50    |

**Excel Formula:**
```excel
=LOAD_ONEDRIVE_CSV("/Documents/data.csv")
```

**Expected Output:**
A 2D array in Excel with the CSV's contents, ready for further analysis.

## Notes
- The function uses a global variable named `graphToken` for authentication. Make sure `graphToken` is set to your Microsoft Graph API access token before calling the function.
- If the file does not exist, is not a valid CSV, or the token is invalid/expired, the function will return an error message.
- Only standard libraries (`requests`, `csv`, `io`) are used.
- Large files may impact performance or exceed memory limits in Excel or Pyodide.
