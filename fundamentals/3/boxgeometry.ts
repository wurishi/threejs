import { Demo } from './constant';
import * as THREE from 'three';

export default class extends Demo {
  getAPI() {
    return {
      width: 8,
      height: 8,
      depth: 8,
      widthS: 4,
      heightS: 4,
      depthS: 4,
    };
  }

  scene: THREE.Scene;
  mesh: THREE.Mesh;

  main(scene: THREE.Scene) {
    this.scene = scene;
    const params = this.getAPI();
    const geometry = new THREE.BoxGeometry(
      params.width,
      params.height,
      params.depth,
      params.widthS,
      params.heightS,
      params.depthS
    );
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ color: 0x44aa88 })
    );
    scene.add(this.mesh);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  update(params: any) {
    this.scene.remove(this.mesh);
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        params.width,
        params.height,
        params.depth,
        params.widthS,
        params.heightS,
        params.depthS
      ),
      new THREE.MeshPhongMaterial({ color: 0x44aa88 })
    );
    this.scene.add(this.mesh);
  }
}
