import json, urllib.request, urllib.parse, time
Q = {
 "arafat": ("جبل الرحمة|Rahmah|Rahma|Mercy", "21.350,39.978,21.360,39.990"),
 "qiblatayn": ("القبلتين|Qiblat", "24.480,39.574,24.488,39.584"),
 "badr": ("شهداء|Martyrs|Badr|بدر|العريش|Arish", "23.60,38.60,23.90,38.95"),
 "balad": ("نصيف|Nasseef|Naseef|Nassif|باب مكة|Bab Makkah", "21.470,39.170,21.500,39.200"),
}
out = {}
for k, (pat, bb) in Q.items():
    s, w, n, e = bb.split(",")
    q = f'[out:json][timeout:25];(nwr["name"~"{pat}",i]({s},{w},{n},{e});nwr["name:en"~"{pat}",i]({s},{w},{n},{e}););out center tags 25;'
    for url in ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter"]:
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "LabbaikGuide/1.0 (data check)"})
            d = json.load(urllib.request.urlopen(req, timeout=40))
            out[k] = [{"id": f'{x["type"][0]}{x["id"]}', "lat": x.get("lat") or x.get("center", {}).get("lat"), "lon": x.get("lon") or x.get("center", {}).get("lon"),
                       "name": x.get("tags", {}).get("name"), "en": x.get("tags", {}).get("name:en"), "kind": {kk: x["tags"][kk] for kk in ("amenity","tourism","historic","natural","landuse","building","religion","highway","place") if kk in x.get("tags", {})}} for x in d["elements"]]
            break
        except Exception as ex:
            out[k] = {"error": str(ex)}
            time.sleep(5)
    time.sleep(4)
json.dump(out, open("zdata/osm4.json", "w"), ensure_ascii=False, indent=1)
