import { Main } from '../../../main';

import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Material,
  Vector3,
} from 'three';

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    const hilbertPoints = GeometryUtils.hilbert3D(
      new Vector3(0, 0, 0),
      200,
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

    const geometry1 = new BufferGeometry();
    const geometry2 = new BufferGeometry();
    const geometry3 = new BufferGeometry();

    const subdivisions = 6;

    let vertices: number[] = [];
    let colors1: number[] = [];
    let colors2: number[] = [];
    let colors3: number[] = [];

    const point = new Vector3();
    const color = new Color();

    const spline = new CatmullRomCurve3(hilbertPoints);

    for (let i = 0; i < hilbertPoints.length * subdivisions; i++) {
      const t = i / (hilbertPoints.length * subdivisions);
      spline.getPoint(t, point);

      vertices.push(point.x, point.y, point.z);

      color.setHSL(0.6, 1.0, Math.max(0, -point.x / 200) + 0.5);
      colors1.push(color.r, color.g, color.b);

      color.setHSL(0.9, 1.0, Math.max(0, -point.y / 200) + 0.5);
      colors2.push(color.r, color.g, color.b);

      color.setHSL(i / (hilbertPoints.length * subdivisions), 1.0, 0.5);
      colors3.push(color.r, color.g, color.b);
    }

    geometry1.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry2.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry3.setAttribute('position', new Float32BufferAttribute(vertices, 3));

    geometry1.setAttribute('color', new Float32BufferAttribute(colors1, 3));
    geometry2.setAttribute('color', new Float32BufferAttribute(colors2, 3));
    geometry3.setAttribute('color', new Float32BufferAttribute(colors3, 3));

    //
    const geometry4 = new BufferGeometry();
    const geometry5 = new BufferGeometry();
    const geometry6 = new BufferGeometry();

    vertices = [];
    colors1 = [];
    colors2 = [];
    colors3 = [];

    for (let i = 0; i < hilbertPoints.length; i++) {
      const point = hilbertPoints[i];

      vertices.push(point.x, point.y, point.z);

      color.setHSL(
        0.6,
        1,
        Math.max(0, (200 - hilbertPoints[i].x) / 400) * 0.5 + 0.5
      );
      colors1.push(color.r, color.g, color.b);

      color.setHSL(
        0.3,
        1.0,
        Math.max(0, (200 + hilbertPoints[i].x) / 400) * 0.5
      );
      colors2.push(color.r, color.g, color.b);

      color.setHSL(i / hilbertPoints.length, 1.0, 0.5);
      colors3.push(color.r, color.g, color.b);
    }

    geometry4.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry5.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry6.setAttribute('position', new Float32BufferAttribute(vertices, 3));

    geometry4.setAttribute('color', new Float32BufferAttribute(colors1, 3));
    geometry5.setAttribute('color', new Float32BufferAttribute(colors2, 3));
    geometry6.setAttribute('color', new Float32BufferAttribute(colors3, 3));

    // create lines

    const material = new LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
    });

    const scale = 0.3,
      d = 255;

    const createLine = (
      material: Material,
      scale: number,
      pos: Vector3,
      geometry: BufferGeometry
    ) => {
      const line = new Line(geometry, material);
      line.scale.x = line.scale.y = line.scale.z = scale;
      line.position.copy(pos);
      this.scene.add(line);
    };

    createLine(material, scale * 1.5, new Vector3(-d, -d / 2, 0), geometry1);
    createLine(material, scale * 1.5, new Vector3(0, -d / 2, 0), geometry2);
    createLine(material, scale * 1.5, new Vector3(d, -d / 2, 0), geometry3);
    createLine(material, scale * 1.5, new Vector3(-d, d / 2, 0), geometry4);
    createLine(material, scale * 1.5, new Vector3(0, d / 2, 0), geometry5);
    createLine(material, scale * 1.5, new Vector3(d, d / 2, 0), geometry6);
  }

  render() {
    const time = Date.now() * 0.0005;

    this.scene.children.forEach((object, i) => {
      if (object.type === 'Line') {
        object.rotation.y = time * (i % 2 ? 1 : -1);
      }
    });
  }
}

new Demo();
