---
applyTo: '**/test_cases.json'
---
## Test Cases File (`test_cases.json`)

Stores structured test data used by the test file, e.g. `test_my_function.py`.  

-   Allows for easy addition and management of multiple test scenarios.
-   Each test case can include an ID, description, input arguments, and expected outcomes or checks.
-   Includes a `"demo": true/false` flag. Cases marked `true` should correspond to examples in the `my_function.md` documentation and represent typical usage. Cases marked `false` are for internal testing (e.g., edge cases, parameter variations, error handling) and should not be included in the user-facing documentation.
-   Includes an `"expected_rows": number` parameter that estimates how many rows the function's output will occupy when displayed in Excel. This parameter should be set based on the function's return type:
    -   For functions returning a single scalar value (string, number, boolean): set to 1
    -   For functions returning a 2D list: estimate the typical number of rows in the returned array
-   **For list-generating functions**, prompts should explicitly ask for a specific number of items (e.g., "List 10 marketing strategies" instead of just "List marketing strategies"). This ensures consistent output length and enables more accurate row estimation with `expected_rows`.
-   The demo system uses this parameter to properly space examples in the Excel sheet with two empty rows between each example.
-   All test case descriptions must be written from the perspective of an Excel user, using Excel terminology (e.g., refer to 2D lists as "ranges").
-   Demo test cases and documentation examples must reflect realistic business use cases. Examples should be as detailed, clear, and practical as possible, showing how the function can be applied to solve real-world business problems in Excel. Avoid trivial or artificial examples. Use meaningful data, realistic scenarios, and provide context for the example's purpose.
-   For AI-based functions (e.g., classification, text generation), design test cases with the following guidelines:
    -   Use simple, distinct, and unambiguous choices that are easy for AI models to differentiate
    -   Provide clear context that strongly indicates the expected answer
    -   Prefer shorter option labels (e.g., "High Priority" instead of "P2 - High (Significant Impact)")
    -   For validation tests, use `expected_contains_any` instead of exact matching where appropriate, and keep validation keywords broad and general
    -   Avoid edge cases where multiple similar answers could be considered correct
    -   Test expected failures with clear error messages

**Note:** The `"demo"` parameter is required for all test cases. Set `"demo": true` for cases used in documentation or user-facing demos, and `"demo": false` for internal/validation-only cases.
