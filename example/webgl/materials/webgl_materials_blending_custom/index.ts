import { GUI } from 'dat.gui';
import {
  AddEquation,
  CanvasTexture,
  CustomBlending,
  DstAlphaFactor,
  DstColorFactor,
  Material,
  MaxEquation,
  Mesh,
  MeshBasicMaterial,
  MinEquation,
  OneFactor,
  OneMinusDstAlphaFactor,
  OneMinusDstColorFactor,
  OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor,
  PlaneGeometry,
  RepeatWrapping,
  ReverseSubtractEquation,
  SrcAlphaFactor,
  SrcAlphaSaturateFactor,
  SrcColorFactor,
  SubtractEquation,
  Texture,
  TextureLoader,
  Vector3,
  ZeroFactor,
} from 'three';
import { Main } from '../../../main';

const images = [
  'disturb.jpg',
  'sprite0.jpg',
  'sprite0.png',
  'lensflare0.png',
  'lensflare0_alpha.png',
  'ball.png',
  'snowflake7_alpha.png',
];

const backs = [
  'disturb.jpg',
  '',
  '',
  'crate.gif',
  'lavatile.jpg',
  'water.jpg',
  'cloud.png',
];

class Demo extends Main {
  initCamera() {
    super.initCamera(80, 1, 1000, new Vector3(0, 0, 700));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  // initControls() {
  // super.initControls(new Vector3(0, 200, 0));
  // }

  initPlane() {
    initDOM();

    // this.camera.lookAt(new Vector3(0, 200, 0));

    const canvas1 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    canvas1.width = canvas1.height = 128;
    ctx1.fillStyle = '#eee';
    ctx1.fillRect(0, 0, 128, 128);
    ctx1.fillStyle = '#999';
    ctx1.fillRect(0, 0, 64, 64);
    ctx1.fillStyle = '#aaa';
    ctx1.fillRect(32, 32, 32, 32);
    ctx1.fillStyle = '#999';
    ctx1.fillRect(64, 64, 64, 64);
    ctx1.fillStyle = '#bbb';
    ctx1.fillRect(96, 96, 32, 32);
    document.getElementById('bg_1').appendChild(canvas1);

    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = canvas2.height = 128;
    ctx2.fillStyle = '#444';
    ctx2.fillRect(0, 0, 128, 128);
    ctx2.fillStyle = '#000';
    ctx2.fillRect(0, 0, 64, 64);
    ctx2.fillStyle = '#111';
    ctx2.fillRect(32, 32, 32, 32);
    ctx2.fillStyle = '#000';
    ctx2.fillRect(64, 64, 64, 64);
    ctx2.fillStyle = '#222';
    ctx2.fillRect(96, 96, 32, 32);

    document.getElementById('bg_2').appendChild(canvas2);

    const textureLoader = new TextureLoader();
    mapBgList = [
      [8, 4],
      [128, 64],
      [128, 64],
      [32, 16],
      [8, 4],
      [8, 4],
      [2, 1],
    ].map(([x, y], i) => {
      let mapBg: Texture;
      if (i == 1) {
        mapBg = new CanvasTexture(canvas1);
      } else if (i == 2) {
        mapBg = new CanvasTexture(canvas2);
      } else {
        mapBg = textureLoader.load(backs[i]);
      }
      mapBg.wrapT = mapBg.wrapS = RepeatWrapping;
      mapBg.repeat.set(x, y);
      return mapBg;
    });

    materialBg = new MeshBasicMaterial({ map: mapBgList[0] });
    const meshBg = new Mesh(new PlaneGeometry(4000, 2000), materialBg);
    meshBg.position.set(0, 0, -1);
    this.scene.add(meshBg);

    for (let i = 0; i < images.length; i++) {
      const map = textureLoader.load(images[i]);
      mapsNoPre.push(map);

      const mapPre = textureLoader.load(images[i]);
      mapPre.premultiplyAlpha = true;
      mapPre.needsUpdate = true;
      mapsPre.push(mapPre);
    }

    currentMaps = mapsNoPre.concat();

    //
    const src = [
      { name: 'Zero', constant: ZeroFactor },
      { name: 'One', constant: OneFactor },
      { name: 'SrcColor', constant: SrcColorFactor },
      { name: 'OneMinusSrcColor', constant: OneMinusSrcColorFactor },
      { name: 'SrcAlpha', constant: SrcAlphaFactor },
      { name: 'OneMinusSrcAlpha', constant: OneMinusSrcAlphaFactor },
      { name: 'DstAlpha', constant: DstAlphaFactor },
      { name: 'OneMinusDstAlpha', constant: OneMinusDstAlphaFactor },
      { name: 'DstColor', constant: DstColorFactor },
      { name: 'OneMinusDstColor', constant: OneMinusDstColorFactor },
      { name: 'SrcAlphaSaturate', constant: SrcAlphaSaturateFactor },
    ];

    const dst = [
      { name: 'Zero', constant: ZeroFactor },
      { name: 'One', constant: OneFactor },
      { name: 'SrcColor', constant: SrcColorFactor },
      { name: 'OneMinusSrcColor', constant: OneMinusSrcColorFactor },
      { name: 'SrcAlpha', constant: SrcAlphaFactor },
      { name: 'OneMinusSrcAlpha', constant: OneMinusSrcAlphaFactor },
      { name: 'DstAlpha', constant: DstAlphaFactor },
      { name: 'OneMinusDstAlpha', constant: OneMinusDstAlphaFactor },
      { name: 'DstColor', constant: DstColorFactor },
      { name: 'OneMinusDstColor', constant: OneMinusDstColorFactor },
    ];

    const geo1 = new PlaneGeometry(100, 100);
    const geo2 = new PlaneGeometry(100, 25);
    for (let i = 0; i < dst.length; i++) {
      const blendDst = dst[i];
      for (let j = 0; j < src.length; j++) {
        const blendSrc = src[j];
        const material = new MeshBasicMaterial({
          map: currentMaps[currentIndex],
        });
        material.transparent = true;

        material.blending = CustomBlending;
        material.blendSrc = blendSrc.constant;
        material.blendDst = blendDst.constant;
        material.blendEquation = AddEquation;

        const x = (j - src.length / 2) * 110;
        const z = 0;
        const y = (i - dst.length / 2) * 110 + 50;

        const mesh = new Mesh(geo1, material);
        mesh.position.set(x, -y, z);
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        this.scene.add(mesh);

        materials.push(material);
      }
    }

    for (let j = 0; j < src.length; j++) {
      const blendSrc = src[j];
      const x = (j - src.length / 2) * 110;
      const z = 0;
      const y = (0 - dst.length / 2) * 110 + 50;

      const mesh = new Mesh(
        geo2,
        generateLabelMaterial(blendSrc.name, 'rgba(0,150,0,1)')
      );
      mesh.position.set(x, -(y - 70), z);
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.scene.add(mesh);
    }

    for (let i = 0; i < dst.length; i++) {
      const blendDst = dst[i];

      const x = (0 - src.length / 2) * 110 - 125;
      const z = 0;
      const y = (i - dst.length / 2) * 110 + 165;

      const mesh = new Mesh(
        geo2,
        generateLabelMaterial(blendDst.name, 'rgba(150,0,0,1)')
      );
      mesh.position.set(x, -(y - 120), z);
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.scene.add(mesh);
    }

    this.initGUI();
  }

  render() {
    const time = Date.now() * 0.00025;
    const ox = (time * -0.01 * materialBg.map.repeat.x) % 1;
    const oy = (time * -0.01 * materialBg.map.repeat.y) % 1;

    materialBg.map.offset.set(ox, oy);
  }

  initGUI() {
    images.forEach((_, i) => {
      const el = document.getElementById('img_' + i);
      el.addEventListener('click', () => {
        materials.forEach((material) => {
          (material as any).map = currentMaps[i];
          currentIndex = i;
        });
      });
    });

    backs.forEach((_, i) => {
      const el = document.getElementById('bg_' + i);
      el.addEventListener('click', () => {
        materialBg.map = mapBgList[i];
      });
    });

    const gui = new GUI();
    const equation: any = {
      add: AddEquation,
      sub: SubtractEquation,
      rsub: ReverseSubtractEquation,
      min: MinEquation,
      max: MaxEquation,
    };
    const api = {
      equation: 'add',
      pa: false,
    };
    gui
      .add(api, 'equation', Object.keys(equation))
      .name('Equation')
      .onChange((val) => {
        const eq = equation[val];

        materials.forEach((material) => (material.blendEquation = eq));
      });

    gui
      .add(api, 'pa')
      .name('Premultiply Alpha')
      .onChange((val) => {
        if (val) {
          currentMaps = mapsPre.concat();
        } else {
          currentMaps = mapsNoPre.concat();
        }
        materials.forEach((material) => {
          (material as any).map = currentMaps[currentIndex];
        });
      });
  }
}

function generateLabelMaterial(text: string, bg: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 32;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 128, 32);

  ctx.fillStyle = 'white';
  ctx.font = '22pt arial bold';
  ctx.fillText(text, 8, 22);

  const map = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map, transparent: true });
  return material;
}

let materialBg: MeshBasicMaterial;
const mapsNoPre: Texture[] = [];
const mapsPre: Texture[] = [];
let currentMaps: Texture[] = [];
let currentIndex = 4;
const materials: Material[] = [];
let mapBgList: Texture[];

function initDOM() {
  const imgDiv = document.createElement('div');
  imgDiv.id = 'images';
  imgDiv.textContent = 'Foreground';
  imgDiv.style.position = 'absolute';
  imgDiv.style.left = '10px';
  imgDiv.style.top = '100px';
  imgDiv.style.backgroundColor = 'black';
  imgDiv.style.color = 'white';
  imgDiv.style.width = '100px';
  document.body.appendChild(imgDiv);

  images.forEach((src, i) => {
    const a = document.createElement('a');
    a.id = 'img_' + i;
    a.href = '#';
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '80px';
    img.style.height = '80px';
    a.appendChild(img);
    imgDiv.appendChild(a);
  });

  const backDiv = document.createElement('div');
  backDiv.id = 'backgrounds';
  backDiv.textContent = 'Background';
  backDiv.style.position = 'absolute';
  backDiv.style.left = '110px';
  backDiv.style.top = '100px';
  backDiv.style.backgroundColor = 'black';
  backDiv.style.color = 'white';
  backDiv.style.width = '100px';
  document.body.appendChild(backDiv);

  backs.forEach((src, i) => {
    const a = document.createElement('a');
    a.id = 'bg_' + i;
    a.href = '#';
    backDiv.appendChild(a);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.style.width = img.style.height = '80px';
      a.appendChild(img);
    }
  });
}

new Demo();
