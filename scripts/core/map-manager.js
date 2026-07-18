(function(App){
  let map,loadPromise,homeFrame,homeStart=0;
  const handlers=[],customLayers=new Set();
  const homeViews=[
    {center:[-122.336,47.678],zoom:13.05,bearing:-4},
    {center:[-122.332,47.676],zoom:13.22,bearing:3},
    {center:[-122.338,47.679],zoom:13.12,bearing:1},
    {center:[-122.336,47.678],zoom:13.05,bearing:-4}
  ];
  function init(){
    if(map)return loadPromise;
    map=new maplibregl.Map({container:'map',center:homeViews[0].center,zoom:homeViews[0].zoom,bearing:0,minZoom:9,maxZoom:18,attributionControl:true,style:{version:8,sources:{carto:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],tileSize:256,attribution:'© OpenStreetMap contributors © CARTO'}},layers:[{id:'carto-light',type:'raster',source:'carto',paint:{'raster-opacity':.9,'raster-saturation':-.35,'raster-contrast':-.08,'raster-brightness-max':1}}]}});
    map.addControl(new maplibregl.NavigationControl({showCompass:true}),'top-right');
    window.webmap=map;
    loadPromise=new Promise(resolve=>map.on('load',resolve));
    return loadPromise;
  }
  function addLayer(def,before){if(!map.getLayer(def.id)){map.addLayer(def,before);customLayers.add(def.id);}}
  function addSource(id,def){if(!map.getSource(id))map.addSource(id,def);}
  function setVisible(ids){customLayers.forEach(id=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',ids.includes(id)?'visible':'none');});}
  function on(event,layer,handler){if(typeof layer==='function'){handler=layer;layer=null;}layer?map.on(event,layer,handler):map.on(event,handler);handlers.push({event,layer,handler});}
  function clearHandlers(){handlers.splice(0).forEach(h=>h.layer?map.off(h.event,h.layer,h.handler):map.off(h.event,h.handler));map.getCanvas().style.cursor='';}
  function clearPopups(){document.querySelectorAll('.maplibregl-popup').forEach(el=>el.remove());}
  function fitSeattle(duration=900){map.fitBounds(App.config.seattleBounds,{padding:{top:120,bottom:75,left:45,right:45},duration,maxZoom:11.5});}
  function startHomeMotion(){
    stopHomeMotion();homeStart=performance.now();const mobile=innerWidth<760,zoom=mobile?13.3:14,focus=[-122.332,47.618],radius=[mobile ? 0.0135 : 0.0145,mobile ? 0.009 : 0.01],period=56000;
    function orbit(time){const angle=((time-homeStart)%period)/period*Math.PI*2;map.jumpTo({center:[focus[0]+Math.cos(angle)*radius[0],focus[1]+Math.sin(angle)*radius[1]],zoom,bearing:0,pitch:0});homeFrame=requestAnimationFrame(orbit);}
    homeFrame=requestAnimationFrame(orbit);
  }
  function stopHomeMotion(){if(homeFrame){cancelAnimationFrame(homeFrame);homeFrame=0;}homeStart=0;}
  function resize(){setTimeout(()=>map&&map.resize(),80);}
  App.Core.MapManager={init,get map(){return map;},addLayer,addSource,setVisible,on,clearHandlers,clearPopups,fitSeattle,startHomeMotion,stopHomeMotion,resize,customLayers};
})(window.SeattleApp);
