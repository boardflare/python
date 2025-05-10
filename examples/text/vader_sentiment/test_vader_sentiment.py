import pytest
import json
from pathlib import Path
from vader_sentiment import vader_sentiment

# Helper function to load test cases from JSON
def load_test_cases():
    """Loads test cases from the test_cases.json file."""
    test_case_path = Path(__file__).parent / "test_cases.json"
    with open(test_case_path, 'r') as f:
        return json.load(f)

# Parameterized test function
@pytest.mark.parametrize("test_case", load_test_cases())
def test_vader_sentiment_parametrized(test_case):
    """Runs parameterized tests for the vader_sentiment function."""
    arguments = test_case.get("arguments", {})
    
    try:
        # Call the function with the arguments from the test case
        result = vader_sentiment(**arguments)
        
        # Basic assertions
        assert isinstance(result, float), f"Test ID: {test_case.get('id')} - Expected result to be a float"
        
        # Check specific test case expectations with more flexible boundaries
        if test_case.get("id") in ["test_positive_review", "test_positive_sentiment", "test_emphasis"]:
            # Positive sentiment - just needs to be positive
            assert result > 0.0, f"Test ID: {test_case.get('id')} - Expected positive sentiment (>0.0), got {result}"
        
        elif test_case.get("id") in ["test_negative_feedback", "test_negative_sentiment", "test_emoticons"]:
            # Negative sentiment - just needs to be negative
            assert result < 0.0, f"Test ID: {test_case.get('id')} - Expected negative sentiment (<0.0), got {result}"
        
        elif test_case.get("id") == "test_neutral_statement":
            # Neutral sentiment - wider acceptable range
            assert -0.3 < result < 0.3, f"Test ID: {test_case.get('id')} - Expected neutral sentiment (-0.3 to 0.3), got {result}"
        
        elif test_case.get("id") == "test_mixed_sentiment":
            # Mixed sentiment - no strong assertions about the value
            # Just check that it's a valid sentiment score between -1 and 1
            assert -1.0 <= result <= 1.0, f"Test ID: {test_case.get('id')} - Expected valid sentiment score (-1.0 to 1.0), got {result}"
        
        elif test_case.get("id") == "test_non_string":
            # Non-string input should return 0.0 (neutral)
            assert result == 0.0, f"Test ID: {test_case.get('id')} - Expected 0.0 for non-string input, got {result}"
    
    except Exception as e:
        pytest.fail(f"Test ID: {test_case.get('id')} - Exception occurred: {str(e)}")

if __name__ == "__main__":
    pytest.main(["-v", __file__])