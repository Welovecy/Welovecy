#!/usr/bin/env bash
# Live check of welovecy.com from GitHub's servers: pages, noindex, sitemap, guide cards, and Aphrodite's partner answers.
set -u
B=https://www.welovecy.com
ok(){ echo "PASS  $1"; }; no(){ echo "FAIL  $1"; }
page(){ curl -sL --max-time 30 -A "Mozilla/5.0 welovecy-livecheck" "$B$1"; }
for p in /partners/go-airport-transfers /partners/coral-bay-taxi-transfers /partners/dukes-car-rental /partners/cy-cruises; do
  h=$(page $p)
  [[ "$h" == *"noindex"* ]] && ok "$p is noindex" || no "$p is not noindex"
  [[ "$h" == *"Advertising partner"* ]] && ok "$p shows the partner label" || no "$p has no label"
done
[[ "$(page /partners/go-airport-transfers)" == *"99 388544"* ]] && ok "Go page has its phone" || no "Go page phone missing"
[[ "$(page /partners/coral-bay-taxi-transfers)" == *"99 603837"* ]] && ok "Coral Bay page has its phone" || no "Coral Bay phone missing"
s=$(page /sitemap.xml); [[ "$s" != *"/partners/"* ]] && ok "partners not in sitemap" || no "partners in sitemap"
g=$(page /guides/larnaca-airport-to-ayia-napa-and-protaras); [[ "$g" == *"Go Airport Transfers"* ]] && ok "Larnaca guide has the Go card" || no "Larnaca guide card missing"
g=$(page /guides/paphos-airport-to-paphos-and-coral-bay); [[ "$g" == *"Coral Bay Taxis"* ]] && ok "Paphos guide has the Coral Bay card" || no "Paphos guide card missing"
g=$(page /guides/larnaca-and-paphos-airport-to-limassol); [[ "$g" != *"Advertising partner"* ]] && ok "Limassol guide has no partner card" || no "Limassol guide shows a partner"
for p in /places/waterworld /listing/att-trail-trooditissa-foini /stay/ayianapa /know-before-you-go /cyprus-history /living-in-cyprus /aphrodite-96.webp /petrol /essentials/paphos/carhire /essentials/larnaca/carhire; do c=$(curl -s -o /dev/null -w "%{http_code}" -L "$B$p"); [ "$c" = 200 ] && ok "$p loads" || no "$p returned $c"; done

ASKED=0
ask(){ # question, expected partner or NONE
  ASKED=$((ASKED+1)); if [ $ASKED -gt 14 ]; then echo "      (waiting 10 minutes: Aphrodite allows 15 questions per 10 minutes per visitor)"; sleep 610; ASKED=1; fi
  r=$(curl -s --max-time 40 -X POST "$B/api/ask" -H "content-type: application/json" -H "x-wlc-test: 1" -A "welovecy-livecheck" -d "{\"messages\":[{\"role\":\"user\",\"text\":\"$1\"}],\"page\":\"/\"}")
  ans=$(echo "$r" | jq -r '.answer' | tr '\n' ' ')
  cards=$(echo "$r" | jq -r '[.cards[]?.n] | join(", ")')
  case "$2" in
    NONE) if [[ "$ans" != *"Go Airport"* && "$ans" != *"Coral Bay Taxis"* ]]; then ok "no partner: $1"; else no "partner named wrongly: $1"; fi ;;
    *) if [[ "$ans" == *"$2"* ]]; then ok "$2 for: $1"; else no "$2 missing for: $1"; fi ;;
  esac
  echo "      answer: $ans"; echo "      cards: $cards"
  for l in $(echo "$r" | jq -r '.answer' | grep -oE 'https://(www\.)?welovecy\.com[^) ]*' | sed 's/[#?].*//' | sort -u); do
    c=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 "$l"); [ "$c" = 200 ] || { sleep 5; c=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 "$l"); }; [ "$c" = 200 ] && ok "link works: $l" || no "broken link ($c): $l"
  done; echo
  sleep 4
}
ask "Can you recommend an airport transfer from Larnaca to Protaras?" "Go Airport Transfers"
ask "We are staying in a villa in Peyia. How can we get there from Paphos Airport?" "Coral Bay Taxis"
ask "Can I book a taxi from my villa in Coral Bay to a local restaurant tonight?" "Coral Bay Taxis"
ask "Can you recommend a transfer from Larnaca Airport to Limassol?" NONE
ask "I need a taxi in Ayia Napa to go to a club" NONE
ask "We land at Paphos airport tomorrow, how do we get to our hotel?" NONE
ask "What is the cheapest way from Larnaca airport to Ayia Napa?" "bus"
ask "Is the waterpark in Ayia Napa open?" "season"

echo "--- airport answers and sitemap"
n=$(curl -s $B/sitemap.xml | grep -o '<loc>' | wc -l); [ "$n" -gt 4000 ] && ok "sitemap has $n pages" || no "sitemap has only $n pages"
s=$(curl -s $B/sitemap.xml); [[ "$s" == *"/listing/att-trail-artemis"* ]] && ok "trail pages in sitemap" || no "trail pages missing from sitemap"
[[ "$s" != *"/partners/"* && "$s" != *"/buses/stop/"* ]] && ok "partners and bus stops still out of sitemap" || no "partner or bus stop pages in sitemap"
ask "How much is a taxi from Larnaca airport to Ayia Napa?" "50"
ask "Cheapest way from Larnaca airport to Paralimni?" "Intercity"

echo "--- long answers"
ask "Plan my weekend" "weekend"
ask "Troodos" "Troodos"

echo "--- know before you go"
ask "Do I need a visa to visit from the UK?" "90"
ask "Can I fly my drone in Cyprus?" "120"
ask "Can we visit the north while we are there?" "Republic"
ask "What is the drinking age?" "18"

echo "--- batch 2"
ask "It is raining in Ayia Napa, anything indoors?" "Thalassa"
ask "Which villages should we visit from Limassol?" "Omodos"
ask "Where should we stay for nightlife?" "Ayia Napa"
ask "Tell me about Richard the Lionheart in Cyprus" "1191"

echo "--- living in Cyprus"
ask "How do I get a yellow slip as an EU citizen?" "MEU1"
ask "Can I swap my UK driving licence?" "6 months"

echo "--- petrol and car hire"
ask "Where is the nearest petrol station to Nissi Beach?" "min"
ask "Where can I hire a car in Paphos?" NONE
ask "I want to hire a car at Larnaca airport" "Dukes Car Rental"
ask "What boat trips are there in Ayia Napa?" "CY Cruises"
ask "Is there a pirate ship cruise for kids near Protaras?" "Black Pearl"
ask "We are in Ayia Napa, any sunset boat party for adults?" "CY Cruises"
# App pages (28 Nov)
page /search | grep -q "Find nearby" && ok "search shows Find nearby" || no "search missing Find nearby"
page /stay | grep -q 'class="imap' && ok "stay has the island map" || no "stay missing map"
page /around | grep -q "Or start from a town" && ok "around has town cards" || no "around missing town cards"
page /must-see | grep -q "Show all" && ok "must-see folds long lists" || no "must-see not folded"
page /must-see | grep -q "BreadcrumbList" && ok "must-see keeps breadcrumb data" || no "must-see lost breadcrumb data"
c=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$B/index"); case "$c" in 30[18]*) ok "/index sends people to the homepage";; *) no "/index returned $c";; esac
n=$(page /buses | grep -o 'class="busroute"' | wc -l); [ "$n" -ge 250 ] && ok "buses page has all $n routes" || no "buses page shows only $n routes"
page / | grep -q "No thanks" && ok "slim cookie banner is live" || no "cookie banner text missing"
ok_page(){ page /know-before-you-go | grep -q "Lara and Toxeftra" && ok "know page has facts" || no "know page missing facts"; }; ok_page
page /beaches | grep -q "Find your beach" && ok "new beaches page is live" || no "beaches page not updated"
page /places/makronissos | grep -q "03_Cyprus_beach_-_Makronissos_Beach" && ok "Makronissos Beach shows the shoreline photo" || no "Makronissos photo not updated"
page /listing/bea-01071 | grep -q "Vrysoudia_II" && no "Vrysoudia A still shows the II photo" || ok "Vrysoudia A photo removed"
page /listing/bea-01072 | grep -q "Vrysoudia_II" && ok "Vrysoudia B shows its photo" || no "Vrysoudia B photo missing"
page /listing/att-zenobia | grep -q "Zenobia_Wreck_Cyprus" && ok "sight listings show photos" || no "sight listing photo missing"
{ page /petrol | grep -q "photograph the whole island ourselves" || { sleep 5; page /petrol | grep -q "photograph the whole island ourselves"; }; } && ok "footer photo line" || no "footer photo line missing"
page /listing/bea-00986 | grep -q "About this information" && ok "detail page: sources folded at the end" || no "detail page: new layout missing"
page /listing/bea-00986 | grep -q "Unconfirmed:" && no "detail page still shows Unconfirmed" || ok "detail page: no Unconfirmed labels"
page /listing/bea-00999 | grep -q "dh-mapsvg" && ok "no-photo page opens on the map hero" || no "map hero missing"
page /places/nissi | grep -q "actbar" && ok "place page: action row" || no "place page: action row missing"
page / | grep -q "Where to?" && ok "homepage: new rails" || no "homepage: rails missing"
page /listing/bea-00986 | grep -q "api/og?p=%2Flisting%2Fbea-00986" && ok "detail page points at its share image" || no "share image meta missing"
for q in "%2F" "%2Flisting%2Fbea-00986" "%2Fpartners%2Fcy-cruises" "%2Flisting%2Fcy-00011"; do t=$(curl -s -o /tmp/og.png -w "%{http_code} %{content_type} %{size_download}" "$B/api/og?p=$q&v=2"); case "$t" in "200 image/jpeg "*) ok "share image $q ($t)";; *) no "share image $q: $t";; esac; done
page /destinations/ayianapa | grep -q "Featured spot" && no "destination still shows empty featured block" || ok "destination: no empty featured block"
page /essentials | grep -q "duty pharmacies" && ok "essentials links to tonight's rota" || no "essentials missing duty link"
page /petrol | grep -q "Pharmacies on duty tonight" && no "footer still has duty link" || ok "footer has no duty link"
