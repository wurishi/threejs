// 通过旋转一条线而形成的形状, 例如: 台灯, 保龄球, 酒杯等.
import {
  DoubleSide,
  LatheGeometry,
  Mesh,
  MeshPhongMaterial,
  Scene,
  Vector2,
} from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      segments: 12,
      phiStart: Math.PI * 0.25,
      phiLength: Math.PI * 1.5,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    this.mesh && this.scene.remove(this.mesh);
    const points: Vector2[] = [];
    for (let i = 0; i < 10; i++) {
      points.push(new Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * 0.8));
    }
    const { segments, phiStart, phiLength } = params;
    this.mesh = new Mesh(
      new LatheGeometry(points, segments, phiStart, phiLength),
      new MeshPhongMaterial({ color: 0xff0000, side: DoubleSide })
    );
    this.scene.add(this.mesh);
  }
}
