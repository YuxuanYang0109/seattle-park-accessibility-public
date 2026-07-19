(async function(App){
  try{
    window.addEventListener('resize',()=>{
      const resetViewport=()=>document.querySelector('#app')?.scrollTo(0,0);
      requestAnimationFrame(resetViewport);window.setTimeout(resetViewport,160);
    });
    await App.Core.MapManager.init();
    App.Components.AnalysisModal?.init();
    App.Components.MapViewMode?.init();
    App.Core.Router.init();
    await App.Pages.home.enter();
    const requested=location.hash.replace('#','');
    if(App.Pages[requested]&&requested!=='home')await App.Core.Router.navigate(requested);
  }catch(error){
    console.error(error);document.body.innerHTML=`<div style="padding:30px;font-family:sans-serif"><h1>Unable to start presentation</h1><p>${App.utils.escape(error.message)}</p></div>`;
  }
})(window.SeattleApp);
