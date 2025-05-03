import pytest
import json
from ai_format import ai_format

def test_ai_format_basic():
    """Test basic functionality with just text and format instruction"""
    result = ai_format("sample text", "plain text format")
    assert isinstance(result, str)
    assert len(result) > 0

def test_ai_format_with_list_input():
    """Test with a 2D list input"""
    test_data = [["Jane Doe / Sales Manager / jdoe@example.com / 555-987-6543"]]
    
    result = ai_format(test_data, "professional business card format")
    assert isinstance(result, str)
    assert len(result) > 0

def test_ai_format_parameters():
    """Test that all optional parameters work correctly"""
    result = ai_format(
        "meeting with clients on Tuesday", 
        "professional task list with deadlines",
        temperature=0.1, 
        max_tokens=100,
        model="mistral-small-latest"
    )
    
    assert isinstance(result, str)
    assert len(result) > 0

def test_ai_format_different_models():
    """Test that different models can be used"""
    # Using the default model
    result_default = ai_format("sample text", "simple plain text format")
    
    # Using a specified model
    result_specified = ai_format("sample text", "simple plain text format", model="mistral-small-latest")
    
    assert isinstance(result_default, str)
    assert isinstance(result_specified, str)
    assert len(result_default) > 0
    assert len(result_specified) > 0

def test_ai_format_with_complex_format():
    """Test with more complex formatting instructions"""
    test_data = "product received 8/15, quality good but delivery slow, packaging damaged"
    
    result = ai_format(test_data, "structured product review with ratings for quality, delivery, and packaging")
    assert isinstance(result, str)
    assert len(result) > 0