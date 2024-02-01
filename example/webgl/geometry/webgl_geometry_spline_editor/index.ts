import { Main } from '../../../main';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import {
  BoxBufferGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  GridHelper,
  Line,
  LineBasicMaterial,
  Material,
  Mesh,
  MeshLambertMaterial,
  PlaneBufferGeometry,
  Raycaster,
  ShadowMaterial,
  Vector2,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';

class Demo extends Main {
  params: any = {};
  splinePointsLength: number;
  positions: Vector3[];
  geometry: BoxBufferGeometry;
  splineHelperObjects: Mesh[];
  splines: any;
  ARC_SEGMENTS: number;
  point: Vector3;

  onUpPosition: Vector2;
  onDownPosition: Vector2;
  pointer: Vector2;
  raycaster: Raycaster;

  constructor() {
    super();

    this.params = {
      uniform: true,
      tension: 0.5,
      centripetal: true,
      chordal: true,
      addPoint: () => this.addPoint(),
      removePoint: () => this.removePoint(),
      exportSpline: () => this.exportSpline(),
      switchPoint: () => this.switchPoint(),
    };
  }

  addPoint() {
    this.splinePointsLength++;

    this.positions.push(this.addSplineObject().position);

    this.updateSplineOutline();
  }

  updateSplineOutline() {
    for (const k in this.splines) {
      const spline = this.splines[k];
      const splineMesh = spline.mesh;
      const position = splineMesh.geometry.attributes.position;
      for (let i = 0; i < this.ARC_SEGMENTS; i++) {
        const t = i / (this.ARC_SEGMENTS - 1);
        spline.getPoint(t, this.point);
        position.setXYZ(i, this.point.x, this.point.y, this.point.z);
      }
      position.needsUpdate = true;
    }
  }

  addSplineObject(position?: Vector3) {
    const material = new MeshLambertMaterial({
      color: Math.random() * 0xffffff,
    });
    const object = new Mesh(this.geometry, material);
    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600;
      object.position.z = Math.random() * 800 - 400;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    this.scene.add(object);
    this.splineHelperObjects.push(object);

    this.transformControl.attach(object);
    return object;
  }

  removePoint() {
    if (this.splinePointsLength <= 4) {
      return;
    }
    const point = this.splineHelperObjects.pop();
    this.splinePointsLength--;
    this.positions.pop();
    if (this.transformControl.object === point) {
      this.transformControl.detach();
    }
    this.scene.remove(point);
    this.updateSplineOutline();
  }

  exportSpline() {
    const strplace: string[] = [];
    for (let i = 0; i < this.splinePointsLength; i++) {
      const p = this.splineHelperObjects[i].position;
      strplace.push(`new Vector3(${p.x}, ${p.y}, ${p.z})`);
    }
    console.log(strplace.join(',\n'));
    const code = '[' + strplace.join(',\n\t') + ']';
    prompt('copy and paste code', code);
  }

  tmpIndex = -1;
  switchPoint() {
    // let index = this.splineHelperObjects.findIndex(
    //   (obj) => this.transformControl.object === obj
    // );
    // console.log(index);
    let index = this.tmpIndex || 0;
    if (index >= 0) {
      this.transformControl.detach();
    }
    if (index < 0) {
      index = 0;
    } else if (index >= this.splineHelperObjects.length - 1) {
      index = 0;
    } else {
      index++;
    }
    this.transformControl.attach(this.splineHelperObjects[index]);
    this.tmpIndex = index;
  }

  initRenderer() {
    const p: any = { shadowEnabled: true };
    super.initRenderer(true, p);
  }

  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }

  initCamera() {
    super.initCamera(70, 1, 10000, new Vector3(0, 250, 1000));
    this.scene.add(this.camera);
  }

  initPlane() {
    const planeGeometry = new PlaneBufferGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new ShadowMaterial({ opacity: 0.2 });

    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.position.y = -200;
    plane.receiveShadow = true;
    this.scene.add(plane);

    const helper = new GridHelper(2000, 100);
    helper.position.y = -199;
    (helper.material as Material).opacity = 0.25;
    (helper.material as Material).transparent = true;
    this.scene.add(helper);

    setTimeout(() => {
      this.initGUI();
    }, 10);
  }

  initGUI() {
    this.splinePointsLength = 4;
    this.positions = [];
    this.geometry = new BoxBufferGeometry(20, 20, 20);
    this.splineHelperObjects = [];
    this.splines = {};
    this.ARC_SEGMENTS = 200;
    this.point = new Vector3();

    this.onUpPosition = new Vector2();
    this.onDownPosition = new Vector2();
    this.pointer = new Vector2();
    this.raycaster = new Raycaster();

    const gui = new GUI();
    gui.add(this.params, 'uniform');
    gui
      .add(this.params, 'tension', 0, 1)
      .step(0.01)
      .onChange((value) => {
        this.splines.uniform.tension = value;
        this.updateSplineOutline();
      });
    gui.add(this.params, 'centripetal');
    gui.add(this.params, 'chordal');
    gui.add(this.params, 'addPoint');
    gui.add(this.params, 'removePoint');
    gui.add(this.params, 'exportSpline');
    gui.add(this.params, 'switchPoint');
    gui.open();

    // Curves
    for (let i = 0; i < this.splinePointsLength; i++) {
      this.addSplineObject(this.positions[i]);
    }
    this.positions.length = 0;
    for (let i = 0; i < this.splinePointsLength; i++) {
      this.positions.push(this.splineHelperObjects[i].position);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3)
    );

    let curve: any = new CatmullRomCurve3(this.positions);
    curve.curveType = 'catmullrom';
    curve.mesh = new Line(
      geometry.clone(),
      new LineBasicMaterial({ color: 0xff0000, opacity: 0.35 })
    );
    curve.mesh.castShadow = true;
    this.splines.uniform = curve;

    curve = new CatmullRomCurve3(this.positions);
    curve.curveType = 'centripetal';
    curve.mesh = new Line(
      geometry.clone(),
      new LineBasicMaterial({
        color: 0x00ff00,
        opacity: 0.35,
      })
    );
    curve.mesh.castShadow = true;
    this.splines.centripetal = curve;

    curve = new CatmullRomCurve3(this.positions);
    curve.curveType = 'chordal';
    curve.mesh = new Line(
      geometry.clone(),
      new LineBasicMaterial({
        color: 0x0000ff,
        opacity: 0.35,
      })
    );
    curve.mesh.castShadow = true;
    this.splines.chordal = curve;

    for (const k in this.splines) {
      const spline = this.splines[k];
      this.scene.add(spline.mesh);
    }

    this.load([
      new Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
      new Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
      new Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
      new Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746),
    ]);
  }

  load(new_positions: Vector3[]) {
    while (new_positions.length > this.positions.length) {
      this.addPoint();
    }
    while (new_positions.length < this.positions.length) {
      this.removePoint();
    }
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i].copy(new_positions[i]);
    }
    this.updateSplineOutline();
  }

  transformControl: TransformControls;

  initControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.transformControl = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    controls.enabled = false;
    this.transformControl.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });
    this.scene.add(this.transformControl);

    this.transformControl.addEventListener('objectChange', () => {
      this.updateSplineOutline();
    });
    document.addEventListener(
      'pointerdown',
      (event) => {
        this.onPointerDown(event);
      },
      false
    );
    document.addEventListener(
      'pointerup',
      (event) => {
        this.onPointerUp(event);
      },
      false
    );
    document.addEventListener(
      'pointermove',
      (event) => this.onPointerMove(event),
      false
    );
  }

  render() {
    if (this.splines && this.params) {
      this.splines.uniform.mesh.visible = this.params.uniform;
      this.splines.centripetal.mesh.visible = this.params.centripetal;
      this.splines.chordal.mesh.visible = this.params.chordal;
    }
  }

  onPointerDown(event: MouseEvent) {
    this.onDownPosition.x = event.clientX;
    this.onDownPosition.y = event.clientY;
  }

  onPointerUp(event: MouseEvent) {
    this.onUpPosition.x = event.clientX;
    this.onUpPosition.y = event.clientY;
    if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
      this.transformControl.detach();
    }
  }

  onPointerMove(event: MouseEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.splineHelperObjects
    );
    if (intersects.length > 0) {
      const object = intersects[0].object;
      console.log(object);
      if (object !== this.transformControl.object) {
        this.transformControl.attach(object);
      }
    }
  }
}

new Demo();
