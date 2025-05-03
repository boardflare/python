# Text Distance

## Overview

This function demonstrates fuzzy matching techniques using the Python [textdistance](https://github.com/life4/textdistance) library. It implements various algorithms including edit distance, token-based, sequence-based, and phonetic algorithms to calculate the similarity between strings.

## Usage

Compares a `lookup_value` with each item in a `lookup_array` and returns the `top_n` closest matches along with their normalized similarity scores (between 0 and 1, higher is more similar).

```excel
=TEXT_DISTANCE(lookup_value, lookup_array, [algorithm], [top_n])
```

Arguments:

| Argument       | Type              | Description                                                                 |
|----------------|-------------------|-----------------------------------------------------------------------------|
| `lookup_value` | string or 2D list | String(s) to compare with the strings in the `lookup_array`.                |
| `lookup_array` | 2D list           | A list of strings to compare with the `lookup_value`.                       |
| `algorithm`    | string            | Specifies the [similarity algorithm](#similarity-algorithms) to use. Default: 'jaccard'. |
| `top_n`        | int               | The number of top matches to return for each `lookup_value`. Default: 1.    |

Returns a 2D list where each inner list contains the `top_n` matches for the corresponding `lookup_value`. Each match is represented as `[index, similarity_score]`. The matches are ordered by similarity score (highest first). The index is 1-based.

## Similarity Algorithms

The similarity algorithms available in `textdistance` are given in the tables below.

### Edit Distance

| Algorithm            | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| [`damerau_levenshtein`](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance) | Similar to Levenshtein but considers transpositions as a single edit. |
| [`hamming`](https://en.wikipedia.org/wiki/Hamming_distance)            | Measures the number of positions at which the corresponding symbols are different. |
| [`levenshtein`](https://en.wikipedia.org/wiki/Levenshtein_distance)        | Calculates the minimum number of single-character edits required to change one word into the other. |
| [`jaro`](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance)               | Measures similarity between two strings, giving more weight to common prefixes. |
| [`jaro_winkler`](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance)       | An extension of Jaro, giving more weight to strings that match from the beginning. |
| [`lcsseq`](https://en.wikipedia.org/wiki/Longest_common_subsequence_problem)             | Measures the longest common subsequence. |
| [`lcsstr`](https://docs.python.org/2/library/difflib.html#difflib.SequenceMatcher)             | Measures the longest common substring. |
| [`ratcliff_obershelp`](https://en.wikipedia.org/wiki/Gestalt_Pattern_Matching) | Measures similarity based on the longest common subsequence. |
| [`strcmp95`](http://cpansearch.perl.org/src/SCW/Text-JaroWinkler-0.1/strcmp95.c)           | A string comparison algorithm developed by the U.S. Census Bureau. |
| [`needleman_wunsch`](https://en.wikipedia.org/wiki/Needleman%E2%80%93Wunsch_algorithm)   | A dynamic programming algorithm for sequence alignment. |
| [`smith_waterman`](https://en.wikipedia.org/wiki/Smith%E2%80%93Waterman_algorithm)     | A dynamic programming algorithm for local sequence alignment. |
| [`gotoh`](http://bioinfo.ict.ac.cn/~dbu/AlgorithmCourses/Lectures/LOA/Lec6-Sequence-Alignment-Affine-Gaps-Gotoh1982.pdf)              | An extension of Needleman-Wunsch with affine gap penalties. |

### Token

| Algorithm            | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| [`cosine`](https://en.wikipedia.org/wiki/Cosine_similarity)             | Measures the cosine of the angle between two non-zero vectors. |
| [`jaccard`](https://en.wikipedia.org/wiki/Jaccard_index)            | Measures similarity between finite sample sets. |
| [`overlap`](https://en.wikipedia.org/wiki/Overlap_coefficient)            | Measures the overlap coefficient between two sets. |
| [`sorensen`](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient)           | Measures similarity between two sets, based on the size of the intersection divided by the size of the union. |
| [`sorensen_dice`](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient)      | Similar to Sorensen, but uses Dice's coefficient. |
| [`dice`](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient)               | Another name for Sorensen-Dice coefficient. |
| [`tversky`](https://en.wikipedia.org/wiki/Tversky_index)            | A generalization of the Jaccard index. |

### Sequence

| Algorithm            | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| [`bag`](https://github.com/Yomguithereal/talisman/blob/master/src/metrics/bag.js)                | Measures bag similarity between two sequences                               |
| [`mlipns`](http://www.sial.iias.spb.su/files/386-386-1-PB.pdf)             | Measures similarity using the MLIPNS algorithm                              |
| [`monge_elkan`](https://www.academia.edu/200314/Generalized_Monge-Elkan_Method_for_Approximate_Text_String_Comparison)        | A hybrid algorithm combining multiple similarity measures. $ME(a,b)$ |

### Phonetic

| Algorithm                                                                    | Description                                                                 |
|------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| [`mra`](https://en.wikipedia.org/wiki/Match_rating_approach)                 | Measures similarity using the MRA algorithm                                 |
| [`editex`](https://anhaidgroup.github.io/py_stringmatching/v0.3.x/Editex.html) | Measures similarity using the Editex algorithm                              |