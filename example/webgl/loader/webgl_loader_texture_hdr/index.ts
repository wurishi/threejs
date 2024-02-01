import { Main } from '../../../main';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  ReinhardToneMapping,
  sRGBEncoding,
  UnsignedByteType,
} from 'three';
import { GUI } from 'dat.gui';

const params = {
  exposure: 2.0,
};

class Demo extends Main {
  initRenderer() {
    super.initRenderer(true, null);
    this.renderer.toneMapping = ReinhardToneMapping;
    this.renderer.toneMappingExposure = params.exposure;

    this.renderer.outputEncoding = sRGBEncoding;
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0, 1);
  }

  initControls() {}

  initPlane() {
    new RGBELoader()
      .setDataType(UnsignedByteType) // alt: FloatType, HalfFloatType
      .load('memorial.hdr', (...args) => {
        const [texture, textureData] = args as any[];

        const material = new MeshBasicMaterial({ map: texture });
        const quad = new PlaneGeometry(
          (1.5 * textureData.width) / textureData.height,
          1.5
        );
        const mesh = new Mesh(quad, material);
        this.scene.add(mesh);
      });

    const gui = new GUI();
    gui.add(params, 'exposure', 0, 4, 0.01);
  }

  onWindowResize() {
    super.onWindowResize();

    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = camera.top - camera.bottom;

    camera.left = (-frustumHeight * aspect) / 2;
    camera.right = (frustumHeight * aspect) / 2;
    camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.toneMappingExposure = params.exposure;
    this.renderer.render(this.scene, camera);
  }
}

let camera: OrthographicCamera;

new Demo();
