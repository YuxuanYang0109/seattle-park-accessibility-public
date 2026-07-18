(function(App){
  App.Pages.regression={
    async enter(){App.Core.MapManager.setVisible([]);App.Core.MapManager.clearPopups();document.querySelector('#app').classList.add('is-map-hidden');},
    exit(){document.querySelector('#app').classList.remove('is-map-hidden');}
  };
})(window.SeattleApp);
