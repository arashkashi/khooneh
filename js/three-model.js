/* 3D massing model built from the same schematic plans (content/plans.json → KHOONEH.plans) and level data.
   Modular: KHOONEH.render3D(host, spec) where spec = { plans: [plan ids bottom→top], elev: {id: m}, clear: {id: m}, title }.
   Three.js is loaded as an ES module from jsDelivr (needs http(s); on file:// the host shows a short note). */
const K = window.KHOONEH;
const fa = (document.documentElement.lang || 'en').startsWith('fa');
const KIND = { living: 0xCFE0D8, kitchen: 0xF0DDB4, dining: 0xF0DDB4, bedroom: 0xD9D4EA, bath: 0xC5E1EC, study: 0xE6DEC4, storage: 0xDADAD3, service: 0xD3CCC3,
  circulation: 0xE9E9E5, outdoor: 0xD6E4C9, void: 0xBFE3E0, parking: 0xE0E1DC, water: 0x2FA39C, green: 0x9FC58F, house management: 0xE6D3BC, hall: 0xEFEFEA };

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
  const floorMode = spec.mode === 'floor';
  const W = host.clientWidth || 640, H = Math.round(W * (floorMode ? 0.72 : 0.66));
  host.innerHTML = '';
  const bar = document.createElement('div'); bar.className = 'm3-bar';
  bar.innerHTML = floorMode
    ? `<button type="button" data-a="top">${fa ? 'از بالا' : 'Top view'}</button><button type="button" data-a="reset">${fa ? 'نمای مایل' : 'Oblique'}</button><button type="button" data-a="rotate" aria-pressed="true">${fa ? 'چرخش' : 'Rotate'}</button><span class="m3-hint">${fa ? 'طبقه بی‌سقف: از بالا به درون فضاها نگاه کنید · کشیدن: چرخاندن · چرخ ماوس: نزدیک و دور' : 'The floor without its roof · drag to orbit · wheel to zoom'}</span>`
    : `<button type="button" data-a="explode">${fa ? 'باز کردن طبقات' : 'Explode floors'}</button><button type="button" data-a="rotate" aria-pressed="true">${fa ? 'چرخش' : 'Rotate'}</button><button type="button" data-a="reset">${fa ? 'نمای اول' : 'Reset view'}</button><span class="m3-hint">${fa ? 'کشیدن: چرخاندن · چرخ ماوس: نزدیک و دور' : 'Drag to orbit · wheel to zoom'}</span>`;
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
  const elevs = plans.map(p => floorMode ? 0 : (spec.elev?.[p.id] ?? p.elev ?? 0));
  const clears = plans.map(p => spec.clear?.[p.id] ?? 3.0);
  const top = Math.max(...elevs.map((e, i) => e + clears[i]));
  const bottom = Math.min(...elevs);
  const home = floorMode ? new THREE.Vector3(cx + 9, 17, cz + 14) : new THREE.Vector3(cx + 26, top + 14, cz + 30);
  const topView = new THREE.Vector3(cx, 30, cz + 0.01);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(cx, floorMode ? 0.8 : (top + bottom) / 2, cz); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.49; controls.autoRotate = true; controls.autoRotateSpeed = floorMode ? 0.35 : 0.6;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c5, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(cx - 20, top + 30, cz - 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 120;
  scene.add(sun);

  // ground: earth slab under the plot, and the plot outline
  const ground = new THREE.Mesh(new THREE.BoxGeometry(w + 30, 0.6, d + 30), new THREE.MeshStandardMaterial({ color: floorMode ? 0xF3F2ED : 0xE8E4DA }));
  ground.position.set(cx, Math.min(bottom, 0) - 0.3, cz); ground.receiveShadow = true; scene.add(ground);
  if (bottom < 0 && !floorMode) { // excavation: cut visible as a darker box top below ground level
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
    (p.footprint || []).forEach(r => { const s = box(r, y - 0.3, 0.3, floorMode ? 0x9aa39f : 0x2b3230, 1, 0); g.add(s); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(s.geometry), new THREE.LineBasicMaterial({ color: 0x1a201e })).translateX(s.position.x).translateY(s.position.y).translateZ(s.position.z)); });
    if (floorMode) {
      const wallH = Math.min(h - 0.3, 2.7), wt = 0.12;
      (p.rooms || []).forEach(r => {
        if (r.kind === 'void') return;
        const pts = r.poly ? r.poly : [[r.m[0], r.m[1]], [r.m[2], r.m[1]], [r.m[2], r.m[3]], [r.m[0], r.m[3]]];
        // floor plate
        const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, z)));
        const plate = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: KIND[r.kind] ?? 0xEDEDE8, roughness: 1, side: THREE.DoubleSide }));
        plate.rotation.x = Math.PI / 2; plate.position.y = y + 0.02; plate.receiveShadow = true; g.add(plate);
        const outdoor = r.kind === 'outdoor' || r.kind === 'green' || r.kind === 'parking' || r.kind === 'water';
        if (outdoor) return;
        // walls along every edge (interior partitions are shared, so they get drawn twice — harmless)
        for (let i = 0; i < pts.length; i++) {
          const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
          const len = Math.hypot(x2 - x1, z2 - z1); if (len < 0.05) continue;
          const wall = new THREE.Mesh(new THREE.BoxGeometry(len, wallH, wt), new THREE.MeshStandardMaterial({ color: 0xF7F6F2, roughness: 0.95, transparent: true, opacity: 0.85 }));
          wall.position.set((x1 + x2) / 2, y + wallH / 2, (z1 + z2) / 2); wall.rotation.y = -Math.atan2(z2 - z1, x2 - x1); wall.castShadow = true; wall.receiveShadow = true; g.add(wall);
          const cap = new THREE.LineSegments(new THREE.EdgesGeometry(wall.geometry), new THREE.LineBasicMaterial({ color: 0x3a4442 })); cap.position.copy(wall.position); cap.rotation.copy(wall.rotation); g.add(cap);
        }
      });
    }
    (p.rooms || []).forEach(r => {
      if (floorMode) return;
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
    if (b.dataset.a === 'reset') { camera.position.copy(home); controls.target.set(cx, floorMode ? 0.8 : (top + bottom) / 2, cz); }
    if (b.dataset.a === 'top') { camera.position.copy(topView); controls.target.set(cx, 0, cz); }
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
