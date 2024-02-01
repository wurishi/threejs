import { Main } from '../main';
import { PeppersGhostEffect } from 'three/examples/jsm/effects/PeppersGhostEffect';
import * as THREE from 'three';

let group: THREE.Group;
let effect: PeppersGhostEffect;

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 1, 100000, new THREE.Vector3(), new THREE.Vector3());
  }

  initPlane() {
    group = new THREE.Group();
    this.scene.add(group);

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1).toNonIndexed();
    const position = geometry.attributes.position;
    const colors: number[] = [];
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i += 6) {
      color.setHex(Math.random() * 0xffffff);

      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);

      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });
    for (let i = 0; i < 10; i++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
      cube.scale.multiplyScalar(Math.random() + 0.5);
      group.add(cube);
    }

    effect = new PeppersGhostEffect(this.renderer);
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.cameraDistance = 5;
  }

  onWindowResize() {
    super.onWindowResize();
    effect.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    group.rotation.y += 0.01;

    effect.render(this.scene, this.camera);

    this.stats.update();
  }
}

new Demo();
