import pytest
import json
from pathlib import Path
from smolagents_hello import smolagents_hello

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Wrap each case in pytest.param, using 'id' for test identification
    return [pytest.param(case, id=case.get("id", f"test_case_{i}")) 
            for i, case in enumerate(data)]

@pytest.mark.parametrize("test_case", load_test_cases())
def test_smolagents_hello_parametrized(test_case):
    arguments = test_case.get("arguments", {})
    try:
        # Call the function directly (no async/await)
        result = smolagents_hello(**arguments)
        print(f"Test ID: {test_case.get('id')} - Actual result: {result}")
        # Basic assertions
        expected_type = test_case.get('expected_type', 'str')
        if expected_type == 'str':
            assert isinstance(result, str)
        elif expected_type == 'float':
            assert isinstance(result, float)
        elif expected_type == 'int':
            assert isinstance(result, int)
        elif expected_type == 'bool':
            assert isinstance(result, bool)
        elif expected_type == 'list':
            assert isinstance(result, list)
        # Structure check: scalar should have 1 row, list should have expected_rows
        if isinstance(result, list):
            assert len(result) == test_case.get('expected_rows', 1)
        # Demo cases: result should not be empty
        if test_case.get('demo', False):
            assert result
        # Output content check
        if 'expected_contains_any' in test_case:
            assert any(substr in result for substr in test_case['expected_contains_any'])
    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
