import json, urllib.request, urllib.parse, time
Q = {
 "uhud_martyrs": ("مقبرة شهداء أحد|Martyrs of Uhud|Uhud Martyrs|شهداء أحد", "24.48,39.59,24.53,39.64"),
 "shuhada_mosque": ("مسجد سيد الشهداء|Sayyid al-Shuhada|Sayed Al Shuhada", "24.48,39.59,24.53,39.64"),
 "rumah_hill": ("جبل الرماة|Archers|Jabal al-Rumat|Rumat", "24.48,39.59,24.53,39.64"),
 "uhud_peak": ("^جبل أحد$|^Mount Uhud$|^Uhud$|^جبل احد$", "24.48,39.57,24.56,39.68"),
 "jumuah": ("مسجد الجمعة|Jumu.?ah Mosque|Masjid al-Jum", "24.40,39.55,24.50,39.66"),
 "fath": ("مسجد الفتح|Al-Fath Mosque|Masjid al-Fath", "24.46,39.58,24.49,39.61"),
 "jiranah": ("الجعرانة|Ji.?ranah|Jaranah|Jeranah", "21.50,39.90,21.70,40.10"),
 "khayf": ("مسجد الخيف|Khayf|Khaif|Kheif", "21.40,39.87,21.43,39.90"),
 "hudaybiyah": ("الحديبية|Hudaybiy|Hudaibiy|الشميسي", "21.35,39.55,21.50,39.75"),
 "hira_district": ("حي حراء الثقافي|Hira Cultural|Revelation Exhibition|معرض الوحي", "21.44,39.84,21.47,39.88"),
 "hira_cave": ("غار حراء|Cave of Hira|Hira Cave", "21.44,39.84,21.47,39.88"),
 "thawr_cave": ("غار ثور|Cave of Thawr|Thawr Cave", "21.36,39.83,21.39,39.87"),
 "ibnabbas": ("مسجد عبد ?الله بن عباس|Abdullah Ibn Abbas|Ibn Abbas Mosque", "21.20,40.35,21.33,40.47"),
 "addas": ("مسجد عداس|Addas", "21.15,40.30,21.35,40.50"),
 "qiblatayn": ("مسجد القبلتين|Qiblatain|Qiblatayn", "24.47,39.56,24.50,39.60"),
 "quba": ("مسجد قباء|Quba Mosque|Masjid Quba", "24.43,39.60,24.45,39.63"),
 "ghamama": ("مسجد الغمامة|Ghamama", "24.46,39.60,24.47,39.62"),
 "ijabah": ("مسجد الإجابة|مسجد الاجابة|Ijabah|Ijaba", "24.46,39.61,24.48,39.63"),
 "ruma": ("بئر رومة|بئر عثمان|Rumah|Ruma Well|Bir Uthman", "24.48,39.55,24.53,39.62"),
 "darmadinah": ("دار المدينة|Dar Al Madinah|Dar Al-Madinah", "24.42,39.55,24.52,39.65"),
 "aisha": ("مسجد التنعيم|مسجد عائشة|Aisha Mosque|Masjid Aisha|Taneem|Tan.?im", "21.45,39.78,21.49,39.82"),
 "jinn": ("مسجد الجن|Masjid al-Jinn|Mosque of the Jinn", "21.42,39.82,21.45,39.84"),
 "mualla": ("مقبرة المعلاة|Mualla|Ma.?la", "21.42,39.82,21.45,39.84"),
 "kiswa": ("مجمع الملك عبدالعزيز لكسوة الكعبة|Kiswa|كسوة", "21.40,39.70,21.50,39.80"),
 "exhibition": ("معرض عمارة الحرمين|Two Holy Mosques Architecture|متحف الحرمين", "21.40,39.70,21.50,39.80"),
 "badr_martyrs": ("شهداء بدر|Badr Martyrs|Martyrs of Badr|مقبرة شهداء بدر", "23.60,38.65,23.85,38.90"),
 "arish_badr": ("مسجد العريش|Al-Arish|Areesh", "23.60,38.65,23.85,38.90"),
 "miqat": ("ذو الحليفة|ميقات|Dhul? ?Hulai|Abyar Ali|أبيار علي", "24.38,39.50,24.45,39.58"),
}
out = {}
for k, (pat, bb) in Q.items():
    s, w, n, e = bb.split(",")
    q = f'[out:json][timeout:60];(nwr["name"~"{pat}",i]({s},{w},{n},{e});nwr["name:en"~"{pat}",i]({s},{w},{n},{e});nwr["name:ar"~"{pat}",i]({s},{w},{n},{e}););out center tags 15;'
    for url in ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]:
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "LabbaikGuide/1.0 (data check)"})
            d = json.load(urllib.request.urlopen(req, timeout=90))
            out[k] = [{"id": f'{x["type"][0]}{x["id"]}', "lat": x.get("lat") or x.get("center", {}).get("lat"), "lon": x.get("lon") or x.get("center", {}).get("lon"),
                       "name": x.get("tags", {}).get("name"), "en": x.get("tags", {}).get("name:en"), "kind": {kk: x["tags"][kk] for kk in ("amenity","tourism","historic","natural","landuse","building","religion","wikidata") if kk in x.get("tags", {})}} for x in d["elements"]]
            break
        except Exception as ex:
            out[k] = {"error": str(ex)}
    time.sleep(1)
json.dump(out, open("zdata/osm.json", "w"), ensure_ascii=False, indent=1)
