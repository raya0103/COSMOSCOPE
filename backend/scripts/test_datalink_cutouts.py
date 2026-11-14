import requests
import io
from astropy.io.votable import parse_single_table

targets_ids = [
    ('R Draconis', 'https://irsa.ipac.caltech.edu/datalink/links/spherex?ID=ivo://irsa.ipac/spherex_qr2_deep?2025W17_4B_0021_1/D3', 248.16750, 66.75500),
    ('Barnard', 'https://irsa.ipac.caltech.edu/datalink/links/spherex?ID=ivo://irsa.ipac/spherex_qr2?2025W33_2C_0321_1/D6', 269.45208, 4.69333),
    ('RW Aur', 'https://irsa.ipac.caltech.edu/datalink/links/spherex?ID=ivo://irsa.ipac/spherex_qr2?2025W36_1A_0095_1/D4', 76.95642, 30.40142),
    ('Eps Indi', 'https://irsa.ipac.caltech.edu/datalink/links/spherex?ID=ivo://irsa.ipac/spherex_qr2?2025W17_4B_0017_1/D2', 331.04375, -56.78278)
]

for name, dl_url, ra, dec in targets_ids:
    try:
        r = requests.get(dl_url, timeout=30)
        tab = parse_single_table(io.BytesIO(r.content)).to_table()
        cutout_path = None
        for row in tab:
            if row['col_4'] == '#cutout' and row['col_12']:
                cutout_path = str(row['col_12']).strip()
                break
            elif row['col_4'] == '#this' and row['col_1']:
                u = str(row['col_1']).strip()
                if '/ibe/data/' in u:
                    cutout_path = u.split('/ibe/data/')[1]
                    break
        print(f"{name}: Resolved path = {cutout_path}")
        if cutout_path:
            cutout_url = f"https://irsa.ipac.caltech.edu/ibe/data/{cutout_path}?center={ra},{dec}&size=0.05"
            # Note: IBE returns 200 on GET, HEAD might not be supported by IBE server
            resp = requests.get(cutout_url, stream=True, timeout=30)
            print(f"  Cutout GET status: {resp.status_code}, content-type: {resp.headers.get('Content-Type')}, content-length: {resp.headers.get('Content-Length')}")
    except Exception as e:
        print(f"{name} Error: {e}")
