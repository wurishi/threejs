import { Main } from '../../../main';

const vertexShader = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

void main() {
  float h = normalize(vWorldPosition + offset).y;
  gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h,0.0),exponent),0.0)),1.0);
}
`;

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  AnimationMixer,
  BackSide,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  Mesh,
  MeshLambertMaterial,
  PlaneBufferGeometry,
  ShaderMaterial,
  SphereBufferGeometry,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initScene() {
    super.initScene(new Color().setHSL(0.6, 0, 1).getHex(), 1, 5000, true);
  }
  initCamera() {
    super.initCamera(30, 1, 5000, new Vector3(0, 0, 250));
  }
  initHemiLight() {
    hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    hemiLightHelper = new HemisphereLightHelper(hemiLight, 10);
    this.scene.add(hemiLightHelper);
  }
  initDirLight() {
    dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    this.scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;

    dirLightHelper = new DirectionalLightHelper(dirLight, 10);
    this.scene.add(dirLightHelper);
  }

  initPlane() {
    //GROUND
    const groundGeo = new PlaneBufferGeometry(10000, 10000);
    const groundMat = new MeshLambertMaterial({ color: 0xffffff });
    groundMat.color.setHSL(0.095, 1, 0.75);

    const ground = new Mesh(groundGeo, groundMat);
    ground.position.y = -33;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // SKY
    const uniforms = {
      topColor: { value: new Color(0x0077ff) },
      bottomColor: { value: new Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    };
    uniforms.topColor.value.copy(hemiLight.color);

    this.scene.fog.color.copy(uniforms.bottomColor.value);

    const skyGeo = new SphereBufferGeometry(4000, 32, 15);
    const skyMat = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: BackSide,
    });
    const sky = new Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    const loader = new GLTFLoader();
    loader.load('flamingo.glb', (gltf) => {
      const mesh = gltf.scene.children[0];

      const s = 0.35;
      mesh.scale.set(s, s, s);
      mesh.position.y = 15;
      mesh.rotation.y = -1;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.scene.add(mesh);

      const mixer = new AnimationMixer(mesh);
      mixer.clipAction(gltf.animations[0]).setDuration(1).play();
      this.mixers.push(mixer);
    });

    this.initGUI();
  }

  initGUI() {
    const API = {
      toggleHemi: true,
      toggleDir: true,
    };
    const gui = new GUI();
    gui
      .add(API, 'toggleHemi')
      .name('toggle hemilight')
      .onChange(() => {
        hemiLight.visible = API.toggleHemi;
        hemiLightHelper.visible = API.toggleHemi;
      });

    gui
      .add(API, 'toggleDir')
      .name('toggle directional light')
      .onChange(() => {
        dirLight.visible = API.toggleDir;
        dirLightHelper.visible = API.toggleDir;
      });
  }
}

let hemiLight: HemisphereLight;
let hemiLightHelper: HemisphereLightHelper;
let dirLight: DirectionalLight;
let dirLightHelper: DirectionalLightHelper;

new Demo();
