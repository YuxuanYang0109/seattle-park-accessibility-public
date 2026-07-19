(function(App){
  const mm=App.Core.MapManager,loader=App.Core.DataLoader,panel=App.Components.InfoPanel,{escape:esc,number:num}=App.utils;
  const ids=['study-parks-fill','study-parks-line','study-selected-park'];
  let ready=false;

  function colorExpression(){return ['match',['get','TYPE_GROUP'],...Object.entries(App.config.parkColors).flat(),'#899b89'];}
  function renderLegend(){document.querySelector('#study-park-legend').innerHTML=Object.entries(App.config.parkColors).map(([name,color])=>`<span><i style="background:${color}"></i>${name}</span>`).join('');}
  function addLayers(){
    if(ready)return;
    mm.addSource('study-parks',{type:'geojson',data:window.WEBMAP_DATA.parks});
    mm.addLayer({id:'study-parks-fill',type:'fill',source:'study-parks',paint:{'fill-color':colorExpression(),'fill-opacity':.78}});
    mm.addLayer({id:'study-parks-line',type:'line',source:'study-parks',paint:{'line-color':'#174d37','line-width':.45,'line-opacity':.62}});
    mm.addLayer({id:'study-selected-park',type:'line',source:'study-parks',filter:['==',['get','NAME'],'__none__'],paint:{'line-color':'#fff','line-width':3.2,'line-opacity':1}});
    ready=true;
  }

  function imageBase(url){return String(url||'').replace(/=[^/=]+$/,'');}
  function lowQualityImage(url){return imageBase(url)+'=w420-h280-k-no';}
  function originalImage(url){return imageBase(url)+'=k-no';}
  function bindReviewImages(){
    document.querySelectorAll('#study-panel img[data-review-image]').forEach(img=>{
      const unavailable=()=>{
        const box=document.createElement('a');box.className='review-image-unavailable';box.href=img.dataset.fallback||'#';box.target='_blank';box.rel='noopener noreferrer';
        box.innerHTML='<i>↗</i><span>Image unavailable</span><small>Click to try the original Google image.</small>';img.replaceWith(box);
      };
      img.addEventListener('load',()=>img.classList.add('is-loaded'));
      img.addEventListener('error',()=>{if(img.dataset.stage==='low'){img.dataset.stage='original';img.src=img.dataset.fallback;}else unavailable();});
      if(img.complete&&img.naturalWidth)img.classList.add('is-loaded');
      else if(img.complete&&!img.naturalWidth)setTimeout(()=>img.dispatchEvent(new Event('error')),0);
    });
  }

  function stars(value){return '★'.repeat(Math.max(0,Math.min(5,Math.round(Number(value)||0))));}
  function reviewCard(review,cache){
    const local=(cache[review.review_id]||[]).slice(0,1),remote=(review.images||[]).slice(0,1),source=local.length?local:remote;
    const image=source.map((url,index)=>local.length
      ?`<img data-review-image data-stage="local" data-fallback="${esc(remote[index]?originalImage(remote[index]):url)}" src="${esc(url)}" loading="lazy" decoding="async" alt="Cached park review image">`
      :`<img data-review-image data-stage="low" data-fallback="${esc(originalImage(url))}" src="${esc(lowQualityImage(url))}" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Low-resolution park review image">`).join('');
    return `<article class="review-item park-review-item"><header><div><b>${esc(review.author||'Anonymous')}</b><small>${esc(review.placeName||'')}</small></div><span><i class="stars">${stars(review.rating)}</i> ${esc(review.date||'')}</span></header><p>${esc(review.text||'No review text')}</p>${image?`<div class="panel-gallery">${image}</div>`:''}</article>`;
  }

  function parkReviewHtml(clicked,park,details,cache){
    const places=park?.places||[];
    const reviews=[];
    places.forEach(place=>(details[place.placeKey]||[]).forEach(review=>reviews.push({...review,placeName:place.placeName})));
    reviews.sort((a,b)=>Number(Boolean(cache[b.review_id]?.length))-Number(Boolean(cache[a.review_id]?.length))||Number(Boolean(b.images?.length))-Number(Boolean(a.images?.length))||String(b.date||'').localeCompare(String(a.date||'')));
    const shown=reviews.slice(0,16);
    const displayName=park?.displayName||clicked.PMA_NAME||clicked.NAME;
    const area=Number(park?.areaM2??clicked.AREA_M2??0);
    const rating=park?.rating;
    const placeChips=places.slice(0,6).map(place=>`<span>${esc(place.placeName)} <b>${place.rating?num(place.rating,1):'—'}</b></span>`).join('');
    return `<span class="panel-kicker">OFFICIAL PARK · PRIVACY-SAFE AGGREGATES</span><h2 class="panel-title">${esc(displayName)}</h2><p class="panel-subtitle">${esc(park?.typeGroup||clicked.TYPE_GROUP||'Park')} · ${esc(park?.useName||clicked.USE_NAME||'Park')}</p>
      <div class="park-review-layout">
        <section class="park-facts-column">
          <div class="park-rating-hero"><div><span>PARK RATING</span><strong>${rating==null?'N/A':num(rating,1)}</strong><small>${rating==null?'No linked rating':'out of 5 · review-weighted'}</small></div><i>${rating==null?'☆':'★'}</i></div>
          <div class="panel-metrics park-fact-metrics">
            <div class="panel-metric"><strong>${num(area/10000,2)} ha</strong><span>Official park area</span></div>
            <div class="panel-metric"><strong>${num(park?.reviewTotal||0,0)}</strong><span>Google reviews</span></div>
            <div class="panel-metric"><strong>${esc(park?.owner||clicked.OWNER||'—')}</strong><span>Owner code</span></div>
            <div class="panel-metric"><strong>${num(park?.reviewPlaces||0,0)}</strong><span>Linked places</span></div>
          </div>
          ${park?.address?`<p class="panel-copy"><b>Address</b><br>${esc(park.address)}</p>`:''}
          <div class="park-place-links"><span>LINKED GOOGLE PLACES</span>${placeChips||'<p>No linked Google place.</p>'}</div>
          <p class="profile-source">Public release: aggregate place_rating values only; individual reviews and photographs are excluded.</p>
        </section>
        <section class="park-reviews-column">
          <div class="panel-section-heading"><div><span>AGGREGATED EXPERIENCE</span><b>Rating summary</b></div><small>${shown.length} shown</small></div>
          ${shown.length?`<div class="review-stack">${shown.map(review=>reviewCard(review,cache)).join('')}</div>`:'<div class="empty-review-state"><i>☆</i><b>No linked review content</b><p>This official park has no usable review text or image in the current dataset.</p></div>'}
        </section>
      </div>`;
  }

  async function showPark(feature){
    const clicked=feature.properties,name=String(clicked.NAME||'');
    App.Components.MapViewMode?.pauseForSelection('study');
    mm.map.setFilter('study-selected-park',['==',['get','NAME'],name]);
    panel.open('#study-panel',panel.loading('OFFICIAL PARK · LINKING REVIEWS',clicked.PMA_NAME||name));
    try{
      await Promise.all([loader.load('parkReviews'),loader.load('reviewDetails'),loader.load('reviewPhotoCache')]);
      const park=window.WEBMAP_DATA.parkReviews?.parks?.[name];
      panel.open('#study-panel',parkReviewHtml(clicked,park,window.REVIEW_DETAILS||{},window.REVIEW_PHOTO_CACHE||{}));
      bindReviewImages();
    }catch(error){panel.open('#study-panel',`<span class="panel-kicker">DATA ERROR</span><h2 class="panel-title">Unable to link park reviews</h2><p class="panel-copy">${esc(error.message)}</p>`);}
  }

  function bind(){
    mm.on('click','study-parks-fill',event=>showPark(event.features[0]));
    mm.on('mouseenter','study-parks-fill',()=>mm.map.getCanvas().style.cursor='pointer');
    mm.on('mouseleave','study-parks-fill',()=>mm.map.getCanvas().style.cursor='');
  }
  App.Pages.study={
    async enter(){document.querySelector('#app').classList.remove('is-map-hidden');renderLegend();panel.close('#study-panel');try{await loader.load('parks');addLayers();mm.setVisible(ids);bind();App.Components.MapViewMode?.enter('study');}catch(error){App.utils.toast(error.message);}},
    exit(){App.Components.MapViewMode?.exit('study');panel.close('#study-panel');if(mm.map?.getLayer('study-selected-park'))mm.map.setFilter('study-selected-park',['==',['get','NAME'],'__none__']);}
  };
})(window.SeattleApp);
