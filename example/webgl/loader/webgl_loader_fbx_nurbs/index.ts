import { Main } from '../../../main';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GridHelper, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(2, 18, 28));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const gridHelper = new GridHelper(28, 28, 0x303030, 0x303030);
    this.scene.add(gridHelper);

    const loader = new FBXLoader();
    loader.load('nurbs.fbx', (object) => {
      this.scene.add(object);
    });
  }
}

new Demo();
