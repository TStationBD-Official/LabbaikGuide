import json, urllib.request
out={}
for v in ["eC4LfEVxvKg","Rs7St51oDDc"]:
    try:
        r=urllib.request.urlopen(f"https://www.youtube.com/oembed?url=https%3A//www.youtube.com/watch%3Fv%3D{v}&format=json",timeout=20); out[v]=[r.status, json.loads(r.read())]
    except urllib.error.HTTPError as e: out[v]=[e.code]
json.dump(out,open("zdata/yt2.json","w"),ensure_ascii=False,indent=1)
