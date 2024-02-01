import { Main } from '../../../main';

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';
import {
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Geometry,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  PlaneGeometry,
  TextureLoader,
  Vector3,
} from 'three';

const worldWidth = 200,
  worldDepth = 200;
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
    if (j == 0) {
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

function getY(x: number, z: number) {
  return (data[x + z * worldWidth] * 0.2) | 0;
}

class Demo extends Main {
  initCamera() {
    super.initCamera(
      50,
      1,
      20000,
      new Vector3(0, getY(worldHalfWidth, worldHalfDepth) * 100 + 100)
    );
  }

  initScene() {
    super.initScene(0xffffff, 0, 0, false);
    this.scene.fog = new FogExp2(0xffffff, 0.00015);
  }

  initPlane() {
    const light = new Color(0xffffff);
    const shadow = new Color(0x505050);

    const matrix = new Matrix4();

    const [
      pxGeometry,
      nxGeometry,
      pyGeometry,
      py2Geometry,
      pzGeometry,
      nzGeometry,
    ] = [
      {
        faces: [
          [light, shadow, light],
          [shadow, shadow, light],
        ],
        uvs: [0, 0, 0, 0, 0, 2, 0, 1, 2],
        ry: Math.PI / 2,
        t: new Vector3(50, 0, 0),
      },
      {
        faces: [
          [light, shadow, light],
          [shadow, shadow, light],
        ],
        uvs: [0, 0, 0, 0, 0, 2, 0, 1, 2],
        ry: -Math.PI / 2,
        t: new Vector3(-50, 0, 0),
      },
      {
        faces: [
          [light, light, light],
          [light, light, light],
        ],
        uvs: [0, 0, 1, 0, 1, 0, 0, 1, 1],
        rx: -Math.PI / 2,
        t: new Vector3(0, 50, 0),
      },
      {
        faces: [
          [light, light, light],
          [light, light, light],
        ],
        uvs: [0, 0, 1, 0, 1, 0, 0, 1, 1],
        rx: -Math.PI / 2,
        ry: Math.PI / 2,
        t: new Vector3(0, 50, 0),
      },
      {
        faces: [
          [light, shadow, light],
          [shadow, shadow, light],
        ],
        uvs: [0, 0, 0, 0, 0, 2, 0, 1, 2],
        t: new Vector3(0, 0, 50),
      },
      {
        faces: [
          [light, shadow, light],
          [shadow, shadow, light],
        ],
        uvs: [0, 0, 0, 0, 0, 2, 0, 1, 2],
        ry: Math.PI,
        t: new Vector3(0, 0, -50),
      },
    ].map((c) => {
      const geometry = new PlaneGeometry(100, 100);
      c.faces.forEach((vertexColors, i) => {
        geometry.faces[i].vertexColors = vertexColors;
      });
      for (let i = 0, len = c.uvs.length; i < len; i += 3) {
        geometry.faceVertexUvs[c.uvs[i]][c.uvs[i + 1]][c.uvs[i + 2]].y = 0.5;
      }
      c.rx && geometry.rotateX(c.rx);
      c.ry && geometry.rotateY(c.ry);
      geometry.translate(c.t.x, c.t.y, c.t.z);
      return geometry;
    });

    const geometry = new Geometry();

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

        const pxpz = getY(x + 1, z + 1);
        const nxpz = getY(x - 1, z + 1);
        const pxnz = getY(x + 1, z - 1);
        const nxnz = getY(x - 1, z - 1);

        const a = nx > h || nz > h || nxnz > h ? 0 : 1;
        const b = nx > h || pz > h || nxpz > h ? 0 : 1;
        const c = px > h || pz > h || pxpz > h ? 0 : 1;
        const d = px > h || nz > h || pxnz > h ? 0 : 1;

        if (a + c > b + d) {
          let colors = py2Geometry.faces[0].vertexColors;
          colors[0] = b === 0 ? shadow : light;
          colors[1] = c === 0 ? shadow : light;
          colors[2] = a === 0 ? shadow : light;

          colors = py2Geometry.faces[1].vertexColors;
          colors[0] = c === 0 ? shadow : light;
          colors[1] = d === 0 ? shadow : light;
          colors[2] = a === 0 ? shadow : light;

          geometry.merge(py2Geometry, matrix);
        } else {
          let colors = pyGeometry.faces[0].vertexColors;
          colors[0] = a === 0 ? shadow : light;
          colors[1] = b === 0 ? shadow : light;
          colors[2] = d === 0 ? shadow : light;

          colors = pyGeometry.faces[1].vertexColors;
          colors[0] = b === 0 ? shadow : light;
          colors[1] = c === 0 ? shadow : light;
          colors[2] = d === 0 ? shadow : light;

          geometry.merge(py2Geometry, matrix);
        }

        if ((px != h && px != h + 1) || x == 0) {
          let colors = pxGeometry.faces[0].vertexColors;
          colors[0] = pxpz > px && x > 0 ? shadow : light;
          colors[2] = pxnz > px && x > 0 ? shadow : light;

          colors = pxGeometry.faces[1].vertexColors;
          colors[2] = pxnz > px && x > 0 ? shadow : light;

          geometry.merge(pxGeometry, matrix);
        }

        if ((nx != h && nx != h + 1) || x == worldWidth - 1) {
          let colors = nxGeometry.faces[0].vertexColors;
          colors[0] = nxnz > nx && x < worldWidth - 1 ? shadow : light;
          colors[2] = nxpz > nx && x < worldWidth - 1 ? shadow : light;

          colors = nxGeometry.faces[1].vertexColors;
          colors[2] = nxpz > nx && x < worldWidth - 1 ? shadow : light;

          geometry.merge(nxGeometry, matrix);
        }

        if ((pz != h && pz != h + 1) || z == worldDepth - 1) {
          let colors = pzGeometry.faces[0].vertexColors;
          colors[0] = nxpz > pz && z < worldDepth - 1 ? shadow : light;
          colors[2] = pxpz > pz && z < worldDepth - 1 ? shadow : light;

          colors = pzGeometry.faces[1].vertexColors;
          colors[2] = pxpz > pz && z < worldDepth - 1 ? shadow : light;

          geometry.merge(pzGeometry, matrix);
        }

        if ((nz != h && nz != h + 1) || z == 0) {
          let colors = nzGeometry.faces[0].vertexColors;
          colors[0] = pxnz > nz && z > 0 ? shadow : light;
          colors[2] = nxnz > nz && z > 0 ? shadow : light;

          colors = nzGeometry.faces[1].vertexColors;
          colors[2] = nxnz > nz && z > 0 ? shadow : light;

          geometry.merge(nzGeometry, matrix);
        }
      }
    }

    this.geometry = new BufferGeometry().fromGeometry(geometry);

    const texture = new TextureLoader().load('atlas.png');
    texture.magFilter = NearestFilter;
    texture.minFilter = LinearMipmapLinearFilter;

    const mesh = new Mesh(
      this.geometry,
      new MeshLambertMaterial({
        map: texture,
        vertexColors: true,
        side: DoubleSide,
      })
    );
    this.scene.add(mesh);
  }

  geometry: BufferGeometry;

  initRenderer() {
    super.initRenderer(true, null);
  }

  initHemiLight() {
    this.scene.add(new AmbientLight(0xcccccc));
  }

  initDirLight() {
    const directionalLight = new DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }
}

new Demo();
