import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

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

interface iModel {
  name: string;
  animations?: THREE.AnimationClip[];
  scene?: THREE.Group;
}

interface iUnit {
  modelName: string;
  meshName: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale: number;
  animationName: string;
}

class Demo extends Main {
  static MODELS: iModel[] = [
    { name: 'soldier' }, //
    { name: 'parrot' },
  ];

  static UNITS: iUnit[] = [
    {
      modelName: 'soldier', // Will use the 3D model from file models/gltf/Soldier.glb
      meshName: 'vanguard_Mesh', // Name of the main mesh to animate
      position: { x: 0, y: 0, z: 0 }, // Where to put the unit in the scene
      scale: 1, // Scaling of the unit. 1.0 means: use original size, 0.1 means "10 times smaller", etc.
      animationName: 'Idle', // Name of animation to run
    },
    {
      modelName: 'soldier',
      meshName: 'vanguard_Mesh',
      position: { x: 3, y: 0, z: 0 },
      scale: 2,
      animationName: 'Walk',
    },
    {
      modelName: 'soldier',
      meshName: 'vanguard_Mesh',
      position: { x: 1, y: 0, z: 0 },
      scale: 1,
      animationName: 'Run',
    },
    {
      modelName: 'parrot',
      meshName: 'mesh_0',
      position: { x: -4, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI, z: 0 },
      scale: 0.01,
      animationName: 'parrot_A_',
    },
    {
      modelName: 'parrot',
      meshName: 'mesh_0',
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      scale: 0.02,
      animationName: null,
    },
  ];

  private numLoadedModels = 0;

  constructor() {
    super();

    this.loadModels();
  }

  private loadModels(): void {
    this.numLoadedModels = 0;
    Demo.MODELS.forEach((m) => {
      this.loadGltfModel(m, () => {
        this.numLoadedModels++;
        if (this.numLoadedModels >= Demo.MODELS.length) {
          this.instantiateUnits();
        }
      });
    });
  }

  private loadGltfModel(model: iModel, onLoaded: Function): void {
    const loader = new GLTFLoader();
    const modelName = './' + model.name + '.glb';

    loader.load(modelName, (gltf) => {
      const scene = gltf.scene;

      model.animations = gltf.animations;
      model.scene = scene;

      gltf.scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh && mesh.isMesh) {
          object.castShadow = true;
        }
      });

      onLoaded();
    });
  }

  private instantiateUnits(): void {
    let numSuccess = 0;
    Demo.UNITS.forEach((u) => {
      const model = getModelByName(u.modelName);
      if (model) {
        const clonedScene = SkeletonUtils.clone(model.scene) as THREE.Object3D;
        if (clonedScene) {
          const clonedMesh = clonedScene.getObjectByName(u.meshName);
          if (clonedMesh) {
            const mixer = startAnimation(
              clonedMesh,
              model.animations,
              u.animationName
            );
            this.mixers.push(mixer);
            numSuccess++;
          }

          this.scene.add(clonedScene);

          if (u.position) {
            clonedScene.position.set(u.position.x, u.position.y, u.position.z);
          }
          if (u.scale) {
            clonedScene.scale.set(u.scale, u.scale, u.scale);
          }
          if (u.rotation) {
            clonedScene.rotation.set(u.rotation.x, u.rotation.y, u.rotation.z);
          }
        }
      }
    });
  }
}

new Demo();

function getModelByName(name: string) {
  return Demo.MODELS.find((m) => m.name == name);
}

function startAnimation(
  skinnedMesh: THREE.Object3D,
  animations: THREE.AnimationClip[],
  animationName: string
): THREE.AnimationMixer {
  const mixer = new THREE.AnimationMixer(skinnedMesh);
  const clip = THREE.AnimationClip.findByName(animations, animationName);
  if (clip) {
    mixer.clipAction(clip).play();
  }

  return mixer;
}
