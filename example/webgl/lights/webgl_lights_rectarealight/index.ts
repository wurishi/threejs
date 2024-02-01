import { Main } from '../../../main';

import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import {
  AmbientLight,
  BoxBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  RectAreaLight,
  SphereBufferGeometry,
  TorusKnotBufferGeometry,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 1000, new Vector3(0, 20, 35));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initDirLight() {}
  initHemiLight() {}

  initPlane() {
    ambient = new AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    RectAreaLightUniformsLib.init();

    rectLight = new RectAreaLight(0xffffff, 1, 10, 10);
    rectLight.position.set(5, 5, 0);
    this.scene.add(rectLight);

    rectLightHelper = new RectAreaLightHelper(rectLight);
    rectLight.add(rectLightHelper);

    const geoFloor = new BoxBufferGeometry(2000, 0.1, 2000);
    matStdFloor = new MeshStandardMaterial({
      color: 0x808080,
      roughness: 0,
      metalness: 0,
    });
    const mshStdFloor = new Mesh(geoFloor, matStdFloor);
    this.scene.add(mshStdFloor);

    matStdObjects = new MeshStandardMaterial({
      color: 0xa00000,
      roughness: 0,
      metalness: 0,
    });

    const geoBox = new BoxBufferGeometry(Math.PI, Math.sqrt(2), Math.E);
    const mshStdBox = new Mesh(geoBox, matStdObjects);
    mshStdBox.position.set(0, 5, 0);
    mshStdBox.rotation.set(0, Math.PI / 2.0, 0);
    mshStdBox.castShadow = true;
    mshStdBox.receiveShadow = true;
    this.scene.add(mshStdBox);

    const geoSphere = new SphereBufferGeometry(1.5, 32, 32);
    const mshStdSphere = new Mesh(geoSphere, matStdObjects);
    mshStdSphere.position.set(-5, 5, 0);
    mshStdSphere.castShadow = true;
    mshStdSphere.receiveShadow = true;
    this.scene.add(mshStdSphere);

    const geoKnot = new TorusKnotBufferGeometry(1.5, 0.5, 100, 16);
    const mshStdKnot = new Mesh(geoKnot, matStdObjects);
    mshStdKnot.position.set(5, 5, 0);
    mshStdKnot.castShadow = true;
    mshStdKnot.receiveShadow = true;
    this.scene.add(mshStdKnot);

    this.initGUI();
  }

  initGUI() {
    param = {
      motion: true,
      width: rectLight.width,
      height: rectLight.height,
      color: rectLight.color.getHex(),
      intensity: rectLight.intensity,
      ambient: ambient.intensity,
      'floor color': matStdFloor.color.getHex(),
      'object color': matStdObjects.color.getHex(),
      roughness: matStdFloor.roughness,
      metalness: matStdFloor.metalness,
    };

    const gui = new GUI({ width: 300 });
    gui.open();

    gui.add(param, 'motion');

    const lightFolder = gui.addFolder('Light');
    lightFolder
      .add(param, 'width', 1, 20, 0.1)
      .onChange((val) => (rectLight.width = val));
    lightFolder
      .add(param, 'height', 1, 20, 0.1)
      .onChange((val) => (rectLight.height = val));
    lightFolder
      .addColor(param, 'color')
      .onChange((val) => rectLight.color.setHex(val));

    lightFolder
      .add(param, 'intensity', 0.0, 4.0, 0.01)
      .onChange((val) => (rectLight.intensity = val));
    lightFolder
      .add(param, 'ambient', 0.0, 0.2)
      .step(0.01)
      .onChange((val) => (ambient.intensity = val));

    lightFolder.open();

    const standardFolder = gui.addFolder('Standard Material');
    standardFolder
      .addColor(param, 'floor color')
      .onChange((val) => matStdFloor.color.setHex(val));
    standardFolder
      .addColor(param, 'object color')
      .onChange((val) => matStdObjects.color.setHex(val));
    standardFolder.add(param, 'roughness', 0, 1, 0.01).onChange((val) => {
      matStdObjects.roughness = val;
      matStdFloor.roughness = val;
    });
    standardFolder.add(param, 'metalness', 0, 1, 0.01).onChange((val) => {
      matStdObjects.metalness = val;
      matStdFloor.metalness = val;
    });
    standardFolder.open();
  }

  render() {
    if (param.motion) {
      const t = Date.now() / 2000;
      const r = 15.0;
      const lx = r * Math.cos(t);
      const lz = r * Math.sin(t);
      const ly = 5.0 + 5.0 * Math.sin(t / 3.0);

      rectLight.position.set(lx, ly, lz);
      rectLight.lookAt(origin);
    }
    rectLightHelper.update();
  }
}

const origin = new Vector3();

let ambient: AmbientLight;

let rectLight: RectAreaLight;

let rectLightHelper: RectAreaLightHelper;

let matStdFloor: MeshStandardMaterial;
let matStdObjects: MeshStandardMaterial;

let param: any = { motion: true };

new Demo();
