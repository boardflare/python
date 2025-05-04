# AI Choice

## Overview

This function uses AI to select the most appropriate option from a list of choices based on a given prompt or description. It is designed for business users who want to automate decision-making in Excel, such as candidate selection, expense categorization, or sales lead prioritization.

## Usage

Selects the best match from a list of options, using a prompt or cell value as context.

```excel
=AI_CHOICE(text, choices, [temperature], [model], [max_tokens])
```

Arguments:

| Argument      | Type           | Description                                                                 | Default                |
|---------------|----------------|-----------------------------------------------------------------------------|------------------------|
| `text`        | string/2D list | The prompt, description, or cell value to analyze.                          |                        |
| `choices`     | string/2D list | List of options (comma-separated string or Excel range) to choose from.     |                        |
| `temperature` | float          | Optional: Controls creativity (0.0 to 2.0). Higher = more creative.         | `0.0`                  |
| `model`       | string         | Optional: AI model ID (e.g., 'mistral-small', 'mistral-large').             | `mistral-small-latest` |
| `max_tokens`  | int            | Optional: Max tokens for AI response.                                       | `500`                  |

Returns:

| Return Value | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| Choice       | string | The selected option from the provided list/range. |

## Examples

### 1. HR: Candidate Selection
Select the best candidate for a financial analyst position. Only one candidate has a CPA certification, which is required.

**Sample Input (Range `A1:A3`):**

|      A         |
|---------------|
| Jane Doe - MBA, 5 years experience   |
| John Smith - CPA, 3 years experience |
| Emily Davis - CFA, 4 years experience|

```excel
=AI_CHOICE("We need a financial analyst with a CPA certification.", A1:A3)
```
**Sample Output:**
"John Smith - CPA, 3 years experience"

### 2. Finance: Expense Categorization
Categorize a business expense for a taxi ride to the airport. Only one category is appropriate.

**Sample Input (Range `B1:B3`):**

|         B                |
|-------------------------|
| Travel                  |
| Meals & Entertainment   |
| Office Supplies         |

```excel
=AI_CHOICE("Taxi ride to airport for business trip.", B1:B3)
```
**Sample Output:**
"Travel"

### 3. Sales: Lead Prioritization
Assign a priority to a sales lead. The lead is an existing customer with a large renewal contract, so the answer is clear.

**Sample Input (Range `C1:C3`):**

|   C    |
|--------|
| High   |
| Medium |
| Low    |

```excel
=AI_CHOICE("Lead: Existing customer, $500k renewal contract, decision in 2 weeks.", C1:C3)
```
**Sample Output:**
"High"

### 4. Branding: Logo Color Selection
Select the most appropriate color for a healthcare company's logo. Blue is universally recognized for healthcare trust.

**Sample Input (Range `D1:D3`):**

|   D    |
|--------|
| Red    |
| Blue   |
| Green  |

```excel
=AI_CHOICE("Our healthcare company wants a logo color that conveys trust.", D1:D3)
```
**Sample Output:**
"Blue"

### 5. Business: Fruit Selection for Smoothie
Select the best fruit for a smoothie high in vitamin C. Orange is the obvious answer.

```excel
=AI_CHOICE("Which fruit is highest in vitamin C?", "banana, apple, orange, grape")
```
**Sample Output:**
"orange"
