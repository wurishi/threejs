import { GUI } from 'dat.gui';
import {
  BoxBufferGeometry,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  PointLight,
  ReinhardToneMapping,
  RepeatWrapping,
  SphereBufferGeometry,
  sRGBEncoding,
  Texture,
  TextureEncoding,
  TextureLoader,
  Vector3,
} from 'three';
import { Main } from '../../../main';

const bulbLuminousPowers = {
  '110000 lm (1000W)': 110000,
  '3500 lm (300W)': 3500,
  '1700 lm (100W)': 1700,
  '800 lm (60W)': 800,
  '400 lm (40W)': 400,
  '180 lm (25W)': 180,
  '20 lm (4W)': 20,
  Off: 0,
};

const hemiLuminousIrradiances = {
  '0.0001 lx (Moonless Night)': 0.0001,
  '0.002 lx (Night Airglow)': 0.002,
  '0.5 lx (Full Moon)': 0.5,
  '3.4 lx (City Twilight)': 3.4,
  '50 lx (Living Room)': 50,
  '100 lx (Very Overcast)': 100,
  '350 lx (Office Room)': 350,
  '400 lx (Sunrise/Sunset)': 400,
  '1000 lx (Overcast)': 1000,
  '18000 lx (Daylight)': 18000,
  '50000 lx (Direct Sun)': 50000,
};

const params = {
  shadows: true,
  exposure: 0.68,
  bulbPower: Object.keys(bulbLuminousPowers)[4],
  hemiIrradiance: Object.keys(hemiLuminousIrradiances)[0],
};

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 0.1, 100, new Vector3(-4, 2, 4));
  }

  initRenderer() {
    const p: any = {
      shadowEnabled: true,
      outputEncoding: sRGBEncoding,
    };
    super.initRenderer(true, p);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = ReinhardToneMapping;
  }

  initPlane() {
    const bulbGeometry = new SphereBufferGeometry(0.02, 16, 8);
    bulbLight = new PointLight(0xffee88, 1, 100, 2);

    bulbMat = new MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x00000,
    });
    bulbLight.add(new Mesh(bulbGeometry, bulbMat));
    bulbLight.position.set(0, 2, 0);
    bulbLight.castShadow = true;
    this.scene.add(bulbLight);

    floorMat = new MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005,
    });
    const textureLoader = new TextureLoader();
    const hardwood2 = (encoding: TextureEncoding, key: string) => (
      map: Texture
    ) => {
      map.wrapS = RepeatWrapping;
      map.wrapT = RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(10, 24);
      encoding && (map.encoding = encoding);
      (floorMat as any)[key] = map;
      floorMat.needsUpdate = true;
    };
    textureLoader.load('hardwood2_diffuse.jpg', hardwood2(sRGBEncoding, 'map'));
    textureLoader.load('hardwood2_bump.jpg', hardwood2(null, 'bumpMap'));
    textureLoader.load(
      'hardwood2_roughness.jpg',
      hardwood2(null, 'roughnessMap')
    );

    cubeMat = new MeshStandardMaterial({
      roughness: 0.7,
      color: 0xffffff,
      bumpScale: 0.002,
      metalness: 0.2,
    });
    const brick = (encoding: TextureEncoding, key: string) => (
      map: Texture
    ) => {
      map.wrapS = RepeatWrapping;
      map.wrapT = RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(1, 1);
      encoding && (map.encoding = encoding);
      (cubeMat as any)[key] = map;
      cubeMat.needsUpdate = true;
    };
    textureLoader.load('brick_diffuse.jpg', brick(sRGBEncoding, 'map'));
    textureLoader.load('brick_bump.jpg', brick(null, 'bumpMap'));

    ballMat = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1.0,
    });
    const earth = (key: string) => (map: Texture) => {
      map.anisotropy = 4;
      map.encoding = sRGBEncoding;
      (ballMat as any)[key] = map;
      ballMat.needsUpdate = true;
    };
    textureLoader.load('earth_atmos_2048.jpg', earth('map'));
    textureLoader.load('earth_specular_2048.jpg', earth('metalnessMap'));

    const floorGeometry = new PlaneBufferGeometry(20, 20);
    const floorMesh = new Mesh(floorGeometry, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    this.scene.add(floorMesh);

    const ballGeometry = new SphereBufferGeometry(0.25, 32, 32);
    const ballMesh = new Mesh(ballGeometry, ballMat);
    ballMesh.position.set(1, 0.25, 1);
    ballMesh.rotation.y = Math.PI;
    ballMesh.castShadow = true;
    this.scene.add(ballMesh);

    const boxGeometry = new BoxBufferGeometry(0.5, 0.5, 0.5);
    const boxMesh = new Mesh(boxGeometry, cubeMat);
    boxMesh.position.set(-0.5, 0.25, -1);
    boxMesh.castShadow = true;
    this.scene.add(boxMesh);

    const boxMesh2 = new Mesh(boxGeometry, cubeMat);
    boxMesh2.position.set(0, 0.25, -5);
    boxMesh2.castShadow = true;
    this.scene.add(boxMesh2);

    const boxMesh3 = new Mesh(boxGeometry, cubeMat);
    boxMesh3.position.set(7, 0.25, 0);
    boxMesh3.castShadow = true;
    this.scene.add(boxMesh3);

    this.initGUI();
  }

  initHemiLight() {
    hemiLight = new HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
    this.scene.add(hemiLight);
  }

  initGUI() {
    const gui = new GUI();
    gui.add(params, 'hemiIrradiance', Object.keys(hemiLuminousIrradiances));
    gui.add(params, 'bulbPower', Object.keys(bulbLuminousPowers));
    gui.add(params, 'exposure', 0, 1);
    gui.add(params, 'shadows');
    gui.open();
  }

  render() {
    this.renderer.toneMappingExposure = Math.pow(params.exposure, 5.0);
    this.renderer.shadowMap.enabled = params.shadows;
    bulbLight.castShadow = params.shadows;

    if (params.shadows !== previousShadowMap) {
      ballMat.needsUpdate = true;
      cubeMat.needsUpdate = true;
      floorMat.needsUpdate = true;
      previousShadowMap = params.shadows;
    }

    bulbLight.power = (bulbLuminousPowers as any)[params.bulbPower];
    bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow(0.02, 2.0);

    hemiLight.intensity = (hemiLuminousIrradiances as any)[
      params.hemiIrradiance
    ];

    const time = Date.now() * 0.0005;
    bulbLight.position.y = Math.cos(time) * 0.75 + 1.25;
    
  }
}

let bulbLight: PointLight;
let bulbMat: MeshStandardMaterial;

let hemiLight: HemisphereLight;

let floorMat: MeshStandardMaterial;
let cubeMat: MeshStandardMaterial;
let ballMat: MeshStandardMaterial;

let previousShadowMap = false;

new Demo();
