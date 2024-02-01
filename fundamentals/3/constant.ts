import * as THREE from 'three';

export class Demo implements Demo1 {
  main(scene: THREE.Scene): void {
    throw new Error('Method not implemented.');
  }
  getAPI(): any {
    throw new Error('Method not implemented.');
  }
  update(params: any): void {
    throw new Error('Method not implemented.');
  }
  addDirLight(scene: THREE.Scene) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  createMaterial() {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    });
    const hue = Math.random();
    material.color.setHSL(hue, 1, 0.5);
    return material;
  }
}

interface Demo1 {
  main(scene: THREE.Scene): void;
  getAPI(): any;
  update(params: any): void;
}
