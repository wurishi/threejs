import { Mesh, Scene, TorusKnotGeometry } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      radius: 3.5,
      tubeRadius: 1.5,
      radialSegments: 8,
      tubularSegments: 64,
      p: 2,
      q: 3,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const {
      radius,
      tubeRadius,
      radialSegments,
      tubularSegments,
      p,
      q,
    } = params;

    this.mesh && this.scene.remove(this.mesh);

    this.mesh = new Mesh(
      new TorusKnotGeometry(
        radius,
        tubeRadius,
        tubularSegments,
        radialSegments,
        p,
        q
      ),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
