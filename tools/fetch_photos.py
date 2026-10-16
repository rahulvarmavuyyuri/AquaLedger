"""Download freely licensed photos from Wikimedia Commons with credits.
Runs on GitHub Actions (the design workspace has no general internet access)."""
import json, os, re, time, urllib.parse, urllib.request

UA = "AquaLedgerDesign/1.0 (https://github.com/rahulvarmavuyyuri/AquaLedger)"
API = "https://commons.wikimedia.org/w/api.php"
OK_LIC = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? ?[1-4]\.0|cc by(-sa)?)", re.I)
QUERIES = {
    "shrimp": ["Litopenaeus vannamei", "Penaeus vannamei shrimp", "Penaeus monodon live", "whiteleg shrimp"],
    "tilapia": ["Oreochromis niloticus", "Nile tilapia fish"],
    "seabass": ["Lates calcarifer", "barramundi fish"],
    "rohu": ["Labeo rohita"],
    "crab": ["Scylla serrata", "mud crab Scylla"],
    "pond": ["shrimp farm pond aerator", "aquaculture pond India", "shrimp pond paddle wheel aerator"],
    "underwater": ["underwater sunlight rays ocean", "underwater seagrass meadow", "school of fish underwater", "underwater sand bottom light"],
    "turtle": ["Chelonia mydas underwater"],
    "jelly": ["Aurelia aurita jellyfish"],
}
PER_QUERY = 6

def get(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)

def strip(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()

os.makedirs("photos", exist_ok=True)
credits, seen = [], set()
for group, queries in QUERIES.items():
    n = 0
    for q in queries:
        try:
            data = get({"action": "query", "generator": "search", "gsrnamespace": 6, "gsrsearch": f"{q} filetype:bitmap",
                        "gsrlimit": 20, "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 1400})
        except Exception as e:
            print("search failed", q, e); continue
        pages = sorted(data.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0))
        taken = 0
        for p in pages:
            if taken >= PER_QUERY: break
            title = p["title"]
            if title in seen: continue
            ii = (p.get("imageinfo") or [{}])[0]
            if ii.get("mime") not in ("image/jpeg", "image/png"): continue
            if (ii.get("width") or 0) < 900: continue
            meta = ii.get("extmetadata", {})
            lic = strip(meta.get("LicenseShortName", {}).get("value"))
            if not OK_LIC.match(lic): continue
            src = ii.get("thumburl") or ii.get("url")
            n += 1; taken += 1; seen.add(title)
            fname = f"{group}_{n:02d}.jpg" if ii["mime"] == "image/jpeg" else f"{group}_{n:02d}.png"
            try:
                req = urllib.request.Request(src, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=60) as r, open(os.path.join("photos", fname), "wb") as f:
                    f.write(r.read())
            except Exception as e:
                print("download failed", title, e); n -= 1; continue
            credits.append({"file": fname, "group": group, "query": q, "title": title,
                            "artist": strip(meta.get("Artist", {}).get("value"))[:160],
                            "license": lic, "license_url": strip(meta.get("LicenseUrl", {}).get("value")),
                            "source": ii.get("descriptionurl"), "description": strip(meta.get("ImageDescription", {}).get("value"))[:200]})
            time.sleep(0.4)
json.dump(credits, open("photos/credits.json", "w"), indent=1, ensure_ascii=False)
print(f"downloaded {len(credits)} photos")
