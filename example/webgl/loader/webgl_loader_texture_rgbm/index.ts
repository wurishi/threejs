import { GUI } from 'dat.gui';
import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  ReinhardToneMapping,
  RGBM16Encoding,
  sRGBEncoding,
} from 'three';
import { Main } from '../../../main';
import { RGBMLoader } from './RGBMLoader';

const params = {
  exposure: 2,
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
    super.initCamera();

    const aspect = window.innerWidth / window.innerHeight;
    camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0, 1);
  }

  initPlane() {
    new RGBMLoader().load('memorial.png', (texture) => {
      texture.encoding = RGBM16Encoding;

      const material = new MeshBasicMaterial({ map: texture });
      const quad = new PlaneGeometry(1, 1.5);

      const mesh = new Mesh(quad, material);
      // mesh.rotation.y = Math.PI / 100;
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

  animate() {
    requestAnimationFrame(() => this.animate());

    this.renderer.toneMappingExposure = params.exposure;

    this.renderer.render(this.scene, camera);

    this.stats.update();
  }
}

let camera: OrthographicCamera;

new Demo();
