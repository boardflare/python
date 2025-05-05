# VADER Sentiment Analysis

## Overview

This function performs sentiment analysis on text using the VADER (Valence Aware Dictionary and sEntiment Reasoner) lexicon, which is specifically attuned to sentiments expressed in social media.

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

## Examples

### 1. Positive Product Review Analysis
Analyze the sentiment of a positive product review.

```excel
=VADER_SENTIMENT("I absolutely love this product! It exceeded all my expectations and I would highly recommend it to anyone.")
```
**Output:** `0.9042`

The highly positive score (close to +1) indicates very positive sentiment in the review.

### 2. Negative Customer Feedback Analysis
Analyze the sentiment of negative customer feedback.

```excel
=VADER_SENTIMENT("The customer service was terrible. I waited for hours and my issue was never resolved properly.")
```
**Output:** `-0.8481`

The strongly negative score (close to -1) indicates very negative sentiment in the feedback.

### 3. Neutral Business Statement Analysis
Analyze the sentiment of a neutral business statement.

```excel
=VADER_SENTIMENT("Our company will be conducting the annual inventory count on June 15th. All departments will participate as scheduled.")
```
**Output:** `0.0`

The neutral score (close to 0) indicates the statement is factual without emotional connotation.

### 4. Mixed Sentiment Analysis
Analyze text with mixed positive and negative elements.

```excel
=VADER_SENTIMENT("While the product quality is excellent, the shipping was delayed which was disappointing.")
```
**Output:** `0.1901`

The slightly positive score indicates that the text contains both positive and negative elements, with the positive aspects slightly outweighing the negative ones.