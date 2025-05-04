## Refactor Function to Data-Driven Testing Format

Goal: Convert the Python function and its tests in the provided folder to use a data-driven approach with `pytest` and a `test_cases.json` file.

Context: You will be given a folder containing:
*   `{function_name}.py`: The Python function implementation.
*   `test_{function_name}.py`: The existing pytest test file.
*   (Optional) `{function_name}.md`: Documentation file.

Instructions for Test Case Descriptions:
- All test case descriptions in `test_cases.json` should be written from the perspective of an Excel user. Use Excel terminology (e.g., refer to 2D lists as "ranges" instead of "2D lists"). Describe scenarios as an Excel user would encounter them in the Excel interface.

Steps:

1.  Analyze `test_{function_name}.py`:
    *   Identify each distinct test scenario currently implemented in separate `test_...` functions.
    *   Note the specific input arguments used for the `{function_name}` function in each scenario.
    *   Note any specific assertions made beyond basic type/existence checks (e.g., checking if the result contains a specific substring).

2.  Create `test_cases.json`:
    *   In the same folder, create a new file named `test_cases.json`.
    *   Structure the file with a top-level key `"test_cases"` containing a JSON list `[]`.
    *   For each test scenario identified in step 1, add a JSON object to the `"test_cases"` list with the following keys:
        *   `"id"`: A unique string identifier for the test case (e.g., `"test_basic_usage"`, `"test_with_optional_param"`).
        *   `"description"`: A brief string describing the test case, written from the perspective of an Excel user and using Excel terminology (e.g., "When using a range as input...").
        *   `"arguments"`: A JSON object containing the keyword arguments to pass to the `{function_name}` function for this scenario. Ensure data structures like lists are correctly represented in JSON.
        *   `"demo"`: A boolean or string value indicating whether this test case should be used as a demo/example in documentation or UI. This key is required for every test case.
        *   (Optional) `"expected_contains"`: If the original test asserted the result must contain a specific string, add this key with the expected string value.
        *   (Optional) `"expected_contains_any"`: If the original test asserted the result must contain *any* of a list of strings, add this key with a JSON list of those strings.
        *   (Optional) `"expected_contains_any_lower"`: Similar to `expected_contains_any`, but performs a case-insensitive check on the result.
    *   Important: Ensure the first object in the `"test_cases"` list represents the primary, most representative example for the function.

3.  Refactor `test_{function_name}.py`:
    *   Keep necessary imports (`pytest`, `json`, `pathlib`, the function itself).
    *   Remove all the original individual `test_...` functions.
    *   Add a helper function `load_test_cases()`, which should:
        *   Use `pathlib` to locate and open `test_cases.json`.
        *   Parse the JSON and extract the list from the `"test_cases"` key.
        *   Iterate through this list, wrapping each test case dictionary in `pytest.param(case, id=case.get("id"))`.
        *   Return the list of `pytest.param` objects.
    *   Add a single parameterized test function, e.g., `test_{function_name}_parametrized(test_case)`, decorated with `@pytest.mark.parametrize("test_case", load_test_cases())`:
        *   Extract the `arguments` dictionary from the `test_case` parameter.
        *   Call the `{function_name}` function using `**arguments`.
        *   Implement basic assertions (e.g., `assert isinstance(result, expected_type)`, `assert result is not None`). Adjust the expected type based on the function's return signature. For string results, usually assert `len(result) > 0`.
        *   Implement conditional assertions based on the presence of `"expected_contains"`, `"expected_contains_any"`, or `"expected_contains_any_lower"` keys in the `test_case` dictionary, mirroring the logic from the original tests.

Note: If a documentation file (e.g., `{function_name}.md`) is present, ensure that the examples shown in the documentation align with the test cases in `test_cases.json` where `"demo"` is set. The documentation examples should match the demo test cases for consistency and use Excel terminology in their descriptions.

Reference Examples:
See the following files for examples of the expected finished product:
- [ai_ask.py](../../examples/files/text/ai_ask/ai_ask.py)
- [test_ai_ask.py](../../examples/files/text/ai_ask/test_ai_ask.py)
- [test_cases.json](../../examples/files/text/ai_ask/test_cases.json)

5.  Verification (As per Development Process):
    *   Run the refactored tests using the command:
        ```cmd
        .venv\Scripts\python.exe -m pytest path\to\folder\test_{function_name}.py
        ```
    *   Ensure all tests pass.
    *   Finally, run the build script:
        ```cmd
        .venv\Scripts\python.exe examples\build_examples.py
        ```

Deliverable: The updated `test_{function_name}.py` file and the new `test_cases.json` file for the provided function folder.