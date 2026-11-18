import json, math, re, collections, unicodedata, os
R=json.load(open('data/work/ess_raw.json')); osm=[p for p in json.load(open('data/work/poi_osm.json'))]
GEO=json.load(open('data/work/geo_res.json')) if os.path.exists('data/work/geo_res.json') else {}
GQ=json.load(open('data/work/geo_q.json'))
GEOBY={GQ[int(i)][0]:v for i,v in GEO.items() if v}
def km(a,b):
    t=math.pi/180; dl=(b[0]-a[0])*t; dn=(b[1]-a[1])*t
    x=math.sin(dl/2)**2+math.cos(a[0]*t)*math.cos(b[0]*t)*math.sin(dn/2)**2; return 2*6371*math.asin(math.sqrt(x))
REG={'Ayia Napa, Protaras & east':'east','Paphos':'paphos','Polis, Latchi & Akamas':'akamas','Limassol':'limassol','Larnaca':'larnaca','Nicosia':'nicosia','Troodos & mountain villages':'troodos'}
BOX={'east':(34.94,35.09,33.70,34.11),'paphos':(34.60,35.10,32.25,32.90),'akamas':(34.90,35.20,32.25,32.70),'limassol':(34.55,35.00,32.70,33.40),'larnaca':(34.70,35.10,33.20,33.85),'nicosia':(34.95,35.25,32.80,33.60),'troodos':(34.75,35.10,32.60,33.20)}
TW={}
def dest_of(reg,ll):
    r=REG[reg]
    if r=='east':
        if ll: return 'ayianapa' if ll[0]<34.995 else 'protaras'
        return 'ayianapa' if TW.get('tw') in ('Ayia Napa','Agia Thekla','Agia Napa') else 'protaras'
    return r
def inbox(r,ll): b=BOX[REG[r]]; return ll and b[0]<=ll[0]<=b[1] and b[2]<=ll[1]<=b[3]
def nice(s):
    s=(s or '').strip()
    if s and s==s.upper() and re.search('[Α-Ω]',s):
        s=''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn')
        s=' '.join(w[:1]+w[1:].lower() for w in s.split())
    elif s and s==s.upper() and len(s)>4:
        s=' '.join(w[:1]+w[1:].lower() for w in s.split())
    return re.sub(r'\s+',' ',s)
out=[]; stats=collections.Counter()
BADPIN={'Panagia Health Centre'}  # source pin sits in Paphos town, not Panagia village
# beaches + bathing points
bp=[(b,[b['Latitude'],b['Longitude']]) for b in R['Bathing points']]
for b in R['Beaches']:
    ll=[round(b['Latitude'],5),round(b['Longitude'],5)]
    fac=[f.strip() for f in (b.get('Reported facilities') or '').split(';') if f.strip()]
    near=min(bp,key=lambda x:km(ll,x[1])) if bp else None
    rec={'i':b['Directory ID'].lower(),'k':'beach','n':nice(b['Name as published']),'tw':b['Town / locality'],'d':dest_of(b['Region'],ll),'ll':ll,'pr':'exact',
         'sf':b.get('Shore surface'),'fac':[f for f in fac if not f.startswith('Blue Flag')],'bf':any(f.startswith('Blue Flag') for f in fac),
         'acc':b.get('How to get there / access'),'alt':b.get('Other names'),'info':b.get('Official information page'),'su':b.get('Source URL'),'sd':str(b.get('Retrieved') or '')[:10]}
    if near and km(ll,near[1])<0.35: rec['bw']=near[0].get('Official beach profile'); rec['bwid']=near[0].get('Official bathing-water ID')
    out.append({k:v for k,v in rec.items() if v not in (None,'',[])}); stats['beach']+=1
def add(cat,k,r,ll,pr,extra):
    TW['tw']=r['Town / locality']
    rec={'i':r['Directory ID'].lower(),'k':k,'n':nice(r['Name as published']),'tw':r['Town / locality'],'d':dest_of(r['Region'],ll),'a':r.get('Address as published'),'pr':pr,'su':r.get('Source URL'),'sd':str(r.get('Retrieved') or '')[:10]}
    if ll: rec['ll']=[round(ll[0],5),round(ll[1],5)]
    rec.update(extra); out.append({k2:v for k2,v in rec.items() if v not in (None,'',[])}); stats[(k,'located' if ll else 'address-only')]+=1
for r in R['Supermarkets']:
    ll=[r['Latitude'],r['Longitude']] if r.get('Latitude') else None; pr='exact' if ll else None
    if not ll and r['Directory ID'] in GEOBY: g=GEOBY[r['Directory ID']]; ll=[g['lat'],g['lon']]; pr='exact'
    if ll and not inbox(r['Region'],ll): stats['market-rejected']+=1; ll=None; pr=None
    add('Supermarkets','market',r,ll,pr,{'ch':r.get('Chain / operator'),'ph':r.get('Business phone'),'hrs':r.get('Published opening hours')})
PHO=json.load(open('data/work/pharm_osm.json'))
for r in R['Pharmacies']:
    ll=None; pr=None
    if r['Directory ID'] in PHO: ll=PHO[r['Directory ID']]; pr='exact'
    if r['Directory ID'] in GEOBY: g=GEOBY[r['Directory ID']]; ll=[g['lat'],g['lon']]; pr='approx'
    if ll and not inbox(r['Region'],ll): stats['pharm-rejected']+=1; ll=None; pr=None
    add('Pharmacies','pharmacy',r,ll,pr,{'ph':r.get('Pharmacy phone'),'reg':r.get('Register number'),'ed':r.get('Source edition / date')})
for r in R['Healthcare']:
    ll=[r['Source latitude'],r['Source longitude']] if r.get('Source latitude') and r['Name as published'] not in BADPIN else None; pr='source' if ll else None
    if not ll and r['Directory ID'] in GEOBY: g=GEOBY[r['Directory ID']]; ll=[g['lat'],g['lon']]; pr='approx'
    if ll and not inbox(r['Region'],ll): stats['health-rejected']+=1; ll=None; pr=None
    add('Healthcare','health',r,ll,pr,{'ft':r.get('Facility type'),'ph':r.get('Business phone')})
# keep OSM sights/family; keep OSM supermarkets/pharmacies/clinics only where nothing official is within 150 m
off=[o for o in out if 'll' in o]
keep=0
for p in osm:
    if p['k'] in ('sight','family'):
        out.append({'i':p['i'],'k':p['k'],'n':p['n'],'d':'ayianapa' if p['ll'][0]<34.995 else 'protaras','ll':p['ll'],'pr':'osm','src':'osm'}); keep+=1; continue
    if p['k'] in ('market','pharmacy','health'):
        if any(o['k']==p['k'] and km(o['ll'],p['ll'])<0.15 for o in off): stats['osm-dup-'+p['k']]+=1; continue
        out.append({'i':p['i'],'k':p['k'],'n':p['n'],'d':'ayianapa' if p['ll'][0]<34.995 else 'protaras','ll':p['ll'],'pr':'osm','src':'osm'}); stats['osm-kept-'+p['k']]+=1
json.dump(out,open('data/pois.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),dict(stats))
