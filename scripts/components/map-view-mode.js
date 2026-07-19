(function(App){
  const mm=App.Core.MapManager;
  const supported=new Set(['introduction','accessibility']);
  const modes={introduction:'static',accessibility:'static'};
  const selectionActive={introduction:false,accessibility:false};

  function button(route){return document.querySelector(`[data-map-view-toggle="${route}"]`);}
  function render(route){
    const node=button(route),orbit=modes[route]==='orbit',paused=orbit&&selectionActive[route];if(!node)return;
    node.classList.toggle('is-orbit',orbit);node.classList.toggle('is-paused',paused);node.setAttribute('aria-pressed',String(orbit));
    node.setAttribute('aria-label',paused?'Orbit paused while map details are open':orbit?'Switch to static map view':'Switch to orbiting map view');
    node.title=paused?'Orbit resumes when details close · click for Static':orbit?'Switch to static view':'Switch to orbit view';
    const label=node.querySelector('b');if(label)label.textContent=paused?'Orbit paused':orbit?'Orbit':'Static';
  }
  function apply(route,duration=900){
    if(!supported.has(route)||App.state.route!==route)return;
    if(modes[route]==='orbit')mm.startOverviewMotion(route);else mm.fitSeattle(duration);
    render(route);
  }
  function set(route,mode,options={}){
    if(!supported.has(route)||!['static','orbit'].includes(mode))return;
    modes[route]=mode;render(route);
    if(selectionActive[route]){mm.stopOverviewMotion();mm.map.stop();return;}
    if(options.apply!==false)apply(route,options.duration??800);
  }
  function toggle(route){set(route,modes[route]==='orbit'?'static':'orbit');}
  function enter(route){selectionActive[route]=false;apply(route,1000);}
  function exit(route){if(!supported.has(route))return;selectionActive[route]=false;mm.stopOverviewMotion();render(route);}
  function pauseForSelection(route){
    if(!supported.has(route))return;
    selectionActive[route]=true;
    if(modes[route]==='orbit'){mm.stopOverviewMotion();mm.map.stop();}
    render(route);
  }
  function releaseSelection(route){
    if(!supported.has(route))return;
    const shouldResume=selectionActive[route]&&modes[route]==='orbit'&&App.state.route===route;
    selectionActive[route]=false;render(route);
    if(shouldResume)mm.startOverviewMotion(route);
  }
  function init(){
    document.querySelectorAll('[data-map-view-toggle]').forEach(node=>{
      const route=node.dataset.mapViewToggle;if(!supported.has(route))return;
      node.addEventListener('click',()=>toggle(route));render(route);
    });
  }

  App.Components.MapViewMode={init,enter,exit,set,toggle,pauseForSelection,releaseSelection,getMode:route=>modes[route],hasSelection:route=>Boolean(selectionActive[route])};
})(window.SeattleApp);
