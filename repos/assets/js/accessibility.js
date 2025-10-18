
(()=>{
  if (window.__calmaAccessInit) return;  // strong singleton
  window.__calmaAccessInit = true;

  const KEY='calma_portal_access_v1';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||{scale:1,contrast:false}; }catch(e){ return {scale:1,contrast:false}; } }
  function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
  let state = load();

  function apply(){
    document.documentElement.style.setProperty('--calma-font-scale', state.scale);
    document.body.classList.toggle('calma-contrast', !!state.contrast);
  }
  function ensureSingle(){
    const nodes = document.querySelectorAll('#calma-access');
    for(let i=1;i<nodes.length;i++) nodes[i].remove();
  }
  function ui(){
    ensureSingle();
    if(document.getElementById('calma-access')) return;
    const box = document.createElement('div'); box.id='calma-access';
    const mk=(t,cb)=>{ const b=document.createElement('button'); b.textContent=t; b.onclick=cb; return b; };
    box.append(
      mk('◐ Alto contraste', ()=>{ state.contrast=!state.contrast; save(state); apply(); }),
      mk('A+', ()=>{ state.scale=Math.min(1.6, +(state.scale+0.1).toFixed(2)); save(state); apply(); }),
      mk('A−', ()=>{ state.scale=Math.max(0.8, +(state.scale-0.1).toFixed(2)); save(state); apply(); })
    );
    document.body.appendChild(box);
  }

  // Observe for any accidental duplicates added later
  const mo = new MutationObserver(ensureSingle);
  mo.observe(document.documentElement, { childList: true, subtree: true });

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', ()=>{ apply(); ui(); ensureSingle(); }); }
  else { apply(); ui(); ensureSingle(); }
})();
