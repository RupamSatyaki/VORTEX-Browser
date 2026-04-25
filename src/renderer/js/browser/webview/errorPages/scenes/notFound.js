/**
 * scenes/notFound.js — indigo star field background
 */
const SceneNotFound = `
(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 200);
  camera.position.z = 8;

  // Star field — two layers
  [{ c:0xffffff, n:200, s:0.045, o:0.25, r:60 },
   { c:0x6366f1, n:80,  s:0.07,  o:0.35, r:25 }].forEach(cfg => {
    const pos = new Float32Array(cfg.n * 3);
    for (let i = 0; i < cfg.n; i++) {
      pos[i*3]   = (Math.random()-0.5)*cfg.r;
      pos[i*3+1] = (Math.random()-0.5)*cfg.r;
      pos[i*3+2] = -5 - Math.random()*30;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:cfg.c, size:cfg.s, transparent:true, opacity:cfg.o })));
  });

  // Faint octahedron
  const oGeo = new THREE.OctahedronGeometry(3, 1);
  scene.add(new THREE.Mesh(oGeo, new THREE.MeshBasicMaterial({ color:0x6366f1, wireframe:true, transparent:true, opacity:0.04 })));

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.006;
    scene.rotation.y = t * 0.04;
    scene.rotation.x = t * 0.015;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
`;
