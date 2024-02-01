import {
  BoxBufferGeometry,
  BufferGeometry,
  CircleBufferGeometry,
  CylinderBufferGeometry,
  IcosahedronBufferGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  OctahedronBufferGeometry,
  PlaneBufferGeometry,
  RingBufferGeometry,
  SphereBufferGeometry,
  TorusBufferGeometry,
  TorusKnotBufferGeometry,
  Vector3,
} from 'three';
import { Main } from '../../../main';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { GUI } from 'dat.gui';

class Demo extends Main {
  geometries: BufferGeometry[];
  material: Material;
  options: any;

  initCamera() {
    super.initCamera(70, 1, 1000, new Vector3(0, 0, 500));
  }

  // initRenderer() {
  //   super.initRenderer(true, null);
  // }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    this.geometries = [
      new BoxBufferGeometry(200, 200, 200, 2, 2, 2),
      new CircleBufferGeometry(200, 32),
      new CylinderBufferGeometry(75, 75, 200, 8, 8),
      new IcosahedronBufferGeometry(100, 1),
      new OctahedronBufferGeometry(200, 0),
      new PlaneBufferGeometry(200, 200, 4, 4),
      new RingBufferGeometry(32, 64, 16),
      new SphereBufferGeometry(100, 12, 12),
      new TorusBufferGeometry(64, 16, 12, 12),
      new TorusKnotBufferGeometry(64, 16),
    ];
    this.material = new MeshBasicMaterial({
      color: 0xfefefe,
      wireframe: true,
      opacity: 0.5,
    });

    this.initGUI();

    this.addMesh();
  }

  // initDirLight() {}
  // initHemiLight() {}

  initGUI() {
    this.options = {
      Geometry: 0,
    };

    const geometries = {
      BoxBufferGeometry: 0,
      CircleBufferGeometry: 1,
      CylinderBufferGeometry: 2,
      IcosahedronBufferGeometry: 3,
      OctahedronBufferGeometry: 4,
      PlaneBufferGeometry: 5,
      RingBufferGeometry: 6,
      SphereBufferGeometry: 7,
      TorusBufferGeometry: 8,
      TorusKnotBufferGeometry: 9,
    };

    const gui = new GUI({ width: 350 });

    gui.add(this.options, 'Geometry', geometries).onChange(() => {
      this.addMesh();
    });
  }

  mesh: Mesh;
  geometry: BufferGeometry;

  addMesh() {
    if (this.mesh !== undefined) {
      this.scene.remove(this.mesh);
      this.geometry.dispose();
    }

    this.geometry = this.geometries[this.options.Geometry];

    this.geometry.computeBoundingSphere();

    const scaleFactor = 160 / this.geometry.boundingSphere.radius;
    this.geometry.scale(scaleFactor, scaleFactor, scaleFactor);

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.mesh.add(new VertexNormalsHelper(this.mesh, 10));
  }
}

new Demo();
