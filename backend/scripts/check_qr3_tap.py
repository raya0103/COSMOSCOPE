import requests

url = "https://irsa.ipac.caltech.edu/TAP/sync"
q = "SELECT TOP 5 obs_id, obs_collection, t_min, s_ra, s_dec FROM spherex.obscore WHERE obs_collection LIKE '%qr3%'"
try:
    r = requests.post(url, data={"QUERY": q, "FORMAT": "csv"}, timeout=20)
    print("QR3 in TAP result:")
    print(r.text)
except Exception as e:
    print("Error:", e)

# Also check tables in tap_schema that might be QR3 specific
q2 = "SELECT table_name FROM tap_schema.tables WHERE table_name LIKE '%qr3%'"
try:
    r2 = requests.post(url, data={"QUERY": q2, "FORMAT": "csv"}, timeout=20)
    print("QR3 tables in TAP:")
    print(r2.text)
except Exception as e:
    print("Error q2:", e)
