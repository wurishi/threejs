import {
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initCamera() {
    super.initCamera(70, 1, 1000, new Vector3(0, 0, 400));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  mesh: Mesh;

  initPlane() {
    const texture = new TextureLoader().load('crate.gif');
    const geometry = new BoxBufferGeometry(200, 200, 200);
    const material = new MeshBasicMaterial({ map: texture });

    this.mesh = new Mesh(geometry, material);

    this.scene.add(this.mesh);
  }

  render() {
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.01;
  }
}

new Demo();
