import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import pytest
import json
from val_discrete import val_discrete

def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        data = json.load(f)
    return [pytest.param(case, id=case.get("id", f"test_case_{i}")) for i, case in enumerate(data)]

def str_to_type(type_str):
    return {
        "int": int,
        "float": float,
        "str": str,
        "NoneType": type(None)
    }.get(type_str, object)

@pytest.mark.parametrize("test_case", load_test_cases())
def test_val_discrete_parametrized(test_case):
    arguments = test_case.get("arguments", {})
    expected_type_strs = test_case.get("expected_type", ["int", "float", "str", "NoneType"])
    expected_type = tuple(str_to_type(t) for t in expected_type_strs)
    expected_rows = test_case.get("expected_rows", 1)
    result = val_discrete(**arguments)
    # Basic type/structure assertions
    assert isinstance(result, expected_type), f"Expected type {expected_type}, got {type(result)}"
    if expected_rows == 1:
        assert result is None or not isinstance(result, list), "Expected scalar or None"
    # If expected_values is provided, check result is in expected_values
    if "expected_values" in test_case:
        assert result in test_case["expected_values"], f"Result {result} not in expected values {test_case['expected_values']}"

def test_val_discrete_edge_cases():
    # Empty input
    assert val_discrete([], []) is None
    # Mismatched lengths
    assert val_discrete([[1,2]], [[0.5]]) is None
    # Probabilities do not sum to 1
    assert val_discrete([[1,2]], [[0.7,0.7]]) is None
    # Non-numeric weights
    assert val_discrete([[1,2]], [["a","b"]]) is None

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
