import requests

r = requests.post('http://127.0.0.1:8000/api/observations/search', json={'ra': 248.16750, 'dec': 66.75500, 'fov_arcmin': 3.0, 'target_name': 'R Draconis'}).json()
obs0 = r['observations'][0]
print("OBS 0:", obs0['obs_id'], "Det:", obs0['detector'])
img = requests.get(f"http://127.0.0.1:8000/api/images/{obs0['obs_id']}", params={'ra': 248.16750, 'dec': 66.75500, 'detector': obs0['detector']}).json()
print("Photometry:", img.get('photometry'))
print("Max flux:", img.get('max_flux'), "Median flux:", img.get('median_flux'))
