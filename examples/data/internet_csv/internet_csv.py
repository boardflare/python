import csv
import io
import requests


def internet_csv(url):
    """
    Fetches a CSV file from the internet (with CORS proxy) and returns its contents as a 2D list.

    Args:
        url (str): The direct URL to the CSV file.

    Returns:
        list[list[str]]: 2D list representing the CSV contents, where each sublist is a row.

    Raises:
        ValueError: If the URL is invalid or the content cannot be parsed as CSV.
    """
    if not isinstance(url, str) or not url.strip():
        raise ValueError("A non-empty URL string must be provided.")

    cors_url = f"https://cors.boardflare.com/{url}"
    try:
        response = requests.get(cors_url)
        response.raise_for_status()
        content = response.text
        reader = csv.reader(io.StringIO(content))
        data = [row for row in reader]
        if not data:
            raise ValueError("CSV file is empty or could not be parsed.")
        return data
    except Exception as e:
        raise ValueError(f"Failed to fetch or parse CSV: {e}")
