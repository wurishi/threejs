import { Main } from '../../../main';

import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { AnimationMixer, GridHelper, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(25, 1, 1000, new Vector3(15, 10, -15));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new ColladaLoader();
    loader.load('stormtrooper.dae', (collada) => {
      const avatar = collada.scene;
      const animations = collada.animations;

      const mixer = new AnimationMixer(avatar);
      mixer.clipAction(animations[0]).play();

      this.mixers.push(mixer);

      this.scene.add(avatar);
    });

    const gridHelper = new GridHelper(10, 20, 0x888888, 0x444444);
    this.scene.add(gridHelper);
  }
}

new Demo();
