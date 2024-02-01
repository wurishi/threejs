import { Main } from '../../../main';

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import {
  DirectionalLight,
  Font,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
  PointLight,
  TextGeometry,
  Vector3,
} from 'three';

const cameraTarget = new Vector3(0, 150, 0);

const height = 20,
  size = 70,
  hover = 30,
  curveSegments = 4,
  bevelThickness = 2,
  bevelSize = 1.5;

class Demo extends Main {
  initCamera() {
    super.initCamera(30, 1, 1500, new Vector3(0, 400, 700));
  }

  initScene() {
    super.initScene(0x000000, 250, 1400);
  }

  initDirLight() {
    const dirLight = new DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    this.scene.add(dirLight);

    pointLight = new PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 90);
    pointLight.color.setHSL(Math.random(), 1, 0.5);
    this.scene.add(pointLight);
  }

  initPlane() {
    material = new MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
    });

    group = new Group();
    group.position.y = 100;

    this.scene.add(group);

    const loader = new TTFLoader();
    loader.load('kenpixel.ttf', (json) => {
      font = new Font(json);
      createText();
    });

    const plane = new Mesh(
      new PlaneGeometry(10000, 10000),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    plane.position.y = 100;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    window.addEventListener('keypress', (event) => {
      if (event.key === ' ') {
        pointLight.color.setHex(Math.random() * 0xffffff);
        event.preventDefault();
      } else {
        const ch = event.key;
        text += ch;
        refreshText();
      }
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        text = text.substring(0, text.length - 1);
        refreshText();
        return false;
      }
    });
  }
}

function createText() {
  textGeo = new TextGeometry(text, {
    font,
    height,
    curveSegments,
    bevelThickness,
    bevelSize,
    bevelEnabled: true,
  });
  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();

  const centerOffset =
    -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
  textMesh1 = new Mesh(textGeo, material);

  textMesh1.position.set(centerOffset, hover, 0);

  textMesh1.rotation.set(0, Math.PI * 2, 0);

  group.add(textMesh1);

  if (mirror) {
    textMesh2 = new Mesh(textGeo, material);

    textMesh2.position.set(centerOffset, -hover, height);

    textMesh2.rotation.set(Math.PI, Math.PI * 2, 0);
    group.add(textMesh2);
  }
}

function refreshText() {
  group.remove(textMesh1);
  if (mirror) group.remove(textMesh2);
  if (!text) return;
  createText();
}

let material: MeshPhongMaterial;
let group: Group;
let font: Font;
let text = '';
let textGeo: TextGeometry;
let textMesh1: Mesh;
let textMesh2: Mesh;
let mirror = true;
let pointLight: PointLight;

new Demo();
