import pytest
from unittest.mock import patch, Mock
from ai_table import ai_table
import json

@pytest.fixture
def mock_successful_response():
    """Create a mock for a successful API response"""
    mock_response = Mock()
    mock_response.status_code = 200
    
    # Sample table data that would be returned from the API
    table_data = [
        ["Country", "Popular Attractions", "Best Time to Visit", "Average Cost"],
        ["France", "Eiffel Tower, Louvre", "Spring, Fall", "$150/day"],
        ["Japan", "Mt. Fuji, Temples", "Spring, Fall", "$120/day"],
        ["Italy", "Colosseum, Canals", "Spring, Summer", "$140/day"]
    ]
    
    # Format the response as expected from the API
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(table_data)
                }
            }
        ]
    }
    return mock_response

@pytest.fixture
def mock_failed_response():
    """Create a mock for a failed API response"""
    mock_response = Mock()
    mock_response.raise_for_status.side_effect = Exception("API Error")
    return mock_response

def test_ai_table_basic(mock_successful_response):
    """Test basic functionality of ai_table with mocked API response"""
    with patch('requests.post', return_value=mock_successful_response):
        result = ai_table("Generate a table of top 3 tourist destinations.")
        
        # Check that the result is a 2D list with expected structure
        assert isinstance(result, list)
        assert len(result) == 4  # Header + 3 data rows
        assert len(result[0]) == 4  # 4 columns
        assert result[0][0] == "Country"  # Check header
        assert result[1][0] == "France"  # Check first data row

def test_ai_table_with_header(mock_successful_response):
    """Test ai_table with a custom header"""
    with patch('requests.post', return_value=mock_successful_response):
        custom_header = [["Country", "Attractions", "Season", "Cost"]]
        result = ai_table("Generate a table of tourist destinations.", header=custom_header)
        
        # Result should use API response regardless of header input in this mock
        assert isinstance(result, list)
        assert len(result) > 0

def test_ai_table_with_source(mock_successful_response):
    """Test ai_table with source data"""
    with patch('requests.post', return_value=mock_successful_response):
        source_data = [
            ["Country", "GDP"],
            ["USA", "$21 trillion"],
            ["China", "$14 trillion"]
        ]
        result = ai_table("Summarize economic data.", source=source_data)
        
        # Result should use API response regardless of source input in this mock
        assert isinstance(result, list)
        assert len(result) > 0

def test_ai_table_error_handling(mock_failed_response):
    """Test error handling when API request fails"""
    with patch('requests.post', side_effect=Exception("API Error")):
        result = ai_table("This should fail")
        
        # Should return an error message as a list
        assert isinstance(result, list)
        assert len(result) == 1
        assert "Error" in result[0][0]