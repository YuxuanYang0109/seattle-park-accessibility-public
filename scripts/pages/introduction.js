(function(App){
  let initialized=false;
  function configureVideo(){
    if(initialized)return;initialized=true;
    const video=document.querySelector('#intro-video'),placeholder=document.querySelector('#video-placeholder'),stage=video.closest('.video-stage'),button=document.querySelector('#video-control');
    const cfg=App.config.video;
    if(cfg.poster)video.poster=cfg.poster;
    if(cfg.src){video.src=cfg.src;video.addEventListener('loadeddata',()=>{stage.classList.add('has-video');placeholder.hidden=true;});video.addEventListener('error',()=>{stage.classList.remove('has-video');placeholder.hidden=false;});}
    button.addEventListener('click',()=>{if(!cfg.src){App.utils.toast('请先将视频路径写入 scripts/config.js');return;}if(video.paused){video.play();button.textContent='Ⅱ';}else{video.pause();button.textContent='▶';}});
  }
  App.Pages.introduction={
    async enter(){configureVideo();App.Core.MapManager.setVisible([]);App.Core.MapManager.clearPopups();document.querySelector('#app').classList.add('is-map-hidden');const video=document.querySelector('#intro-video');if(App.config.video.src)video.play().catch(()=>{});},
    exit(){const video=document.querySelector('#intro-video');video.pause();document.querySelector('#app').classList.remove('is-map-hidden');}
  };
})(window.SeattleApp);
