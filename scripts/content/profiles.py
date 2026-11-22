"""Editorial source for data/profiles.json: destination profiles and locality pages
from the We Love Cyprus Destination Profiles (Nov 2026). Place references use site slugs
("place:slug") or record ids ("poi:id"). Run: python3 scripts/content/profiles.py
"""
import json

OSEA = {"t": "OSEA: east coast buses", "u": "https://www.osea.com.cy/"}
PAFOS = {"t": "Pafos Buses", "u": "https://www.pafosbuses.com/"}
VISIT = {"t": "Visit Cyprus", "u": "https://www.visitcyprus.com/"}
UNESCO_PAPHOS = {"t": "UNESCO: Paphos", "u": "https://whc.unesco.org/en/list/79/"}

def L(slug, title, centre, radius, bio, lead, refs, nearby=False):
    return {"slug": slug, "title": title, "centre": centre, "radius": radius, "bio": bio, "lead": lead, "refs": refs, **({"nearby": True} if nearby else {})}

PROFILES = {
 "ayianapa": {
  "intro": "Ayia Napa takes you from the bustle of Nissi Beach to the cliffs and coves of Cape Greco. In the centre, the old monastery and THALASSA Museum offer a change of pace from the beach, while the harbour gives you a place to start an evening walk. Stay close to the centre if you want dinner and nightlife nearby, or base yourself along the western coast if beach time comes first.",
  "start": [["place:nissi", "The sandy bay and offshore islet are the signature view."],
            ["place:makronissos", "Start at the beach, then follow the signed route to the tombs."],
            ["place:napa-monastery", "A historic stop near the centre of the old town."],
            ["poi:p35", "An indoor option when you want a break from the sun."],
            ["place:cape-greco", "Cliffs, caves and viewpoints. Pick your stop before you set off."]],
  "day": "Spend the morning at Nissi or Makronissos. Come back to the centre for the museum or monastery, then walk down to the harbour for dinner. Give Cape Greco its own half-day if your group wants time for several viewpoints.",
  "travel": "If you're staying in the centre, start with the square and harbour on foot. For the western beaches and the road towards Protaras, check OSEA for the right direction, stop and return bus on your travel date. For Cape Greco, choose the exact place you want to visit before checking the walk from the stop.",
  "food": "Head to the harbour for a waterfront table, the centre for a meal close to the evening buzz, or Nissi Avenue if you want to stay near your hotel.",
  "faqs": [["Can we do Nissi and the centre without a car?", "Yes. Plan them as two separate stops. Check the walking distance from your hotel or use the OSEA timetable for the bus between them."],
           ["Is Cape Greco one place I can put into Maps?", "It's a wider area. Choose a specific stop, such as the sea caves or Agioi Anargyroi Chapel, and use its own directions."],
           ["Where should we stay for beaches and evenings out?", "Nissi Avenue puts you close to the beach. The centre puts you a walk from evenings out. Open your hotel's page to see exactly what's around it."]],
  "sources": [VISIT, OSEA],
  "localities": [
   L("town-centre", "Town centre", [34.98920, 33.99960], 0.7, "Stay here for the square, the museum, restaurants and evenings on foot. Check the walking route from your hotel to the beach you want.",
     "Lead with the monastery and THALASSA.", ["place:napa-monastery", "poi:p35"]),
   L("harbour", "Harbour", [34.98170, 34.00230], 0.5, "The waterfront for an evening walk, dinner by the boats and boat trips along the coast. Boat departure points belong to each operator, so check yours.",
     "Lead with the waterfront and an evening walk.", ["poi:p38", "poi:p37"]),
   L("nissi-avenue", "Nissi Avenue", [34.98880, 33.97100], 1.2, "A beach-first base west of the centre. Choose by distance to your favourite beach entrance and where you want to spend the evening.",
     "Lead with Nissi Beach.", ["place:nissi"]),
   L("makronissos", "Makronissos", [34.98330, 33.95700], 1.0, "Start here for sandy coves and the nearby rock-cut tombs. Check your way back if you plan to eat in the centre.",
     "Lead with Makronissos Beach and the tombs.", ["place:makronissos", "place:makronissos-tombs"]),
   L("cape-greco", "Cape Greco", [34.96600, 34.07000], 2.5, "Treat the headland as an outing, with separate stops for the sea caves, viewpoints and the chapel. It's an easy trip from Protaras too.",
     "Lead with the viewpoints and the chapel.", ["place:cape-greco", "place:sea-caves", "poi:p34", "place:konnos"]),
  ]},
 "protaras": {
  "intro": "Protaras is a holiday base built around the sea, with Fig Tree Bay at the heart of the resort and smaller bays stretching along the coast. Stay in central Protaras if you want the beach and dinner close together, try Pernera for a different stretch of seafront, or look around Kapparis to explore the northern end of the resort. Inland, Paralimni and Deryneia make it easy to spend an afternoon away from the beach.",
  "start": [["place:fig-tree-bay", "Golden sand at the heart of the resort, with the islet just offshore."],
            ["place:konnos", "A small cove below pine-covered slopes, with a steep final approach."],
            ["place:profitis-ilias", "A hilltop chapel and viewpoint over the resort. Expect steps."],
            ["place:deryneia", "An inland town for an afternoon away from the beach."]],
  "day": "Start at Fig Tree Bay, eat in central Protaras and save Profitis Ilias for later if the steps suit your group. Make Konnos a separate morning, when you have time to check the approach and parking.",
  "travel": "Start with the area closest to your hotel. Central Protaras and Pernera work well as separate starting points for walks, meals and beaches. For a trip between areas or into Paralimni, check OSEA by date and direction. Konnos and Profitis Ilias each have their own last stretch on foot, so check the approach as well as the distance.",
  "food": "Browse around your hotel or beach first. Look in central Protaras for meals near the main resort strip, Pernera for that part of the coast, or Paralimni and Deryneia for an inland meal. Check kitchen hours and whether you need to book.",
  "faqs": [["Fig Tree Bay or Konnos with a pushchair?", "Compare the approach from where you're staying. Konnos has a steep approach and step-free access isn't confirmed, so don't count on it."],
           ["What's near Sunrise Pearl?", "Open the hotel's page and tap See what's around for the closest beach, food and essentials, with distances and directions."],
           ["Are Protaras and Pernera the same when booking?", "They're separate starting points for a holiday. Use your hotel's location and the beach or dinner area you prefer to compare them."]],
  "sources": [VISIT, OSEA],
  "localities": [
   L("central-protaras", "Central Protaras", [35.01250, 34.05650], 1.0, "Begin around Fig Tree Bay and the resort centre for a beach-and-dinner day. Check the walking route from your accommodation to both.",
     "Lead with Fig Tree Bay and Profitis Ilias.", ["place:fig-tree-bay", "place:profitis-ilias"]),
   L("pernera", "Pernera", [35.03200, 34.04250], 1.0, "Bays and coastal paths along a quieter stretch of seafront. Use your hotel's pin to compare the most convenient beach and restaurants.",
     "Lead with the bays and coastal walks.", []),
   L("kapparis", "Kapparis", [35.05600, 34.01300], 1.2, "A base for the northern end of the coast. Check where you'll eat in the evening and how to get back from central Protaras.",
     "Lead with the northern-coast beaches.", []),
   L("paralimni", "Paralimni", [35.03800, 33.98200], 1.5, "The working town just inland, for practical services and an inland meal away from the seafront.",
     "Lead with inland places to eat and drink.", [], nearby=True),
   L("deryneia", "Deryneia", [35.06487, 33.96091], 1.2, "An inland town for exploring beyond the seafront. Link to a specific museum or the village square when you plan your visit.",
     "Lead with its own inland sights.", ["place:deryneia"], nearby=True),
   L("konnos", "Konnos", [34.98400, 34.07000], 1.0, "A separate beach outing south of central Protaras. The descent to the bay is worth knowing about before you go.",
     "Lead with Konnos Bay and the approach to the cove.", ["place:konnos"]),
  ]},
 "paphos": {
  "intro": "Paphos has two places worth getting to know on a first visit. Down by the harbour, Kato Paphos brings the Roman mosaics, the waterfront and the castle into one outing. Inland, Ktima, the old town, has market streets and a different pace. Stay around the harbour if you want the waterfront on your doorstep, explore the old town for a change of scene, and plan Coral Bay and Kouklia as outings in their own right.",
  "start": [["place:kato-paphos", "Start with the villa mosaics, then choose what else fits your time."],
            ["place:tombs-kings", "Rock-cut tombs with their own entrance. Allow for uneven ground."],
            ["place:paphos-castle", "A waterfront stroll before or after the archaeological park."],
            ["place:palaipafos", "The ancient sanctuary of Aphrodite at Kouklia."],
            ["place:aphrodite-rock", "The coastal landmark where, legend says, Aphrodite rose from the sea."]],
  "day": "Visit the mosaics first, stay by the harbour for lunch and spend the afternoon in the old town. Give the Tombs of the Kings their own slot if you want to see them properly, and another half-day for Kouklia or Coral Bay.",
  "travel": "Use the harbour as your meeting point for a day around the waterfront. The old town, Tombs of the Kings and Coral Bay are separate destinations, so check the route from your hotel and the return timetable. For Kouklia, use the Sanctuary of Aphrodite as your map destination. For Aphrodite's Rock, use Petra tou Romiou.",
  "food": "Choose harbour restaurants for a waterfront meal, old-town cafés and tavernas while exploring Ktima, or Coral Bay when you're spending the day in Pegeia.",
  "faqs": [["Are the mosaics and the Tombs of the Kings one stop?", "No. Both are part of the Paphos World Heritage property but have separate entrances. Start at the harbour for the mosaics and use the Tombs of the Kings entrance for the tombs."],
           ["Is Coral Bay in central Paphos?", "No, Coral Bay is in Pegeia. Treat it as a separate outing or a beach base, and check Pafos Buses for your outward and return journeys."],
           ["Is Aphrodite's Rock the same as the sanctuary?", "No. The sanctuary is at Kouklia. Aphrodite's Rock is the coastal landmark at Petra tou Romiou."]],
  "sources": [UNESCO_PAPHOS, VISIT, PAFOS],
  "localities": [
   L("kato-paphos", "Kato Paphos and the harbour", [34.75650, 32.41000], 1.0, "A practical base for the waterfront and the archaeological park. Start at the harbour when you plan a walk between nearby sights.",
     "Lead with the park, the harbour and the castle.", ["place:kato-paphos", "place:paphos-castle"]),
   L("old-town", "Old Town (Ktima)", [34.77580, 32.42420], 0.9, "Come for the market streets, cafés and a different side of the city. Check opening times and your route back to the waterfront.",
     "Lead with Ktima and its market streets.", []),
   L("tombs-of-the-kings", "Tombs of the Kings area", [34.77150, 32.40900], 1.0, "Use the avenue and the tombs entrance as reference points when comparing hotels. The tombs have their own entrance, separate from the harbour park.",
     "Lead with the archaeological site and its own entrance.", ["place:tombs-kings"]),
   L("coral-bay", "Coral Bay (Pegeia)", [34.85400, 32.36800], 1.5, "A beach resort area in Pegeia, as a nearby coastal base or a day out from Paphos.",
     "Lead with the beach and the resort.", ["place:maa-palaiokastro"], nearby=True),
   L("kouklia", "Kouklia", [34.70700, 32.57400], 1.5, "The village of the Sanctuary of Aphrodite, a clear day out from Paphos. Aphrodite's Rock at Petra tou Romiou is a separate stop on the coast.",
     "Lead with the sanctuary, then Petra tou Romiou.", ["place:palaipafos", "place:aphrodite-rock"], nearby=True),
  ]},
}

json.dump({"profiles": PROFILES, "source": {"t": "We Love Cyprus Destination Profiles", "date": "2026-11-22"}},
          open("data/profiles.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print({k: len(v["localities"]) for k, v in PROFILES.items()})
