# ZILLOW

## Overview
The `ZILLOW` function enables Excel users to search for real estate property information from Zillow directly within their spreadsheets. It returns structured property data such as prices, addresses, and key features, allowing business users to analyze real estate markets, compare properties, and make informed investment or purchasing decisions efficiently—without leaving Excel.

## Usage
To use the `ZILLOW` function in Excel, enter it as a formula in a cell, specifying your search criteria as arguments. The example below shows the function with parameter names, so users can see the order and meaning of each argument:

```
=ZILLOW(search_location, property_type, min_price, max_price, min_beds, max_beds, min_baths, max_baths, limit)
```
Replace each parameter with your desired value as needed. The function returns a table of matching properties.

## Parameters
| Parameter        | Type    | Required | Description                                                                 |
|------------------|---------|----------|-----------------------------------------------------------------------------|
| search_location  | string  | Yes      | Location to search (city, zip code, or neighborhood).                       |
| property_type    | string  | No       | Property type: "house", "apartment", "condo", "townhome", or "all". Defaults to "all". |
| min_price        | float   | No       | Minimum price in dollars. Defaults to 0.                                    |
| max_price        | float   | No       | Maximum price in dollars. Defaults to no maximum.                           |
| min_beds         | float   | No       | Minimum number of bedrooms. Defaults to 0.                                  |
| max_beds         | float   | No       | Maximum number of bedrooms. Defaults to no maximum.                         |
| min_baths        | float   | No       | Minimum number of bathrooms. Defaults to 0.                                 |
| max_baths        | float   | No       | Maximum number of bathrooms. Defaults to no maximum.                        |
| limit            | float   | No       | Maximum number of properties to return. Defaults to 10.                     |

## Return Value
| Column         | Type   | Description                        |
|----------------|--------|------------------------------------|
| Address        | string | Property address                   |
| Price          | float  | Listing price in dollars           |
| Bedrooms       | float  | Number of bedrooms                 |
| Bathrooms      | float  | Number of bathrooms                |
| Square Footage | float  | Size in square feet                |
| Property Type  | string | Type of property                   |
| Zillow URL     | string | Link to Zillow listing             |
| Year Built     | float  | Year the property was built        |
| Lot Size       | float  | Lot size in square feet            |
| Days on Market | float  | Days since property was listed     |

## Examples

### Example 1: Analyze Family Home Options in Seattle
**Business Scenario:**
A real estate analyst needs to compare available family homes in Seattle, WA, within a specific price and size range to prepare a report for a client.

**Excel Usage:**
```
=ZILLOW("Seattle, WA", "house", 500000, 750000, 3, 4, 2, 3, 5)
```
This formula returns a table of up to 5 houses in Seattle, WA, priced between $500,000 and $750,000, with 3-4 bedrooms and 2-3 bathrooms. The analyst can use Excel's sorting and filtering tools to further analyze the results, compare features, and create summary charts for the client.

### Example 2: Find Condos for Investment in a Zip Code
**Business Scenario:**
An investor is looking for condos in the 98109 zip code to identify potential investment properties under $600,000.

**Excel Usage:**
```
=ZILLOW("98109", "condo", , 600000, , , , , 10)
```
This returns up to 10 condos in the 98109 area with prices up to $600,000. The investor can review the returned table, check the Zillow URLs for more details, and use Excel formulas to calculate price per square foot or filter by year built.

## Limitations
- If no properties match the criteria, an empty table is returned.
- Invalid or misspelled locations may result in no data.
- Zillow API limits or changes may affect data availability.
- Only public property data is returned; some details may be missing for certain listings.
- The function requires an internet connection.

## Benefits
**Can this be done natively in Excel?**
While Excel provides data import tools (e.g., Power Query, web scraping), it does not natively support direct, structured real estate searches from Zillow. A user could manually copy/paste data from Zillow or attempt to scrape web pages, but this is time-consuming and error-prone. For example, using Power Query to import Zillow listings would require complex setup and may break if Zillow changes its website.

**Why use this Python function?**
- Direct, automated access to structured property data.
- Saves time and reduces manual errors.
- Enables dynamic, parameterized searches and integration with Excel analysis tools.
- More flexible and reliable than manual or native Excel approaches.