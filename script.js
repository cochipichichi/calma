// Data of embedded repos
const data=[
  {id:'calma', title:'CALMA — Dispositivo Tinnitus v1', emoji:'🎧', desc:'Generador de ruido (blanco/rosa/marrón) y notch con panel táctil y web.', tags:['ESP32-S3','I²S','Sunton','Notch','UI táctil'], path:'repos/calma-esp32s3-main', web:'repos/calma-esp32s3-main/webapp/index.html', fw:'repos/calma-esp32s3-main/firmware/CALMA_v1.ino'},
  {id:'aura', title:'AURA — Enmascarador Adaptativo', emoji:'🌊', desc:'Ajusta volumen según ruido ambiente (AGC lento) con perfiles.', tags:['ESP32-S3','INMP441','AGC','I²S'], path:'repos/aura-adaptive-masker-main', web:'repos/aura-adaptive-masker-main/webapp/index.html', fw:'repos/aura-adaptive-masker-main/firmware/main.ino'},
  {id:'notchlab', title:'NotchLab — Música con entalle', emoji:'🎵', desc:'PWA para aplicar notch a música alrededor de la frecuencia tinnitus.', tags:['WebAudio','PWA','Notch'], path:'repos/notchlab-notched-music-main', web:'repos/notchlab-notched-music-main/webapp/index.html', fw:'repos/notchlab-notched-music-main/firmware/main.ino'},
  {id:'respira', title:'Respira+ — Biofeedback HRV', emoji:'🌿', desc:'Guía respiratoria (~6 rpm) y BLE placeholder para HRV.', tags:['VR','BLE','Respiración'], path:'repos/respira-plus-biofeedback-main', web:'repos/respira-plus-biofeedback-main/webapp/index.html', fw:'repos/respira-plus-biofeedback-main/firmware/main.ino'},
  {id:'oido', title:'Oído-Guardián — Dosímetro', emoji:'🛡️', desc:'Estimación dBA (Leq) con MEMS; requiere calibración.', tags:['I²S','INMP441','dBA'], path:'repos/oido-guardian-dosimeter-main', web:'repos/oido-guardian-dosimeter-main/webapp/index.html', fw:'repos/oido-guardian-dosimeter-main/firmware/main.ino'},
];

// Cards rendering
const cards=document.getElementById('cards');
function card(item){
  return `<article class="card" data-tags="${item.tags.join(' ').toLowerCase()}">
    <h2>${item.emoji} ${item.title}</h2>
    <p>${item.desc}</p>
    <div class="badges">${item.tags.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
    <div class="actions">
      <a class="btn" href="${item.web}" target="_blank">🌐 Abrir Web/App</a>
      <a class="btn" href="${item.fw}" target="_blank">🧩 Firmware</a>
      <a class="btn" href="${item.path}/README.md" target="_blank">📄 README</a>
    </div>
  </article>`;
}
cards.innerHTML = data.map(card).join('');

// Search / filter
const search = document.getElementById('search');
search.addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  for(const el of cards.children){
    const text = el.innerText.toLowerCase();
    el.style.display = text.includes(q) ? '' : 'none';
  }
});

// Accessibility toggles
document.getElementById('btn-contrast').onclick=()=>{
  document.body.classList.toggle('contrast');
}
document.getElementById('btn-font').onclick=()=>{
  const fs = parseFloat(getComputedStyle(document.body).fontSize);
  document.body.style.fontSize = (fs<18?'18px':'16px');
}

// Particles (calm floating)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w,h; function resize(){ w=canvas.width=canvas.offsetWidth; h=canvas.height=canvas.offsetHeight; } window.addEventListener('resize',resize); resize();
const N=80; const pts=[];
for(let i=0;i<N;i++){ pts.push({x:Math.random()*w,y:Math.random()*h, r:Math.random()*2+0.6, vx:(Math.random()-.5)*0.2, vy:(Math.random()-.5)*0.2, a:0.35+Math.random()*0.4}); }
function step(){
  ctx.clearRect(0,0,w,h);
  for(const p of pts){
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<-10) p.x=w+10; if(p.x>w+10) p.x=-10;
    if(p.y<-10) p.y=h+10; if(p.y>h+10) p.y=-10;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.fill();
  }
  requestAnimationFrame(step);
}
step();
