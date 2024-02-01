import {
  CubicBezierCurve3,
  CurvePath,
  ExtrudeGeometry,
  Mesh,
  MeshPhongMaterial,
  Scene,
  Shape,
  Vector2,
  Vector3,
} from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      steps: 92,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  getOutline() {
    const outline = new Shape(
      [
        [-2, -0.1],
        [2, -0.1],
        [2, 0.6],
        [1.6, 0.6],
        [1.6, 0.1],
        [-2, 0.1],
      ].map((p) => new Vector2(...p))
    );
    return outline;
  }

  getShape() {
    const x = -2.5;
    const y = -5;
    const shape = new CurvePath();
    const points = [
      [x + 2.5, y + 2.5],
      [x + 2.5, y + 2.5],
      [x + 2, y],
      [x, y],
      [x - 3, y],
      [x - 3, y + 3.5],
      [x - 3, y + 3.5],
      [x - 3, y + 5.5],
      [x - 1.5, y + 7.7],
      [x + 2.5, y + 9.5],
      [x + 6, y + 7.7],
      [x + 8, y + 4.5],
      [x + 8, y + 3.5],
      [x + 8, y + 3.5],
      [x + 8, y],
      [x + 5, y],
      [x + 3.5, y],
      [x + 2.5, y + 2.5],
      [x + 2.5, y + 2.5],
    ].map((p) => new Vector3(...p, 0));
    for (let i = 0; i < points.length; i += 3) {
      shape.add(
        new CubicBezierCurve3(
          points[i],
          points[i + 1],
          points[i + 2],
          points[i + 3]
        )
      );
    }
    return shape;
  }

  update(params: any) {
    const settings = {
      ...params,
      bevelEnabled: false,
      extrudePath: this.getShape(),
    };

    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new ExtrudeGeometry(this.getOutline(), settings),
      new MeshPhongMaterial({ color: 0xcc00cc })
    );
    this.scene.add(this.mesh);
  }
}
