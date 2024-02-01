import { Main } from '../../../main';

import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader';
import {
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  sRGBEncoding,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 0.1, 100, new Vector3(0, 0, 1));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    this.camera.lookAt(this.scene.position);

    const geometry = flipY(new PlaneBufferGeometry());
    const material = new MeshBasicMaterial({ side: DoubleSide });

    const mesh = new Mesh(geometry, material);

    this.scene.add(mesh);

    const loader = new BasisTextureLoader();
    loader.detectSupport(this.renderer);
    loader.load('canestra_di_frutta_caravaggio.basis', (texture) => {
      (texture as any).encoding = sRGBEncoding;

      material.map = texture;
      material.needsUpdate = true;
    });
  }
}

function flipY(geometry: BufferGeometry) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setY(i, 1 - uv.getY(i));
  }
  return geometry;
}

new Demo();
