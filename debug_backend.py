import traceback

try:
    from fastapi.testclient import TestClient
    from Backend.main import app
    client = TestClient(app)
    print('root status:', client.get('/').status_code)
    print('root body:', client.get('/').text)
    resp = client.get('/bd_logic/api/v1/health')
    print('bd_logic status:', resp.status_code)
    print('bd_logic body:', resp.text)
except Exception as e:
    traceback.print_exc()
