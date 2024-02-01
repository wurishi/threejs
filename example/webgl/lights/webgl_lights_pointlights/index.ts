import { Main } from '../../../main';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import {
  BufferGeometry,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PointLight,
  SphereBufferGeometry,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 1000, new Vector3(0, 0, 100));
  }

  initHemiLight() {}
  initDirLight() {}

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new OBJLoader();
    loader.load('head.obj', (obj) => {
      object = obj;
      object.scale.multiplyScalar(0.8);
      object.position.y = -30;
      this.scene.add(object);
    });

    const sphere = new SphereBufferGeometry(0.5, 16, 8);

    // lights
    this.scene.add(addLight(0xff0040, sphere));
    this.scene.add(addLight(0x0040ff, sphere));
    this.scene.add(addLight(0x80ff80, sphere));
    this.scene.add(addLight(0xffaa00, sphere));
  }

  render() {
    const time = Date.now() * 0.0005;
    const delta = this.clock.getDelta();

    if (object) object.rotation.y -= 0.5 * delta;

    [
      [0.7, 0, 0, 0.5, 0, 0.3],
      [0, 0.3, 0.5, 0, 0.7, 0],
      [0.7, 0, 0, 0.3, 0.5, 0],
      [0.3, 0, 0, 0.7, 0.5, 0],
    ].forEach((arr, i) => {
      lightList[i].position.set(
        (arr[0] ? Math.sin(time * arr[0]) : Math.cos(time * arr[1])) * 30,
        (arr[2] ? Math.sin(time * arr[2]) : Math.cos(time * arr[3])) * 40,
        (arr[4] ? Math.sin(time * arr[4]) : Math.cos(time * arr[5])) * 30
      );
    });
  }
}

function addLight(color: number, geo: BufferGeometry) {
  const light = new PointLight(color, 2, 50);
  light.add(new Mesh(geo, new MeshBasicMaterial({ color })));
  lightList.push(light);
  return light;
}

let object: Object3D;
let lightList: PointLight[] = [];

new Demo();
