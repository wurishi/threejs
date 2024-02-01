import { GUI } from 'dat.gui';
import {
  BufferGeometry,
  Color,
  DirectionalLight,
  Font,
  FontLoader,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  PointLight,
  TextGeometry,
  Triangle,
  Vector3,
} from 'three';
import { Main } from '../../../main';

const permalink = document.createElement('a');
permalink.id = 'permalink';
permalink.href = '#';
document.body.appendChild(permalink);

function decimalToHex(d: number) {
  let hex = Number(d).toString(16);
  hex = '000000'.substr(0, 6 - hex.length) + hex;
  return hex.toUpperCase();
}

function boolToNum(b: boolean): number {
  return b ? 1 : 0;
}

const fontMap: any = {
  helvetiker: 0,
  optimer: 1,
  gentilis: 2,
  droid_sans: 3,
  droid_serif: 4,
};

const weightMap: any = {
  regular: 0,
  bold: 1,
};

class Demo extends Main {
  pointLight: PointLight;
  hex = '';
  cameraTarget: Vector3;

  reverseFontMap: string[];
  reverseWeightMap: string[];

  fontName = '';
  fontWeight = '';
  bevelEnabled = true;
  text = '';

  materials: MeshPhongMaterial[];
  group: Group;
  font: Font;

  mirror = false;

  //
  initHemiLight() {}
  initDirLight() {
    const dirLight = new DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    this.scene.add(dirLight);

    const pointLight = new PointLight(0xfffff, 1.5);
    pointLight.position.set(0, 100, 90);
    this.scene.add(pointLight);
    this.pointLight = pointLight;
  }
  initCamera() {
    super.initCamera(30, 1, 1500, new Vector3(0, 400, 700));
    this.cameraTarget = new Vector3(0, 150, 0);
  }
  initScene() {
    super.initScene(0x000000, 250, 1400);
  }
  initPlane() {
    this.reverseFontMap = [];
    this.reverseWeightMap = [];

    for (const key in fontMap) {
      this.reverseFontMap[fontMap[key]] = key;
    }
    for (const key in weightMap) {
      this.reverseWeightMap[weightMap[key]] = key;
    }
    this.fontName = this.reverseFontMap[0];
    this.fontWeight = this.reverseWeightMap[0];
    this.bevelEnabled = false;
    this.text = 'Hello World';
    this.mirror = false;
    this.hex = 'FF00D0';
    //

    // const hash = document.location.hash.substr(1);

    // if (hash.length !== 0) {
    //   const colorhash = hash.substring(0, 6);
    //   const fonthash = hash.substring(6, 7);
    //   const weighthash = hash.substring(7, 8);
    //   const bevelhash = hash.substring(8, 9);
    //   const texthash = hash.substring(10);

    //   this.hex = colorhash;
    //   this.pointLight.color.setHex(parseInt(colorhash, 16));

    //   this.fontName = this.reverseFontMap[parseInt(fonthash)];
    //   this.fontWeight = this.reverseWeightMap[parseInt(weighthash)];

    //   this.bevelEnabled = parseInt(bevelhash) == 1 ? true : false;
    //   this.text = decodeURI(texthash);

    //   this.updatePermalink();
    // } else {
    // this.pointLight.color.setHSL(parseInt(this.hex, 16), 1, 0.5);
    // this.hex = decimalToHex(this.pointLight.color.getHex());
    // }
    this.pointLight.color = new Color(parseInt(this.hex, 16));

    this.materials = [
      new MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
      new MeshPhongMaterial({ color: 0xffffff }), // side
    ];

    this.group = new Group();
    this.group.position.y = 100;
    this.scene.add(this.group);

    this.loadFont();

    const plane = new Mesh(
      new PlaneBufferGeometry(10000, 10000),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    plane.position.y = 100;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    this.initGUI();
  }

  initGUI() {
    const params = {
      fontName: this.reverseFontMap[0],
      fontWeight: this.reverseWeightMap[0],
      color: parseInt(this.hex, 16),
      mirror: this.mirror,
      bevelEnabled: true,
      text: 'Hello World',
    };

    const gui = new GUI();

    gui
      .add(params, 'fontName', this.reverseFontMap)
      .name('字体名')
      .onChange((v) => {
        this.fontName = v;
        this.loadFont();
      });

    gui
      .add(params, 'fontWeight', this.reverseWeightMap)
      .name('样式')
      .onChange((v) => {
        this.fontWeight = v;
        this.loadFont();
      });

    gui.addColor(params, 'color').onChange((c) => {
      this.pointLight.color = new Color(c);
      this.hex = decimalToHex(this.pointLight.color.getHex());
    });

    gui.add(params, 'mirror').onChange((v) => {
      this.mirror = v;
      this.refreshText();
    });
    gui.add(params, 'bevelEnabled').onChange((v) => {
      this.bevelEnabled = v;
      this.refreshText();
    });
    gui.add(params, 'text').onChange((v) => {
      this.text = v;
      this.refreshText();
    });
  }

  loadFont() {
    this.fontName = this.fontName || this.reverseFontMap[0];
    this.fontWeight = this.fontWeight || this.reverseWeightMap[0];
    const loader = new FontLoader();
    const url =
      'fonts/' + this.fontName + '_' + this.fontWeight + '.typeface.json';
    // console.log(url);
    loader.load(url, (res) => {
      this.font = res;
      this.refreshText();
    });
  }

  updatePermalink() {
    // const link =
    //   this.hex +
    //   fontMap[this.fontName] +
    //   weightMap[this.fontWeight] +
    //   boolToNum(this.bevelEnabled);
    // permalink.href = '#' + link;
    // window.location.href = permalink.href;
  }

  refreshText() {
    this.group.remove(this.textMesh1);

    this.group.remove(this.textMesh2);
    if (!this.text) {
      this.text = 'Hello World';
    }
    this.createText();
  }

  textGeo: TextGeometry | BufferGeometry;
  textMesh1: Mesh;
  textMesh2: Mesh;

  createText() {
    this.textGeo = new TextGeometry(this.text, {
      font: this.font,
      size: 70,
      height: 20,
      curveSegments: 4,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelEnabled: this.bevelEnabled,
    });

    // console.log(this.textGeo);

    this.textGeo.computeBoundingBox();
    this.textGeo.computeVertexNormals();

    const triangle = new Triangle();

    if (!this.bevelEnabled) {
      const triangleAreaHeuristics = 0.1 * (70 * 20);

      for (let i = 0, len = this.textGeo.faces.length; i < len; i++) {
        const face = this.textGeo.faces[i];
        if (face.materialIndex == 1) {
          for (let j = 0, jlen = face.vertexNormals.length; j < jlen; j++) {
            face.vertexNormals[j].z = 0;
            face.vertexNormals[j].normalize();
          }
          const va = this.textGeo.vertices[face.a];
          const vb = this.textGeo.vertices[face.b];
          const vc = this.textGeo.vertices[face.c];

          const s = triangle.set(va, vb, vc).getArea();

          if (s > triangleAreaHeuristics) {
            for (let j = 0; j < face.vertexNormals.length; j++) {
              face.vertexNormals[j].copy(face.normal);
            }
          }
        }
      }
    }

    const centerOffset =
      -0.5 * (this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x);
    this.textGeo = new BufferGeometry().fromGeometry(this.textGeo);

    this.textMesh1 = new Mesh(this.textGeo, this.materials);
    this.textMesh1.position.set(centerOffset, 30, 0);
    this.textMesh1.rotation.set(0, Math.PI * 2, 0);

    this.group.add(this.textMesh1);

    if (this.mirror) {
      this.textMesh2 = new Mesh(this.textGeo, this.materials);
      this.textMesh2.position.set(centerOffset, -30, 20);
      this.textMesh2.rotation.set(Math.PI, Math.PI * 2, 0);
      this.group.add(this.textMesh2);
    }
  }
}

new Demo();
