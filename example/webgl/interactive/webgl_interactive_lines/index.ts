import {
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  SphereBufferGeometry,
  Vector2,
  Vector3,
} from 'three';
import { Main, randomLR } from '../../../main';

const radius = 100;
const mouse = new Vector2();

let sphereInter: Mesh;
let parentTransform: Object3D;
let raycaster: Raycaster;

class Demo extends Main {
  initPlane() {
    const geometry = new SphereBufferGeometry(5);
    const material = new MeshBasicMaterial({ color: 0xff0000 });

    sphereInter = new Mesh(geometry, material);
    sphereInter.visible = false;
    this.scene.add(sphereInter);

    const lineGeometry = new BufferGeometry();
    const points: number[] = [];

    const point = new Vector3();
    const direction = new Vector3();

    for (let i = 0; i < 50; i++) {
      direction.x += Math.random() - 0.5;
      direction.y += Math.random() - 0.5;
      direction.z += Math.random() - 0.5;
      direction.normalize().multiplyScalar(10);

      point.add(direction);
      points.push(point.x, point.y, point.z);
    }

    lineGeometry.setAttribute(
      'position',
      new Float32BufferAttribute(points, 3)
    );

    parentTransform = new Object3D();
    parentTransform.position.set(randomLR(40), randomLR(40), randomLR(40));

    parentTransform.rotation.set(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    );

    parentTransform.scale.set(
      Math.random() + 0.5,
      Math.random() + 0.5,
      Math.random() + 0.5
    );

    for (let i = 0; i < 50; i++) {
      let object: Line;
      const lineMaterial = new LineBasicMaterial({
        color: Math.random() * 0xffffff,
      });
      if (Math.random() > 0.5) {
        object = new Line(lineGeometry, lineMaterial);
      } else {
        object = new LineSegments(lineGeometry, lineMaterial);
      }

      object.position.set(randomLR(400), randomLR(400), randomLR(400));
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
      parentTransform.add(object);
    }

    this.scene.add(parentTransform);

    raycaster = new Raycaster();
    raycaster.params.Line.threshold = 3;

    document.addEventListener(
      'mousemove',
      (e) => {
        e.preventDefault();

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );
  }

  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }

  render() {
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(parentTransform.children);

    if (intersects.length > 0) {
      sphereInter.visible = true;
      sphereInter.position.copy(intersects[0].point);
    } else {
      sphereInter.visible = false;
    }
  }
}

new Demo();
