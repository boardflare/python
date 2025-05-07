## Overview

This function enables Excel users to programmatically retrieve a CSV file stored in their Microsoft OneDrive using a Microsoft Graph access token, and loads the file's contents into a Python DataFrame. The function returns the CSV data as a 2D array, making it easy to analyze or process the data directly within Excel.

## Usage

```excel
=ONEDRIVE_CSV_TO_TABLE(token, file_path)
```

## Arguments

| Argument    | Type   | Description                                                                                  | Default         |
|-------------|--------|----------------------------------------------------------------------------------------------|-----------------|
| `token`     | string | A valid Microsoft Graph access token with permission to read files from the user's OneDrive.  | _(required)_    |
| `file_path` | string | The path to the CSV file in the user's OneDrive (e.g., `/Documents/data.csv`).               | _(required)_    |

## Returns

| Return Value | Type        | Description                                      |
|--------------|-------------|--------------------------------------------------|
| `table`      | 2D list     | The contents of the CSV file as a 2D array.      |

## Examples

### Example 1: Importing Sales Data

**Business Problem:**  
A sales manager wants to analyze the latest sales data stored as `sales_q1.csv` in their OneDrive.

**Sample Input Data:**  
_(File: `/Sales/sales_q1.csv` in OneDrive)_
| Date       | Region | Sales |
|------------|--------|-------|
| 2025-01-01 | East   | 1200  |
| 2025-01-02 | West   | 950   |

**Excel Formula:**
```excel
=ONEDRIVE_CSV_TO_TABLE([GraphToken], "/Sales/sales_q1.csv")
```

**Expected Output:**  
A 2D array in Excel with the CSV's contents, ready for further analysis.

---

### Example 2: Loading Product Inventory

**Business Problem:**  
An inventory analyst needs to quickly load the latest product inventory from a shared OneDrive folder.

**Sample Input Data:**  
_(File: `/Inventory/products.csv` in OneDrive)_
| ProductID | Name        | Stock |
|-----------|-------------|-------|
| 1001      | Widget A    | 500   |
| 1002      | Widget B    | 300   |

**Excel Formula:**
```excel
=ONEDRIVE_CSV_TO_TABLE([GraphToken], "/Inventory/products.csv")
```

**Expected Output:**  
A 2D array with all product inventory data.

---

### Example 3: Importing Customer List

**Business Problem:**  
A marketing specialist wants to import a customer list for a mail merge.

**Sample Input Data:**  
_(File: `/Marketing/customers.csv` in OneDrive)_
| Name      | Email              |
|-----------|--------------------|
| Alice Lee | alice@example.com  |
| Bob King  | bob@example.com    |

**Excel Formula:**
```excel
=ONEDRIVE_CSV_TO_TABLE([GraphToken], "/Marketing/customers.csv")
```

**Expected Output:**  
A 2D array with customer names and emails.

## Notes

- **Edge Cases:** If the file does not exist, is not a valid CSV, or the token is invalid/expired, the function should return an error message.
- **Dependencies:**  
  - Uses Python standard libraries: `requests` (available in Pyodide) and `csv`.
  - No external packages required.
- **Security:** The access token should be kept confidential and have the minimum required permissions.
- **CSV Format:** The function assumes the file is a well-formed CSV. Non-CSV files or files with unusual encodings may not load correctly.
- **Data Size:** Large CSV files may exceed Excel or Pyodide memory limits; performance may degrade with very large datasets.