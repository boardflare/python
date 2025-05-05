import pytest
from web_content import web_content

def test_web_content_basic():
    """Test the basic functionality of web_content"""
    # Test with a simple URL
    result = web_content("https://www.ycombinator.com/companies/airbnb")
    assert isinstance(result, str)
    assert len(result) > 0

def test_web_content_error_handling():
    """Test error handling for invalid URLs"""
    with pytest.raises(Exception):
        # This should raise an exception for an invalid URL
        web_content("non-existent-website-12345.com")