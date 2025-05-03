import pytest
from text_distance import text_distance

def test_text_distance_exact_match():
    result = text_distance(
        [["apple"]], 
        [["appl"], ["banana"], ["orange"], ["grape"]]
    )
    assert result == [1, 0.8]

def test_text_distance_close_match_levenshtein():
    result = text_distance(
        [["aple", "banaa"]], 
        [["apple"], ["banana"], ["orange"], ["grape"]],
        'levenshtein',
        2
    )
    # Should return a list of flat lists (row format)
    assert isinstance(result, list)
    assert len(result) == 2
    assert all(isinstance(row, list) for row in result)
    assert all(isinstance(x, (int, float)) for row in result for x in row)
    assert result[0][0] == 1  # First match for "aple" should be position 1 (apple)
    assert result[1][0] == 2  # First match for "banaa" should be position 2 (banana)

def test_text_distance_string_needle():
    result = text_distance(
        "aple", 
        [["apple"], ["banana"], ["orange"], ["grape"]],
        'jaro_winkler',
        1
    )
    assert isinstance(result, list)
    assert len(result) == 2
    assert result[0] == 1  # First match should be position 1 (apple)

def test_text_distance_empty_needle():
    result = text_distance(
        [[]], 
        [["a"], ["b"]],
        'jaccard',
        1
    )
    assert result == []

def test_text_distance_empty_haystack():
    result = text_distance(
        [["test"]], 
        [[]],
        'jaccard',
        1
    )
    assert result == [[]]

def test_text_distance_multiple_matches():
    result = text_distance(
        [["sample"]], 
        [["samples"], ["exemplar"], ["sample"], ["examples"]],
        'jaccard',
        3
    )
    # Should return a flat list of [position, score, ...]
    assert isinstance(result, list)
    assert len(result) == 6  # 3 matches * 2 (position, score)
    assert all(isinstance(x, (int, float)) for x in result)
    assert result[0] == 3  # First match should be position 3 ("sample")