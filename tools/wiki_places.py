import json, urllib.request, urllib.parse, time
TITLES = {
 "hira": "Hira", "nour": "Jabal al-Nour", "thawr": "Jabal Thawr", "mualla": "Jannat al-Mu'alla", "mina": "Mina, Saudi Arabia",
 "arafat": "Mount Arafat", "muzdalifah": "Muzdalifah", "jinn": "Masjid al-Jinn", "aisha": "Masjid Aisha", "jiranah": "Al-Ji'ranah Mosque",
 "khayf": "Al-Khayf Mosque", "namirah": "Namirah Mosque", "jamarat": "Jamaraat Bridge", "mashar": "Al-Mash'ar al-Haram Mosque",
 "hiradistrict": "Hira Cultural District", "exhibition": "Exhibition of the Two Holy Mosques Architecture",
 "quba": "Quba Mosque", "qiblatayn": "Masjid al-Qiblatayn", "uhud": "Mount Uhud", "shuhada": "Sayyid al-Shuhada Mosque",
 "baqi": "Al-Baqi Cemetery", "sevenmosques": "Seven Mosques", "ghamama": "Al-Ghamama Mosque", "ijabah": "Al-Ijabah Mosque",
 "jumuah": "Jumu'ah Mosque", "ruma": "Well of Rumah", "darmadinah": "Dar Al Madinah Museum", "khandaq": "Battle of the Trench",
 "taif": "Taif", "ibnabbas": "Abdullah ibn Abbas Mosque", "badr": "Badr, Saudi Arabia", "battlebadr": "Battle of Badr",
 "khaybar": "Khaybar", "hudaybiyyah": "Al-Hudaybiyah", "balad": "Al-Balad, Jeddah", "addas": "Addas Mosque", "miqat": "Dhu al-Hulayfah",
}
UA = {"User-Agent": "LabbaikGuide/1.0 (https://labbaikguide.vercel.app; data check)"}
SEARCH = {"hira": "Cave of Hira", "jinn": "Mosque of the Jinn Mecca", "aisha": "Masjid Aisha Tan'im Mecca", "jiranah": "Ji'ranah mosque Mecca miqat",
 "khayf": "Masjid al-Khayf Mina", "namirah": "Namirah Mosque Arafat", "hiradistrict": "Hira Cultural District Mecca", "exhibition": "Exhibition of the Two Holy Mosques Architecture Mecca museum",
 "shuhada": "Uhud martyrs cemetery Sayyid al-Shuhada mosque", "sevenmosques": "Seven Mosques Medina", "ghamama": "Al-Ghamamah Mosque Medina",
 "jumuah": "Masjid al-Jumu'ah Medina", "ruma": "Well of Rumah Uthman Medina", "darmadinah": "Dar Al Madinah museum", "ibnabbas": "Abdullah ibn Abbas Mosque Taif",
 "hudaybiyyah": "Hudaybiyyah Shumaisi mosque", "addas": "Masjid Addas Taif", "miqat": "Dhu al-Hulayfah mosque Medina miqat", "uhud": "Mount Uhud"}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)

def search(q):
    d = get("https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "list": "search", "srsearch": q, "srlimit": 3}))
    return [x["title"] for x in d["query"]["search"]]

def fetch(title):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "redirects": 1, "titles": title, "prop": "coordinates|pageimages|extracts|info|description",
        "piprop": "name|original", "exintro": 1, "explaintext": 1, "exsentences": 6, "inprop": "url"})
    d = get("https://en.wikipedia.org/w/api.php?" + q)
    page = next(iter(d["query"]["pages"].values()))
    rec = {"title": page.get("title"), "missing": "missing" in page, "url": page.get("fullurl"), "desc": page.get("description"),
           "coords": page.get("coordinates"), "image": page.get("pageimage"), "extract": page.get("extract")}
    if rec["image"]:
        q2 = urllib.parse.urlencode({"action": "query", "format": "json", "titles": "File:" + rec["image"], "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 960})
        for host in ("commons.wikimedia.org", "en.wikipedia.org"):
            p2 = next(iter(get(f"https://{host}/w/api.php?" + q2)["query"]["pages"].values()))
            ii = (p2.get("imageinfo") or [{}])[0]
            if ii.get("thumburl"):
                md = ii.get("extmetadata", {})
                rec["img"] = {"thumb": ii.get("thumburl"), "page": ii.get("descriptionurl"), "w": ii.get("thumbwidth"), "h": ii.get("thumbheight"),
                    "artist": md.get("Artist", {}).get("value"), "license": md.get("LicenseShortName", {}).get("value"), "licenseUrl": md.get("LicenseUrl", {}).get("value"), "host": host}
                break
    return rec

out = {}
for key, title in TITLES.items():
    try:
        rec = fetch(title)
        good = not rec["missing"] and rec.get("coords") and rec.get("img")
        if not good and key in SEARCH:
            for t in search(SEARCH[key])[:2]:
                r2 = fetch(t)
                if not r2["missing"]:
                    r2["searched"] = SEARCH[key]
                    rec = r2
                    break
        out[key] = rec
    except Exception as e:
        out[key] = {"error": str(e), "title": title}
    time.sleep(0.3)
json.dump(out, open("zdata/wiki.json", "w"), ensure_ascii=False, indent=1)
