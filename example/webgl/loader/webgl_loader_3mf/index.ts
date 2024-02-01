import { Main } from '../../../main';

import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';
import { Box3, Group, LoadingManager, Object3D, Vector3 } from 'three';
import { GUI } from 'dat.gui';

const params = {
  asset: 'cube_gears',
};

const assets = ['cube_gears', 'facecolors', 'multipletextures', 'vertexcolors'];

class Demo extends Main {
  initScene() {
    super.initScene(0x333333, 0, 0, false);
  }
  initCamera() {
    super.initCamera(35, 1, 500);
    this.camera.position.set(0, 0, 0);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(-100, 250, 100);
  }
  initPlane() {
    const manager = new LoadingManager();
    manager.onLoad = () => {
      const aabb = new Box3().setFromObject(object);
      const center = aabb.getCenter(new Vector3());

      object.position.x += object.position.x - center.x;
      object.position.y += object.position.y - center.y;
      object.position.z += object.position.z - center.z;

      this.scene.add(object);
    };

    loader = new ThreeMFLoader(manager);
    this.loadAsset(params.asset);

    const gui = new GUI({ width: 300 });
    gui.add(params, 'asset', assets).onChange((val) => this.loadAsset(val));
  }

  loadAsset(asset: string) {
    loader.load(asset + '.3mf', (group) => {
      if (object) {
        object.traverse((child: any) => {
          child.material && child.material.dispose();
          child.material && child.material.map && child.material.map.dispose();
          child.geometry && child.geometry.dispose();
        });
        this.scene.remove(object);
      }
      object = group;
    });
  }
}

let object: Group;
let loader: ThreeMFLoader;

new Demo();
