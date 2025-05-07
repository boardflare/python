import pytest
import json
import os
from pathlib import Path
from ai_extract import ai_extract

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        return json.load(f)

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_ai_extract_parametrized(test_case):
    """Runs parameterized tests for the ai_extract function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = ai_extract(**arguments)
        
        # Basic assertions
        assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list, but got {type(result)}"
        assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result list to be non-empty"
        assert all(isinstance(item, list) for item in result), f"Test ID: {test_case.get('id')} - Expected all items in result to be lists"
        
        # Check for expected error message in case of empty input
        if "expected_contains" in test_case:
            expected_content = test_case["expected_contains"]
            assert any(expected_content in item[0] for item in result), \
                f"Test ID: {test_case.get('id')} - Result '{result}' did not contain '{expected_content}'"
        
        # For non-error cases, check that we have valid data
        elif "expected_contains" not in test_case:
            assert all(len(item) == 1 for item in result), \
                f"Test ID: {test_case.get('id')} - Expected all items in result to have length 1, but got {result}"
                
    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])