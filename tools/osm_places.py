import json, urllib.request, urllib.parse, time
Q = {
 "uhud_martyrs": ("مقبرة شهداء أحد|Martyrs of Uhud|Uhud Martyrs|شهداء أحد", "24.48,39.59,24.53,39.64"),
 "shuhada_mosque": ("مسجد سيد الشهداء|Sayyid al-Shuhada|Sayed Al Shuhada", "24.48,39.59,24.53,39.64"),
 "rumah_hill": ("جبل الرماة|Archers|Jabal al-Rumat|Rumat", "24.48,39.59,24.53,39.64"),
 "uhud_peak": ("^جبل أحد$|^Mount Uhud$|^Uhud$|^جبل احد$", "24.48,39.57,24.56,39.68"),
 "ibnabbas": ("مسجد عبد ?الله بن عباس|Abdullah Ibn Abbas|Ibn Abbas Mosque", "21.20,40.35,21.33,40.47"),
}
out = {}
for k, (pat, bb) in Q.items():
    s, w, n, e = bb.split(",")
    q = f'[out:json][timeout:25];(nwr["name"~"{pat}",i]({s},{w},{n},{e});nwr["name:en"~"{pat}",i]({s},{w},{n},{e});nwr["name:ar"~"{pat}",i]({s},{w},{n},{e}););out center tags 15;'
    for url in ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]:
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "LabbaikGuide/1.0 (data check)"})
            d = json.load(urllib.request.urlopen(req, timeout=35))
            out[k] = [{"id": f'{x["type"][0]}{x["id"]}', "lat": x.get("lat") or x.get("center", {}).get("lat"), "lon": x.get("lon") or x.get("center", {}).get("lon"),
                       "name": x.get("tags", {}).get("name"), "en": x.get("tags", {}).get("name:en"), "kind": {kk: x["tags"][kk] for kk in ("amenity","tourism","historic","natural","landuse","building","religion","wikidata") if kk in x.get("tags", {})}} for x in d["elements"]]
            break
        except Exception as ex:
            out[k] = {"error": str(ex)}
    time.sleep(1)
json.dump(out, open("zdata/osm.json", "w"), ensure_ascii=False, indent=1)
