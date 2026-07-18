(function(App){
  const {escape:esc,number:num}=App.utils;
  function open(id,html){const panel=document.querySelector(id);panel.querySelector('div[id$="content"]').innerHTML=html;panel.classList.add('is-open');}
  function close(id){document.querySelector(id)?.classList.remove('is-open');}
  function loading(kicker,title){return `<span class="panel-kicker">${esc(kicker)}</span><h2 class="panel-title">${esc(title)}</h2><div class="loading-line"></div><div class="loading-line" style="width:72%"></div><div class="loading-line" style="width:88%"></div>`;}
  function park(p){return `<span class="panel-kicker">PARK INFORMATION</span><h2 class="panel-title">${esc(p.NAME)}</h2><p class="panel-subtitle">${esc(p.TYPE_GROUP)} · ${esc(p.USE_NAME)} (${esc(p.USE_CODE)})</p><div class="panel-metrics"><div class="panel-metric"><strong>${num(Number(p.AREA_M2)/10000,2)} ha</strong><span>Park area</span></div><div class="panel-metric"><strong>${esc(p.OWNER||'—')}</strong><span>Owner code</span></div></div>${p.ADDRESS?`<p class="panel-copy"><b>Address</b><br>${esc(p.ADDRESS)}</p>`:''}<p class="panel-copy">Park location, type, ownership and its spatial relationship with public-review data.</p>`;}

  function icon(name){
    const paths={
      people:'<circle cx="8" cy="7" r="2.8"/><path d="M3.8 17c.3-3 1.8-4.7 4.2-4.7s3.9 1.7 4.2 4.7"/><circle cx="16" cy="8.2" r="2.1"/><path d="M13.8 13.2c.7-.7 1.5-1 2.5-1 2 0 3.1 1.5 3.4 3.9"/>',
      age:'<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3.2 2"/>',
      income:'<rect x="3.2" y="6" width="17.6" height="12" rx="2.5"/><path d="M3.5 9.4h17M8.3 14h.1"/>',
      generations:'<circle cx="7" cy="8" r="2.5"/><path d="M3 17c.5-3.2 1.8-4.8 4-4.8s3.5 1.6 4 4.8"/><circle cx="17" cy="7" r="2.5"/><path d="M13 17c.5-3.2 1.8-4.8 4-4.8s3.5 1.6 4 4.8"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.people}</svg>`;
  }
  function valueOrDash(value,digits=1,suffix=''){return value===null||value===undefined||Number.isNaN(Number(value))?'N/A':`${num(value,digits)}${suffix}`;}
  function money(value){return value===null||value===undefined||Number(value)<0?'N/A':`$${num(Number(value)/1000,1)}K`;}
  function profileMetric(iconName,value,label,detail=''){return `<div class="profile-metric"><span class="profile-icon">${icon(iconName)}</span><div><strong>${value}</strong><span>${label}</span>${detail?`<small>${detail}</small>`:''}</div></div>`;}
  function modelValue(value){
    value=Number(value)||0;
    if(value===0)return '0';
    if(Math.abs(value)>=100)return num(value,1);
    if(Math.abs(value)>=1)return num(value,3);
    if(Math.abs(value)>=.01)return num(value,4);
    return value.toExponential(2);
  }
  function reachableParkList(items){
    if(!Array.isArray(items))return `<div class="reachable-parks-loading"><i></i><span>Loading shortest paths…</span></div>`;
    if(!items.length)return `<p class="reachable-parks-empty">No park entrance is reachable within the current walking threshold.</p>`;
    return `<div class="reachable-park-list">${items.map(item=>{
      const distance=Number(item.distanceM)||0,label=distance>=1000?`${num(distance/1000,2)} km`:`${num(distance,0)} m`;
      return `<div class="reachable-park-item"><i></i><span><b>${esc(item.name)}</b><small>${esc(item.type||'Park')}</small></span><strong>${label}<small>${num(item.minutes,1)} min</small></strong></div>`;
    }).join('')}</div>`;
  }
  function diagnosis(score,label,minutes=15){
    if(score>=80)return `This Block Group is in the highest citywide tier for ${label.toLowerCase()} accessibility.`;
    if(score>=60)return `Above-average relative access to ${label.toLowerCase()} within the ${minutes}-minute walking network.`;
    if(score>=40)return `Middle-range relative access to ${label.toLowerCase()}; nearby supply and competing demand are broadly balanced.`;
    if(score>=20)return `Below-average relative access to ${label.toLowerCase()}, indicating a potential service gap.`;
    return `Priority area for improving ${label.toLowerCase()} access under the current ${minutes}-minute E2SFCA model.`;
  }

  function access(p,profile={},ranking={},metric={}){
    const rank=ranking.rank||'—',rankEnd=ranking.rankEnd||rank,total=ranking.total||536,rankLabel=rankEnd>rank?`${rank}–${rankEnd}`:`${rank}`,rankDetail=ranking.tieCount>1?`${num(ranking.tieCount,0)} groups tied`:`Top ${ranking.topPercent==null?'—':num(ranking.topPercent,1)+'%'}`;
    const meta=metric.meta||{label:'Park area',shortLabel:'Area',supplyTransform:'Official area in m²'};
    const record=metric.record||{score:p.ACCESS_SCORE||0,value:p.ACCESS_RAW||0};
    const method=metric.method||{};
    const context=metric.context||{};
    const reachableParks=metric.reachableParks;
    const isDiversity=metric.id==='DIVERSITY';
    const minutes=Number(method.thresholdMinutes)||15;
    const score=Number(record.score)||0;
    const level=score>=80?'Very high':score>=60?'High':score>=40?'Medium':score>=20?'Low':'Very low';
    const ageStructure=profile.UNDER18_PCT==null&&profile.AGE65_PCT==null?'N/A':`${valueOrDash(profile.UNDER18_PCT,1,'%')} · ${valueOrDash(profile.AGE65_PCT,1,'%')}`;
    const methodDetails=isDiversity
      ?`<details class="panel-method"><summary>How activity diversity is calculated</summary><p>G01–G07 accessibility is calculated first with the 15-minute E2SFCA model. For this Block Group, each category is divided by the sum of all seven categories to obtain p. Shannon diversity is H = -Σ(p × ln p), then normalized by ln(7) to a 0–1 evenness score. A high value means the accessible activity mix is more balanced; it does not mean the total amount of access is high.</p><p>${esc(method.activityCaveat||'Activity evidence is derived from coded public reviews.')}</p></details>`
      :`<details class="panel-method"><summary>Method and transformation</summary><p>Step 1 divides each park's supply by population demand reachable through the walking network. Step 2 sums those supply-to-demand ratios for this Block Group. Both steps use a ${minutes}-minute threshold and negative-exponential distance decay.</p><p><b>Supply:</b> ${esc(meta.supplyTransform||'')}</p>${String(metric.id||'').startsWith('G')?`<p>${esc(method.activityCaveat||'Activity evidence is derived from coded public reviews.')}</p>`:''}</details>`;
    return `<span class="panel-kicker">CENSUS BLOCK GROUP · ${minutes}-MINUTE E2SFCA</span>
      <h2 class="panel-title">${esc(p.NAME)}</h2>
      <p class="panel-subtitle">GEOID ${esc(p.GEOID20||p.BG_ID)} · ${esc(meta.label)} · ${level}</p>
      <div class="access-hero">
        <div class="panel-hero-score"><strong>${num(score,1)}</strong><span>0–100 citywide percentile<br>${esc(meta.shortLabel)} accessibility</span></div>
        <div class="access-rank-badge"><span>Seattle rank</span><strong>#${rankLabel}</strong><small>of ${total} · ${rankDetail}</small></div>
      </div>
      <div class="selected-metric-card">
        <span>${isDiversity?'DERIVED INDICATOR':'ACTIVE SUPPLY'}</span><strong>${esc(meta.label)}</strong><p>${esc(meta.examples||meta.description||'')}</p>
        <div><b>${modelValue(record.value)}</b><small>${esc(meta.rawLabel||'Raw E2SFCA value')}</small></div>
      </div>
      <section class="rank-card" aria-labelledby="rank-card-title">
        <div class="panel-section-heading"><div><span>CITYWIDE POSITION</span><b id="rank-card-title">All 536 Block Groups</b></div><small>Low → High</small></div>
        <div class="rank-chart-wrap"><canvas id="access-rank-chart" height="118" role="img" aria-label="Sorted accessibility bar chart highlighting the selected Block Group"></canvas><div class="rank-chart-tooltip" id="access-chart-tooltip"></div></div>
        <div class="rank-chart-axis"><span>Lower access</span><span>${esc(meta.shortLabel)} percentile</span><span>Higher access</span></div>
      </section>
      <section class="panel-section">
        <div class="panel-section-heading"><div><span>PEOPLE &amp; PLACE</span><b>Community profile</b></div></div>
        <div class="profile-grid">
          ${profileMetric('people',valueOrDash(p.POP,0),'2020 population')}
          ${profileMetric('age',valueOrDash(profile.MEDIAN_AGE,1),'Median age',profile.MEDIAN_AGE_MOE==null?'':`±${num(profile.MEDIAN_AGE_MOE,1)} ACS MOE`)}
          ${profileMetric('income',money(profile.MEDIAN_HH_INCOME),'Median household income',profile.MEDIAN_HH_INCOME_MOE==null?'':`±$${num(profile.MEDIAN_HH_INCOME_MOE/1000,1)}K ACS MOE`)}
          ${profileMetric('generations',ageStructure,'Under 18 · Age 65+')}
        </div>
        <p class="profile-source">Population: Census 2020 · Demographics: ACS estimate · N/A indicates unavailable estimates.</p>
      </section>
      <section class="panel-section">
        <div class="panel-section-heading"><div><span>${minutes}-MINUTE NETWORK CONTEXT</span><b>Reachable opportunity</b></div></div>
        <div class="access-metric-grid">
          <div><strong>${num(context.reachableParks,0)}</strong><span>Reachable parks</span></div>
          <div><strong>${num(Number(context.reachableAreaM2||0)/10000,2)} ha</strong><span>Reachable park area</span></div>
          <div><strong>${num(context.ratedParks,0)}</strong><span>Rated parks</span></div>
          <div><strong>${num(meta.evidenceParks,0)}</strong><span>Supply parks citywide</span></div>
        </div>
      </section>
      <section class="panel-section reachable-parks-section">
        <div class="panel-section-heading"><div><span>SHORTEST WALKING PATHS</span><b>Reachable parks</b></div><small>${Array.isArray(reachableParks)?`${reachableParks.length} destinations`:'Loading'}</small></div>
        ${reachableParkList(reachableParks)}
      </section>
      <div class="access-diagnosis"><span>DIAGNOSIS · ${esc(meta.shortLabel.toUpperCase())}</span><p>${esc(diagnosis(score,meta.label,minutes))}</p></div>
      ${methodDetails}
      <details class="panel-method"><summary>How the purple walking area is calculated</summary><p>The envelope represents street-network nodes reachable within ${minutes} minutes from this Block Group's geometric centroid at ${num(method.walkSpeedKmh||5,0)} km/h.</p></details>
      <button class="panel-action" id="clear-community">Clear selection</button>`;
  }
  App.Components.InfoPanel={open,close,loading,park,access};
})(window.SeattleApp);
