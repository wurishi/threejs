import { Main } from '../../../main';

import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { LoadingManager, Scene, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(
      45,
      0.1,
      2000,
      new Vector3(8, 10, 8),
      new Vector3(0, 3, 0)
    );
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loadingManager = new LoadingManager(() => {
      this.scene.add(elf);
    });

    const loader = new ColladaLoader(loadingManager);
    loader.load('elf.dae', (collada) => {
      elf = collada.scene;
    });
  }

  render() {
    const delta = this.clock.getDelta();
    if (elf) {
      elf.rotation.z += delta * 100;
      // console.log(elf.rotation.z);
    }
  }
}

let elf: Scene;

new Demo();
