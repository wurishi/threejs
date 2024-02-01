import { Mesh, RingGeometry, Scene } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      innerRadius: 2,
      outerRadius: 7,
      thetaSegments: 18,
      phiSegments: 2,
      thetaStart: Math.PI * 0.25,
      thetaLength: Math.PI * 1.5,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const {
      innerRadius,
      outerRadius,
      thetaSegments,
      phiSegments,
      thetaStart,
      thetaLength,
    } = params;
    this.mesh && this.scene.remove(this.mesh);

    this.mesh = new Mesh(
      new RingGeometry(
        innerRadius,
        outerRadius,
        thetaSegments,
        phiSegments,
        thetaStart,
        thetaLength
      ),
      this.createMaterial()
    );

    this.scene.add(this.mesh);
  }
}
