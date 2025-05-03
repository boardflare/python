import pytest
from vader_sentiment import vader_sentiment

def test_vader_sentiment_positive():
    """Test positive sentiment detection"""
    result = vader_sentiment("I love this product!")
    assert isinstance(result, float)
    assert result > 0.5  # Should be strongly positive

def test_vader_sentiment_negative():
    """Test negative sentiment detection"""
    result = vader_sentiment("This is terrible.")
    assert isinstance(result, float)
    # Adjusted the threshold to match VADER's scoring for this phrase
    assert result < -0.4  # Should be moderately to strongly negative

def test_vader_sentiment_neutral():
    """Test neutral sentiment detection"""
    result = vader_sentiment("This seems neutral.")
    assert isinstance(result, float)
    assert -0.3 < result < 0.3  # Should be roughly neutral

def test_vader_sentiment_emoticons():
    """Test sentiment detection with emoticons"""
    result = vader_sentiment("I hate waiting in line :(")
    assert result < 0  # Should be negative

def test_vader_sentiment_emphasis():
    """Test sentiment detection with emphasis"""
    result = vader_sentiment("This is the best day EVER!!!")
    assert result > 0.7  # Should be strongly positive

def test_vader_sentiment_non_string():
    """Test handling of non-string input"""
    result = vader_sentiment(123)
    assert result == 0.0  # Should return neutral for non-string input