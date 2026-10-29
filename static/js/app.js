import * as THREE from 'three';

const experiences = [
  {
    period: '2005–10', role: 'Staatliches Diplom', focus: 'Kaufmännische Fachrichtung mit Rechnungswesen & Informatik',
    company: 'I.T.C. “Antonio De Viti De Marco”', location: 'Casarano (LE), Italien', kind: 'diploma', short: 'Diplom',
    tasks: ['European Certificate of Digital Literacy (ECDL)', 'Spezialkurs zur Zugänglichkeit von Webseiten (CRUI)', 'Praktikum als Buchhalter bei der Stadtverwaltung Ugento']
  },
  {
    period: '2016–20', role: 'Leiter Auftragsabwicklung und Logistik', focus: 'Hotellerie · Organisation · Führung',
    company: 'Isola di Pazze Hotel Resort ****', location: 'Ugento (LE), Italien', kind: 'hotel', short: 'Hotel',
    tasks: ['Leitung des Hotellagers und Implementierung einer Lagerführungssoftware', 'Bestellwesen für die gesamte Anlage und verschiedene Abteilungen', 'Personalrekrutierung, Führung und Coaching', 'Schichtplanung und Supervision von 12 Abteilungen']
  },
  {
    period: '2020–21', role: 'Logistiker', focus: 'Lager · Qualität · Kundenbestellungen',
    company: '4MyBaby AG', location: '8862 Schübelbach', kind: 'container', short: '4MyBaby',
    tasks: ['Lagerhaltung', 'Qualitätssicherung', 'Rüsten von Kundenbestellungen', 'Verpacken von Kundenbestellungen']
  },
  {
    period: '2021–22', role: 'Allrounder Logistiker', focus: 'Warenausgang · Sortierung',
    company: 'Workmanagement AG · Estée Lauder', location: '8853 Lachen', kind: 'forklift', short: 'Estée Lauder',
    tasks: ['Vorbereitung und Kontrolle des Warenausgangs', 'Sortierung von Paketen']
  },
  {
    period: '2022–23', role: 'Logistik-Service', focus: 'Pakete · Briefe · Zustellung',
    company: 'Post CH AG', location: 'Logistikzentrum 8820 Wädenswil', kind: 'van', short: 'Post CH',
    tasks: ['Sortierung von Paketen und Briefen', 'Zustellung von Paketen unterschiedlicher Art']
  },
  {
    period: '2023–25', role: 'Lagerverantwortlicher', focus: 'Bestände · Warenfluss · Prozessoptimierung',
    company: 'Dr. Ihde Dental AG', location: '8737 Gommiswald', kind: 'dental', short: 'Dental Lager',
    tasks: ['Planung und Gestaltung der Lagerflächen', 'Bestandskontrolle', 'Koordination und Überprüfung des Wareneingangs und Warenausgangs', 'Erfassung und Verwaltung von Beständen', 'Optimierung von Prozessen']
  },
  {
    period: 'Aktuell / 2026', role: 'Prozessleiter', focus: 'Auftragsabwicklung & Exportlogistik',
    company: 'Dr. Ihde Dental AG', location: '8737 Gommiswald', kind: 'globe', short: 'Prozessleiter',
    tasks: ['Teamkoordination und Aufgabenverteilung', 'Direkte Kundenkommunikation', 'Auftragsbearbeitung, Rechnungs- und Lieferscheinerstellung', 'Endkontrolle der Versandprozesse', 'Zoll- und Exportabwicklung international und interkontinental', 'Transportorganisation mit Logistikpartnern']
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const canvas = $('#careerCanvas');
const stage = $('.stage');
const detailPanel = $('#detailPanel');
const timelineRail = $('#timelineRail');
const compactDialog = $('#compactDialog');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let selectedIndex = experiences.length - 1;
let currentSection = 'career';

// ---------- UI content ----------
function updateDetail(index, animate = true) {
  selectedIndex = Math.max(0, Math.min(experiences.length - 1, index));
  const item = experiences[selectedIndex];
  $('#detailIndex').textContent = String(selectedIndex + 1).padStart(2, '0');
  $('#detailPeriod').textContent = item.period;
  $('#detailRole').textContent = item.role;
  $('#detailFocus').textContent = item.focus;
  $('#detailCompany').textContent = item.company;
  $('#detailLocation').textContent = item.location;
  $('#stageCounter').textContent = `${String(selectedIndex + 1).padStart(2, '0')} / ${String(experiences.length).padStart(2, '0')}`;
  const tasks = $('#detailTasks');
  tasks.replaceChildren(...item.tasks.map((task, i) => {
    const li = document.createElement('li');
    li.textContent = task;
    if (animate) li.style.animationDelay = `${i * 55}ms`;
    return li;
  }));
  $('#roleProgress').style.transform = `scaleX(${(selectedIndex + 1) / experiences.length})`;
  $$('.timeline-button').forEach((button, i) => button.classList.toggle('active', i === selectedIndex));
  $$('.fallback-platform').forEach((button, i) => button.classList.toggle('active', i === selectedIndex));
  platformGroups.forEach((group, i) => setPlatformState(group, i === selectedIndex));
}

experiences.forEach((item, index) => {
  const button = document.createElement('button');
  button.className = 'timeline-button';
  button.innerHTML = `<span>${item.period}</span>`;
  button.setAttribute('aria-label', `${item.period}: ${item.role}`);
  button.addEventListener('click', () => selectRole(index));
  timelineRail.append(button);
});

const fallbackCareer = $('#fallbackCareer');
const fallbackStack = document.createElement('div');
fallbackStack.className = 'fallback-stack';
experiences.forEach((item, index) => {
  const button = document.createElement('button');
  button.className = 'fallback-platform';
  button.style.setProperty('--step', experiences.length - 1 - index);
  button.innerHTML = `<span>${item.period} · ${item.short}</span>`;
  button.setAttribute('aria-label', `${item.period}: ${item.role}`);
  button.addEventListener('click', () => selectRole(index));
  fallbackStack.append(button);
});
fallbackCareer.append(fallbackStack);

const compactTimeline = $('#compactTimeline');
[...experiences].reverse().forEach((item) => {
  const row = document.createElement('div');
  row.className = 'compact-row';
  row.innerHTML = `<time>${item.period}</time><div><b>${item.role}</b><small>${item.company} · ${item.location}</small></div>`;
  compactTimeline.append(row);
});

// ---------- Three.js scene ----------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020a12, 0.035);
const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
camera.position.set(9, 8, 10);
let webGLAvailable = true;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
} catch (error) {
  webGLAvailable = false;
  document.documentElement.classList.add('no-webgl');
  renderer = { setPixelRatio() {}, setClearColor() {}, setSize() {}, render() {} };
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setClearColor(0x000000, 0);
if (webGLAvailable) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
}

scene.add(new THREE.HemisphereLight(0x8ed8ff, 0x071018, 1.25));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(8, 12, 10);
scene.add(keyLight);
const orangeLight = new THREE.PointLight(0xff7d0a, 35, 18, 2);
orangeLight.position.set(-2, 4, 4);
scene.add(orangeLight);
const blueLight = new THREE.PointLight(0x159fe8, 26, 18, 2);
blueLight.position.set(5, 0, -4);
scene.add(blueLight);

const world = new THREE.Group();
scene.add(world);

function metal(color = 0x152431, emissive = 0x000000) {
  return new THREE.MeshStandardMaterial({ color, metalness: .82, roughness: .24, emissive, emissiveIntensity: .2 });
}
function material(color, roughness = .42, metalness = .18) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function mesh(geometry, mat, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  return object;
}
function box(size, color, position) {
  return mesh(new THREE.BoxGeometry(...size), material(color), position);
}
function wheel(position, scale = 1) {
  const w = mesh(new THREE.CylinderGeometry(.18 * scale, .18 * scale, .13 * scale, 20), material(0x101318, .65, .1), position);
  w.rotation.z = Math.PI / 2;
  const hub = mesh(new THREE.CylinderGeometry(.07 * scale, .07 * scale, .14 * scale, 16), metal(0x8c9aa5), [0, 0, 0]);
  w.add(hub);
  return w;
}
function makeTextSprite(text, color = '#eaf6ff', size = 55, maxWidth = 680) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 180;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = `900 ${size}px Arial Narrow, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = color; ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  const measured = ctx.measureText(text.toUpperCase()).width;
  const scale = measured > maxWidth ? maxWidth / measured : 1;
  ctx.save(); ctx.translate(c.width / 2, c.height / 2); ctx.scale(scale, 1); ctx.fillText(text.toUpperCase(), 0, 0); ctx.restore();
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(4.4, .78, 1);
  return sprite;
}

function emblemDiploma() {
  const g = new THREE.Group();
  [[1.15,.18,.62,0x254f82], [1.25,.18,.58,0xe08a1c], [1.05,.18,.52,0xb9d3e3]].forEach((b,i) => g.add(box(b.slice(0,3), b[3], [0, .11 + i*.2, 0])));
  const cap = box([1.15,.08,.78], 0x131a22, [0,.82,0]); cap.rotation.y = .25; g.add(cap);
  const crown = box([.55,.25,.38],0x161e27,[0,.68,0]); g.add(crown);
  const tassel = mesh(new THREE.CylinderGeometry(.025,.025,.65,8),material(0xff8a16),[.52,.54,.12]); tassel.rotation.z=.5; g.add(tassel);
  return g;
}
function emblemHotel() {
  const g = new THREE.Group();
  const building = box([1.35,1.45,.7],0xe0b36d,[0,.75,0]); g.add(building);
  const roof = box([1.55,.12,.85],0xf3d9a3,[0,1.52,0]); g.add(roof);
  for(let r=0;r<3;r++) for(let c=0;c<4;c++) g.add(box([.16,.18,.025],0x1870a0,[-.48+c*.32,.35+r*.38,.365]));
  const palm = mesh(new THREE.CylinderGeometry(.04,.07,.85,10),material(0x8a5b2b),[.95,.42,.1]); palm.rotation.z=-.12; g.add(palm);
  for(let i=0;i<6;i++){const leaf=box([.5,.045,.14],0x2f8f55,[.95,1,.1]);leaf.rotation.y=i*Math.PI/3;leaf.rotation.z=(i%2?.25:-.25);g.add(leaf)}
  return g;
}
function emblemContainer() {
  const g = new THREE.Group();
  const cont = box([1.55,.85,.72],0x0673c7,[.25,.45,0]); g.add(cont);
  for(let i=-3;i<=3;i++) g.add(box([.025,.68,.01],0x5ab8ee,[.25+i*.2,.45,.365]));
  [[-.9,.22,.18],[-.56,.18,-.16],[-.45,.44,.14]].forEach((p,i)=>{const b=box([.48,.42,.42],i===2?0xd9a75f:0xc98a42,p);g.add(b)});
  return g;
}
function emblemForklift() {
  const g = new THREE.Group();
  g.add(box([.95,.48,.72],0xe19013,[-.15,.42,0]));
  g.add(box([.5,.55,.66],0x202a32,[.15,.9,0]));
  const mast = box([.09,1.25,.08],0x2b3540,[-.72,.82,.25]); g.add(mast);
  const mast2 = mast.clone(); mast2.position.z=-.25; g.add(mast2);
  g.add(box([1.0,.06,.08],0x667782,[-1.12,.18,.25])); g.add(box([1.0,.06,.08],0x667782,[-1.12,.18,-.25]));
  g.add(wheel([.25,.2,.42],1.1),wheel([.25,.2,-.42],1.1),wheel([-.55,.17,.42],.82),wheel([-.55,.17,-.42],.82));
  g.add(box([.55,.52,.5],0xc98a42,[-1.18,.48,0]));
  return g;
}
function emblemVan() {
  const g = new THREE.Group();
  g.add(box([1.55,.72,.76],0xf2b412,[.1,.52,0]));
  const cab = box([.7,.62,.76],0xf2b412,[-.8,.47,0]); cab.rotation.z=-.06;g.add(cab);
  g.add(box([.36,.25,.02],0x16384c,[-.83,.68,.39]));
  g.add(wheel([.55,.18,.43]),wheel([.55,.18,-.43]),wheel([-.68,.18,.43]),wheel([-.68,.18,-.43]));
  const logo=makeTextSprite('POST','#121212',43);logo.scale.set(1.05,.28,1);logo.position.set(.18,.56,.4);g.add(logo);
  g.add(box([.42,.42,.42],0xc78a43,[1.05,.24,.18]));g.add(box([.34,.3,.34],0xd29b58,[1.2,.18,-.22]));
  return g;
}
function emblemDental() {
  const g = new THREE.Group();
  const crown = mesh(new THREE.SphereGeometry(.58,32,24),material(0xf2f5f4,.2,.05),[0,.78,0]); crown.scale.set(1,.9,.74);g.add(crown);
  [-.3,.3].forEach((x)=>{const root=mesh(new THREE.CapsuleGeometry(.17,.55,8,16),material(0xe8efef,.25,.03),[x,.25,0]);root.rotation.z=x>0?-.18:.18;g.add(root)});
  const screen=box([.72,.48,.08],0x193448,[.92,.42,.12]);screen.rotation.y=-.25;g.add(screen);
  for(let i=0;i<3;i++){const dot=mesh(new THREE.SphereGeometry(.06,12,8),material(0x22b4ff, .2, .1),[.75+i*.18,.44,.18]);g.add(dot)}
  return g;
}
function emblemGlobe() {
  const g = new THREE.Group();
  const sphere = mesh(new THREE.SphereGeometry(.7,36,24),new THREE.MeshStandardMaterial({color:0x087bc0,metalness:.35,roughness:.32,emissive:0x022e4c,emissiveIntensity:.45}),[0,.88,0]);g.add(sphere);
  const wire=mesh(new THREE.SphereGeometry(.715,18,12),new THREE.MeshBasicMaterial({color:0xffa22d,wireframe:true,transparent:true,opacity:.5}),[0,.88,0]);g.add(wire);
  const orbit=mesh(new THREE.TorusGeometry(.9,.035,10,64),material(0xff9a22,.28,.75),[0,.88,0]);orbit.rotation.x=1.08;orbit.rotation.y=.22;g.add(orbit);
  const stand=mesh(new THREE.CylinderGeometry(.36,.48,.18,32),metal(0x9b651b,0x5b2b00),[0,.12,0]);g.add(stand);
  const arrow=mesh(new THREE.ConeGeometry(.16,.42,18),material(0xff8a16,.25,.55),[-.85,1.55,.15]);arrow.rotation.z=-.72;g.add(arrow);
  g.userData.animate=(time)=>{sphere.rotation.y=time*.35;wire.rotation.y=-time*.22;orbit.rotation.z=time*.12;};
  return g;
}
function createEmblem(kind) {
  const factories={diploma:emblemDiploma,hotel:emblemHotel,container:emblemContainer,forklift:emblemForklift,van:emblemVan,dental:emblemDental,globe:emblemGlobe};
  const result=factories[kind](); result.scale.setScalar(.72); return result;
}

const platformGroups = [];
const helixPoints = [];
const gap = 1.62;
const centerOffset = (experiences.length - 1) * gap / 2;

experiences.forEach((item, index) => {
  const angle = index * .88 - .4;
  const x = Math.cos(angle) * 1.25;
  const z = Math.sin(angle) * 1.25;
  const y = index * gap - centerOffset;
  helixPoints.push(new THREE.Vector3(x, y, z));
  const group = new THREE.Group();
  group.position.set(x, y, z); group.rotation.y = -.2 - angle * .16; group.userData.index = index;
  const baseMat = metal(0x172733,0x06141f);
  const base = mesh(new THREE.CylinderGeometry(2.2,2.28,.27,64),baseMat); base.userData.index=index; group.add(base);
  const top = mesh(new THREE.CylinderGeometry(2.12,2.12,.05,64),new THREE.MeshPhysicalMaterial({color:0x132431,metalness:.72,roughness:.2,clearcoat:1,clearcoatRoughness:.2}),[0,.16,0]); top.userData.index=index;group.add(top);
  const ringMat = new THREE.MeshStandardMaterial({color:0x6cc9ff,emissive:0x0b75aa,emissiveIntensity:.55,metalness:.7,roughness:.18});
  const ring=mesh(new THREE.TorusGeometry(1.97,.035,12,80),ringMat,[0,.205,0]);ring.rotation.x=Math.PI/2;group.add(ring);
  const period=makeTextSprite(item.period,index===experiences.length-1?'#ff9a22':'#eaf6ff',58);period.position.set(-.75,.68,1.45);period.scale.set(2.2,.5,1);group.add(period);
  const emblem=createEmblem(item.kind);emblem.position.set(.42,.23,0);emblem.userData.index=index;group.add(emblem);
  const short=makeTextSprite(item.short,'#62bdf2',36);short.position.set(.5,.45,-1.42);short.scale.set(2.2,.42,1);group.add(short);
  group.userData={index,base,ring,emblem,baseScale:1,baseY:y};
  group.traverse((child)=>{if(child.isMesh) child.userData.index=index;});
  world.add(group); platformGroups.push(group);
});

const curve = new THREE.CatmullRomCurve3(helixPoints.map((p,i)=>new THREE.Vector3(p.x-1.7,p.y+.05,p.z+.1)),false,'catmullrom',.35);
const path = mesh(new THREE.TubeGeometry(curve,150,.055,10,false),new THREE.MeshStandardMaterial({color:0xff8a16,emissive:0xff5b00,emissiveIntensity:1.4,metalness:.4,roughness:.22}));
world.add(path);

// star field
const starGeo = new THREE.BufferGeometry();
const starData=[];
for(let i=0;i<420;i++) starData.push((Math.random()-.5)*38,(Math.random()-.5)*28,(Math.random()-.5)*38);
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starData,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x67bde9,size:.035,transparent:true,opacity:.5,depthWrite:false}));scene.add(stars);

function setPlatformState(group, active) {
  group.userData.active = active;
  group.userData.ring.material.color.set(active ? 0xff941f : 0x6cc9ff);
  group.userData.ring.material.emissive.set(active ? 0xff5c00 : 0x0b75aa);
  group.userData.ring.material.emissiveIntensity = active ? 1.6 : .42;
}

let cameraAngle = .72;
let cameraRadius = 9.8;
const cameraTarget = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
function selectRole(index) {
  const next=Math.max(0,Math.min(experiences.length-1,index));
  if(next===selectedIndex && currentSection==='career') return;
  if(currentSection!=='career') activateSection('career');
  updateDetail(next);
}

function resize() {
  const rect=canvas.getBoundingClientRect();
  renderer.setSize(rect.width,rect.height,false);
  camera.aspect=rect.width/Math.max(rect.height,1);camera.updateProjectionMatrix();
  cameraRadius=rect.width<600?8.3:9.8;
}
window.addEventListener('resize',resize,{passive:true});resize();

let pointerDown=false,startX=0,startY=0,lastX=0,moved=0;
canvas.addEventListener('pointerdown',(e)=>{pointerDown=true;startX=lastX=e.clientX;startY=e.clientY;moved=0;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',(e)=>{if(!pointerDown)return;const dx=e.clientX-lastX;cameraAngle-=dx*.008;moved+=Math.abs(dx)+Math.abs(e.clientY-startY)*.1;lastX=e.clientX;});
canvas.addEventListener('pointerup',(e)=>{if(!pointerDown)return;pointerDown=false;const dy=e.clientY-startY;if(Math.abs(dy)>55)selectRole(selectedIndex+(dy<0?1:-1));else if(moved<8)pickPlatform(e);});
let wheelLock=false;
canvas.addEventListener('wheel',(e)=>{e.preventDefault();if(wheelLock)return;wheelLock=true;selectRole(selectedIndex+(e.deltaY<0?1:-1));setTimeout(()=>wheelLock=false,420);},{passive:false});

const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
function pickPlatform(e){const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(platformGroups,true);if(hits.length&&Number.isInteger(hits[0].object.userData.index))selectRole(hits[0].object.userData.index);}

let lastTime=0;
function render(timeMs){const time=timeMs*.001;const item=helixPoints[selectedIndex];desiredTarget.set(item.x,item.y+.35,item.z);cameraTarget.lerp(desiredTarget,reduceMotion?1:.055);const desiredCamera=new THREE.Vector3(cameraTarget.x+Math.cos(cameraAngle)*cameraRadius,cameraTarget.y+2.15,cameraTarget.z+Math.sin(cameraAngle)*cameraRadius);camera.position.lerp(desiredCamera,reduceMotion?1:.055);camera.lookAt(cameraTarget);platformGroups.forEach((g,i)=>{const targetScale=g.userData.active?1.09:1;const s=THREE.MathUtils.lerp(g.scale.x,targetScale,.08);g.scale.setScalar(s);if(!reduceMotion){g.rotation.y+=g.userData.active?.0025:.0007;g.position.y=g.userData.baseY+Math.sin(time*1.6+i)*.018;if(g.userData.emblem.userData.animate)g.userData.emblem.userData.animate(time);}});stars.rotation.y=time*.008;renderer.render(scene,camera);lastTime=time;requestAnimationFrame(render);}requestAnimationFrame(render);

// ---------- Navigation and controls ----------
function activateSection(section) {
  currentSection=section;
  $$('.nav-pill').forEach(button=>button.classList.toggle('active',button.dataset.section===section));
  const isCareer=section==='career';stage.classList.toggle('alt-mode',!isCareer);detailPanel.classList.toggle('dimmed',!isCareer);timelineRail.classList.toggle('hidden',!isCareer);
  $$('.focus-section').forEach(el=>{const visible=el.id===`${section}Section`;el.classList.toggle('visible',visible);el.setAttribute('aria-hidden',String(!visible));});
  $('#stageKicker').textContent=isCareer?'Beruflicher Weg':section==='profile'?'Persönliches Profil':section==='it'?'Digitales Profil':'Arbeitsweise';
}
$$('.nav-pill').forEach(button=>button.addEventListener('click',()=>activateSection(button.dataset.section)));
$('#prevRole').addEventListener('click',()=>selectRole(selectedIndex-1));
$('#nextRole').addEventListener('click',()=>selectRole(selectedIndex+1));
document.addEventListener('keydown',(e)=>{if(compactDialog.open&&e.key==='Escape')return;if(e.key==='ArrowUp'||e.key==='ArrowRight')selectRole(selectedIndex+1);if(e.key==='ArrowDown'||e.key==='ArrowLeft')selectRole(selectedIndex-1);});

$$('.network-node').forEach(node=>node.addEventListener('click',()=>{$$('.network-node').forEach(n=>n.classList.remove('active'));node.classList.add('active');$('#networkCopy').textContent=node.dataset.copy;}));
$$('.skill-orbit button').forEach(button=>button.addEventListener('click',()=>{button.animate([{transform:getComputedStyle(button).transform,boxShadow:'0 0 0 rgba(255,138,22,0)'},{boxShadow:'0 0 38px rgba(255,138,22,.42)'},{transform:getComputedStyle(button).transform,boxShadow:'0 0 0 rgba(255,138,22,0)'}],{duration:650});}));

$('#compactBtn').addEventListener('click',()=>compactDialog.showModal());
$('#closeCompact').addEventListener('click',()=>compactDialog.close());
compactDialog.addEventListener('click',(e)=>{if(e.target===compactDialog)compactDialog.close();});
$('#printBtn').addEventListener('click',()=>{if(!compactDialog.open)compactDialog.showModal();setTimeout(()=>window.print(),120);});

updateDetail(selectedIndex,false);
setTimeout(()=>$('#loading').classList.add('done'),reduceMotion?100:850);
