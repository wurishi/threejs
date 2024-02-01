import { Main } from '../../../main';

import { AssimpLoader } from 'three/examples/jsm/loaders/AssimpLoader';
import { DirectionalLight, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(
      25,
      1,
      10000,
      new Vector3(600, 1150, 5),
      new Vector3(-100, 0, 0)
    );
    this.camera.up.set(0, 0, 1);
  }

  initHemiLight() {}

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initDirLight() {
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(0, 4, 4).normalize();
    this.scene.add(light);
  }

  initPlane() {
    const loader = new AssimpLoader();
    loader.load('Octaminator.assimp', (result) => {
      const object = result.object;
      object.position.y = -100;
      object.rotation.x = Math.PI / 2;
      this.scene.add(object);

      animation = result.animation;
    });
  }

  render() {
    if (animation) {
      animation.setTime(this.clock.getElapsedTime());
    }
  }
}

let animation: any;

new Demo();
