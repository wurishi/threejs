import {
  LineSegments,
  Mesh,
  Scene,
  SphereGeometry,
  WireframeGeometry,
} from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: LineSegments;

  getAPI() {
    return {};
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    this.mesh && this.scene.remove(this.mesh);

    this.mesh = new LineSegments(
      new WireframeGeometry(new SphereGeometry(7, 6, 3))
    );

    this.scene.add(this.mesh);
  }
}
