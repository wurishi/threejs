import { Main } from '../../../main';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import {
  AmbientLight,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  PlaneBufferGeometry,
  TextureLoader,
  Vector3,
} from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

const worldWidth = 128,
  worldDepth = 128;
const worldHalfWidth = worldWidth / 2,
  worldHalfDepth = worldDepth / 2;
const data = generateHeight(worldWidth, worldDepth);

function generateHeight(width: number, height: number) {
  const data: number[] = [],
    perlin = new ImprovedNoise(),
    size = width * height,
    z = Math.random() * 100;

  let quality = 2;

  for (let j = 0; j < 4; j++) {
    if (j === 0) {
      for (let i = 0; i < size; i++) {
        data[i] = 0;
      }
    }
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = (i / width) | 0;
      data[i] += perlin.noise(x / quality, y / quality, z) * quality;
    }
    quality *= 4;
  }

  return data;
}

function getY(x: number, z: number): number {
  return (data[x + z * worldWidth] * 0.2) | 0;
}

class Demo extends Main {
  controls: FirstPersonControls;

  initCamera() {
    super.initCamera(
      60,
      1,
      20000,
      new Vector3(0, getY(worldHalfWidth, worldHalfDepth) * 100 + 100, 0)
    );
  }

  initScene() {
    super.initScene(0xbfd1e5, 0, 0, false);
  }

  initPlane() {
    const matrix = new Matrix4();

    const [pxGeometry, nxGeometry, pyGeometry, pzGeometry, nzGeometry] = [
      { ry: Math.PI / 2, t: new Vector3(50, 0, 0), a: [1, 3] },
      { ry: -Math.PI / 2, t: new Vector3(-50, 0, 0), a: [1, 3] },
      { rx: -Math.PI / 2, t: new Vector3(0, 50, 0), a: [5, 7] },
      { t: new Vector3(0, 0, 50), a: [1, 3] },
      { ry: Math.PI, t: new Vector3(0, 0, -50), a: [1, 3] },
    ].map(({ rx, ry, t, a }) => {
      const geometry = new PlaneBufferGeometry(100, 100);
      const arr = geometry.attributes.uv.array as number[];
      a.forEach((arrI) => (arr[arrI] = 0.5));
      rx && geometry.rotateX(rx);
      ry && geometry.rotateY(ry);
      geometry.translate(t.x, t.y, t.z);

      return geometry;
    });

    const geometries: BufferGeometry[] = [];

    for (let z = 0; z < worldDepth; z++) {
      for (let x = 0; x < worldWidth; x++) {
        const h = getY(x, z);
        matrix.makeTranslation(
          x * 100 - worldHalfWidth * 100,
          h * 100,
          z * 100 - worldHalfDepth * 100
        );

        const px = getY(x + 1, z);
        const nx = getY(x - 1, z);
        const pz = getY(x, z + 1);
        const nz = getY(x, z - 1);

        geometries.push(pyGeometry.clone().applyMatrix4(matrix));

        if ((px !== h && px !== h + 1) || x == 0) {
          geometries.push(pxGeometry.clone().applyMatrix4(matrix));
        }
        if ((nx !== h && nx !== h + 1) || x === worldWidth - 1) {
          geometries.push(nxGeometry.clone().applyMatrix4(matrix));
        }
        if ((pz !== h && pz !== h + 1) || z === worldDepth - 1) {
          geometries.push(pzGeometry.clone().applyMatrix4(matrix));
        }
        if ((nz !== h && nz !== h + 1) || z === 0) {
          geometries.push(nzGeometry.clone().applyMatrix4(matrix));
        }
      }
    }

    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    geometry.computeBoundingSphere();

    const texture = new TextureLoader().load('atlas.png');
    texture.magFilter = NearestFilter;

    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({
        map: texture,
        side: DoubleSide,
      })
    );
    this.scene.add(mesh);
  }

  initHemiLight() {
    this.scene.add(new AmbientLight(0xcccccc));
  }

  initDirLight() {
    const directionalLight = new DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  // initControls() {
  //   this.controls = new FirstPersonControls(
  //     this.camera,
  //     this.renderer.domElement
  //   );
  //   this.controls.lookSpeed = 0.125;
  //   this.controls.movementSpeed = 1000;
  //   this.controls.lookVertical = true;
  // }

  initRenderer() {
    super.initRenderer(true, null);
  }

  render() {
    // this.controls.update(this.clock.getDelta());
  }
}

new Demo();
