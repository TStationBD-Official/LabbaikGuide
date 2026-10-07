"""
Builds per-surah JSON for the other riwayat (readings) from the official
King Fahd Glorious Quran Printing Complex (KFGQPC) Unicode data, as published in
github.com/thetruetruth/quran-data-kfgqpc (commit pinned below).

The Quran text is copied exactly; only surrounding whitespace is trimmed.
Each reading keeps its own verse numbering (e.g. Warsh has 6214 verses).

Usage: python3 scripts/build-riwayat.py <path-to-checkout>
"""
import json, os, sys

SOURCE_COMMIT = "281dbbe8eed1370daa5a023b6cd81655cbfd6473"
FILES = {
    "warsh": "warsh/data/warshData_v10.json",
    "qaloon": "qaloon/data/QaloonData_v10.json",
    "shouba": "shouba/data/ShoubaData08.json",
    "doori": "doori/data/DooriData_v09.json",
    "soosi": "soosi/data/SoosiData09.json",
    "bazzi": "bazzi/data/BazziData_v07.json",
    "qumbul": "qumbul/data/QumbulData_v07.json",
}
EXPECTED = {"warsh": 6214, "qaloon": 6214, "shouba": 6236, "doori": 6217, "soosi": 6217, "bazzi": 6220, "qumbul": 6220}

src = sys.argv[1]
out_root = os.path.join(os.path.dirname(__file__), "..", "public", "data", "riwayat")
index = {"source": f"KFGQPC via github.com/thetruetruth/quran-data-kfgqpc@{SOURCE_COMMIT}", "riwayat": {}}
for rid, rel in FILES.items():
    rows = json.load(open(os.path.join(src, rel), encoding="utf-8"))
    assert len(rows) == EXPECTED[rid], (rid, len(rows))
    by_sura = {}
    for r in rows:
        s = int(r["sura_no"])
        text = r["aya_text"].strip()
        assert text, (rid, s, r["aya_no"])
        by_sura.setdefault(s, {"s": s, "name": r["sura_name_ar"].strip(), "nameEn": r["sura_name_en"].strip(), "ayahs": []})
        by_sura[s]["ayahs"].append([int(r["aya_no"]), text, int(str(r["page"]).split("-")[0]), int(str(r["jozz"]).split("-")[0])])
    assert sorted(by_sura) == list(range(1, 115)), rid
    os.makedirs(os.path.join(out_root, rid), exist_ok=True)
    counts = []
    for s, data in sorted(by_sura.items()):
        nums = [a[0] for a in data["ayahs"]]
        assert nums == list(range(1, len(nums) + 1)), (rid, s)
        counts.append(len(nums))
        with open(os.path.join(out_root, rid, f"{s}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    # The basmala heading uses this reading's own orthography, taken verbatim from An-Naml 27:30.
    basmala = None
    for a in by_sura[27]["ayahs"]:
        w = a[1].split()
        if len(w) >= 5 and w[-5].startswith("بِس"):
            basmala = " ".join(w[-5:-1])
    assert basmala, rid
    if "surahs" not in index:
        index["surahs"] = [{"ar": by_sura[i]["name"], "en": by_sura[i]["nameEn"]} for i in range(1, 115)]
    index["riwayat"][rid] = {"total": len(rows), "counts": counts, "basmala": basmala}
with open(os.path.join(out_root, "index.json"), "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False, separators=(",", ":"))
print("ok", {k: v["total"] for k, v in index["riwayat"].items()})
