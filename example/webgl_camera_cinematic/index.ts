import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Main {
  protected container: HTMLDivElement;
  protected clock: THREE.Clock;
  protected renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected camera: THREE.Camera;
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
    const pcamera = this.camera as THREE.PerspectiveCamera;
    if (pcamera) {
      pcamera.aspect = window.innerWidth / window.innerHeight;
      pcamera.updateProjectionMatrix();
    }
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

import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera';
import { GUI } from 'dat.gui';

class Demo extends Main {
  private mouse = new THREE.Vector2();
  private raycaster: THREE.Raycaster;
  private INTERSECTED: THREE.Mesh;
  private currentHex: number;

  constructor() {
    super();
    this.initGUI();
  }

  initCamera() {
    const camera = new CinematicCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.setFocalLength(5);
    camera.position.set(2, 1, 500);
    this.camera = camera;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
  }

  // initDirLight() {}
  // initHemiLight() {}

  initPlane() {
    const geometry = new THREE.BoxBufferGeometry(20, 20, 20);
    for (let i = 0; i < 1500; i++) {
      const object = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
      );
      object.position.set(
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
        Math.random() * 800 - 400
      );
      this.scene.add(object);
    }

    this.raycaster = new THREE.Raycaster();
  }

  initGUI() {
    const effectController: any = {
      focalLength: 15,
      fstop: 2.8,
      showFocus: false,
      focalDepth: 3,
    };

    const matChanger = () => {
      const camera = this.camera as CinematicCamera;
      const { bokeh_uniforms } = (this.camera as any).postprocessing;
      for (const e in effectController) {
        if (e in bokeh_uniforms) {
          bokeh_uniforms[e].value = effectController[e];
        }
      }
      bokeh_uniforms['znear'].value = camera.near;
      bokeh_uniforms['zfar'].value = camera.far;
      camera.setFocalLength(effectController.focalLength);
      effectController['focalDepth'] = bokeh_uniforms['focalDepth'].value;
    };

    const gui = new GUI();
    gui.add(effectController, 'focalLength', 1, 135, 0.01).onChange(matChanger);
    gui.add(effectController, 'fstop', 1.8, 22, 0.01).onChange(matChanger);
    gui
      .add(effectController, 'focalDepth', 0.1, 100, 0.001)
      .onChange(matChanger);
    gui.add(effectController, 'showFocus', true).onChange(matChanger);

    matChanger();

    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
  }

  private onDocumentMouseMove = (event: MouseEvent) => {
    event.preventDefault();

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = (event.clientY / window.innerHeight) * 2 + 1;
  };

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
    this.stats.update();
  }

  private theta = 0;
  private radius = 100;

  render() {
    this.theta += 0.1;
    this.camera.position.set(
      this.radius * Math.sin(THREE.MathUtils.degToRad(this.theta)),
      this.radius * Math.sin(THREE.MathUtils.degToRad(this.theta)),
      this.radius * Math.cos(THREE.MathUtils.degToRad(this.theta))
    );
    this.camera.lookAt(this.scene.position);
    this.camera.updateMatrixWorld();

    const camera = this.camera as CinematicCamera;
    if (this.mouse) {
      this.raycaster.setFromCamera(this.mouse, this.camera);

      const intersects = this.raycaster.intersectObjects(this.scene.children);
      if (intersects.length > 0) {
        const targetDistance = intersects[0].distance;
        camera.focusAt(targetDistance);

        if (this.INTERSECTED !== intersects[0].object) {
          if (this.INTERSECTED) {
            const material = this.INTERSECTED
              .material as THREE.MeshLambertMaterial;
            material.emissive.setHex(this.currentHex);
          }

          this.INTERSECTED = intersects[0].object as THREE.Mesh;
          const material = this.INTERSECTED
            .material as THREE.MeshLambertMaterial;
          this.currentHex = material.emissive.getHex();
          material.emissive.setHex(0xff0000);
        }
      } else {
        if (this.INTERSECTED) {
          const material = this.INTERSECTED
            .material as THREE.MeshLambertMaterial;
          material.emissive.setHex(this.currentHex);
        }
        this.INTERSECTED = null;
      }
    }

    if (camera.postprocessing.enabled) {
      camera.renderCinematic(this.scene, this.renderer);
    } else {
      this.scene.overrideMaterial = null;
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
  }
}

new Demo();
