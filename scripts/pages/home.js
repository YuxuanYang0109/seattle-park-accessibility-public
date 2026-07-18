(function(App){
  const mm=App.Core.MapManager,loader=App.Core.DataLoader;
  const layerIds=['home-parks-fill','home-parks-line','home-route-glow','home-routes','home-homes','home-destinations','home-travelers'];
  let ready=false,frame=0,startTime=0,routeCache=[];

  function addLayers(){
    if(ready)return;
    const scene=window.WEBMAP_DATA.homeScene;
    mm.addSource('home-parks',{type:'geojson',data:scene.parks});
    mm.addSource('home-routes',{type:'geojson',data:scene.routes});
    mm.addSource('home-homes',{type:'geojson',data:scene.homes});
    mm.addSource('home-destinations',{type:'geojson',data:scene.destinations});
    mm.addSource('home-travelers',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    mm.addLayer({id:'home-parks-fill',type:'fill',source:'home-parks',paint:{'fill-color':['get','color'],'fill-opacity':.48}});
    mm.addLayer({id:'home-parks-line',type:'line',source:'home-parks',paint:{'line-color':['get','color'],'line-width':1.2,'line-opacity':.78}});
    mm.addLayer({id:'home-route-glow',type:'line',source:'home-routes',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','color'],'line-width':7,'line-opacity':.1,'line-blur':2}});
    mm.addLayer({id:'home-routes',type:'line',source:'home-routes',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','color'],'line-width':2,'line-opacity':.76,'line-dasharray':[1.1,1]}});
    mm.addLayer({id:'home-homes',type:'circle',source:'home-homes',paint:{'circle-radius':5.2,'circle-color':'#fff','circle-stroke-color':['get','color'],'circle-stroke-width':2.4,'circle-opacity':.95}});
    mm.addLayer({id:'home-destinations',type:'circle',source:'home-destinations',paint:{'circle-radius':7.5,'circle-color':['get','color'],'circle-stroke-color':'#fff','circle-stroke-width':2.5}});
    mm.addLayer({id:'home-travelers',type:'circle',source:'home-travelers',paint:{'circle-radius':5,'circle-color':['get','color'],'circle-stroke-color':'#fff','circle-stroke-width':1.8,'circle-opacity':.98,'circle-blur':.05}});
    routeCache=scene.routes.features.map((feature,index)=>({
      id:feature.properties.id,index,color:feature.properties.color,park:feature.properties.park,
      coordinates:feature.geometry.coordinates,minutes:Number(feature.properties.minutes)||8,
      metrics:routeMetrics(feature.geometry.coordinates)
    }));
    renderParkKey(scene.parkColors||{});ready=true;
  }

  function renderParkKey(colors){
    const key=document.querySelector('#home-park-key');if(!key)return;
    key.innerHTML=Object.entries(colors).map(([name,color])=>`<span><i style="background:${color}"></i>${name.replace(' PARK','').replace('JIM ELLIS FREEWAY','FREEWAY').replace('VICTOR STEINBRUECK','STEINBRUECK')}</span>`).join('');
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

  function bidirectionalProgress(phase){
    if(phase<.08)return 0;if(phase<.46)return (phase-.08)/.38;if(phase<.54)return 1;if(phase<.92)return 1-(phase-.54)/.38;return 0;
  }

  function animate(time){
    if(!startTime)startTime=time;
    const features=routeCache.map(route=>{
      const duration=24000+route.minutes*600,phase=((time-startTime)+route.index*1310)%duration/duration,progress=bidirectionalProgress(phase);
      return {type:'Feature',geometry:{type:'Point',coordinates:pointAlong(route,progress)},properties:{id:route.id,color:route.color,park:route.park,direction:phase<.5?'to park':'to block'}};
    });
    mm.map.getSource('home-travelers')?.setData({type:'FeatureCollection',features});frame=requestAnimationFrame(animate);
  }

  function startAnimation(){cancelAnimationFrame(frame);startTime=0;document.querySelector('#active-walker-count').textContent=String(routeCache.length).padStart(2,'0');frame=requestAnimationFrame(animate);}
  function stopAnimation(){cancelAnimationFrame(frame);frame=0;startTime=0;mm.map.getSource('home-travelers')?.setData({type:'FeatureCollection',features:[]});}

  App.Pages.home={
    async enter(){
      document.querySelector('#app').classList.remove('is-map-hidden');
      try{await loader.load('homeScene');addLayers();mm.setVisible(layerIds);mm.clearPopups();mm.startHomeMotion();startAnimation();}
      catch(error){App.utils.toast(error.message);mm.setVisible([]);mm.startHomeMotion();}
    },
    exit(){mm.stopHomeMotion();stopAnimation();}
  };
})(window.SeattleApp);
