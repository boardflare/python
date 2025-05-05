import pytest
import json
from pathlib import Path
from ai_list import ai_list

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
def test_ai_list_parametrized(test_case):
    """Runs parameterized tests for the ai_list function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = ai_list(**arguments)
        
        # Basic assertions only checking structure and non-emptiness
        assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list, but got {type(result)}"
        assert len(result) > 0, f"Test ID: {test_case.get('id')} - Expected result list to be non-empty"
        assert all(isinstance(item, list) for item in result), \
            f"Test ID: {test_case.get('id')} - Result should be a list of lists"
        assert all(len(item) == 1 for item in result), \
            f"Test ID: {test_case.get('id')} - Each item in result should be a single-item list"
        assert all(isinstance(item[0], str) and len(item[0]) > 0 for item in result), \
            f"Test ID: {test_case.get('id')} - Each item should contain a non-empty string"
        
        # Optional check for expected row count (not strict since AI output can vary)
        if "expected_rows" in test_case:
            expected_rows = test_case["expected_rows"]
            actual_rows = len(result)
            # Log row count difference but don't fail the test
            if abs(actual_rows - expected_rows) > expected_rows * 0.2:  # 20% tolerance
                print(f"Note: Test ID {test_case.get('id')} - Expected {expected_rows} rows, but got {actual_rows}")
    
    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])