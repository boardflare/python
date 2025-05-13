# ONEDRIVE_CSV

## Overview
This function retrieves a CSV file from the user's Microsoft OneDrive App Folder using the Microsoft Graph API and a global variable `graphToken` for authentication, which is set if the user is signed in. It returns the CSV contents as a 2D list, suitable for use in Excel.

> **Important:**
> - The file you want to access **must be located in your OneDrive App Folder**. This is required because the function uses app folder permissions as described in the [Microsoft Graph App Folder documentation](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder). Files outside the app folder will not be accessible.
> - You must be logged into your OneDrive using the **Login** button next to the **OneDrive** header on the Functions tab of before using this function.

## Usage

Make sure you are signed in to access your OneDrive files. You can do this by clicking the `Login` button next to the OneDrive section on the Functions tab.

```excel
=ONEDRIVE_CSV(file_path)
```

| Parameter   | Type   | Description                                                      | Default      |
|-------------|--------|------------------------------------------------------------------|--------------|
| file_path   | string | The path to the CSV file in your OneDrive **App Folder** which is automatically created at `/Apps/Boardflare Python for Excel`.  For example, to access `your-file.csv`, the path would be `/Apps/Boardflare Python for Excel/your-file.csv`.  You can use subfolders in the app folder also, e.g. `/Apps/Boardflare Python for Excel/subfolder/your-file.csv` | _(required)_ |

| Return Value | Type    | Description                                 |
|--------------|---------|---------------------------------------------|
| table        | 2D list | The contents of the CSV file as a 2D array. |

## Examples

### Example 1: Loading a CSV into an Array
A business analyst wants to quickly load a data file stored in their OneDrive App Folder for further analysis in Excel.

**Sample Input Data:**
_(File: `/Apps/Boardflare Python for Excel/data.csv` in OneDrive App Folder)_
| Name      | Value |
|-----------|-------|
| Alice     | 10    |
| Bob       | 20    |
| Carol     | 30    |
| Dave      | 40    |
| Eve       | 50    |

**Excel Formula:**
```excel
=ONEDRIVE_CSV("/Apps/Boardflare Python for Excel/data.csv")
```

**Expected Output:**
A 2D array in Excel with the CSV's contents, ready for further analysis.

### Example 2: Loading the CSV into a pandas DataFrame
It can be convenient to load a CSV file directly into a pandas DataFrame for advanced data analysis, without first importing the data with Power Query or other manual steps.

```python
import pandas as pd
import io

# csv_content is the string content of your CSV file
csv_content = ...  # (get this from the function or API)
df = pd.read_csv(io.StringIO(csv_content))
print(df.head())
```

This approach allows you to leverage the full power of Python and pandas for data cleaning, transformation, and analysis, all from files stored securely in your OneDrive App Folder.

## Why Use This Function?
This function enables you to load very large CSV files from your OneDrive App Folder that would otherwise be too large to open directly in Excel. It is especially useful for data analysts and power users who need to work with datasets that exceed Excel's row or memory limits.
