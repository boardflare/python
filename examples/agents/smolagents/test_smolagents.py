import pytest
import json
import os
from examples.agents.smolagents.smolagents import smolagents

# Load test cases from test_cases.json
TEST_CASES_PATH = os.path.join(os.path.dirname(__file__), 'test_cases.json')
with open(TEST_CASES_PATH, encoding='utf-8') as f:
    TEST_CASES = json.load(f)

def idfn(tc):
    return tc.get('id', 'unknown')

@pytest.mark.parametrize('case', TEST_CASES, ids=idfn)
def test_smolagents_cases(case):
    arguments = case.get('arguments', {})
    result = smolagents(**arguments)
    # Type check
    expected_type = case.get('expected_type', 'str')
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
        assert len(result) == case.get('expected_rows', 1)
    # Demo cases: result should not be empty
    if case.get('demo', False):
        assert result
    # Output content check
    if 'expected_contains_any' in case:
        assert any(substr in result for substr in case['expected_contains_any'])
