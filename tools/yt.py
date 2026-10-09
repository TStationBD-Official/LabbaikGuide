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
    st,h=get(f"https://www.youtube.com/channel/{cid}/live")
    vd=re.search(r'"videoDetails":\{"videoId":"([\w-]{11})"',h)
    title=re.search(r'"videoDetails":\{.*?"title":"(.*?)"',h)
    live=re.search(r'"isLiveContent":(true|false)',h)
    islive=re.search(r'"isLive":(true|false)',h)
    og=re.search(r'<meta property="og:url" content="([^"]+)"',h)
    canon=re.findall(r'rel="canonical" href="([^"]+)"',h)
    r={"status":st,"videoDetails":vd.group(1) if vd else None,"title":title.group(1)[:120] if title else None,"isLiveContent":live.group(1) if live else None,"isLive":islive.group(1) if islive else None,"og":og.group(1) if og else None,"canon":canon[:3],"len":len(h)}
    v=r["videoDetails"]
    if v:
        s2,o=get(f"https://www.youtube.com/oembed?url=https%3A//www.youtube.com/watch%3Fv%3D{v}&format=json"); r["oembed"]=[s2,o[:200]]
        s3,w=get(f"https://www.youtube.com/watch?v={v}")
        r["playableInEmbed"]=re.findall(r'"playableInEmbed":(true|false)',w)[:1]
        r["watchIsLive"]=re.findall(r'"isLiveNow":(true|false)',w)[:1]
    out[k]=r
json.dump(out,open("zdata/yt.json","w"),ensure_ascii=False,indent=1)
