# VADER Sentiment Analysis

## Overview

This function performs sentiment analysis on text using the VADER (Valence Aware Dictionary and sEntiment Reasoner) lexicon, which is specifically attuned to sentiments expressed in social media.

[View Python code on GitHub](https://github.com/boardflare/python-functions/blob/main/files/text/vader_sentiment/vader_sentiment.py)

## Usage

Analyzes the sentiment of the input text and returns a compound score.

```excel
=VADER_SENTIMENT(text)
```

Arguments:

| Argument | Type   | Description                   |
|----------|--------|-------------------------------|
| `text`   | string | The text to analyze.          |

Returns:

| Return Value   | Type  | Description                                                                 |
|----------------|-------|-----------------------------------------------------------------------------|
| Compound Score | float | A normalized score between -1 (most negative) and +1 (most positive). |