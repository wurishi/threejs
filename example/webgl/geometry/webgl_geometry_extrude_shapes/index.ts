import { Main } from '../../../main';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import {
  CatmullRomCurve3,
  ExtrudeBufferGeometry,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  Shape,
  Vector2,
  Vector3,
} from 'three';

class Demo extends Main {
  controls: TrackballControls;

  // initRenderer() {
  //   super.initRenderer(true, null);
  // }

  initScene() {
    super.initScene(0x222222, 0, 0, false);
  }

  initControls() {
    this.controls = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.minDistance = 200;
    this.controls.maxDistance = 500;
  }

  initPlane() {
    const closedSpline = new CatmullRomCurve3([
      new Vector3(-60, -100, 60),
      new Vector3(-60, 20, 60),
      new Vector3(-60, 120, 60),
      new Vector3(60, 20, -60),
      new Vector3(60, -100, -60),
    ]);

    const extrudeSettings1 = {
      steps: 100,
      bevelEnabled: false,
      extrudePath: closedSpline,
    };

    const pts1 = [],
      count = 3;
    for (let i = 0; i < count; i++) {
      const l = 20;
      const a = ((2 * i) / count) * Math.PI;
      pts1.push(new Vector2(Math.cos(a) * l, Math.sin(a) * l));
    }

    const shape1 = new Shape(pts1);
    const geometry1 = new ExtrudeBufferGeometry(shape1, extrudeSettings1);
    const material1 = new MeshLambertMaterial({
      color: 0xb00000,
      wireframe: false,
    });
    const mesh1 = new Mesh(geometry1, material1);

    this.scene.add(mesh1);

    //
    const randomPoints = [];
    for (let i = 0; i < 10; i++) {
      randomPoints.push(
        new Vector3(
          (i - 4.5) * 50,
          MathUtils.randFloat(-50, 50),
          MathUtils.randFloat(-50, 50)
        )
      );
    }
    const randomSpline = new CatmullRomCurve3(randomPoints);

    //
    const extrudeSettings2 = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: randomSpline,
    };

    const pts2 = [],
      numPts = 5;
    for (let i = 0; i < numPts * 2; i++) {
      const l = i % 2 == 1 ? 10 : 20;
      const a = (i / numPts) * Math.PI;
      pts2.push(new Vector2(Math.cos(a) * l, Math.sin(a) * l));
    }
    const shape2 = new Shape(pts2);
    const geometry2 = new ExtrudeBufferGeometry(shape2, extrudeSettings2);
    const material2 = new MeshLambertMaterial({
      color: 0xff8000,
      wireframe: false,
    });
    const mesh2 = new Mesh(geometry2, material2);
    this.scene.add(mesh2);

    //

    const materials = [material1, material2];
    const geometry3 = new ExtrudeBufferGeometry(shape2, {
      depth: 20,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 4,
      bevelSegments: 1,
    });
    const mesh3 = new Mesh(geometry3, materials);
    mesh3.position.set(50, 100, 50);
    this.scene.add(mesh3);
  }

  render() {
    this.controls.update();
  }
}

new Demo();
