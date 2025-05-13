# AI_FILL

## Overview

This function automatically fills missing or incomplete data by analyzing patterns from a provided example range. It's particularly useful for completing datasets where there's a predictable relationship between columns, helping to automate data entry and ensure consistency.

## Usage

Automatically fills in missing data in a target range by learning patterns from an example range.

```excel
=AI_FILL(example_range, fill_range, [temperature], [model], [max_tokens])
```

Arguments:

| Argument        | Type           | Description                                                                                                | Default         |
|-----------------|----------------|------------------------------------------------------------------------------------------------------------|-----------------|
| `example_range` | 2D list        | The range containing complete data that serves as the basis for detecting patterns and relationships.      |                 |
| `fill_range`    | 2D list        | The range with incomplete data that will be filled based on the detected patterns from the example_range.  |                 |
| `temperature`   | float          | Optional: Controls the randomness/creativity of the response (0.0 to 2.0). Lower values are more deterministic. | `0.0`     |
| `model`         | string         | Optional: The specific AI model ID to use (must support JSON mode, e.g., 'mistral-small-latest').           | `mistral-small-latest` |
| `max_tokens`    | int            | Optional: Maximum number of tokens for the generated content.                                              | `1500`          |

Returns:

| Return Value | Type    | Description                                                                                                         |
|--------------|---------|---------------------------------------------------------------------------------------------------------------------|
| Filled Data  | 2D list | A 2D list with the missing data filled in. Returns `[["Error: ..."]]` on failure.                                 |

## Examples

### 1. Completing Product Catalog Information
Fill in missing product specifications based on similar products.

**Example Range (A1:D4):**

| | | | |
|------------|----------|-------|-------------|
| Product ID | Category | Price | Weight (kg) |
| PRD-001    | Laptop   | 1299  | 1.8         |
| PRD-002    | Laptop   | 999   | 2.1         |
| PRD-003    | Tablet   | 499   | 0.7         |

**Fill Range (A5:D7):**

| | | | |
|------------|----------|-------|-------------|
| PRD-004    | Laptop   |       |             |
| PRD-005    | Tablet   |       |             |
| PRD-006    |          | 799   | 1.2         |

```excel
=AI_FILL(A1:D4, A5:D7)
```

**Sample Output:**

| | | | |
|------------|----------|-------|-------------|
| PRD-004    | Laptop   | 1099  | 1.9         |
| PRD-005    | Tablet   | 549   | 0.8         |
| PRD-006    | Laptop   | 799   | 1.2         |

### 2. Filling Employee Information
Complete missing employee department and location information based on job titles.

**Example Range (A1:D5):**

| | | | |
|-------------|---------------------|------------|-------------|
| Employee ID | Job Title           | Department | Location    |
| EMP-001     | Sales Manager       | Sales      | New York    |
| EMP-002     | Marketing Specialist| Marketing  | Chicago     |
| EMP-003     | Sales Representative| Sales      | Los Angeles |
| EMP-004     | Software Developer  | Engineering| San Francisco |

**Fill Range (A6:D9):**

| | | | |
|-------------|---------------------|------------|-------------|
| EMP-005     | Sales Director      |            |             |
| EMP-006     | UX Designer         |            |             |
| EMP-007     | Marketing Director  |            |             |
| EMP-008     | Senior Developer    |            |             |

```excel
=AI_FILL(A1:D5, A6:D9)
```

**Sample Output:**

| | | | |
|-------------|---------------------|------------|-------------|
| EMP-005     | Sales Director      | Sales      | New York    |
| EMP-006     | UX Designer         | Engineering| San Francisco |
| EMP-007     | Marketing Director  | Marketing  | Chicago     |
| EMP-008     | Senior Developer    | Engineering| San Francisco |

### 3. Completing Financial Forecasts
Fill in missing quarterly projections based on existing data and trends.

**Example Range (A1:E3):**

| | | | | |
|-------------|---------|---------|---------|---------|
| Metric      | Q1 2024 | Q2 2024 | Q3 2024 | Q4 2024 |
| Revenue     | 250000  | 280000  | 310000  | 350000  |
| Expenses    | 180000  | 195000  | 215000  | 235000  |

**Fill Range (A4:E6):**

| | | | | |
|-------------|---------|---------|---------|---------|
| Profit      |         |         |         |         |
| Headcount   | 32      | 35      |         |         |

```excel
=AI_FILL(A1:E3, A4:E6)
```

**Sample Output:**

| | | | | |
|-------------|---------|---------|---------|---------|
| Profit      | 70000   | 85000   | 95000   | 115000  |
| Headcount   | 32      | 35      | 38      | 42      |