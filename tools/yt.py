import re, urllib.request
H={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36","Accept-Language":"en-US,en;q=0.9","Cookie":"CONSENT=YES+1; SOCS=CAI"}
for k,cid in {"quran":"UCos52azQNBgW63_9uDJoPDA","sunnah":"UCROKYPep-UuODNwyipe6JMw"}.items():
    h=urllib.request.urlopen(urllib.request.Request(f"https://www.youtube.com/channel/{cid}/streams",headers=H),timeout=30).read().decode("utf-8","ignore")
    i=h.find('"lockupViewModel"')
    open(f"zdata/yt_{k}_slice.txt","w").write(h[i:i+60000])
