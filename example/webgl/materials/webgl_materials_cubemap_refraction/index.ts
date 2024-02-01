import {
  AmbientLight,
  BufferGeometry,
  CubeRefractionMapping,
  CubeTexture,
  CubeTextureLoader,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PointLight,
  Scene,
  SphereGeometry,
  Vector3,
} from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { Main } from "../../../main";

class Demo extends Main {
  private textureCube: CubeTexture;

  initScene() {
    this.scene = new Scene();

    const urls: string[] = [];
    ["x", "y", "z"].forEach((s) => urls.push(`./p${s}.jpg`, `./n${s}.jpg`));

    this.textureCube = new CubeTextureLoader().load(urls);
    this.textureCube.mapping = CubeRefractionMapping;

    this.scene.background = this.textureCube;
  }

  initCamera() {
    super.initCamera(50, 1, 100000);
    this.camera.position.set(0, 0, -4000);
  }

  initDirLight() {}
  initHemiLight() {}

  private pointLight: PointLight;

  initPlane() {
    const ambientLight = new AmbientLight(0xffffff);
    this.scene.add(ambientLight);
    const pointLight = new PointLight(0xffffff, 2);
    this.scene.add(pointLight);
    this.pointLight = pointLight;

    const sphere = new SphereGeometry(100, 16, 8);

    const mesh = new Mesh(sphere, new MeshBasicMaterial({ color: 0xffffff }));
    mesh.scale.set(0.05, 0.05, 0.05);
    pointLight.add(mesh);

    const cubeMaterial3 = new MeshPhongMaterial({
      color: 0xccddff,
      envMap: this.textureCube,
      refractionRatio: 0.98,
      reflectivity: 0.9,
    });
    const cubeMaterial2 = new MeshPhongMaterial({
      color: 0xccfffd,
      envMap: this.textureCube,
      refractionRatio: 0.985,
    });
    const cubeMaterial1 = new MeshPhongMaterial({
      color: 0xffffff,
      envMap: this.textureCube,
      refractionRatio: 0.98,
    });

    const loader = new PLYLoader();
    loader.load("lucy100k.ply", (geometry) => {
      this.createScene(geometry, cubeMaterial1, cubeMaterial2, cubeMaterial3);
    });
  }

  createScene(
    geometry: BufferGeometry,
    m1: MeshPhongMaterial,
    m2: MeshPhongMaterial,
    m3: MeshPhongMaterial
  ) {
    geometry.computeVertexNormals();
    const s = 1.5;

    let mesh = new Mesh(geometry, m1);
    mesh.scale.set(s, s, s);
    this.scene.add(mesh);

    mesh = new Mesh(geometry, m2);
    mesh.position.x = -1500;
    mesh.scale.set(s, s, s);
    this.scene.add(mesh);

    mesh = new Mesh(geometry, m3);
    mesh.position.x = 1500;
    mesh.scale.set(s, s, s);
    this.scene.add(mesh);
  }

  render() {
    const timer = -0.0002 * Date.now();

    this.pointLight.position.x = 1500 * Math.cos(timer);
    this.pointLight.position.z = 1500 * Math.sin(timer);
  }
}

new Demo();
