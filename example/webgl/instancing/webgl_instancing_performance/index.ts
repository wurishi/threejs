import { Main } from '../../../main';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { GUI } from 'dat.gui';
import {
  Mesh,
  Material,
  BufferGeometryLoader,
  MeshNormalMaterial,
  BufferGeometry,
  InstancedBufferGeometry,
  Matrix4,
  InstancedMesh,
  Vector3,
  Euler,
  Quaternion,
  Geometry,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Method = {
  INSTANCED: 'INSTANCED',
  MERGED: 'MERGED',
  NAIVE: 'NAIVE',
};

const api = {
  method: Method.INSTANCED,
  count: 1000,
};

function getGeometryByteLength(geometry: BufferGeometry) {
  let total = 0;
  // console.log(geometry.index.array);
  if (geometry.index) total += (geometry.index.array as any).byteLength;

  for (const name in geometry.attributes) {
    total += (geometry.attributes[name].array as any).byteLength;
  }
  return total;
}

function formatBytes(bytes: number, decimals: number) {
  if (bytes === 0) return '0 bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class Demo extends Main {
  gui: GUI;
  guiStatsEl: HTMLLIElement;
  controls: OrbitControls;

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
  }

  initPlane() {
    this.gui = new GUI();
    this.gui.add(api, 'method', Method).onChange(() => this.initMesh());
    this.gui
      .add(api, 'count', 1, 10000)
      .step(1)
      .onChange(() => this.initMesh());

    const perfFolder: any = this.gui.addFolder('Performance');

    this.guiStatsEl = document.createElement('li');
    this.guiStatsEl.style.height = 'auto';

    perfFolder.__ul.appendChild(this.guiStatsEl);
    perfFolder.open();

    this.initMesh();
  }

  render() {
    this.controls.update();
  }

  material: MeshNormalMaterial;

  initMesh() {
    this.clean();

    new BufferGeometryLoader().load(
      'suzanne_buffergeometry.json',
      (geometry) => {
        this.material = new MeshNormalMaterial();

        geometry.computeVertexNormals();

        console.time(api.method + ' (build)');

        switch (api.method) {
          case Method.INSTANCED:
            this.makeInstanced(geometry);
            break;
          case Method.MERGED:
            this.makeMerged(geometry);
            break;
          case Method.NAIVE:
            this.makeNaive(geometry);
            break;
        }
        console.timeEnd(api.method + ' (build)');
      }
    );
  }

  randomizeMatrix = (function () {
    const position = new Vector3();
    const rotation = new Euler();
    const quaternion = new Quaternion();
    const scale = new Vector3();

    return function (matrix: Matrix4) {
      position.set(
        Math.random() * 40 - 20,
        Math.random() * 40 - 20,
        Math.random() * 40 - 20
      );
      rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      );
      quaternion.setFromEuler(rotation);

      scale.x = scale.y = scale.z = Math.random() * 1;

      matrix.compose(position, quaternion, scale);
    };
  })();

  makeInstanced(geometry: BufferGeometry) {
    const matrix = new Matrix4();
    const mesh = new InstancedMesh(geometry, this.material, api.count);

    for (let i = 0; i < api.count; i++) {
      this.randomizeMatrix(matrix);
      mesh.setMatrixAt(i, matrix);
    }
    this.scene.add(mesh);

    const geometryByteLength = getGeometryByteLength(geometry);

    this.guiStatsEl.innerHTML = [
      '<i>GPU draw calls</i>: 1',
      '<i>GPU memory</i>: ' +
        formatBytes(api.count * 16 + geometryByteLength, 2),
    ].join('<br/>');
  }

  makeMerged(geometry: BufferGeometry) {
    const geometries: BufferGeometry[] = [];
    const matrix = new Matrix4();
    for (let i = 0; i < api.count; i++) {
      this.randomizeMatrix(matrix);

      const instanceGeometry = geometry.clone();
      instanceGeometry.applyMatrix4(matrix);

      geometries.push(instanceGeometry);
    }

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries
    );
    this.scene.add(new Mesh(mergedGeometry, this.material));

    this.guiStatsEl.innerHTML = [
      '<i>GPU draw calls</i>: 1', //
      '<i>GPU memory</i>: ' +
        formatBytes(getGeometryByteLength(mergedGeometry), 2),
    ].join('<br/>');
  }

  makeNaive(geometry: BufferGeometry) {
    const matrix = new Matrix4();
    for (let i = 0; i < api.count; i++) {
      this.randomizeMatrix(matrix);

      const mesh = new Mesh(geometry, this.material);
      mesh.applyMatrix4(matrix);

      this.scene.add(mesh);
    }

    const geometryByteLength = getGeometryByteLength(geometry);

    this.guiStatsEl.innerHTML = [
      '<i>GPU draw calls</i>: ' + api.count, //
      '<i>GPU memory</i>: ' +
        formatBytes(api.count * 16 + geometryByteLength, 2),
    ].join('<br />');
  }

  clean() {
    const meshes: Mesh[] = [];
    this.scene.traverse((object: any) => {
      if (object.isMesh) meshes.push(object);
    });
    meshes.forEach((mesh) => {
      (mesh.material as Material).dispose();
      mesh.geometry.dispose();

      this.scene.remove(mesh);
    });
    meshes.length = 0;
  }
}

new Demo();
