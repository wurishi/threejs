import { Main } from '../../../main';

import { NURBSCurve } from 'three/examples/jsm/curves/NURBSCurve';
import { NURBSSurface } from 'three/examples/jsm/curves/NURBSSurface';
import {
  BufferGeometry,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  ParametricBufferGeometry,
  RepeatWrapping,
  TextureLoader,
  Vector3,
  Vector4,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 2000, new Vector3(0, 150, 750));
  }

  // initRenderer() {
  //   super.initRenderer(true, null);
  // }

  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }

  group: Group;
  initPlane() {
    this.group = new Group();
    this.group.position.y = 50;
    this.scene.add(this.group);

    const nurbsControlPoints: Vector4[] = [];
    const nurbsKnots: number[] = [];
    const nurbsDegree = 3;

    for (let i = 0; i <= nurbsDegree; i++) {
      nurbsKnots.push(0);
    }

    for (let i = 0, j = 20; i < j; i++) {
      nurbsControlPoints.push(
        new Vector4(
          Math.random() * 400 - 200,
          Math.random() * 400,
          Math.random() * 400 - 200,
          1
        )
      );

      const knot = (i + 1) / (j - nurbsDegree);
      nurbsKnots.push(MathUtils.clamp(knot, 0, 1));
    }

    const nurbsCurve = new NURBSCurve(
      nurbsDegree,
      nurbsKnots,
      nurbsControlPoints,
      0,
      0
    );

    const nurbsGeometry = new BufferGeometry();
    nurbsGeometry.setFromPoints(nurbsCurve.getPoints(200));

    const nurbsMaterial = new LineBasicMaterial({ color: 0x333333 });

    const nurbsLine = new Line(nurbsGeometry, nurbsMaterial);
    nurbsLine.position.set(200, -100, 0);
    this.group.add(nurbsLine);

    const nurbsControlPointsGeometry = new BufferGeometry();
    nurbsControlPointsGeometry.setFromPoints(
      nurbsControlPoints.map((v) => new Vector3(v.x, v.y, v.z))
    );
    // nurbsControlPointsGeometry.setFromPoints(nurbsCurve.getPoints(200));
    const nurbsControlPointsMaterial = new LineBasicMaterial({
      color: 0x333333,
      opacity: 0.25,
      transparent: true,
    });
    const nurbsControlPointsLine = new Line(
      nurbsControlPointsGeometry,
      nurbsControlPointsMaterial
    );
    nurbsControlPointsLine.position.copy(nurbsLine.position);
    this.group.add(nurbsControlPointsLine);

    // surface

    const nsControlPoints = [
      [
        new Vector4(-200, -200, 100, 1),
        new Vector4(-200, -100, -200, 1),
        new Vector4(-200, 100, 250, 1),
        new Vector4(-200, 200, -100, 1),
      ],
      [
        new Vector4(0, -200, 0, 1),
        new Vector4(0, -100, -100, 5),
        new Vector4(0, 100, 150, 5),
        new Vector4(0, 200, 0, 1),
      ],
      [
        new Vector4(200, -200, -100, 1),
        new Vector4(200, -100, 200, 1),
        new Vector4(200, 100, -250, 1),
        new Vector4(200, 200, 100, 1),
      ],
    ];

    const degree1 = 2;
    const degree2 = 3;
    const knots1 = [0, 0, 0, 1, 1, 1];
    const knots2 = [0, 0, 0, 0, 1, 1, 1, 1];
    const nurbsSurface = new NURBSSurface(
      degree1,
      degree2,
      knots1,
      knots2,
      nsControlPoints
    );

    const map = new TextureLoader().load('uv_grid_opengl.jpg');
    map.wrapS = map.wrapT = RepeatWrapping;
    map.anisotropy = 16;

    function getSurfacePoint(u: number, v: number, target: Vector3) {
      return nurbsSurface.getPoint(u, v, target);
    }

    const geometry = new ParametricBufferGeometry(getSurfacePoint, 20, 20);
    const material = new MeshLambertMaterial({ map, side: DoubleSide });
    const object = new Mesh(geometry, material);
    object.position.set(-200, 100, 0);
    object.scale.multiplyScalar(1);
    this.group.add(object);
  }
}

new Demo();
