import { Main } from '../../../main';

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  AnimationMixer,
  Color,
  DirectionalLight,
  Euler,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PCFSoftShadowMap,
  PlaneBufferGeometry,
  PMREMGenerator,
  Scene,
  SpotLight,
  sRGBEncoding,
  Texture,
  UnsignedByteType,
  Vector3,
} from 'three';
import { GUI, GUIController } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface SceneInfo {
  addLights?: boolean;
  shadows?: boolean;
  addGround?: boolean;
  groundPos?: Vector3;

  name: string;
  url: string;
  author?: string;
  authorURL?: string;
  cameraPos?: Vector3;
  center?: Vector3;
  objectPosition?: Vector3;
  objectRotation?: Euler;
  objectScale?: Vector3;
  addEnvMap?: boolean;
  animationTime?: number;
}

const scenes: any = {
  Boombox: {
    name: 'BoomBox (PBR)',
    url: 'boombox/%s/BoomBox.gltf',
    author: 'Microsoft',
    authorURL: 'https://www.microsoft.com/',
    cameraPos: new Vector3(0.02, 0.01, 0.03),
    objectRotation: new Euler(0, Math.PI, 0),
    extensions: [
      'glTF',
      'glTF-pbrSpecularGlossiness',
      'glTF-Binary',
      'glTF-dds',
    ],
    addEnvMap: true,
  },
  'Bot Skinned': {
    name: 'Bot Skinned',
    url: 'botskinned/%s/Bot_Skinned.gltf',
    author: 'MozillaVR',
    authorURL: 'https://vr.mozilla.org/',
    cameraPos: new Vector3(0.5, 2, 2),
    center: new Vector3(0, 1.2, 0),
    objectRotation: new Euler(0, 0, 0),
    addLights: true,
    addGround: true,
    shadows: true,
    extensions: ['glTF-MaterialsUnlit'],
  },
  MetalRoughSpheres: {
    name: 'MetalRoughSpheres (PBR)',
    url: 'metalroughspheres/%s/MetalRoughSpheres.gltf',
    author: '@emackey',
    authorURL: 'https://twitter.com/emackey',
    cameraPos: new Vector3(2, 1, 15),
    objectRotation: new Euler(0, 0, 0),
    extensions: ['glTF', 'glTF-Embedded'],
    addEnvMap: true,
  },
  'Clearcoat Test': {
    name: 'Clearcoat Test',
    url: 'clearcoattest/%s/ClearcoatTest.glb',
    author: 'Ed Mackey (Analytical Graphics, Inc.)',
    authorURL: 'https://www.agi.com/',
    cameraPos: new Vector3(0, 0, 20),
    extensions: ['glTF'],
    addEnvMap: true,
  },
  Duck: {
    name: 'Duck',
    url: 'duck/%s/Duck.gltf',
    author: 'Sony',
    authorURL: 'https://www.playstation.com/en-us/corporate/about/',
    cameraPos: new Vector3(0, 3, 5),
    addLights: true,
    addGround: true,
    shadows: true,
    extensions: [
      'glTF',
      'glTF-Embedded',
      'glTF-pbrSpecularGlossiness',
      'glTF-Binary',
      'glTF-Draco',
    ],
  },
  Monster: {
    name: 'Monster',
    url: 'monster/%s/Monster.gltf',
    author: '3drt.com',
    authorURL: 'http://www.3drt.com/downloads.htm',
    cameraPos: new Vector3(3, 1, 7),
    objectScale: new Vector3(0.04, 0.04, 0.04),
    objectPosition: new Vector3(0.2, 0.1, 0),
    objectRotation: new Euler(0, (-3 * Math.PI) / 4, 0),
    animationTime: 3,
    addLights: true,
    shadows: true,
    addGround: true,
    extensions: [
      'glTF',
      'glTF-Embedded',
      'glTF-Binary',
      'glTF-Draco',
      'glTF-lights',
    ],
  },
  'Cesium Man': {
    name: 'Cesium Man',
    url: 'cesiumman/%s/CesiumMan.gltf',
    author: 'Cesium',
    authorURL: 'https://cesiumjs.org/',
    cameraPos: new Vector3(0, 3, 10),
    objectRotation: new Euler(0, 0, 0),
    addLights: true,
    addGround: true,
    shadows: true,
    extensions: ['glTF', 'glTF-Embedded', 'glTF-Binary', 'glTF-Draco'],
  },
  'Cesium Milk Truck': {
    name: 'Cesium Milk Truck',
    url: 'cesiummilktruck/%s/CesiumMilkTruck.gltf',
    author: 'Cesium',
    authorURL: 'https://cesiumjs.org/',
    cameraPos: new Vector3(0, 3, 10),
    addLights: true,
    addGround: true,
    shadows: true,
    extensions: ['glTF', 'glTF-Embedded', 'glTF-Binary', 'glTF-Draco'],
  },
  'Outlined Box': {
    name: 'Outlined Box',
    url: 'outlinedbox/%s/OutlinedBox.gltf',
    author: '@twittmann',
    authorURL: 'https://github.com/twittmann',
    cameraPos: new Vector3(0, 5, 15),
    objectScale: new Vector3(0.01, 0.01, 0.01),
    objectRotation: new Euler(0, 90, 0),
    addLights: true,
    shadows: true,
    extensions: ['glTF'],
  },
};

const s = Object.keys(scenes)[0];
const state = {
  scene: s,
  extension: scenes[s].extensions[0],
  playAnimation: true,
};

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initCamera() {
    super.initCamera(45, 0.001, 1000);
  }
  initHemiLight() {}
  initDirLight() {}
  initRenderer() {
    super.initRenderer(true);

    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.physicallyCorrectLights = true;
  }
  initPlane() {
    const pmremGenerator = new PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    new RGBELoader()
      .setDataType(UnsignedByteType)
      .load('venice_sunset_1k.hdr', (texture) => {
        envMap = pmremGenerator.fromEquirectangular(texture).texture;

        pmremGenerator.dispose();

        background = envMap;

        this.buildGUI();
        this.buildScene(scenes[state.scene]);
      });
  }

  buildGUI() {
    const description = document.createElement('div');
    description.id = 'description';
    description.style.position = 'fixed';
    description.style.right = '0';
    description.style.bottom = '0';
    description.style.zIndex = '1';
    document.body.appendChild(description);

    gui = new GUI({ width: 330 });
    gui.domElement.parentElement.style.zIndex = '101';

    const sceneCtrl = gui.add(state, 'scene', Object.keys(scenes));
    sceneCtrl.onChange(() => this.reload());

    const animCtrl = gui.add(state, 'playAnimation');
    animCtrl.onChange(() => this.toggleAnimations());

    this.updateGUI();
  }

  reload() {
    this.mixers.forEach((mixer) => {
      mixer.stopAllAction();
    });
    this.mixers = [];

    this.updateGUI();

    this.buildScene(scenes[state.scene]);
  }

  updateGUI() {
    if (extensionControls) extensionControls.remove();

    const sceneInfo = scenes[state.scene];

    if (sceneInfo.extensions.indexOf(state.extension) === -1) {
      state.extension = sceneInfo.extensions[0];
    }

    extensionControls = gui.add(state, 'extension', sceneInfo.extensions);
    extensionControls.onChange(() => this.reload());
  }

  toggleAnimations() {
    this.mixers.forEach((mixer) => {
      gltf.animations.forEach((clip) => {
        const action = mixer.existingAction(clip);
        state.playAnimation ? action.play() : action.stop();
      });
    });
  }

  buildScene(sceneInfo: SceneInfo) {
    const descriptionEl = document.getElementById('description');
    if (sceneInfo.author && sceneInfo.authorURL) {
      descriptionEl.innerHTML =
        sceneInfo.name +
        ' by <a href="' +
        sceneInfo.authorURL +
        '" target="_blank" rel="noopener">' +
        sceneInfo.author +
        '</a>';
    }

    this.scene.remove(...preList);
    preList = [];

    let spot1: SpotLight;
    if (sceneInfo.addLights) {
      const ambient = new AmbientLight(0x222222);
      this.scene.add(ambient);
      preList.push(ambient);

      const dirLight = new DirectionalLight(0xdddddd, 4);
      dirLight.position.set(0, 0, 1).normalize();
      this.scene.add(dirLight);
      preList.push(dirLight);

      spot1 = new SpotLight(0xffffff, 1);
      spot1.position.set(5, 10, 5);
      spot1.angle = 0.5;
      spot1.penumbra = 0.75;
      spot1.intensity = 100;
      spot1.decay = 2;

      if (sceneInfo.shadows) {
        spot1.castShadow = true;
        spot1.shadow.bias = 0.0001;
        spot1.shadow.mapSize.width = 2048;
        spot1.shadow.mapSize.height = 2048;
      }
      this.scene.add(spot1);
      preList.push(spot1);
    }

    if (sceneInfo.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap;
    } else {
      this.renderer.shadowMap.enabled = false;
    }

    if (sceneInfo.addGround) {
      const groundMaterial = new MeshPhongMaterial({ color: 0xffffff });
      const ground = new Mesh(
        new PlaneBufferGeometry(512, 512),
        groundMaterial
      );
      ground.receiveShadow = !!sceneInfo.shadows;

      if (sceneInfo.groundPos) {
        ground.position.copy(sceneInfo.groundPos);
      } else {
        ground.position.z = -70;
      }
      ground.rotation.x = -Math.PI / 2;

      this.scene.add(ground);
      preList.push(ground);
    }

    loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('lib_draco/');

    loader.setDRACOLoader(dracoLoader);

    loader.setDDSLoader(new DDSLoader());

    let url = sceneInfo.url.replace(/%s/g, state.extension);

    if (state.extension === 'glTF-Binary') {
      url = url.replace('.gltf', '.glb');
    }

    const loadStartTime = performance.now();

    loader.load(url, (data) => {
      gltf = data;

      const object = gltf.scene;

      console.info(
        'Load time: ' + (performance.now() - loadStartTime).toFixed(2) + ' ms.'
      );

      if (sceneInfo.cameraPos) {
        this.camera.position.copy(sceneInfo.cameraPos);
      }
      if (sceneInfo.center) {
        orbitControls.target.copy(sceneInfo.center);
      } else {
        orbitControls.target.copy(new Vector3());
      }
      if (sceneInfo.objectPosition) {
        object.position.copy(sceneInfo.objectPosition);
        if (spot1) {
          spot1.target.position.copy(sceneInfo.objectPosition);
        }
      }
      if (sceneInfo.objectRotation) {
        object.rotation.copy(sceneInfo.objectRotation);
      }
      if (sceneInfo.objectScale) {
        object.scale.copy(sceneInfo.objectScale);
      }
      if (sceneInfo.addEnvMap) {
        object.traverse((node) => {
          const material = (node as any).material;
          if (material && material.envMap !== undefined) {
            material.envMap = envMap;
            material.envMapIntensity = 1.5;
          }
        });
        this.scene.background = background;
      } else {
        this.scene.background = null;
      }
      object.traverse((node: any) => {
        if (node.hasOwnProperty('castShadow')) {
          node.castShadow = true;
        }
      });

      const animations = gltf.animations;
      if (animations && animations.length) {
        const mixer = new AnimationMixer(object);
        for (let i = 0; i < animations.length; i++) {
          const animation = animations[i];
          if (sceneInfo.animationTime) {
            animation.duration = sceneInfo.animationTime;
          }
          const action = mixer.clipAction(animation);
          if (state.playAnimation) action.play();
        }
        this.mixers.push(mixer);
      }
      this.scene.add(object);
      preList.push(object);
    });
  }

  initControls() {
    orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  render() {
    orbitControls.update();
  }
}

let orbitControls: OrbitControls;

let envMap: Texture;

let background: Texture;

let preList: Object3D[] = [];

let loader: GLTFLoader;

let gltf: GLTF;

let gui: GUI;

let extensionControls: GUIController;

new Demo();
