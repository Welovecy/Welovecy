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
    OSM.setdefault(h["id"], {"ph": t.get("phone") or t.get("contact:phone") or "", "n": t.get("name", ""), "en": t.get("name:en", ""), "el": t.get("name:el", ""), "ll": h["ll"], "ent": h["ent"],
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
    ("att-latchi-watersports", "n6462022486", "activity", "Water sports and diving", "Latchi Watersports Centre", ["Latchi Watersports", "Latsi Watersports"], [], None,
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

# Dive centres: mapped in OpenStreetMap and listed by Visit Cyprus, PADI or SSI, or the Cyprus Diving Centres Association.
DIVE = [
    ("att-dive-taba", "n10057152456", "Taba Diving Centre", [], None, "A dive centre in Pernera, Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("PADI: Taba Diving Centre", "https://padi.com/dive-center/cyprus/taba-diving-centre-limited")),
    ("att-dive-the-rock", "n10665358099", "Dive the Rock", ["Dive The Rock Protaras"], None, "A dive centre on Pernera Avenue, Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("SSI: Dive the Rock", "https://www.divessi.com/ja/divecenter/dive-the-rock-julio-halal-paralimni-cyprus-742067")),
    ("att-dive-herbies", "n4784929625", "Herbie's Diving Paradise", ["Herbies Diving"], None, "A dive centre in Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("PADI: Herbie's Diving Paradise", "https://padi.com/dive-center/cyprus/herbies-diving-paradise-ltd")),
    ("att-dive-scuba-tech", "n4614382290", "Scuba Tech Diving Centre", ["Scuba Tech Divers"], None, "A dive centre on the Protaras to Cape Greco road. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("Scuba Tech: bookings", "https://booking.page/en/company/page/scubatechdivers")),
    ("att-dive-stop", "n10658564277", "Dive Stop Cyprus", ["Premier Scuba Diving Center"], None, "A dive centre in Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("Dive centre directory: Dive Stop Cyprus", "https://cursosdebuceo.com/en/dive-centers/-/dive-stop-cyprus-premier-scuba-diving-center/219627")),
    ("att-dive-gotodive", "n12224179143", "Gotodive Cyprus", ["Gotodive"], None, "A dive centre on Cape Greco Avenue, Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("index.cy: Gotodive Diving Center", "https://index.cy/places/gotodive-diving-center-cyprus/")),
    ("att-dive-easy-divers", "n952464275", "Easy Divers Cyprus", ["J.R. Easy Divers", "Easy Divers"], None, "A dive centre in Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("Cyprus Diving Centres Association: Easy Divers", "https://cyprusdiving.org.cy/index.php/dive-centers-by-town/paralimni-dive-centers/item/32-j-r-easy-divers")),
    ("att-dive-i-dive", "n947267495", "I Dive Cyprus", ["I-Dive", "I Dive Tec Rec"], None, "A dive centre in Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("Cyprus Diving Centres Association: I-Dive", "https://cyprusdiving.org.cy/index.php/dive-centers-by-town/paralimni-dive-centers/item/43-i-dive-tec-rec-centers-plc")),
    ("att-dive-aquanaut", "n10078023001", "Aquanaut Diving School", ["Aqua Naut Diving School", "Aquanaut"], None, "A dive school near Cape Greco. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("Manawa: Aquanaut Diving School", "https://www.manawa.com/en/providers/4319-aquanaut-diving-school")),
    ("att-dive-cyprus-diving-centre", "n10731079749", "Cyprus Diving Centre", ["Kistler & Zweifel Diving"], None, "A dive centre in Pernera, Protaras. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("Visit Cyprus: diving and dive centres", "https://www.visitcyprus.com/discover-cyprus/sun-sea/diving/")),
    ("att-dive-cypria", "w502810419", "Dive Cypria", [], None, "A dive centre on Protaras Avenue. Nearby dive sites include Green Bay and the Chapel at Cape Greco.", ("PADI: Dive Cypria", "https://www.padi.com/dive-center/cyprus/dive-cypria/")),
    ("att-dive-cydive", "n6047601063", "CyDive", ["Cydive Mediterraneo Dive Resort"], None, "A dive centre on Poseidonos Avenue, Paphos. Nearby dives include Amphora Cave and the Laboe wreck.", ("Visit Cyprus: diving and dive centres", "https://www.visitcyprus.com/discover-cyprus/sun-sea/diving/")),
    ("att-dive-coral-bay", "n4360871992", "Coral Bay Divers", [], None, "A dive centre at Coral Bay, Peyia. Nearby dives include Amphora Cave and the Laboe wreck.", ("PADI: Coral Bay Divers", "https://padi.com/dive-center/cyprus/coral-bay-divers")),
    ("att-dive-in-larnaca", "n6536394785", "Dive-In Larnaca", ["Dive In Larnaca"], "https://dive-in.com.cy/", "A dive centre in Larnaca, the nearest town to the Zenobia wreck.", ("Visit Cyprus: diving and dive centres", "https://www.visitcyprus.com/discover-cyprus/sun-sea/diving/")),
    ("att-dive-pissouri", "n10033251211", "Pissouri Bay Divers", [], None, "A dive centre at Pissouri Bay, between Limassol and Paphos.", ("Visit Cyprus: diving and dive centres", "https://www.visitcyprus.com/discover-cyprus/sun-sea/diving/")),
]
PHONE = {"att-latchi-watersports": "+357 26 322 095", "att-dive-cyprus-diving-centre": "+357 99 399 404", "att-dive-cydive": "+357 26 934271", "att-dive-in-larnaca": "+357 99 279829", "att-dive-pissouri": "+357 96 530761"}
SPEC += [(i, oid, "activity", "Dive centre", n, al, [], web, d, src) for i, oid, n, al, web, d, src in DIVE]
# Limassol Marina has no single OSM feature yet: use the middle of its mapped restaurants.
EXTRA = [
    {"i": "att-limassol-marina", "k": "sight", "cat": "Marina", "n": "Limassol Marina", "alt": "Marina Lemesou",
     "ll": [34.6698, 33.0394], "pr": "approx", "web": "https://www.limassolmarina.com/", "inside": LIM_MARINA,
     "desc": "The marina next to Limassol's Old Port, with restaurants and cafés.",
     "srcs": [{"t": "Limassol Marina: guide", "u": "https://www.limassolmarina.com/guide-limassol-marina"}],
     "pinNote": "Approximate: the middle of the marina's mapped restaurants."},
]

# ---- Research batch 1 (26 Nov 2026): walks and nature, museums, tourist information offices. ----
VC_TRAILS = ("Visit Cyprus: nature trails map (2026)", "https://www.visitcyprus.com/wp-content/uploads/2026/03/Hiking-Map-Nature-Trails.pdf")
FD = ("Department of Forests: nature trails", "https://www.moa.gov.cy/moa/fd/fd.nsf/fd56_en/fd56_en")
VC_TIO = ("Visit Cyprus: tourist information offices", "https://www.visitcyprus.com/useful-info/tourist-information-offices/")
TIO_HRS = "Monday to Friday, 08:30 to 16:00"
# id, osm id, kind, category, name, aliases, official site, line, source, extras
B1 = [
    # Walks: length and grade from the Visit Cyprus nature trails map; grade scale from the Department of Forests.
    ("att-trail-aphrodite-akamas", "n2972053686", "nature", "Nature trail", "Aphrodite Nature Trail", ["Aphroditi trail", "Aphrodite trail Akamas"], None,
     "A trail across the Akamas headland that starts at the Baths of Aphrodite, with views over Chrysochou Bay.", VC_TRAILS, {"len": "7.5 km", "grade": 3, "place": "baths-of-aphrodite"}),
    ("att-trail-adonis", "n2972053686", "nature", "Nature trail", "Adonis Nature Trail", ["Adonis trail"], None,
     "An Akamas trail that starts at the Baths of Aphrodite, the same start as the Aphrodite trail.", VC_TRAILS,
     {"len": "7.5 km", "grade": 3, "place": "baths-of-aphrodite", "pinNote": "The shared trail start at the Baths of Aphrodite. The Adonis trail itself is not mapped by name."}),
    ("att-trail-smigies", "n12620092688", "nature", "Nature trail", "Smigies Nature Trail", ["Smiyies trail", "Smigies picnic site"], None,
     "Two loops through Akamas forest from the Smigies picnic site, 2.5 km from Neo Chorio: a short one and a long one.", VC_TRAILS, {"len": "2.5 km or 6 km", "grade": 2}),
    ("att-trail-pissouromoutti", "n6174511541", "nature", "Nature trail", "Pissouromoutti Nature Trail", ["Pissouromouti trail"], None,
     "A short Akamas trail that starts at the Smigies picnic site near Neo Chorio.", VC_TRAILS, {"len": "3 km", "grade": 2}),
    ("att-trail-artemis", "n12693595973", "nature", "Nature trail", "Artemis Nature Trail", ["Artemis trail", "Chionistra trail"], None,
     "A loop around the top of Mount Olympus (Chionistra), starting on the Chionistra road 300 m from the Troodos to Prodromos road.", VC_TRAILS, {"len": "7 km", "grade": 1}),
    ("att-trail-atalante", "n391393057", "nature", "Nature trail", "Atalante Nature Trail", ["Atalanti trail", "Atalante trail"], None,
     "A long, fairly level trail around Mount Olympus that starts at Troodos Square.", VC_TRAILS, {"len": "14 km", "grade": 2}),
    ("att-trail-livadi", "n4425364591", "nature", "Nature trail", "Livadi Nature Trail", ["Livadi tou Pasha trail", "Kampos tou Livadiou"], None,
     "A short loop near the Kampos tou Livadiou picnic site, off the Troodos to Karvounas road.", VC_TRAILS,
     {"len": "1.5 km", "grade": 1, "pinNote": "The Kampos tou Livadiou picnic site, where the trail starts, from OpenStreetMap."}),
    ("att-trail-mnimata-piskopon", "n4425364591", "nature", "Nature trail", "Mnimata Piskopon Nature Trail", ["Mnimata ton Piskopon", "Bishops' Tombs trail"], None,
     "A Troodos forest trail that starts at the Kampos tou Livadiou picnic site, off the Troodos to Karvounas road.", VC_TRAILS,
     {"len": "8 km", "grade": 3, "pinNote": "The Kampos tou Livadiou picnic site, where the trail starts, from OpenStreetMap."}),
    ("att-trail-kannoures", "n12622913404", "nature", "Nature trail", "Kannoures to Agios Nikolaos tis Stegis Nature Trail", ["Kannoures trail"], None,
     "A trail down from the Troodos to Karvounas road, 1 km before Troodos Square, to the church of Agios Nikolaos tis Stegis. It can carry on to Kakopetria (12.5 km).", VC_TRAILS,
     {"len": "9.5 km", "grade": 3, "pr": "approx", "pinNote": "A point on the trail from OpenStreetMap. The official start is on the Troodos to Karvounas road (B9), 1 km before Troodos Square."}),
    ("att-trail-prodromos", "n3834649311", "nature", "Nature trail", "Prodromos Dam to Stavroulia Nature Trail", ["Stavroulia trail", "Prodromos dam trail"], None,
     "A Troodos trail that starts on the Troodos Square to Prodromos road, just above the Prodromos dam.", VC_TRAILS, {"len": "4.5 or 5.5 km", "grade": 3}),
    ("att-trail-trooditissa-foini", "n3876537331", "nature", "Nature trail", "Trooditissa to Foini Nature Trail", ["Trooditissa Fini trail", "Chantara waterfall walk"], None,
     "A forest walk from near Trooditissa Monastery down to Foini village, past the Chantara waterfall.",
     ("Visit Cyprus: Trooditissa to Foini trail", "https://www.visitcyprus.com/?p=468406"), {"len": "4.5 km", "grade": 1, "place": "trooditissa"}),
    ("att-trail-chrysovrysi", "n3847157934", "nature", "Nature trail", "Chrysovrysi Nature Trail", ["Chrysovrysi trail"], None,
     "A short Troodos trail that starts on the Karvounas to Troodos road, 300 m from the Chrysovrysi spring, and ends near Amiantos.",
     ("Visit Cyprus: Chrysovrysi trail", "https://www.visitcyprus.com/?p=468436"), {"len": "1.5 km", "grade": 2}),
    ("att-trail-konnoi-cyclops", "n12623159064", "nature", "Nature trail", "Konnoi to Cyclops Cave Nature Trail", ["Cyclops Cave trail", "Konnos Cyclops cave"], None,
     "A short walk from the Konnos Bay car park to the Cyclops Cave, in the Cape Greco national forest park.", VC_TRAILS, {"len": "1.7 km", "grade": 1, "place": "konnos"}),
    ("att-trail-konnoi-anargyroi", "w199912325", "nature", "Nature trail", "Konnoi to Agioi Anargyroi Nature Trail", ["Konnos Agioi Anargyroi trail"], None,
     "A loop across Cape Greco linking Konnos Bay, the Agioi Anargyroi chapel and the visitor centre car park.", VC_TRAILS, {"len": "4.8 km", "grade": 1, "place": "konnos"}),
    # Museums and centres: each on an official page.
    ("att-akamas-geo-centre", "n10671770258", "sight", "Information centre", "Akamas Geology and Paleontology Information Centre", ["Akamas Geocenter", "Pano Arodes geology centre"], None,
     "Rocks, fossils and the mining past of the island, with Cypriot herbs and a garden for children, in Pano Arodes. Free.",
     ("Visit Cyprus: Akamas Geology and Paleontology Information Center", "https://www.visitcyprus.com/?p=739374"),
     {"hrs": "Monday to Friday 10:00 to 16:00, Saturday 10:00 to 15:00, closed Sunday (Visit Cyprus)"}),
    ("att-episkopi-env-centre", "n9469838798", "nature", "Information centre", "Episkopi Environmental Information Centre", ["Ezousa valley centre"], None,
     "Exhibits and a botanical garden on the geology, plants and wildlife of the Ezousa valley, in Episkopi, Paphos.",
     ("Visit Cyprus: Episkopi Environmental Information Centre", "https://www.visitcyprus.com/?p=739392"),
     {"hrs": "Tuesday to Saturday 08:30 to 14:00, Sunday 10:00 to 14:00 (Visit Cyprus)"}),
    ("att-cedar-valley", "n334106662", "nature", "Forest valley", "Cedar Valley", ["Koilada ton Kedron"], None,
     "A valley in the Paphos forest with thousands of endemic Cyprus cedars, on the country road between Panagia and Kykkos.",
     ("Visit Cyprus: Cedar Valley", "https://www.visitcyprus.com/?p=469529"), {}),
    ("att-stavros-tis-psokas", "n292189216", "nature", "Forest station", "Stavros tis Psokas", ["Stavros tis Psokas forest station"], None,
     "A forest station in the Paphos forest, home of the Cyprus mouflon, the wild sheep found only on the island.",
     ("Visit Cyprus: Cedar Valley and Stavros tis Psokas", "https://www.visitcyprus.com/?p=469529"), {}),
    ("att-troodos-botanic", "n5422028823", "nature", "Botanic garden", "Troodos Botanical Garden A.G. Leventis", ["Troodos Botanic Garden", "Leventis Botanical Garden"], None,
     "A mountain botanic garden at about 1,400 m showing the plants of the Troodos range, near the Geopark visitor centre.",
     ("Visit Cyprus: Troodos Botanic Garden", "https://www.visitcyprus.com/?p=469541"), {}),
    ("att-akamas-botanic", "w396462454", "nature", "Botanic garden", "Baths of Aphrodite Botanical Garden", ["Akamas Botanical Garden"], None,
     "The botanical garden beside the Baths of Aphrodite.", ("Visit Cyprus: Baths of Aphrodite", "https://www.visitcyprus.com/?p=469265"), {"place": "baths-of-aphrodite"}),
    ("att-larnaca-medieval-museum", "n13782938552", "sight", "Museum", "Larnaka Medieval Museum", ["Larnaca Castle museum", "Larnaca Medieval Castle"], None,
     "The museum on the upper floor of Larnaca's medieval castle, at the end of the Finikoudes promenade.",
     ("Larnaka Tourism Board: Medieval Museum", "https://larnakaregion.com/directory/product/medieval-museum"),
     {"notice": "Closed for renovation until further notice (Larnaka Tourism Board).", "ph": "+357 24 304576"}),
    ("att-larnaca-municipal-gallery", "w20676922", "sight", "Art gallery", "Larnaka Municipal Gallery", ["Larnaca Municipal Art Gallery"], None,
     "A free gallery in an 1881 building on Europe Square, at the start of Finikoudes, with changing exhibitions.",
     ("Larnaka Tourism Board: Municipal Gallery", "https://larnakaregion.com/directory/product/municipal-art-gallery"),
     {"ph": "+357 24 658848", "hrs": "Monday to Friday mornings and late afternoons, Saturday 10:00 to 13:00, closed Sunday (Larnaka Tourism Board)"}),
    ("att-salt-pepper-museum", "n14167090016", "family", "Museum", "Salt & Pepper Museum", ["Salt and Pepper Museum"], None,
     "Over 22,000 salt and pepper shakers from a private collection, with a café, near Agios Lazaros in Larnaca.",
     ("Larnaka Tourism Board: Salt & Pepper Museum", "https://larnakaregion.com/directory/product/salt-pepper-museum"), {"ph": "+357 99 053930", "a": "51 Faneromenis Street, Larnaca"}),
    ("att-petreon", "n4559679489", "sight", "Sculpture park", "Sculpture Park Petreon", ["Petreon Sculpture Park", "Petreon Mazotos"], None,
     "An open-air park of stone sculptures by Savvas Koulendros near Mazotos. Visits by appointment.",
     ("Visit Cyprus: Sculpture Park Petreon", "https://www.visitcyprus.com/?p=469493"), {"ph": "+357 99 648116", "hrs": "By appointment (Visit Cyprus)"}),
    ("att-kato-drys-bee", "n6773607685", "sight", "Museum", "Kato Drys Bee & Embroidery Museum", ["Bee and Embroidery Museum", "Kato Drys bee museum"], None,
     "A village museum about beekeeping and embroidery in Kato Drys, near Lefkara.",
     ("Larnaka Tourism Board: Kato Drys Bee & Embroidery Museum", "https://larnakaregion.com/directory/product/kato-drys-bee-embroidery-museum"),
     {"ph": "+357 99 892677", "hrs": "Wednesday to Sunday 10:00 to 15:00, closed Monday and Tuesday (Larnaka Tourism Board)"}),
    ("att-kato-drys-rural", "n9435943539", "sight", "Museum", "Local Rural Museum of Kato Drys", ["Kato Drys rural museum"], None,
     "A small museum of village life in Kato Drys, near Lefkara.", ("Visit Cyprus: Kato Drys village", "https://www.visitcyprus.com/?p=472688"), {}),
    ("att-lefkara-museum", "n4437658090", "sight", "Museum", "Lefkara Museum of Traditional Embroidery and Silversmithing", ["House of Patsalos", "Lefkara lace museum"], None,
     "Lefkara lace, silverwork and village life in the restored House of Patsalos. Free.",
     ("Visit Cyprus: Local Museum of Traditional Embroidery and Silversmith-work, Lefkara", "https://www.visitcyprus.com/?p=494019"),
     {"ph": "+357 24 342326", "hrs": "Daily 08:30 to 16:00 in winter, 09:30 to 17:00 from mid-April to mid-September (Visit Cyprus)", "place": "lefkara"}),
    ("att-geroskipou-museum", "n244944570", "sight", "Museum", "Local Ethnographic Museum of Geroskipou", ["Geroskipou Folk Art Museum"], None,
     "Rural crafts and daily life in an 18th-century house in Geroskipou, 3 km east of Paphos.",
     ("Visit Cyprus: Local Ethnographic Museum of Geroskipou", "https://www.visitcyprus.com/?p=471646"), {}),
    ("att-paphos-ethnographic", "n5804163341", "sight", "Museum", "Ethnographic Museum of Paphos", ["Eliades Ethnographic Museum", "Paphos Ethnographical Museum"], None,
     "A private museum of folk life and finds from the Paphos region, the collection of George Eliades.",
     ("Visit Cyprus: Ethnographic Museum, Pafos", "https://www.visitcyprus.com/?p=468768"), {"a": "1 Exo Vrisis, Paphos"}),
    ("att-marion-arsinoe-museum", "n6047356804", "sight", "Museum", "Local Archaeological Museum of Marion-Arsinoe", ["Polis Archaeological Museum", "Marion Arsinoe museum"], None,
     "Finds from the ancient city kingdom of Marion-Arsinoe, in Polis.",
     ("Visit Cyprus: Local Archaeological Museum of Marion-Arsinoe", "https://www.visitcyprus.com/discover-cyprus/culture/museums-galleries/local-archaeological-museum-of-marion-arsinoe-polis-chrysochous/"),
     {"ph": "+357 26 322955", "a": "26 Makariou III Avenue, Polis"}),
    ("att-arsinoe-byzantine", "w220788477", "sight", "Museum", "Byzantine Museum of Arsinoe", ["Peristerona Byzantine Museum"], None,
     "One of the largest collections of icons on the island, at the bishopric in Peristerona, 9 km south of Polis.",
     ("Visit Cyprus: Byzantine Museum of Arsinoe", "https://www.visitcyprus.com/?p=468756"),
     {"ph": "+357 26 352515", "hrs": "Monday to Friday; 10:00 to 16:00 from September to March, split hours in summer; closed weekends (Visit Cyprus)"}),
    ("att-makarios-home", "n986675213", "sight", "Museum", "Family home of Archbishop Makarios III", ["Makarios birthplace", "Makarios house Panagia"], None,
     "The family home of the Republic's first president, one of two museums about him in Panagia village.",
     ("Visit Cyprus: Panagia village", "https://www.visitcyprus.com/?p=472544"), {}),
    ("att-idalion-museum", "w399071936", "sight", "Museum", "Local Archaeological Museum of Ancient Idalion", ["Idalion museum", "Dali museum"], None,
     "Finds from ancient Idalion, and the visitor centre for the site, in Dali.",
     ("Visit Cyprus: Local Archaeological Museum of Ancient Idalion", "https://www.visitcyprus.com/?p=471731"), {"place": "idalion"}),
    ("att-fikardou", "n1547483189", "sight", "Museum", "Fikardou Rural Museum", ["Fikardou Ethnological Museum", "House of Katsinioros"], None,
     "Two restored 18th-century houses in Fikardou, a village protected as an ancient monument: rural life and a weaver's workshop.",
     ("Visit Cyprus: Fikardou Ethnological Museum", "https://visitcyprus.com/?p=471677"), {}),
    ("att-fairy-tale-museum", "n9959060649", "family", "Museum", "Fairy Tale Museum", ["Nicosia Fairy Tale Museum"], "https://fairytalemuseum.org.cy/",
     "A museum of fairy tales in old Nicosia.", ("Visit Nicosia: museums and art institutions", "https://visitnicosia.com.cy/meet-nicosia-meet-culture/museums-art-institutions/"),
     {"a": "32-33 Granikou Street, Nicosia", "ph": "+357 22 376522"}),
    ("att-postal-museum", "n14162422254", "sight", "Museum", "Cyprus Postal Museum", ["Postal Museum Nicosia"], None,
     "Stamps and the history of the post in Cyprus, in old Nicosia.", ("Nicosia Municipality: Cyprus Postal Museum", "https://www.nicosia.org.cy/en-GB/discover/museums/postal-museum/"), {}),
    ("att-motorcycle-museum", "n4557557192", "sight", "Museum", "Cyprus Classic Motorcycle Museum", ["Classic Motorcycle Museum"], None,
     "Classic motorcycles in old Nicosia. Not the Limassol car museum.", ("Nicosia Municipality: Cyprus Classic Motorcycle Museum", "https://www.nicosia.org.cy/en-GB/discover/museums/classic-motorcycle-museum/"), {}),
    ("att-pancyprian-museums", "w1088473564", "sight", "Museum", "Museums of the Pancyprian Gymnasium", ["Pancyprian Gymnasium Museum"], None,
     "The museums of the island's oldest secondary school, in old Nicosia.", ("Nicosia Municipality: Museums of the Pancyprian Gymnasium", "https://www.nicosia.org.cy/en-GB/discover/museums/pancyprian-gymnasium/"), {}),
    ("att-coinage-museum", "n12131116093", "sight", "Museum", "Museum of the History of Cypriot Coinage", ["Coin museum Nicosia", "Cypriot Coinage Museum"], None,
     "Coins of Cyprus from ancient times to the euro, in old Nicosia.", ("Nicosia Municipality: Museum of the History of Cypriot Coinage", "https://www.nicosia.org.cy/en-GB/discover/museums/coinage-museum/"), {}),
    ("att-zampelas-museum", "w808783878", "sight", "Art museum", "Zampelas Art Museum", ["Loukia and Michael Zampelas Art Museum"], None,
     "A private art museum in Kaimakli, Nicosia.", ("Nicosia Municipality: Zampelas Art Museum", "https://www.nicosia.org.cy/en-GB/discover/museums/zampelas-art-museum/"), {}),
    # Tourist information offices (Deputy Ministry of Tourism), details from Visit Cyprus.
    ("att-tio-ayia-napa", "n1215788675", "info", "Tourist information", "Ayia Napa Tourist Information Office", ["Agia Napa tourist office", "CTO Ayia Napa"], None,
     "The official tourist information office of the Deputy Ministry of Tourism.", VC_TIO, {"a": "12 Kryou Nerou Avenue, Ayia Napa", "ph": "+357 23 721796", "hrs": TIO_HRS}),
    ("att-tio-protaras", "w81251681", "info", "Tourist information", "Protaras Tourist Information Office", ["Paralimni tourist office", "CTO Protaras"], None,
     "The official tourist information office of the Deputy Ministry of Tourism.", VC_TIO, {"a": "14 Protara Avenue, Protaras", "ph": "+357 23 832865", "hrs": TIO_HRS}),
    ("att-tio-limassol", "n4484146639", "info", "Tourist information", "Limassol Tourist Information Office", ["Lemesos tourist office", "CTO Limassol"], None,
     "The official tourist information office at the Old Port, building THK1.", VC_TIO, {"a": "Michalis Kakogiannis Square, Old Port, Limassol", "ph": "+357 25 362756", "hrs": TIO_HRS, "place": "limassol-old-port"}),
    ("att-tio-larnaca", "n339951438", "info", "Tourist information", "Larnaca Tourist Information Office", ["Larnaka tourist office", "CTO Larnaca"], None,
     "The official tourist information office on Vasileos Pavlou Square.", VC_TIO,
     {"a": "Vasileos Pavlou Square, Larnaca", "ph": "+357 24 654322",
      "notice": "Closed for renovation from April 2026, due to reopen in mid-November. Until it does, the temporary office is at Matei House, 3 Zinonos Kiteos Street (+357 24 644303), 08:30 to 14:30."}),
    ("att-tio-nicosia", "w28349840", "info", "Tourist information", "Nicosia Tourist Information Office", ["Lefkosia tourist office", "CTO Nicosia"], None,
     "The official tourist information office in Laiki Geitonia, east of Eleftheria Square.", VC_TIO,
     {"a": "11 Aristokyprou Street, Laiki Geitonia, Nicosia", "ph": "+357 22 674264", "hrs": TIO_HRS, "pr": "approx", "pinNote": "Approximate: Aristokyprou Street, from OpenStreetMap."}),
    ("att-tio-platres", "w13859981", "info", "Tourist information", "Platres Tourist Information Office", ["Troodos tourist office", "CTO Platres"], None,
     "The official tourist information office in Pano Platres.", VC_TIO,
     {"a": "4C Olympou Street, Pano Platres", "ph": "+357 25 421316", "hrs": TIO_HRS, "pr": "approx", "pinNote": "Approximate: Olympou Street, from OpenStreetMap.", "place": "platres"}),
    ("att-tio-polis", "n2972033650", "info", "Tourist information", "Polis Tourist Information Office", ["Polis Chrysochous tourist office", "CTO Polis"], None,
     "The official tourist information office in Polis.", VC_TIO,
     {"a": "2 Vasileos Stasioikou A Street, Polis", "ph": "+357 26 322468", "hrs": TIO_HRS, "pr": "approx", "pinNote": "Approximate: the start of Vasileos Stasioikou Street, from OpenStreetMap."}),
]
SPEC += [(i, oid, k, cat, n, al, [], web, d, src, x) for i, oid, k, cat, n, al, web, d, src, x in B1]
FD_TRAILS = {i for i, *_ in B1 if i.startswith("att-trail-")}
EXTRA += [
    {"i": "att-trail-sea-caves", "k": "nature", "cat": "Nature trail", "n": "Sea Caves to Agioi Anargyroi Nature Trail", "alt": "Sea caves trail; Cape Greco sea caves walk",
     "ll": [34.96843, 34.05459], "pr": "osm", "place": "sea-caves", "len": "4 km", "grade": 1,
     "desc": "A clifftop walk from the Ayia Napa sea caves to the Agioi Anargyroi chapel at Cape Greco.",
     "srcs": [{"t": VC_TRAILS[0], "u": VC_TRAILS[1]}, {"t": FD[0], "u": FD[1]}], "pinNote": "The sea caves, where the trail starts."},
    {"i": "att-trail-aphrodite-cape-greco", "k": "nature", "cat": "Nature trail", "n": "Aphrodite Nature Trail, Cape Greco", "alt": "Aphroditi trail Cape Greco; Kavo Gkreko Aphrodite trail",
     "ll": [34.970669, 34.070709], "pr": "osm", "place": "cape-greco", "len": "2 km", "grade": 1,
     "desc": "A short trail from the Cape Greco national forest park visitor centre car park. Not the Akamas trail of the same name.",
     "srcs": [{"t": VC_TRAILS[0], "u": VC_TRAILS[1]}, {"t": FD[0], "u": FD[1]}, {"t": "Location: OpenStreetMap contributors", "u": "https://www.openstreetmap.org/node/12741785061"}],
     "pinNote": "The Cape Greco visitor centre, where the trail starts, from OpenStreetMap."},
    {"i": "att-tio-paphos", "k": "info", "cat": "Tourist information", "n": "Paphos Tourist Information Office", "alt": "Pafos tourist office; CTO Paphos", "d": "paphos",
     "a": "17 Dimitraki Papamiltiadous Street, corner of Kostaki Karnavalou, Paphos", "ph": "+357 26 932841", "hrs": TIO_HRS,
     "desc": "The official tourist information office in Paphos town.", "srcs": [{"t": VC_TIO[0], "u": VC_TIO[1]}]},
]

# ---- 26 Nov 2026, second pass: trails on the official map we didn't have yet. Figures from the Visit Cyprus map or the trail's own page. ----
VC_ZOUMI = ("Visit Cyprus: Prodromos to Zoumi trail", "https://www.visitcyprus.com/discover-cyprus/rural/nature-trails/prodromos-zoumi-linear-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail-2")
VC_KYP = ("Visit Cyprus: Kyparissia to Germasogeia Dam trail", "https://www.visitcyprus.com/?p=468442")
B2 = [
    ("att-trail-prodromos-zoumi", "n12622883686", "nature", "Nature trail", "Prodromos to Zoumi Nature Trail", ["Zoumi trail", "Prodromos Zouri"], None,
     "A forest trail that starts by the children's play area in Prodromos, the highest village in Cyprus.", VC_ZOUMI,
     {"len": "3 km", "grade": 2, "time": "1 to 1.5 hours", "shape": "one way"}),
    ("att-trail-psilo-dendro", "n12249813003", "nature", "Nature trail", "Psilo Dendro to Pouziaris Nature Trail", ["Pouziaris trail", "Psilo Dentro trail"], None,
     "A long, demanding trail above Platres, starting where the Platres to Mesa Potamos forest road meets the B8, near Psilo Dendro.", VC_TRAILS,
     {"len": "9 km", "grade": 3, "time": "3 to 4 hours", "place": "platres"}),
    ("att-trail-teisia-madaris", "n3836205357", "nature", "Nature trail", "Teisia tis Madaris Nature Trail", ["Tisia tis Madaris", "Madari ridge trail"], None,
     "A ridge walk on Madari, starting below the fire lookout station above Kyperounta.", VC_TRAILS, {"len": "3.5 km", "grade": 3, "time": "1.5 hours"}),
    ("att-trail-madari", "n2552639232", "nature", "Nature trail", "Madari Nature Trail", ["Madari trail", "Doxa soi o Theos"], None,
     "A long loop around Madari in four sections, with its start and end at Doxa soi o Theos. Some sections can be walked on their own.", VC_TRAILS,
     {"len": "13 km", "grade": 3, "time": "5.5 hours", "shape": "loop", "pr": "approx", "pinNote": "An information board for the Madari trails, from OpenStreetMap. The official start is at Doxa soi o Theos."}),
    ("att-trail-xyliatos", "n2007734498", "nature", "Nature trail", "Xyliatos Dam Nature Trail", ["Xyliatos trail", "Xyliatos reservoir walk"], None,
     "A walk around the Xyliatos reservoir, starting at the dam's picnic site or above the overflow.", VC_TRAILS,
     {"len": "3.8 km", "grade": 2, "time": "1 to 1.5 hours", "pinNote": "The Xyliatos Dam picnic site, one of the two official starts, from OpenStreetMap."}),
    ("att-trail-agia-eirini", "n10297312135", "nature", "Nature trail", "Agia Eirini to Limeria Nature Trail", ["Limeria trail", "Spilies tou Digeni"], None,
     "A steep uphill trail in the Adelfoi forest, from Agia Eirini village to Limeria.", VC_TRAILS,
     {"len": "5 km", "grade": 3, "time": "2.5 hours", "shape": "one way", "pr": "approx", "a": "Agia Eirini village",
      "pinNote": "The Limeria end of the trail, from OpenStreetMap. The official start is in Agia Eirini village, so directions search for the village."}),
    ("att-trail-kyparissia", "n12623159047", "nature", "Nature trail", "Kyparissia to Germasogeia Dam Nature Trail", ["Germasogeia Dam trail", "Kyparissia trail"], None,
     "A forest trail in the hills above Limassol, about 3 km off the Parekklisia to Kellaki road. A short loop, or a long walk down to Germasogeia Dam. Both start with a steep descent.", VC_KYP,
     {"len": "3.7 km loop, or 11 km to the dam", "grade": 2, "time": "1.5 hours (loop), 3 to 3.5 hours (to the dam, grade 3)"}),
    ("att-trail-persephone", "n1241186373", "nature", "Nature trail", "Persephone Nature Trail", ["Persephoni trail"], None,
     "An easy trail from Troodos Square through pine forest to a viewpoint over the southern slopes.", VC_TRAILS,
     {"len": "3 km", "grade": 1, "time": "1 hour", "pr": "approx", "pinNote": "Troodos Square. The trail starts 150 m south of the square, towards the police station."}),
    ("att-trail-kampos-livadiou", "n4425364591", "nature", "Nature trail", "Kampos tou Livadiou Nature Trail", ["Kampos tou Livadiou trail"], None,
     "A Troodos forest trail by the Kampos tou Livadiou picnic site, off the Troodos to Karvounas road.", VC_TRAILS,
     {"len": "3 km", "grade": 2, "time": "1.5 hours", "pr": "approx", "pinNote": "The Kampos tou Livadiou picnic site, from OpenStreetMap. Check the exact start on the official map."}),
    ("att-trail-selladi-kannavia", "n10301013579", "nature", "Nature trail", "Selladi tou Karamanli to Kannavia Nature Trail", ["Kannavia trail", "Selladi tou Karamanli"], None,
     "A mountain trail from Selladi tou Karamanli, on the Madari ridge, down towards Kannavia village.", VC_TRAILS,
     {"len": "4.8 km", "grade": 3, "time": "2.5 hours"}),
]
SPEC += [(i, oid, k, cat, n, al, [], web, d, src, x) for i, oid, k, cat, n, al, web, d, src, x in B2]

# Batch 2 (27 Nov 2026): indoor places for rainy days, so every main area has some.
VC_MUS = "https://www.visitcyprus.com/discover-cyprus/culture/museums-galleries/"
B3 = [
    ("att-thalassa-museum", "w131894256", "sight", "Museum", "Thalassa Municipal Museum", ["Thalassa Museum", "Thalassa Agia Napa Municipal Museum", "Museum of the Sea Ayia Napa"], "https://thalassamuseum.org.cy/",
     "Ayia Napa's municipal museum of the sea, in the town centre.", ("Visit Cyprus: Thalassa Agia Napa Municipal Museum", "https://visitcyprus.com/?p=471707"), {}),
    ("att-paphos-archaeological-museum", "w1181368494", "sight", "Museum", "Paphos District Archaeological Museum", ["Paphos Archaeological Museum", "Pafos Archaeological Museum"], "https://www.mcw.gov.cy/mcw/da/da.nsf/All/306F2D157B5C878FC225719900205580?OpenDocument",
     "The district archaeological museum of Paphos, run by the Department of Antiquities, on Griva Digeni Avenue.", None, {}),
    ("att-limassol-archaeological-museum", "n4580756497", "sight", "Museum", "Limassol District Archaeological Museum", ["Archaeological Museum of the Lemesos District", "Lemesos Archaeological Museum", "Limassol Archaeological Museum"], None,
     "The district archaeological museum of Limassol.", ("Visit Cyprus: Archaeological Museum of the Lemesos District", "https://www.visitcyprus.com/discover-cyprus/culture/museums-galleries/archaeological-museum-of-the-lemesos-limassol-district/"), {}),
    ("att-mall-of-engomi", "w10961631", "sight", "Shopping centre", "Mall of Engomi", ["Engomi Mall"], "https://themallofengomi.com/",
     "A shopping centre in Engomi, Nicosia.", None, {}),
    ("att-my-mall", "w24158409", "sight", "Shopping centre", "My Mall Limassol", ["My Mall"], "https://www.mymall.com.cy",
     "A large shopping centre on Franklin Roosevelt Avenue, west Limassol.", None, {}),
    ("att-metropolis-mall", "w729709277", "sight", "Shopping centre", "Metropolis Mall Larnaca", ["Metropolis Mall"], "https://metropolismall.com.cy/",
     "A shopping centre on Evropaikis Enosis Avenue, Larnaca.", None, {}),
    ("att-k-cineplex-limassol", "w28654965", "sight", "Cinema", "K Cineplex Limassol", ["K Cineplex"], "https://kcineplex.com/",
     "A multiplex cinema in Limassol.", None, {}),
    ("att-k-cineplex-nicosia", "w290424270", "sight", "Cinema", "K Cineplex Nicosia", ["K Cineplex Strovolos"], "https://kcineplex.com/",
     "A multiplex cinema in Strovolos, Nicosia.", None, {}),
    ("att-rio-cinema-limassol", "w255732611", "sight", "Cinema", "Rio Cinema Limassol", ["Rio Cinemas"], "https://www.riocinemas.com.cy/limassol/",
     "A cinema in central Limassol.", None, {}),
]
SPEC += [(i, oid, k, cat, n, al, [], web, d, src, x) for i, oid, k, cat, n, al, web, d, src, x in B3]
FD_TRAILS |= {i for i, *_ in B2}
EXTRA += [
    {"i": "att-trail-araka-agiasmati", "k": "nature", "cat": "Nature trail", "n": "Panagia tou Araka to Stavros tou Agiasmati Nature Trail", "alt": "Araka Agiasmati trail; painted churches walk",
     "ll": [34.96544, 33.0072], "pr": "osm", "place": "panagia-tou-araka", "len": "7 km", "grade": 3, "time": "3 hours",
     "desc": "A trail between two of the UNESCO painted churches of Troodos, Panagia tou Araka near Lagoudera and Stavros tou Agiasmati near Platanistasa.",
     "srcs": [{"t": VC_TRAILS[0], "u": VC_TRAILS[1]}, {"t": FD[0], "u": FD[1]}], "pinNote": "Panagia tou Araka church, one end of the trail."},
]
# The walks to the two Troodos waterfalls belong on the waterfall listings rather than as separate records.
WATERFALL_WALK = {"att-kaledonia-falls": {"len": "3 km trail", "grade": 3, "time": "1.5 hours"}, "att-millomeris-falls": {"len": "1.2 km trail", "grade": 3, "time": "30 minutes"}}

# Walking time and route shape from the Visit Cyprus nature trails map (2026) and the trail's own Visit Cyprus page
# (titles say "Circular" or "Linear"). One-way trails end away from the start, so the listing says to plan the way back.
TRAIL_TIME = {
    "att-trail-aphrodite-akamas": ("3.5 hours", "loop"), "att-trail-adonis": ("3.5 hours", "loop"), "att-trail-smigies": ("1 hour short, 2 hours long", "loop"),
    "att-trail-pissouromoutti": ("2 hours", None), "att-trail-artemis": ("2.5 to 3 hours", None), "att-trail-atalante": ("4 to 5 hours", None),
    "att-trail-livadi": ("30 minutes", "loop"), "att-trail-mnimata-piskopon": ("3 hours", "one way"), "att-trail-kannoures": ("4 hours downhill", "one way"),
    "att-trail-prodromos": ("1.5 to 2 hours", "one way"), "att-trail-trooditissa-foini": (None, "one way"), "att-trail-chrysovrysi": (None, "one way"),
    "att-trail-konnoi-cyclops": ("45 minutes", None), "att-trail-konnoi-anargyroi": ("2 hours", "loop"), "att-trail-sea-caves": ("1.5 hours", "one way"),
    "att-trail-aphrodite-cape-greco": ("1 hour", None),
}

out = []
for row in SPEC:
    i, oid, k, cat, name, alias, inside, web, desc, extra = row[:10]
    x = row[10] if len(row) > 10 else {}
    o = OSM[oid]
    ent = o["ent"][0]["ll"] if o["ent"] else None
    site = web or o["web"] or None
    srcs = []
    if site: srcs.append({"t": "Official website", "u": site})
    if extra: srcs.append({"t": extra[0], "u": extra[1]})
    if i in FD_TRAILS: srcs.append({"t": FD[0], "u": FD[1]})
    srcs.append({"t": "Location: OpenStreetMap contributors", "u": f"https://www.openstreetmap.org/{ {'n': 'node', 'w': 'way', 'r': 'relation'}[oid[0]] }/{oid[1:]}"})
    out.append({
        "i": i, "k": k, "cat": cat, "n": name or o["en"] or o["n"], "alt": "; ".join(alias), "ll": ent or o["ll"], "pr": "osm",
        "ent": bool(ent), "web": site, "a": o["addr"] or None, "ph": PHONE.get(i) or o.get("ph") or None, "osm": oid, "inside": inside, "desc": desc, "srcs": srcs,
    })
    out[-1].update(x)
for e in EXTRA: out.append({"inside": [], **e})
for o in out:
    if o["i"] in WATERFALL_WALK:
        o.update(WATERFALL_WALK[o["i"]])
        if not any(x["u"] == VC_TRAILS[1] for x in o["srcs"]): o["srcs"].insert(-1, {"t": VC_TRAILS[0], "u": VC_TRAILS[1]})
    t = TRAIL_TIME.get(o["i"])
    if t:
        if t[0]: o["time"] = t[0]
        if t[1]: o["shape"] = t[1]
for o in out:
    if o["i"] == "att-zenobia":
        o["sea"] = True
        o["pinNote"] = "Offshore, about 3.7 km from the shore at Larnaca. Dive centres take you there by boat."
json.dump({"note": "Built by scripts/data/build_attractions.py. Hours are not verified unless a source says so.", "checked": "2026-11-26", "items": out},
          open("data/attractions.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "attractions,", sum(1 for x in out if x.get("ent")), "with a mapped entrance")
