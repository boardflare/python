import pytest
import json
from ai_ask import ai_ask

def test_ai_ask_basic():
    """Test basic functionality with just a prompt"""
    result = ai_ask("Write a one-sentence test response")
    assert isinstance(result, str)
    assert len(result) > 0

def test_ai_ask_with_data():
    """Test with additional data parameter"""
    test_data = [["Name", "Value"], ["Item1", 10], ["Item2", 20]]
    
    result = ai_ask("Summarize this data in one sentence", data=test_data)
    assert isinstance(result, str)
    assert len(result) > 0

def test_ai_ask_parameters():
    """Test that all optional parameters work correctly"""
    result = ai_ask(
        "Write a very short test response", 
        temperature=0.8, 
        max_tokens=50,
        model="mistral-small-latest"
    )
    
    assert isinstance(result, str)
    assert len(result) > 0

def test_ai_ask_different_models():
    """Test that different models can be used"""
    # Using the default model
    result_default = ai_ask("Write a one-sentence test response")
    
    # Using a specified model
    result_specified = ai_ask("Write a one-sentence test response", model="mistral-small-latest")
    
    assert isinstance(result_default, str)
    assert isinstance(result_specified, str)
    assert len(result_default) > 0
    assert len(result_specified) > 0

def test_ai_ask_with_complex_data():
    """Test with more complex data structure"""
    test_data = [
        ["Product", "Q1", "Q2", "Q3", "Q4"],
        ["Widgets", 100, 150, 200, 175],
        ["Gadgets", 120, 130, 110, 140],
        ["Doodads", 90, 85, 95, 105]
    ]
    
    result = ai_ask("Describe the quarterly performance trends in one paragraph", data=test_data)
    assert isinstance(result, str)
    assert len(result) > 0