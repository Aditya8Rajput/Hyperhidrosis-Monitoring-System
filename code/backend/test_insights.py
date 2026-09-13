import requests, json, sys
url='http://127.0.0.1:8000/api/ai/insights'
resp=requests.post(url, json=[])
print('status', resp.status_code)
print('text', resp.text)
