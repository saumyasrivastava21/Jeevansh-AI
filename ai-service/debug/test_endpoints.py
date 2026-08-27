import urllib.request
import json

def test_endpoints():
    endpoints = {
        "Root": "http://localhost:8000/",
        "Models": "http://localhost:8000/models",
        "Report Health": "http://localhost:8000/api/v1/report/health",
        "System Health": "http://localhost:8000/health"
    }
    
    print("=== Testing FastAPI Endpoints ===")
    for name, url in endpoints.items():
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                print(f"[{name}] URL: {url} -> Status: {status}")
                parsed = json.loads(body)
                print(json.dumps(parsed, indent=2))
        except Exception as e:
            print(f"[{name}] URL: {url} -> Failed: {str(e)}")
        print("-" * 50)

if __name__ == "__main__":
    test_endpoints()
