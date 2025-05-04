import pytest
import json
from pathlib import Path
from ai_choice import ai_choice

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        data = json.load(f)
    return [pytest.param(case, id=case.get("id", f"test_case_{i}"))
            for i, case in enumerate(data.get("test_cases", []))]

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_ai_choice_parametrized(test_case):
    arguments = test_case.get("arguments", {})
    result = ai_choice(**arguments)

    # Basic assertions
    assert isinstance(result, str), f"Test ID: {test_case.get('id')} - Expected result to be a string, but got {type(result)}"
    assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result string to be non-empty"

    # Conditional assertion for expected_contains
    if "expected_contains" in test_case:
        expected = test_case["expected_contains"]
        assert expected in result, f"Test ID: {test_case.get('id')} - Result '{result}' did not contain expected substring '{expected}'"

if __name__ == "__main__":
    import pytest
    pytest.main([__file__])