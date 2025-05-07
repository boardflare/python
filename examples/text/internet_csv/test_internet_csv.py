import pytest
import json
import os
from internet_csv import internet_csv

# Ensure the test_cases.json path is correct regardless of working directory
TEST_CASES_PATH = os.path.join(os.path.dirname(__file__), "test_cases.json")
with open(TEST_CASES_PATH, encoding="utf-8") as f:
    TEST_CASES = json.load(f)

def is_2d_list(obj):
    return isinstance(obj, list) and all(isinstance(row, list) for row in obj)

@pytest.mark.parametrize("case", TEST_CASES)
def test_internet_csv(case):
    args = case["args"]
    expected_type = case["expected_type"]
    if expected_type == "error":
        with pytest.raises(Exception):
            internet_csv(*args)
    else:
        result = internet_csv(*args)
        assert is_2d_list(result), "Result should be a 2D list"
        assert len(result) >= 1, "Result should not be empty"
        # Optionally check row count for demo cases
        if case.get("demo"):
            assert len(result) >= case["expected_rows"]
