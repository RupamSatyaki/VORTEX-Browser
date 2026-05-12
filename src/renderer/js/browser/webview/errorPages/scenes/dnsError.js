/**
 * scenes/dnsError.js — soft orbiting rings background
 */
const SceneDnsError = `
(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 100);
  camera.position.z = 9;

  // Concentric torus rings
  [3, 4.5, 6].forEach((r, i) => {
    const geo = new THREE.TorusGeometry(r, 0.015, 6, 80);
    const mat = new THREE.MeshBasicMaterial({ color:0xa78bfa, transparent:true, opacity:0.08 - i*0.02 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = 0.4 + i * 0.3;
    ring._s = 0.003 + i * 0.001;
    scene.add(ring);
  });

  // Particles
  const count = 100;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random()-0.5)*20;
    pos[i*3+1] = (Math.random()-0.5)*14;
    pos[i*3+2] = (Math.random()-0.5)*4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:0xa78bfa, size:0.055, transparent:true, opacity:0.3 })));

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    scene.children.forEach(c => { if (c._s) c.rotation.y += c._s; });
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
`;
