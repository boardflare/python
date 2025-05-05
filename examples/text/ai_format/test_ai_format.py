import pytest
import json
from pathlib import Path
from ai_format import ai_format

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        data = json.load(f)
    
    # Wrap each case in pytest.param, using 'id' for test identification
    return [pytest.param(case, id=case.get("id", f"test_case_{i}")) 
            for i, case in enumerate(data.get("test_cases", []))]

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_ai_format_parametrized(test_case):
    """Runs parameterized tests for the ai_format function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = ai_format(**arguments)
        
        # Basic assertions
        assert isinstance(result, str), f"Test ID: {test_case.get('id')} - Expected result to be a string, but got {type(result)}"
        assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result string to be non-empty"

        # Conditional assertion for expected_contains_any
        if "expected_contains_any" in test_case:
            expected_any = test_case["expected_contains_any"]
            result_lower = result.lower()
            assert any(substring.lower() in result_lower for substring in expected_any), \
                f"Test ID: {test_case.get('id')} - Result '{result}' did not contain any of {expected_any}"

    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])