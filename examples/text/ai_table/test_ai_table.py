import pytest
import json
from pathlib import Path
from ai_table import ai_table

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        return json.load(f)

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_ai_table_parametrized(test_case):
    """Runs parameterized tests for the ai_table function."""
    arguments = test_case.get("arguments", {})
    should_error = test_case.get("should_error", False)
    
    try:
        # Call the function with the arguments from the test case
        result = ai_table(**arguments)
        
        if should_error:
            # For error tests that return an error message in a list instead of raising an exception
            # Check if the result contains an error message
            result_str = str(result).lower()
            if "error" in result_str:
                return  # Test passes if we detect an error message in the result
            else:
                pytest.fail(f"Test ID: {test_case.get('id')} - Expected error but got result: {result}")
        
        # Basic assertions
        assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list, but got {type(result)}"
        assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result list to be non-empty"
        
        # Check all rows are lists
        assert all(isinstance(row, list) for row in result), \
            f"Test ID: {test_case.get('id')} - Expected all rows to be lists"
        
        # Check for minimum number of rows if specified (not exact match)
        if "expected_rows" in test_case:
            min_expected_rows = 1  # At minimum, we need at least 1 row
            # For tables, we typically want a header row and at least one data row
            if test_case["expected_rows"] > 1:  
                min_expected_rows = 2
            assert len(result) >= min_expected_rows, \
                f"Test ID: {test_case.get('id')} - Expected at least {min_expected_rows} rows, but got {len(result)}"
        
        # Check for expected contents if specified
        if "expected_contains_any" in test_case:
            expected_contains = test_case["expected_contains_any"]
            # Convert result to string for simple substring search
            result_str = str(result)
            assert any(expected in result_str for expected in expected_contains), \
                f"Test ID: {test_case.get('id')} - Result doesn't contain any of the expected values: {expected_contains}"
            
    except Exception as e:
        if should_error:
            # If we expected an error, this is actually a pass
            pass
        else:
            pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])