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
    keys=sorted(set(re.findall(r'"(\w+(?:Renderer|ViewModel))":\{',h)))
    ids=[]
    for m in re.finditer(r'"videoId":"([\w-]{11})"',h):
        if m.group(1) in [x["id"] for x in ids]: continue
        win=h[max(0,m.start()-3000):m.start()+3000]
        ids.append({"id":m.group(1),"LIVE":'"LIVE"' in win,"liveNow":"LIVE_NOW" in win or "isLiveNow" in win,"title":(re.search(r'"title":\{"(?:runs":\[\{"text|content)":"(.*?)"',win) or [None,""])[1][:90]})
    r={"status":st,"keys":keys[:60],"ids":ids[:15]}
    for it in [x for x in ids if x["LIVE"]][:4]:
        s3,w=get(f"https://www.youtube.com/watch?v={it['id']}")
        it["playableInEmbed"]=re.findall(r'"playableInEmbed":(true|false)',w)[:1]
        it["isLiveNow"]=re.findall(r'"isLiveNow":(true|false)',w)[:1]
        it["wtitle"]=(re.search(r'<title>(.*?)</title>',w) or [None,""])[1][:100]
    out[k]=r
json.dump(out,open("zdata/yt.json","w"),ensure_ascii=False,indent=1)
