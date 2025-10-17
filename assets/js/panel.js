
(() => {
  const key = 'calma_panel_v1';
  const today = new Date().toISOString().slice(0,10);
  const defaultState = {
    user: 'Pancho',
    partner: 'Belén',
    day: today,
    tasks: [
      { id:'breath', label:'Respiración (5 min)', done:false },
      { id:'sound', label:'Paisaje sonoro (10 min)', done:false },
      { id:'grat', label:'Agradecimiento del día', done:false },
      { id:'walk',  label:'Caminar 10 minutos', done:false }
    ],
    notes: ''
  };

  function load(){
    const raw = localStorage.getItem(key);
    if(!raw) return defaultState;
    try { const parsed = JSON.parse(raw); return Object.assign({}, defaultState, parsed, { day: today }); }
    catch(e){ return defaultState; }
  }
  function save(state){ localStorage.setItem(key, JSON.stringify(state)); }

  let state = load();
  const who = document.getElementById('who');
  const day = document.getElementById('day');
  const list = document.getElementById('list');
  const notes= document.getElementById('notes');
  const resetBtn = document.getElementById('reset');
  const swapBtn  = document.getElementById('swap');

  function render(){
    who.textContent = state.user + ' ❤️ ' + state.partner;
    day.textContent = state.day;
    list.innerHTML = '';
    state.tasks.forEach(t => {
      const li = document.createElement('label');
      li.className='item';
      li.innerHTML = `<input type="checkbox" ${t.done?'checked':''} aria-label="${t.label}"><span>${t.label}</span>`;
      li.querySelector('input').addEventListener('change', (e)=>{ t.done = e.target.checked; save(state); });
      list.appendChild(li);
    });
    notes.value = state.notes || '';
  }
  notes.addEventListener('input', e=>{ state.notes = e.target.value; save(state); });

  resetBtn.addEventListener('click', ()=>{
    state = Object.assign({}, defaultState, { user: state.user, partner: state.partner, day: today });
    save(state); render();
  });
  swapBtn.addEventListener('click', ()=>{
    const u = state.user; state.user = state.partner; state.partner = u; save(state); render();
  });

  render();
})();


/* === Exportar a CSV y Google Sheets (opcional) === */
(function(){
  const btnCsv = document.createElement('button');
  btnCsv.className='btn'; btnCsv.textContent='⬇️ Exportar CSV';
  const btnSend = document.createElement('button');
  btnSend.className='btn'; btnSend.textContent='📤 Enviar a Google Sheets';
  const row = document.querySelector('.row'); if(row){ row.appendChild(btnCsv); row.appendChild(btnSend); }

  function toCSV(){
    const s = JSON.parse(localStorage.getItem('calma_panel_v1')||'{}');
    const lines = [];
    lines.push('fecha,usuario,pareja,tarea,estado,notas');
    (s.tasks||[]).forEach(t => {
      lines.push([s.day, s.user, s.partner, t.label, t.done?'hecho':'pendiente', (s.notes||'').replace(/\n/g,' ')].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`calma_panel_${s.day}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function toSheets(){
    try{
      const cfgUrl = 'assets/config/sheets.example.json';
      const res = await fetch(cfgUrl); const cfg = await res.json();
      if(!cfg.ENABLED){
        alert('Sheets no está habilitado. Copia assets/config/sheets.example.json a assets/config/sheets.json y coloca tu WEBAPP_URL.'); return;
      }
      const s = JSON.parse(localStorage.getItem('calma_panel_v1')||'{}');
      const payload = { date: s.day, user: s.user, partner: s.partner, tasks: s.tasks||[], notes: s.notes||'' };
      const appRes = await fetch(cfg.GOOGLE_SHEETS_WEBAPP_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!appRes.ok) throw new Error('Error HTTP');
      alert('Enviado a Google Sheets ✅');
    }catch(e){
      alert('No se pudo enviar a Sheets. Revisa la configuración.');
      console.error(e);
    }
  }

  btnCsv.addEventListener('click', toCSV);
  btnSend.addEventListener('click', toSheets);
})();
