import {
  Color,
  DoubleSide,
  FontLoader,
  Group,
  Mesh,
  MeshBasicMaterial,
  Path,
  ShapeBufferGeometry,
  Vector3,
} from 'three';
import { Main } from '../../../main';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 10000, new Vector3(0, -400, 600));
  }
  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }
  initPlane() {
    const loader = new FontLoader();
    loader.load('droid_sans_regular.typeface.json', (font) => {
      const color = new Color(0x006699);
      const matDark = new MeshBasicMaterial({
        color,
        side: DoubleSide,
      });
      const matLite = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        side: DoubleSide,
      });

      const message = 'Three.js\nStroke text.';
      const shapes = font.generateShapes(message, 100);
      const geometry = new ShapeBufferGeometry(shapes);
      geometry.computeBoundingBox();

      const xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

      geometry.translate(xMid, 0, 0);

      const text = new Mesh(geometry, matLite);
      text.position.z = -150;
      this.scene.add(text);

      const holeShapes: Path[] = [];

      shapes.forEach((shape) => {
        if (shape.holes && shape.holes.length > 0) {
          shape.holes.forEach((hole) => holeShapes.push(hole));
        }
      });
      shapes.push.apply(shapes, holeShapes);

      const style = SVGLoader.getStrokeStyle(5, color.getStyle());
      const strokeText = new Group();
      shapes.forEach((shape) => {
        const points = shape.getPoints().map((p) => new Vector3(p.x, p.y));
        const geometry = SVGLoader.pointsToStroke(points, style);
        geometry.translate(xMid, 0, 0);

        const strokeMesh = new Mesh(geometry, matDark);
        strokeText.add(strokeMesh);
      });
      this.scene.add(strokeText);
    });
  }
}

new Demo();
