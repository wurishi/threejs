import { Font, FontLoader, Mesh, Scene, TextGeometry } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;
  font: Font;
  params: any;

  getAPI() {
    return {
      size: 3,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.3,
      bevelSegments: 5,
    };
  }

  main(scene: Scene) {
    this.scene = scene;
    const loader = new FontLoader();
    loader.load('./helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      this.update(this.params || this.getAPI());
    });
    this.update(this.getAPI());

    this.addDirLight(scene);
  }

  update(params: any) {
    this.params = params;
    if (this.font) {
      this.mesh && this.scene.remove(this.mesh);

      this.mesh = new Mesh(
        new TextGeometry('three.js', {
          ...params,
          font: this.font,
        }),
        this.createMaterial()
      );

      this.scene.add(this.mesh);
    }
  }
}
