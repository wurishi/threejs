import {
  BoxBufferGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Raycaster,
  Vector2,
} from 'three';
import { Main } from '../../../main';

const radius = 100;

class Demo extends Main {
  initPlane() {
    const geometry = new BoxBufferGeometry(20, 20, 20);

    for (let i = 0; i < 2000; i++) {
      const object = new Mesh(
        geometry,
        new MeshLambertMaterial({
          color: Math.random() * 0xffffff,
        })
      );

      object.position.set(
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
        Math.random() * 800 - 400
      );

      object.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      );

      object.scale.set(
        Math.random() + 0.5,
        Math.random() + 0.5,
        Math.random() + 0.5
      );

      this.scene.add(object);
    }

    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.theta = 0;

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

  // initControls() {
  // super.initControls()
  // }

  mouse: Vector2;
  raycaster: Raycaster;
  theta = 0;

  INTERSECTED: Mesh;
  currentHex: number;

  render() {
    this.theta += 0.1;

    // this.camera.position.set(
    //   radius * Math.sin(MathUtils.degToRad(this.theta)),
    //   radius * Math.sin(MathUtils.degToRad(this.theta)),
    //   radius * Math.cos(MathUtils.degToRad(this.theta))
    // );
    // this.camera.lookAt(this.scene.position);
    // this.camera.updateMatrixWorld();

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);
    // console.log(intersects);
    if (intersects.length > 0) {
      if (this.INTERSECTED !== intersects[0].object) {
        if (this.INTERSECTED) {
          (this.INTERSECTED.material as MeshLambertMaterial).emissive.setHex(
            this.currentHex
          );
        }
        this.INTERSECTED = intersects[0].object as Mesh;
        this.currentHex = (this.INTERSECTED
          .material as MeshLambertMaterial).emissive.getHex();
        (this.INTERSECTED.material as MeshLambertMaterial).emissive.setHex(
          0xff0000
        );
      }
    } else {
      if (this.INTERSECTED) {
        (this.INTERSECTED.material as MeshLambertMaterial).emissive.setHex(
          this.currentHex
        );
        this.INTERSECTED = null;
      }
    }
  }

  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }
}

new Demo();
