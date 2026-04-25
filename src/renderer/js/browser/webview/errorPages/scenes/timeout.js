/**
 * scenes/timeout.js — slow drifting amber particles background
 */
const SceneTimeout = `
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

  // Drifting particles
  const count = 100;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random()-0.5)*18;
    pos[i*3+1] = (Math.random()-0.5)*12;
    pos[i*3+2] = (Math.random()-0.5)*4;
    vel[i]     = 0.003 + Math.random() * 0.004;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color:0xf59e0b, size:0.06, transparent:true, opacity:0.32 }));
  scene.add(pts);

  // Faint torus
  const tGeo = new THREE.TorusGeometry(3.8, 0.015, 6, 80);
  scene.add(new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ color:0xf59e0b, transparent:true, opacity:0.06 })));

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i*3+1] -= vel[i];
      if (p[i*3+1] < -7) p[i*3+1] = 7;
    }
    geo.attributes.position.needsUpdate = true;
    scene.rotation.y = t * 0.04;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
`;
