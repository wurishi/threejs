import { Main } from '../../../main';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {
  AnimationMixer,
  GridHelper,
  Material,
  Mesh,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(100, 200, 300));
  }
  initScene() {
    super.initScene(0xa0a0a0, 200, 1000);
  }
  initPlane() {
    const mesh = new Mesh(
      new PlaneBufferGeometry(2000, 2000),
      new MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const grid = new GridHelper(2000, 20, 0x000000, 0x000000);
    (grid.material as Material).opacity = 0.2;
    (grid.material as Material).transparent = true;
    this.scene.add(grid);

    const loader = new FBXLoader();
    loader.load('sd.fbx', (object) => {
      const mixer = new AnimationMixer(object);

      const action = mixer.clipAction((object as any).animations[0]);
      action.play();

      this.mixers.push(mixer);

      object.traverse((child) => {
        if (child.type === 'Mesh') {
          const mesh = child as Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      this.scene.add(object);
    });
  }
}

new Demo();
