(()=>{
  function make(){
    if(document.getElementById('calma-dock')) return;
    const d=document.createElement('div'); d.id='calma-dock';
    d.innerHTML = [
      '<a href="./modules/respira.html">🫁 Respira+</a>',
      '<a href="./modules/focus.html">🎧 Focus</a>',
      '<a href="./modules/exposicion.html">🎭 Exposición</a>',
      '<a href="./modules/calma-panel.html">🪶 Calma diaria</a>'
    ].join('');
    document.body.appendChild(d);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', make); else make();
})();
