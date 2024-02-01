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

class Demo extends Main {
  private object: THREE.Mesh;
  private startTime: number;

  constructor() {
    super();

    this.init();
  }

  initPlane() {}

  init(): void {
    const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);
    const globalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.1);

    const material = new THREE.MeshPhongMaterial({
      color: 0x80ee10,
      shininess: 100,
      side: THREE.DoubleSide,

      clippingPlanes: [localPlane],
      clipShadows: true,
    });

    const geometry = new THREE.TorusKnotBufferGeometry(0.4, 0.08, 95, 20);

    const object = new THREE.Mesh(geometry, material);
    this.object = object;
    object.castShadow = true;

    this.scene.add(object);

    const ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(9, 9, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const globalPlanes = [globalPlane];
    const Empty: any = Object.freeze([]);
    this.renderer.clippingPlanes = Empty;
    this.renderer.localClippingEnabled = true;

    const that = this;

    const gui = new GUI(),
      folderLocal = gui.addFolder('Local Clipping'),
      propsLocal = {
        get Enabled() {
          return that.renderer.localClippingEnabled;
        },
        set Enabled(v) {
          that.renderer.localClippingEnabled = v;
        },
        get Shadows() {
          return material.clipShadows;
        },
        set Shadows(v) {
          material.clipShadows = v;
        },
        get Plane() {
          return localPlane.constant;
        },
        set Plane(v) {
          localPlane.constant = v;
        },
      },
      folderGlobal = gui.addFolder('Global Clipping'),
      propsGlobal = {
        get Enabled() {
          return that.renderer.clippingPlanes !== Empty;
        },
        set Enabled(v) {
          that.renderer.clippingPlanes = v ? globalPlanes : Empty;
        },
        get Plane() {
          return globalPlane.constant;
        },
        set Plane(v) {
          globalPlane.constant = v;
        },
      };

    folderLocal.add(propsLocal, 'Enabled');
    folderLocal.add(propsLocal, 'Shadows');
    folderLocal.add(propsLocal, 'Plane', 0.3, 1.25);

    folderGlobal.add(propsGlobal, 'Enabled');
    folderGlobal.add(propsGlobal, 'Plane', -0.4, 3);

    this.startTime = Date.now();
  }

  animate() {
    const currentTime = Date.now();
    const time = (currentTime - this.startTime) / 1000;

    requestAnimationFrame(() => this.animate());

    if (this.object) {
      this.object.position.y = 0.8;
      this.object.rotation.x = time * 0.5;
      this.object.rotation.y = time * 0.2;
      this.object.scale.setScalar(Math.cos(time) * 0.125 + 0.875);
    }

    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

new Demo();
