import openpyxl, json, re, collections, sys
wb=openpyxl.load_workbook('data/source/business-directory.xlsx',read_only=True,data_only=True)
TABDEST={'Paphos':'paphos','Polis-Latchi-Akamas':'akamas','Limassol':'limassol','Larnaca':'larnaca','Nicosia':'nicosia','Troodos-Mountain villages':'troodos'}
TOWNFIX={'Derynia':'Deryneia','Dasaki Ahnas':'Dasaki Achnas'}
SMALL={'of','the','and','by','at','on','in','de','la','le','to','a'}
def tc(s):
    if s is None: return None
    s=str(s).strip()
    if not s: return None
    if s!=s.upper(): return re.sub(r'\s+',' ',s)
    out=[]
    for i,w in enumerate(re.split(r'(\s+|-|/)',s.lower())):
        if not w or re.match(r'\s+|-|/',w): out.append(w); continue
        if i>0 and w in SMALL: out.append(w); continue
        if re.fullmatch(r"[ivx]+",w) and len(w)<=4 and w not in('i',): out.append(w.upper()); continue
        out.append(w[0].upper()+w[1:])
    r=''.join(out)
    r=re.sub(r"'S\b","'s",r)
    r=re.sub(r'\s+',' ',r)
    return r
import unicodedata
GR={'α':'a','β':'v','γ':'g','δ':'d','ε':'e','ζ':'z','η':'i','θ':'th','ι':'i','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'x','ο':'o','π':'p','ρ':'r','σ':'s','ς':'s','τ':'t','υ':'y','φ':'f','χ':'ch','ψ':'ps','ω':'o'}
DIG=[('ου','ou'),('αι','ai'),('ει','ei'),('οι','oi'),('μπ','b'),('ντ','nt'),('γγ','ng'),('γκ','gk'),('τζ','tz'),('αυ','av'),('ευ','ev')]
ABBR={'κ.':'kato ','π.':'pano '}
def greek(t):
    t=''.join(c for c in unicodedata.normalize('NFD',t) if unicodedata.category(c)!='Mn').lower()
    for a,b in ABBR.items():
        if t.startswith(a): t=b+t[len(a):].strip()
    for a,b in DIG: t=t.replace(a,b)
    t=''.join(GR.get(c,c) for c in t)
    return ' '.join(w[:1].upper()+w[1:] for w in t.split())
def gkey(t):
    t=t.lower(); 
    for a,b in (('ei','i'),('oi','i'),('y','i'),('ou','u'),('ch','h'),('gk','g'),('nt','d'),('ts','tz'),('ll','l'),('ss','s'),('tt','t'),('kk','k'),('pp','p')): t=t.replace(a,b)
    return re.sub('[^a-z]','',t)
HASGR=re.compile('[\u0370-\u03ff\u1f00-\u1fff]')
def town(t):
    t=(t or '').strip()
    if HASGR.search(t):
        if re.match(r'(?i)^(οδος|λεωφ|αρ\.)',t) or '/' in t: return 'Not specified'
        t=greek(t)
    if ' - ' in t: t=t.split(' - ')[0].strip()
    return TOWNFIX.get(t,t) or 'Not specified'
excluded=collections.Counter(); out=[]; LAT={}; restcats=collections.Counter()
for ws in wb.worksheets[1:]:
    rows=list(ws.iter_rows(values_only=True)); hdr=rows[4]
    for row in rows[5:]:
        r=dict(zip(hdr,row))
        if not r['Business name']: continue
        typ=r['Business type']; cat=(r['Source category'] or '').upper()
        if typ=='Hotel': g='hotel'; cls=r['Hotel class']; l='Hotel'
        elif typ=='Other accommodation':
            g='apart'
            l=('Hotel apartments' if 'HOTEL APARTMENTS' in cat else 'Traditional house' if 'TRADITIONAL' in cat else 'Tourist villas' if 'VILLAS' in cat else 'Tourist village' if 'VILLAGE' in cat else 'Campsite' if 'CAMP' in cat else 'Holiday accommodation')
        elif typ.startswith('Restaurant'):
            g='eat'; restcats[cat]+=1
            l={'RESTAURANT':'Restaurant','TAVERN':'Taverna','PIZZERIA':'Pizzeria','FISH TAVERN':'Fish taverna'}.get(cat, tc(cat).capitalize() if cat else 'Restaurant')
        else:
            if 'CABARET' in cat: excluded['cabaret']+=1; continue
            if any(k in cat for k in ('DISCO','MUSIC','BAR','PUB')) and not re.fullmatch(r'(OUTDOOR )?SNACK BAR',cat):
                g='night'
                l='Club' if 'DISCO' in cat else 'Music venue' if 'MUSIC' in cat else 'Pub' if 'PUB' in cat and 'SNACK' not in cat else 'Bar' if 'BAR' in cat and 'SNACK' not in cat else 'Bar and snack bar'
            else:
                g='cafe'; l='Café' if 'CAFE' in cat else 'Snack bar'
        tw=town(r['Town or village'])
        tab=ws.title
        if tab=='Ayia Napa-Protaras-East':
            d='larnaca' if tw=='Larnaca' else 'ayianapa' if tw in ('Ayia Napa','Agia Thekla') else 'protaras'
        else: d=TABDEST[tab]
        w=r['Website']
        if w: w=str(w).strip(); w=w if w.startswith('http') else 'https://'+w
        ph=r['International phone'] or r['Phone as published']
        sd=r['Source date']; sd=sd.strftime('%Y-%m-%d') if sd else None
        st=r['Hotel licensing status']
        rec={'i':r['Record ID'].lower(),'n':tc(r['Business name']),'g':g,'l':l,'tw':tw,'d':d,'a':tc(r['Address as published']),'p':str(ph).strip() if ph else None,'e':(r['Email'] or '').strip() or None,'w':w,
             'c':(str(r['Hotel class']).strip() if typ=='Hotel' and r['Hotel class'] else None),'r':r['Rooms or apartments'],'b':r['Beds'],'s':st,'sd':sd,'su':r['Source URL'],'x':1 if r['Notes'] else None}
        out.append({k:v for k,v in rec.items() if v not in (None,'')})
for o in out:
    if not HASGR.search(o['tw']): LAT.setdefault(gkey(o['tw']),o['tw'])
FIXT={'Lekosia':'Nicosia','Lefkosia':'Nicosia','K. Deftera':'Kato Deftera','Lakatameia':'Lakatamia','Pelentri':'Pelendri','Polis Chrysochous':'Polis','Pyrgos Lemesou':'Pyrgos'}
for o in out:
    t=o['tw']; t=FIXT.get(t,t); o['tw']=LAT.get(gkey(t),t)
json.dump(out,open('data/businesses.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),'excluded',dict(excluded))
print(collections.Counter(o['d'] for o in out))
print(collections.Counter((o['g']) for o in out))
print(restcats.most_common(12))
print(collections.Counter(o.get('s') for o in out if o['g']=='hotel'))
for o in out[::400]: print(o['n'],'|',o['l'],'|',o['tw'],'|',o.get('a'))
print(sorted(collections.Counter(o['tw'] for o in out if o['d']=='paphos').most_common(8)))

# ---- coordinates for Ayia Napa / Protaras (OpenStreetMap name matches) and Protaras town fix
DROP={26,62,98,100,140,142,158,166,217,227,299,306,402,451,460,472,512,524,530,543,558}
ids=json.load(open('data/work/sel_ids.json')); byid={o['i']:o for o in out}
nloc=0; rejected=[]
BOX={'Ayia Napa':(34.955,35.005,33.92,34.09),'Agia Thekla':(34.97,34.99,33.90,33.95),'Paralimni':(34.99,35.075,33.95,34.10),'Protaras':(34.99,35.075,33.95,34.10),
 'Deryneia':(35.04,35.075,33.93,33.98),'Sotira':(34.97,35.04,33.86,33.94),'Avgorou':(35.02,35.05,33.82,33.86),'Liopetri':(34.99,35.02,33.87,33.91),'Frenaros':(35.03,35.05,33.90,33.94),
 'Vrysoulles':(35.06,35.09,33.86,33.90),'Acheriou':(35.06,35.09,33.83,33.87),'Dasaki Achnas':(35.04,35.07,33.78,33.82),'Larnaca':(34.85,35.0,33.55,33.7)}
for line in open('data/work/matches.txt'):
    p=line.strip().split(':')
    if not p[0]: continue
    k=int(p[0])
    if k in DROP: continue
    lat,lon=map(float,p[1].split(','))
    o=byid[ids[k]]
    box=BOX.get(o['tw'])
    ok=bool(box) and box[0]<=lat<=box[1] and box[2]<=lon<=box[3]
    if o['tw'] in ('Paralimni','Protaras') and lon>=34.05 and 34.975<=lat<=35.0: ok=True
    if o['tw']=='Not specified' and 34.955<=lat<=35.075 and 33.90<=lon<=34.10:
        ok=True; o['tw']='Protaras' if lon>=34.03 else ('Ayia Napa' if lat<35.0 and lon>33.94 else o['tw'])
        if o['tw']=='Ayia Napa': o['d']='ayianapa'
    if not ok:
        rejected.append((o['n'],o['tw'],lat,lon)); continue
    o['ll']=[round(lat,5),round(lon,5)]; nloc+=1
PROT=re.compile(r'(?i)protara|pernera|kapparis|kaparis|fig tree|sunrise|vrysi')
fixed=0
for o in out:
    if o['d']=='protaras' and o['tw']=='Paralimni':
        if ('ll' in o and o['ll'][1]>=34.03) or ('ll' not in o and PROT.search(o.get('a',''))):
            o['tw']='Protaras'; fixed+=1
json.dump(out,open('data/businesses.json','w'),ensure_ascii=False,separators=(',',':'))
poi=[]
for i,line in enumerate(open('data/work/poi.txt')):
    k,n,ll=line.strip().split('|'); lat,lon=map(float,ll.split(','))
    poi.append({'i':'p%d'%i,'k':k,'n':n,'ll':[lat,lon]})
json.dump(poi,open('data/work/poi_osm.json','w'),ensure_ascii=False,separators=(',',':'))
print('rejected',rejected);print('located',nloc,'protaras fixed',fixed,'poi',len(poi))
print(collections.Counter(o['tw'] for o in out if o['d']=='protaras').most_common(6))
