import pytest
import json
from ai_fill import ai_fill

def test_ai_fill_basic():
    """Test basic functionality with simple example and fill ranges"""
    example_range = [
        ["Product", "Category", "Price"],
        ["Widget A", "Tools", 15.99],
        ["Widget B", "Tools", 19.99]
    ]
    
    fill_range = [
        ["Product", "Category", "Price"],
        ["Widget C", "Tools", None]
    ]
    
    result = ai_fill(example_range, fill_range)
    assert isinstance(result, list)
    assert len(result) == len(fill_range)
    assert all(isinstance(row, list) for row in result)
    # The first row should be unchanged
    assert result[0] == fill_range[0]
    # The price value should be filled
    assert isinstance(result[1][2], (int, float))

def test_ai_fill_complex_pattern():
    """Test with more complex data patterns"""
    example_range = [
        ["Region", "Product", "Q1 Sales", "Q2 Sales"],
        ["North", "Widget A", 1200, 1350],
        ["South", "Widget A", 950, 1050],
        ["North", "Widget B", 800, 880]
    ]
    
    fill_range = [
        ["Region", "Product", "Q1 Sales", "Q2 Sales"],
        ["South", "Widget B", None, None]
    ]
    
    result = ai_fill(example_range, fill_range)
    assert isinstance(result, list)
    assert len(result) == len(fill_range)
    assert all(isinstance(row, list) for row in result)
    # The values should be filled
    assert result[1][2] is not None
    assert result[1][3] is not None
    assert isinstance(result[1][2], (int, float))
    assert isinstance(result[1][3], (int, float))

def test_ai_fill_parameters():
    """Test that all optional parameters work correctly"""
    example_range = [
        ["Department", "Role", "Salary Range"],
        ["Engineering", "Junior Developer", "$60,000-$80,000"],
        ["Engineering", "Senior Developer", "$100,000-$130,000"],
        ["Marketing", "Marketing Specialist", "$55,000-$75,000"]
    ]
    
    fill_range = [
        ["Department", "Role", "Salary Range"],
        ["Marketing", "Marketing Director", None],
        ["Engineering", "Lead Developer", None]
    ]
    
    result = ai_fill(
        example_range,
        fill_range,
        temperature=0.1,
        max_tokens=2000,
        model="mistral-small-latest"
    )
    
    assert isinstance(result, list)
    assert len(result) == len(fill_range)
    assert all(isinstance(row, list) for row in result)
    # The salary ranges should be filled
    assert result[1][2] is not None
    assert result[2][2] is not None
    assert isinstance(result[1][2], str)
    assert isinstance(result[2][2], str)

def test_ai_fill_empty_inputs():
    """Test behavior with empty inputs"""
    # Test with empty example range
    result1 = ai_fill([], [[None, None]])
    assert isinstance(result1, list)
    assert "Error" in result1[0][0]
    
    # Test with empty fill range
    result2 = ai_fill([[1, 2], [3, 4]], [])
    assert isinstance(result2, list)
    assert "Error" in result2[0][0]

def test_ai_fill_mixed_data_types():
    """Test with mixed data types"""
    example_range = [
        ["ID", "Name", "Active", "Score"],
        [1, "John", True, 85.5],
        [2, "Jane", False, 92.3],
        [3, "Mike", True, 78.9]
    ]
    
    fill_range = [
        ["ID", "Name", "Active", "Score"],
        [4, "Lisa", None, None],
        [5, None, None, 88.7]
    ]
    
    result = ai_fill(example_range, fill_range)
    assert isinstance(result, list)
    assert len(result) == len(fill_range)
    assert all(isinstance(row, list) for row in result)
    # Check that appropriate data types are preserved
    assert isinstance(result[1][2], bool) or result[1][2] is None
    assert isinstance(result[1][3], (int, float)) or result[1][3] is None
    assert isinstance(result[2][1], str) or result[2][1] is None
    assert isinstance(result[2][2], bool) or result[2][2] is None