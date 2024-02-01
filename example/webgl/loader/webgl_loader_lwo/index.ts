import { Main } from '../../../main';

import { LWOLoader } from 'three/examples/jsm/loaders/LWOLoader';
import { GridHelper, Material, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 200, new Vector3(-0.7, 14.6, 43.2));
  }
  initScene() {
    super.initScene(0xa0a0a0, 0, 0, false);
  }

  initPlane() {
    const grid = new GridHelper(200, 20, 0x000000, 0x000000);
    (grid.material as Material).opacity = 0.3;
    (grid.material as Material).transparent = true;
    this.scene.add(grid);

    const loader = new LWOLoader();
    loader.load('Demo.lwo', (object) => {
      const phone = object.meshes[0];
      phone.position.set(-2, 12, 0);

      const standard = object.meshes[1];
      standard.position.set(2, 12, 0);

      const rocket = object.meshes[2];
      rocket.position.set(0, 10.5, -1);

      this.scene.add(phone, standard, rocket);
    });
  }
}

new Demo();
