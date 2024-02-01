import { Main } from '../../../main';

import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';
import { WireframeGeometry2 } from 'three/examples/jsm/lines/WireframeGeometry2';
import {
  BufferGeometry,
  IcosahedronBufferGeometry,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  PerspectiveCamera,
  Vector3,
  WireframeGeometry,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initCamera() {
    super.initCamera(40, 1, 1000, new Vector3(-50, 0, 50));

    camera2 = new PerspectiveCamera(40, 1, 1, 1000);
    camera2.position.copy(this.camera.position);
  }

  initPlane() {
    // wireframe
    let geo: BufferGeometry = new IcosahedronBufferGeometry(20, 1);
    const geometry = new WireframeGeometry2(geo);

    matLine = new LineMaterial({
      color: 0x4080ff,
      linewidth: 5,
      dashed: false,
    });

    wireframe = new Wireframe(geometry, matLine);
    wireframe.computeLineDistances();
    wireframe.scale.set(1, 1, 1);
    wireframe.visible = false;
    this.scene.add(wireframe);

    // Line
    geo = new WireframeGeometry(geo);

    matLineBasic = new LineBasicMaterial({ color: 0x4080ff });
    matLineDashed = new LineDashedMaterial({
      color: 0x4080ff,
      scale: 2,
      dashSize: 1,
      gapSize: 1,
    });

    wireframe1 = new LineSegments(geo, matLineBasic);
    wireframe1.computeLineDistances();
    wireframe1.visible = true;
    this.scene.add(wireframe1);

    this.initGUI();
  }

  onWindowResize() {
    super.onWindowResize();
    insetWidth = window.innerHeight / 4;
    insetHeight = window.innerHeight / 4;

    camera2.aspect = insetWidth / insetHeight;
    camera2.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.stats.update();

    // main scene

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

    // 不设置会导致WireframeGeometry2卡顿
    matLine.resolution.set(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);

    // inset scene
    this.renderer.setClearColor(0x222222, 1);
    this.renderer.clearDepth(); // important
    this.renderer.setScissorTest(true);
    this.renderer.setScissor(20, 20, insetWidth, insetHeight);
    this.renderer.setViewport(20, 20, insetWidth, insetHeight);

    camera2.position.copy(this.camera.position);
    camera2.quaternion.copy(this.camera.quaternion);

    matLine.resolution.set(insetWidth, insetHeight);

    this.renderer.render(this.scene, camera2);
    this.renderer.setScissorTest(false);
  }

  initGUI() {
    const gui = new GUI();

    const param = {
      'line type': 1,
      'width (px)': 5,
      dashed: false,
      'dash scale': 1,
      'dash / gap': 1,
    };

    gui
      .add(param, 'line type', { LineGeometry: 0, 'gl.LINE': 1 })
      .onChange((val) => {
        switch (val) {
          case '0':
            wireframe.visible = true;
            wireframe1.visible = false;
            break;
          case '1':
            wireframe.visible = false;
            wireframe1.visible = true;
            break;
        }
      });

    gui
      .add(param, 'width (px)', 1, 10)
      .onChange((val) => (matLine.linewidth = val));

    gui.add(param, 'dashed').onChange((val) => {
      matLine.dashed = val;

      val ? (matLine.defines.USE_DASH = '') : delete matLine.defines.USE_DASH;
      matLine.needsUpdate = true;

      wireframe1.material = val ? matLineDashed : matLineBasic;
    });

    gui.add(param, 'dash scale', 0.5, 1, 0.1).onChange((val) => {
      matLine.dashScale = val;
      matLineDashed.scale = val;
    });

    gui
      .add(param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 })
      .onChange((val) => {
        switch (val) {
          case '0':
            matLine.dashSize = matLineDashed.dashSize = 2;
            matLine.gapSize = matLineDashed.gapSize = 1;
            break;
          case '1':
            matLine.dashSize = matLineDashed.dashSize = 1;
            matLine.gapSize = matLineDashed.gapSize = 1;
            break;
          case '2':
            matLine.dashSize = matLineDashed.dashSize = 1;
            matLine.gapSize = matLineDashed.gapSize = 2;
            break;
        }
      });
  }
}

let camera2: PerspectiveCamera;

let matLine: LineMaterial;
let wireframe: Wireframe;
let wireframe1: LineSegments;

let matLineBasic: LineBasicMaterial;
let matLineDashed: LineDashedMaterial;

let insetWidth = window.innerHeight / 4;
let insetHeight = window.innerHeight / 4;

new Demo();
