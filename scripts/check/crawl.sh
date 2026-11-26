#!/usr/bin/env bash
# How crawlers see welovecy.com: status, redirects, size, robots, sitemap, and noindex on sitemap pages.
set -u
UAS=("curl/8" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot" "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" "Mozilla/5.0 (compatible; ClaudeBot/1.0)" "Mozilla/5.0 (compatible; bingbot/2.0)")
for host in https://www.welovecy.com https://welovecy.com; do
  for path in / /sitemap.xml /robots.txt; do
    for ua in "${UAS[@]}"; do
      r=$(curl -s -o /tmp/b -w "%{http_code} %{num_redirects} %{url_effective} %{size_download}" -L --max-time 30 -A "$ua" "$host$path")
      echo "$host$path | ${ua:0:40} | $r | $(head -c 80 /tmp/b | tr '\n' ' ')"
    done
  done
done
echo "--- first redirect hop"
for u in https://welovecy.com/ https://www.welovecy.com/ http://welovecy.com/; do curl -s -o /dev/null -w "$u -> %{http_code} %{redirect_url}\n" --max-time 20 "$u"; done
echo "--- robots.txt"; curl -sL https://www.welovecy.com/robots.txt
echo "--- sitemap"
curl -sL https://www.welovecy.com/sitemap.xml -o sm.xml; echo "urls: $(grep -c '<loc>' sm.xml)"; grep -o '<loc>[^<]*' sm.xml | head -3
grep -o '<loc>[^<]*' sm.xml | sed 's/<loc>//' | awk 'NR%40==1' > sample.txt; echo "sampling $(wc -l < sample.txt)"
while read u; do h=$(curl -sL --max-time 20 -A "Googlebot" -w "\n%{http_code} %{url_effective}" "$u"); code=$(echo "$h" | tail -1); ni=$(echo "$h" | grep -o 'name="robots" content="[^"]*"' | head -1); can=$(echo "$h" | grep -o 'rel="canonical" href="[^"]*"' | head -1); echo "$code | $u | $ni | $can"; done < sample.txt | awk -F' [|] ' '$1!~/^200 / || $3!="" || index($4,$2)==0' | head -40
echo "--- headers"; curl -sI https://www.welovecy.com/ | grep -iE "x-robots|x-vercel|server|content-type|strict"
