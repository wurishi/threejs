import { Main } from '../../../main';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { VertexTangentsHelper } from 'three/examples/jsm/helpers/VertexTangentsHelper';

import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import {
  BoxHelper,
  EdgesGeometry,
  GridHelper,
  Group,
  LineSegments,
  Material,
  PointLight,
  PointLightHelper,
  PolarGridHelper,
  Vector3,
  WireframeGeometry,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(70, 1, 1000, new Vector3(0, 0, 400));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  light: PointLight;
  initDirLight() {
    this.light = new PointLight();
    this.light.position.set(200, 100, 150);
    this.scene.add(this.light);
  }

  vnh: VertexNormalsHelper;
  vth: VertexTangentsHelper;
  initPlane() {
    this.scene.add(new PointLightHelper(this.light, 15));

    const gridHelper = new GridHelper(400, 40, 0x0000ff, 0x808080);
    gridHelper.position.set(-150, -150, 0);
    this.scene.add(gridHelper);

    const polarGridHelper = new PolarGridHelper(
      200,
      16,
      8,
      64,
      0x0000ff,
      0x808080
    );
    polarGridHelper.position.set(200, -150, 0);
    this.scene.add(polarGridHelper);

    const loader = new GLTFLoader();
    loader.load('LeePerrySmith.glb', (gltf) => {
      const mesh: any = gltf.scene.children[0];

      BufferGeometryUtils.computeTangents(mesh.geometry);

      const group = new Group();
      group.scale.multiplyScalar(50);
      this.scene.add(group);

      group.updateMatrixWorld(true);

      group.add(mesh);

      this.vnh = new VertexNormalsHelper(mesh, 5);
      this.scene.add(this.vnh);

      this.vth = new VertexTangentsHelper(mesh, 5);
      this.scene.add(this.vth);

      this.scene.add(new BoxHelper(mesh));

      const wireframe = new WireframeGeometry(mesh.geometry);
      let line = new LineSegments(wireframe);
      let material = line.material as Material;
      material.depthTest = false;
      material.opacity = 0.25;
      material.transparent = true;
      line.position.x = 4;
      group.add(line);
      this.scene.add(new BoxHelper(line));

      const edges = new EdgesGeometry(mesh.geometry);
      line = new LineSegments(edges);
      material = line.material as Material;
      material.depthTest = false;
      material.opacity = 0.25;
      material.transparent = true;
      line.position.x = -4;
      group.add(line);
      this.scene.add(new BoxHelper(line));

      this.scene.add(new BoxHelper(group));
      this.scene.add(new BoxHelper(this.scene));
    });
  }

  render() {
    const time = this.clock.getElapsedTime() * 0.1;

    // this.camera.position.x = 400 * Math.cos(time);
    // this.camera.position.z = 400 * Math.sin(time);
    // this.camera.lookAt(this.scene.position);

    this.light.position.set(
      Math.sin(time * 1.7) * 300,
      Math.cos(time * 1.5) * 400,
      Math.cos(time * 1.3) * 300
    );
    this.vnh && this.vnh.update();
    this.vth && this.vth.update();
  }
}

new Demo();
