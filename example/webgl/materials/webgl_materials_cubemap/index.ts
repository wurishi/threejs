import {
  CubeReflectionMapping,
  CubeRefractionMapping,
  CubeTextureLoader,
  MeshLambertMaterial,
  MixOperation,
  Vector3,
} from 'three';
import { Main } from '../../../main';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 5000, new Vector3(0, 0, 2000));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const urls = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];
    const reflectionCube = new CubeTextureLoader().load(urls);
    reflectionCube.mapping = CubeReflectionMapping;
    const refractionCube = new CubeTextureLoader().load(urls);
    refractionCube.mapping = CubeRefractionMapping;

    this.scene.background = reflectionCube;

    const cmList = [
      new MeshLambertMaterial({ color: 0xffffff, envMap: reflectionCube }),
      new MeshLambertMaterial({
        color: 0xffee00,
        envMap: refractionCube,
        refractionRatio: 0.95,
      }),
      new MeshLambertMaterial({
        color: 0xff6600,
        envMap: reflectionCube,
        combine: MixOperation,
        reflectivity: 0.3,
      }),
    ];

    const objLoader = new OBJLoader();
    objLoader.load('WaltHead.obj', (object) => {
      const head = object.children[0] as any;
      head.scale.multiplyScalar(15);
      head.position.y = -500;
      head.material = cmList[0];

      const head2 = head.clone();
      head2.position.x = -900;
      head2.material = cmList[1];

      const head3 = head.clone();
      head3.position.x = 900;
      head3.material = cmList[2];

      this.scene.add(head, head2, head3);
    });
  }
}

new Demo();
