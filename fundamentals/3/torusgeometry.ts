import { Mesh, Scene, TorusGeometry } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      radius: 5,
      tubeRadius: 2,
      radialSegments: 8,
      tubularSegments: 24,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const { radius, tubeRadius, radialSegments, tubularSegments } = params;

    this.mesh && this.scene.remove(this.mesh);

    this.mesh = new Mesh(
      new TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
