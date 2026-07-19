(function(App){
  let modal,dialog,figureImage,figureFallback,eyebrow,title,intro,label,itemTitle,text,caption,counter,dots,previous,next,emptyState,reader;
  let sectionKey='study',itemIndex=0,lastFocus=null,isInitialized=false,closeTimer=null;

  const content=()=>window.ANALYSIS_CONTENT?.[sectionKey];
  const items=()=>content()?.items||[];

  function setImage(item){
    figureImage.classList.remove('is-loaded');
    const stacked=item.layout==='stacked';
    reader.classList.toggle('is-stacked',stacked);
    reader.classList.toggle('is-split',!stacked);
    figureFallback.hidden=true;
    figureImage.alt=item.alt||item.title||'Analysis figure';
    figureImage.onload=()=>figureImage.classList.add('is-loaded');
    figureImage.onerror=()=>{
      figureImage.classList.remove('is-loaded');
      figureFallback.hidden=false;
      figureFallback.querySelector('b').textContent='Figure unavailable';
      figureFallback.querySelector('span').textContent=item.image;
    };
    figureImage.src=item.image;
  }

  function render(){
    const section=content();
    const sectionItems=items();
    eyebrow.textContent=section?.eyebrow||'Analysis';
    title.textContent=section?.title||'Analysis Notes';
    intro.textContent=section?.intro||'';
    intro.hidden=!section?.intro;
    reader.hidden=!sectionItems.length;
    emptyState.hidden=Boolean(sectionItems.length);

    if(!sectionItems.length){
      emptyState.querySelector('code:last-child').textContent=section?.folder||'assets/';
      counter.textContent='No figures yet';
      dots.innerHTML='';
      previous.disabled=true;
      next.disabled=true;
      return;
    }

    itemIndex=Math.max(0,Math.min(itemIndex,sectionItems.length-1));
    const item=sectionItems[itemIndex];
    setImage(item);
    label.textContent=item.label||`Figure ${String(itemIndex+1).padStart(2,'0')}`;
    itemTitle.textContent=item.title||'';
    itemTitle.hidden=!item.title;
    text.textContent=item.text||'';
    text.hidden=!item.text;
    caption.textContent=item.caption||'';
    caption.hidden=!item.caption;
    counter.textContent=`${String(itemIndex+1).padStart(2,'0')} / ${String(sectionItems.length).padStart(2,'0')}`;
    previous.disabled=itemIndex===0;
    next.disabled=itemIndex===sectionItems.length-1;
    dots.innerHTML=sectionItems.map((entry,index)=>`<button type="button" class="${index===itemIndex?'is-active':''}" data-analysis-index="${index}" aria-label="Show ${App.utils.escape(entry.label||`figure ${index+1}`)}" aria-current="${index===itemIndex?'true':'false'}"></button>`).join('');
    dots.querySelectorAll('[data-analysis-index]').forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.analysisIndex))));
    if(sectionItems[itemIndex+1]){
      const preload=new Image();
      preload.src=sectionItems[itemIndex+1].image;
    }
  }

  function show(index){
    if(!items().length)return;
    itemIndex=Math.max(0,Math.min(index,items().length-1));
    render();
  }

  function open(key,index=0){
    if(!window.ANALYSIS_CONTENT?.[key])return;
    clearTimeout(closeTimer);
    sectionKey=key;
    itemIndex=index;
    lastFocus=document.activeElement;
    render();
    modal.hidden=false;
    requestAnimationFrame(()=>modal.classList.add('is-open'));
    modal.setAttribute('aria-hidden','false');
    document.querySelector('#app')?.classList.add('analysis-is-open');
    dialog.querySelector('.analysis-modal-close').focus({preventScroll:true});
  }

  function close(options={}){
    if(!modal||modal.hidden)return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.querySelector('#app')?.classList.remove('analysis-is-open');
    clearTimeout(closeTimer);
    closeTimer=window.setTimeout(()=>{modal.hidden=true;},260);
    if(options.restoreFocus!==false&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
  }

  function trapFocus(event){
    const focusable=[...dialog.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(element=>!element.hidden);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }

  function onKeydown(event){
    if(modal.hidden)return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
    else if(event.key==='ArrowRight'){event.preventDefault();event.stopImmediatePropagation();show(itemIndex+1);}
    else if(event.key==='ArrowLeft'){event.preventDefault();event.stopImmediatePropagation();show(itemIndex-1);}
    else if(event.key==='Tab')trapFocus(event);
  }

  function init(){
    if(isInitialized)return;
    isInitialized=true;
    modal=document.querySelector('#analysis-modal');
    dialog=modal.querySelector('.analysis-dialog');
    figureImage=modal.querySelector('#analysis-figure-image');
    figureFallback=modal.querySelector('#analysis-figure-fallback');
    eyebrow=modal.querySelector('#analysis-eyebrow');
    title=modal.querySelector('#analysis-title');
    intro=modal.querySelector('#analysis-intro');
    label=modal.querySelector('#analysis-item-label');
    itemTitle=modal.querySelector('#analysis-item-title');
    text=modal.querySelector('#analysis-item-text');
    caption=modal.querySelector('#analysis-caption');
    counter=modal.querySelector('#analysis-counter');
    dots=modal.querySelector('#analysis-dots');
    previous=modal.querySelector('#analysis-previous');
    next=modal.querySelector('#analysis-next');
    emptyState=modal.querySelector('#analysis-empty');
    reader=modal.querySelector('#analysis-reader');
    document.querySelectorAll('[data-analysis-open]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.analysisOpen)));
    modal.querySelectorAll('[data-analysis-close]').forEach(button=>button.addEventListener('click',()=>close()));
    previous.addEventListener('click',()=>show(itemIndex-1));
    next.addEventListener('click',()=>show(itemIndex+1));
    document.addEventListener('keydown',onKeydown);
  }

  App.Components.AnalysisModal={init,open,close,isOpen:()=>Boolean(modal&&!modal.hidden)};
})(window.SeattleApp);
