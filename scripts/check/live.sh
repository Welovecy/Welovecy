#!/usr/bin/env bash
# Live check of welovecy.com from GitHub's servers: pages, noindex, sitemap, guide cards, and Aphrodite's partner answers.
set -u
B=https://www.welovecy.com
ok(){ echo "PASS  $1"; }; no(){ echo "FAIL  $1"; }
page(){ curl -sL --max-time 30 -A "Mozilla/5.0 welovecy-livecheck" "$B$1"; }
for p in /partners/go-airport-transfers /partners/coral-bay-taxi-transfers; do
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
for p in /places/waterworld /listing/att-trail-trooditissa-foini /stay/ayianapa; do c=$(curl -s -o /dev/null -w "%{http_code}" -L "$B$p"); [ "$c" = 200 ] && ok "$p loads" || no "$p returned $c"; done

ask(){ # question, expected partner or NONE
  r=$(curl -s --max-time 40 -X POST "$B/api/ask" -H "content-type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"text\":\"$1\"}],\"page\":\"/\"}")
  ans=$(echo "$r" | jq -r '.answer' | tr '\n' ' ')
  cards=$(echo "$r" | jq -r '[.cards[]?.n] | join(", ")')
  case "$2" in
    NONE) if [[ "$ans" != *"Go Airport"* && "$ans" != *"Coral Bay Taxis"* ]]; then ok "no partner: $1"; else no "partner named wrongly: $1"; fi ;;
    *) if [[ "$ans" == *"$2"* ]]; then ok "$2 for: $1"; else no "$2 missing for: $1"; fi ;;
  esac
  echo "      answer: $ans"; echo "      cards: $cards"
  for l in $(echo "$r" | jq -r '.answer' | grep -oE 'https://(www\.)?welovecy\.com[^) ]*' | sed 's/[#?].*//' | sort -u); do
    c=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 "$l"); [ "$c" = 200 ] && ok "link works: $l" || no "broken link ($c): $l"
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
ask "Plan my weekend" "Saturday"
ask "Troodos" "Troodos"
