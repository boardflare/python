# ZILLOW

The `ZILLOW` function allows you to search for real estate property information from Zillow directly in Excel. This function returns structured property data including prices, addresses, and key property features.

## Syntax

```
ZILLOW(search_location, [property_type], [min_price], [max_price], [min_beds], [max_beds], [min_baths], [max_baths], [limit])
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| search_location | Required. A text string specifying the location to search for properties (city, zip code, or neighborhood). |
| property_type | Optional. The type of property to search for: "house", "apartment", "condo", "townhome", or "all". Defaults to "all". |
| min_price | Optional. Minimum price in dollars (e.g., 250000 for $250,000). Defaults to 0. |
| max_price | Optional. Maximum price in dollars (e.g., 500000 for $500,000). Defaults to no maximum. |
| min_beds | Optional. Minimum number of bedrooms. Defaults to 0. |
| max_beds | Optional. Maximum number of bedrooms. Defaults to no maximum. |
| min_baths | Optional. Minimum number of bathrooms. Defaults to 0. |
| max_baths | Optional. Maximum number of bathrooms. Defaults to no maximum. |
| limit | Optional. Maximum number of properties to return. Defaults to 10. |

## Return Value

Returns a range containing property information. Each row represents a property with the following columns:
1. Address
2. Price
3. Bedrooms
4. Bathrooms
5. Square Footage
6. Property Type
7. Zillow URL
8. Year Built
9. Lot Size
10. Days on Market

## Examples

### Example 1: Search for Houses in Seattle

```
=ZILLOW("Seattle, WA", "house", 500000, 750000, 3, 4, 2, 3, 5)
```

Returns the top 5 houses in Seattle, WA with prices between $500,000 and $750,000, having 3-4 bedrooms and 2-3 bathrooms.

### Example 2: Find Condos in a Specific Zip Code

```
=ZILLOW("98101", "condo", 300000, 600000)
```

Returns up to 10 condos in the 98101 zip code with prices between $300,000 and $600,000.

### Example 3: Basic Neighborhood Search

```
=ZILLOW("Downtown San Francisco")
```

Returns up to 10 properties of any type in Downtown San Francisco with no price or size restrictions.

### Example 4: Search for Apartments with Minimum Requirements

```
=ZILLOW("Chicago, IL", "apartment", 1500, , 1, , 1)
```

Returns up to 10 apartments in Chicago with a minimum price of $1,500, at least 1 bedroom, and at least 1 bathroom.

## Notes

1. The function respects Excel's standard parameter handling. Empty parameters between commas use the default values.
2. Property data is fetched in real-time from Zillow, but may be cached for performance.
3. The limit parameter helps control the size of the returned range. Set it according to your worksheet space availability.
4. For best results, use specific locations and reasonable filters to narrow down results.