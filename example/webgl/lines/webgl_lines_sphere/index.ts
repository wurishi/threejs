import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Vector3,
} from 'three';
import { Main } from '../../../main';

const r = 450;

class Demo extends Main {
  initCamera() {
    super.initCamera(80, 1, 3000, new Vector3(0, 0, 1000));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    const parameters = [
      [0.25, 0xff7700, 1],
      [0.5, 0xff9900, 1],
      [0.75, 0xffaa00, 0.75],
      [1, 0xffaa00, 0.5],
      [1.25, 0x000833, 0.8],
      [3.0, 0xaaaaaa, 0.75],
      [3.5, 0xffffff, 0.5],
      [4.5, 0xffffff, 0.25],
      [5.5, 0xffffff, 0.125],
    ];

    const geometry = createGeometry();

    parameters.forEach((p) => {
      const material = new LineBasicMaterial({
        color: p[1],
        opacity: p[2],
      });
      const line = new LineSegments(geometry, material);
      line.scale.set(p[0], p[0], p[0]);
      line.userData.originalScale = p[0];
      line.rotation.y = Math.random() * Math.PI;
      line.updateMatrix();
      this.scene.add(line);
    });

    // setInterval(() => {
    //   const geometry = createGeometry();

    //   this.scene.traverse((object) => {
    //     if (object.type.startsWith('Line')) {
    //       const line = object as LineSegments;
    //       line.geometry.dispose();
    //       line.geometry = geometry;
    //     }
    //   });
    // }, 1000);

    document.body.addEventListener(
      'pointermove',
      (evt) => {
        if (evt.isPrimary === false) return;
        mouseY = evt.clientY - window.innerHeight / 2;
      },
      false
    );
  }

  render() {
    this.camera.position.y += (-mouseY + 200 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    const time = Date.now() * 0.0001;
    this.scene.children.forEach((object, i) => {
      if (object.type.startsWith('Line')) {
        const line = object as LineSegments;
        line.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
        if (i < 5) {
          const scale =
            object.userData.originalScale *
            (i / 5 + 1) *
            (1 + 0.5 * Math.sin(7 * time));
          object.scale.set(scale, scale, scale);
        }
      }
    });
  }
}

let mouseY = 0;

function createGeometry() {
  const geometry = new BufferGeometry();
  const vertices = [];

  const vertex = new Vector3();

  for (let i = 0; i < 1500; i++) {
    vertex.set(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
    vertex.normalize();
    vertex.multiplyScalar(r);

    vertices.push(vertex.x, vertex.y, vertex.z);
    vertex.multiplyScalar(Math.random() * 0.09 + 1);

    vertices.push(vertex.x, vertex.y, vertex.z);
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

  return geometry;
}

new Demo();
