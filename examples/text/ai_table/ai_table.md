# AI_TABLE

## Overview

This function leverages an AI model (compatible with OpenAI's API structure and supporting JSON output format) to generate structured data in the form of a table (a 2D list). It takes a `prompt` describing the desired table content and can optionally use `header` information and `source` data to guide the generation process.

## Usage

Instructs an AI model to generate a table based on a `prompt`, optional `header`, and optional `source` data, returning the result as a 2D list.

```excel
=AI_TABLE(prompt, [header], [source], [temperature], [model], [max_tokens])
```

Arguments:

| Argument      | Type           | Description                                                                                                | Default         |
|---------------|----------------|------------------------------------------------------------------------------------------------------------|-----------------|
| `prompt`      | string         | The instruction describing the table the AI should create.                                                 |                 |
| `header`      | 2D list        | Optional: A single row list defining the exact column headers for the table.  If this is not specified, the model will generate its own headers.                              | `None`          |
| `source`      | 2D list        | Optional: Source data provided to the AI to use as a basis for generating the table content.  This is useful for getting the model to summarize information in a table.               | `None`          |
| `temperature` | float          | Optional: Controls the randomness/creativity of the response (0.0 to 2.0). Lower values are more deterministic. | `0.0`           |
| `model`       | string         | Optional: The specific AI model ID to use (must support JSON mode, e.g., 'mistral-small-latest').           | `mistral-small-latest` |
| `max_tokens`  | int            | Optional: Maximum number of tokens for the generated table content.                                        | `1500`          |

Returns:

| Return Value | Type    | Description                                                                                                                               |
|--------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Table Data   | 2D list | A list of lists representing the generated table. The first row typically contains headers (unless provided via `header` argument). Returns `[[\"Error: ...\"]]` on failure. |

## Examples

### 1. Basic Table Generation
Generate a simple table listing smartphone features.
```excel
=AI_TABLE("Create a table listing the features of different smartphones including brand, model, camera quality, battery life.")
```
**Sample Output:**

| Brand   | Model     | Camera Quality | Battery Life |
|---------|-----------|----------------|--------------|
| Apple   | iPhone 15 | Excellent      | Good         |
| Samsung | Galaxy S24| Excellent      | Very Good    |
| Google  | Pixel 8   | Very Good      | Good         |
| OnePlus | 12        | Good           | Excellent    |

This prompt generates a table with columns for brand, model, camera quality, and battery life for various smartphones.

### 2. Using a Specific Header
Generate a table of tourist destinations using a predefined header.

**Sample Header Data (Range `A1:D1`):**

| Country | Popular Attractions | Best Time to Visit | Average Cost |
|---------|---------------------|--------------------|--------------|

```excel
=AI_TABLE("Generate a table of top 5 tourist destinations.", A1:D1)
```
**Sample Output:**

| Country | Popular Attractions | Best Time to Visit | Average Cost |
|---------|---------------------|--------------------|--------------|
| France  | Eiffel Tower, Louvre| Spring, Fall       | $150/day     |
| Japan   | Mt. Fuji, Temples   | Spring, Fall       | $120/day     |
| Italy   | Colosseum, Canals   | Spring, Summer     | $140/day     |
| USA     | Grand Canyon, NYC   | Spring, Fall       | $160/day     |
| Thailand| Beaches, Temples    | Winter             | $80/day      |

This uses the header data provided in range `A1:D1` to structure the output.

### 3. Using Source Data
Generate a table summarizing product sales based on provided source data.

**Sample Input Data (Range `A1:C8`):**

| Product  | Category | Sales Amount |
|----------|----------|--------------|
| Laptop   | Tech     | 1200         |
| Mouse    | Tech     | 25           |
| Keyboard | Tech     | 75           |
| T-Shirt  | Apparel  | 20           |
| Jeans    | Apparel  | 50           |
| Laptop   | Tech     | 1350         |
| Hoodie   | Apparel  | 45           |

```excel
=AI_TABLE("Summarize the sales data by product category.", , A1:C8)
```

**Sample Output:**

| Category | Total Sales | Number of Items |
|----------|-------------|-----------------|
| Tech     | 2650        | 4               |
| Apparel  | 115         | 3               |

Assuming `A1:C8` contains raw sales data, this generates a summary table based on that input.