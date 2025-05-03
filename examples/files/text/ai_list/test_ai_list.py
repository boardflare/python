import pytest
import json
from ai_list import ai_list

def test_ai_list_basic():
    """Test basic functionality with just a prompt"""
    result = ai_list("List 3 important financial metrics")
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_list_with_values():
    """Test with additional values parameter"""
    test_values = [
        ["Customer satisfaction dropped 8%"], 
        ["New software rollout delayed"], 
        ["Marketing budget underutilized by 15%"]
    ]
    
    result = ai_list("List action items based on these meeting notes", test_values)
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_list_parameters():
    """Test that all optional parameters work correctly"""
    result = ai_list(
        "List 5 common project management challenges", 
        temperature=0.1, 
        max_tokens=500,
        model="mistral-small-latest"
    )
    
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_list_different_models():
    """Test that different models can be used"""
    # Using the default model
    result_default = ai_list("List 3 popular programming languages")
    
    # Using a specified model
    result_specified = ai_list("List 3 popular programming languages", model="mistral-small-latest")
    
    assert isinstance(result_default, list)
    assert isinstance(result_specified, list)
    assert len(result_default) > 0
    assert len(result_specified) > 0

def test_ai_list_with_specific_count():
    """Test generating a list with a specific number of items"""
    result = ai_list("List exactly 5 essential soft skills for the workplace")
    assert isinstance(result, list)
    assert len(result) > 0
    # Not testing exact length since the AI might not always follow the count perfectly