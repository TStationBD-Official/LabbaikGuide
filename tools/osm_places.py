import json, urllib.request, urllib.parse, time
Q = {
 "hira": ("غار حراء|Hira Cave|Cave of Hira|جبل النور|Jabal al-Nour|Jabal An Nour", "21.450,39.852,21.465,39.870"),
 "thawr": ("غار ثور|Thawr|جبل ثور", "21.365,39.840,21.390,39.862"),
 "mualla": ("المعلاة|Mualla|Ma'la|Maala", "21.430,39.822,21.445,39.836"),
 "jinn": ("مسجد الجن|Jinn", "21.428,39.822,21.440,39.836"),
 "aisha": ("التنعيم|عائشة|Aisha|Taneem|Tan'im", "21.455,39.790,21.480,39.812"),
 "mina": ("مسجد الخيف|Khayf|Khaif|Kheif", "21.405,39.880,21.425,39.900"),
 "muzdalifah": ("المشعر الحرام|Mash.ar", "21.375,39.900,21.395,39.925"),
 "arafat": ("جبل الرحمة|Rahmah|Rahma|مسجد نمرة|Namira", "21.340,39.955,21.365,39.995"),
 "exhibition": ("عمارة الحرمين|Architecture|معرض", "21.425,39.745,21.445,39.765"),
 "quba": ("مسجد قباء|Quba", "24.432,39.610,24.446,39.624"),
 "qiblatayn": ("القبلتين|Qibl", "24.478,39.572,24.490,39.586"),
 "baqi": ("البقيع|بقيع|Baqi", "24.462,39.610,24.472,39.622"),
 "seven": ("المساجد السبعة|مسجد الفتح|Fath|Seven|سلمان|Salman", "24.470,39.588,24.484,39.604"),
 "ghamama": ("الغمامة|Ghamam", "24.460,39.600,24.472,39.614"),
 "ijabah": ("الإجابة|الاجابة|Ijab", "24.466,39.612,24.478,39.624"),
 "miqat": ("ذو الحليفة|ذي الحليفة|الميقات|Miqat|Meeqat|الشجرة|Hulay|Hulai", "24.400,39.530,24.425,39.555"),
 "badr": ("شهداء بدر|Badr|بدر|العريش", "23.700,38.740,23.760,38.800"),
 "khaybar": ("خيبر|Khaybar|Khaibar|مرحب|Marhab", "25.680,39.270,25.720,39.320"),
 "balad": ("نصيف|Nasseef|Naseef|باب مكة|Bab Makkah|Al-Balad|البلد", "21.475,39.175,21.495,39.195"),
}
out = {}
for k, (pat, bb) in Q.items():
    s, w, n, e = bb.split(",")
    q = f'[out:json][timeout:25];(nwr["name"~"{pat}",i]({s},{w},{n},{e});nwr["name:en"~"{pat}",i]({s},{w},{n},{e}););out center tags 25;'
    for url in ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]:
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "LabbaikGuide/1.0 (data check)"})
            d = json.load(urllib.request.urlopen(req, timeout=40))
            out[k] = [{"id": f'{x["type"][0]}{x["id"]}', "lat": x.get("lat") or x.get("center", {}).get("lat"), "lon": x.get("lon") or x.get("center", {}).get("lon"),
                       "name": x.get("tags", {}).get("name"), "en": x.get("tags", {}).get("name:en"), "kind": {kk: x["tags"][kk] for kk in ("amenity","tourism","historic","natural","landuse","building","religion","highway","place") if kk in x.get("tags", {})}} for x in d["elements"]]
            break
        except Exception as ex:
            out[k] = {"error": str(ex)}
    time.sleep(1)
json.dump(out, open("zdata/osm2.json", "w"), ensure_ascii=False, indent=1)
