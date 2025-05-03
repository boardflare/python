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