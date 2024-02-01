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

function planesFromMesh(vertices: THREE.Vector3[], indices: number[]) {
  const n = indices.length / 3;
  const result = new Array<THREE.Plane>(n);
  for (let i = 0, j = 0; i < n; i++, j += 3) {
    const a = vertices[indices[j]],
      b = vertices[indices[j + 1]],
      c = vertices[indices[j + 2]];

    result[i] = new THREE.Plane().setFromCoplanarPoints(a, b, c);
  }
  return result;
}

const planeToMatrix = (function () {
  const xAxis = new THREE.Vector3(),
    yAxis = new THREE.Vector3(),
    trans = new THREE.Vector3();

  return function planeToMatrix(plane: THREE.Plane) {
    const zAxis = plane.normal,
      matrix = new THREE.Matrix4();
    if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
      yAxis.set(-zAxis.y, zAxis.x, 0);
    } else {
      yAxis.set(0, -zAxis.z, zAxis.y);
    }
    xAxis.crossVectors(yAxis.normalize(), zAxis);

    plane.coplanarPoint(trans);

    return matrix.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      trans.x,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      trans.y,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      trans.z,
      0,
      0,
      0,
      1
    );
  };
})();

function cylindricalPlanes(n: number, innerRadius: number) {
  const result = createPlanes(n);

  for (let i = 0; i < n; i++) {
    const plane = result[i],
      angle = (i * Math.PI * 2) / n;
    plane.normal.set(Math.cos(angle), 0, Math.sin(angle));
    plane.constant = innerRadius;
  }
  return result;
}

const Vertices = [
  new THREE.Vector3(+1, 0, +Math.SQRT1_2), //
  new THREE.Vector3(-1, 0, +Math.SQRT1_2),
  new THREE.Vector3(0, +1, -Math.SQRT1_2),
  new THREE.Vector3(0, -1, -Math.SQRT1_2),
];
const Indices = [
  0,
  1,
  2, //
  0,
  2,
  3, //
  0,
  3,
  1, //
  1,
  3,
  2,
];
const Planes = planesFromMesh(Vertices, Indices);
const PlaneMatrices = Planes.map(planeToMatrix);
const GlobalClippingPlanes = cylindricalPlanes(5, 2.5);
const Empty: any = Object.freeze([]);

let clipMaterial: THREE.MeshPhongMaterial;
let object: THREE.Group;
let color: THREE.Color;
let volumeVisualization: THREE.Group;
let globalClippingPlanes: THREE.Plane[];
let startTime = 0;

let transform = new THREE.Matrix4(),
  tmpMatrix = new THREE.Matrix4();

class Demo extends Main {
  constructor() {
    super();
    this.init();
    this.initGUI();
  }
  initPlane() {}

  init() {
    clipMaterial = new THREE.MeshPhongMaterial({
      color: 0xee0a10,
      shininess: 100,
      side: THREE.DoubleSide,
      clippingPlanes: createPlanes(Planes.length),
      clipShadows: true,
    });

    object = new THREE.Group();

    const geometry = new THREE.BoxBufferGeometry(0.18, 0.18, 0.18);
    for (let z = -2; z <= 2; z++) {
      for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
          const mesh = new THREE.Mesh(geometry, clipMaterial);
          mesh.position.set(x / 5, y / 5, z / 5);
          mesh.castShadow = true;
          object.add(mesh);
        }
      }
    }
    this.scene.add(object);

    const planeGeometry = new THREE.PlaneBufferGeometry(3, 3, 1, 1);
    color = new THREE.Color();
    volumeVisualization = new THREE.Group();
    volumeVisualization.visible = false;
    for (let i = 0, n = Planes.length; i < n; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: color.setHSL(i / n, 0.5, 0.5).getHex(),
        side: THREE.DoubleSide,
        opacity: 0.2,
        transparent: true,
        clippingPlanes: clipMaterial.clippingPlanes.filter(
          (_: any, j: number) => j !== i
        ),
      });

      const mesh = new THREE.Mesh(planeGeometry, material);
      mesh.matrixAutoUpdate = false;
      volumeVisualization.add(mesh);
    }
    this.scene.add(volumeVisualization);

    const ground = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshPhongMaterial({
        color: 0xa0adaf,
        shininess: 10,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.scale.multiplyScalar(3);
    ground.receiveShadow = true;
    this.scene.add(ground);

    globalClippingPlanes = createPlanes(GlobalClippingPlanes.length);

    this.renderer.clippingPlanes = Empty;
    this.renderer.localClippingEnabled = true;
  }

  initGUI() {
    const renderer = this.renderer;
    const gui = new GUI(),
      folder = gui.addFolder('Local Clipping'),
      props = {
        get Enabled() {
          return renderer.localClippingEnabled;
        },
        set Enabled(v) {
          renderer.localClippingEnabled = v;
          if (!v) {
            volumeVisualization.visible = false;
          }
        },
        get Shadows() {
          return clipMaterial.clipShadows;
        },
        set Shadows(v) {
          clipMaterial.clipShadows = v;
        },
        get Visualize() {
          return volumeVisualization.visible;
        },
        set Visualize(v) {
          if (renderer.localClippingEnabled) {
            volumeVisualization.visible = v;
          }
        },
      };

    folder.add(props, 'Enabled');
    folder.add(props, 'Shadows');
    folder.add(props, 'Visualize').listen();

    gui.addFolder('Global Clipping').add(
      {
        get Enabled() {
          return renderer.clippingPlanes !== Empty;
        },
        set Enabled(v) {
          renderer.clippingPlanes = v ? globalClippingPlanes : Empty;
        },
      },
      'Enabled'
    );

    startTime = Date.now();
  }

  animate() {
    const currentTime = Date.now(),
      time = (currentTime - startTime) / 1000;

    requestAnimationFrame(() => this.animate());

    if (object) {
      object.position.y = 1;
      object.rotation.set(time * 0.5, time * 0.2, object.rotation.z);
      object.updateMatrix();
      transform.copy(object.matrix);

      const bouncy = Math.cos(time * 0.5) * 0.5 + 0.7;
      transform.multiply(tmpMatrix.makeScale(bouncy, bouncy, bouncy));
      assignTransformedPlanes(clipMaterial.clippingPlanes, Planes, transform);

      const planeMeshes = volumeVisualization.children;
      for (let i = 0, n = planeMeshes.length; i < n; i++) {
        tmpMatrix.multiplyMatrices(transform, PlaneMatrices[i]);
        setObjectWorldMatrix(this.scene, planeMeshes[i], tmpMatrix);
      }
      transform.makeRotationY(time * 0.1);
      assignTransformedPlanes(
        globalClippingPlanes,
        GlobalClippingPlanes,
        transform
      );
    }

    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

function createPlanes(n: number) {
  const result = new Array<THREE.Plane>(n);
  for (let i = 0; i < n; i++) {
    result[i] = new THREE.Plane();
  }
  return result;
}

function assignTransformedPlanes(
  planesOut: THREE.Plane[],
  planesIn: THREE.Plane[],
  matrix: THREE.Matrix4
) {
  for (let i = 0, n = planesIn.length; i < n; i++) {
    planesOut[i].copy(planesIn[i]).applyMatrix4(matrix);
  }
}

function setObjectWorldMatrix(
  scene: THREE.Scene,
  object: THREE.Object3D,
  matrix: THREE.Matrix4
) {
  const parent = object.parent;
  scene.updateMatrixWorld();
  object.matrix.getInverse(parent.matrixWorld);
  object.applyMatrix4(matrix);
}

new Demo();
