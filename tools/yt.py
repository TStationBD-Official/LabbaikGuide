import re, json, urllib.request
H={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36","Accept-Language":"en-US,en;q=0.9","Cookie":"CONSENT=YES+1; SOCS=CAI"}
def get(u):
    try:
        r=urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30); return r.geturl(), r.read().decode("utf-8","ignore")
    except Exception as e: return None, str(e)
out={}
for name,u in {"quran_handle":"https://www.youtube.com/@SaudiQuranTv","sunnah_handle":"https://www.youtube.com/@SaudiSunnahTv"}.items():
    url,h=get(u); m=re.search(r'"channelId":"(UC[\w-]{22})"',h) or re.search(r'channel/(UC[\w-]{22})',h)
    out[name]={"channelId": m.group(1) if m else None, "title": (re.search(r'<title>(.*?)</title>',h) or [None,None])[1]}
for key in ["quran_handle","sunnah_handle"]:
    cid=out[key]["channelId"]
    if not cid: continue
    url,h=get(f"https://www.youtube.com/channel/{cid}/live")
    canon=re.search(r'<link rel="canonical" href="([^"]+)"',h)
    vid=re.search(r'"videoId":"([\w-]{11})"',h)
    live='"isLiveNow":true' in h or '"isLive":true' in h
    out[key].update({"liveFinal":url,"canonical":canon.group(1) if canon else None,"firstVideoId":vid.group(1) if vid else None,"isLive":live})
    v=None
    if canon and "watch?v=" in canon.group(1): v=canon.group(1).split("v=")[1][:11]
    if v:
        u2,o=get(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={v}&format=json")
        out[key]["oembed"]=o[:300]
        u3,e=get(f"https://www.youtube.com/embed/{v}")
        out[key]["embedPlayable"]= ('"playabilityStatus":{"status":"OK"' in e) or ("UNPLAYABLE" not in e and "Video unavailable" not in e)
        out[key]["embedSnippet"]=re.findall(r'"playabilityStatus":\{[^}]{0,200}',e)[:1]
    u4,e4=get(f"https://www.youtube.com/embed/live_stream?channel={cid}")
    out[key]["liveStreamEmbed"]=re.findall(r'"playabilityStatus":\{[^}]{0,200}',e4)[:1] or e4[:200]
json.dump(out,open("zdata/yt.json","w"),ensure_ascii=False,indent=1)
