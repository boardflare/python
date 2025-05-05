import pytest
import json
from ai_summarize import ai_summarize

def test_ai_summarize_paragraph():
    """Test basic functionality with paragraph format"""
    sample_text = "Q1 2025 financial results showed a 12% increase in revenue, reaching $3.4M compared to $3.0M in Q1 2024. Operating expenses were reduced by 5% due to successful cost-cutting initiatives in our supply chain operations. Profit margins improved from 15% to 18%."
    
    result = ai_summarize(sample_text, "short", "paragraph")
    assert isinstance(result, list)
    assert len(result) == 1
    assert len(result[0]) == 1
    assert isinstance(result[0][0], str)
    assert len(result[0][0]) > 0

def test_ai_summarize_bullets():
    """Test summarizing with bullets format"""
    sample_text = "During today's product development meeting, we discussed the user interface redesign, database performance issues, and payment processing integration options. The UI redesign is 85% complete and should be finished by next Friday. We need to optimize database queries before beta testing."
    
    result = ai_summarize(sample_text, 100, "bullets")
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 and isinstance(item[0], str) for item in result)

def test_ai_summarize_key_points():
    """Test summarizing with key_points format"""
    sample_text = "We collected feedback from 120 customers who used our new software platform over the past month. Approximately 65% of users rated the experience as positive (4 or 5 stars), while 25% gave neutral ratings (3 stars) and 10% reported negative experiences (1 or 2 stars)."
    
    result = ai_summarize(sample_text, "medium", "key_points")
    assert isinstance(result, list)
    assert len(result) > 0
    assert all(isinstance(item, list) and len(item) == 1 and isinstance(item[0], str) for item in result)

def test_ai_summarize_parameters():
    """Test that all optional parameters work correctly"""
    sample_text = "This is a sample text for testing parameter functionality in the AI summarization function."
    
    result = ai_summarize(
        sample_text, 
        max_length="short",
        format="paragraph",
        temperature=0.1, 
        max_tokens=500,
        model="mistral-small-latest"
    )
    
    assert isinstance(result, list)
    assert len(result) == 1
    assert len(result[0]) == 1
    assert isinstance(result[0][0], str)
    assert len(result[0][0]) > 0

def test_ai_summarize_with_2d_list():
    """Test with a 2D list input"""
    sample_data = [
        ["The quarterly meeting discussed several important topics."],
        ["Revenue increased by 12% year over year."],
        ["New product launch is scheduled for next month."]
    ]
    
    result = ai_summarize(sample_data, "short", "paragraph")
    assert isinstance(result, list)
    assert len(result) == 1
    assert len(result[0]) == 1
    assert isinstance(result[0][0], str)
    assert len(result[0][0]) > 0