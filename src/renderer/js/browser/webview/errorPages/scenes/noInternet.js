/**
 * scenes/noInternet.js — subtle floating particles background
 */
const SceneNoInternet = `
(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 100);
  camera.position.z = 8;

  // Soft grid of dots
  const count = 120;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random()-0.5)*18;
    pos[i*3+1] = (Math.random()-0.5)*12;
    pos[i*3+2] = (Math.random()-0.5)*4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:0x00c8b4, size:0.06, transparent:true, opacity:0.35 })));

  // One large wireframe sphere — very faint
  const sGeo = new THREE.SphereGeometry(4, 16, 16);
  scene.add(new THREE.Mesh(sGeo, new THREE.MeshBasicMaterial({ color:0x00c8b4, wireframe:true, transparent:true, opacity:0.04 })));

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    scene.rotation.y = t * 0.06;
    scene.rotation.x = Math.sin(t * 0.3) * 0.04;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
`;
