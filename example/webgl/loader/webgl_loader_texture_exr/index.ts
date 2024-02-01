import { Main } from '../../../main';

import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import {
  FloatType,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  ReinhardToneMapping,
  sRGBEncoding,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';

const params = {
  exposure: 2,
};

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0, 1);

    new EXRLoader().setDataType(FloatType).load('memorial.exr', (...arg) => {
      const [texture, textureData] = arg as any[];

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

  initControls() {
    // const controls = new OrbitControls(camera, this.renderer.domElement);
    // controls.update();
  }

  initRenderer() {
    super.initRenderer(true, null);
    this.renderer.toneMapping = ReinhardToneMapping;
    this.renderer.toneMappingExposure = params.exposure;

    this.renderer.outputEncoding = sRGBEncoding;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.renderer.toneMappingExposure = params.exposure;

    this.renderer.render(this.scene, camera);

    this.stats.update();
  }
}

let camera: OrthographicCamera;

new Demo();
