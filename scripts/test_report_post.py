import json
import urllib.request

url='http://127.0.0.1:8000/bd_logic/api/v1/report'
data=json.dumps({'user_id':1,'student_name':'Karri Vishnu'}).encode('utf-8')
req=urllib.request.Request(url,data=data,headers={'Content-Type':'application/json'})
try:
    resp=urllib.request.urlopen(req,timeout=10)
    print('STATUS', resp.status)
    print(resp.read().decode())
except urllib.error.HTTPError as e:
    print('HTTP', e.code)
    print(e.read().decode())
except Exception as ex:
    print('ERR', ex)
