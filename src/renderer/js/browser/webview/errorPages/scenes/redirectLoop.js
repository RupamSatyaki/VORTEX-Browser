/**
 * scenes/redirectLoop.js — slow rotating torus knot background
 */
const SceneRedirectLoop = `
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

  // Torus knot — very faint
  const tkGeo = new THREE.TorusKnotGeometry(2.8, 0.08, 120, 8);
  scene.add(new THREE.Mesh(tkGeo, new THREE.MeshBasicMaterial({ color:0xeab308, wireframe:true, transparent:true, opacity:0.07 })));

  // Particles
  const count = 100;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random()-0.5)*18;
    pos[i*3+1] = (Math.random()-0.5)*12;
    pos[i*3+2] = (Math.random()-0.5)*4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:0xeab308, size:0.055, transparent:true, opacity:0.28 })));

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    scene.rotation.y = t * 0.07;
    scene.rotation.x = t * 0.03;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
`;
