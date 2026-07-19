(function(App){
  const order=App.config.routes;
  let navigating=false,queuedRoute=null;
  async function navigate(route){
    if(!App.Pages[route])return;
    if(navigating){queuedRoute=route;return;}
    if(route===App.state.route)return;
    navigating=true;const previous=App.state.route,mm=App.Core.MapManager;
    try{
      App.Components.AnalysisModal?.close({restoreFocus:false});
      if(App.Pages[previous]?.exit)await App.Pages[previous].exit(route);
      mm.stopAllMotion();mm.map.stop();mm.clearHandlers();mm.clearPopups();mm.setVisible([]);
      App.state.route=route;document.querySelector('#app').dataset.route=route;
      document.querySelectorAll('[data-page]').forEach(page=>page.classList.toggle('is-active',page.dataset.page===route));
      document.querySelectorAll('[data-route-link]').forEach(button=>{const active=button.dataset.routeLink===route;button.classList.toggle('is-active',active);active?button.setAttribute('aria-current','page'):button.removeAttribute('aria-current');});
      updateControls(route);history.replaceState(null,'','#'+route);
      mm.resize();if(App.Pages[route]?.enter)await App.Pages[route].enter(previous);
    }finally{
      navigating=false;
      const next=queuedRoute;queuedRoute=null;
      if(next&&next!==App.state.route)queueMicrotask(()=>navigate(next));
    }
  }
  function updateControls(route){
    const index=order.indexOf(route),counter=document.querySelector('#page-counter'),bar=document.querySelector('.presentation-controls em'),topBar=document.querySelector('.chapter-progress i'),next=document.querySelector('#next-page span');
    if(index<0){counter.textContent='';bar.style.width='0';topBar.style.width='0';return;}
    counter.textContent=String(index+1).padStart(2,'0')+' / 04';const width=((index+1)/order.length*100)+'%';bar.style.width=width;topBar.style.width=width;next.textContent=index===order.length-1?'Back to home':'Next';
    const active=document.querySelector(`[data-route-link="${route}"]`);active?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  }
  function next(){const i=order.indexOf(App.state.route);navigate(i<0?order[0]:i===order.length-1?'home':order[i+1]);}
  function previous(){const i=order.indexOf(App.state.route);navigate(i<=0?'home':order[i-1]);}
  function init(){
    document.querySelectorAll('[data-route-link]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.routeLink)));
    document.querySelector('#start-presentation').addEventListener('click',()=>navigate('introduction'));
    document.querySelector('#next-page').addEventListener('click',next);document.querySelector('#previous-page').addEventListener('click',previous);
    document.querySelectorAll('[data-panel-close]').forEach(button=>button.addEventListener('click',()=>{
      const route=button.dataset.panelClose==='study'?'study':'accessibility';
      if(App.Pages[route]?.clearSelection)App.Pages[route].clearSelection();else App.Components.InfoPanel.close(route==='study'?'#study-panel':'#access-panel');
    }));
    document.addEventListener('keydown',event=>{if(App.Components.AnalysisModal?.isOpen()||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(event.key==='ArrowRight')next();if(event.key==='ArrowLeft')previous();if(event.key==='Escape')navigate('home');});
    window.addEventListener('hashchange',()=>{const route=location.hash.replace('#','');if(App.Pages[route])navigate(route);});
  }
  App.Core.Router={init,navigate,next,previous};
})(window.SeattleApp);
