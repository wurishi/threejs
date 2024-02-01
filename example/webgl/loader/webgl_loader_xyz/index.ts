import { Clock, Points, PointsMaterial, Vector3 } from 'three';
import { Main } from '../../../main';

import { XYZLoader } from './XYZLoader';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 0.1, 100, new Vector3(10, 7, 10));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new XYZLoader();
    loader.load('helix_201.xyz', (geometry: any) => {
      geometry.center();

      // console.log(geometry);
      const vertexColors = geometry.attributes.color === true;

      const material = new PointsMaterial({
        size: 0.1,
        vertexColors,
      });

      points = new Points(geometry, material);

      this.scene.add(points);
    });
  }

  render() {
    const delta = clock.getDelta();
    if (points) {
      points.rotation.x += delta * 0.2;
      points.rotation.y += delta * 0.5;
    }
  }
}

let points: Points;
const clock = new Clock();

new Demo();
