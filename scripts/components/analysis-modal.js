(function(App){
  let modal,dialog,figureStage,figureImage,figureFallback,conceptVisual,eyebrow,title,intro,label,itemTitle,text,caption,counter,dots,previous,next,emptyState,reader;
  let sectionKey='study',itemIndex=0,lastFocus=null,isInitialized=false,closeTimer=null,profileWidth=1,profileHeight=1;

  const content=()=>window.ANALYSIS_CONTENT?.[sectionKey];
  const items=()=>content()?.items||[];

  const layoutClasses=['is-split','is-stacked','is-title-only','is-visual-only','is-concept'];
  const ratioClasses=['is-panorama','is-landscape','is-square','is-portrait'];

  const conceptIcons={
    policy:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M28 27h48l16 16v51H28z"/><path d="M76 27v18h16M43 57l7 7 13-15M43 77l7 7 13-15M70 59h11M70 79h11"/></svg>',
    contribution:'<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="15"/><circle cx="27" cy="28" r="10"/><circle cx="93" cy="28" r="10"/><circle cx="27" cy="92" r="10"/><circle cx="93" cy="92" r="10"/><path d="M49 49 34 35M71 49l15-14M49 71 34 85M71 71l15 14M60 53v14M53 60h14"/></svg>',
    limitations:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 20 102 94H18z"/><path d="M60 46v23"/><circle cx="60" cy="81" r="2"/><path class="orbit" d="M20 43C39 19 82 15 101 43M16 76c18 26 65 34 91 5"/></svg>',
    conclusion:'<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="39"/><circle cx="60" cy="60" r="25"/><path d="m43 60 11 11 24-27"/><path class="orbit" d="M19 59C29 27 66 10 95 29"/></svg>'
  };

  const imageSources=item=>item.images?.length?item.images:(item.image?[item.image]:[]);

  function layoutFor(item){
    if(!imageSources(item).length)return 'is-concept';
    if(item.layout==='stacked')return 'is-stacked';
    if(item.text||item.caption)return 'is-split';
    if(item.title)return 'is-title-only';
    return 'is-visual-only';
  }

  function ratioFor(width,height){
    const ratio=width/Math.max(1,height);
    if(ratio>=2.35)return 'is-panorama';
    if(ratio>=1.15)return 'is-landscape';
    if(ratio<=.82)return 'is-portrait';
    return 'is-square';
  }

  function sizeDialog(item,width,height){
    const layout=layoutFor(item);
    const ratio=width/Math.max(1,height);
    const compact=window.innerWidth<=760;
    const viewportMargin=compact?16:48;
    const maxWidth=Math.max(320,window.innerWidth-viewportMargin);
    const maxHeight=Math.max(420,window.innerHeight-viewportMargin);
    let targetWidth;
    let targetHeight;

    if(layout==='is-concept'){
      targetWidth=Math.min(maxWidth,1180);
      targetHeight=Math.min(maxHeight,760);
    }else if(layout==='is-visual-only'){
      const chrome=compact?138:148;
      const horizontalSpace=compact?32:60;
      const stageHeight=Math.min(maxHeight-chrome,(maxWidth-horizontalSpace)/ratio);
      targetWidth=Math.min(maxWidth,Math.max(compact?320:520,stageHeight*ratio+horizontalSpace));
      targetHeight=Math.min(maxHeight,Math.max(compact?300:430,stageHeight+chrome));
    }else if(layout==='is-title-only'){
      const chrome=compact?194:210;
      const horizontalSpace=compact?32:60;
      const stageHeight=Math.min(maxHeight-chrome,(maxWidth-horizontalSpace)/ratio);
      targetWidth=Math.min(maxWidth,Math.max(compact?340:720,stageHeight*ratio+horizontalSpace));
      targetHeight=Math.min(maxHeight,Math.max(compact?370:500,stageHeight+chrome));
    }else if(layout==='is-stacked'){
      targetWidth=Math.min(maxWidth,Math.max(1080,Math.min(1480,ratio*470)));
      targetHeight=Math.min(maxHeight,Math.max(720,(targetWidth-60)/ratio+330));
    }else{
      targetWidth=Math.min(maxWidth,Math.max(1080,760+ratio*340));
      targetHeight=maxHeight;
    }

    dialog.style.setProperty('--analysis-dialog-width',`${Math.round(targetWidth)}px`);
    dialog.style.setProperty('--analysis-dialog-height',`${Math.round(targetHeight)}px`);
  }

  function applyImageProfile(item,width,height){
    profileWidth=width;
    profileHeight=height;
    const layout=layoutFor(item);
    const ratioClass=ratioFor(width,height);
    [reader,dialog].forEach(element=>{
      element.classList.remove(...layoutClasses,...ratioClasses);
      element.classList.add(layout,ratioClass);
    });
    reader.style.setProperty('--analysis-image-ratio',String(width/Math.max(1,height)));
    sizeDialog(item,width,height);
  }

  function conceptMarkup(item){
    const tags=(item.tags||[]).map(tag=>`<span>${App.utils.escape(tag)}</span>`).join('');
    return `<div class="analysis-concept-orbit"><i></i><i></i><i></i><div class="analysis-concept-symbol">${conceptIcons[item.icon]||conceptIcons.conclusion}</div></div><b>${App.utils.escape(item.label||'Key insight')}</b><div class="analysis-concept-tags">${tags}</div>`;
  }

  function setImage(item){
    const sources=imageSources(item);
    figureImage.classList.remove('is-loaded');
    figureImage.onload=null;
    figureImage.onerror=null;
    figureStage.querySelectorAll('.analysis-figure-secondary').forEach(image=>image.remove());
    figureStage.classList.toggle('is-gallery',sources.length>1);
    const provisionalLayout=layoutFor(item);
    [reader,dialog].forEach(element=>{
      element.classList.remove(...layoutClasses,...ratioClasses);
      element.classList.add(provisionalLayout);
    });
    figureFallback.hidden=true;
    conceptVisual.hidden=Boolean(sources.length);
    figureImage.hidden=!sources.length;

    if(!sources.length){
      figureImage.removeAttribute('src');
      conceptVisual.innerHTML=conceptMarkup(item);
      applyImageProfile(item,1,1);
      return;
    }

    conceptVisual.innerHTML='';
    figureImage.alt=item.alt||item.title||'Analysis figure';
    const imageElements=[figureImage];
    for(let index=1;index<sources.length;index++){
      const image=document.createElement('img');
      image.className='analysis-figure-secondary';
      image.alt=`${item.alt||item.title||'Analysis figure'} ${index+1}`;
      figureStage.insertBefore(image,conceptVisual);
      imageElements.push(image);
    }
    let loaded=0;
    const settle=()=>{
      loaded+=1;
      if(loaded!==imageElements.length)return;
      const maxHeight=Math.max(...imageElements.map(image=>image.naturalHeight));
      const combinedWidth=imageElements.reduce((sum,image)=>sum+image.naturalWidth*(maxHeight/image.naturalHeight),0);
      applyImageProfile(item,combinedWidth,maxHeight);
      imageElements.forEach(image=>image.classList.add('is-loaded'));
    };
    const fail=()=>{
      figureImage.classList.remove('is-loaded');
      figureFallback.hidden=false;
      figureFallback.querySelector('b').textContent='Figure unavailable';
      figureFallback.querySelector('span').textContent=sources.join(', ');
    };
    imageElements.forEach((image,index)=>{
      image.onload=settle;
      image.onerror=fail;
      image.src=sources[index];
    });
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
      imageSources(sectionItems[itemIndex+1]).forEach(source=>{
        const preload=new Image();
        preload.src=source;
      });
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
    figureStage=modal.querySelector('.analysis-figure-stage');
    figureImage=modal.querySelector('#analysis-figure-image');
    figureFallback=modal.querySelector('#analysis-figure-fallback');
    conceptVisual=modal.querySelector('#analysis-concept-visual');
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
    window.addEventListener('resize',()=>{
      if(!modal.hidden)applyImageProfile(items()[itemIndex],profileWidth,profileHeight);
    });
  }

  App.Components.AnalysisModal={init,open,close,isOpen:()=>Boolean(modal&&!modal.hidden)};
})(window.SeattleApp);
