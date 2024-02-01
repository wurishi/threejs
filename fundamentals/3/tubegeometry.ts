// 沿着路径画管状体

import { Curve, Mesh, Scene, TubeGeometry, Vector3 } from 'three';
import { Demo } from './constant';

class CustomSinCurve extends Curve<Vector3> {
  scale: number;

  constructor(scale: number) {
    super();
    this.scale = scale;
  }

  getPoint(t: number) {
    const tx = t * 3 - 1.5;
    const ty = Math.sin(2 * Math.PI * t);
    const tz = 0;
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      tubularSegments: 20,
      radius: 1,
      radialSegments: 8,
      closed: false,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const { tubularSegments, radius, radialSegments, closed } = params;

    this.mesh && this.scene.remove(this.mesh);

    const path = new CustomSinCurve(4);
    this.mesh = new Mesh(
      new TubeGeometry(path, tubularSegments, radius, radialSegments, closed),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
