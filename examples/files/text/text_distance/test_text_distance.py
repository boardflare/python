import pytest
from text_distance import text_distance

def test_text_distance_exact_match():
    """Test exact matching with default algorithm"""
    result = text_distance(
        [["apple"]], 
        [["apple"], ["banana"], ["orange"], ["grape"]]
    )
    assert result == [[[1, 1.0]]]

def test_text_distance_close_match_levenshtein():
    """Test close matching with levenshtein algorithm"""
    result = text_distance(
        [["aple", "banaa"]], 
        [["apple"], ["banana"], ["orange"], ["grape"]],
        'levenshtein',
        2
    )
    # Check structure without exact values which may vary by algorithm version
    assert len(result) == 2
    assert len(result[0]) == 2
    assert len(result[1]) == 2
    assert result[0][0][0] == 1  # First match for "aple" should be position 1 (apple)
    assert result[1][0][0] == 2  # First match for "banaa" should be position 2 (banana)

def test_text_distance_string_needle():
    """Test with string needle instead of 2D list"""
    result = text_distance(
        "aple", 
        [["apple"], ["banana"], ["orange"], ["grape"]],
        'jaro_winkler',
        1
    )
    assert len(result) == 1
    assert len(result[0]) == 1
    assert result[0][0][0] == 1  # First match should be position 1 (apple)

def test_text_distance_empty_needle():
    """Test with empty needle list"""
    result = text_distance(
        [[]], 
        [["a"], ["b"]],
        'jaccard',
        1
    )
    assert result == []

def test_text_distance_empty_haystack():
    """Test with empty haystack list"""
    result = text_distance(
        [["test"]], 
        [[]],
        'jaccard',
        1
    )
    assert result == [[]]

def test_text_distance_multiple_matches():
    """Test with multiple matches requested"""
    result = text_distance(
        [["sample"]], 
        [["samples"], ["exemplar"], ["sample"], ["examples"]],
        'jaccard',
        3
    )
    assert len(result) == 1
    assert len(result[0]) == 3
    positions = [match[0] for match in result[0]]
    # Check that position 3 ("sample") is the first match
    assert positions[0] == 3