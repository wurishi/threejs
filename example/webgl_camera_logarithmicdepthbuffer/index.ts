import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class StyleRule {
  private style: HTMLStyleElement;

  constructor() {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    head.appendChild(style);
    this.style = style;
  }

  addCSSRule(selector: string, rules: string, index = 0) {
    if (this.style.sheet.insertRule) {
      this.style.sheet.insertRule(selector + '{' + rules + '}', index);
    } else if (this.style.sheet.addRule) {
      this.style.sheet.addRule(selector, rules, index);
    }
  }
}

const style = new StyleRule();
style.addCSSRule(
  '#renderer_border',
  'position:absolute;top:0;left:25%;bottom:0;width:2px;z-index:10;opacity:.8;background:#ccc;border:1px inset #ccc;cursor:col-resize;'
);
style.addCSSRule('#container', 'display:flex;');
style.addCSSRule(
  '#container_normal',
  'width:50%;display:inline-block;position:relative;'
);
style.addCSSRule(
  '#container_logzbuf',
  'width:50%;display:inline-block;position:relative;'
);

const NEAR = 1e-6;
const FAR = 1e27;
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

const labeldata = [
  { size: 0.01, scale: 0.0001, label: 'microscopic (1µm)' }, // FIXME - triangulating text fails at this size, so we scale instead
  { size: 0.01, scale: 0.1, label: 'minuscule (1mm)' },
  { size: 0.01, scale: 1.0, label: 'tiny (1cm)' },
  { size: 1, scale: 1.0, label: 'child-sized (1m)' },
  { size: 10, scale: 1.0, label: 'tree-sized (10m)' },
  { size: 100, scale: 1.0, label: 'building-sized (100m)' },
  { size: 1000, scale: 1.0, label: 'medium (1km)' },
  { size: 10000, scale: 1.0, label: 'city-sized (10km)' },
  { size: 3400000, scale: 1.0, label: 'moon-sized (3,400 Km)' },
  { size: 12000000, scale: 1.0, label: 'planet-sized (12,000 km)' },
  { size: 1400000000, scale: 1.0, label: 'sun-sized (1,400,000 km)' },
  { size: 7.47e12, scale: 1.0, label: 'solar system-sized (50Au)' },
  { size: 9.4605284e15, scale: 1.0, label: 'gargantuan (1 light year)' },
  { size: 3.08567758e16, scale: 1.0, label: 'ludicrous (1 parsec)' },
  { size: 1e19, scale: 1.0, label: 'mind boggling (1000 light years)' },
];

let container = document.createElement('div');
container.id = 'container';
document.body.appendChild(container);

let border: HTMLDivElement;

let stats: Stats;
interface iView {
  container: HTMLDivElement;
  renderer: THREE.Renderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}
const objects: {
  normal?: iView;
  logzbuf?: iView;
} = {};
const mouse = [0.5, 0.5];
let minzoomspeed = 0.015;
let zoomspeed = minzoomspeed;
let screensplit = 0.25,
  screensplit_right = 0;
let zoompos = -100;

function init() {
  const loader = new THREE.FontLoader();
  loader.load('./helvetiker_regular.typeface.json', (font) => {
    const scene = initScene(font);

    objects.normal = initView(scene, 'normal', false);
    objects.logzbuf = initView(scene, 'logzbuf', true);

    border = document.createElement('div');
    border.id = 'renderer_border';
    document.body.appendChild(border);
    border.addEventListener('pointerdown', onBorderPointerDown);

    animate();
  });

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('wheel', onMouseWheel, false);
}

function onMouseMove(ev: MouseEvent) {
  mouse[0] = ev.clientX / window.innerWidth;
  mouse[1] = ev.clientX / window.innerHeight;
}

function onMouseWheel(ev: WheelEvent) {
  const amount = ev.deltaY;
  if (amount == 0) return;
  const dir = amount / Math.abs(amount);

  zoomspeed = dir / 10;
  minzoomspeed = 0.001;
}

function onWindowResize() {
  updateRendererSizes();
}

init();

function initScene(font: THREE.Font): THREE.Scene {
  const scene = new THREE.Scene();

  scene.add(new THREE.AmbientLight(0x222222));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(100, 100, 100);
  scene.add(light);

  const materialargs = {
    color: 0xffffff,
    specular: 0x050505,
    shininess: 50,
    emissive: 0x000000,
  };
  const geometry = new THREE.SphereBufferGeometry(0.5, 24, 12);
  labeldata.forEach((data, i) => {
    const scale = data.scale || 1;
    const labelgeo = new THREE.TextBufferGeometry(data.label, {
      font: font,
      size: data.size,
      height: data.size / 2,
    });
    labelgeo.computeBoundingSphere();

    labelgeo.translate(-labelgeo.boundingSphere.radius, 0, 0);
    (materialargs as any).color = new THREE.Color().setHSL(
      Math.random(),
      0.5,
      0.5
    );
    const material = new THREE.MeshPhongMaterial(materialargs);

    const group = new THREE.Group();
    group.position.z = -data.size * scale;
    scene.add(group);

    const textmesh = new THREE.Mesh(labelgeo, material);
    textmesh.scale.set(scale, scale, scale);
    textmesh.position.z = -data.size * scale;
    textmesh.position.y = (data.size / 4) * scale;
    group.add(textmesh);

    const dotmesh = new THREE.Mesh(geometry, material);
    dotmesh.position.y = (-data.size / 4) * scale;
    dotmesh.scale.multiplyScalar(data.size * scale);
    group.add(dotmesh);
  });

  return scene;
}

function initView(
  scene: THREE.Scene,
  name: string,
  logDepthBuf: boolean
): iView {
  const framecontainer = document.createElement('div');
  framecontainer.id = 'container_' + name;
  document.body.appendChild(framecontainer);

  const camera = new THREE.PerspectiveCamera(
    50,
    (screensplit * SCREEN_WIDTH) / SCREEN_HEIGHT,
    NEAR,
    FAR
  );
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: logDepthBuf,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.domElement.id = 'renderer_' + name;
  framecontainer.appendChild(renderer.domElement);
  return {
    container: framecontainer,
    renderer,
    scene,
    camera,
  };
}

function animate(): void {
  requestAnimationFrame(animate);
  render();
}

function onBorderPointerDown() {
  window.addEventListener('pointermove', onBorderPointerMove);
  window.addEventListener('pointerup', onBorderPointerUp);
}

function onBorderPointerMove(ev: PointerEvent) {
  screensplit = Math.max(0, Math.min(1, ev.clientX / window.innerWidth));
}

function onBorderPointerUp() {
  window.removeEventListener('pointermove', onBorderPointerMove);
  window.removeEventListener('pointerup', onBorderPointerUp);
}

function updateRendererSizes() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  screensplit_right = 1 - screensplit;

  objects.normal.renderer.setSize(screensplit * SCREEN_WIDTH, SCREEN_HEIGHT);
  objects.normal.camera.aspect = (screensplit * SCREEN_WIDTH) / SCREEN_HEIGHT;
  objects.normal.camera.updateProjectionMatrix();
  objects.normal.camera.setViewOffset(
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    0,
    0,
    SCREEN_WIDTH * screensplit,
    SCREEN_HEIGHT
  );
  objects.normal.container.style.width = screensplit * 100 + '%';

  objects.logzbuf.renderer.setSize(
    screensplit_right * SCREEN_WIDTH,
    SCREEN_HEIGHT
  );
  objects.logzbuf.camera.aspect =
    (screensplit_right * SCREEN_WIDTH) / SCREEN_HEIGHT;
  objects.logzbuf.camera.updateProjectionMatrix();
  objects.logzbuf.camera.setViewOffset(
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_WIDTH * screensplit_right,
    0,
    SCREEN_WIDTH * screensplit_right,
    SCREEN_HEIGHT
  );
  objects.logzbuf.container.style.width = screensplit_right * 100 + '%';

  border.style.left = screensplit * 100 + '%';
}

function render() {
  const minzoom = labeldata[0].size * labeldata[0].scale * 1;
  const maxzoom =
    labeldata[labeldata.length - 1].size *
    labeldata[labeldata.length - 1].scale *
    100;
  let damping = Math.abs(zoomspeed) > minzoomspeed ? 0.95 : 1.0;

  const zoom = THREE.MathUtils.clamp(
    Math.pow(Math.E, zoompos),
    minzoom,
    maxzoom
  );
  zoompos = Math.log(zoom);

  if (
    (zoom == minzoom && zoomspeed < 0) ||
    (zoom == maxzoom && zoomspeed > 0)
  ) {
    damping = 0.85;
  }
  zoompos += zoomspeed;
  zoomspeed *= damping;

  objects.normal.camera.position.set(
    Math.sin(0.5 * Math.PI * (mouse[0] - 0.5)) * zoom,
    Math.sin(0.25 * Math.PI * (mouse[1] - 0.5)) * zoom,
    Math.cos(0.5 * Math.PI * (mouse[0] - 0.5)) * zoom
  );
  objects.normal.camera.lookAt(objects.normal.scene.position);

  objects.logzbuf.camera.position.copy(objects.normal.camera.position);
  objects.logzbuf.camera.quaternion.copy(objects.normal.camera.quaternion);

  if (screensplit_right != 1 - screensplit) {
    updateRendererSizes();
  }
  objects.normal.renderer.render(objects.normal.scene, objects.normal.camera);
  objects.logzbuf.renderer.render(
    objects.logzbuf.scene,
    objects.logzbuf.camera
  );

  stats.update();
}
