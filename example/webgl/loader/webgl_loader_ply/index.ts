import { Main } from '../../../main';

import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import {
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(35, 1, 15, new Vector3(3, 0.15, 3));
  }

  initScene() {
    super.initScene(0x72645b, 2, 15);
  }

  initHemiLight() {}
  initDirLight() {}

  initPlane() {
    const plane = new Mesh(
      new PlaneGeometry(40, 40),
      new MeshPhongMaterial({
        color: 0x999999,
        specular: 0x101010,
      })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    this.scene.add(plane);

    plane.receiveShadow = true;

    const loader = new PLYLoader();
    loader.load('dolphins.ply', (geometry) => {
      geometry.computeVertexNormals();

      const material = new MeshStandardMaterial({
        color: 0x0055ff,
        flatShading: true,
      });
      const mesh = new Mesh(geometry, material);
      mesh.position.y = -0.2;
      mesh.position.z = 0.3;
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.multiplyScalar(0.001);

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.scene.add(mesh);
    });

    loader.load('Lucy100k.ply', (geometry) => {
      geometry.computeVertexNormals();

      const material = new MeshStandardMaterial({
        color: 0x0055ff,
        flatShading: true,
      });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(-0.2, -0.02, -0.2);
      mesh.scale.multiplyScalar(0.0006);

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.scene.add(mesh);
    });

    addShadowedLight(this.scene, 1, 1, 1, 0xffffff, 1.35);
    addShadowedLight(this.scene, 0.5, 1, -1, 0xffaa00, 1);
  }
}

function addShadowedLight(
  scene: Scene,
  x: number,
  y: number,
  z: number,
  color: number,
  intensity: number
) {
  const dirLight = new DirectionalLight(color, intensity);
  dirLight.position.set(x, y, z);
  scene.add(dirLight);

  dirLight.castShadow = true;

  const d = 1;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 4;

  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;

  dirLight.shadow.bias = -0.001;
}

new Demo();
