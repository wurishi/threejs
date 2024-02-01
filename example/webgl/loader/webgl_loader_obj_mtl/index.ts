import { Main } from '../../../main';

import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { LoadingManager } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000);
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const manager = new LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());

    new MTLLoader(manager).load('male02_dds.mtl', (materials) => {
      materials.preload();

      new OBJLoader(manager)
        .setMaterials(materials)
        .load('male02.obj', (object) => {
          object.position.y = -95;
          this.scene.add(object);
        });
    });
  }
}

new Demo();
