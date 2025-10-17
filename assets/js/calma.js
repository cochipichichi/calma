
(function(){
  const overlayId = 'calma-overlay';
  const btnId = 'calma-toggle';
  const heartId = 'calma-heart';

  function makeButton(){
    if(document.getElementById(btnId)) return;
    const b = document.createElement('button');
    b.id = btnId;
    b.textContent = '🫧 Modo calma';
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click', toggle);
    document.body.appendChild(b);
  }
  function makeHeart(){
    if(document.getElementById(heartId)) return;
    const d = document.createElement('div');
    d.id = heartId;
    d.className = 'calma-beat';
    d.innerHTML = '💗';
    d.style.fontSize = '32px';
    document.body.appendChild(d);
  }
  function makeOverlay(){
    if(document.getElementById(overlayId)) return;
    const c = document.createElement('canvas');
    c.id = overlayId;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    let w, h, particles = [], animId = null, active = false;
    function resize(){
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    }
    function spawn(){
      for(let i=0;i<40;i++){
        particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          r: 0.8 + Math.random()*2.2,
          a: 0.35 + Math.random()*0.35,
          vy: -0.15 - Math.random()*0.35,
          vx: (Math.random()-0.5)*0.2
        });
      }
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      ctx.save();
      for(const p of particles){
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
        p.y += p.vy;
        p.x += p.vx;
        if(p.y < -10){ p.y = h + 10; p.x = Math.random()*w; }
      }
      ctx.restore();
      animId = requestAnimationFrame(draw);
    }
    function on(){
      c.style.display = 'block';
      if(!animId){ draw(); }
      active = true;
    }
    function off(){
      c.style.display = 'none';
      if(animId){ cancelAnimationFrame(animId); animId=null; }
      active = false;
    }
    window.addEventListener('resize', resize);
    resize(); spawn();
    return {on, off, isActive:()=>active};
  }

  let overlayCtl = null;
  function ensure(){
    makeButton();
    makeHeart();
    if(!overlayCtl) overlayCtl = makeOverlay();
  }

  function toggle(){
    ensure();
    const b = document.getElementById(btnId);
    const pressed = b.getAttribute('aria-pressed') === 'true';
    if(pressed){
      overlayCtl.off();
      b.setAttribute('aria-pressed','false');
      b.textContent = '🫧 Modo calma';
      document.getElementById('calma-heart').classList.remove('calma-beat');
    }else{
      overlayCtl.on();
      b.setAttribute('aria-pressed','true');
      b.textContent = '🫧 Calma ON';
      document.getElementById('calma-heart').classList.add('calma-beat');
    }
  }

  // auto-init
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensure);
  } else {
    ensure();
  }
})();
