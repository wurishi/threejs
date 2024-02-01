import { Main } from '../../../main';

import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  TorusKnotBufferGeometry,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

const api = {
  count: 2000,
  distribution: 'random',
  resample: resample,
  surfaceColor: 0xfff784,
  backgroundColor: 0xe39469,
};

const count = api.count;

const surfaceGeometry = new TorusKnotBufferGeometry(
  10,
  3,
  100,
  16
).toNonIndexed();
const surfaceMaterial = new MeshLambertMaterial({
  color: api.surfaceColor,
  wireframe: false,
});
const surface = new Mesh(surfaceGeometry, surfaceMaterial);

let stemGeometry: InstancedBufferGeometry,
  blossomGeometry: InstancedBufferGeometry;

let stemMaterial: Material, blossomMaterial: Material;

let stemMesh: InstancedMesh, blossomMesh: InstancedMesh;

let sampler: MeshSurfaceSampler;
const ages = new Float32Array(count);
const scales = new Float32Array(count);

const _position = new Vector3();
const _normal = new Vector3();
const _scale = new Vector3();
const dummy = new Object3D();

function resample() {
  const vertexCount = surface.geometry.getAttribute('position').count;

  console.time('.build()');
  sampler = new MeshSurfaceSampler(surface)
    .setWeightAttribute(api.distribution === 'weighted' ? 'uv' : null)
    .build();
  console.timeEnd('.build()');

  console.time('.sample()');
  for (let i = 0; i < count; i++) {
    ages[i] = Math.random();
    scales[i] = scaleCurve(ages[i]);

    resampleParticle(i);
  }
  console.timeEnd('.sample()');
}

function scaleCurve(t: number) {
  return Math.abs(easeOutCubic((t > 0.5 ? 1 - t : t) * 2));
}

function easeOutCubic(t: number) {
  return --t * t * t + 1;
}

function resampleParticle(i: number) {
  sampler.sample(_position, _normal);
  _normal.add(_position);

  dummy.position.copy(_position);
  dummy.scale.set(scales[i], scales[i], scales[i]);
  dummy.lookAt(_normal);
  dummy.updateMatrix();

  stemMesh.setMatrixAt(i, dummy.matrix);
  blossomMesh.setMatrixAt(i, dummy.matrix);
}

function updateParticle(i: number) {
  ages[i] += 0.005;
  if (ages[i] >= 1) {
    ages[i] = 0.001;
    scales[i] = scaleCurve(ages[i]);
    resampleParticle(i);
    return;
  }

  const prevScale = scales[i];
  scales[i] = scaleCurve(ages[i]);
  _scale.set(
    scales[i] / prevScale,
    scales[i] / prevScale,
    scales[i] / prevScale
  );

  stemMesh.getMatrixAt(i, dummy.matrix);
  dummy.matrix.scale(_scale);
  stemMesh.setMatrixAt(i, dummy.matrix);
  blossomMesh.setMatrixAt(i, dummy.matrix);
}

//

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initPlane() {
    const loader = new GLTFLoader();
    loader.load('flower.glb', (gltf) => {
      const _stemMesh: any = gltf.scene.getObjectByName('Stem');
      const _blossomMesh: any = gltf.scene.getObjectByName('Blossom');

      stemGeometry = new InstancedBufferGeometry();
      blossomGeometry = new InstancedBufferGeometry();

      stemGeometry.copy(_stemMesh.geometry);
      blossomGeometry.copy(_blossomMesh.geometry);

      const defaultTransfrom = new Matrix4()
        .makeRotationX(Math.PI)
        .multiply(new Matrix4().makeScale(7, 7, 7));

      stemGeometry.applyMatrix4(defaultTransfrom);
      blossomGeometry.applyMatrix4(defaultTransfrom);

      stemMaterial = _stemMesh.material;
      blossomMaterial = _blossomMesh.material;

      const _color = new Color();
      const color = new Float32Array(count * 3);
      const blossomPalette = [0xf20587, 0xf2d479, 0xf2c879, 0xf2b077, 0xf24405];

      for (let i = 0; i < count; i++) {
        _color.setHex(
          blossomPalette[Math.floor(Math.random() * blossomPalette.length)]
        );
        _color.toArray(color, i * 3);
      }

      blossomGeometry.setAttribute(
        'color',
        new InstancedBufferAttribute(color, 3)
      );
      blossomMaterial.vertexColors = true;

      stemMesh = new InstancedMesh(stemGeometry, stemMaterial, count);
      blossomMesh = new InstancedMesh(blossomGeometry, blossomMaterial, count);

      stemMesh.instanceMatrix.setUsage(DynamicDrawUsage);
      blossomMesh.instanceMatrix.setUsage(DynamicDrawUsage);

      resample();

      this.scene.add(stemMesh);
      this.scene.add(blossomMesh);
      this.scene.add(surface);

      this.initGUI();
    });
  }
  initGUI() {
    const gui = new GUI();
    gui.add(api, 'count', 0, count).onChange((n) => {
      stemMesh.count = n;
      blossomMesh.count = n;
    });
    gui
      .add(api, 'distribution')
      .options(['random', 'weighted'])
      .onChange(resample);

    gui.add(api, 'resample');
  }

  render() {
    if (stemMesh && blossomMesh) {
      const time = Date.now() * 0.001;

      this.scene.rotation.x = Math.sin(time / 4);
      this.scene.rotation.y = Math.sin(time / 2);

      for (let i = 0; i < api.count; i++) {
        updateParticle(i);
      }

      stemMesh.instanceMatrix.needsUpdate = true;
      blossomMesh.instanceMatrix.needsUpdate = true;
    }
  }
}

new Demo();
