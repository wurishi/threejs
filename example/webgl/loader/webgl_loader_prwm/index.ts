import { Main } from '../../../main';

import { PRWMLoader } from 'three/examples/jsm/loaders/PRWMLoader';
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  Scene,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

// * 会自动根据平台切换le或be
const MODELS: any = {
  'Faceted Nefertiti': 'faceted-nefertiti.*.prwm',
  'Smooth Suzanne': 'smooth-suzanne.*.prwm',
  'Vive Controller': 'vive-controller.*.prwm',
};

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(0, 0, 250));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initHemiLight() {}

  initDirLight() {
    this.scene.add(new AmbientLight(0x101030));

    const dirLight = new DirectionalLight(0xffeedd);
    dirLight.position.set(0, 0, 1);
    this.scene.add(dirLight);
  }

  initPlane() {
    loadGeometry(this.scene, MODELS['Smooth Suzanne']);

    this.initGUI();
  }

  loadGeometry(url: string) {}

  initGUI() {
    const gui = new GUI();
    const api = {
      model: 'Smooth Suzanne',
    };
    gui.add(api, 'model', Object.keys(MODELS)).onChange((key) => {
      loadGeometry(this.scene, MODELS[key]);
    });
  }
}

const loader = new PRWMLoader();
const material = new MeshPhongMaterial({});

let busy = false;
let mesh: Mesh = null;

const loadGeometry = (scene: Scene, url: string) => {
  if (busy) return;
  busy = true;

  if (mesh !== null) {
    scene.remove(mesh);
    mesh.geometry.dispose();
  }

  loader.load(url, (geometry) => {
    mesh = new Mesh(geometry, material);
    mesh.scale.set(50, 50, 50);
    scene.add(mesh);

    busy = false;
  });
};

new Demo();
