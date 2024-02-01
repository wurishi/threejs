import { BoxBufferGeometry, Mesh, MeshNormalMaterial, Vector3 } from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }

  initCamera() {
    super.initCamera(60, 1, 15000, new Vector3(0, 0, 500));
  }

  root: Mesh;

  initPlane() {
    const geometry = new BoxBufferGeometry(100, 100, 100);
    const material = new MeshNormalMaterial();

    this.root = new Mesh(geometry, material);
    this.root.position.x = 1000;
    this.scene.add(this.root);

    const amount = 200;
    let object: Mesh,
      parent = this.root;

    [
      { x: 100 },
      { x: -100 },
      { y: 100 },
      { y: -100 },
      { z: 100 },
      { z: -100 },
    ].forEach((c) => {
      parent = this.root;

      for (let i = 0; i < amount; i++) {
        object = new Mesh(geometry, material);
        c.x && (object.position.x = c.x);
        c.y && (object.position.y = c.y);
        c.z && (object.position.z = c.z);

        parent.add(object);
        parent = object;
      }
    });
  }

  render() {
    const time = Date.now() * 0.001 + 10000;

    const rx = Math.sin(time * 0.7) * 0.2;
    const ry = Math.sin(time * 0.3) * 0.1;
    const rz = Math.sin(time * 0.2) * 0.1;

    this.root.traverse((obj) => {
      obj.rotation.set(rx, ry, rz);
    });
  }
}

new Demo();
