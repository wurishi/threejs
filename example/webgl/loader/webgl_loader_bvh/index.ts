import { Main } from '../../../main';

import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader';
import {
  AnimationMixer,
  GridHelper,
  Group,
  SkeletonHelper,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 1, 1000, new Vector3(0, 200, 300));
  }

  initScene() {
    super.initScene(0xeeeeee, 0, 0, false);
    this.scene.add(new GridHelper(400, 10));

    const loader = new BVHLoader();
    loader.load('pirouette.bvh', (result) => {
      const skeletonHelper = new SkeletonHelper(result.skeleton.bones[0]);
      (skeletonHelper as any).skeleton = result.skeleton;

      const boneContainer = new Group();
      boneContainer.add(result.skeleton.bones[0]);

      this.scene.add(skeletonHelper);
      this.scene.add(boneContainer);

      const mixer = new AnimationMixer(skeletonHelper);
      mixer.clipAction(result.clip).setEffectiveWeight(1.0).play();

      this.mixers.push(mixer);
    });
  }
}

new Demo();
