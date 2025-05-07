import pytest
import json
from pathlib import Path
from ai_list import ai_list

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        return json.load(f)

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_ai_list_parametrized(test_case):
    """Runs parameterized tests for the ai_list function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = ai_list(**arguments)
        
        # Basic assertions
        assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list, but got {type(result)}"
        assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result list to be non-empty"
        
        # Check for expected number of rows if specified
        if "expected_rows" in test_case:
            expected_rows = test_case["expected_rows"]
            assert len(result) == expected_rows, \
                f"Test ID: {test_case.get('id')} - Expected {expected_rows} rows, but got {len(result)}"
        
        # Check that each item is a list with one element
        assert all(isinstance(item, list) and len(item) == 1 for item in result), \
            f"Test ID: {test_case.get('id')} - Expected all items to be lists with one element"
            
    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])