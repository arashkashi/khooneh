/* 3D massing model built from the same schematic plans (content/plans.json → KHOONEH.plans) and level data.
   Modular: KHOONEH.render3D(host, spec) where spec = { plans: [plan ids bottom→top], elev: {id: m}, clear: {id: m}, title }.
   Three.js is loaded as an ES module from jsDelivr (needs http(s); on file:// the host shows a short note). */
const K = window.KHOONEH;
const fa = (document.documentElement.lang || 'en').startsWith('fa');
const KIND = { living: 0xCFE0D8, kitchen: 0xF0DDB4, dining: 0xF0DDB4, bedroom: 0xD9D4EA, bath: 0xC5E1EC, study: 0xE6DEC4, storage: 0xDADAD3, service: 0xD3CCC3,
  circulation: 0xE9E9E5, outdoor: 0xD6E4C9, void: 0xBFE3E0, parking: 0xE0E1DC, water: 0x2FA39C, green: 0x9FC58F, caretaker: 0xE6D3BC, hall: 0xEFEFEA };

let THREE, OrbitControls;
async function lib() {
  if (THREE) return;
  THREE = await import('three');                                       // resolved by the import map in base.html
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
}

K.render3D = async function (host, spec) {
  if (!host || !spec || !spec.plans) return;
  if (location.protocol === 'file:') { host.innerHTML = `<p class="muted small">${fa ? 'مدل سه‌بعدی وقتی صفحه از یک سرور باز شود نمایش داده می‌شود.' : 'The 3D model shows when the page is served over http.'}</p>`; return; }
  try { await lib(); } catch (e) { host.innerHTML = ''; return; }
  const plans = spec.plans.map(id => K.plans[id]).filter(Boolean);
  if (!plans.length) return;
  const W = host.clientWidth || 640, H = Math.round(W * 0.66);
  host.innerHTML = '';
  const bar = document.createElement('div'); bar.className = 'm3-bar';
  bar.innerHTML = `<button type="button" data-a="explode">${fa ? 'باز کردن طبقات' : 'Explode floors'}</button><button type="button" data-a="rotate" aria-pressed="true">${fa ? 'چرخش' : 'Rotate'}</button><button type="button" data-a="reset">${fa ? 'نمای اول' : 'Reset view'}</button><span class="m3-hint">${fa ? 'کشیدن: چرخاندن · چرخ ماوس: نزدیک و دور' : 'Drag to orbit · wheel to zoom'}</span>`;
  const stage = document.createElement('div'); stage.className = 'm3-stage';
  host.append(bar, stage);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 500);
  const w = plans[0].plot.w, d = plans[0].plot.d;
  const cx = w / 2, cz = d / 2;
  const elevs = plans.map(p => spec.elev?.[p.id] ?? p.elev ?? 0);
  const clears = plans.map(p => spec.clear?.[p.id] ?? 3.0);
  const top = Math.max(...elevs.map((e, i) => e + clears[i]));
  const bottom = Math.min(...elevs);
  const home = new THREE.Vector3(cx + 26, top + 14, cz + 30);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(cx, (top + bottom) / 2, cz); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.49; controls.autoRotate = true; controls.autoRotateSpeed = 0.6;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c5, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(cx - 20, top + 30, cz - 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 120;
  scene.add(sun);

  // ground: earth slab under the plot, and the plot outline
  const ground = new THREE.Mesh(new THREE.BoxGeometry(w + 30, 0.6, d + 30), new THREE.MeshStandardMaterial({ color: 0xE8E4DA }));
  ground.position.set(cx, Math.min(bottom, 0) - 0.3 - (bottom < 0 ? 0 : 0), cz); ground.receiveShadow = true; scene.add(ground);
  if (bottom < 0) { // excavation: cut visible as a darker box top below ground level
    const pit = new THREE.Mesh(new THREE.BoxGeometry(w, -bottom + 0.02, d), new THREE.MeshStandardMaterial({ color: 0xF6F5F0 }));
    pit.position.set(cx, bottom / 2, cz); scene.add(pit);
  }
  const plotLine = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 0.02, d)), new THREE.LineBasicMaterial({ color: 0x9aa39f }));
  plotLine.position.set(cx, 0.02, cz); scene.add(plotLine);

  const floors = [];
  const box = (r, y0, h, color, opacity = 1, inset = 0.06) => {
    const bw = Math.max(0.05, (r[2] - r[0]) - 2 * inset), bd = Math.max(0.05, (r[3] - r[1]) - 2 * inset);
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, h, bd), new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity, roughness: 0.9 }));
    m.position.set((r[0] + r[2]) / 2, y0 + h / 2, (r[1] + r[3]) / 2); m.castShadow = opacity >= 1; m.receiveShadow = true;
    return m;
  };
  plans.forEach((p, i) => {
    const g = new THREE.Group(); g.userData.base = 0; g.userData.index = i;
    const y = elevs[i], h = clears[i];
    (p.footprint || []).forEach(r => { const s = box(r, y - 0.3, 0.3, 0x2b3230, 1, 0); g.add(s); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(s.geometry), new THREE.LineBasicMaterial({ color: 0x1a201e })).translateX(s.position.x).translateY(s.position.y).translateZ(s.position.z)); });
    (p.rooms || []).forEach(r => {
      if (r.kind === 'void') return;
      const outdoor = r.kind === 'outdoor' || r.kind === 'green' || r.kind === 'parking' && p.id.endsWith('ground') && r.id === 'yard';
      const tall = (r.tags || []).includes('c-double-height-loft') && r.kind === 'living';
      const rh = outdoor ? 0.12 : r.kind === 'water' ? 0.5 : tall ? 5.5 : h - 0.32;
      const m = box(r.m, y, rh, KIND[r.kind] ?? 0xEDEDE8, outdoor ? 1 : 0.92);
      m.userData.room = r; g.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0x5a6664, transparent: true, opacity: 0.5 }));
      e.position.copy(m.position); g.add(e);
    });
    (p.elements || []).forEach(el => {
      const m = el.m;
      if (el.type === 'tree') {
        const r = Math.max(m[2] - m[0], m[3] - m[1]) / 2;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 4.5, 8), new THREE.MeshStandardMaterial({ color: 0x9C6B3C }));
        trunk.position.set((m[0] + m[2]) / 2, y + 2.25, (m[1] + m[3]) / 2); trunk.castShadow = true; g.add(trunk);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(r * 0.9, 18, 14), new THREE.MeshStandardMaterial({ color: 0x5E8F57, roughness: 1 }));
        crown.position.set((m[0] + m[2]) / 2, y + 5.2, (m[1] + m[3]) / 2); crown.castShadow = true; g.add(crown);
      } else if (el.type === 'car') {
        const c = box(m, y + 0.02, 1.35, 0xF4F4F1, 1, 0.15); g.add(c);
      } else if (el.type === 'water') { g.add(box(m, y + 0.02, 0.3, 0x2FA39C, 0.9, 0)); }
    });
    scene.add(g); floors.push(g);
  });

  // explode animation (eased), auto-rotate toggle, reset
  let exploded = false, t = 0, target = 0;
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'explode') { exploded = !exploded; target = exploded ? 1 : 0; b.textContent = exploded ? (fa ? 'بستن طبقات' : 'Stack floors') : (fa ? 'باز کردن طبقات' : 'Explode floors'); }
    if (b.dataset.a === 'rotate') { controls.autoRotate = !controls.autoRotate; b.setAttribute('aria-pressed', controls.autoRotate); }
    if (b.dataset.a === 'reset') { camera.position.copy(home); controls.target.set(cx, (top + bottom) / 2, cz); }
  });
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const tick = () => {
    t += (target - t) * 0.06;
    const k = ease(Math.max(0, Math.min(1, t)));
    floors.forEach((g, i) => { g.position.y = k * i * 3.2; });
    controls.update(); renderer.render(scene, camera); requestAnimationFrame(tick);
  };
  tick();
  const ro = new ResizeObserver(() => { const w2 = host.clientWidth; if (!w2) return; const h2 = Math.round(w2 * 0.66); renderer.setSize(w2, h2); camera.aspect = w2 / h2; camera.updateProjectionMatrix(); });
  ro.observe(host);
};

document.querySelectorAll('[data-model3d]').forEach(h => {
  const spec = JSON.parse(h.dataset.model3d);
  K.render3D(h, spec);
});
