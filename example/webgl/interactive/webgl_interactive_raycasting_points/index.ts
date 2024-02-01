import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  Raycaster,
  SphereBufferGeometry,
  Vector2,
} from 'three';
import { Main } from '../../../main';

const mouse = new Vector2();
const spheres: Mesh[] = [];
const threshold = 0.1;
const pointSize = 0.05;
const width = 80;
const length = 160;
const rotateY = new Matrix4().makeRotationY(0.005);

function generatePointCloudGeometry(
  color: Color,
  width: number,
  length: number
) {
  const geometry = new BufferGeometry();
  const numPoints = width * length;

  const positions = new Float32Array(numPoints * 3);
  const colors = new Float32Array(numPoints * 3);

  let k = 0;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      const u = i / width;
      const v = j / length;
      const x = u - 0.5;
      const y = (Math.cos(u * Math.PI * 4) + Math.sin(v * Math.PI * 8)) / 20;
      const z = v - 0.5;

      positions[3 * k] = x;
      positions[3 * k + 1] = y;
      positions[3 * k + 2] = z;

      const intensity = (y + 0.1) * 5;
      colors[3 * k] = color.r * intensity;
      colors[3 * k + 1] = color.g * intensity;
      colors[3 * k + 2] = color.b * intensity;
      k++;
    }
  }

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeBoundingBox();

  return geometry;
}

function generatePointcloud(color: Color, width: number, length: number) {
  const geometry = generatePointCloudGeometry(color, width, length);
  const material = new PointsMaterial({
    size: pointSize,
    vertexColors: true,
  });
  return new Points(geometry, material);
}

function generateIndexedPointcloud(
  color: Color,
  width: number,
  length: number
) {
  const geometry = generatePointCloudGeometry(color, width, length);
  const numPoints = width * length;
  const indices = new Uint16Array(numPoints);

  let k = 0;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      indices[k] = k;
      k++;
    }
  }

  geometry.setIndex(new BufferAttribute(indices, 1));
  const material = new PointsMaterial({
    size: pointSize,
    vertexColors: true,
  });
  return new Points(geometry, material);
}

function generateIndexedWithOffsetPointcloud(
  color: Color,
  width: number,
  length: number
) {
  const geometry = generatePointCloudGeometry(color, width, length);
  const numPoints = width * length;
  const indices = new Uint16Array(numPoints);

  let k = 0;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      indices[k] = k;
      k++;
    }
  }

  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.addGroup(0, indices.length);

  const material = new PointsMaterial({
    size: pointSize,
    vertexColors: true,
  });
  return new Points(geometry, material);
}

class Demo extends Main {
  initPlane() {
    const pcBuffer = generatePointcloud(new Color(1, 0, 0), width, length);
    pcBuffer.scale.set(5, 10, 10);
    pcBuffer.position.set(-5, 0, 0);
    this.scene.add(pcBuffer);

    const pcIndexed = generateIndexedPointcloud(
      new Color(0, 1, 0),
      width,
      length
    );
    pcIndexed.scale.set(5, 10, 10);
    pcIndexed.position.set(0, 0, 0);
    this.scene.add(pcIndexed);

    const pcIndexedOffset = generateIndexedWithOffsetPointcloud(
      new Color(0, 1, 1),
      width,
      length
    );
    pcIndexedOffset.scale.set(5, 10, 10);
    pcIndexedOffset.position.set(5, 0, 0);
    this.scene.add(pcIndexedOffset);

    pointclouds = [pcBuffer, pcIndexed, pcIndexedOffset];

    const sphereGeometry = new SphereBufferGeometry(0.1, 32, 32);
    const sphereMaterial = new MeshBasicMaterial({
      color: 0xff0000,
    });

    for (let i = 0; i < 40; i++) {
      const sphere = new Mesh(sphereGeometry, sphereMaterial);
      this.scene.add(sphere);
      spheres.push(sphere);
      sphere.visible = false;
    }

    raycaster = new Raycaster();
    raycaster.params.Points.threshold = threshold;

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

  render() {
    this.camera.applyMatrix4(rotateY);
    this.camera.updateMatrixWorld();

    raycaster.setFromCamera(mouse, this.camera);

    const intersections = raycaster.intersectObjects(pointclouds);
    const intersection = intersections.length > 0 ? intersections[0] : null;
    if (toggle > 0.02 && intersection !== null) {
      spheres[spheresIndex].position.copy(intersection.point);
      spheres[spheresIndex].scale.set(1, 1, 1);
      spheres[spheresIndex].visible = true;
      spheresIndex = (spheresIndex + 1) % spheres.length;
      toggle = 0;
    }

    spheres.forEach((sphere) => {
      sphere.scale.multiplyScalar(0.98);
      sphere.scale.clampScalar(0.01, 1);
    });

    toggle += this.clock.getDelta();
  }
}

let pointclouds: Points[] = [];
let raycaster: Raycaster;
let toggle = 0;
let spheresIndex = 0;

new Demo();
