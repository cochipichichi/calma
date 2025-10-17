
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
