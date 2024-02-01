import {
  AdditiveBlending,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  PlaneGeometry,
  RepeatWrapping,
  SubtractiveBlending,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initCamera() {
    super.initCamera(70, 1, 1000, new Vector3(0, 0, 600));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 128;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#999';
    ctx.fillRect(32, 32, 32, 32);
    ctx.fillStyle = '#555';
    ctx.fillRect(64, 64, 64, 64);
    ctx.fillStyle = '#777';
    ctx.fillRect(96, 96, 32, 32);

    mapBg = new CanvasTexture(canvas);
    mapBg.wrapS = mapBg.wrapT = RepeatWrapping;
    mapBg.repeat.set(128, 64);

    const materialBg = new MeshBasicMaterial({ map: mapBg });
    const meshBg = new Mesh(new PlaneGeometry(4000, 2000), materialBg);
    meshBg.position.set(0, 0, -1);
    this.scene.add(meshBg);

    const blendings = [
      { name: 'No', constant: NoBlending },
      { name: 'Normal', constant: NormalBlending },
      { name: 'Additive', constant: AdditiveBlending },
      { name: 'Subtractive', constant: SubtractiveBlending },
      { name: 'Multiply', constant: MultiplyBlending },
    ];

    const textureLoader = new TextureLoader();

    const map0 = textureLoader.load('uv_grid_opengl.jpg');
    const map1 = textureLoader.load('sprite0.jpg');
    const map2 = textureLoader.load('sprite0.png');
    const map3 = textureLoader.load('lensflare0.png');
    const map4 = textureLoader.load('lensflare0_alpha.png');

    const geo1 = new PlaneGeometry(100, 100);
    const geo2 = new PlaneGeometry(100, 25);

    const addImageRow = (map: Texture, y: number) => {
      blendings.forEach((blend, i) => {
        const material = new MeshBasicMaterial({ map });
        material.transparent = true;
        material.blending = blend.constant;

        const x = (i - blendings.length / 2) * 110;
        const z = 0;

        let mesh = new Mesh(geo1, material);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);

        mesh = new Mesh(geo2, generateLabelMaterial(blend.name));
      });
    };

    addImageRow(map0, 300);
    addImageRow(map1, 150);
    addImageRow(map2, 0);
    addImageRow(map3, -150);
    addImageRow(map4, -300);
  }

  render() {
    const time = Date.now() * 0.00025;
    const ox = (time * -0.01 * mapBg.repeat.x) % 1;
    const oy = (time * -0.01 * mapBg.repeat.y) % 1;

    mapBg.offset.set(ox, oy);
  }
}

function generateLabelMaterial(text: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 32;

  ctx.fillStyle = 'rgba(0,0,0,0.95)';
  ctx.fillRect(0, 0, 128, 32);

  ctx.fillStyle = 'white';
  ctx.font = '12pt arial bold';
  ctx.fillText(text, 10, 22);

  const map = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map, transparent: true });

  return material;
}

let mapBg: CanvasTexture;

new Demo();
