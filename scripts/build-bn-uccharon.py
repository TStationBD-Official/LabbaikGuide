"""
Builds per-surah Bengali pronunciation (উচ্চারণ) files from the
"বাংলা উচ্চারণ" edition in github.com/drmiaji/QuranTranslations (commit pinned
below). The source does not name its author; it is shown in the app as a
reading aid with that stated, never as a substitute for learning recitation.

Cleaning is limited to removing things that are not pronunciation:
footnote tags and markers, editorial notes in brackets ("(ছিজদাহ-n)", a
madhhab note on Al-Fatihah), stray non-Bengali characters from an encoding
error (97:5), and a space wrongly placed before a Bengali vowel sign
("ইউহ ীতূনা" → "ইউহীতূনা"). Verses whose source text is damaged are left
out (null) rather than repaired by guesswork; the app says so for them.

Usage: python3 scripts/build-bn-uccharon.py <path-to-bn_transliteration.json>
"""
import json, os, re, sys

SOURCE_COMMIT = "a3da1592c6e3d4c4aad18cf051e4ac6580d48d7a"
HAFS_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
assert sum(HAFS_COUNTS) == 6236

# Source text is truncated and filled with garbage characters here: not shown.
DAMAGED = {(20, 47)}

def clean(t: str) -> str:
    t = re.sub(r"<fn[^>]*>.*?</fn>", "", t)
    t = re.sub(r"\((?:ছিজদাহ|সিজদাহ)[^)]*\)", "", t)
    t = re.sub(r"\(হানাফী[^)]*\)", "", t)
    t = t.replace("*", "")
    t = re.sub(r"\(\s*[\u0370-\u03ff\s]+\)", " ", t)  # "( ϣ ϊ)" encoding debris
    t = re.sub(r"\s+([\u09be-\u09cc\u09d7])", r"\1", t)  # space before a vowel sign
    t = re.sub(r"\s+([।,])", r"\1", t)
    t = re.sub(r"\s{2,}", " ", t).strip()
    return t

src = json.load(open(sys.argv[1], encoding="utf-8"))["suras"]
assert len(src) == 114
out = os.path.join(os.path.dirname(__file__), "..", "public", "data", "bn-uccharon")
os.makedirs(out, exist_ok=True)
for i, s in enumerate(src):
    ayas = s["ayas"]
    assert int(s["index"]) == i + 1
    assert len(ayas) == HAFS_COUNTS[i], (i + 1, len(ayas))
    texts = []
    for n, a in enumerate(ayas, start=1):
        assert int(a["index"]) == n
        if (i + 1, n) in DAMAGED:
            texts.append(None)
            continue
        t = clean(a["translation"])
        assert t and not re.search(r"[<>()\[\]]", t), (i + 1, n, t)
        assert all("\u0980" <= c <= "\u09ff" or c in " ।,.-‘’'!?;:\u200c\u200d" for c in t), (i + 1, n, t)
        texts.append(t)
    with open(os.path.join(out, f"{i + 1}.json"), "w", encoding="utf-8") as f:
        json.dump(texts, f, ensure_ascii=False, separators=(",", ":"))
with open(os.path.join(out, "source.json"), "w", encoding="utf-8") as f:
    json.dump({"source": f"github.com/drmiaji/QuranTranslations@{SOURCE_COMMIT} inventory/translations/bn/bn_transliteration.json", "author": None}, f)
print("ok")
