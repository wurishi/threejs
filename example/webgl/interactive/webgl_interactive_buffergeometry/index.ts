import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Line,
  LineBasicMaterial,
  Material,
  Mesh,
  MeshPhongMaterial,
  Raycaster,
  Vector2,
  Vector3,
  Vector4,
} from 'three';
import { Main } from '../../../main';

function cRandom(n: number, n2: number, [x, y, z]: number[]) {
  return [
    x + Math.random() * n - n2,
    y + Math.random() * n - n2,
    z + Math.random() * n - n2,
  ];
}

class Demo extends Main {
  initPlane() {
    const trianles = 5000;

    let geometry = new BufferGeometry();

    const positions = new Float32Array(trianles * 3 * 3);
    const normals = new Float32Array(trianles * 3 * 3);
    const colors = new Float32Array(trianles * 3 * 3);

    const color = new Color();

    const n = 800,
      n2 = n / 2;
    const d = 120,
      d2 = d / 2;

    const pA = new Vector3();
    const pB = new Vector3();
    const pC = new Vector3();

    const cb = new Vector3();
    const ab = new Vector3();

    for (let i = 0; i < positions.length; i += 9) {
      const [x, y, z] = cRandom(n, n2, [0, 0, 0]);

      const [ax, ay, az] = cRandom(d, d2, [x, y, z]);

      const [bx, by, bz] = cRandom(d, d2, [x, y, z]);

      const [cx, cy, cz] = cRandom(d, d2, [x, y, z]);

      positions[i] = ax;
      positions[i + 1] = ay;
      positions[i + 2] = az;

      positions[i + 3] = bx;
      positions[i + 4] = by;
      positions[i + 5] = bz;

      positions[i + 6] = cx;
      positions[i + 7] = cy;
      positions[i + 8] = cz;

      pA.set(ax, ay, az);
      pB.set(bx, by, bz);
      pC.set(cx, cy, cz);

      cb.subVectors(pC, pB);
      ab.subVectors(pA, pB);
      cb.cross(ab);

      cb.normalize();

      const { x: nx, y: ny, z: nz } = cb;

      normals[i] = nx;
      normals[i + 1] = ny;
      normals[i + 2] = nz;

      normals[i + 3] = nx;
      normals[i + 4] = ny;
      normals[i + 5] = nz;

      normals[i + 6] = nx;
      normals[i + 7] = ny;
      normals[i + 8] = nz;

      // colors
      const vx = x / n + 0.5;
      const vy = y / n + 0.5;
      const vz = z / n + 0.5;

      color.setRGB(vx, vy, vz);

      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;

      colors[i + 3] = color.r;
      colors[i + 4] = color.g;
      colors[i + 5] = color.b;

      colors[i + 6] = color.r;
      colors[i + 7] = color.g;
      colors[i + 8] = color.b;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    let material: Material = new MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0xffffff,
      shininess: 250,
      side: DoubleSide,
      vertexColors: true,
    });
    this.mesh = new Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.raycaster = new Raycaster();

    this.mouse = new Vector2();

    geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(4 * 3), 3)
    );
    material = new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });

    this.line = new Line(geometry, material);
    this.scene.add(this.line);

    document.addEventListener(
      'mousemove',
      (event) => {
        event.preventDefault();

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );
  }

  initCamera() {
    super.initCamera(27, 1, 3500, new Vector3(0, 0, 2750));
  }

  initScene() {
    super.initScene(0x050505, 2000, 3500);
  }

  initDirLight() {
    const light1 = new DirectionalLight(0xffffff, 0.5);
    light1.position.set(1, 1, 1);
    this.scene.add(light1);

    const light2 = new DirectionalLight(0xffffff, 1.5);
    light2.position.set(0, -1, 0);
    this.scene.add(light2);
  }

  initHemiLight() {
    this.scene.add(new AmbientLight(0x444444));
  }

  mesh: Mesh;
  line: Line;
  raycaster: Raycaster;
  mouse: Vector2;

  render() {
    const time = Date.now() * 0.001;

    this.mesh.rotation.x = time * 0.15;
    this.mesh.rotation.y = time * 0.25;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.mesh);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const face = intersect.face;
      const linePosition = (this.line.geometry as BufferGeometry).attributes
        .position as BufferAttribute;
      const meshPosition = (this.mesh.geometry as BufferGeometry).attributes
        .position as BufferAttribute;

      linePosition.copyAt(0, meshPosition, face.a);
      linePosition.copyAt(1, meshPosition, face.b);
      linePosition.copyAt(2, meshPosition, face.c);
      linePosition.copyAt(3, meshPosition, face.a);

      this.mesh.updateMatrix();

      this.line.geometry.applyMatrix4(this.mesh.matrix);
      this.line.visible = true;
    } else {
      this.line.visible = false;
    }
  }
}

new Demo();
