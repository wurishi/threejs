import { Main } from '../../../main';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper';
import {
  Material,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  UnsignedByteType,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 0.25, 20);
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    const pmremGenerator = new PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setDataType(UnsignedByteType)
      .load('royal_esplanade_1k.hdr', (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        this.scene.background = envMap;
        this.scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();

        // model
        const roughnessMipmapper = new RoughnessMipmapper(this.renderer);
        const loader = new GLTFLoader().setPath('gltf/');
        loader.load('DamagedHelmet.gltf', (gltf) => {
          gltf.scene.traverse((child) => {
            // if (child.type === 'Mesh') {
            //   const mesh = child as Mesh;
            //   roughnessMipmapper.generateMipmaps(
            //     mesh.material as MeshStandardMaterial
            //   );
            // }
          });
          this.scene.add(gltf.scene);

          roughnessMipmapper.dispose();
        });
      });
  }
}

new Demo();
