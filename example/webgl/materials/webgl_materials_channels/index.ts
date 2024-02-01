import { Main } from '../../../main';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import {
  AmbientLight,
  BackSide,
  BasicDepthPacking,
  DoubleSide,
  FrontSide,
  Material,
  Mesh,
  MeshDepthMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  RGBADepthPacking,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';

const params = {
  material: 'normal',
  camera: 'perspective',
  side: 'double',
};

const sides: any = {
  front: FrontSide,
  back: BackSide,
  double: DoubleSide,
};

const SCALE = 2.436143;
const BIAS = -0.428408;

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 500, 3000, new Vector3(0, 0, 1500));
    cameraPerspective = this.camera;

    const aspect = window.innerWidth / window.innerHeight;
    const height = 500;
    cameraOrtho = new OrthographicCamera(
      -height * aspect,
      height * aspect,
      height,
      -height,
      1000,
      2500
    );
    cameraOrtho.position.z = 1500;
    this.scene.add(cameraOrtho);
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initControls() {
    controlsPerspective = new OrbitControls(
      cameraPerspective,
      this.renderer.domElement
    );
    controlsPerspective.minDistance = 1000;
    controlsPerspective.maxDistance = 2400;
    controlsPerspective.enablePan = false;
    controlsPerspective.enableDamping = true;

    controlsOrtho = new OrbitControls(cameraOrtho, this.renderer.domElement);
    controlsOrtho.minZoom = 0.5;
    controlsOrtho.maxZoom = 1.5;
    controlsOrtho.enablePan = false;
    controlsOrtho.enableDamping = true;
  }

  // initHemiLight() {}
  // initDirLight() {}

  initPlane() {
    // const ambientLight = new AmbientLight(0xffffff, 0.1);
    // this.scene.add(ambientLight);

    // const pointLight = new PointLight(0xff0000, 0.5);
    // pointLight.position.z = 2500;
    // this.scene.add(pointLight);

    // const pointLight2 = new PointLight(0xff6666, 1);
    // this.camera.add(pointLight2);

    // const pointLight3 = new PointLight(0x0000ff, 0.5);
    // pointLight3.position.x = -1000;
    // pointLight3.position.z = 1000;
    // this.scene.add(pointLight3);

    const textureLoader = new TextureLoader();
    const normalMap = textureLoader.load('normal.png');
    const aoMap = textureLoader.load('ao.jpg');
    const displacementMap = textureLoader.load('displacement.jpg');

    materialStandard = new MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.6,
      displacementMap,
      displacementScale: SCALE,
      displacementBias: BIAS,
      aoMap,
      normalMap,
      normalScale: new Vector2(1, -1),
      side: DoubleSide,
    });

    materialDepthBasic = new MeshDepthMaterial({
      depthPacking: BasicDepthPacking,
      displacementMap,
      displacementScale: SCALE,
      displacementBias: BIAS,
      side: DoubleSide,
    });

    materialDepthRGBA = new MeshDepthMaterial({
      depthPacking: RGBADepthPacking,
      displacementMap,
      displacementScale: SCALE,
      displacementBias: BIAS,
      side: DoubleSide,
    });

    materialNormal = new MeshNormalMaterial({
      displacementMap,
      displacementScale: SCALE,
      displacementBias: BIAS,
      normalMap,
      normalScale: new Vector2(1, -1),
      side: DoubleSide,
    });

    const loader = new OBJLoader();
    loader.load('ninjaHead_Low.obj', (group) => {
      const geometry = (group.children[0] as any).geometry;
      geometry.attributes.uv2 = geometry.attributes.uv;
      geometry.center();

      mesh = new Mesh(geometry, materialNormal);
      mesh.scale.multiplyScalar(25);
      this.scene.add(mesh);
    });

    this.initGUI();
  }

  initGUI() {
    const gui = new GUI();
    gui.add(params, 'material', [
      'standard',
      'normal',
      'depthBasic',
      'depthRGBA',
    ]);
    gui.add(params, 'camera', ['perspective', 'ortho']);
    gui.add(params, 'side', ['front', 'back', 'double']);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    cameraPerspective.aspect = aspect;
    cameraPerspective.updateProjectionMatrix();

    cameraOrtho.left = -height * aspect;
    cameraOrtho.right = height * aspect;
    cameraOrtho.top = height;
    cameraOrtho.bottom = -height;
    cameraOrtho.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  render() {
    if (mesh) {
      let material = mesh.material as Material;

      switch (params.material) {
        case 'standard':
          material = materialStandard;
          break;
        case 'depthBasic':
          material = materialDepthBasic;
          break;
        case 'depthRGBA':
          material = materialDepthRGBA;
          break;
        case 'normal':
          material = materialNormal;
          break;
      }

      if (sides[params.side] !== material.side) {
        switch (params.side) {
          case 'front':
            material.side = FrontSide;
            break;
          case 'back':
            material.side = BackSide;
            break;
          case 'double':
            material.side = DoubleSide;
            break;
        }
        material.needsUpdate = true;
      }
      mesh.material = material;
    }

    switch (params.camera) {
      case 'perspective':
        this.camera = cameraPerspective;
        break;
      case 'ortho':
        this.camera = cameraOrtho as any;
        break;
    }

    controlsPerspective.update();
    controlsOrtho.update();

    this.renderer.render(this.scene, this.camera);
  }
}

let mesh: Mesh;

let cameraPerspective: PerspectiveCamera;
let cameraOrtho: OrthographicCamera;

let controlsPerspective: OrbitControls;
let controlsOrtho: OrbitControls;

let materialStandard: MeshStandardMaterial;
let materialDepthBasic: MeshDepthMaterial;
let materialDepthRGBA: MeshDepthMaterial;
let materialNormal: MeshNormalMaterial;

new Demo();
