import pytest
import json
from pathlib import Path
from black_scholes import black_scholes

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
def test_black_scholes_parametrized(test_case):
    """Runs parameterized tests for the black_scholes function."""
    arguments = test_case.get("arguments", {})
    expect_error = test_case.get("expect_error", False)
    expected = test_case.get("expected")
    try:
        if expect_error:
            with pytest.raises(Exception):
                black_scholes(**arguments)
        else:
            result = black_scholes(**arguments)
            assert isinstance(result, float), f"Test ID: {test_case.get('id')} - Expected result to be a float, but got {type(result)}"
            assert result is not None, f"Test ID: {test_case.get('id')} - Result should not be None"
            if expected is not None:
                assert abs(result - expected) < 1e-3, f"Test ID: {test_case.get('id')} - Expected {expected}, got {result}"
    except Exception as e:
        if not expect_error:
            pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
