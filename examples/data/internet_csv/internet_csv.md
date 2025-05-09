# Internet CSV Function

## Overview
The `internet_csv` function allows you to import data from any public CSV file on the internet directly into Excel. By providing a URL to a CSV file, the function fetches the file (using a CORS proxy for compatibility), parses its contents, and returns the data as a 2D list (range) suitable for use in Excel formulas. This enables seamless integration of live, external datasets into your spreadsheets for analysis, reporting, or automation.

**Note:** To handle CORS restrictions, the function automatically prepends the URL with `https://cors.boardflare.com/` before fetching the file. You only need to provide the original CSV URL.

## Arguments

| Name | Type   | Description                                                      |
|------|--------|------------------------------------------------------------------|
| url  | string | The direct URL to the CSV file you want to import.               |

## Return Value

A 2D list (range) containing the parsed CSV data. Each row in the CSV becomes a row in the returned list, and each cell is a string.

## Examples

### Example 1: Importing Zillow Market Heat Index Data
**Scenario:** You want to analyze the Zillow Market Heat Index for major US metro areas using the latest public data.

| Formula Example |
|-----------------|
| =INTERNET_CSV("https://files.zillowstatic.com/research/public_csvs/market_temp_index/Metro_market_temp_index_uc_sfrcondo_month.csv?t=1746621339") |

**Result:**
A range in Excel containing the data from the CSV file, such as:

| RegionID | SizeRank | RegionName        | RegionType | StateName | 2018-01-31 | 2018-02-28 |
|----------|----------|-------------------|------------|-----------|------------|------------|
| 102001   | 0        | United States     | country    |           | 50         | 50         |
| 394913   | 1        | New York, NY      | msa        | NY        | 52         | 52         |
| 753899   | 2        | Los Angeles, CA   | msa        | CA        | 69         | 67         |
| 394463   | 3        | Chicago, IL       | msa        | IL        | 48         | 49         |

**Business Context:**
You can use this imported data to compare market heat across regions, create visualizations, or automate reporting on real estate trends.

### Example 2: Importing Zillow New Construction Sales Data
**Scenario:** You want to track new construction home sales in major US metro areas using Zillow's public data.

| Formula Example |
|-----------------|
| =INTERNET_CSV("https://files.zillowstatic.com/research/public_csvs/new_con_sales_count_raw/Metro_new_con_sales_count_raw_uc_sfrcondo_month.csv?t=1746621339") |

**Result:**
A range in Excel containing the new construction sales data, such as:

| RegionID | SizeRank | RegionName        | RegionType | StateName | 2018-01-31 | 2018-02-28 |
|----------|----------|-------------------|------------|-----------|------------|------------|
| 102001   | 0        | United States     | country    |           | 34508      | 33782      |
| 394913   | 1        | New York, NY      | msa        | NY        | 532        | 447        |
| 753899   | 2        | Los Angeles, CA   | msa        | CA        | 333        | 398        |
| 394463   | 3        | Chicago, IL       | msa        | IL        | 288        | 255        |

**Business Context:**
This allows you to monitor new construction trends, compare metro areas, and integrate up-to-date housing data into your business dashboards or analyses.

---

Let me know if you would like to make any changes or add more examples before I proceed to implementation.