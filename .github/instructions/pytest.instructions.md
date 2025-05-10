---
applyTo: '**/test_*.py'
---
## Test File (e.g. `test_my_function.py`) 

Contains unit tests using `pytest`, always begins with `test_`.
-   Should load test cases from `test_cases.json`.
-   Include tests for both success and failure paths.
-   All examples given in the documentation should ideally be covered by tests.
-   Test with various parameter combinations.
-   **Implement only basic, generic assertions, do not assert specific values**:
    * Type checking (e.g., `assert isinstance(result, expected_type)`)
    * Non-emptiness checks (e.g., `assert len(result) > 0`)
    * For list-returning functions: verify list structure, but not specific content
-   Avoid content-specific assertions where possible, as AI outputs can vary
-   Do not mock any external API calls; tests should run against live APIs if applicable (using placeholder or test keys if necessary).