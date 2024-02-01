import { GUI } from 'dat.gui';
import {
  AmbientLight,
  Color,
  CubeTexture,
  CubeTextureLoader,
  DirectionalLight,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  RepeatWrapping,
  sRGBEncoding,
  TextureLoader,
  Vector3,
} from 'three';
import { TeapotBufferGeometry } from 'three/examples/jsm/geometries/TeapotBufferGeometry';
import { Main } from '../../../main';

class Demo extends Main {
  textureCube: CubeTexture;

  wireMaterial: Material;
  flatMaterial: Material;
  gouraudMaterial: Material;
  phongMaterial: Material;
  texturedMaterial: Material;
  reflectiveMaterial: Material;

  initCamera() {
    super.initCamera(45, 1, 80000, new Vector3(-600, 220, 1300));
  }

  initScene() {
    super.initScene(0xaaaaaa, 0, 0, false);
  }

  initHemiLight() {}

  ambientLight: AmbientLight;
  light: DirectionalLight;
  initDirLight() {
    this.ambientLight = new AmbientLight(0x333333);
    this.light = new DirectionalLight(0xffffff, 1);

    this.scene.add(this.ambientLight);
    this.scene.add(this.light);
  }

  initPlane() {
    // TEXTURE MAP
    const textureMap = new TextureLoader().load('uv_grid_opengl.jpg');
    textureMap.wrapS = textureMap.wrapT = RepeatWrapping;
    textureMap.anisotropy = 16;
    textureMap.encoding = sRGBEncoding;

    // REFLECTION MAP

    const urls = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((t) => t + '.png');
    const textureCube = new CubeTextureLoader().load(urls);
    textureCube.encoding = sRGBEncoding;
    this.textureCube = textureCube;

    // MATERIALS

    const materialColor = new Color();
    materialColor.setRGB(1.0, 1.0, 1.0);

    this.wireMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    this.flatMaterial = new MeshPhongMaterial({
      color: materialColor,
      specular: 0x000000,
      flatShading: true,
      side: DoubleSide,
    });
    this.gouraudMaterial = new MeshLambertMaterial({
      color: materialColor,
      side: DoubleSide,
    });
    this.phongMaterial = new MeshPhongMaterial({
      color: materialColor,
      side: DoubleSide,
    });
    this.texturedMaterial = new MeshPhongMaterial({
      color: materialColor,
      map: textureMap,
      side: DoubleSide,
    });
    this.reflectiveMaterial = new MeshPhongMaterial({
      color: materialColor,
      envMap: textureCube,
      side: DoubleSide,
    });

    this.initGUI();
  }

  effectController: any;

  initGUI() {
    this.effectController = {
      shininess: 40.0,
      ka: 0.17,
      kd: 0.51,
      ks: 0.2,
      metallic: true,

      hue: 0.121,
      saturation: 0.73,
      lightness: 0.66,

      lhue: 0.04,
      lsaturation: 0.01,
      llightness: 1.0,

      lx: 0.32,
      ly: 0.39,
      lz: 0.7,
      newTess: 15,
      bottom: true,
      lid: true,
      body: true,
      fitLid: false,
      nonblinn: false,
      newShading: 'glossy',
    };

    const gui = new GUI();
    let h = gui.addFolder('Material control');
    h.add(this.effectController, 'shininess', 1.0, 400.0, 1.0).name(
      'shininess'
    );
    h.add(this.effectController, 'kd', 0.0, 1.0, 0.025).name(
      'diffuse strength'
    );
    h.add(this.effectController, 'ks', 0.0, 1.0, 0.025).name(
      'specular strength'
    );
    h.add(this.effectController, 'metallic');
    h.open();

    h = gui.addFolder('Material color');
    h.add(this.effectController, 'hue', 0.0, 1.0, 0.025).name('hue');
    h.add(this.effectController, 'saturation', 0, 1, 0.025).name('saturation');
    h.add(this.effectController, 'lightness', 0, 1, 0.025).name('lightness');
    h.open();

    h = gui.addFolder('Lighting');
    h.add(this.effectController, 'lhue', 0, 1, 0.025).name('hue');
    h.add(this.effectController, 'lsaturation', 0, 1, 0.025).name('saturation');
    h.add(this.effectController, 'llightness', 0, 1, 0.025).name('lightness');
    h.add(this.effectController, 'ka', 0, 1, 0.025).name('ambient');
    h.open();

    h = gui.addFolder('Light direction');
    h.add(this.effectController, 'lx', -1, 1, 0.025).name('x');
    h.add(this.effectController, 'ly', -1, 1, 0.025).name('y');
    h.add(this.effectController, 'lz', -1, 1, 0.025).name('z');
    h.open();

    h = gui.addFolder('Tessellation control');
    h.add(this.effectController, 'newTess', [
      2,
      3,
      4,
      5,
      6,
      8,
      10,
      15,
      20,
      30,
      40,
      50,
    ]).name('Tessellation Level');
    h.add(this.effectController, 'lid').name('display lid');
    h.add(this.effectController, 'body').name('display body');
    h.add(this.effectController, 'bottom').name('display bottom');
    h.add(this.effectController, 'fitLid').name('snug lid');
    h.add(this.effectController, 'nonblinn').name('original scale');
    h.open();

    gui
      .add(this.effectController, 'newShading', [
        'wireframe',
        'flat',
        'smooth',
        'glossy',
        'textured',
        'reflective',
      ])
      .name('Shading');
  }

  tess: number;
  bBottom: boolean;
  bLid: boolean;
  bBody: boolean;
  bFitLid: boolean;
  bNonBlinn: boolean;
  shading: string;

  render() {
    const {
      newTess,
      bottom,
      lid,
      body,
      fitLid,
      nonblinn,
      newShading,
    } = this.effectController;
    if (
      this.tess !== newTess ||
      this.bBody !== body ||
      this.bLid !== lid ||
      this.bBottom !== bottom ||
      this.bFitLid !== fitLid ||
      this.bNonBlinn !== nonblinn ||
      this.shading !== newShading
    ) {
      this.tess = newTess;
      this.bBody = body;
      this.bLid = lid;
      this.bBottom = bottom;
      this.bFitLid = fitLid;
      this.bNonBlinn = nonblinn;
      this.shading = newShading;
      this.createNewTeapot();
    }

    (this
      .phongMaterial as MeshPhongMaterial).shininess = this.effectController.shininess;
    (this
      .texturedMaterial as MeshPhongMaterial).shininess = this.effectController.shininess;

    !this.diffuseColor && (this.diffuseColor = new Color());
    !this.specularColor && (this.specularColor = new Color());

    this.diffuseColor.setHSL(
      this.effectController.hue,
      this.effectController.saturation,
      this.effectController.lightness
    );
    if (this.effectController.metallic) {
      this.specularColor.copy(this.diffuseColor);
    } else {
      this.specularColor.setRGB(1, 1, 1);
    }

    this.diffuseColor.multiplyScalar(this.effectController.kd);
    (this.flatMaterial as MeshPhongMaterial).color.copy(this.diffuseColor);
    (this.gouraudMaterial as MeshLambertMaterial).color.copy(this.diffuseColor);
    (this.phongMaterial as MeshPhongMaterial).color.copy(this.diffuseColor);
    (this.texturedMaterial as MeshPhongMaterial).color.copy(this.diffuseColor);

    this.specularColor.multiplyScalar(this.effectController.ks);
    (this.phongMaterial as MeshPhongMaterial).specular.copy(this.specularColor);
    (this.texturedMaterial as MeshPhongMaterial).specular.copy(
      this.specularColor
    );

    this.ambientLight.color.setHSL(
      this.effectController.hue,
      this.effectController.saturation,
      this.effectController.lightness * this.effectController.ka
    );

    this.light.position.set(
      this.effectController.lx,
      this.effectController.ly,
      this.effectController.lz
    );
    this.light.color.setHSL(
      this.effectController.lhue,
      this.effectController.lsaturation,
      this.effectController.llightness
    );

    if (this.shading === 'reflective') {
      this.scene.background = this.textureCube;
    } else {
      this.scene.background = null;
    }
  }

  diffuseColor: Color;
  specularColor: Color;

  teapot: Mesh;
  createNewTeapot(): void {
    if (this.teapot !== undefined) {
      this.teapot.geometry.dispose();
      this.scene.remove(this.teapot);
    }
    const teapotSize = 400;
    const teapotGeometry = new TeapotBufferGeometry(
      teapotSize,
      this.tess,
      this.bBottom,
      this.bLid,
      this.bBody,
      this.bFitLid,
      this.bNonBlinn ? 1 : 0
    );
    let material: Material = this.wireMaterial;
    switch (this.shading) {
      case 'wireframe':
        material = this.wireMaterial;
        break;
      case 'flat':
        material = this.flatMaterial;
        break;
      case 'smooth':
        material = this.gouraudMaterial;
        break;
      case 'glossy':
        material = this.phongMaterial;
        break;
      case 'textured':
        material = this.texturedMaterial;
        break;
      case 'reflective':
        material = this.reflectiveMaterial;
        break;
    }
    this.teapot = new Mesh(teapotGeometry, material);
    this.scene.add(this.teapot);
  }
}

new Demo();
