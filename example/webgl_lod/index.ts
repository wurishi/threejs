import {
  IcosahedronGeometry,
  LOD,
  Mesh,
  MeshLambertMaterial,
  Vector3,
} from 'three';
import { Main } from '../main';

class Demo extends Main {
  initScene() {
    super.initScene(0, 1, 15000);
  }
  initCamera() {
    super.initCamera(45, 1, 15000, new Vector3(0, 0, 1000));
  }
  initPlane() {
    const geometry: any[] = [
      [new IcosahedronGeometry(100, 3), 50],
      [new IcosahedronGeometry(100, 2), 300],
      [new IcosahedronGeometry(100, 1), 1000],
      // [new IcosahedronGeometry(100, 2), 2000],
      // [new IcosahedronGeometry(100, 1), 8000],
    ];
    const material = new MeshLambertMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    for (let j = 0; j < 1000; j++) {
      const lod = new LOD();

      for (let i = 0; i < geometry.length; i++) {
        const mesh = new Mesh(geometry[i][0], material);
        mesh.scale.setScalar(1.5);
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        lod.addLevel(mesh, geometry[i][1]);
      }

      lod.position.set(
        10000 * (0.5 - Math.random()),
        7500 * (0.5 - Math.random()),
        10000 * (0.5 - Math.random())
      );
      lod.updateMatrix();
      lod.matrixAutoUpdate = false;
      this.scene.add(lod);
    }
  }
}

new Demo();
