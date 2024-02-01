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

import { ParallaxBarrierEffect } from 'three/examples/jsm/effects/ParallaxBarrierEffect';
const spheres: THREE.Mesh[] = [];
let effect: ParallaxBarrierEffect;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let mouseX = 0,
  mouseY = 0;

class Demo extends Main {
  initPlane() {
    const path = './';
    const format = '.png';
    const urls: string[] = [];
    ['x', 'y', 'z'].forEach((s) => {
      urls.push(path + 'p' + s + format);
      urls.push(path + 'n' + s + format);
    });

    const textureCube = new THREE.CubeTextureLoader().load(urls);

    this.scene.background = textureCube;

    const geometry = new THREE.SphereBufferGeometry(0.1, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      envMap: textureCube,
    });
    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      );
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
      this.scene.add(mesh);
      spheres.push(mesh);
    }

    effect = new ParallaxBarrierEffect(this.renderer);
    effect.setSize(window.innerWidth || 2, window.innerHeight || 2);

    window.addEventListener('mousemove', onDocumentMouseMove, false);
  }

  onWindowResize() {
    super.onWindowResize();
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    effect.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
    this.stats.update();
  }

  render() {
    const timer = 0.0001 * Date.now();
    this.camera.position.x += (mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    spheres.forEach((sphere, i) => {
      sphere.position.x = 5 * Math.cos(timer + i);
      sphere.position.y = 5 * Math.sin(timer + i * 1.1);
    });
    effect.render(this.scene, this.camera);
  }
}

function onDocumentMouseMove(event: MouseEvent) {
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
}

new Demo();
