import { Demo } from './constant';
import { CylinderGeometry, Mesh, MeshPhongMaterial, Scene } from 'three';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return {
      radiusTop: 4,
      radiusBottom: 4,
      height: 8,
      radialSegments: 12,
      heightSegments: 2,
      openEnded: false,
      thetaStart: Math.PI * 0.25,
      thetaLength: Math.PI * 1.5,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    const params = this.getAPI();
    this.update(params);
    this.addDirLight(scene);
  }

  update(params: any) {
    const {
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength,
    } = params;
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        openEnded,
        thetaStart,
        thetaLength
      ),
      new MeshPhongMaterial({ color: 0x00f0ee })
    );
    this.scene.add(this.mesh);
  }
}
