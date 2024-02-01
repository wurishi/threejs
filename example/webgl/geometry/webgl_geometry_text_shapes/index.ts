import {
  BufferGeometry,
  DoubleSide,
  FontLoader,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  ShapeBufferGeometry,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }
  initPlane() {
    const loader = new FontLoader();
    loader.load('droid_sans_regular.typeface.json', (font) => {
      const color = 0x006699;
      const matDark = new LineBasicMaterial({ color, side: DoubleSide });
      const matLite = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        side: DoubleSide,
      });

      const message = 'Three.js\nSimple Text.';

      const shapes = font.generateShapes(message, 100);

      const geometry = new ShapeBufferGeometry(shapes);
      geometry.computeBoundingBox();

      const xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      geometry.translate(xMid, 0, 0);

      const text = new Mesh(geometry, matLite);
      text.position.z = -150;
      this.scene.add(text);

      const holeShapes = [];
      for (let i = 0, len = shapes.length; i < len; i++) {
        const shape = shapes[i];
        if (shape.holes && shape.holes.length > 0) {
          for (let j = 0, jlen = shape.holes.length; j < jlen; j++) {
            const hole = shape.holes[j];
            holeShapes.push(hole);
          }
        }
      }
      shapes.push.apply(shapes, holeShapes);

      const lineText = new Object3D();

      for (let i = 0, len = shapes.length; i < len; i++) {
        const shape = shapes[i];
        const points = shape.getPoints();
        const geometry = new BufferGeometry().setFromPoints(points);
        geometry.translate(xMid, 0, 0);

        const lineMesh = new Line(geometry, matDark);
        lineText.add(lineMesh);
      }
      this.scene.add(lineText);
    });
  }
}

new Demo();
