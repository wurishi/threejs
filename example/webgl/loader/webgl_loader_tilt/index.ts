import { GridHelper, Vector3 } from 'three';
import { Main } from '../../../main';

import { TiltLoader } from './TiltLoader';

class Demo extends Main {
  initCamera() {
    super.initCamera(35, 1, 500, new Vector3(0, 43, 100));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    this.scene.add(this.camera);

    const grid = new GridHelper(50, 50, 0xffffff, 0x555555);
    this.scene.add(grid);

    const loader = new TiltLoader();
    loader.load('BRUSH_DOME.tilt', (object: any) => {
      this.scene.add(object);
    });
  }
}

new Demo();
