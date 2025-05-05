import pytest
import json
from pathlib import Path
from text_distance import text_distance

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
def test_text_distance_parametrized(test_case):
    """Runs parameterized tests for the text_distance function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = text_distance(**arguments)
        
        # Basic assertions
        assert result is not None, f"Test ID: {test_case.get('id')} - Result should not be None"
        
        # Type checking based on input type
        if isinstance(arguments.get("needle"), str) or (
            isinstance(arguments.get("needle"), list) and len(arguments.get("needle")) == 1):
            # Single needle should return a flat list
            assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list"
        else:
            # Multiple needles should return a list of lists
            assert isinstance(result, list), f"Test ID: {test_case.get('id')} - Expected result to be a list"
            
        # Check for empty inputs
        if arguments.get("needle") == [[]] or not arguments.get("needle"):
            assert result == [], f"Test ID: {test_case.get('id')} - Empty needle should return empty list"
        elif arguments.get("haystack") == [[]] or not arguments.get("haystack"):
            assert len(result) == 0 or result == [[]], f"Test ID: {test_case.get('id')} - Empty haystack should return empty result"
            
        # Validate structure for non-empty results with multiple matches
        if result and isinstance(result[0], list):
            # Multiple needles result
            for needle_result in result:
                if needle_result:  # Skip empty results
                    # Each position-score pair should have 2 elements
                    assert len(needle_result) % 2 == 0, f"Test ID: {test_case.get('id')} - Result should have even number of elements (position-score pairs)"
        elif result:
            # Single needle result
            assert len(result) % 2 == 0, f"Test ID: {test_case.get('id')} - Result should have even number of elements (position-score pairs)"

    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])