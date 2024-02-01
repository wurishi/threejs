import { Demo } from './constant';
import { Mesh, ConeGeometry, MeshPhongMaterial, DoubleSide } from 'three';

export default class extends Demo {
  getAPI() {
    return {
      radius: 6,
      height: 8,
      radialS: 16,
      heightS: 2,
      openEnded: true,
      thetaS: Math.PI * 0.25,
      thetaL: Math.PI * 1.75,
    };
  }

  scene: THREE.Scene;
  mesh: THREE.Mesh;

  main(scene: THREE.Scene) {
    this.scene = scene;
    const params = this.getAPI();
    this.update(params);
    this.addDirLight(scene);
  }

  update(params: any) {
    const {
      radius,
      height,
      radialS,
      heightS,
      openEnded,
      thetaS,
      thetaL,
    } = params;
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new ConeGeometry(
        radius,
        height,
        radialS,
        heightS,
        openEnded,
        thetaS,
        thetaL
      ),
      new MeshPhongMaterial({ color: 0xf0f000, side: DoubleSide })
    );
    this.scene.add(this.mesh);
  }
}
