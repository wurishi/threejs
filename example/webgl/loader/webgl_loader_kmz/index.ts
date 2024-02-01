import { Main } from '../../../main';

import { KMZLoader } from 'three/examples/jsm/loaders/KMZLoader';
import { GridHelper, Vector3 } from 'three';

class Demo extends Main {
  initScene() {
    super.initScene(0x999999, 0, 0, false);
  }

  initCamera() {
    super.initCamera(35, 1, 500, new Vector3(0, 5, 10));
  }

  initPlane() {
    const grid = new GridHelper(50, 50, 0xffffff, 0x555555);
    this.scene.add(grid);

    const loader = new KMZLoader();
    loader.load('Box.kmz', (kmz) => {
      kmz.scene.position.y = 0.5;
      this.scene.add(kmz.scene);
    });
  }
}

new Demo();
