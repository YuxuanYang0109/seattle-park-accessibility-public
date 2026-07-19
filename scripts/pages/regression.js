(function(App){
  let initialized=false,index=0,shell,body,image,concept,fallback,label,title,text,counter,previous,next,dots;

  const conceptIcons={
    policy:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M28 27h48l16 16v51H28z"/><path d="M76 27v18h16M43 57l7 7 13-15M43 77l7 7 13-15M70 59h11M70 79h11"/></svg>',
    contribution:'<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="15"/><circle cx="27" cy="28" r="10"/><circle cx="93" cy="28" r="10"/><circle cx="27" cy="92" r="10"/><circle cx="93" cy="92" r="10"/><path d="M49 49 34 35M71 49l15-14M49 71 34 85M71 71l15 14M60 53v14M53 60h14"/></svg>',
    limitations:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 20 102 94H18z"/><path d="M60 46v23"/><circle cx="60" cy="81" r="2"/><path class="orbit" d="M20 43C39 19 82 15 101 43M16 76c18 26 65 34 91 5"/></svg>',
    conclusion:'<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="39"/><circle cx="60" cy="60" r="25"/><path d="m43 60 11 11 24-27"/><path class="orbit" d="M19 59C29 27 66 10 95 29"/></svg>'
  };

  const items=()=>window.ANALYSIS_CONTENT?.regression?.items||[];

  function conceptMarkup(item){
    const tags=(item.tags||[]).map(tag=>`<span>${App.utils.escape(tag)}</span>`).join('');
    return `<div class="analysis-concept-orbit"><i></i><i></i><i></i><div class="analysis-concept-symbol">${conceptIcons[item.icon]||conceptIcons.conclusion}</div></div><b>${App.utils.escape(item.label||'Key insight')}</b><div class="analysis-concept-tags">${tags}</div>`;
  }

  function applyProfile(item,width=1,height=1){
    body.classList.remove('is-panorama','is-portrait','is-concept');
    if(!item.image)body.classList.add('is-concept');
    else if(item.layout==='stacked'||width/Math.max(1,height)>=2.2)body.classList.add('is-panorama');
    else if(width/Math.max(1,height)<=.82)body.classList.add('is-portrait');
  }

  function render(){
    const entries=items();
    if(!entries.length)return;
    index=Math.max(0,Math.min(index,entries.length-1));
    const item=entries[index];
    shell.classList.add('is-updating');
    label.textContent=item.label||`Figure ${String(index+1).padStart(2,'0')}`;
    title.textContent=item.title||'';
    text.textContent=item.text||'';
    counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(entries.length).padStart(2,'0')}`;
    previous.disabled=index===0;
    next.disabled=index===entries.length-1;
    dots.innerHTML=entries.map((entry,dotIndex)=>`<button type="button" class="${dotIndex===index?'is-active':''}" data-regression-index="${dotIndex}" aria-label="Show ${App.utils.escape(entry.label||`page ${dotIndex+1}`)}" aria-current="${dotIndex===index?'true':'false'}"></button>`).join('');
    dots.querySelectorAll('[data-regression-index]').forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.regressionIndex))));

    fallback.hidden=true;
    image.classList.remove('is-loaded');
    image.hidden=!item.image;
    concept.hidden=Boolean(item.image);
    if(item.image){
      concept.innerHTML='';
      image.alt=item.title||'Regression figure';
      image.onload=()=>{
        applyProfile(item,image.naturalWidth,image.naturalHeight);
        image.classList.add('is-loaded');
        shell.classList.remove('is-updating');
      };
      image.onerror=()=>{
        fallback.hidden=false;
        applyProfile(item,1,1);
        shell.classList.remove('is-updating');
      };
      image.src=item.image;
    }else{
      image.removeAttribute('src');
      concept.innerHTML=conceptMarkup(item);
      applyProfile(item);
      requestAnimationFrame(()=>shell.classList.remove('is-updating'));
    }

    const following=entries[index+1];
    if(following?.image){const preload=new Image();preload.src=following.image;}
    const resetViewport=()=>document.querySelector('#app')?.scrollTo(0,0);
    requestAnimationFrame(resetViewport);window.setTimeout(resetViewport,100);
  }

  function show(nextIndex){
    if(!items().length)return;
    index=Math.max(0,Math.min(nextIndex,items().length-1));
    render();
  }

  function initReader(){
    if(initialized)return;
    initialized=true;
    shell=document.querySelector('#regression-reader-shell');
    body=document.querySelector('#regression-reader-body');
    image=document.querySelector('#regression-figure-image');
    concept=document.querySelector('#regression-concept-visual');
    fallback=document.querySelector('#regression-figure-fallback');
    label=document.querySelector('#regression-item-label');
    title=document.querySelector('#regression-item-title');
    text=document.querySelector('#regression-item-text');
    counter=document.querySelector('#regression-counter');
    previous=document.querySelector('#regression-previous');
    next=document.querySelector('#regression-next');
    dots=document.querySelector('#regression-dots');
    previous.addEventListener('click',()=>show(index-1));
    next.addEventListener('click',()=>show(index+1));
    render();
  }

  document.addEventListener('keydown',event=>{
    if(App.state.route!=='regression'||App.Components.AnalysisModal?.isOpen()||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();event.stopImmediatePropagation();
      show(index+(event.key==='ArrowRight'?1:-1));
    }
  },true);

  App.Pages.regression={
    async enter(){
      App.Core.MapManager.setVisible([]);App.Core.MapManager.clearPopups();
      document.querySelector('#app').classList.add('is-map-hidden');
      initReader();render();
    },
    exit(){document.querySelector('#app').classList.remove('is-map-hidden');}
  };
})(window.SeattleApp);
