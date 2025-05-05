import pytest
import json
from pathlib import Path
from ai_table import ai_table

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
def test_ai_table_parametrized(test_case):
    """Runs parameterized tests for the ai_table function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = ai_table(**arguments)
        
        # Basic assertions
        assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list, but got {type(result)}"
        assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result to be non-empty"
        
        # Check expected rows if specified
        if "expected_rows" in test_case:
            expected_rows = test_case["expected_rows"]
            # For error cases, we might only have one row with an error message
            if not test_case.get("should_error", False):
                assert len(result) >= expected_rows - 1 and len(result) <= expected_rows + 1, \
                    f"Test ID: {test_case.get('id')} - Expected approximately {expected_rows} rows, but got {len(result)}"
        
        # Conditional assertion for expected_contains_any
        if "expected_contains_any" in test_case and not test_case.get("should_error", False):
            expected_any = test_case["expected_contains_any"]
            # Convert to string and flatten result for easier searching
            flattened_result = []
            for row in result:
                for item in row:
                    flattened_result.append(str(item))
            
            # Check if any of the expected strings appear in the flattened result
            found = False
            for expected in expected_any:
                for item in flattened_result:
                    if expected in item:
                        found = True
                        break
                if found:
                    break
            
            assert found, f"Test ID: {test_case.get('id')} - Result did not contain any of {expected_any}. Got: {flattened_result}"
        
        # If test case should error (we check this differently now)
        if test_case.get("should_error", False):
            assert "Error" in result[0][0], f"Test ID: {test_case.get('id')} - Expected error message not found"
            
    except Exception as e:
        # If we expect an error but it's not caught by the function
        if test_case.get("should_error", False):
            # This is fine, the function itself should return an error message as a list
            pytest.fail(f"Test ID: {test_case.get('id')} - Function did not handle expected error: {str(e)}")
        else:
            pytest.fail(f"Test ID: {test_case.get('id')} - Unexpected exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])