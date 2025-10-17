
(() => {
  const c = document.getElementById('breath');
  const ctx = c.getContext('2d');
  let w, h, t = 0, animId=null, bpm=6; // breaths per minute default
  function resize(){ w=c.width=c.clientWidth*2; h=c.height=c.clientHeight*2; }
  function draw(){
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2;
    // progress 0..1 over one breath cycle (inhale + exhale)
    const secPerBreath = 60/bpm;
    const phase = (performance.now()/1000) % secPerBreath;
    const p = phase / secPerBreath; // 0..1
    // breathing curve (ease in/out)
    const ease = p<.5 ? (1 - Math.cos(Math.PI*p*2))/2 : (1 - Math.cos(Math.PI*p*2))/2;
    const rMin = Math.min(w,h)*0.18, rMax = Math.min(w,h)*0.34;
    const r = rMin + (rMax-rMin)*(p<.5 ? ease : 1-ease);
    // glow
    ctx.save();
    ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(200,220,255,.55)';
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='rgba(230,240,255,.15)'; ctx.fill();
    ctx.restore();
    // ring
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.lineWidth = Math.min(w,h)*0.02; ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.stroke();
    // ticks
    for(let i=0;i<60;i++){
      const ang = i/60 * Math.PI*2;
      const rr = r + (i%5===0 ? 16 : 8);
      const x1=cx + Math.cos(ang)*r, y1=cy + Math.sin(ang)*r;
      const x2=cx + Math.cos(ang)*(r+rr*0.15), y2=cy + Math.sin(ang)*(r+rr*0.15);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=2; ctx.stroke();
    }
    animId=requestAnimationFrame(draw);
  }
  function start(){ if(!animId){ draw(); } }
  function stop(){ if(animId){ cancelAnimationFrame(animId); animId=null; } }
  function setBpm(v){ bpm = Math.max(3, Math.min(10, v)); }
  // Voice guidance (if available)
  let speaking=false, synth = window.speechSynthesis;
  function speakLoop(){
    if(!synth) return;
    const secPerBreath = 60/bpm;
    const inhale = new SpeechSynthesisUtterance('inhala');
    const exhale = new SpeechSynthesisUtterance('exhala');
    inhale.rate = 0.9; exhale.rate = 0.9;
    speaking=true;
    function cycle(){
      if(!speaking) return;
      synth.speak(inhale);
      setTimeout(()=>{ synth.speak(exhale); if(speaking) setTimeout(cycle, secPerBreath*500); }, secPerBreath*500);
    }
    cycle();
  }
  function stopSpeak(){ speaking=false; if(synth) synth.cancel(); }

  window.Respira = { start, stop, setBpm, speakLoop, stopSpeak };
  window.addEventListener('resize', resize);
  resize(); start();
})();
