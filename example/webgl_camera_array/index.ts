import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

const AMOUNT = 6;

class Demo extends Main {
  private acamera: THREE.ArrayCamera;
  private mesh: THREE.Mesh;

  constructor() {
    super();
  }

  initPlane() {
    let geometry: THREE.BufferGeometry = new THREE.PlaneBufferGeometry(
      100,
      100
    );
    let material = new THREE.MeshPhongMaterial({ color: 0x000066 });

    const background = new THREE.Mesh(geometry, material);
    background.receiveShadow = true;
    background.position.set(0, 0, -1);
    this.scene.add(background);

    geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 32);
    material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  initCamera() {
    const ASPECT_RATIO = window.innerWidth / window.innerHeight;
    const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

    const cameras: THREE.PerspectiveCamera[] = [];

    for (let y = 0; y < AMOUNT; y++) {
      for (let x = 0; x < AMOUNT; x++) {
        const subcamera = new THREE.PerspectiveCamera(
          40,
          ASPECT_RATIO,
          0.1,
          10
        );
        (subcamera as any).viewport = new THREE.Vector4(
          Math.floor(x * WIDTH),
          Math.floor(y * HEIGHT),
          Math.ceil(WIDTH),
          Math.ceil(HEIGHT)
        );
        subcamera.position.x = x / AMOUNT - 0.5;
        subcamera.position.y = 0.5 - y / AMOUNT;
        subcamera.position.z = 1.5;
        subcamera.position.multiplyScalar(2);
        subcamera.lookAt(0, 0, 0);
        subcamera.updateMatrixWorld();
        cameras.push(subcamera);
      }
    }

    this.acamera = new THREE.ArrayCamera(cameras);
    this.acamera.position.z = 3;
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initDirLight() {
    const light = new THREE.DirectionalLight();
    light.position.set(0.5, 0.5, 1);
    light.castShadow = true;
    light.shadow.camera.zoom = 4;
    this.scene.add(light);
  }

  onWindowResize() {
    const ASPECT_RATIO = window.innerWidth / window.innerHeight;
    const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

    this.acamera.aspect = ASPECT_RATIO;
    this.acamera.updateProjectionMatrix();

    for (let y = 0; y < AMOUNT; y++) {
      for (let x = 0; x < AMOUNT; x++) {
        const subcamera = this.acamera.cameras[AMOUNT * y + x];
        subcamera.aspect = ASPECT_RATIO;
        subcamera.updateProjectionMatrix();
      }
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.z += 0.01;

    this.renderer.render(this.scene, this.acamera);
    requestAnimationFrame(() => this.animate());
    this.stats.update();
  }

  initControls() {}
}

new Demo();
