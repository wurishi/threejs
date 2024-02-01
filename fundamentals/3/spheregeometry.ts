import { Mesh, Scene, SphereGeometry } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      radius: 7,
      widthSegments: 12,
      heightSegments: 8,
      phiStart: Math.PI * 0.25,
      phiLength: Math.PI * 1.5,
      thetaStart: Math.PI * 0.25,
      thetaLength: Math.PI * 0.5,
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
      widthSegments,
      heightSegments,
      phiStart,
      phiLength,
      thetaStart,
      thetaLength,
    } = params;
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new SphereGeometry(
        radius,
        widthSegments,
        heightSegments,
        phiStart,
        phiLength,
        thetaStart,
        thetaLength
      ),
      this.createMaterial()
    );
    this.scene.add(this.mesh);
  }
}
