import { Main } from '../../../main';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import {
  LoadingManager,
  Mesh,
  Object3D,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(0, 0, 250));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loadModel = () => {
      object.traverse((child: any) => {
        if (child.material) {
          child.material.map = texture;
        }
      });

      object.position.y = -95;
      this.scene.add(object);
    };

    const manager = new LoadingManager(loadModel);

    const textureLoader = new TextureLoader(manager);
    texture = textureLoader.load('uv_grid_opengl.jpg');

    const loader = new OBJLoader(manager);
    loader.load('male02.obj', (obj) => {
      object = obj;
    });
  }
}

let object: Object3D;
let texture: Texture;

new Demo();
