import { Main } from '../../../main';

import { RoomEnvironment } from './RoomEnvironment';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import {
  GridHelper,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MultiplyBlending,
  Object3D,
  PlaneGeometry,
  PMREMGenerator,
  TextureLoader,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initCamera() {
    super.initCamera(40, 0.1, 100, new Vector3(4.25, 1.4, -4.5));
  }
  initScene() {
    super.initScene(0xeeeeee, 10, 50);
  }

  initPlane() {
    const EnvClass: any = RoomEnvironment;
    const environment = new EnvClass();
    const pmremGenerator = new PMREMGenerator(this.renderer);

    this.scene.environment = pmremGenerator.fromScene(environment).texture;

    grid = new GridHelper(100, 40, 0x000000, 0x000000);
    (grid.material as Material).opacity = 0.1;
    (grid.material as Material).depthWrite = false;
    (grid.material as Material).transparent = true;
    this.scene.add(grid);

    const bodyMaterial = new MeshPhysicalMaterial({
      color: 0xff0000,
      metalness: 0.6,
      roughness: 0.4,
      clearcoat: 0.05,
      clearcoatRoughness: 0.05,
    });
    const detailsMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.5,
    });
    const p = {
      color: 0xffffff,
      metalness: 0,
      roughness: 0.1,
      transparent: true,
      // transmission:0.9
      transparency: 0.9,
    };
    const glassMaterial = new MeshPhysicalMaterial(p);
    // console.log(glassMaterial);

    const gui = new GUI();
    const api = {
      bodyColor: 0xff0000,
      detailsColor: 0xffffff,
      glassColor: 0xffffff,
    };
    gui
      .addColor(api, 'bodyColor')
      .name('Body Color')
      .onChange((val) => bodyMaterial.color.set(val));

    gui
      .addColor(api, 'detailsColor')
      .name('Details Color')
      .onChange((val) => detailsMaterial.color.set(val));

    gui
      .addColor(api, 'glassColor')
      .name('Glass Color')
      .onChange((val) => detailsMaterial.color.set(val));

    const shadow = new TextureLoader().load('ferrari_ao.png');

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('gltf/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('ferrari.glb', (gltf) => {
      const carModel = gltf.scene.children[0];

      (carModel.getObjectByName('body') as Mesh).material = bodyMaterial;

      (carModel.getObjectByName('rim_fl') as Mesh).material = detailsMaterial;
      (carModel.getObjectByName('rim_fr') as Mesh).material = detailsMaterial;
      (carModel.getObjectByName('rim_rr') as Mesh).material = detailsMaterial;
      (carModel.getObjectByName('rim_rl') as Mesh).material = detailsMaterial;
      (carModel.getObjectByName('trim') as Mesh).material = detailsMaterial;

      (carModel.getObjectByName('glass') as Mesh).material = glassMaterial;

      wheels.push(
        carModel.getObjectByName('wheel_fl'),
        carModel.getObjectByName('wheel_fr'),
        carModel.getObjectByName('wheel_rl'),
        carModel.getObjectByName('wheel_rr')
      );

      const mesh = new Mesh(
        new PlaneGeometry(0.655 * 4, 1.3 * 4),
        new MeshBasicMaterial({
          map: shadow,
          blending: MultiplyBlending,
          toneMapped: false,
          transparent: true,
        })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 2;
      carModel.add(mesh);

      this.scene.add(carModel);
    });
  }

  render() {
    const time = -performance.now() / 1000;

    wheels.forEach((wheel) => (wheel.rotation.x = time * Math.PI));

    grid.position.z = -time % 5;
  }
}

let grid: GridHelper;
const wheels: Object3D[] = [];

new Demo();
