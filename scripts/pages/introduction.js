(function(App){
  let initialized=false,story,sections,frames,loadObserver,activeObserver,activeScene='rain';
  const sceneVisibility=new Map();
  let wheelAccumulator=0,wheelLocked=false,wheelResetTimer=null;

  function frameFor(scene){return sections.find(section=>section.dataset.commentScene===scene)?.querySelector('[data-scene-frame]');}

  function loadFrame(frame){
    if(!frame||frame.src)return;
    frame.src=frame.dataset.src;
    frame.addEventListener('load',()=>{
      frame.closest('.comment-scene-stage')?.classList.add('is-loaded');
      window.setTimeout(()=>postActivity(),900);
    },{once:true});
  }

  function postActivity(){
    frames.forEach(frame=>{
      if(!frame.src)return;
      frame.contentWindow?.postMessage({type:'park-scene:active',active:App.state.route==='study'&&frame.closest('[data-comment-scene]')?.dataset.commentScene===activeScene},'*');
    });
  }

  function setActive(scene){
    if(!scene)return;
    activeScene=scene;
    sections.forEach(section=>section.classList.toggle('is-current',section.dataset.commentScene===scene));
    document.querySelectorAll('[data-comment-jump]').forEach(button=>{
      const active=button.dataset.commentJump===scene;
      button.classList.toggle('is-active',active);
      active?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current');
    });
    const index=sections.findIndex(section=>section.dataset.commentScene===scene);
    document.querySelector('#comment-scene-counter').textContent=`${String(index+1).padStart(2,'0')} / ${String(sections.length).padStart(2,'0')}`;
    loadFrame(frameFor(scene));
    postActivity();
  }

  function jumpTo(scene){sections.find(item=>item.dataset.commentScene===scene)?.scrollIntoView({behavior:'smooth',block:'start'});}

  function stepByWheel(deltaY){
    if(wheelLocked)return;
    wheelAccumulator+=Number(deltaY)||0;
    clearTimeout(wheelResetTimer);
    wheelResetTimer=window.setTimeout(()=>{wheelAccumulator=0;},240);
    if(Math.abs(wheelAccumulator)<90)return;
    const currentIndex=sections.findIndex(section=>section.dataset.commentScene===activeScene);
    const targetIndex=Math.max(0,Math.min(sections.length-1,currentIndex+(wheelAccumulator>0?1:-1)));
    wheelAccumulator=0;
    if(targetIndex===currentIndex)return;
    wheelLocked=true;
    sections[targetIndex].scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(()=>{wheelLocked=false;},900);
  }

  function onMessage(event){
    if(App.state.route!=='study')return;
    if(!frames.some(frame=>frame.contentWindow===event.source))return;
    if(event.data?.type==='park-scene:view-exhibition'){
      jumpTo('mosaic');
      return;
    }
    if(event.data?.type==='park-scene:wheel')stepByWheel(event.data.deltaY);
  }

  function onStoryWheel(event){
    if(App.state.route!=='study')return;
    event.preventDefault();
    stepByWheel(event.deltaY);
  }

  function init(){
    if(initialized)return;
    initialized=true;
    story=document.querySelector('#comment-story');
    sections=[...story.querySelectorAll('[data-comment-scene]')];
    frames=sections.map(section=>section.querySelector('[data-scene-frame]'));
    document.querySelectorAll('[data-comment-jump]').forEach(button=>button.addEventListener('click',()=>jumpTo(button.dataset.commentJump)));
    story.querySelectorAll('[data-comment-next]').forEach(button=>button.addEventListener('click',()=>{
      const index=sections.indexOf(button.closest('[data-comment-scene]'));
      sections[index+1]?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    loadObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&loadFrame(entry.target.querySelector('[data-scene-frame]'))),{root:story,rootMargin:'65% 0px',threshold:.01});
    sections.forEach(section=>loadObserver.observe(section));
    activeObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>sceneVisibility.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0));
      const visible=sections.map(section=>({section,ratio:sceneVisibility.get(section)||0})).sort((a,b)=>b.ratio-a.ratio)[0];
      if(visible?.ratio>=.38)setActive(visible.section.dataset.commentScene);
    },{root:story,threshold:[.2,.38,.55,.72]});
    sections.forEach(section=>activeObserver.observe(section));
    story.addEventListener('wheel',onStoryWheel,{passive:false});
    window.addEventListener('message',onMessage);
    loadFrame(frames[0]);
    setActive('rain');
  }

  // Chapter 02 keeps the Study/Methodology identity but presents the comment-story content.
  App.Pages.study={
    async enter(previous){
      init();
      App.Core.MapManager.setVisible([]);
      App.Core.MapManager.clearPopups();
      document.querySelector('#app').classList.add('is-map-hidden');
      if(previous==='home')story.scrollTo({top:0,behavior:'auto'});
      const nearest=sections.reduce((best,section)=>Math.abs(section.offsetTop-story.scrollTop)<Math.abs(best.offsetTop-story.scrollTop)?section:best,sections[0]);
      setActive(nearest.dataset.commentScene);
    },
    exit(){
      document.querySelector('#app').classList.remove('is-map-hidden');
      frames?.forEach(frame=>frame.src&&frame.contentWindow?.postMessage({type:'park-scene:active',active:false},'*'));
    }
  };
})(window.SeattleApp);
