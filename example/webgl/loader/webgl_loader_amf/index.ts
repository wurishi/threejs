import { Main } from '../../../main';
import { AMFLoader } from 'three/examples/jsm/loaders/AMFLoader';
import {
  AmbientLight,
  GridHelper,
  PointLight,
  PointLightHelper,
  Vector3,
} from 'three';

class Demo extends Main {
  initScene() {
    super.initScene(0x999999, 0, 0, false);

    this.scene.add(new AmbientLight(0x999999));
  }

  initCamera() {
    super.initCamera(35, 1, 500, new Vector3());

    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, -9, 6);

    const pl = new PointLight(0xffffff, 0.8);
    // const help = new PointLightHelper(pl);
    this.camera.add(pl);
    // this.camera.add(help);

    this.scene.add(this.camera);
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  initHemiLight() {}

  initDirLight() {}

  initPlane() {
    const grid = new GridHelper(50, 50, 0xffffff, 0x555555);
    grid.rotateOnAxis(new Vector3(1, 0, 0), 90 * (Math.PI / 180));
    this.scene.add(grid);

    const loader = new AMFLoader();
    loader.load('rook.amf', (amfobject) => {
      this.scene.add(amfobject);
    });
  }
}

new Demo();
