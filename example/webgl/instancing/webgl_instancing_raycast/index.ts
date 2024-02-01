import { GUI } from 'dat.gui';
import {
  Color,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshPhongMaterial,
  Raycaster,
  Vector2,
} from 'three';
import { Main } from '../../../main';

const amount = 10;
const count = Math.pow(amount, 3);

class Demo extends Main {
  raycaster: Raycaster;
  mouse: Vector2;
  color: Color;
  mesh: InstancedMesh;

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.color = new Color();

    const geometry = new IcosahedronGeometry(0.5, 3);
    const material = new MeshPhongMaterial();

    this.mesh = new InstancedMesh(geometry, material, count);

    let i = 0;
    const offset = (amount - 1) / 2;
    const matrix = new Matrix4();

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < amount; z++) {
          matrix.setPosition(offset - x, offset - y, offset - z);

          this.mesh.setMatrixAt(i, matrix);
          // this.mesh.setColorAt 此版本无此方法
          i++;
        }
      }
    }
    this.scene.add(this.mesh);

    this.initGUI();
  }

  initGUI() {
    const params = {
      count,
    };
    const gui = new GUI();
    gui.add(params, 'count', 0, count).onChange((v) => {
      this.mesh.count = v;
      this.mesh.instanceMatrix.needsUpdate = true;
    });

    document.addEventListener(
      'mousemove',
      (event) => {
        event.preventDefault();

        this.mouse.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
      },
      false
    );
  }

  render() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersection = this.raycaster.intersectObject(this.mesh);
    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;

      // this.mesh.setColorAt(
      //   instanceId,
      //   this.color.setHex(Math.random() * 0xffffff)
      // );
      // this.mesh.instanceColor.needsUpdate = true;
      console.log(instanceId);
    }
  }
}

new Demo();
