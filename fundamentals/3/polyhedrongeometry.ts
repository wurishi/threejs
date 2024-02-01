// 根据顶点三角形生成的多面体
import { Mesh, PolyhedronGeometry, Scene } from 'three';
import { Demo } from './constant';

export default class extends Demo {
  scene: Scene;
  mesh: Mesh;

  getAPI() {
    return { radius: 7, detail: 2 };
  }

  main(scene: Scene) {
    this.scene = scene;
    this.update(this.getAPI());
    this.addDirLight(scene);
  }

  update(params: any) {
    const { radius, detail } = params;
    const verticesOfCube = [
      -1,
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      -1,
      -1,
      1,
      -1,
      -1,
      -1,
      1,
      1,
      -1,
      1,
      1,
      1,
      1,
      -1,
      1,
      1,
    ];
    const indicesOfFaces = [
      2,
      1,
      0,
      0,
      3,
      2,
      0,
      4,
      7,
      7,
      3,
      0,
      0,
      1,
      5,
      5,
      4,
      0,
      1,
      2,
      6,
      6,
      5,
      1,
      2,
      3,
      7,
      7,
      6,
      2,
      4,
      5,
      6,
      6,
      7,
      4,
    ];
    this.mesh && this.scene.remove(this.mesh);
    this.mesh = new Mesh(
      new PolyhedronGeometry(verticesOfCube, indicesOfFaces, radius, detail),
      this.createMaterial()
    );
    this.scene.add(this.mesh);
  }
}
