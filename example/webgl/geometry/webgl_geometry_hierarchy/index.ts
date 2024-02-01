import { BoxBufferGeometry, Group, Mesh, MeshNormalMaterial } from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  group: Group;
  initPlane() {
    const geometry = new BoxBufferGeometry(100, 100, 100);
    const material = new MeshNormalMaterial();

    this.group = new Group();

    for (let i = 0; i < 1000; i++) {
      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000
      );

      mesh.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        0
      );

      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();

      this.group.add(mesh);
    }

    this.scene.add(this.group);
  }

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  mouseX = 0;
  mouseY = 0;

  onWindowResize() {
    super.onWindowResize();
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
  }

  // initControls() {
  //   window.addEventListener(
  //     'mousemove',
  //     (event) => {
  //       this.mouseX = (event.clientX - this.windowHalfX) * 10;
  //       this.mouseY = (event.clientY - this.windowHalfY) * 10;
  //     },
  //     false
  //   );
  // }

  render() {
    const time = Date.now() * 0.001;
    const rx = Math.sin(time * 0.7) * 0.5,
      ry = Math.sin(time * 0.3) * 0.5,
      rz = Math.sin(time * 0.2) * 0.5;

    // this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    // this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;

    this.camera.lookAt(this.scene.position);

    this.group.rotation.set(rx, ry, rz);

    // this.group.traverse((obj) => {
    //   obj.rotateZ(rz);
    //   obj.updateMatrix();
    // });
  }
}

new Demo();
