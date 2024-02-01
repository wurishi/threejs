// 通过一个函数生成的曲面

import { Mesh, ParametricGeometry, Scene, Vector3 } from 'three';

import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  getAPI() {
    return {
      slices: 25,
      stacks: 25,
    };
  }

  update(params: any) {
    const { slices, stacks } = params;

    function klein(v: number, u: number, target: Vector3) {
      u *= Math.PI;
      v *= 2 * Math.PI;
      u = u * 2;

      let x, z;
      if (u < Math.PI) {
        x =
          3 * Math.cos(u) * (1 + Math.sin(u)) +
          2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v);
        z =
          -8 * Math.sin(u) -
          2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
      } else {
        x =
          3 * Math.cos(u) * (1 + Math.sin(u)) +
          2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
      }

      const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

      target.set(x, y, z).multiplyScalar(0.75);
    }

    this.mesh && this.scene.remove(this.mesh);

    this.mesh = new Mesh(
      new ParametricGeometry(klein, slices, stacks),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
