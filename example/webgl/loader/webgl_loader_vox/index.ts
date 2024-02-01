import { Vector3 } from 'three';
import { Main } from '../../../main';

import { VOXLoader, VOXMesh } from './VOXLoader';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 0.01, 10, new Vector3(0.175, 0.075, 0.175), null);
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initControls() {
    super.initControls(new Vector3());
  }

  initPlane() {
    const loader = new VOXLoader();
    loader.load('monu10.vox', (chunks: any) => {
      chunks.forEach((chunk: any) => {
        const mesh = new VOXMesh(chunk);
        mesh.scale.setScalar(0.0015);
        this.scene.add(mesh);
      });
    });
    this.scene.add(this.camera);
    // this.camera.lookAt(new Vector3(20, 10, 1));
  }

  render() {
    // console.log(this.camera.position);
  }
}

new Demo();
