import pytest
import json
from pathlib import Path
from ai_fill import ai_fill

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
def test_ai_fill_parametrized(test_case):
    """Runs parameterized tests for the ai_fill function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = ai_fill(**arguments)
        
        # Basic assertions
        assert isinstance(result, list), f"Expected result to be a list, but got {type(result)}"
        assert len(result) > 0, f"Expected result list to be non-empty"
        assert all(isinstance(row, list) for row in result), f"Expected result to be a 2D list"
        
        # For error cases, check if the error message is contained in the first cell
        if "expected_contains" in test_case:
            expected_contains = test_case["expected_contains"]
            result_str = str(result[0][0])
            assert any(substring in result_str for substring in expected_contains), \
                f"Result '{result_str}' did not contain any of {expected_contains}"
            return  # Skip further assertions for error cases
        
        # Check that the dimensions match the fill_range from the test case
        fill_range = arguments.get("fill_range", [])
        if fill_range:
            assert len(result) == len(fill_range), \
                f"Expected result to have {len(fill_range)} rows, but got {len(result)}"
            
    except Exception as e:
        pytest.fail(f"Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])