// 受挤压的 2D 形状，及可选的斜切。 这里我们挤压了一个心型。注意，它是TextGeometry的基础。

import { Demo } from './constant';
import { ExtrudeGeometry, Mesh, MeshPhongMaterial, Scene, Shape } from 'three';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 2,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  getShape() {
    const shape = new Shape();
    const x = -2.5;
    const y = -5;

    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    return shape;
  }

  update(params: any) {
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new ExtrudeGeometry(this.getShape(), params),
      new MeshPhongMaterial({ color: 0xff0000 })
    );
    this.scene.add(this.mesh);
  }
}
