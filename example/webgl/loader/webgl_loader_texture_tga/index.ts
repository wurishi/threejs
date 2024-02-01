import { Main } from '../../../main';

import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { BoxGeometry, Mesh, MeshPhongMaterial, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 0.1, 1000, new Vector3(0, 50, 250));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new TGALoader();
    const geometry = new BoxGeometry(50, 50, 50);

    const texture1: any = loader.load('crate_grey8.tga', null);
    const material1 = new MeshPhongMaterial({
      color: 0xffffff,
      map: texture1,
    });
    const mesh1 = new Mesh(geometry, material1);
    mesh1.position.x = -50;
    this.scene.add(mesh1);

    const texture2: any = loader.load('crate_color8.tga', null);
    const material2 = new MeshPhongMaterial({ color: 0xffffff, map: texture2 });
    const mesh2 = new Mesh(geometry, material2);
    mesh2.position.x = 50;
    this.scene.add(mesh2);
  }
}

new Demo();
