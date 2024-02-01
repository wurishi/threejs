import { Demo } from './constant';
import * as THREE from 'three';
import { DoubleSide } from 'three';

export default class extends Demo {
  getAPI() {
    return {
      radius: 7,
      segments: 24,
      thetaStart: Math.PI * 0.25,
      thetaLength: Math.PI * 1.5,
    };
  }

  scene: THREE.Scene;
  mesh: THREE.Mesh;

  main(scene: THREE.Scene) {
    this.scene = scene;
    const params = this.getAPI();

    this.update(params);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  update(params: any) {
    const { radius, segments, thetaStart, thetaLength } = params;
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new THREE.Mesh(
      new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength),
      new THREE.MeshPhongMaterial({ color: 0x44aa88, side: DoubleSide })
    );
    this.scene.add(this.mesh);
  }
}
