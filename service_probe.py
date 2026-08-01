import urllib.request
import urllib.error

urls = [
    "http://127.0.0.1:8000/",
    "http://127.0.0.1:8000/bd_logic/api/v1/health",
    "http://127.0.0.1:8001/health",
    "http://127.0.0.1:8002/api/v1/health",
]

for url in urls:
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            print(url, r.status)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        print(url, "HTTPError", e.code, body)
    except Exception as e:
        print(url, "ERROR", type(e).__name__, e)
