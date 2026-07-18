(function(App){
  const params=new URLSearchParams(location.search);
  if(params.get('autoplay')!=='1')return;

  const seed=Number(params.get('seed'))||20260718;
  const speed=Math.max(.05,Number(params.get('speed'))||1);
  const timing={intro:3500,transition:500,move:2000,hold:3000,outro:3000};
  Object.keys(timing).forEach(key=>timing[key]=Math.round(timing[key]*speed));
  const state=window.__ACCESSIBILITY_STORY__={status:'loading',seed,scenes:[],timing};
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const rng=mulberry32(seed);

  function mulberry32(value){
    return function(){value|=0;value=value+0x6D2B79F5|0;let t=Math.imul(value^value>>>15,1|value);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
  }
  function shuffle(items){
    const result=[...items];
    for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    return result;
  }
  function center(feature){
    const box=App.utils.bbox(feature.geometry);
    return [(box[0]+box[2])/2,(box[1]+box[3])/2];
  }
  function distance(a,b){
    const lat=(a[1]+b[1])/2*Math.PI/180;
    const dx=(a[0]-b[0])*111.32*Math.cos(lat),dy=(a[1]-b[1])*110.57;
    return Math.hypot(dx,dy);
  }
  function compactForStory(feature){
    const acres=Number(feature.properties.LAND_ACRE),groupBox=App.utils.bbox(feature.geometry),walkshed=window.WEBMAP_DATA.blockgroupWalksheds?.features?.find(item=>String(item.properties.BG_ID)===String(feature.properties.BG_ID));
    if(!Number.isFinite(acres)||acres>60||!walkshed)return false;
    const walkBox=App.utils.bbox(walkshed.geometry),lat=(groupBox[1]+groupBox[3])/2*Math.PI/180,width=(groupBox[2]-groupBox[0])*111.32*Math.cos(lat),height=(groupBox[3]-groupBox[1])*110.57;
    const diagonal=Math.hypot(width,height),ratio=Math.max(width,height)/Math.max(.001,Math.min(width,height)),contained=groupBox[0]>=walkBox[0]&&groupBox[1]>=walkBox[1]&&groupBox[2]<=walkBox[2]&&groupBox[3]<=walkBox[3];
    return diagonal<=1.3&&ratio<=2.8&&contained;
  }
  function pointInRing(point,ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[i],b=ring[j],cross=(a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0];
      if(cross)inside=!inside;
    }
    return inside;
  }
  function neighborhoodName(feature){
    const point=center(feature),areas=window.WEBMAP_DATA.neighborhoods?.features||[];
    const match=areas.find(area=>{
      const polygons=area.geometry.type==='Polygon'?[area.geometry.coordinates]:area.geometry.coordinates;
      return polygons.some(polygon=>pointInRing(point,polygon[0])&&!polygon.slice(1).some(hole=>pointInRing(point,hole)));
    });
    return String(match?.properties?.NAME||'').trim();
  }
  function chooseScenes(api){
    const model=api.model(),metrics=shuffle(model.metricOrder),targets=shuffle([12,24,36,48,58,68,78,86,93,98]);
    const used=new Set();let previous=null;
    return metrics.map((metric,index)=>{
      const candidates=window.WEBMAP_DATA.blockgroups.features.filter(feature=>{
        const p=feature.properties,id=String(p.BG_ID),record=model.scores[metric]?.[id],context=model.context?.[id];
        if(used.has(id)||Number(p.POP)<=0||!record||Number(record.score)<=1||!context||Number(context.reachableParks)<1||!compactForStory(feature))return false;
        if(previous){const km=distance(previous,center(feature));if(km<1.1||km>10.5)return false;}
        return true;
      });
      const fallback=window.WEBMAP_DATA.blockgroups.features.filter(feature=>{
        const id=String(feature.properties.BG_ID),record=model.scores[metric]?.[id];
        return !used.has(id)&&Number(feature.properties.POP)>0&&record&&Number(record.score)>1&&compactForStory(feature);
      });
      const pool=(candidates.length?candidates:fallback).sort((a,b)=>{
        const aScore=model.scores[metric][String(a.properties.BG_ID)].score;
        const bScore=model.scores[metric][String(b.properties.BG_ID)].score;
        const aPenalty=Number(a.properties.LAND_ACRE)/50,bPenalty=Number(b.properties.LAND_ACRE)/50;
        return Math.abs(aScore-targets[index])+aPenalty-Math.abs(bScore-targets[index])-bPenalty;
      });
      const shortlist=pool.slice(0,Math.min(8,pool.length));
      const feature=shortlist[Math.floor(rng()*shortlist.length)]||pool[0];
      const id=String(feature.properties.BG_ID);used.add(id);previous=center(feature);
      const record=model.scores[metric][id],context=model.context?.[id]||{},neighborhood=neighborhoodName(feature);
      return {index:index+1,metric,id,neighborhood,locationLabel:neighborhood?`${neighborhood} Block Group`:'',landAcres:Number(feature.properties.LAND_ACRE)||0,population:Number(feature.properties.POP)||0,score:Number(record.score)||0,rank:Number(record.rank)||536,reachableParks:Number(context.reachableParks)||0};
    });
  }
  function caption(){
    const node=document.createElement('section');
    node.className='access-story-caption is-intro';node.setAttribute('aria-live','polite');
    node.innerHTML='<small>SEATTLE PARK ACCESSIBILITY</small><strong>15-minute walking network</strong><i></i>';
    document.body.appendChild(node);return node;
  }
  function updateCaption(node,scene,meta,total){
    node.classList.remove('is-intro','is-outro');node.classList.add('is-changing');
    node.querySelector('small').textContent=`${String(scene.index).padStart(2,'0')} / ${String(total).padStart(2,'0')} · 15-MINUTE WALK`;
    node.querySelector('strong').textContent=meta.label;
    node.querySelector('i').style.width=(scene.index/total*100)+'%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>node.classList.remove('is-changing')));
  }
  function outroCaption(node){
    node.classList.add('is-outro');node.classList.remove('is-intro');
    node.querySelector('small').textContent='SEATTLE PARK ACCESSIBILITY';
    node.querySelector('strong').textContent='10 measures · 536 Block Groups';
    node.querySelector('i').style.width='100%';
  }
  async function waitForPage(){
    const started=Date.now();
    while((App.state.route!=='accessibility'||!App.Pages.accessibility?.story)&&Date.now()-started<20000)await sleep(100);
    if(App.state.route!=='accessibility')App.Core.Router.navigate('accessibility');
    while(App.state.route!=='accessibility'&&Date.now()-started<25000)await sleep(100);
  }
  async function run(){
    document.documentElement.classList.add('story-mode');
    await waitForPage();
    const api=App.Pages.accessibility.story;
    await api.preload();
    const scenes=chooseScenes(api);state.scenes=scenes;
    const node=caption();
    api.clear(0);state.status='ready';window.dispatchEvent(new CustomEvent('accessibility-story-ready',{detail:state}));
    await sleep(timing.intro);state.status='running';
    for(const scene of scenes){
      const meta=api.model().metrics[scene.metric];
      node.classList.add('is-changing');api.setMetric(scene.metric);await sleep(timing.transition);
      updateCaption(node,scene,meta,scenes.length);
      await api.select(scene.id,{duration:timing.move,maxZoom:14,originLabel:scene.locationLabel});
      await sleep(timing.move+timing.hold);
    }
    api.clear(timing.move);outroCaption(node);await sleep(timing.move+timing.outro);
    state.status='complete';state.completedAt=new Date().toISOString();
    window.dispatchEvent(new CustomEvent('accessibility-story-complete',{detail:state}));
  }
  window.addEventListener('load',()=>run().catch(error=>{state.status='error';state.error=error.message;console.error(error);App.utils.toast(error.message);}));
})(window.SeattleApp);
