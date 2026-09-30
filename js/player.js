(function(){
  const root=document.querySelector('[data-ss-player]');
  if(!root)return;
  const video=root.querySelector('video');
  if(!video)return;

  const bigPlay=root.querySelector('.ss-player__big-play');
  const playBtn=root.querySelector('[data-ss-play]');
  const muteBtn=root.querySelector('[data-ss-mute]');
  const fsBtn=root.querySelector('[data-ss-fs]');
  const scrubber=root.querySelector('.ss-player__scrubber');
  const currentEl=root.querySelector('[data-ss-current]');
  const durationEl=root.querySelector('[data-ss-duration]');
  const controls=root.querySelector('[data-ss-controls]');

  const IDLE_MS=2400;
  let hideTimer=null;
  let scrubbing=false;
  let wasPlaying=false;

  const fmt=(s)=>{
    if(!isFinite(s)||s<0)return '0:00';
    s=Math.floor(s);
    const m=Math.floor(s/60);
    const r=s%60;
    return m+':'+(r<10?'0':'')+r;
  };

  const setProgress=(pct)=>{
    root.style.setProperty('--ss-progress',pct+'%');
    if(scrubber){
      scrubber.value=String(pct);
      scrubber.setAttribute('aria-valuenow',String(Math.round(pct)));
    }
  };

  const syncTime=()=>{
    if(currentEl)currentEl.textContent=fmt(video.currentTime);
    if(durationEl)durationEl.textContent=fmt(video.duration);
    if(!scrubbing&&isFinite(video.duration)&&video.duration>0){
      setProgress((video.currentTime/video.duration)*100);
    }
  };

  const showUI=()=>{
    root.classList.add('is-ui-visible');
    clearTimeout(hideTimer);
    if(video.paused)return;
    hideTimer=setTimeout(()=>{
      if(!video.paused&&!scrubbing&&!root.matches(':focus-within')){
        root.classList.remove('is-ui-visible');
      }
    },IDLE_MS);
  };

  const holdUI=()=>{
    root.classList.add('is-ui-visible');
    clearTimeout(hideTimer);
  };

  const togglePlay=()=>{
    if(video.paused||video.ended){
      const p=video.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }else{
      video.pause();
    }
  };

  const toggleMute=()=>{
    video.muted=!video.muted;
    root.classList.toggle('is-muted',video.muted||video.volume===0);
    if(muteBtn)muteBtn.setAttribute('aria-label',video.muted?'Unmute':'Mute');
  };

  const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);

  const toggleFs=()=>{
    if(isFs()){
      const exit=document.exitFullscreen||document.webkitExitFullscreen;
      if(exit)exit.call(document);
    }else{
      const req=root.requestFullscreen||root.webkitRequestFullscreen;
      if(req)req.call(root);
      else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
    }
  };

  const syncFs=()=>{
    const on=isFs();
    root.classList.toggle('is-fullscreen',on);
    if(fsBtn)fsBtn.setAttribute('aria-label',on?'Exit fullscreen':'Enter fullscreen');
  };

  const onPlayState=()=>{
    const playing=!video.paused&&!video.ended;
    root.classList.toggle('is-playing',playing);
    if(playBtn)playBtn.setAttribute('aria-label',playing?'Pause':'Play');
    if(bigPlay)bigPlay.setAttribute('aria-label',playing?'Pause video':'Play video');
    if(playing)showUI();
    else{
      clearTimeout(hideTimer);
      root.classList.add('is-ui-visible');
    }
  };

  video.addEventListener('loadedmetadata',syncTime);
  video.addEventListener('timeupdate',syncTime);
  video.addEventListener('durationchange',syncTime);
  video.addEventListener('play',onPlayState);
  video.addEventListener('pause',onPlayState);
  video.addEventListener('ended',()=>{
    onPlayState();
    root.classList.add('is-ui-visible');
  });
  video.addEventListener('volumechange',()=>{
    root.classList.toggle('is-muted',video.muted||video.volume===0);
    if(muteBtn)muteBtn.setAttribute('aria-label',video.muted||video.volume===0?'Unmute':'Mute');
  });

  if(bigPlay)bigPlay.addEventListener('click',(e)=>{e.stopPropagation();togglePlay();});
  if(playBtn)playBtn.addEventListener('click',(e)=>{e.stopPropagation();togglePlay();});
  if(muteBtn)muteBtn.addEventListener('click',(e)=>{e.stopPropagation();toggleMute();});
  if(fsBtn)fsBtn.addEventListener('click',(e)=>{e.stopPropagation();toggleFs();});

  root.addEventListener('click',(e)=>{
    if(e.target.closest('.ss-player__controls')||e.target.closest('.ss-player__big-play'))return;
    togglePlay();
    showUI();
  });

  ['mousemove','pointerdown','touchstart'].forEach(evt=>{
    root.addEventListener(evt,()=>showUI(),{passive:true});
  });
  root.addEventListener('mouseleave',()=>{
    if(!video.paused&&!scrubbing){
      clearTimeout(hideTimer);
      hideTimer=setTimeout(()=>root.classList.remove('is-ui-visible'),600);
    }
  });
  root.addEventListener('focusin',showUI);
  root.addEventListener('focusout',()=>{
    setTimeout(()=>{
      if(!root.contains(document.activeElement)&&!video.paused)showUI();
    },0);
  });

  if(scrubber){
    const seekFromInput=()=>{
      if(!isFinite(video.duration)||video.duration<=0)return;
      const pct=parseFloat(scrubber.value)||0;
      setProgress(pct);
      video.currentTime=(pct/100)*video.duration;
      if(currentEl)currentEl.textContent=fmt(video.currentTime);
    };
    scrubber.addEventListener('pointerdown',()=>{
      scrubbing=true;
      wasPlaying=!video.paused;
      holdUI();
      if(wasPlaying)video.pause();
    });
    scrubber.addEventListener('input',()=>{
      scrubbing=true;
      holdUI();
      seekFromInput();
    });
    const endScrub=()=>{
      if(!scrubbing)return;
      scrubbing=false;
      seekFromInput();
      if(wasPlaying){
        const p=video.play();
        if(p&&typeof p.catch==='function')p.catch(()=>{});
      }
      showUI();
    };
    scrubber.addEventListener('pointerup',endScrub);
    scrubber.addEventListener('change',endScrub);
    scrubber.addEventListener('keydown',(e)=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))holdUI();
    });
  }

  root.setAttribute('tabindex','0');
  root.setAttribute('role','region');
  root.setAttribute('aria-label','Safesight product demo player');

  root.addEventListener('keydown',(e)=>{
    const tag=(e.target&&e.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea')return;
    const key=e.key;
    if(key===' '||key==='k'||key==='K'){
      e.preventDefault();
      togglePlay();
      showUI();
    }else if(key==='ArrowRight'){
      e.preventDefault();
      video.currentTime=Math.min((video.duration||0),video.currentTime+5);
      syncTime();
      showUI();
    }else if(key==='ArrowLeft'){
      e.preventDefault();
      video.currentTime=Math.max(0,video.currentTime-5);
      syncTime();
      showUI();
    }else if(key==='m'||key==='M'){
      e.preventDefault();
      toggleMute();
      showUI();
    }else if(key==='f'||key==='F'){
      e.preventDefault();
      toggleFs();
      showUI();
    }else if(key==='Escape'&&isFs()){
      showUI();
    }
  });

  document.addEventListener('fullscreenchange',syncFs);
  document.addEventListener('webkitfullscreenchange',syncFs);

  root.classList.add('is-ui-visible');
  root.classList.toggle('is-muted',video.muted);
  syncTime();
  onPlayState();
})();