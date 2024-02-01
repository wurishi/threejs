import { Mesh, OctahedronGeometry, Scene } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      radius: 7,
      detail: 2,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const { radius, detail } = params;

    this.mesh && this.scene.remove(this.mesh);

    this.mesh = new Mesh(
      new OctahedronGeometry(radius, detail),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
