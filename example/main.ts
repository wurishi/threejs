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

export function linkScript(link: string, cb: any) {
  const s = document.createElement('script');
  s.src = link;
  document.body.appendChild(s);
  s.onload = () => {
    cb && cb();
  };
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

  protected initRenderer(
    antialias = true,
    other = {
      shadowEnabled: true,
      shadowType: THREE.PCFSoftShadowMap,
      outputEncoding: THREE.sRGBEncoding,
    }
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (other) {
      other.hasOwnProperty('outputEncoding') &&
        (this.renderer.outputEncoding = other.outputEncoding);
      other.hasOwnProperty('shadowEnabled') &&
        (this.renderer.shadowMap.enabled = other.shadowEnabled);
      other.hasOwnProperty('shadowType') &&
        (this.renderer.shadowMap.type = other.shadowType);
    }
    this.container.appendChild(this.renderer.domElement);
  }

  protected initScene(
    color = 0xa0a0a0,
    near = 10,
    far = 22,
    hasFog = true
  ): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(color);
    if (hasFog) {
      this.scene.fog = new THREE.Fog(color, near, far);
    }
  }

  protected defaultScene(color = 0xa0a0a0) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(color);
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
    look && this.camera.lookAt(look);
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

    this.render();

    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }

  protected render(): void {}
}

export function randomLR(n: number) {
  const half = n / 2;
  return Math.random() * n - half;
}
