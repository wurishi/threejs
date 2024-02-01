import { Main } from '../../../main';

import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Line,
  LineDashedMaterial,
  LineSegments,
  Vector3,
} from 'three';

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    const subdivisions = 6;
    const recursion = 1;

    const points = GeometryUtils.hilbert3D(
      new Vector3(0, 0, 0),
      25.0,
      recursion,
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

    const samples = spline.getPoints(points.length * subdivisions);
    const geometrySpline = new BufferGeometry().setFromPoints(samples);

    const line = new Line(
      geometrySpline,
      new LineDashedMaterial({
        color: 0xffffff,
        dashSize: 1,
        gapSize: 0.5,
      })
    );
    line.computeLineDistances();

    objects.push(line);

    this.scene.add(line);

    const geometryBox = box(50, 50, 50);
    const lineSegments = new LineSegments(
      geometryBox,
      new LineDashedMaterial({
        color: 0xffaa00,
        dashSize: 3,
        gapSize: 1,
      })
    );
    lineSegments.computeLineDistances();

    objects.push(lineSegments);
    this.scene.add(lineSegments);
  }

  render() {
    const time = Date.now() * 0.001;

    this.scene.traverse((object) => {
      if (object.type.startsWith('Line')) {
        object.rotation.x = 0.25 * time;
        object.rotation.y = 0.25 * time;
      }
    });
  }
}

function box(width: number, height: number, depth: number) {
  width = width * 0.5;
  height = height * 0.5;
  depth = depth * 0.5;

  const geometry = new BufferGeometry();
  const position: number[] = [];

  position.push(
    -width,
    -height,
    -depth,
    -width,
    height,
    -depth,

    -width,
    height,
    -depth,
    width,
    height,
    -depth,

    width,
    height,
    -depth,
    width,
    -height,
    -depth,

    width,
    -height,
    -depth,
    -width,
    -height,
    -depth,

    -width,
    -height,
    depth,
    -width,
    height,
    depth,

    -width,
    height,
    depth,
    width,
    height,
    depth,

    width,
    height,
    depth,
    width,
    -height,
    depth,

    width,
    -height,
    depth,
    -width,
    -height,
    depth,

    -width,
    -height,
    -depth,
    -width,
    -height,
    depth,

    -width,
    height,
    -depth,
    -width,
    height,
    depth,

    width,
    height,
    -depth,
    width,
    height,
    depth,

    width,
    -height,
    -depth,
    width,
    -height,
    depth
  );

  geometry.setAttribute('position', new Float32BufferAttribute(position, 3));

  return geometry;
}

let objects: Line[] = [];

new Demo();
