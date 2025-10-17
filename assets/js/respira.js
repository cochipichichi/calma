(() => {
  const c = document.getElementById('breath');
  const ctx = c.getContext('2d');
  let w, h, animId=null;
  // patrón por defecto (6 rpm aprox): 4s in, 0 hold, 6s out
  let pattern = { inhale:4, hold:0, exhale:6 };

  function resize(){ w=c.width=c.clientWidth*2; h=c.height=c.clientHeight*2; }
  function draw(ts){
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2;
    const total = pattern.inhale + pattern.hold + pattern.exhale;
    const t = (ts/1000) % total;

    let phase, p; // phase: 'in','hold','out' — p: progreso 0..1 de cada fase
    if(t < pattern.inhale){ phase='in'; p = t/pattern.inhale; }
    else if(t < pattern.inhale + pattern.hold){ phase='hold'; p= (t - pattern.inhale)/Math.max(0.001, pattern.hold); }
    else { phase='out'; p = (t - pattern.inhale - pattern.hold)/pattern.exhale; }

    const rMin = Math.min(w,h)*0.18, rMax = Math.min(w,h)*0.34;
    let r;
    if(phase==='in'){
      const ease = (1 - Math.cos(Math.PI*p))/2;
      r = rMin + (rMax-rMin)*ease;
    }else if(phase==='hold'){
      r = rMax;
    }else{
      const ease = (1 - Math.cos(Math.PI*(1-p)))/2;
      r = rMin + (rMax-rMin)*ease;
    }

    // glow
    ctx.save();
    ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(200,220,255,.55)';
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='rgba(230,240,255,.15)'; ctx.fill();
    ctx.restore();
    // ring
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.lineWidth = Math.min(w,h)*0.02; ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.stroke();

    animId=requestAnimationFrame(draw);
  }
  function start(){ if(!animId){ animId=requestAnimationFrame(draw); } }
  function stop(){ if(animId){ cancelAnimationFrame(animId); animId=null; } }
  function setPattern(inh,hol,exh){ pattern = { inhale:Math.max(1,+inh), hold:Math.max(0,+hol), exhale:Math.max(1,+exh) }; }

  // Voice guidance
  let guiding=false, synth = window.speechSynthesis;
  function guide(){
    if(!synth) return;
    guiding=true;
    function cycle(){
      if(!guiding) return;
      const u1 = new SpeechSynthesisUtterance('inhala');
      const u2 = new SpeechSynthesisUtterance('sostén');
      const u3 = new SpeechSynthesisUtterance('exhala');
      u1.rate=0.9; u2.rate=0.9; u3.rate=0.9;
      synth.speak(u1);
      setTimeout(()=>{
        if(pattern.hold>0){ synth.speak(u2); }
        setTimeout(()=>{
          synth.speak(u3);
          if(guiding) setTimeout(cycle, pattern.exhale*1000);
        }, pattern.hold*1000);
      }, pattern.inhale*1000);
    }
    cycle();
  }
  function stopGuide(){ guiding=false; synth && synth.cancel(); }

  window.Respira = { start, stop, setPattern, guide, stopGuide };
  window.addEventListener('resize', resize);
  resize(); start();
})();
