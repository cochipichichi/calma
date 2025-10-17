const api = (path, data)=>fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})

const vol = document.getElementById('volume')
const volLabel = document.getElementById('vol-label')
vol.addEventListener('input', e=>{
  volLabel.textContent = e.target.value + '%'
  api('/api/volume',{value:+e.target.value})
})
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{
  let v = Math.max(0, Math.min(100, +vol.value + (+b.dataset.v)))
  vol.value = v; vol.dispatchEvent(new Event('input'))
})

document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{
  api('/api/mode',{mode:b.dataset.mode})
})

const ftin = document.getElementById('ftin')
const ftinLabel = document.getElementById('ftin-label')
ftin.addEventListener('input', e=>{
  ftinLabel.textContent = e.target.value + ' Hz'
})
ftin.addEventListener('change', e=>{
  api('/api/ftin',{hz:+e.target.value})
})

document.querySelectorAll('.timer').forEach(b=>b.onclick=()=>{
  api('/api/timer',{minutes:+b.dataset.min})
})

document.querySelectorAll('.preset').forEach(b=>b.onclick=()=>{
  api('/api/preset',{id:b.dataset.id})
})

document.getElementById('sweep').onclick=()=>{
  api('/api/sweep',{start:1000,end:12000})
}

document.getElementById('btn-contrast').onclick=()=>{
  document.body.classList.toggle('contrast')
}
document.getElementById('btn-font').onclick=()=>{
  document.body.style.fontSize = (getComputedStyle(document.body).fontSize==='16px'?'18px':'16px')
}
