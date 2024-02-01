import { Main } from '../../../main';

import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import {
  DirectionalLight,
  TextureLoader,
  Vector3,
  Mesh,
  Texture,
  Material,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 0.1, 10, new Vector3(0, 0, 2));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initDirLight() {
    const dirLight = new DirectionalLight(0xffeedd);
    dirLight.position.set(0, 0, 2);
    this.scene.add(dirLight);
  }

  initPlane() {
    normal = new TextureLoader().load('models/normal.jpg');
    const loader = new TDSLoader();
    loader.setResourcePath('models/');
    loader.load('models/portalgun.3ds', (object) => {
      object.traverse((child) => {
        if (child.type === 'Mesh') {
          const mesh = child as any;
          mesh.material.specular.setScalar(0.1);
          mesh.material.normalMap = normal;

          list.push(mesh.material);
        }
      });
      this.scene.add(object);
    });

    this.initGUI();
  }

  initGUI() {
    const gui = new GUI();
    const params = {
      normal: true,
    };
    gui.add(params, 'normal').onChange((val) => {
      list.forEach((m) => {
        val ? (m.normalMap = normal) : (m.normalMap = null);
        m.needsUpdate = true;
      });
    });
  }
}

let list: any[] = [];
let normal: Texture;

new Demo();
