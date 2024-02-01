import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';

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
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());

    const mixerUpdateDelta = this.clock.getDelta();
    this.mixers.forEach((mixer) => mixer.update(mixerUpdateDelta));

    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const planes = [
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
];
let planeHelpers: THREE.PlaneHelper[];
let object: THREE.Group;
let planeObjects: THREE.Mesh[];

const params = {
  animate: true,
  planeX: {
    constant: 0,
    negated: false,
    displayHelper: false,
  },
  planeY: {
    constant: 0,
    negated: false,
    displayHelper: false,
  },
  planeZ: {
    constant: 0,
    negated: false,
    displayHelper: false,
  },
};

class Demo extends Main {
  initRenderer() {
    super.initRenderer();
    this.renderer.setClearColor(0x263238);
    this.renderer.localClippingEnabled = true;
  }
  initPlane() {
    planeHelpers = planes.map((p) => new THREE.PlaneHelper(p, 2, 0xffffff));
    planeHelpers.forEach((ph) => {
      ph.visible = false;
      this.scene.add(ph);
    });

    const geometry = new THREE.TorusKnotBufferGeometry(0.4, 0.15, 220, 60);
    object = new THREE.Group();
    this.scene.add(object);

    planeObjects = [];
    const planeGeom = new THREE.PlaneBufferGeometry(4, 4);
    planes.forEach((plane, i) => {
      const poGroup = new THREE.Group();
      const stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1);

      const planeMat = new THREE.MeshStandardMaterial({
        color: 0xe91e63,
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: planes.filter((p) => p !== plane),

        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
      });
      const po = new THREE.Mesh(planeGeom, planeMat);
      po.onAfterRender = (renderer) => renderer.clearStencil();
      po.renderOrder = i + 1.1;
      object.add(stencilGroup);
      poGroup.add(po);
      planeObjects.push(po);
      this.scene.add(poGroup);
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0xffc107,
      metalness: 0.1,
      roughness: 0.75,
      clippingPlanes: planes,
      clipShadows: true,
      shadowSide: THREE.DoubleSide,
    });
    const clippedColorFront = new THREE.Mesh(geometry, material);
    clippedColorFront.castShadow = true;
    clippedColorFront.renderOrder = 6;
    object.add(clippedColorFront);

    const ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(9, 9, 1, 1),
      new THREE.ShadowMaterial({
        color: 0,
        opacity: 0.25,
        side: THREE.DoubleSide,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const gui = new GUI();
    gui.add(params, 'animate');

    ['planeX', 'planeY', 'planeZ'].forEach((key, i) => {
      const plane = gui.addFolder(key);
      const target = (params as any)[key];
      plane
        .add(target, 'displayHelper')
        .onChange((v) => (planeHelpers[i].visible = v));
      plane
        .add(target, 'constant')
        .min(-1)
        .max(1)
        .onChange((d) => (planes[i].constant = d));
      plane.add(target, 'negated').onChange(() => {
        planes[i].negate();
        target.constant = planes[i].constant;
      });
      plane.open();
    });
  }
  animate() {
    const delta = this.clock.getDelta();
    requestAnimationFrame(this.animate.bind(this));
    if (params.animate) {
      object.rotation.x += delta * 0.5;
      object.rotation.y += delta * 0.2;
    }
    planeObjects.forEach((po, i) => {
      const plane = planes[i];
      plane.coplanarPoint(po.position);
      po.lookAt(
        po.position.x - plane.normal.x,
        po.position.y - plane.normal.y,
        po.position.z - plane.normal.z
      );
    });
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

function createPlaneStencilGroup(
  geometry: THREE.BufferGeometry,
  plane: THREE.Plane,
  renderOrder: number
) {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshBasicMaterial();
  baseMat.depthWrite = false;
  baseMat.depthTest = false;
  baseMat.colorWrite = false;
  baseMat.stencilWrite = true;
  baseMat.stencilFunc = THREE.AlwaysStencilFunc;

  const mat0 = baseMat.clone();
  mat0.side = THREE.BackSide;
  mat0.clippingPlanes = [plane];
  mat0.stencilFail = THREE.IncrementWrapStencilOp;
  mat0.stencilZFail = THREE.IncrementWrapStencilOp;
  mat0.stencilZPass = THREE.IncrementWrapStencilOp;

  const mesh0 = new THREE.Mesh(geometry, mat0);
  mesh0.renderOrder = renderOrder;
  group.add(mesh0);

  const mat1 = baseMat.clone();
  mat1.side = THREE.FrontSide;
  mat1.clippingPlanes = [plane];
  mat1.stencilFail = THREE.DecrementWrapStencilOp;
  mat1.stencilZFail = THREE.DecrementWrapStencilOp;
  mat1.stencilZPass = THREE.DecrementWrapStencilOp;

  const mesh1 = new THREE.Mesh(geometry, mat1);
  mesh1.renderOrder = renderOrder;

  group.add(mesh1);

  return group;
}

new Demo();
