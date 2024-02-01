import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class StyleRule {
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

export class Main {
  protected container: HTMLDivElement;
  protected clock: THREE.Clock;
  protected renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected stats: Stats;

  protected mixers: THREE.AnimationMixer[] = [];

  constructor() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.id = 'container';
    this.clock = new THREE.Clock();

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initHemiLight();
    this.initDirLight();
    this.initPlane();
    this.initControls();

    window.addEventListener('resize', () => this.onWindowResize(), false);

    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);
    this.animate();
  }

  protected initRenderer(antialias = true) {
    this.renderer = new THREE.WebGLRenderer({ antialias });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  protected initScene(color = 0xa0a0a0, near = 10, far = 22): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(color);
    this.scene.fog = new THREE.Fog(color, near, far);
  }

  protected initCamera(
    fov = 45,
    near = 1,
    far = 10000,
    pos = new THREE.Vector3(3, 6, -10),
    look = new THREE.Vector3(0, 1, 0)
  ) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      near,
      far
    );
    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(look);
  }

  protected initHemiLight(
    skyColor = 0xffffff,
    groundColor = 0x444444,
    pos = new THREE.Vector3(0, 20, 0)
  ): void {
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor);
    hemiLight.position.set(pos.x, pos.y, pos.z);
    this.scene.add(hemiLight);
  }

  protected initDirLight(
    color = 0xffffff,
    pos = new THREE.Vector3(-3, 10, -10),
    castShadow = true,
    size = 10,
    near = 0.1,
    far = 40
  ) {
    const dirLight = new THREE.DirectionalLight(color);
    dirLight.position.set(pos.x, pos.y, pos.z);
    dirLight.castShadow = castShadow;
    if (castShadow) {
      const { camera } = dirLight.shadow;
      camera.top = size;
      camera.bottom = -size;
      camera.left = -size;
      camera.right = size;
      camera.near = near;
      camera.far = far;
    }
    this.scene.add(dirLight);
  }

  protected initPlane(color = 0x999999, receiveShadow = true) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(40, 40),
      new THREE.MeshPhongMaterial({
        color,
        depthWrite: false,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = receiveShadow;
    this.scene.add(mesh);
  }

  protected onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  protected controls: OrbitControls;

  protected initControls(
    target = new THREE.Vector3(0, 1, 0),
    pan = true,
    zoom = true
  ): void {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = pan;
    controls.enableZoom = zoom;
    controls.target.set(target.x, target.y, target.z);
    controls.update();
    this.controls = controls;
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());

    const mixerUpdateDelta = this.clock.getDelta();
    this.mixers.forEach((mixer) => mixer.update(mixerUpdateDelta));

    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';
import { GUI } from 'dat.gui';

let line: THREE.Line;
let mesh: THREE.Mesh;
const textureLoader = new THREE.TextureLoader();
let raycaster: THREE.Raycaster;
let mouseHelper: THREE.Mesh;
const intersection = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3(),
};
const mouse = new THREE.Vector2();
const intersects: THREE.Intersection[] = [];
const position = new THREE.Vector3();
const orientation = new THREE.Euler();

let decals: THREE.Mesh[] = [];
const size = new THREE.Vector3(10, 10, 10);
const decalDiffuse = textureLoader.load('./decal-diffuse.png');
const decalNormal = textureLoader.load('./decal-normal.jpg');
const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: decalDiffuse,
  normalMap: decalNormal,
  normalScale: new THREE.Vector2(1, 1),
  shininess: 30,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false,
});

const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true,
  clear: () => {},
};

function removeDecals(scene: THREE.Scene) {
  decals.forEach((d) => {
    scene.remove(d);
  });
  decals = [];
}

class Demo extends Main {
  initPlane() {
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
    this.scene.add(line);

    this.loadLeePerrySmith();

    raycaster = new THREE.Raycaster();

    mouseHelper = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 1, 10),
      new THREE.MeshNormalMaterial()
    );
    mouseHelper.visible = false;
    this.scene.add(mouseHelper);

    const gui = new GUI();
    gui.add(params, 'minScale', 1, 30);
    gui.add(params, 'maxScale', 1, 30);
    gui.add(params, 'rotate');
    gui.add(params, 'clear').onChange((v) => {
      removeDecals(this.scene);
    });
    gui.open();
  }

  initCamera() {
    super.initCamera();
  }

  initControls() {
    super.initControls();
    let moved = false;
    this.controls.addEventListener('change', () => {
      moved = true;
    });
    window.addEventListener(
      'pointerdown',
      () => {
        moved = false;
      },
      false
    );
    window.addEventListener('pointerup', (event) => {
      if (moved === false) {
        this.checkIntersection(event.clientX, event.clientY);
        if (intersection.intersects) {
          this.shoot();
        }
      }
    });
    window.addEventListener('pointermove', (event) => {
      if (event.isPrimary) {
        this.checkIntersection(event.clientX, event.clientY);
      }
    });
  }

  checkIntersection(x: number, y: number) {
    if (mesh === undefined) {
      return;
    }
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera);
    raycaster.intersectObject(mesh, false, intersects);
    if (intersects.length > 0) {
      const p = intersects[0].point;
      mouseHelper.position.copy(p);
      intersection.point.copy(p);

      const n = intersects[0].face.normal.clone();
      n.transformDirection(mesh.matrixWorld);
      n.multiplyScalar(10);
      n.add(intersects[0].point);

      intersection.normal.copy(intersects[0].face.normal);
      mouseHelper.lookAt(n);

      const positions = (line.geometry as THREE.BufferGeometry).attributes
        .position;
      positions.setXYZ(0, p.x, p.y, p.z);
      positions.setXYZ(1, n.x, n.y, n.z);
      (positions as any).needsUpdate = true;
      intersection.intersects = true;
      intersects.length = 0;
    } else {
      intersection.intersects = false;
    }
  }

  shoot() {
    position.copy(intersection.point);
    orientation.copy(mouseHelper.rotation);

    if (params.rotate) {
      orientation.z = Math.random() * 2 * Math.PI;
    }
    const scale =
      params.minScale + Math.random() * (params.maxScale - params.minScale);
    size.set(scale, scale, scale);

    const material = decalMaterial.clone();
    material.color.setHex(Math.random() * 0xffffff);

    const m = new THREE.Mesh(
      new DecalGeometry(mesh, position, orientation, size),
      material
    );

    decals.push(m);
    this.scene.add(m);
  }

  loadLeePerrySmith() {
    const loader = new GLTFLoader();
    loader.load('./LeePerrySmith.glb', (gltf) => {
      mesh = gltf.scene.children[0] as THREE.Mesh;
      mesh.material = new THREE.MeshPhongMaterial({
        specular: 0x111111,
        map: textureLoader.load('./Map-Col.jpg'),
        specularMap: textureLoader.load('./Map-SPEC.jpg'),
        normalMap: textureLoader.load(
          './Infinite-Level_02_Tangent_SmoothUV.jpg'
        ),
        shininess: 25,
      });
      this.scene.add(mesh);
    });
  }
}

new Demo();
