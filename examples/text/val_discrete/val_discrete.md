<!-- filepath: c:\Users\brent\Code\python\examples\text\val_discrete\val_discrete.md -->
# VAL_DISCRETE

## Overview

This function selects a value from a list based on a given discrete probability distribution. It is useful for simulations, random sampling, and business scenarios where outcomes are determined by weighted probabilities.

## Usage
To use the `VAL_DISCRETE` function in Excel, enter it as a formula in a cell, specifying the values and their associated probabilities:

```excel
=VAL_DISCRETE(values, distribution)
```
Replace each parameter with your desired value. The function returns a value selected according to the provided probability distribution.

## Parameters
| Parameter     | Type     | Required | Description                                              | Default |
|--------------|----------|----------|----------------------------------------------------------|---------|
| values       | 2D list  | Yes      | List of possible values to select from                   |         |
| distribution | 2D list  | Yes      | List of probabilities (must sum to 1)                    |         |

## Return Value
| Return Value | Type   | Description                                 |
|--------------|--------|---------------------------------------------|
| Result       | Scalar | The value selected according to the weights. |

## Limitations
- The length of `values` and `distribution` must match.
- Probabilities in `distribution` must sum to 1 (within floating point tolerance).
- If `values` or `distribution` are empty, returns `None`.
- If lengths do not match, returns `None`.
- If probabilities do not sum to 1 (±0.01), returns `None`.
- Handles both numbers and strings as values.
- Returns a single value per call (not an array of samples).
- Only supports numeric or string values.

## Benefits
**Can this be done natively in Excel?**
While Excel offers randomization functions, it does not natively support weighted random selection or Monte Carlo simulation with custom probability distributions. However, you can achieve similar results using helper columns and formulas. Here is a step-by-step workaround:

1. **List your values and probabilities:**
   - Place your possible outcomes in one row (e.g., A1:C1).
   - Place the corresponding probabilities in the next row (e.g., A2:C2).

2. **Create a cumulative probability row:**
   - In D2, enter the formula: `=SUM($A$2:A2)`
   - Drag this formula across to match the number of values (e.g., D2:F2 for three values).

3. **Generate a random number:**
   - In a separate cell (e.g., G2), enter: `=RAND()`

4. **Select the value based on the random number:**
   - Use the following formula to select the value:
     ```excel
     =INDEX(A1:C1, MATCH(G2, D2:F2, 1) + 1)
     ```
   - This formula finds the first cumulative probability greater than the random number and returns the corresponding value.

**Note:** This method requires extra columns and careful setup. It is less flexible and more error-prone than using a dedicated function like `VAL_DISCRETE`, especially for large or dynamic datasets.

**Why use this Python function?**
- Enables Monte Carlo simulations and scenario analysis in Excel.
- Automates random selection based on business-defined likelihoods.
- More flexible and accurate than manual randomization in Excel.
- Supports both numeric and string values for realistic business scenarios.

## Examples

### Simulate Customer Type
Select a customer type based on the following values and probabilities:

|   | A      | B         | C      |
|---|--------|-----------|--------|
| 1 | Retail | Wholesale | Online |
| 2 | 0.6    | 0.3       | 0.1    |

```excel
=VAL_DISCRETE(A1:C1, A2:C2)
```
*Returns "Retail" 60% of the time, "Wholesale" 30% of the time, "Online" 10% of the time.*

### Select Project Outcome
Select a project outcome based on the following values and probabilities:

|   | A        | B        |
|---|----------|----------|
| 1 | Success  | Failure  |
| 2 | 0.8      | 0.2      |

```excel
=VAL_DISCRETE(A1:B1, A2:B2)
```
*Returns "Success" 80% of the time, "Failure" 20% of the time.*
