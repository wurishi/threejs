import { Main } from '../../../main';

import { VRMLoader } from 'three/examples/jsm/loaders/VRMLoader';
import { MeshBasicMaterial, Vector3 } from 'three';

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initCamera() {
    super.initCamera(45, 0.25, 20, new Vector3(0, 1.6, -2.2));
  }

  initPlane() {
    const loader = new VRMLoader();
    loader.load('AliciaSolid.vrm', (vrm) => {
      vrm.scene.traverse((object: any) => {
        if (object.material) {
          if (Array.isArray(object.material)) {
            for (let i = 0, il = object.material.length; i < il; i++) {
              const material: any = new MeshBasicMaterial();
              material.copy(object.material[i]);
              material.color.copy(object.material[i].color);
              material.map = object.material[i].map;
              material.skinning = object.material[i].skinning;
              material.morphTargets = object.material[i].morphTargets;
              material.morphNormals = object.material[i].morphNormals;
              object.material[i] = material;
            }
          } else {
            const material: any = new MeshBasicMaterial();
            material.copy(object.material);
            material.color.copy(object.material.color);
            material.map = object.material.map;
            material.skinning = object.material.skinning;
            material.morphTargets = object.material.morphTargets;
            material.morphNormals = object.material.morphNormals;
            object.material = material;
          }
        }
      });

      this.scene.add(vrm.scene);
    });
  }
}

new Demo();
