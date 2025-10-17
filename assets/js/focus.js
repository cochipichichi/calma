
(() => {
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);

  function whiteNoise(){
    const buf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i=0;i<data.length;i++){ data[i] = Math.random()*2-1; }
    const src = ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    return src;
  }
  function pinkNoise(){
    // simplified pink noise via filtering white
    const src = whiteNoise();
    const biq = ctx.createBiquadFilter(); biq.type='lowpass'; biq.frequency.value=1200; biq.Q.value=0.7;
    src.connect(biq);
    return { node: biq, source: src };
  }
  function ocean(){
    const s = whiteNoise();
    const low = ctx.createBiquadFilter(); low.type='lowpass'; low.frequency.value=500; low.Q.value=0.9;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 220;
    lfo.connect(lfoGain); lfoGain.connect(low.frequency); lfo.start();
    s.connect(low);
    return { node: low, source: s };
  }
  function rain(){
    const s = whiteNoise();
    const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1000; hp.Q.value=0.7;
    s.connect(hp);
    return { node: hp, source: s };
  }
  function river(){
    const s = whiteNoise();
    const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=450; bp.Q.value=0.9;
    s.connect(bp);
    return { node: bp, source: s };
  }

  const scenes = {
    'blanco': () => { const s = whiteNoise(); return { node: s, source: s }; },
    'ocean': ocean,
    'rain': rain,
    'river': river,
    'pink': pinkNoise
  };

  function makePlayer(key, gTarget){
    const g = ctx.createGain(); g.gain.value = .0; g.connect(master);
    let running = false; let srcObj=null;
    function start(){
      if(running) return;
      const maker = scenes[key]; srcObj = maker();
      if(srcObj.source) srcObj.source.connect(srcObj.node);
      srcObj.node.connect(g);
      if(srcObj.source && srcObj.source.start) srcObj.source.start();
      running = true;
    }
    function stop(){
      if(!running) return;
      try{ if(srcObj.source && srcObj.source.stop) srcObj.source.stop(); }catch(e){}
      try{ if(srcObj.node && srcObj.node.disconnect) srcObj.node.disconnect(); }catch(e){}
      running=false;
    }
    function setVol(v){ g.gain.value = v; }
    return { start, stop, setVol, g };
  }

  const players = {};
  function bind(id, key){
    players[id] = makePlayer(key);
    const onBtn = document.querySelector(`#${id} .on`);
    const offBtn= document.querySelector(`#${id} .off`);
    const vol   = document.querySelector(`#${id} .vol`);
    onBtn.onclick = () => { ctx.resume(); players[id].start(); };
    offBtn.onclick= () => { players[id].stop(); };
    vol.oninput  = (e) => players[id].setVol(parseFloat(e.target.value));
  }

  // Visualizer
  const cvs = document.getElementById('viz'); const vctx = cvs.getContext('2d');
  const analyser = ctx.createAnalyser(); analyser.fftSize=1024;
  master.connect(analyser);
  function resize(){ cvs.width=cvs.clientWidth*2; cvs.height=cvs.clientHeight*2; }
  function draw(){
    const arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    vctx.clearRect(0,0,cvs.width,cvs.height);
    const w = cvs.width/arr.length;
    for(let i=0;i<arr.length;i++){
      const val=arr[i]/255; const h = val*cvs.height*0.8;
      vctx.globalAlpha = 0.7;
      vctx.fillRect(i*w, cvs.height - h, w-1, h);
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();

  window.addEventListener('DOMContentLoaded', () => {
    bind('s1','ocean'); bind('s2','rain'); bind('s3','river'); bind('s4','blanco'); bind('s5','pink');
  });
})();
