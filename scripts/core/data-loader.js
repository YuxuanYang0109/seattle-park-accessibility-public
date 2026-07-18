(function(App){
  const promises={};
  function isReady(key){
    const data=window.WEBMAP_DATA||{};
    if(key==='reviewDetails')return !!window.REVIEW_DETAILS;
    if(key==='reviewPhotoCache')return !!window.REVIEW_PHOTO_CACHE;
    return !!data[key];
  }
  function load(key){
    if(isReady(key))return Promise.resolve(key);
    if(promises[key])return promises[key];
    const src=App.config.data[key];
    if(!src)return Promise.reject(new Error('Unknown data module: '+key));
    promises[key]=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=src;script.async=true;
      script.onload=()=>{App.state.loaded.add(key);resolve(key);};
      script.onerror=()=>reject(new Error('Unable to load '+src));
      document.head.appendChild(script);
    });
    return promises[key];
  }
  App.Core.DataLoader={load,isReady};
})(window.SeattleApp);
