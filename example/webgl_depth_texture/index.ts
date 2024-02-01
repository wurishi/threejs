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
  ) {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = pan;
    controls.enableZoom = zoom;
    controls.target.set(target.x, target.y, target.z);
    controls.update();
    return controls;
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());

    const mixerUpdateDelta = this.clock.getDelta();
    this.mixers.forEach((mixer) => mixer.update(mixerUpdateDelta));

    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  }
}

let target: THREE.WebGLRenderTarget;
let postCamera: THREE.OrthographicCamera;
let postMaterial: THREE.ShaderMaterial;
let postScene: THREE.Scene;
let controls: OrbitControls;
const params = {
  format: THREE.DepthFormat,
  type: THREE.UnsignedShortType,
};
const formats = {
  DepthFormat: THREE.DepthFormat,
  DepthStencilFormat: THREE.DepthStencilFormat,
};
const types = {
  UnsignedShortType: THREE.UnsignedShortType,
  UnsignedIntType: THREE.UnsignedIntType,
  UnsignedInt248Type: THREE.UnsignedInt248Type,
};

class Demo extends Main {
  initCamera() {
    super.initCamera(70, 0.01, 50, new THREE.Vector3(0, 0, 4));
  }

  initControls() {
    controls = super.initControls();
    controls.enableDamping = true;
    return controls;
  }

  initPlane() {
    this.setupRenderTarget();
    this.setupPost();

    const gui = new GUI({ width: 300 });
    gui
      .add(params, 'format', formats)
      .onChange(this.setupRenderTarget.bind(this));
    gui.add(params, 'type', types).onChange(this.setupRenderTarget.bind(this));
    gui.open();
  }

  initScene() {
    const scene = new THREE.Scene();

    const geometry = new THREE.TorusKnotBufferGeometry(1, 0.3, 128, 64);
    const material = new THREE.MeshBasicMaterial({ color: 'blue' });

    const count = 50;
    const scale = 5;

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 2.0 * Math.PI;
      const z = Math.random() * 2.0 - 1.0;
      const zScale = Math.sqrt(1.0 - z * z) * scale;

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(Math.cos(r) * zScale, Math.sin(r) * zScale, z * scale);
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(mesh);
    }

    this.scene = scene;
  }

  setupRenderTarget() {
    if (target) {
      target.dispose();
    }
    const format = parseFloat(params.format as any);
    const type = parseFloat(params.type as any);

    target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    target.texture.format = THREE.RGBFormat;
    target.texture.minFilter = THREE.NearestFilter;
    target.texture.magFilter = THREE.NearestFilter;
    target.texture.generateMipmaps = false;
    target.stencilBuffer = format === THREE.DepthStencilFormat ? true : false;
    target.depthBuffer = true;
    target.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    );
    target.depthTexture.format = format;
    target.depthTexture.type = type;
  }

  setupPost() {
    postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    postMaterial = new THREE.ShaderMaterial({
      vertexShader: document.querySelector('#post-vert').textContent.trim(),
      fragmentShader: document.querySelector('#post-frag').textContent.trim(),
      uniforms: {
        cameraNear: { value: this.camera.near },
        cameraFar: { value: this.camera.far },
        tDiffuse: { value: null },
        tDepth: { value: null },
      },
    });
    const postPlane = new THREE.PlaneBufferGeometry(2, 2);
    const postQuad = new THREE.Mesh(postPlane, postMaterial);
    postScene = new THREE.Scene();
    postScene.add(postQuad);
  }

  onWindowResize() {
    super.onWindowResize();
    const dpr = this.renderer.getPixelRatio();
    target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);

    postMaterial.uniforms.tDiffuse.value = target.texture;
    postMaterial.uniforms.tDepth.value = target.depthTexture;

    this.renderer.setRenderTarget(null);
    this.renderer.render(postScene, postCamera);

    controls.update();

    this.stats.update();
  }
}

new Demo();
