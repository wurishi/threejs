import { Main } from '../../../main';

import { GCodeLoader } from 'three/examples/jsm/loaders/GCodeLoader';
import { Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 1, 1000, new Vector3(0, 0, 70));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new GCodeLoader();
    loader.load('benchy.gcode', (object) => {
      object.position.set(-100, -20, 100);

      this.scene.add(object);
    });
  }
}

new Demo();
