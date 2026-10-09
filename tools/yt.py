import re, json, urllib.request
H={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36","Accept-Language":"en-US,en;q=0.9","Cookie":"CONSENT=YES+1; SOCS=CAI"}
def get(u):
    try:
        r=urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30); return r.status, r.read().decode("utf-8","ignore")
    except urllib.error.HTTPError as e: return e.code, ""
    except Exception as e: return None, str(e)
out={}
CH={"quran":"UCos52azQNBgW63_9uDJoPDA","sunnah":"UCROKYPep-UuODNwyipe6JMw"}
for k,cid in CH.items():
    st,h=get(f"https://www.youtube.com/channel/{cid}/streams")
    chunks=h.split('"videoRenderer":{')[1:]
    lives=[]
    for c in chunks[:30]:
        vid=re.match(r'"videoId":"([\w-]{11})"',c)
        if not vid: continue
        islive='"style":"LIVE"' in c[:6000] or '"BADGE_STYLE_TYPE_LIVE_NOW"' in c[:6000]
        t=re.search(r'"title":\{"runs":\[\{"text":"(.*?)"\}',c)
        lives.append({"id":vid.group(1),"live":islive,"title":(t.group(1) if t else "")[:100]})
    r={"status":st,"items":lives[:12]}
    for it in [x for x in lives if x["live"]][:3]:
        s2,o=get(f"https://www.youtube.com/oembed?url=https%3A//www.youtube.com/watch%3Fv%3D{it['id']}&format=json"); it["oembed"]=s2
        s3,w=get(f"https://www.youtube.com/watch?v={it['id']}")
        it["playableInEmbed"]=re.findall(r'"playableInEmbed":(true|false)',w)[:1]
        it["isLiveNow"]=re.findall(r'"isLiveNow":(true|false)',w)[:1]
    out[k]=r
json.dump(out,open("zdata/yt.json","w"),ensure_ascii=False,indent=1)
