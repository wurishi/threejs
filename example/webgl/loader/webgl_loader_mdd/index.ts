import { Main } from '../../../main';

import { MDDLoader } from 'three/examples/jsm/loaders/MDDLoader';
import {
  AnimationMixer,
  BoxBufferGeometry,
  Mesh,
  MeshNormalMaterial,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(35, 0.1, 100, new Vector3(8, 8, 8), this.scene.position);
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new MDDLoader();
    loader.load('cube.mdd', (result) => {
      const morphTargets = result.morphTargets;
      const clip = result.clip;
      clip.optimize();

      const geometry = new BoxBufferGeometry();
      geometry.morphAttributes.position = morphTargets;

      const material = new MeshNormalMaterial({ morphTargets: true });

      const mesh = new Mesh(geometry, material);
      this.scene.add(mesh);

      const mixer = new AnimationMixer(mesh);
      mixer.clipAction(clip).play();

      this.mixers.push(mixer);
    });
  }
}

new Demo();
