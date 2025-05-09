import pytest
import json
from pathlib import Path
from zillow import zillow

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        data = json.load(f)
    
    # Wrap each case in pytest.param, using 'id' for test identification
    return [pytest.param(case, id=case.get("id", f"test_case_{i}")) 
            for i, case in enumerate(data)]

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_zillow_parametrized(test_case):
    """Runs parameterized tests for the zillow function."""
    arguments = test_case.get("arguments", {})
    
    # If the test expects an error
    if "expected_error" in test_case:
        with pytest.raises(ValueError) as excinfo:
            zillow(**arguments)
        # Check that the error message contains the expected message
        assert test_case["expected_error"] in str(excinfo.value)
        return
    
    # Otherwise, run the function and verify its output
    try:
        result = zillow(**arguments)
        
        # Basic assertions
        assert isinstance(result, list), f"Expected result to be a list, got {type(result)}"
        assert len(result) > 0, "Expected non-empty result"
        
        # Check number of rows returned (if specified)
        if "expected_rows" in test_case:
            expected_rows = test_case["expected_rows"]
            assert len(result) <= expected_rows, f"Expected at most {expected_rows} rows, got {len(result)}"
        
        # Check structure of the result (should be a 2D list)
        for row in result:
            assert isinstance(row, list), "Expected each row to be a list"
        
        # Verify the header row is present (first row should contain column headers)
        if len(result) > 0:
            headers = result[0]
            assert "Address" in headers, "Expected 'Address' in header row"
            assert "Price" in headers, "Expected 'Price' in header row"
            assert "Bedrooms" in headers, "Expected 'Bedrooms' in header row"
            assert "Bathrooms" in headers, "Expected 'Bathrooms' in header row"
        
        # For non-error cases with data, verify that we have at least some property data
        if len(result) > 1:
            assert len(result[1]) > 0, "Expected property data in results"
            
    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", "-s", __file__])