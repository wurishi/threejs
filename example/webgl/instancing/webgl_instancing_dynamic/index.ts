import { GUI } from 'dat.gui';
import {
  BufferGeometry,
  BufferGeometryLoader,
  DynamicDrawUsage,
  Geometry,
  InstancedMesh,
  Material,
  MeshNormalMaterial,
  Object3D,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  params: {
    amount: number;
    count: number;
  };

  dummy: Object3D;
  mesh: InstancedMesh;

  initCamera() {
    super.initCamera(60, 0.1, 100, new Vector3(9, 9, 9));
    this.camera.lookAt(0, 0, 0);
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  initPlane() {
    this.params = {
      amount: 10,
      count: 0,
    };
    const count = Math.pow(this.params.amount, 3);
    this.params.count = count;
    this.dummy = new Object3D();

    const loader = new BufferGeometryLoader();
    loader.load('suzanne_buffergeometry.json', (geometry) => {
      geometry.computeVertexNormals();
      geometry.scale(0.5, 0.5, 0.5);

      const material = new MeshNormalMaterial();

      this.mesh = new InstancedMesh(geometry, material, count);
      this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      this.scene.add(this.mesh);
    });
    this.initGUI();
  }

  initGUI() {
    const gui = new GUI();
    gui.add(this.params, 'count', 0, this.params.count).onChange((v) => {
      this.mesh && (this.mesh.count = v);
    });
  }

  render() {
    const time = Date.now() * 0.001;
    if (this.mesh) {
      this.mesh.rotation.x = Math.sin(time / 4);
      this.mesh.rotation.y = Math.sin(time / 2);

      const amount = this.params.amount;
      let i = 0;
      const offset = (amount - 1) / 2;
      // (this.mesh.instanceMatrix as any).needsUdpdate = false;
      for (let x = 0; x < amount; x++) {
        for (let y = 0; y < amount; y++) {
          for (let z = 0; z < amount; z++) {
            this.dummy.position.set(offset - x, offset - y, offset - z);
            this.dummy.rotation.y =
              Math.sin(x / 4 + time) +
              Math.sin(y / 4 + time) +
              Math.sin(z / 4 + time);
            this.dummy.rotation.z = this.dummy.rotation.y * 2;

            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i++, this.dummy.matrix);
          }
        }
      }
      (this.mesh.instanceMatrix as any).needsUpdate = true;
    }
  }
}

new Demo();
