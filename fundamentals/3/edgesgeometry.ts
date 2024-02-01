// 辅助对象, 接收一个几何体作为输入, 并且仅当这个几何体面之间的角度大于某个阈值时才会生成边

import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Scene,
  SphereGeometry,
} from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: LineSegments;

  getAPI() {
    return {
      thresholdAngle: 1,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const { thresholdAngle } = params;

    this.mesh && this.scene.remove(this.mesh);

    const sphereGeometry = new SphereGeometry(7, 6, 3);

    this.mesh = new LineSegments(
      new EdgesGeometry(sphereGeometry, thresholdAngle)
    );

    this.scene.add(this.mesh);
  }
}
