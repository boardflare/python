# AI Format

## Overview

This function standardizes and restructures text based on a specified format using AI. It's especially useful for cleaning and organizing inconsistent data in a structured way, making it easier to work with data from various sources.

[View Python code on GitHub](https://github.com/boardflare/python-functions/blob/main/files/text/ai_format/ai_format.py)

## Usage

Formats text according to a specific desired structure or pattern.

```excel
=AI_FORMAT(text, format, [temperature], [model], [max_tokens])
```

Arguments:

| Argument      | Type           | Description                                                                                              | Default         |
|---------------|----------------|----------------------------------------------------------------------------------------------------------|-----------------|
| `text`        | string/range   | The text or cell reference containing the data to format.                                                |                 |
| `format`      | string         | The desired output format description (e.g., "ISO date format", "formal business letter").           |                 |
| `temperature` | float          | Optional: Controls the randomness/creativity of the response (0.0 to 2.0). Lower values are more deterministic. | `0.0`     |
| `model`       | string         | Optional: The specific AI model ID to use (must support JSON mode, e.g., 'mistral-small-latest').         | `mistral-small-latest` |
| `max_tokens`  | int            | Optional: Maximum number of tokens for the generated formatted content.                                  | `1500`          |

Returns:

| Return Value  | Type    | Description                                                                                                    |
|---------------|---------|----------------------------------------------------------------------------------------------------------------|
| Formatted Text| string  | The reformatted text according to the specified format. Returns `[["Error: ..."]]` on failure.                     |

## Examples

### 1. Standardizing Customer Contact Information
Format inconsistent customer data into a standard format.
```excel
=AI_FORMAT("John Smith / Marketing Director - Acme Inc / jsmith@acme.co - 555.123.4567", "standard business contact card format")
```
**Sample Output:**

| |
|---------------------------|
| John Smith<br>Marketing Director<br>Acme Inc.<br>Email: jsmith@acme.co<br>Phone: (555) 123-4567 |

### 2. Formatting Financial Figures
Standardize financial figures for reporting.
```excel
=AI_FORMAT("Revenue: 2.4m; COGS: 1.1m; Gross Margin: 1.3m (54%); Opex: 950k; EBITDA: 350k", "professional financial statement format with proper currency notation")
```
**Sample Output:**

| |
|---------------------------|
| Revenue: $2,400,000<br>Cost of Goods Sold: $1,100,000<br>Gross Margin: $1,300,000 (54%)<br>Operating Expenses: $950,000<br>EBITDA: $350,000 |

### 3. Converting Customer Feedback to Structured Format
Format free-form customer feedback into a structured review.
```excel
=AI_FORMAT("Used the product for 3 weeks. Good quality but shipping took forever. Customer service was helpful though. Probably would buy again if they fix delivery issues.", "structured product review with ratings")
```
**Sample Output:**

| |
|---------------------------|
| **Overall Rating**: 3.5/5<br>**Product Quality**: 4/5 - Good quality product<br>**Shipping & Delivery**: 2/5 - Excessive delivery time<br>**Customer Service**: 4/5 - Helpful support<br>**Would Purchase Again**: Yes, conditionally<br>**Additional Comments**: Customer would likely repurchase if delivery issues are resolved. |

### 4. Standardizing Address Data
Format inconsistent address entries into a standard format.
```excel
=AI_FORMAT("123 business park dr suite 12, austin tx 78701", "standard US business address format")
```
**Sample Output:**

| |
|---------------------------|
| 123 Business Park Drive<br>Suite 12<br>Austin, TX 78701 |

### 5. Converting Notes to Action Item Format
Format meeting notes into a structured action item list.
```excel
=AI_FORMAT("Tom said we need to finish the report by Friday. Maria will contact the client about budget concerns. Everyone should review the new marketing strategy before next meeting on 5/10.", "action items with responsible parties and deadlines")
```
**Sample Output:**

| |
|---------------------------|
| ACTION ITEMS:<br>1. [Tom] Complete report - Due: Friday<br>2. [Maria] Contact client regarding budget concerns - Due: ASAP<br>3. [All Team Members] Review new marketing strategy - Due: Before May 10 meeting |