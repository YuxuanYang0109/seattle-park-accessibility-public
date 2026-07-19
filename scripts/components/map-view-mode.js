(function(App){
  const mm=App.Core.MapManager;
  const supported=new Set(['study','accessibility']);
  const modes={study:'static',accessibility:'static'};

  function button(route){return document.querySelector(`[data-map-view-toggle="${route}"]`);}
  function render(route){
    const node=button(route),orbit=modes[route]==='orbit';if(!node)return;
    node.classList.toggle('is-orbit',orbit);node.setAttribute('aria-pressed',String(orbit));
    node.setAttribute('aria-label',orbit?'Switch to static map view':'Switch to orbiting map view');
    node.title=orbit?'Switch to static view':'Switch to orbit view';
    const label=node.querySelector('b');if(label)label.textContent=orbit?'Orbit':'Static';
  }
  function apply(route,duration=900){
    if(!supported.has(route)||App.state.route!==route)return;
    if(modes[route]==='orbit')mm.startOverviewMotion(route);else mm.fitSeattle(duration);
    render(route);
  }
  function set(route,mode,options={}){
    if(!supported.has(route)||!['static','orbit'].includes(mode))return;
    modes[route]=mode;render(route);
    if(options.apply!==false)apply(route,options.duration??800);
  }
  function toggle(route){set(route,modes[route]==='orbit'?'static':'orbit');}
  function enter(route){apply(route,1000);}
  function exit(route){if(supported.has(route))mm.stopOverviewMotion();}
  function pauseForSelection(route){
    if(modes[route]!=='orbit')return;
    set(route,'static',{apply:false});mm.stopOverviewMotion();mm.map.stop();
  }
  function init(){
    document.querySelectorAll('[data-map-view-toggle]').forEach(node=>{
      const route=node.dataset.mapViewToggle;if(!supported.has(route))return;
      node.addEventListener('click',()=>toggle(route));render(route);
    });
  }

  App.Components.MapViewMode={init,enter,exit,set,toggle,pauseForSelection,getMode:route=>modes[route]};
})(window.SeattleApp);
