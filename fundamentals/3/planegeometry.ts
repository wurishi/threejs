import { Mesh, PlaneGeometry, Scene } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      width: 9,
      height: 9,
      widthSegments: 2,
      heightSegments: 2,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const { width, height, widthSegments, heightSegments } = params;
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new PlaneGeometry(width, height, widthSegments, heightSegments),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
