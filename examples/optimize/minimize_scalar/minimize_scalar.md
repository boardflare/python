# MINIMIZE_SCALAR

## Overview
The `minimize_scalar` function finds the minimum value of a scalar mathematical function. This is useful for business users in Excel who need to optimize costs, maximize efficiency, or find the best value for a given scenario. The function leverages `scipy.optimize.minimize_scalar` and allows users to specify the function as a string, with optional bounds and method.

## Arguments Table
| Argument    | Type         | Description                                                                 |
|-------------|--------------|-----------------------------------------------------------------------------|
| func_expr   | string       | The function to minimize, as a string (e.g., 'x**2 + 3*x + 2')              |
| bounds      | tuple/None   | Optional. Tuple (min, max) for bounded minimization                         |
| method      | string/None  | Optional. Optimization method: 'brent', 'bounded', or 'golden'              |

## Return Value Table
| Return Value | Type  | Description                                      |
|--------------|-------|--------------------------------------------------|
| result       | 2D list | [[x, fun]]: x-value of minimum and minimum value |

## Detailed Examples

### Example 1: Minimize a Quadratic Cost Function
**Business Context:**
A manager wants to find the production level (x) that minimizes the cost function C(x) = x^2 + 3x + 2.

**Excel Setup:**
- Cell A1: 'x**2 + 3*x + 2'   (Function expression)
- Cell B1:                    (Leave blank for unbounded)
- Cell C1:                    (Leave blank for default method)

**Formula in Excel:**
`=minimize_scalar(A1)`

**Expected Outcome:**
Returns a 2D list: [[x, minimum cost]].

### Example 2: Minimize a Function with Bounds
**Business Context:**
A logistics analyst wants to minimize the function f(x) = (x-5)^2 + 10, but only for x between 0 and 10.

**Excel Setup:**
- Cell A2: '(x-5)**2 + 10'    (Function expression)
- Cell B2: 0                  (Lower bound)
- Cell C2: 10                 (Upper bound)
- Cell D2: 'bounded'          (Method)

**Formula in Excel:**
`=minimize_scalar(A2, (B2, C2), D2)`

**Expected Outcome:**
Returns a 2D list: [[x, minimum value]] within [0, 10].

## Parameter and Output Types
- **Inputs:** func_expr (string), bounds (tuple of two floats or None), method (string or None)
- **Outputs:** 2D list: [[x, fun]] (both floats)

## Edge Cases and Limitations
- The function expression must be a valid Python expression in terms of x.
- If bounds are provided, method should be 'bounded'.
- If the function is not well-behaved (e.g., not continuous), results may be unreliable.
- Only scalar (single-variable) functions are supported.

## Comparison to Regular Excel Functions

### How Could This Be Done in Regular Excel?
In standard Excel, finding the minimum of a mathematical function typically requires one of the following approaches:
- **Manual Calculation:** Entering the function formula in a column for a range of x-values, then using the `MIN` function to find the minimum value and `INDEX`/`MATCH` to find the corresponding x.
- **Solver Add-in:** Using Excel's built-in Solver add-in to set up an optimization problem, specifying the target cell (the function output), the variable cell (x), and constraints (bounds).

#### Example (Manual Table):
1. In column A, list possible x-values (e.g., from -10 to 10).
2. In column B, enter the formula for the function (e.g., `=A2^2 + 3*A2 + 2`).
3. Use `=MIN(B2:B22)` to find the minimum value.
4. Use `=INDEX(A2:A22, MATCH(MIN(B2:B22), B2:B22, 0))` to find the x-value at the minimum.

#### Example (Solver):
1. Enter the function formula in a cell, referencing a variable cell for x.
2. Open Solver, set the objective to minimize the function cell by changing the x cell, and set bounds if needed.
3. Run Solver to find the minimum.

### Advantages of This Approach
- **Automation:** No need to manually set up tables or configure Solver; the function can be called directly in a cell.
- **Flexibility:** Works for any valid mathematical expression in terms of x, with optional bounds and method selection.
- **Integration:** Can be used as a custom function in Excel formulas, making it easy to incorporate into larger models or automate repeated calculations.
- **Works in Excel for the Web:** Unlike the Solver add-in, which is not available in Excel Online, this function can be used in both desktop and web versions of Excel (when deployed as a custom function).
- **Precision:** Uses advanced optimization algorithms from `scipy.optimize`, which are more robust and accurate than grid search or manual methods.

This makes the `minimize_scalar` function especially useful for business users who need to perform optimization tasks frequently or programmatically within Excel.
