(function(){
  const App=window.SeattleApp=window.SeattleApp||{};
  App.Core={};App.Pages={};App.Components={};
  App.state={route:'home',selected:null,loaded:new Set()};
  App.utils={
    escape(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},
    number(value,digits=1){return Number(value||0).toLocaleString('zh-CN',{maximumFractionDigits:digits});},
    bbox(geometry){const box=[Infinity,Infinity,-Infinity,-Infinity];(function walk(v){if(typeof v[0]==='number'){box[0]=Math.min(box[0],v[0]);box[1]=Math.min(box[1],v[1]);box[2]=Math.max(box[2],v[0]);box[3]=Math.max(box[3],v[1]);}else v.forEach(walk);})(geometry.coordinates);return box;},
    quantile(values,fraction){const a=[...values].map(Number).sort((x,y)=>x-y);if(!a.length)return 0;const p=(a.length-1)*fraction,lo=Math.floor(p),hi=Math.ceil(p);return lo===hi?a[lo]:a[lo]*(hi-p)+a[hi]*(p-lo);},
    toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(App.state.toastTimer);App.state.toastTimer=setTimeout(()=>el.classList.remove('show'),2200);}
  };
})();
