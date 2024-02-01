import {
  BufferGeometry,
  DoubleSide,
  ExtrudeBufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  Path,
  Points,
  PointsMaterial,
  RepeatWrapping,
  Shape,
  ShapeBufferGeometry,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  texture: Texture;
  group: Group;

  initScene() {
    super.initScene(0xf0f0f, 0, 0, false);
  }

  initCamera() {
    super.initCamera(50, 1, 10000, new Vector3(0, 150, 500));
    this.scene.add(this.camera);
  }

  initPlane() {
    const texture = new TextureLoader().load('uv_grid_opengl.jpg');
    texture.wrapT = texture.wrapS = RepeatWrapping;
    texture.repeat.set(0.008, 0.008);
    this.texture = texture;

    const group = new Group();
    group.position.y = 50;
    this.scene.add(group);
    this.group = group;

    const californiaPts: Vector2[] = [];
    const tmp = [
      610,
      320,
      450,
      300,
      392,
      392,
      266,
      438,
      190,
      570,
      190,
      600,
      160,
      620,
      160,
      650,
      180,
      640,
      165,
      680,
      150,
      670,
      90,
      737,
      80,
      795,
      50,
      835,
      64,
      870,
      60,
      945,
      300,
      945,
      300,
      743,
      600,
      473,
      626,
      425,
      600,
      370,
      610,
      320,
    ];
    for (let i = 0, len = tmp.length; i < len; i += 2) {
      californiaPts.push(new Vector2(tmp[i], tmp[i + 1]).multiplyScalar(0.25));
    }

    const californiaShape = new Shape(californiaPts);

    // triangle
    const triangleShape = new Shape()
      .moveTo(80, 20)
      .lineTo(40, 80)
      .lineTo(120, 80)
      .lineTo(80, 20);

    // Heart

    const x = 0,
      y = 0;
    const heartShape = new Shape()
      .moveTo(x + 25, y + 25)
      .bezierCurveTo(x + 25, y + 25, x + 20, y, x, y)
      .bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35)
      .bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95)
      .bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35)
      .bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y)
      .bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

    // Square
    const sqLength = 80;
    const squareShape = new Shape()
      .moveTo(0, 0)
      .lineTo(0, sqLength)
      .lineTo(sqLength, sqLength)
      .lineTo(sqLength, 0)
      .lineTo(0, 0);

    // Rounded rectangle

    const roundedRectShape = new Shape();
    (function roundedRect(
      ctx: Shape,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y + height - radius);
      ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
      ctx.lineTo(x + width - radius, y + height);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width,
        y + height - radius
      );
      ctx.lineTo(x + width, y + radius);
      ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.quadraticCurveTo(x, y, x, y + radius);
    })(roundedRectShape, 0, 0, 50, 50, 20);

    // Track
    const trackShape = new Shape()
      .moveTo(40, 40)
      .lineTo(40, 160)
      .absarc(60, 160, 20, Math.PI, 0, true)
      .lineTo(80, 40)
      .absarc(60, 40, 20, 2 * Math.PI, Math.PI, true);

    // Circle
    const circleRadius = 40;
    const circleShape = new Shape()
      .moveTo(0, circleRadius)
      .quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0)
      .quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius)
      .quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0)
      .quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);

    // Fish
    const fishShape = new Shape()
      .moveTo(x, y)
      .quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)
      .quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)
      .quadraticCurveTo(x + 115, y, x + 115, y + 40)
      .quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)
      .quadraticCurveTo(x + 50, y + 80, x, y);

    // Arc circle
    const arcShape = new Shape()
      .moveTo(50, 10)
      .absarc(10, 10, 40, 0, Math.PI * 2, false);
    const holePath = new Path()
      .moveTo(20, 10)
      .absarc(10, 10, 10, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);

    // Smiley
    const smileyShape = new Shape()
      .moveTo(80, 40)
      .absarc(40, 40, 40, 0, Math.PI * 2, false);
    const smileyEye1Path = new Path()
      .moveTo(35, 20)
      .absellipse(25, 20, 10, 10, 0, Math.PI * 2, true, 0);
    const smileyEye2Path = new Path()
      .moveTo(65, 20)
      .absarc(55, 20, 10, 0, Math.PI * 2, true);
    const smileyMouthPath = new Path()
      .moveTo(20, 40)
      .quadraticCurveTo(40, 60, 60, 40)
      .bezierCurveTo(70, 45, 70, 50, 60, 60)
      .quadraticCurveTo(40, 80, 20, 60)
      .quadraticCurveTo(5, 50, 20, 40);

    smileyShape.holes.push(smileyEye1Path);
    smileyShape.holes.push(smileyEye2Path);
    smileyShape.holes.push(smileyMouthPath);

    //spline
    const splinepts: Vector2[] = [];
    splinepts.push(new Vector2(70, 20));
    splinepts.push(new Vector2(80, 90));
    splinepts.push(new Vector2(-30, 70));
    splinepts.push(new Vector2(0, 0));
    const splineShape = new Shape().moveTo(0, 0).splineThru(splinepts);
    //

    const extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1,
    };
    // add shape
    this.addShape(
      californiaShape,
      extrudeSettings,
      0xf08000,
      -300,
      -100,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      triangleShape,
      extrudeSettings,
      0x8080f0,
      -180,
      0,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      roundedRectShape,
      extrudeSettings,
      0x008000,
      -150,
      150,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      trackShape,
      extrudeSettings,
      0x008080,
      200,
      -100,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      squareShape,
      extrudeSettings,
      0x0040f0,
      150,
      100,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      heartShape,
      extrudeSettings,
      0xf00000,
      60,
      100,
      0,
      0,
      0,
      Math.PI,
      1
    );
    this.addShape(
      circleShape,
      extrudeSettings,
      0x00f000,
      120,
      250,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      fishShape,
      extrudeSettings,
      0x404040,
      -60,
      200,
      0,
      0,
      0,
      0,
      1
    );
    this.addShape(
      smileyShape,
      extrudeSettings,
      0xf000f0,
      -200,
      250,
      0,
      0,
      0,
      Math.PI,
      1
    );
    this.addShape(arcShape, extrudeSettings, 0x804000, 150, 0, 0, 0, 0, 0, 1);
    this.addShape(
      splineShape,
      extrudeSettings,
      0x808080,
      -50,
      -100,
      0,
      0,
      0,
      0,
      1
    );

    this.addLineShape(
      arcShape.holes[0] as any,
      0x804000,
      150,
      0,
      0,
      0,
      0,
      0,
      1
    );

    for (let i = 0; i < smileyShape.holes.length; i++) {
      this.addLineShape(
        smileyShape.holes[i] as any,
        0xf000f0,
        -200,
        250,
        0,
        0,
        0,
        Math.PI,
        1
      );
    }
  }

  addShape(
    shape: Shape,
    extrudeSettings: any,
    color: number,
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    s: number
  ) {
    let geometry = new ShapeBufferGeometry(shape);
    let mesh = new Mesh(
      geometry,
      new MeshPhongMaterial({ side: DoubleSide, map: this.texture })
    );
    mesh.position.set(x, y, z - 175);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);
    this.group.add(mesh);

    geometry = geometry.clone();

    mesh = new Mesh(
      geometry,
      new MeshPhongMaterial({ color, side: DoubleSide })
    );
    mesh.position.set(x, y, z - 125);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);
    this.group.add(mesh);

    geometry = new ExtrudeBufferGeometry(shape, extrudeSettings);
    mesh = new Mesh(geometry, new MeshPhongMaterial({ color }));
    mesh.position.set(x, y, z - 75);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);
    this.group.add(mesh);

    this.addLineShape(shape, color, x, y, z, rx, ry, rz, s);
  }

  addLineShape(
    shape: Shape,
    color: number,
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    s: number
  ) {
    // line
    shape.autoClose = true;

    const points = shape.getPoints();
    const spacedPoints = shape.getSpacedPoints(50);

    const geometryPoints = new BufferGeometry().setFromPoints(points);
    const geometrySpacedPoints = new BufferGeometry().setFromPoints(
      spacedPoints
    );

    // soldline
    let line = new Line(geometryPoints, new LineBasicMaterial({ color }));
    line.position.set(x, y, z - 25);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    this.group.add(line);

    // line points
    line = new Line(geometrySpacedPoints, new LineBasicMaterial({ color }));
    line.position.set(x, y, z + 25);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    this.group.add(line);

    // vertices from real points
    let particles = new Points(
      geometryPoints,
      new PointsMaterial({ color, size: 4 })
    );
    particles.position.set(x, y, z + 75);
    particles.rotation.set(rx, ry, rz);
    particles.scale.set(s, s, s);
    this.group.add(particles);

    //
    particles = new Points(
      geometrySpacedPoints,
      new PointsMaterial({ color, size: 4 })
    );
    particles.position.set(x, y, z + 125);
    particles.rotation.set(rx, ry, rz);
    particles.scale.set(s, s, s);
    this.group.add(particles);
  }
}

new Demo();
