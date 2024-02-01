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

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
let frustumSize = 600;

class Demo extends Main {
  private cameraPerspective: THREE.PerspectiveCamera;
  private cameraPerspectiveHelper: THREE.CameraHelper;
  private cameraOrtho: THREE.OrthographicCamera;
  private cameraOrthoHelper: THREE.CameraHelper;
  private activeCamera: THREE.Camera;
  private activeHelper: THREE.CameraHelper;
  private cameraRig: THREE.Group;
  private mesh: THREE.Mesh;

  constructor() {
    super();

    this.init();
  }

  private init(): void {
    this.renderer.autoClear = false;

    document.addEventListener('keydown', this.onKeyDown, false);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 79:
        this.activeCamera = this.cameraOrtho;
        this.activeHelper = this.cameraOrthoHelper;
        break;
      case 80:
        this.activeCamera = this.cameraPerspective;
        this.activeHelper = this.cameraPerspectiveHelper;
        break;
    }
  };

  protected initScene():void {
    this.scene = new THREE.Scene();
  }

  protected initPlane(): void {}

  protected initHemiLight(): void {}

  protected initDirLight(): void {}

  protected initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 10000);
    this.camera.position.z = 2500;

    this.cameraPerspective = new THREE.PerspectiveCamera(
      50,
      0.5 * aspect,
      150,
      1000
    );
    this.cameraPerspectiveHelper = new THREE.CameraHelper(
      this.cameraPerspective
    );
    this.scene.add(this.cameraPerspectiveHelper);

    this.cameraOrtho = new THREE.OrthographicCamera(
      (0.5 * frustumSize * aspect) / -2,
      (0.5 * frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      150,
      1000
    );
    this.cameraOrthoHelper = new THREE.CameraHelper(this.cameraOrtho);
    this.scene.add(this.cameraOrthoHelper);

    this.activeCamera = this.cameraPerspective;
    this.activeHelper = this.cameraPerspectiveHelper;

    this.cameraOrtho.rotation.y = Math.PI;
    this.cameraPerspective.rotation.y = Math.PI;

    this.cameraRig = new THREE.Group();
    this.cameraRig.add(this.cameraPerspective);
    this.cameraRig.add(this.cameraOrtho);
    this.scene.add(this.cameraRig);

    this.mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(100, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    this.scene.add(this.mesh);

    const mesh2 = new THREE.Mesh(
      new THREE.SphereBufferGeometry(50, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    );
    mesh2.position.y = 150;
    this.mesh.add(mesh2);

    const mesh3 = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
    );
    mesh3.position.z = 150;
    this.cameraRig.add(mesh3);

    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    for (let i = 0; i < 10000; i++) {
      vertices.push(THREE.MathUtils.randFloatSpread(2000));
      vertices.push(THREE.MathUtils.randFloatSpread(2000));
      vertices.push(THREE.MathUtils.randFloatSpread(2000));
    }
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    const particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: 0x888888 })
    );
    this.scene.add(particles);
  }

  protected animate(): void {
    // super.animate();
    requestAnimationFrame(() => this.animate());

    this.render();

    this.stats.update();
  }

  protected onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.camera.aspect = 0.5 * aspect;
    this.camera.updateProjectionMatrix();

    this.cameraPerspective.aspect = 0.5 * aspect;
    this.cameraPerspective.updateProjectionMatrix();

    this.cameraOrtho.left = (-0.5 * frustumSize * aspect) / 2;
    this.cameraOrtho.right = (0.5 * frustumSize * aspect) / 2;
    this.cameraOrtho.top = frustumSize / 2;
    this.cameraOrtho.bottom = frustumSize / 2;
    this.cameraOrtho.updateProjectionMatrix();
  }

  private render(): void {
    const r = Date.now() * 0.0005;
    this.mesh.position.set(
      700 * Math.cos(r),
      700 * Math.sin(r),
      700 * Math.sin(r)
    );

    this.mesh.children[0].position.x = 70 * Math.cos(2 * r);
    this.mesh.children[0].position.z = 70 * Math.sin(r);

    if (this.activeCamera === this.cameraPerspective) {
      this.cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
      this.cameraPerspective.far = this.mesh.position.length();
      this.cameraPerspective.updateProjectionMatrix();

      this.cameraPerspectiveHelper.update();
      this.cameraPerspectiveHelper.visible = true;
      this.cameraOrthoHelper.visible = false;
    } else {
      this.cameraOrtho.far = this.mesh.position.length();
      this.cameraOrtho.updateProjectionMatrix();

      this.cameraOrthoHelper.update();
      this.cameraOrthoHelper.visible = true;
      this.cameraPerspectiveHelper.visible = false;
    }

    this.cameraRig.lookAt(this.mesh.position);

    this.renderer.clear();

    this.activeHelper.visible = false;
    this.renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    this.renderer.render(this.scene, this.activeCamera);

    this.activeHelper.visible = true;
    this.renderer.setViewport(
      SCREEN_WIDTH / 2,
      0,
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT
    );
    this.renderer.render(this.scene, this.camera);
  }
}

new Demo();
