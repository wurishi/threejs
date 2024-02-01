import { Main } from '../../../main';
import * as THREE from 'three';
import { ConvexBufferGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import {
  AxesHelper,
  BufferGeometry,
  DodecahedronBufferGeometry,
  DodecahedronGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Points,
  PointsMaterial,
  TextureLoader,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Demo extends Main {
  initRenderer() {
    super.initRenderer(true, null);
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initCamera() {
    super.initCamera(40, 1, 1000, new Vector3(15, 20, 30));
    this.scene.add(this.camera);
  }

  initControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 20;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
  }

  initHemiLight() {
    this.scene.add(new THREE.AmbientLight(0x222222));
  }

  initDirLight() {
    this.camera.add(new THREE.PointLight(0xffffff, 1));
  }

  group: Group;

  initPlane() {
    this.scene.add(new AxesHelper(20));

    const loader = new TextureLoader();
    const texture = loader.load('disc.png');

    const group = new Group();
    this.scene.add(group);

    const vertices = new DodecahedronGeometry(10).vertices;

    for (let i = 0; i < vertices.length; i++) {}

    const pointsMaterial = new PointsMaterial({
      color: 0x0080ff,
      map: texture,
      size: 1,
      alphaTest: 0.5,
    });
    const pointsGeometry = new BufferGeometry().setFromPoints(vertices);
    const points = new Points(pointsGeometry, pointsMaterial);
    group.add(points);

    const meshMaterial = new MeshLambertMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
    });
    const meshGeometry = new ConvexBufferGeometry(vertices);

    const mesh1 = new Mesh(meshGeometry, meshMaterial);
    mesh1.material.side = THREE.BackSide;
    mesh1.renderOrder = 0;
    group.add(mesh1);

    const mesh2 = new Mesh(meshGeometry, meshMaterial.clone());
    mesh2.material.side = THREE.FrontSide;
    mesh2.renderOrder = 1;
    group.add(mesh2);

    this.group = group;
  }

  render() {
    this.group.rotation.y += 0.005;
  }
}

new Demo();
