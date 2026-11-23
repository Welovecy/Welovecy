"""Monthly climate averages per area. Cyprus Department of Meteorology station normals, as tabled in
Wikipedia's "Climate of Cyprus" (checked 23 November 2026). Each area uses its nearest station; sea
temperature and sunshine come from the nearest station that records them."""
import json
S={
 'paralimni':{'n':'Paralimni','hi':[16.0,16.1,18.7,22.2,26.8,30.8,33.1,33.3,31.2,27.7,21.7,17.3],'lo':[8.6,7.9,9.7,12.5,16.8,20.6,23.4,23.7,20.9,18.0,13.4,10.1],'rain':[8.2,5.6,4.7,3.5,1.2,0.3,0.1,0.1,0.6,2.5,4.9,7.3]},
 'larnaca':{'n':'Larnaca airport','hi':[16.8,16.8,19.1,22.5,26.5,30.3,32.4,32.7,30.9,28.1,22.6,18.3],'lo':[7.5,6.9,8.7,11.7,16.0,19.8,22.2,22.6,19.9,17.1,12.5,9.2],'rain':[7.9,5.7,4.5,3.1,0.7,0.3,0.1,0.1,0.5,2.1,4.7,8.0],'sun':[195.3,208.8,238.7,267.0,331.7,378.0,387.5,365.8,312.0,275.9,216.0,179.8],'sea':[18,17,17,18,20,24,26,27,27,25,22,19]},
 'paphos':{'n':'Paphos airport','hi':[17.0,16.9,18.5,21.3,24.4,27.7,29.9,30.4,28.8,26.6,22.4,18.6],'lo':[8.0,7.6,8.7,11.3,14.5,17.8,20.4,21.0,18.8,16.4,12.6,9.7],'rain':[9.9,8.0,5.5,4.1,1.3,0.3,0.1,0.0,0.6,2.5,5.8,8.7],'sun':[195.3,211.7,244.9,270.0,344.1,381.0,390.6,365.8,315.0,285.2,225.0,186.0],'sea':[18,17,17,18,20,24,26,27,26,24,22,19]},
 'polis':{'n':'Polis','hi':[16.4,16.3,18.5,21.5,26.1,30.5,33.5,33.3,29.9,26.5,21.9,17.8],'lo':[7.9,7.3,8.6,11.1,14.7,18.8,21.6,21.8,19.3,16.3,12.4,9.4],'rain':[10.1,8.3,6.5,4.2,1.8,0.2,0.1,0.0,0.6,2.9,5.7,9.1],'sun':[192.2,211.7,254.2,291.0,359.6,387.0,399.9,378.2,318.0,279.0,219.0,182.9]},
 'limassol':{'n':'Limassol','hi':[17.6,17.8,20.0,22.9,26.9,30.8,33.2,33.3,31.3,28.6,23.5,18.9],'lo':[8.8,8.5,10.4,13.1,16.7,20.1,22.4,22.7,20.6,17.7,13.5,10.1],'rain':[9.3,7.1,5.6,3.3,1.1,0.2,0.0,0.0,0.3,1.9,5.5,8.8],'sea':[18,17,17,18,20,24,26,27,27,25,22,19]},
 'nicosia':{'n':'Nicosia','hi':[15.5,15.9,19.2,24.0,29.7,34.3,37.2,36.9,33.9,29.0,22.1,17.0],'lo':[5.7,5.2,7.0,10.2,14.8,19.4,22.2,21.9,18.8,15.6,10.4,7.1],'rain':[7.3,6.5,5.4,3.5,2.7,1.3,0.5,0.1,0.6,2.8,4.7,7.7],'sun':[182.9,200.1,238.7,267.0,331.7,369.0,387.5,365.8,312.0,275.9,213.0,170.5]},
 'prodromos':{'n':'Prodromos (1,380 m)','hi':[6.3,6.6,10.3,15.1,20.5,25.0,28.1,27.9,24.4,19.6,12.8,8.0],'lo':[0.7,0.3,2.8,6.3,11.1,15.2,18.4,18.2,14.9,11.3,6.2,2.5],'rain':[12.4,11.2,9.8,6.7,3.7,2.1,0.7,0.7,1.4,3.5,7.4,11.2],'sun':[130.2,150.8,195.3,231.0,275.9,315.0,328.6,310.0,255.0,220.1,165.0,136.4]},
}
# area: temps/rain station, sea station, sunshine station
A={'ayianapa':('paralimni','larnaca','larnaca'),'protaras':('paralimni','larnaca','larnaca'),'larnaca':('larnaca','larnaca','larnaca'),
   'limassol':('limassol','limassol','paphos'),'paphos':('paphos','paphos','paphos'),'akamas':('polis','paphos','polis'),
   'nicosia':('nicosia',None,'nicosia'),'troodos':('prodromos',None,'prodromos')}
out={}
for a,(t,s,u) in A.items():
    T=S[t];out[a]={'station':T['n'],'hi':T['hi'],'lo':T['lo'],'rain':T['rain'],
      'sea':S[s]['sea'] if s else None,'seaStation':S[s]['n'] if s else None,
      'sun':[round(h) for h in S[u]['sun']],'sunStation':S[u]['n']}
json.dump({'source':{'t':'Cyprus Department of Meteorology station averages, via Wikipedia: Climate of Cyprus','u':'https://en.wikipedia.org/wiki/Climate_of_Cyprus','checked':'23 November 2026'},'areas':out},open('data/climate.json','w'),indent=1)
print('ok')
