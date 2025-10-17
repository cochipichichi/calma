
(()=>{
  const KEY = 'calma_access_v1';
  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || { scale:1, contrast:false }; }
    catch(e){ return { scale:1, contrast:false }; }
  }
  function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
  let state = load();
  function apply(){
    document.documentElement.style.setProperty('--calma-font-scale', state.scale);
    document.body.classList.toggle('calma-contrast', !!state.contrast);
  }
  function ui(){
    if(document.getElementById('calma-access')) return;
    const box = document.createElement('div'); box.id='calma-access';
    const mk = (txt, cb) => { const b = document.createElement('button'); b.textContent=txt; b.onclick=cb; return b; };
    const inc = mk('A+', ()=>{ state.scale = Math.min(1.6, +(state.scale+0.1).toFixed(2)); save(state); apply(); });
    const dec = mk('A−', ()=>{ state.scale = Math.max(0.8, +(state.scale-0.1).toFixed(2)); save(state); apply(); });
    const con = mk('◐ Alto contraste', ()=>{ state.contrast = !state.contrast; save(state); apply(); });
    box.append(inc,dec,con);
    document.body.appendChild(box);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', ()=>{ ui(); apply(); }); }
  else { ui(); apply(); }
})();
