import requests

def web_content(url):
    """
    Returns web page content in markdown format using Jina.  Useful as a starting point for extraction, summarization, etc.

    Args:
        url (str): The full URL to fetch.

    Returns:
        str: The content of the response from the URL.
    """
    headers = {
        "X-Retain-Images": "none"
    }
    base_url = "https://r.jina.ai/"
    full_url = base_url + url
    response = requests.get(full_url, headers=headers)
    response.raise_for_status()
    # Extract content after 'Markdown Content:' marker
    try:
        content = response.text.split("Markdown Content:")[1]
    except IndexError:
        # Handle cases where the marker might not be present
        content = response.text 
    return content.strip() # Strip leading/trailing whitespace