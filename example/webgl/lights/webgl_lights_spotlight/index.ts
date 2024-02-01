import { GUI } from 'dat.gui';
import {
  AmbientLight,
  BufferGeometry,
  CameraHelper,
  CylinderBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  SpotLight,
  SpotLightHelper,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initHemiLight() {}
  initDirLight() {}

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const ambient = new AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    spotLight = new SpotLight(0xffffff, 1);
    spotLight.position.set(15, 40, 35);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    // spotLight.shadow.fo
    this.scene.add(spotLight);

    lightHelper = new SpotLightHelper(spotLight);
    this.scene.add(lightHelper);

    shadowCameraHelper = new CameraHelper(spotLight.shadow.camera);
    this.scene.add(shadowCameraHelper);

    let material = new MeshPhongMaterial({ color: 0x808080, dithering: true });
    let geometry: BufferGeometry = new PlaneBufferGeometry(2000, 2000);
    let mesh = new Mesh(geometry, material);
    mesh.position.set(0, -1, 0);
    mesh.rotation.x = -Math.PI * 0.5;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    material = new MeshPhongMaterial({ color: 0x4080ff, dithering: true });
    geometry = new CylinderBufferGeometry(5, 5, 2, 32, 1, false);
    mesh = new Mesh(geometry, material);
    mesh.position.set(0, 5, 0);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.initGUI();
  }

  render() {
    lightHelper.update();
    shadowCameraHelper.update();
  }

  initGUI() {
    const gui = new GUI();

    const { intensity, distance, angle, penumbra, decay } = spotLight;
    const params = {
      'light color': spotLight.color.getHex(),
      intensity,
      distance,
      angle,
      penumbra,
      decay,
      // focus:spotLight.shadow.focus
    };

    gui.addColor(params, 'light color').onChange((val) => {
      spotLight.color.setHex(val);
    });
    gui.add(params, 'intensity', 0, 2).onChange((val) => {
      spotLight.intensity = val;
    });
    gui.add(params, 'distance', 50, 200).onChange((val) => {
      spotLight.distance = val;
    });
    gui.add(params, 'angle', 0, Math.PI / 3).onChange((val) => {
      spotLight.angle = val;
    });
    gui.add(params, 'penumbra', 0, 1).onChange((val) => {
      spotLight.penumbra = val;
    });
    gui.add(params, 'decay', 1, 2).onChange((v) => {
      spotLight.decay = v;
    });
    gui.open();
  }
}

let spotLight: SpotLight;
let lightHelper: SpotLightHelper;
let shadowCameraHelper: CameraHelper;

new Demo();
