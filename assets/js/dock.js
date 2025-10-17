
(()=>{
  function make(){
    if(document.getElementById('calma-dock')) return;
    const d=document.createElement('div'); d.id='calma-dock';
    const base = location.pathname.replace(/\/[^\/]*$/, '/');
    function link(href, text){
      const a=document.createElement('a'); a.href=href; a.textContent=text; return a;
    }
    d.appendChild(link('./modules/respira.html','🫁 Respira+'));
    d.appendChild(link('./modules/focus.html','🎧 Focus'));
    d.appendChild(link('./modules/exposicion.html','🎭 Exposición'));
    d.appendChild(link('./modules/calma-panel.html','🪶 Calma diaria'));
    document.body.appendChild(d);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', make); else make();
})();
