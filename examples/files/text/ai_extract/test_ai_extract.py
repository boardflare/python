import pytest
import json
from ai_extract import ai_extract

def test_ai_extract_basic():
    """Test basic functionality for extracting dates"""
    result = ai_extract("The meeting is scheduled for March 15, 2025.", "dates")
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_extract_with_complex_data():
    """Test with complex text containing multiple data points"""
    test_data = "Please contact our new clients: Jane Smith (jane.smith@example.com, 555-123-4567) and John Doe (john.doe@example.org, 555-987-6543)."
    
    result = ai_extract(test_data, "contact information")
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_extract_from_2d_list():
    """Test extraction from a 2D list input"""
    test_data = [["Project milestones: 1) Requirements gathering (complete by May 1), 2) Design phase (May 2-15), 3) Development (May 16-June 20)"]]
    
    result = ai_extract(test_data, "project milestones")
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_extract_empty_input():
    """Test handling of empty input"""
    result = ai_extract([], "dates")
    assert result == [["Error: Empty input text."]]

def test_ai_extract_parameters():
    """Test that all optional parameters work correctly"""
    result = ai_extract(
        "The quarterly board meeting is scheduled for March 18, 2025 at 2:00 PM.", 
        "dates and times",
        temperature=0.2, 
        max_tokens=500,
        model="mistral-small-latest"
    )
    
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 for item in result)

def test_ai_extract_different_types():
    """Test extraction of different types of information"""
    text = """Project milestones: 1) Requirements gathering (complete by May 1), 
    2) Design phase (May 2-15), 3) Development (May 16-June 20), 
    4) Testing (June 21-30), 5) Deployment (July 1). 
    Contact John (john@example.com) or Sarah (sarah@example.com) for questions."""
    
    # Test extracting milestones
    milestones = ai_extract(text, "project milestones")
    assert isinstance(milestones, list)
    assert len(milestones) > 0
    
    # Test extracting emails
    emails = ai_extract(text, "email addresses")
    assert isinstance(emails, list)
    assert len(emails) > 0