/* AEA CLUB — intro.js — 3D animated landing */
(function(){
  // Skip if already seen this session
  if(sessionStorage.getItem('aea_intro_seen')){
    var el=document.getElementById('site-intro');
    if(el) el.style.display='none';
    return;
  }

  var THREE=window.THREE;
  var intro=document.getElementById('site-intro');
  var canvas=document.getElementById('intro-canvas');
  if(!intro||!canvas||!THREE) return;

  /* ── Three.js scene ── */
  var W=window.innerWidth, H=window.innerHeight;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
  renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(70,W/H,0.1,1000);
  camera.position.z=5;

  /* Coral colour */
  var CORAL=new THREE.Color('#c94b2b');
  var CREAM=new THREE.Color('#eee9df');

  /* 1 — Rotating wireframe icosahedron */
  var icoGeo=new THREE.IcosahedronGeometry(1.6,1);
  var icoMat=new THREE.MeshBasicMaterial({color:CORAL,wireframe:true,transparent:true,opacity:0.18});
  var ico=new THREE.Mesh(icoGeo,icoMat);
  scene.add(ico);

  /* 2 — Inner solid icosahedron */
  var ico2=new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.9,0),
    new THREE.MeshBasicMaterial({color:CORAL,wireframe:true,transparent:true,opacity:0.35})
  );
  scene.add(ico2);

  /* 3 — Torus ring */
  var ring=new THREE.Mesh(
    new THREE.TorusGeometry(2.4,0.008,2,80),
    new THREE.MeshBasicMaterial({color:CORAL,transparent:true,opacity:0.3})
  );
  ring.rotation.x=Math.PI/2.5;
  scene.add(ring);

  var ring2=new THREE.Mesh(
    new THREE.TorusGeometry(1.8,0.006,2,80),
    new THREE.MeshBasicMaterial({color:CREAM,transparent:true,opacity:0.08})
  );
  ring2.rotation.x=Math.PI/3;
  ring2.rotation.y=Math.PI/4;
  scene.add(ring2);

  /* 4 — Particle field */
  var pCount=320;
  var pPos=new Float32Array(pCount*3);
  for(var i=0;i<pCount;i++){
    pPos[i*3]  =(Math.random()-0.5)*14;
    pPos[i*3+1]=(Math.random()-0.5)*14;
    pPos[i*3+2]=(Math.random()-0.5)*14;
  }
  var pGeo=new THREE.BufferGeometry();
  pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  var pMat=new THREE.PointsMaterial({color:CORAL,size:0.045,transparent:true,opacity:0.7});
  var particles=new THREE.Points(pGeo,pMat);
  scene.add(particles);

  /* ── animate ── */
  var t0=null;
  function animate(ts){
    if(!t0) t0=ts;
    var t=(ts-t0)/1000;
    ico.rotation.x=t*0.4; ico.rotation.y=t*0.6;
    ico2.rotation.x=-t*0.5; ico2.rotation.z=t*0.3;
    ring.rotation.z=t*0.2;
    ring2.rotation.y=t*0.25;
    particles.rotation.y=t*0.07;
    particles.rotation.x=t*0.04;
    // Camera gentle float
    camera.position.x=Math.sin(t*0.3)*0.4;
    camera.position.y=Math.cos(t*0.2)*0.25;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
    if(!introGone) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize',function(){
    W=window.innerWidth; H=window.innerHeight;
    camera.aspect=W/H; camera.updateProjectionMatrix();
    renderer.setSize(W,H);
  });

  /* ── text sequence ── */
  var introGone=false;
  var mark=intro.querySelector('.intro-mark');
  var full=intro.querySelector('.intro-fullname');
  var word=intro.querySelector('.intro-wordmark');
  var tag =intro.querySelector('.intro-tagline');
  var fill=intro.querySelector('.intro-loader-fill');

  /* Animate loader bar */
  var pct=0;
  var loadInt=setInterval(function(){
    pct+=1.6;
    if(fill) fill.style.width=Math.min(pct,100)+'%';
    if(pct>=100) clearInterval(loadInt);
  },40);

  setTimeout(function(){ if(mark) mark.classList.add('visible'); },300);
  setTimeout(function(){ if(full) full.classList.add('visible'); },450);
  setTimeout(function(){ if(word) word.classList.add('visible'); },600);
  setTimeout(function(){ if(tag)  tag.classList.add('visible');  },900);
  setTimeout(exitIntro, 3400);

  function exitIntro(){
    if(introGone) return;
    introGone=true;
    sessionStorage.setItem('aea_intro_seen','1');
    intro.classList.add('intro-exit');
    setTimeout(function(){
      intro.classList.add('intro-done');
      renderer.dispose();
    },950);
  }

  /* Skip button */
  var skip=intro.querySelector('.intro-skip');
  if(skip) skip.addEventListener('click', exitIntro);
})();
