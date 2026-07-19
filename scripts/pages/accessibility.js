(function(App){
  const mm=App.Core.MapManager,loader=App.Core.DataLoader,panel=App.Components.InfoPanel,{escape:esc,number:num,bbox}=App.utils;
  const baseIds=['access-group-fill','access-group-hover'];
  const routeIds=['access-route-lines','access-reachable-parks','access-route-travelers'];
  let ready=false,walkshedsReady=false,routesReady=false,bound=false,hoverPopup,routeMarkers=[],rankedAscending=[],rankingById=new Map(),featureById=new Map(),rankObserver,walkerFrame=0,walkerStart=0,walkerRoutes=[];
  let activeMetric='AREA';

  function model(){return window.WEBMAP_DATA.activityAccessibility;}
  function metricMeta(){return model().metrics[activeMetric];}
  function metricRecord(id){return model().scores[activeMetric]?.[String(id)]||{value:0,score:0,rank:536};}
  function accessClass(score){return score>=80?'Very high':score>=60?'High':score>=40?'Medium':score>=20?'Low':'Very low';}
  function scoreColor(score){
    const colors=App.config.accessColors,value=Math.max(0,Math.min(100,Number(score)||0)),scaled=value/25,index=Math.min(colors.length-2,Math.floor(scaled)),t=Math.min(1,scaled-index);
    const a=colors[index].match(/\w\w/g).map(hex=>parseInt(hex,16)),b=colors[index+1].match(/\w\w/g).map(hex=>parseInt(hex,16));
    return '#'+a.map((channel,i)=>Math.round(channel+(b[i]-channel)*t).toString(16).padStart(2,'0')).join('');
  }

  function metricIcon(name){
    const paths={
      park:'<path d="M12 3.2 7.6 9h2.5l-3.4 4.5h3.4v6.2h3.8v-6.2h3.4L13.9 9h2.5L12 3.2Z"/><path d="M4 20h16"/>',
      star:'<path d="m12 3.3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3.3Z"/>',
      areaStar:'<path d="M8.2 4.2 5.4 8h1.7L5 10.9h2.1v5.3h2.4v-5.3h2.1L9.5 8h1.6L8.2 4.2Z"/><path d="M3.5 19h9"/><path d="m17 7.1 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.7 1.4.5-3-2.1-2.1 3-.4L17 7.1Z"/>',
      diversity:'<circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="5.1" r="2.1"/><circle cx="18.2" cy="9" r="2.1"/><circle cx="15.8" cy="16.8" r="2.1"/><circle cx="8.2" cy="16.8" r="2.1"/><circle cx="5.8" cy="9" r="2.1"/><path d="M12 9.8V7.2M14 10.8l2.4-1.1M13.4 13.7l1.3 1.6M10.6 13.7l-1.3 1.6M10 10.8 7.6 9.7"/>',
      walk:'<circle cx="13.3" cy="4.6" r="2"/><path d="m11.8 8-2.5 4.2 3.2 2.3-1.8 5M11.2 9.2l4 2.1 2.2-1.3M12.6 14.6l3.3 4.7M7.6 11.4l-3 3"/>',
      fitness:'<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
      ball:'<circle cx="12" cy="12" r="8.2"/><path d="m8.8 5.6 1.3 4 3.8.1 1.3-4M10.1 9.6l-2.7 3 1.7 3.4M13.9 9.7l2.7 2.9-1.8 3.4M9.1 16h5.7"/>',
      water:'<path d="M3 10.2c2.2 0 2.2-1.7 4.4-1.7s2.2 1.7 4.4 1.7 2.2-1.7 4.4-1.7 2.2 1.7 4.4 1.7M3 14.3c2.2 0 2.2-1.7 4.4-1.7s2.2 1.7 4.4 1.7 2.2-1.7 4.4-1.7 2.2 1.7 4.4 1.7M3 18.4c2.2 0 2.2-1.7 4.4-1.7s2.2 1.7 4.4 1.7 2.2-1.7 4.4-1.7 2.2 1.7 4.4 1.7"/>',
      family:'<circle cx="8" cy="7" r="2.3"/><circle cx="16.3" cy="8" r="1.8"/><path d="M3.8 18c.4-4 1.8-6.1 4.2-6.1s3.8 2.1 4.2 6.1M13 17.7c.3-3.2 1.5-4.8 3.4-4.8s3 1.6 3.4 4.8"/>',
      nature:'<path d="M19 4.3c-7.1.3-11 3.2-11.7 8.5-.3 2.5 1.2 4.7 3.7 5 5.4.7 7.7-4.5 8-13.5Z"/><path d="M5 20c2.4-5.4 5.6-8.8 10.2-11"/>',
      culture:'<path d="M5 20V8.5h14V20M3.5 8.5 12 3l8.5 5.5M8.2 11.5v5M12 11.5v5M15.8 11.5v5M3.5 20h17"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.park}</svg>`;
  }

  function applyMetricProperties(){
    const features=window.WEBMAP_DATA.blockgroups.features;
    featureById=new Map();
    features.forEach(feature=>{
      const p=feature.properties,id=String(p.BG_ID),record=metricRecord(id);
      p.ACCESS_SCORE=Number(record.score)||0;
      p.ACCESS_RAW=Number(record.value)||0;
      p.ACCESS_RANK=Number(record.rank)||features.length;
      p.ACCESS_RANK_END=Number(record.rankEnd)||p.ACCESS_RANK;
      p.ACCESS_CLASS=accessClass(p.ACCESS_SCORE);
      featureById.set(id,feature);
    });
  }

  function prepareRanking(){
    const features=window.WEBMAP_DATA.blockgroups.features,total=features.length;
    rankedAscending=[...features].sort((a,b)=>Number(a.properties.ACCESS_SCORE)-Number(b.properties.ACCESS_SCORE)||String(a.properties.BG_ID).localeCompare(String(b.properties.BG_ID)));
    rankingById=new Map(features.map(feature=>{
      const p=feature.properties,rank=Number(p.ACCESS_RANK)||total,rankEnd=Number(p.ACCESS_RANK_END)||rank;
      return [String(p.BG_ID),{rank,rankEnd,tieCount:rankEnd-rank+1,total,topPercent:rank/total*100,score:Number(p.ACCESS_SCORE),rawValue:Number(p.ACCESS_RAW)}];
    }));
  }

  function renderMetricOptions(){
    const container=document.querySelector('#access-metric-options'),activeLabel=document.querySelector('#access-active-metric');
    if(!container)return;
    container.innerHTML=model().metricOrder.map(id=>{
      const meta=model().metrics[id],selected=id===activeMetric;
      return `<button class="access-metric-option${selected?' is-active':''}" type="button" data-access-metric="${id}" role="radio" aria-checked="${selected}" title="${esc(meta.label)} — ${esc(meta.examples)}"><span class="access-option-icon">${metricIcon(meta.icon)}</span><span><b>${esc(meta.shortLabel)}</b><small>${esc(meta.labelZh)}</small></span></button>`;
    }).join('');
    activeLabel.textContent=metricMeta().label;
    container.querySelectorAll('[data-access-metric]').forEach(button=>button.addEventListener('click',()=>setActiveMetric(button.dataset.accessMetric)));
  }

  function addGroupLayers(){
    if(ready)return;
    const data=window.WEBMAP_DATA.blockgroups,c=App.config.accessColors;
    const color=['interpolate',['linear'],['coalesce',['get','ACCESS_SCORE'],0],0,c[0],25,c[1],50,c[2],75,c[3],100,c[4]];
    mm.addSource('access-blockgroups',{type:'geojson',data});
    mm.addLayer({id:'access-group-fill',type:'fill',source:'access-blockgroups',paint:{'fill-color':color,'fill-opacity':.72,'fill-antialias':false,'fill-color-transition':{duration:520},'fill-opacity-transition':{duration:420}}});
    mm.addLayer({id:'access-group-hover',type:'fill',source:'access-blockgroups',filter:['==',['get','BG_ID'],'__none__'],paint:{'fill-color':'#fff','fill-opacity':.18,'fill-antialias':false}});
    ready=true;
  }

  function addWalksheds(){
    if(walkshedsReady)return;
    mm.addSource('access-bg-walksheds',{type:'geojson',data:window.WEBMAP_DATA.blockgroupWalksheds});
    mm.addLayer({id:'access-bg-walkshed-fill',type:'fill',source:'access-bg-walksheds',filter:['==',['get','BG_ID'],'__none__'],paint:{'fill-color':'#9e7eaf','fill-opacity':0,'fill-antialias':false,'fill-opacity-transition':{duration:550}}});
    walkshedsReady=true;
  }

  function addAccessRoutes(){
    if(routesReady)return;
    const data=window.WEBMAP_DATA.accessRoutes15;
    mm.addSource('access-route-data',{type:'geojson',data:data.routes});
    mm.addSource('access-reachable-park-data',{type:'geojson',data:data.parks});
    mm.addSource('access-route-traveler-data',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    const empty=['==',['get','BG_ID'],'__none__'];
    mm.addLayer({id:'access-route-lines',type:'line',source:'access-route-data',filter:empty,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#315f52','line-width':['interpolate',['linear'],['zoom'],10,2.1,14,3.5],'line-opacity':.9,'line-opacity-transition':{duration:650}}});
    mm.addLayer({id:'access-reachable-parks',type:'circle',source:'access-reachable-park-data',filter:empty,paint:{'circle-radius':['interpolate',['linear'],['zoom'],10,4,14,6],'circle-color':'#2f7652','circle-opacity':.96,'circle-blur':.04,'circle-opacity-transition':{duration:650}}});
    mm.addLayer({id:'access-route-travelers',type:'circle',source:'access-route-traveler-data',filter:empty,paint:{'circle-radius':['interpolate',['linear'],['zoom'],10,3.7,14,5.2],'circle-color':['get','color'],'circle-stroke-color':'#fff','circle-stroke-width':1.8,'circle-opacity':.98,'circle-blur':.04}});
    routesReady=true;
  }

  function clearRouteMarkers(){routeMarkers.splice(0).forEach(marker=>marker.remove());}
  function markerIcon(type){
    return type==='home'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.2 12 4l8.5 7.2v8.3h-6v-5h-5v5h-6z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 7.6 9h2.5l-3.4 4.5h3.4v6.2h3.8v-6.2h3.4L13.9 9h2.5z"/></svg>';
  }
  function renderRouteMarkers(id,options={}){
    clearRouteMarkers();
    const features=window.WEBMAP_DATA.accessRoutes15?.parks?.features?.filter(item=>String(item.properties.BG_ID)===id)||[],seenParks=new Set();
    const markerFeatures=options.story?[...features].sort((a,b)=>Number(a.properties.DIST_M)-Number(b.properties.DIST_M)).filter(feature=>{
      const key=String(feature.properties.PARK_NAME||feature.properties.PARK_OID||'').trim().toUpperCase();if(seenParks.has(key))return false;seenParks.add(key);return true;
    }).slice(0,8):features;
    markerFeatures.forEach(feature=>{
      const p=feature.properties,element=document.createElement('div');
      if(options.story){
        const label=String(p.PARK_NAME||'').trim();element.className='story-location-marker story-park-location';
        element.style.setProperty('--story-color',options.color||'#5299cc');
        element.innerHTML=`${label?`<span>${esc(label)}</span>`:''}<i>${markerIcon('park')}</i>`;
      }else{
        element.className='access-park-marker';element.innerHTML=`<i></i><span><b>${esc(p.PARK_NAME)}</b><small>${esc(p.DIST_LABEL)}</small></span>`;
      }
      routeMarkers.push(new maplibregl.Marker({element,anchor:'bottom',offset:[0,-4]}).setLngLat(feature.geometry.coordinates).addTo(mm.map));
    });
    if(options.story){
      const routes=window.WEBMAP_DATA.accessRoutes15?.routes?.features?.filter(item=>String(item.properties.BG_ID)===id)||[],origin=routes[0]?.geometry?.coordinates?.[0];
      if(origin){
        const element=document.createElement('div'),label=String(options.originLabel||'').trim();element.className='story-location-marker story-home-location';element.style.setProperty('--story-color',options.color||'#5299cc');
        element.innerHTML=`${label?`<span>${esc(label)}</span>`:''}<i>${markerIcon('home')}</i>`;
        routeMarkers.push(new maplibregl.Marker({element,anchor:'bottom',offset:[0,-3]}).setLngLat(origin).addTo(mm.map));
      }
    }
  }

  function routeMetrics(coordinates){
    const segments=[],latitude=Math.PI/180*(coordinates.reduce((sum,p)=>sum+p[1],0)/coordinates.length),xScale=Math.cos(latitude);let total=0;
    for(let i=1;i<coordinates.length;i++){const dx=(coordinates[i][0]-coordinates[i-1][0])*xScale,dy=coordinates[i][1]-coordinates[i-1][1];total+=Math.hypot(dx,dy);segments.push(total);}
    return {segments,total};
  }
  function pointAlong(route,progress){
    const target=route.metrics.total*Math.max(0,Math.min(1,progress));let index=route.metrics.segments.findIndex(value=>value>=target);if(index<0)index=route.coordinates.length-2;
    const previous=index?route.metrics.segments[index-1]:0,span=Math.max(.0000001,route.metrics.segments[index]-previous),t=(target-previous)/span,a=route.coordinates[index],b=route.coordinates[index+1];
    return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  }
  function stopRouteTravelers(){
    cancelAnimationFrame(walkerFrame);walkerFrame=0;walkerStart=0;walkerRoutes=[];
    mm.map.getSource('access-route-traveler-data')?.setData({type:'FeatureCollection',features:[]});
  }
  function startRouteTravelers(id,color){
    stopRouteTravelers();
    const routes=window.WEBMAP_DATA.accessRoutes15?.routes?.features?.filter(item=>String(item.properties.BG_ID)===id)||[];
    walkerRoutes=routes.slice(0,12).map((feature,index)=>({id,index,coordinates:feature.geometry.coordinates,metrics:routeMetrics(feature.geometry.coordinates)})).filter(route=>route.coordinates.length>1&&route.metrics.total>0);
    function animate(time){
      if(!walkerStart)walkerStart=time;
      const features=walkerRoutes.map(route=>{
        const duration=10500+route.index%4*1150,phase=((time-walkerStart)+route.index*1370)%duration/duration,progress=phase<.5?phase*2:2-phase*2;
        return {type:'Feature',geometry:{type:'Point',coordinates:pointAlong(route,progress)},properties:{BG_ID:id,color}};
      });
      mm.map.getSource('access-route-traveler-data')?.setData({type:'FeatureCollection',features});walkerFrame=requestAnimationFrame(animate);
    }
    walkerFrame=requestAnimationFrame(animate);
  }

  function filterSelectedNetwork(id){
    if(walkshedsReady)mm.map.setFilter('access-bg-walkshed-fill',['==',['get','BG_ID'],id]);
    if(routesReady)routeIds.forEach(layer=>mm.map.setFilter(layer,['==',['get','BG_ID'],id]));
  }

  function fitSelectedNetwork(id,feature,options={}){
    const routes=window.WEBMAP_DATA.accessRoutes15?.routes?.features?.filter(item=>String(item.properties.BG_ID)===id)||[];
    let bounds=bbox(feature.geometry);
    routes.forEach(route=>{const box=bbox(route.geometry);bounds=[Math.min(bounds[0],box[0]),Math.min(bounds[1],box[1]),Math.max(bounds[2],box[2]),Math.max(bounds[3],box[3])];});
    const padding=options.story
      ? (innerWidth<760?{top:125,bottom:85,left:34,right:34}:{top:125,bottom:105,left:120,right:120})
      : (innerWidth<760?{top:170,bottom:90,left:28,right:28}:{top:145,bottom:95,left:330,right:460});
    mm.map.fitBounds(bounds,{padding,duration:options.duration||750,maxZoom:options.maxZoom||14.2,essential:true});
  }

  function chartColor(score){
    const colors=App.config.accessColors;
    return colors[Math.min(colors.length-1,Math.max(0,Math.floor(Math.min(99.999,score)/20)))];
  }

  function bindRankChart(selectedId){
    rankObserver?.disconnect();
    const canvas=document.querySelector('#access-rank-chart'),tooltip=document.querySelector('#access-chart-tooltip');
    if(!canvas||!rankedAscending.length)return;
    const selectedIndex=rankedAscending.findIndex(feature=>String(feature.properties.BG_ID)===selectedId);
    function draw(){
      const width=Math.max(280,Math.round(canvas.getBoundingClientRect().width)),height=118,dpr=Math.min(2,devicePixelRatio||1);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=height+'px';
      const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
      const top=9,baseline=106,plotHeight=baseline-top,step=width/rankedAscending.length;
      ctx.save();ctx.strokeStyle='rgba(77,89,108,.1)';ctx.lineWidth=1;ctx.setLineDash([2,4]);
      [25,50,75].forEach(value=>{const y=baseline-value/100*plotHeight;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();});ctx.restore();
      rankedAscending.forEach((feature,index)=>{
        const score=Math.max(0,Math.min(100,Number(feature.properties.ACCESS_SCORE)||0)),barHeight=Math.max(1,score/100*plotHeight);
        ctx.fillStyle=chartColor(score);ctx.globalAlpha=.78;ctx.fillRect(index*step,baseline-barHeight,Math.max(.55,step*.88),barHeight);
      });
      ctx.globalAlpha=1;
      if(selectedIndex>=0){
        const score=Math.max(0,Math.min(100,Number(rankedAscending[selectedIndex].properties.ACCESS_SCORE)||0)),barHeight=Math.max(3,score/100*plotHeight),x=(selectedIndex+.5)*step;
        ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,baseline+1);ctx.lineTo(x,baseline-barHeight-2);ctx.stroke();
        ctx.strokeStyle='#152238';ctx.lineWidth=2.7;ctx.beginPath();ctx.moveTo(x,baseline+1);ctx.lineTo(x,baseline-barHeight-2);ctx.stroke();
        ctx.fillStyle='#152238';ctx.beginPath();ctx.arc(x,Math.max(5,baseline-barHeight-5),3.5,0,Math.PI*2);ctx.fill();
      }
    }
    function chartItem(event){const rect=canvas.getBoundingClientRect(),x=Math.max(0,Math.min(rect.width-1,event.clientX-rect.left)),index=Math.min(rankedAscending.length-1,Math.floor(x/rect.width*rankedAscending.length));return {feature:rankedAscending[index],x};}
    canvas.addEventListener('mousemove',event=>{
      const {feature,x}=chartItem(event),p=feature.properties,rank=rankingById.get(String(p.BG_ID));
      const rankLabel=rank.rankEnd>rank.rank?`#${rank.rank}–${rank.rankEnd}`:`#${rank.rank}`;
      tooltip.innerHTML=`<b>${esc(p.NAME)}</b><span>${num(p.ACCESS_SCORE,1)} percentile · Rank ${rankLabel}</span>`;
      tooltip.style.left=Math.max(62,Math.min(canvas.clientWidth-62,x))+'px';tooltip.classList.add('is-visible');
    });
    canvas.addEventListener('mouseleave',()=>tooltip.classList.remove('is-visible'));
    canvas.addEventListener('click',event=>{const feature=chartItem(event).feature;if(feature)selectGroup(feature);});
    draw();if(window.ResizeObserver){rankObserver=new ResizeObserver(draw);rankObserver.observe(canvas.parentElement);}
  }

  function panelContext(id){
    return {id:activeMetric,meta:metricMeta(),record:metricRecord(id),method:model().method,context:model().context?.[String(id)]||{},reachableParks:window.WEBMAP_DATA.accessRoutes15?.byGroup?.[String(id)]};
  }

  function renderSelected(feature){
    const p=feature.properties,id=String(p.BG_ID),profile=(window.WEBMAP_DATA.blockgroupDemographics||{})[p.GEOID20]||{},ranking=rankingById.get(id)||{};
    panel.open('#access-panel',panel.access(p,profile,ranking,panelContext(id)));
    bindRankChart(id);document.querySelector('#clear-community').onclick=clearSelection;
  }

  async function selectGroup(feature,fit=true,options={}){
    const p=feature.properties,id=String(p.BG_ID);
    const storyColor=scoreColor(metricRecord(id).score);
    App.state.selected=id;
    mm.map.setPaintProperty('access-group-fill','fill-opacity',['case',['==',['get','BG_ID'],id],.84,.22]);
    if(!options.story)renderSelected(feature);
    if(fit&&!options.story){
      const padding=innerWidth<760?{top:170,bottom:90,left:28,right:28}:{top:145,bottom:95,left:80,right:460};
      mm.map.fitBounds(bbox(feature.geometry),{padding,duration:950,maxZoom:14.2});
    }
    try{
      await Promise.all([loader.load('blockgroupWalksheds'),loader.load('accessRoutes15')]);addWalksheds();addAccessRoutes();
      if(String(App.state.selected)!==id)return;
      if(options.story){
        const scale=innerWidth>=2200?4/3:1;
        mm.map.setPaintProperty('access-bg-walkshed-fill','fill-opacity',0);
        mm.map.setPaintProperty('access-route-lines','line-opacity',0);
        mm.map.setPaintProperty('access-reachable-parks','circle-opacity',0);
        mm.map.setPaintProperty('access-route-lines','line-color',storyColor);
        mm.map.setPaintProperty('access-route-lines','line-width',['interpolate',['linear'],['zoom'],10,2.1*scale,14,3.5*scale]);
        mm.map.setPaintProperty('access-route-travelers','circle-radius',['interpolate',['linear'],['zoom'],10,3.7*scale,14,5.2*scale]);
      }
      filterSelectedNetwork(id);
      renderRouteMarkers(id,{...options,color:storyColor});
      if(options.story)startRouteTravelers(id,storyColor);else stopRouteTravelers();
      ['access-bg-walkshed-fill',...routeIds].forEach(layer=>mm.map.setLayoutProperty(layer,'visibility','visible'));
      requestAnimationFrame(()=>{
        mm.map.setPaintProperty('access-bg-walkshed-fill','fill-opacity',.13);
        if(options.story){
          mm.map.setPaintProperty('access-route-lines','line-opacity',.9);
          mm.map.setPaintProperty('access-reachable-parks','circle-opacity',0);
        }
      });
      if(!options.story)renderSelected(feature);
      if(fit)fitSelectedNetwork(id,feature,options);
    }catch(error){App.utils.toast(error.message);}
  }

  function setActiveMetric(metricId){
    if(!model().metrics[metricId]||metricId===activeMetric)return;
    activeMetric=metricId;applyMetricProperties();prepareRanking();
    if(ready)mm.map.getSource('access-blockgroups')?.setData(window.WEBMAP_DATA.blockgroups);
    renderMetricOptions();hoverPopup?.remove();
    const selected=App.state.selected&&featureById.get(String(App.state.selected));
    if(selected)renderSelected(selected);
  }

  function clearSelection(duration=800,options={}){
    App.state.selected=null;rankObserver?.disconnect();panel.close('#access-panel');
    if(!ready)return;
    clearRouteMarkers();stopRouteTravelers();mm.map.setPaintProperty('access-group-fill','fill-opacity',.72);
    if(walkshedsReady)mm.map.setFilter('access-bg-walkshed-fill',['==',['get','BG_ID'],'__none__']);
    if(routesReady)routeIds.forEach(layer=>mm.map.setFilter(layer,['==',['get','BG_ID'],'__none__']));
    mm.fitSeattle(duration);
  }

  function bind(){
    if(bound)return;bound=true;
    mm.on('click','access-group-fill',event=>selectGroup(event.features[0]));
    mm.on('mousemove','access-group-fill',event=>{
      const feature=event.features[0],p=feature.properties,id=String(p.BG_ID),rank=rankingById.get(id);mm.map.getCanvas().style.cursor='pointer';
      mm.map.setFilter('access-group-hover',['==',['get','BG_ID'],id]);
      if(!hoverPopup)hoverPopup=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:12});
      const rankLabel=rank?.rankEnd>rank?.rank?`#${rank.rank}–${rank.rankEnd}`:`#${rank?.rank||'—'}`;
      hoverPopup.setLngLat(event.lngLat).setHTML(`<div class="hover-card"><b>${esc(p.NAME)}</b><span>${esc(metricMeta().shortLabel)} · ${num(p.ACCESS_SCORE,1)} percentile · Rank ${rankLabel}</span></div>`).addTo(mm.map);
    });
    mm.on('mouseleave','access-group-fill',()=>{mm.map.getCanvas().style.cursor='';mm.map.setFilter('access-group-hover',['==',['get','BG_ID'],'__none__']);hoverPopup?.remove();});
  }

  App.Pages.accessibility={
    async enter(){
      document.querySelector('#app').classList.remove('is-map-hidden');panel.close('#access-panel');
      try{
        await Promise.all([loader.load('blockgroups'),loader.load('blockgroupDemographics'),loader.load('activityAccessibility')]);
        activeMetric=activeMetric||model().defaultMetric;applyMetricProperties();prepareRanking();renderMetricOptions();addGroupLayers();
        if(ready)mm.map.getSource('access-blockgroups')?.setData(window.WEBMAP_DATA.blockgroups);
        const visible=[...baseIds];if(walkshedsReady)visible.push('access-bg-walkshed-fill');if(routesReady)visible.push(...routeIds);
        mm.setVisible(visible);clearSelection();bind();
      }catch(error){App.utils.toast(error.message);}
    },
    exit(){hoverPopup?.remove();rankObserver?.disconnect();clearSelection();},
    story:{
      async preload(){
        await Promise.all([loader.load('blockgroups'),loader.load('blockgroupDemographics'),loader.load('activityAccessibility'),loader.load('blockgroupWalksheds'),loader.load('accessRoutes15'),loader.load('neighborhoods')]);
        activeMetric=activeMetric||model().defaultMetric;applyMetricProperties();prepareRanking();addGroupLayers();addWalksheds();addAccessRoutes();
        mm.map.getSource('access-blockgroups')?.setData(window.WEBMAP_DATA.blockgroups);
        mm.setVisible([...baseIds,'access-bg-walkshed-fill',...routeIds]);
      },
      setMetric(metricId){setActiveMetric(metricId);},
      async select(id,options={}){
        const feature=featureById.get(String(id));
        if(!feature)throw new Error(`Unknown Block Group ${id}`);
        return selectGroup(feature,true,{story:true,...options});
      },
      clear(duration=1800){clearSelection(duration,{story:true});},
      feature(id){return featureById.get(String(id));},
      record(id,metricId=activeMetric){return model().scores[metricId]?.[String(id)]||null;},
      context(id){return model().context?.[String(id)]||{};},
      model
    }
  };
})(window.SeattleApp);
