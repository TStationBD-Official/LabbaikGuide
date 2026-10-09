import json, urllib.request, urllib.parse, time
Q = {
 "thawr": ("غار ثور|Thawr|جبل ثور", "21.365,39.840,21.390,39.862"),
 "mina": ("الخيف|Khayf|Khaif|Kheif|Khief|Jamarat|الجمرات", "21.405,39.880,21.425,39.900"),
 "arafat": ("جبل الرحمة|Rahmah|Rahma|مسجد نمرة|Namira", "21.340,39.955,21.365,39.995"),
 "exhibition": ("عمارة الحرمين|Architecture|معرض", "21.425,39.745,21.445,39.765"),
 "qiblatayn": ("القبلتين|Qibl", "24.478,39.572,24.490,39.586"),
 "seven": ("المساجد السبعة|مسجد الفتح|Fath|Seven|سلمان|Salman", "24.470,39.588,24.484,39.604"),
 "ijabah": ("الإجابة|الاجابة|Ijab", "24.466,39.612,24.478,39.624"),
 "badr": ("شهداء بدر|Badr|بدر|العريش", "23.700,38.740,23.760,38.800"),
 "khaybar": ("خيبر|Khaybar|Khaibar|مرحب|Marhab", "25.680,39.270,25.720,39.320"),
 "balad": ("نصيف|Nasseef|Naseef|باب مكة|Bab Makkah|Al-Balad|البلد", "21.475,39.175,21.495,39.195"),
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
json.dump(out, open("zdata/osm3.json", "w"), ensure_ascii=False, indent=1)
