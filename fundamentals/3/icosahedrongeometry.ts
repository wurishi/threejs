import { IcosahedronGeometry, Mesh, MeshPhongMaterial, Scene } from 'three';
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
    this.mesh && this.scene.remove(this.mesh);
    const { radius, detail } = params;
    this.mesh = new Mesh(
      new IcosahedronGeometry(radius, detail),
      new MeshPhongMaterial({ color: 0x00dddd })
    );
    this.scene.add(this.mesh);
  }
}
