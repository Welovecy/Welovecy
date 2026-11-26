"""
Build data/attractions.json: family days out, museums, venues and other attractions, each tied to an
OpenStreetMap feature (location and, where mapped, the visitor entrance) and to the operator's own website.

Input: the OSM extract made by .github/workflows/attractions.yml (attractions.json on the osm-attractions branch),
       saved locally at data/work/osm_attractions.json.
Spec:  SPEC below. Each entry names the OSM id, our category, and the licensed records that sit inside it
       (restaurants and cafés already in businesses.json), which get linked to the attraction and pinned to it.
Opening hours are left unverified unless the operator publishes them.
"""
import json

OSM = {x["id"]: x for x in json.load(open("data/work/osm_attractions.json"))["items"]}
# Name lookups (osm-lookup.yml) for places the category extract doesn't cover, e.g. untagged waterfalls.
for h in json.load(open("data/work/osm_lookup.json"))["hits"]:
    t = h["tags"]
    OSM.setdefault(h["id"], {"n": t.get("name", ""), "en": t.get("name:en", ""), "el": t.get("name:el", ""), "ll": h["ll"], "ent": h["ent"],
                             "web": t.get("website") or t.get("contact:website") or "", "addr": " ".join(x for x in [t.get("addr:street", ""), t.get("addr:housenumber", ""), t.get("addr:city", "")] if x)})
KINGS = ["cy-03053", "cy-03060", "cy-03068", "cy-03134", "cy-03177", "cy-03228", "cy-03239", "cy-03299", "cy-03324", "cy-03325", "cy-03328", "cy-03343"]
LIM_MARINA = ["cy-01501", "cy-01558", "cy-01762", "cy-01892", "cy-01893", "cy-01894", "cy-01895", "cy-01896", "cy-01897", "cy-01898", "cy-01899", "cy-01900"]

# id, osm id, kind, category, name (None = OSM name), aliases, inside, official site (None = OSM website), line, extra source
SPEC = [
    ("att-ocean-aquarium", "w81256976", "family", "Aquarium", "Protaras Ocean Aquarium", ["Ocean Aquarium", "Protaras Aquarium"], ["cy-00511"], None,
     "An aquarium on the road from Protaras to Cape Greco, with a restaurant and café.", None),
    ("att-camel-park", "w1052232485", "family", "Animal park", "Camel Park", ["Mazotos Camel Park"], ["cy-01000"], None,
     "An animal park near Mazotos, with a restaurant on site.", None),
    ("att-fasouri-watermania", "w53771432", "family", "Waterpark", "Fasouri Watermania Waterpark", ["Fasouri Waterpark", "Fasouri Watermania"], ["cy-01978"], None,
     "A waterpark in Fasouri, west of Limassol. Seasonal, so check dates with the park.", ("Limassol Tourism Board: waterpark", "https://www.limassoltourism.com/waterpark/")),
    ("att-aphrodite-waterpark", "w7710505", "family", "Waterpark", "Paphos Aphrodite Waterpark", ["Aphrodite Waterpark", "Pafos Aphrodite Waterpark"], ["cy-02867", "cy-02868"], None,
     "The Paphos waterpark on Poseidonos Avenue, Geroskipou. Seasonal, so check dates with the park.", None),
    ("att-pafos-zoo", "w139497392", "family", "Zoo", "Pafos Zoo", ["Paphos Zoo", "Pafos Bird and Animal Park"], [], None,
     "A zoo in Agios Georgios, Peyia, near Coral Bay.", None),
    ("att-limassol-zoo", "w112318489", "family", "Zoo", "Limassol Zoo", ["Limassol Municipal Zoo", "Municipal Gardens Zoo"], [], None,
     "The municipal zoo inside Limassol's Municipal Gardens.", None),
    ("att-golden-donkeys", "n4267577790", "family", "Farm", "Golden Donkeys Farm", ["Skarinou Donkey Farm"], [], "https://goldendonkeys.com/",
     "A donkey farm near Skarinou, between Larnaca and Limassol.", None),
    ("att-paradox-museum", "n10916623937", "family", "Indoor attraction", "Paradox Museum Limassol", ["Paradox Museum"], [], "https://www.paradoxmuseumlimassol.com/",
     "A museum of optical illusions near Limassol's Old Port. Indoors, so good on a hot or rainy day.", None),
    ("att-wine-museum", "n1758132232", "sight", "Museum", "The Cyprus Wine Museum", ["Cyprus Wine Museum"], ["cy-01207"], None,
     "A museum about Cypriot wine in Erimi, west of Limassol.", None),
    ("att-motor-museum", "n4841547321", "sight", "Museum", "Cyprus Historic and Classic Motor Museum", ["Cyprus Motor Museum"], [], "https://cyprusmotormuseum.com.cy/",
     "A museum of historic and classic cars in Limassol.", None),
    ("att-pierides-museum", "n4228446593", "sight", "Museum", "Pierides Museum", ["Pierides Museum Bank of Cyprus Cultural Foundation"], [], None,
     "A museum of the Bank of Cyprus Cultural Foundation in Larnaca town centre.", None),
    ("att-kyriazis-museum", "n6718182785", "sight", "Museum", "Kyriazis Medical Museum", ["Kyriazi Medical Museum", "Medical Museum Kyriazi"], [], None,
     "A small medical history museum in Larnaca.", None),
    ("att-leventis-gallery", "w20493985", "sight", "Art gallery", "A. G. Leventis Gallery", ["Leventis Gallery", "Leventis Art Gallery"], [], None,
     "Cypriot, Greek and European art, including the Paris Collection.", None),
    ("att-leventis-museum", "w808783874", "sight", "Museum", "The Leventis Municipal Museum of Nicosia", ["Leventis Museum", "Leventis Municipal Museum"], [], None,
     "The story of Nicosia, in Laiki Geitonia.", None),
    ("att-cvar", "w1091059677", "sight", "Museum", "Centre of Visual Arts and Research", ["CVAR", "Severis Foundation"], [], "https://cvar.severis.org/en/",
     "A museum and arts centre in the old city of Nicosia.", None),
    ("att-nimac", "n13234136635", "sight", "Arts centre", "NiMAC, Nicosia Municipal Arts Centre", ["NiMAC", "Old Powerhouse"], [], None,
     "Nicosia's municipal arts centre, in the old power station.", None),
    ("att-athalassa", "w808434888", "family", "Park and visitor centre", "Athalassa National Forest Park Visitor Centre", ["Athalassa Park", "Athalassa National Forest Park"], ["cy-02572"], None,
     "The visitor centre of Athalassa National Forest Park in Nicosia.",
     ("Visit Cyprus: Athalassa National Forest Park", "https://www.visitcyprus.com/?p=469499")),
    ("att-kings-avenue-mall", "w147476732", "sight", "Shopping centre", "Kings Avenue Mall", ["Kings Avenue Mall Pafos"], KINGS, None,
     "A shopping centre in Paphos with restaurants and cafés. Handy on a rainy day.", None),
    ("att-ayia-napa-marina", "w1068160351", "sight", "Marina and event centre", "Ayia Napa Marina", ["Agia Napa Marina", "Ayia Napa Marina Event Center"], ["cy-00337"], "https://marinaayianapa.com/",
     "The marina west of Ayia Napa, with restaurants, Riva Beach House and the event centre that hosts the Christmas village.", None),
    ("att-etko", "w1210719866", "sight", "Event venue", "ETKO", ["ETKO Winery", "ETKO Open Air"], [], "https://etkocyprus.com/",
     "An event venue at the ETKO winery in Limassol.", None),
    ("att-rialto", "n4500648289", "sight", "Theatre", "Rialto Theatre", ["Rialto"], [], "https://www.rialto.com.cy/",
     "A theatre and music venue in Limassol town centre.", None),
    ("att-pattihio", "w269171005", "sight", "Theatre", "Pattihio Municipal Theatre", ["Pattichio Theatre", "Pattihio"], [], None,
     "Limassol's municipal theatre.", None),
    ("att-thoc-apothikes", "w1047395016", "sight", "Theatre", "THOC Warehouses Theatre", ["THOC", "Cyprus Theatre Organisation", "Theatro Apothikes"], [], None,
     "A stage of the Cyprus Theatre Organisation (THOC) in Strovolos, Nicosia.", None),
    ("att-latchi-watersports", "n6462022486", "family", "Water sports", "Latchi Watersports Centre", ["Latchi Watersports", "Latsi Watersports"], [], None,
     "A water sports centre at Latchi, near Polis.", None),
    ("att-kaledonia-falls", "n310731897", "sight", "Waterfall", "Kaledonia Waterfall", ["Kalidonia Waterfall", "Caledonia Waterfall", "Kaledonian Waterfalls"], [], None,
     "A waterfall on a nature trail near Platres in the Troodos mountains.",
     ("Troodos Geopark: waterfalls", "https://www.troodosgeopark.com/en/katarraktes-troodous/")),
    ("att-troodos-ski", "w956746345", "family", "Ski area", "Troodos ski area (Sun Valley)", ["Mount Olympus ski", "Troodos Ski Centre", "Sun Valley"], [], "https://cyprusski.com/",
     "Ski runs at Sun Valley on Mount Olympus. Opening depends on snow, so check conditions before you go.", None),
]
SPEC += [
    ("att-cyprus-planetarium", "n11332794458", "family", "Planetarium", "The Cyprus Planetarium", ["Cyprus Planetarium"], [], "https://thecyprusplanetarium.com/",
     "The island's first planetarium, with dome shows, virtual reality and telescopes, in the Tamassos and Orini area near Nicosia.",
     ("Cyprus Mail: what to know about the island's first planetarium", "https://cyprus-mail.com/2026/01/18/planetarium-cyprus-what-to-know-about-the-islands-first-planetarium")),
    ("att-technopolis-20", "n5198087428", "sight", "Arts centre and venue", "Technopolis 20", ["Technopolis20"], [], None,
     "A cultural centre in Paphos that hosts concerts, including its own jazz festival.",
     ("Cyprus Mail: Technopolis 20 jazz festival", "https://cyprus-mail.com/2026/08/24/here-comes-the-1st-technopolis-20-jazz-festival")),
    ("att-millomeris-falls", "n1309548988", "sight", "Waterfall", "Millomeris Waterfall", ["Millomeri Falls", "Millomeri Waterfall"], [], None,
     "A waterfall reached on a short nature trail from Pano Platres in the Troodos mountains.",
     ("Troodos Geopark: waterfalls", "https://www.troodosgeopark.com/en/katarraktes-troodous/")),
    ("att-troodos-geopark", "w966813911", "family", "Visitor centre", "Troodos Geopark Visitor Centre", ["Troodos Geopark", "Geopark Visitor Center"], [], None,
     "The visitor centre of the Troodos UNESCO Global Geopark, near Amiantos.",
     ("UNESCO: Troodos Global Geopark", "https://en.unesco.org/global-geoparks/troodos")),
    ("att-zenobia", "n5021578905", "sight", "Wreck dive", "Zenobia shipwreck", ["MS Zenobia", "Zenobia wreck"], [], None,
     "A ferry that capsized on her maiden voyage in 1980 and lies off Larnaca at 18 to 42 metres. Reached by boat with a dive centre.",
     ("Larnaka Tourism Board: Zenobia wreck", "https://larnakaregion.com/zenobia-wreck")),
]
# Limassol Marina has no single OSM feature yet: use the middle of its mapped restaurants.
EXTRA = [
    {"i": "att-limassol-marina", "k": "sight", "cat": "Marina", "n": "Limassol Marina", "alt": "Marina Lemesou",
     "ll": [34.6698, 33.0394], "pr": "approx", "web": "https://www.limassolmarina.com/", "inside": LIM_MARINA,
     "desc": "The marina next to Limassol's Old Port, with restaurants and cafés.",
     "srcs": [{"t": "Limassol Marina: guide", "u": "https://www.limassolmarina.com/guide-limassol-marina"}],
     "pinNote": "Approximate: the middle of the marina's mapped restaurants."},
]

out = []
for i, oid, k, cat, name, alias, inside, web, desc, extra in SPEC:
    o = OSM[oid]
    ent = o["ent"][0]["ll"] if o["ent"] else None
    site = web or o["web"] or None
    srcs = []
    if site: srcs.append({"t": "Official website", "u": site})
    if extra: srcs.append({"t": extra[0], "u": extra[1]})
    srcs.append({"t": "Location: OpenStreetMap contributors", "u": f"https://www.openstreetmap.org/{ {'n': 'node', 'w': 'way', 'r': 'relation'}[oid[0]] }/{oid[1:]}"})
    out.append({
        "i": i, "k": k, "cat": cat, "n": name or o["en"] or o["n"], "alt": "; ".join(alias), "ll": ent or o["ll"], "pr": "osm",
        "ent": bool(ent), "web": site, "a": o["addr"] or None, "osm": oid, "inside": inside, "desc": desc, "srcs": srcs,
    })
for e in EXTRA: out.append({**e, "alt": e["alt"]})
for o in out:
    if o["i"] == "att-zenobia":
        o["sea"] = True
        o["pinNote"] = "Offshore, about 3.7 km from the shore at Larnaca. Dive centres take you there by boat."
json.dump({"note": "Built by scripts/data/build_attractions.py. Hours are not verified unless a source says so.", "checked": "2026-11-26", "items": out},
          open("data/attractions.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "attractions,", sum(1 for x in out if x.get("ent")), "with a mapped entrance")
