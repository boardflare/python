import requests

url = "https://api.brightdata.com/request"

payload = {
    "zone": "datacenter_proxy1",
    "url": "https://geo.brdtest.com/welcome.txt?product=dc&method=native",
    "format": "raw",
}
headers = {
    "Authorization": "Bearer e1f3c7aad5874ab44b4115ff7020d6ace020fc53d1adb49c634ef1e95f8e636c",
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)