import { Main } from '../../../main';

import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initCamera() {
    super.initCamera(40, 1, 1000, new Vector3(-40, 0, 60));

    camera2 = new PerspectiveCamera(40, 1, 1, 1000);
    camera2.position.copy(this.camera.position);
  }

  initPlane() {
    const positions: number[] = [];
    const colors: number[] = [];

    const points = GeometryUtils.hilbert3D(
      new Vector3(0, 0, 0),
      20,
      1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7
    );
    const spline = new CatmullRomCurve3(points);
    const divisions = Math.round(12 * points.length);
    const point = new Vector3();
    const color = new Color();

    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l;

      spline.getPoint(t, point);
      positions.push(point.x, point.y, point.z);

      color.setHSL(t, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }

    // line2
    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 5,
      vertexColors: true,
      dashed: false,
    });

    line = new Line2(geometry, matLine);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);
    line.visible = false;
    this.scene.add(line);

    // line
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));

    matLineBasic = new LineBasicMaterial({ vertexColors: true });
    matLineDashed = new LineDashedMaterial({
      vertexColors: true,
      scale: 2,
      dashSize: 1,
      gapSize: 1,
    });
    line1 = new Line(geo, matLineBasic);
    line1.computeLineDistances();
    // line1.visible = false;
    this.scene.add(line1);

    this.initGUI();
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
            line.visible = true;
            line1.visible = false;
            break;
          case '1':
            line.visible = false;
            line1.visible = true;
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

      line1.material = val ? matLineDashed : matLineBasic;
    });

    gui.add(param, 'dash scale', 0.5, 2, 0.1).onChange((val) => {
      matLine.dashScale = val;
      matLineDashed.scale = val;
    });

    gui
      .add(param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 })
      .onChange((val) => {
        switch (val) {
          case '0':
            matLine.dashSize = 2;
            matLine.gapSize = 1;

            matLineDashed.dashSize = 2;
            matLineDashed.gapSize = 1;
            break;

          case '1':
            matLine.dashSize = 1;
            matLine.gapSize = 1;
            matLineDashed.dashSize = 1;
            matLineDashed.gapSize = 1;
            break;

          case '2':
            matLine.dashSize = 1;
            matLine.gapSize = 2;
            matLineDashed.dashSize = 1;
            matLineDashed.gapSize = 2;
            break;
        }
      });

    gui.open();
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

    const insetWidth = window.innerHeight / 4;
    const insetHeight = window.innerHeight / 4;

    this.stats.update();

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

    // 缺少这行会导致LineGeometry卡顿
    // matLine.resolution.set(window.innerWidth, window.innerHeight);

    this.renderer.render(this.scene, this.camera);

    // inset scene
    this.renderer.setClearColor(0x222222, 1);
    this.renderer.clearDepth();

    this.renderer.setScissorTest(true);
    this.renderer.setScissor(20, 20, insetWidth, insetHeight);
    this.renderer.setViewport(20, 20, insetWidth, insetHeight);

    camera2.position.copy(this.camera.position);
    camera2.quaternion.copy(this.camera.quaternion);

    matLine.resolution.set(insetWidth, insetHeight);

    this.renderer.render(this.scene, camera2);
    this.renderer.setScissorTest(false);
  }
}

let matLine: LineMaterial;
let line: Line2;
let camera2: PerspectiveCamera;
let matLineBasic: LineBasicMaterial;
let matLineDashed: LineDashedMaterial;
let line1: Line;
let insetWidth = 0;
let insetHeight = 0;

new Demo();
