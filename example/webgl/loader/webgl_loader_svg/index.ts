import { Main } from '../../../main';

import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import {
  Color,
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShapeGeometry,
  ShapePath,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

const guiData = {
  currentURL: 'tiger.svg',
  drawFillShapes: true,
  drawStrokes: true,
  fillShapesWireframe: false,
  strokesWireframe: false,
};

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 1000, new Vector3(0, 0, 200));
  }

  initScene() {
    super.initScene(0xb0b0b0, 0, 0, false);
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  initPlane() {
    const helper = new GridHelper(160, 10);
    helper.rotation.x = Math.PI / 2;
    this.scene.add(helper);

    this.initGUI();
  }

  initGUI() {
    const gui = new GUI({ width: 300 });

    const update = () => {
      this.loadSVG(guiData.currentURL);
    };

    gui
      .add(guiData, 'currentURL', {
        Tiger: 'tiger.svg',
        'Three.js': 'threejs.svg',
        'Joins and caps': 'lineJoinsAndCaps.svg',
        Line: 'line.svg',
        Hexagon: 'hexagon.svg',
        'Test 1': 'tests/1.svg',
        'Test 2': 'tests/2.svg',
        'Test 3': 'tests/3.svg',
        'Test 4': 'tests/4.svg',
        'Test 5': 'tests/5.svg',
        'Test 6': 'tests/6.svg',
        'Test 7': 'tests/7.svg',
        'Test 8': 'tests/8.svg',
        Units: 'tests/units.svg',
        Defs: 'tests/testDefs/Svg-defs.svg',
        Defs2: 'tests/testDefs/Svg-defs2.svg',
        Defs3: 'tests/testDefs/Wave-defs.svg',
        Defs4: 'tests/testDefs/defs4.svg',
        'Zero Radius': 'zero-radius.svg',
      })
      .name('SVG File')
      .onChange(update);

    gui.add(guiData, 'drawStrokes').name('Draw strokes').onChange(update);
    gui
      .add(guiData, 'drawFillShapes')
      .name('Draw fill shapes')
      .onChange(update);
    gui
      .add(guiData, 'strokesWireframe')
      .name('Wireframe strokes')
      .onChange(update);
    gui
      .add(guiData, 'fillShapesWireframe')
      .name('Wireframe fill shapes')
      .onChange(update);

    this.loadSVG(guiData.currentURL);
  }

  loadSVG(url: string) {
    if (group) {
      this.scene.remove(group);
      group = null;
    }

    const loader = new SVGLoader();
    loader.load(url, (data) => {
      const paths = data.paths;

      group = new Group();
      group.scale.multiplyScalar(0.25);
      group.position.set(-70, 70, 0);
      group.scale.y *= -1;

      paths.forEach((path: MyPath) => {
        const fillColor = path.userData.style.fill;
        if (
          guiData.drawFillShapes &&
          fillColor !== undefined &&
          fillColor !== 'none'
        ) {
          const material = new MeshBasicMaterial({
            color: new Color().setStyle(fillColor),
            opacity: path.userData.style.fillOpacity,
            transparent: path.userData.style.fillOpacity < 1,
            side: DoubleSide,
            depthWrite: false,
            wireframe: guiData.fillShapesWireframe,
          });

          const shapes = path.toShapes(true);

          shapes.forEach((shape) => {
            const geometry = new ShapeGeometry(shape);
            const mesh = new Mesh(geometry, material);

            group.add(mesh);
          });
        }

        const strokeColor = path.userData.style.stroke;
        if (
          guiData.drawStrokes &&
          strokeColor !== undefined &&
          strokeColor !== 'none'
        ) {
          const material = new MeshBasicMaterial({
            color: new Color().setStyle(strokeColor),
            opacity: path.userData.style.strokeOpacity,
            transparent: path.userData.style.strokeOpacity < 1,
            side: DoubleSide,
            depthWrite: false,
            wireframe: guiData.strokesWireframe,
          });

          path.subPaths.forEach((subPath) => {
            const geometry = SVGLoader.pointsToStroke(
              subPath.getPoints(),
              path.userData.style as any
            );
            if (geometry) {
              const mesh = new Mesh(geometry, material);
              group.add(mesh);
            }
          });
        }
      });

      this.scene.add(group);
    });
  }
}

type MyPath = ShapePath & {
  userData: {
    style: {
      fill?: string;
      fillOpacity: number;
      stroke?: string;
      strokeOpacity: number;
    };
  };
};

let group: Group;

new Demo();
