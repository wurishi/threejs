import {
  CubeTextureLoader,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Texture,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 1, 100000, new Vector3(0, 0, 3200));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
    this.scene.background = new CubeTextureLoader().load([
      'px.png',
      'nx.png',
      'py.png',
      'ny.png',
      'pz.png',
      'nz.png',
    ]);
  }
  initPlane() {
    const geometry = new SphereGeometry(100, 32, 16);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      envMap: this.scene.background as Texture,
    });
    for (let i = 0; i < 500; i++) {
      const mesh = new Mesh(geometry, material);

      mesh.position.set(
        Math.random() * 10000 - 5000,
        Math.random() * 10000 - 5000,
        Math.random() * 10000 - 5000
      );

      mesh.scale.setScalar(Math.random() * 3 + 1);
      // mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

      this.scene.add(mesh);

      spheres.push(mesh);
    }
  }

  render() {
    const timer = 0.0001 * Date.now();

    spheres.forEach((sphere, i) => {
      sphere.position.x = 5000 * Math.cos(timer + i);
      sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
    });
  }
}

const spheres: Mesh[] = [];

new Demo();
