import pytest
import json
from pathlib import Path
from minimize_scalar import minimize_scalar_function

def load_test_cases():
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        data = json.load(f)
    return [pytest.param(case, id=case.get("id", f"test_case_{i}")) for i, case in enumerate(data)]

@pytest.mark.parametrize("test_case", load_test_cases())
def test_minimize_scalar_parametrized(test_case):
    arguments = test_case.get("arguments", {})
    expect_error = test_case.get("expect_error", False)
    try:
        if expect_error:
            with pytest.raises(Exception):
                minimize_scalar_function(**arguments)
        else:
            result = minimize_scalar_function(**arguments)
            # Result must be a 2D list
            assert isinstance(result, list)
            assert len(result) > 0
            assert isinstance(result[0], list)
            assert len(result[0]) == 2
            assert all(isinstance(x, float) for x in result[0])
    except Exception as e:
        if not expect_error:
            pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
