import {
  BoxBufferGeometry,
  DirectionalLight,
  Mesh,
  MeshLambertMaterial,
  OrthographicCamera,
  Raycaster,
  Vector2,
} from 'three';
import { Main } from '../../../main';

const radius = 500;
const frustumSize = 1000;

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

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    document.addEventListener(
      'mousemove',
      (e) => {
        e.preventDefault();
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );
  }

  raycaster: Raycaster;
  mouse: Vector2;

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    ) as any;
    // console.log(this.camera);
  }

  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }

  // initDirLight() {
  //   const light = new DirectionalLight(0xffffff, 1);
  //   light.position.set(1, 1, 1).normalize();
  //   this.scene.add(light);
  // }

  // initRenderer() {
  //   super.initRenderer(false);
  // }

  render() {
    this.camera.lookAt(this.scene.position);
    this.camera.updateMatrixWorld();

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      if (this.INTERSECTED != intersects[0].object) {
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

  INTERSECTED: Mesh;
  currentHex: number;

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;

    const camera: OrthographicCamera = this.camera as any;
    camera.left = (frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

new Demo();
