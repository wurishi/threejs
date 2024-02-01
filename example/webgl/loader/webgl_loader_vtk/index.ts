import { Main } from '../../../main';

import { VTKLoader } from 'three/examples/jsm/loaders/VTKLoader';
import { Mesh, MeshLambertMaterial, Vector3 } from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 0.01, 1e10, new Vector3(0, 0, 0.2));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initControls() {
    super.initControls(new Vector3());
  }

  initPlane() {
    const loader = new VTKLoader();
    loader.load('bunny.vtk', (geometry) => {
      geometry.center();
      geometry.computeVertexNormals();

      const material = new MeshLambertMaterial({ color: 0xffffff });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(-0.075, 0.005, 0);
      mesh.scale.multiplyScalar(0.2);
      this.scene.add(mesh);
    });

    new VTKLoader().load('cube_ascii.vtp', (geometry) => {
      geometry.computeVertexNormals();
      geometry.center();

      const material = new MeshLambertMaterial({ color: 0x00ff00 });
      const mesh = new Mesh(geometry, material);

      mesh.position.set(-0.025, 0, 0);
      mesh.scale.multiplyScalar(0.01);
      this.scene.add(mesh);
    });

    new VTKLoader().load('cube_binary.vtp', (geometry) => {
      geometry.computeVertexNormals();
      geometry.center();

      const material = new MeshLambertMaterial({ color: 0x0000ff });
      const mesh = new Mesh(geometry, material);

      mesh.position.set(0.025, 0, 0);
      mesh.scale.multiplyScalar(0.01);
      this.scene.add(mesh);
    });

    new VTKLoader().load('cube_no_compression.vtp', (geometry) => {
      geometry.computeVertexNormals();
      geometry.center();

      const material = new MeshLambertMaterial({ color: 0xff0000 });
      const mesh = new Mesh(geometry, material);

      mesh.position.set(0.075, 0, 0);
      mesh.scale.multiplyScalar(0.01);
      this.scene.add(mesh);
    });
  }
}

new Demo();
