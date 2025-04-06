# add settings option to set proxy URL and auth as a globals in JS 
# modify this code to conditionally set the proxy URL and auth header based on the globals

"""
Proxy patching for pyodide-http.  This adds proxy functionality to pyodide-http by prepending a proxy URL to all outgoing requests.

"""
# import and patch pyodide_http may have already been done in the worker script
import pyodide_http
pyodide_http.patch_all()

from pyodide_http import _core
from urllib.parse import urljoin

# Replace these values with globals set in JS.
proxy_url = "https://my-proxy.example.com/"
auth_header = "Boardflare-AuthToken"
auth_value = "YOUR_AUTH_TOKEN_HERE"  # Replace with your actual auth token

# Store the original send function
original_send = _core.send

def proxied_send(request, stream=False):
    """Wrapper that prepends the proxy URL and adds header."""
    original_url = request.url
    # Transform the URL by prepending the proxy URL
    request.url = urljoin(proxy_url, request.url)
    
    # Add the preset auth_header to the request
    request.headers[auth_header] = auth_value
    
    response = original_send(request, stream)
    request.url = original_url
    return response

# Assuming pyodide_http.patch_all() has already been called, patch core.send function
_core.send = proxied_send
