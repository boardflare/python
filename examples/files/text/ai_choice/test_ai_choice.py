import pytest
import json
from ai_choice import ai_choice

def test_ai_choice_basic():
    """Test basic functionality with string choices"""
    result = ai_choice("We are very satisfied with the product quality and customer service.", 
                       "Positive, Neutral, Negative")
    assert isinstance(result, str)
    assert result in ["Positive", "Neutral", "Negative"]

def test_ai_choice_with_list():
    """Test with list of choices"""
    choices = [["Sales"], ["Marketing"], ["Engineering"], ["Finance"], ["HR"]]
    result = ai_choice("I have extensive experience in software development, including frontend and backend systems.", 
                      choices)
    assert isinstance(result, str)
    assert result in ["Sales", "Marketing", "Engineering", "Finance", "HR"]

def test_ai_choice_parameters():
    """Test that optional parameters work correctly"""
    result = ai_choice(
        "Our quarterly revenue exceeded expectations by 12%, but expenses also increased by 7%.",
        "Good News, Bad News, Mixed Results",
        temperature=0.2,
        max_tokens=100
    )
    
    assert isinstance(result, str)
    assert result in ["Good News", "Bad News", "Mixed Results"]

def test_ai_choice_error_handling():
    """Test error handling for invalid inputs"""
    # Empty text
    result_empty_text = ai_choice([], "Option A, Option B")
    assert "Error" in result_empty_text
    
    # Empty choices
    result_empty_choices = ai_choice("Some input text", "")
    assert "Error" in result_empty_choices
    
    # Empty list choices
    result_empty_list = ai_choice("Some input text", [[]])
    assert "Error" in result_empty_list

def test_ai_choice_with_complex_input():
    """Test with complex text input"""
    complex_text = """
    The mobile application consistently crashes when users attempt to upload images larger than 5MB.
    This issue has been reported by multiple users across different device types, including both
    iOS and Android platforms. The development team has identified a memory management issue
    that occurs during the image compression process.
    """
    
    categories = "Bug Report, Feature Request, Performance Issue, Security Concern, Documentation Error"
    
    result = ai_choice(complex_text, categories)
    assert isinstance(result, str)
    assert result in [cat.strip() for cat in categories.split(",")]