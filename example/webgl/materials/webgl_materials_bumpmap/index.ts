import { Main } from '../../../main';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  Geometry,
  Material,
  Mesh,
  MeshPhongMaterial,
  TextureLoader,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(27, 1, 10000, new Vector3(0, 0, 1200));
  }
  initScene() {
    super.initScene(0x060708, 0, 0, false);
  }

  initPlane() {
    const mapHeight = new TextureLoader().load(
      'Infinite-Level_02_Disp_NoSmoothUV-4096.jpg'
    );

    const material = new MeshPhongMaterial({
      color: 0x552811,
      specular: 0x222222,
      shininess: 25,
      bumpMap: mapHeight,
      bumpScale: 12,
    });

    loader = new GLTFLoader();
    loader.load('LeePerrySmith.glb', (gltf) => {
      this.createScene((gltf.scene.children[0] as any).geometry, 100, material);
    });
  }

  createScene(geometry: Geometry, scale: number, material: Material) {
    mesh = new Mesh(geometry, material);

    mesh.position.y = -50;
    mesh.scale.setScalar(scale);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.add(mesh);
  }
}

let loader: GLTFLoader;
let mesh: Mesh;

new Demo();
