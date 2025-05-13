import requests
import csv
import io
import pandas as pd

def onedrive_csv(file_path):
    """
    Loads a CSV file from OneDrive using the global graphToken variable and returns its contents as a 2D list.

    Args:
        file_path (str): The path to the CSV file in the user's OneDrive (e.g., '/Documents/data.csv').

    Returns:
        list: 2D list representing the CSV file's contents.

    Raises:
        Exception: If the file cannot be retrieved or parsed.
    """
    # Use global graphToken if available
    token = None
    try:
        token = globals()["graphToken"]
    except KeyError:
        token = None
    if not token:
        return "Microsoft Graph token is not set. Please click login button next to OneDrive in Functions tab."
    if not file_path or not isinstance(file_path, str):
        raise Exception("A valid file_path string must be provided.")

    url = f"https://graph.microsoft.com/v1.0/me/drive/root:{file_path}:/content"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "text/csv"
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to retrieve file: {response.status_code} {response.text}")

    csv_content = response.content.decode('utf-8')
    # You could also use pandas to read the CSV content into a DataFrame
    df = pd.read_csv(io.StringIO(csv_content))
    print(df.head())

    # For demo puposes, we will convert the CSV content to a 2D list
    reader = csv.reader(io.StringIO(csv_content))
    table = [row for row in reader]
    return table
