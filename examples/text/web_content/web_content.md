# Web Content

## Overview

This function fetches the content of a web page and returns it in Markdown format using the Jina Reader API (https://jina.ai/reader/). It's useful as a starting point for extracting specific information, summarizing content, or other text processing tasks.

## Usage

Fetches the content from the specified URL.

```excel
=WEB_CONTENT(url)
```

Arguments:

| Argument | Type   | Description                                  |
|----------|--------|----------------------------------------------|
| `url`    | string | The full URL of the web page to fetch.       |

Returns:

| Return Value | Type   | Description                                                                    |
|--------------|--------|--------------------------------------------------------------------------------|
| Content      | string | The main content of the web page in Markdown format, extracted by Jina Reader. |

## Examples

### 1. Company Analysis
Extract content from a company page to analyze their business model.

```excel
=WEB_CONTENT("https://www.ycombinator.com/companies/airbnb")
```

**Sample Output:**
The function returns the extracted content about Airbnb, including information about their accommodation marketplace, business model, and company history.

### 2. News Article Extraction
Extract content from a news article for summarization.

```excel
=WEB_CONTENT("https://techcrunch.com/category/startups/")
```

**Sample Output:**
The function returns the latest startup news articles from TechCrunch, including company announcements, funding rounds, and industry trends.

### 3. Educational Research
Extract content from an educational page for research.

```excel
=WEB_CONTENT("https://en.wikipedia.org/wiki/Microsoft_Excel")
```

**Sample Output:**
The function returns detailed information about Microsoft Excel, including its features, history, and capabilities as a spreadsheet application.