import { Main } from '../../../main';

import { Curves } from 'three/examples/jsm/curves/CurveExtras';
import {
  CameraHelper,
  CatmullRomCurve3,
  Curve,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  SphereBufferGeometry,
  TubeBufferGeometry,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

let cameraHelper: CameraHelper, cameraEye: Mesh;

const direction = new Vector3();
const binormal = new Vector3();
const normal = new Vector3();
const position = new Vector3();
const lookAt = new Vector3();

const pipeSpline = new CatmullRomCurve3([
  new Vector3(0, 10, -10),
  new Vector3(10, 0, -10),
  new Vector3(20, 0, 0),
  new Vector3(30, 0, 10),
  new Vector3(30, 0, 20),
  new Vector3(20, 0, 30),
  new Vector3(10, 0, 30),
  new Vector3(0, 0, 30),
  new Vector3(-10, 10, 30),
  new Vector3(-10, 20, 30),
  new Vector3(0, 30, 30),
  new Vector3(10, 30, 30),
  new Vector3(20, 30, 15),
  new Vector3(10, 30, 10),
  new Vector3(0, 30, 10),
  new Vector3(-10, 20, 10),
  new Vector3(-10, 10, 10),
  new Vector3(0, 0, 10),
  new Vector3(10, -10, 10),
  new Vector3(20, -15, 10),
  new Vector3(30, -15, 10),
  new Vector3(40, -15, 10),
  new Vector3(50, -15, 10),
  new Vector3(60, 0, 10),
  new Vector3(70, 0, 0),
  new Vector3(80, 0, 0),
  new Vector3(90, 0, 0),
  new Vector3(100, 0, 0),
]);

const sampleClosedSpline = new CatmullRomCurve3([
  new Vector3(0, -40, -40),
  new Vector3(0, 40, -40),
  new Vector3(0, 140, -40),
  new Vector3(0, 40, 40),
  new Vector3(0, -40, 40),
]);

const splines: { [key: string]: Curve<Vector3> } = {
  GrannyKnot: new Curves.GrannyKnot(),
  HeartCurve: new Curves.HeartCurve(3.5),
  VivianiCurve: new Curves.VivianiCurve(70),
  KnotCurve: new Curves.KnotCurve(),
  HelixCurve: new Curves.HelixCurve(),
  TrefoilKnot: new Curves.TrefoilKnot(),
  TorusKnot: new Curves.TorusKnot(20),
  CinquefoilKnot: new Curves.CinquefoilKnot(20),
  TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot(14),
  FigureEightPolynomialKnot: new Curves.FigureEightPolynomialKnot(),
  DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
  DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
  DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
  DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
  PipeSpline: pipeSpline,
  SampleClosedSpline: sampleClosedSpline,
};

let parent: Object3D, tubeGeometry: TubeBufferGeometry, mesh: Mesh;

const params = {
  spline: 'GrannyKnot',
  scale: 4,
  extrusionSegments: 100,
  radiusSegments: 3,
  closed: true,
  animationView: false,
  lookAhead: false,
  cameraHelper: false,
};

const material = new MeshLambertMaterial({ color: 0xff00ff });
const wireframeMaterial = new MeshBasicMaterial({
  color: 0x000000,
  opacity: 0.3,
  wireframe: true,
  transparent: true,
});

function addTube() {
  if (mesh !== undefined) {
    parent.remove(mesh);
    mesh.geometry.dispose();
  }

  const extrudePath = splines[params.spline];
  tubeGeometry = new TubeBufferGeometry(
    extrudePath,
    params.extrusionSegments,
    2,
    params.radiusSegments,
    params.closed
  );

  addGeometry(tubeGeometry);

  setScale();
}

function setScale() {
  mesh.scale.set(params.scale, params.scale, params.scale);
}

function addGeometry(geometry: TubeBufferGeometry) {
  mesh = new Mesh(geometry, material);
  const wireframe = new Mesh(geometry, wireframeMaterial);
  mesh.add(wireframe);
  parent.add(mesh);
}

function animateCamera() {
  cameraHelper.visible = params.cameraHelper;
  cameraEye.visible = params.cameraHelper;
}

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 0.01, 1000, new Vector3(0, 50, 500));
  }

  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }

  splineCamera: PerspectiveCamera;

  initPlane() {
    parent = new Object3D();
    this.scene.add(parent);

    this.splineCamera = new PerspectiveCamera(
      84,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    parent.add(this.splineCamera);

    cameraHelper = new CameraHelper(this.splineCamera);
    this.scene.add(cameraHelper);

    addTube();

    // debug camera

    cameraEye = new Mesh(
      new SphereBufferGeometry(5),
      new MeshBasicMaterial({ color: 0xdddddd })
    );
    parent.add(cameraEye);

    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.cameraHelper;

    this.initGUI();
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  initGUI() {
    const gui = new GUI({ width: 300 });

    const folderGeometry = gui.addFolder('Geometry');
    folderGeometry
      .add(params, 'spline', Object.keys(splines))
      .onChange(() => addTube());

    folderGeometry
      .add(params, 'scale', 2, 10)
      .step(2)
      .onChange(() => setScale());

    folderGeometry
      .add(params, 'extrusionSegments', 50, 500)
      .step(50)
      .onChange(() => addTube());

    folderGeometry
      .add(params, 'radiusSegments', 2, 12)
      .step(1)
      .onChange(() => addTube());

    folderGeometry.add(params, 'closed').onChange(() => addTube());
    folderGeometry.open();

    const folderCamera = gui.addFolder('Camera');
    folderCamera.add(params, 'animationView').onChange(() => animateCamera());
    folderCamera.add(params, 'lookAhead').onChange(() => animateCamera());
    folderCamera.add(params, 'cameraHelper').onChange(() => animateCamera());
    folderCamera.open();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.render();

    this.stats.update();

    this.renderer.render(
      this.scene,
      params.animationView === true ? this.splineCamera : this.camera
    );
  }

  render() {
    const time = Date.now();
    const looptime = 20 * 1000;
    const t = (time % looptime) / looptime;

    tubeGeometry.parameters.path.getPointAt(t, position);
    position.multiplyScalar(params.scale);

    const segments = tubeGeometry.tangents.length;
    const pickt = t * segments;
    const pick = Math.floor(pickt);
    const pickNext = (pick + 1) % segments;

    binormal.subVectors(
      tubeGeometry.binormals[pickNext],
      tubeGeometry.binormals[pick]
    );
    binormal.multiplyScalar(pickt - pick).add(tubeGeometry.binormals[pick]);

    tubeGeometry.parameters.path.getTangentAt(t, direction);

    const offset = 15;
    normal.copy(binormal).cross(direction);

    // move

    position.add(normal.clone().multiplyScalar(offset));

    this.splineCamera.position.copy(position);
    cameraEye.position.copy(position);

    // look ahead
    tubeGeometry.parameters.path.getPointAt(
      (t + 30 / tubeGeometry.parameters.path.getLength()) % 1,
      lookAt
    );
    lookAt.multiplyScalar(params.scale);

    if (!params.lookAhead) {
      lookAt.copy(position).add(direction);
    }
    this.splineCamera.matrix.lookAt(this.splineCamera.position, lookAt, normal);
    this.splineCamera.quaternion.setFromRotationMatrix(
      this.splineCamera.matrix
    );

    cameraHelper.update();
  }
}

new Demo();
