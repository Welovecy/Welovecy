#!/usr/bin/env bash
B=${B:-https://welovecy-git-sitemap-airport-welovecy.vercel.app}
echo "status: $(curl -s -o /dev/null -w '%{http_code}' $B/)"
echo "sitemap urls: $(curl -s $B/sitemap.xml | grep -o '<loc>' | wc -l)"
for q in "Can you recommend an airport transfer from Larnaca to Protaras?" "How much is a taxi from Larnaca airport to Ayia Napa?" "Cheapest way from Larnaca airport to Paralimni?"; do
  r=$(curl -s --max-time 40 -X POST "$B/api/ask" -H "content-type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"text\":\"$q\"}],\"page\":\"/\"}")
  echo "Q: $q"; echo "A: $(echo "$r" | jq -r '.answer // .' | tr '\n' ' ' | cut -c1-1400)"; echo; sleep 4
done
