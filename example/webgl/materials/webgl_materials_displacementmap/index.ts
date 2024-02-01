import { Main } from "../../../main";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
  AmbientLight,
  BufferGeometry,
  CubeTextureLoader,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  sRGBEncoding,
  TextureLoader,
  Vector2,
} from "three";
import { GUI } from "dat.gui";

const settings = {
  metalness: 1.0,
  roughness: 0.4,
  ambientIntensity: 0.2,
  aoMapIntensity: 1.0,
  envMapIntensity: 1.0,
  displacementScale: 2.436143, // from original model
  normalScale: 1.0,
};

class Demo extends Main {
  private ambientLight: AmbientLight;
  private pointLight: PointLight;
  private material: MeshStandardMaterial;
  private mesh: Mesh;

  initCamera() {
    super.initCamera();
    this.camera.position.z = 1500;
    this.scene.add(this.camera);
  }

  initRenderer() {
    super.initRenderer(true, { shadowEnabled: false } as any);
  }

  initScene() {
    this.defaultScene();
  }

  initHemiLight() {}
  initDirLight() {
    this.ambientLight = new AmbientLight(0xffffff, settings.ambientIntensity);
    this.scene.add(this.ambientLight);

    this.pointLight = new PointLight(0xff0000, 0.5);
    this.pointLight.position.z = 2500;
    this.scene.add(this.pointLight);

    const pointLight2 = new PointLight(0xff6666, 1);
    this.camera.add(pointLight2);

    const pointLight3 = new PointLight(0x0000ff, 0.5);
    pointLight3.position.set(-1000, 0, 1000);
    this.scene.add(pointLight3);
  }

  initPlane() {
    const urls: string[] = [];
    ["x", "y", "z"].forEach((x) => urls.push(`./p${x}.jpg`, `./n${x}.jpg`));
    const reflectionCube = new CubeTextureLoader().load(urls);
    reflectionCube.encoding = sRGBEncoding;

    const textureLoader = new TextureLoader();
    const normalMap = textureLoader.load("./normal.png");
    const aoMap = textureLoader.load("./ao.jpg");
    const displacementMap = textureLoader.load("./displacement.jpg");

    this.material = new MeshStandardMaterial({
      color: 0x888888,
      roughness: settings.roughness,
      metalness: settings.metalness,

      normalMap,
      normalScale: new Vector2(1, -1), // why does the normal map require negation in this case?

      aoMap,
      aoMapIntensity: 1,

      displacementMap,
      displacementScale: settings.displacementScale,
      displacementBias: -0.428408, // from original model

      envMap: reflectionCube,
      envMapIntensity: settings.envMapIntensity,

      side: DoubleSide,
    });

    const loader = new OBJLoader();
    loader.load("./ninja.obj", (group) => {
      const geometry = (group.children[0] as Mesh).geometry as BufferGeometry;
      geometry.attributes.uv2 = geometry.attributes.uv;
      geometry.center();

      this.mesh = new Mesh(geometry, this.material);
      this.mesh.scale.multiplyScalar(25);
      this.scene.add(this.mesh);
    });

    this.initUI();
  }

  private initUI() {
    const gui = new GUI();

    gui
      .add(settings, "metalness", 0, 1)
      .onChange((v) => (this.material.metalness = v));

    gui
      .add(settings, "roughness", 0, 1)
      .onChange((v) => (this.material.roughness = v));

    gui
      .add(settings, "aoMapIntensity", 0, 1)
      .onChange((v) => (this.material.aoMapIntensity = v));

    gui
      .add(settings, "ambientIntensity", 0, 1)
      .onChange((v) => (this.ambientLight.intensity = v));

    gui
      .add(settings, "envMapIntensity", 0, 3)
      .onChange((v) => (this.material.envMapIntensity = v));

    gui
      .add(settings, "displacementScale", 0, 3.0)
      .onChange((v) => (this.material.displacementScale = v));

    gui
      .add(settings, "normalScale", -1, 1)
      .onChange((v) => this.material.normalScale.set(1, -1).multiplyScalar(v));
  }

  private r = 0;

  render() {
    this.pointLight.position.x = 2500 * Math.cos(this.r);
    this.pointLight.position.z = 2500 * Math.sin(this.r);

    this.r += 0.01;
  }
}

new Demo();
