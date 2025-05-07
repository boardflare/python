import pytest
import onedrive_csv
from onedrive_csv import onedrive_csv
import os

def acquire_graph_token_device_code():
    import msal
    # Hard-coded values
    client_id = "3e747674-29a3-46ec-be9e-faa584989c87"
    tenant_id = "30520885-0a26-49e9-a66d-b53f7e1f958b"
    scopes = ["Files.ReadWrite"]
    cache_path = os.path.join(os.path.dirname(__file__), ".msal_cache.json")
    # Set up persistent token cache
    cache = msal.SerializableTokenCache()
    if os.path.exists(cache_path):
        with open(cache_path, "rb") as f:
            cache.deserialize(f.read())
    app = msal.PublicClientApplication(
        client_id=client_id,
        authority=f"https://login.microsoftonline.com/{tenant_id}",
        token_cache=cache
    )
    accounts = app.get_accounts()
    if accounts:
        # Try to acquire token silently
        result = app.acquire_token_silent(scopes, account=accounts[0])
        if result and "access_token" in result:
            return result["access_token"]
    # If silent fails, use device code flow
    flow = app.initiate_device_flow(scopes=scopes)
    if "user_code" not in flow:
        raise Exception(f"Failed to create device flow: {flow}")
    print(f"To sign in, use a web browser to open {flow['verification_uri']} and enter the code: {flow['user_code']}")
    result = app.acquire_token_by_device_flow(flow)
    if "access_token" in result:
        # Save updated cache
        with open(cache_path, "wb") as f:
            f.write(cache.serialize().encode("utf-8"))
        return result["access_token"]
    else:
        raise Exception(f"Could not acquire token: {result}")

def test_data():
    # Acquire token using MSAL device code flow with persistent cache relative to this script
    # Set token in the onedrive_csv module's global namespace
    token = acquire_graph_token_device_code()
    # This sets the token in the module where the onedrive_csv function is defined
    onedrive_csv.__globals__["graphToken"] = token
    onedrive_csv("/Documents/data.csv")

# Use:  python -m pytest -s examples/text/onedrive_csv/test_onedrive_csv.py if token refresh is needed

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
