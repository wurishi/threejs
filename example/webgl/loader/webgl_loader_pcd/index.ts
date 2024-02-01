import { Main } from '../../../main';

import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Demo extends Main {
  initScene() {
    super.initScene(0x000000, 0, 0, false);
  }

  initCamera() {
    super.initCamera(15, 0.01, 40, new Vector3(0.4, 0, -2), null);
    this.camera.up.set(0, 0, 1);
  }

  initControls() {
    ctr = new OrbitControls(this.camera, this.renderer.domElement);
    ctr.update();
  }

  initPlane() {
    const loader = new PCDLoader();
    loader.load('zaghetto.pcd', (points) => {
      this.scene.add(points);

      const center = points.geometry.boundingSphere.center;
      ctr.target.copy(center);
      ctr.update();
    });

    window.addEventListener('keypress', (ev) => {
      const points: any = this.scene.getObjectByName('zaghetto.pcd');
      switch (ev.key || String.fromCharCode(ev.keyCode || ev.charCode)) {
        case '1':
          points.material.size *= 1.2;
          points.material.needsUpdate = true;
          break;
        case '2':
          points.material.size /= 1.2;
          points.material.needsUpdate = true;
          break;
        case 'c':
          points.material.color.setHex(Math.random() * 0xffffff);
          points.material.needsUpdate = true;
          break;
      }
    });
  }
}

let ctr: OrbitControls;

new Demo();
