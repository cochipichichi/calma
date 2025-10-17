
(() => {
  const c = document.getElementById('bg'); const ctx = c.getContext('2d');
  let w,h, parts=[]; let animId=null, paused=false;
  function resize(){ w=c.width=window.innerWidth; h=c.height=window.innerHeight; }
  function spawn(n=160){
    parts.length = 0;
    for(let i=0;i<n;i++){
      parts.push({ x:Math.random()*w, y:Math.random()*h, r:0.6+Math.random()*1.8, a:0.25+Math.random()*0.4, vy:-0.12-Math.random()*0.25, vx:(Math.random()-0.5)*0.15 });
    }
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of parts){
      ctx.globalAlpha = p.a;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='#eaf2ff'; ctx.fill();
      p.y += p.vy; p.x += p.vx;
      if(p.y<-10){ p.y = h+10; p.x = Math.random()*w; }
    }
    if(!paused) animId = requestAnimationFrame(draw);
  }
  function start(){ paused=false; if(!animId) draw(); }
  function stop(){ paused=true; if(animId){ cancelAnimationFrame(animId); animId=null; } }
  window.addEventListener('resize', ()=>{ resize(); spawn(); });
  resize(); spawn(); start();

  // calm timer
  let t0=null, running=false;
  const timerEl = document.getElementById('timer');
  function tick(ts){
    if(!running){ return; }
    if(!t0) t0=ts;
    const s = Math.floor((ts - t0)/1000);
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    timerEl.textContent = `${mm}:${ss}`;
    requestAnimationFrame(tick);
  }
  function play(){ running=true; t0=null; requestAnimationFrame(tick); }
  function pause(){ running=false; }
  // expose
  window.Expo = { start, stop, play, pause };
})();
