import { Main } from "../../../main";
import {
  BoxGeometry,
  CubeCamera,
  EquirectangularReflectionMapping,
  IcosahedronGeometry,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MultiplyOperation,
  RGBFormat,
  Scene,
  sRGBEncoding,
  Texture,
  TextureLoader,
  TorusKnotGeometry,
  Vector3,
  WebGLCubeRenderTarget,
} from "three";

class Demo extends Main {
  private cube: Mesh;
  private torus: Mesh;

  initScene() {
    this.scene = new Scene();

    new TextureLoader().load("./bg.jpg", (texture) => {
      texture.encoding = sRGBEncoding;
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.initOther(texture);
    });
  }

  initCamera() {
    super.initCamera(60, 1, 1000, new Vector3(), new Vector3());
  }

  initRenderer() {
    super.initRenderer(true, { outputEncoding: sRGBEncoding } as any);
  }

  //   initPlane() {}

  private material: MeshBasicMaterial;
  private cubeCamera1: CubeCamera;
  private cubeCamera2: CubeCamera;
  private cubeRenderTarget1: WebGLCubeRenderTarget;
  private cubeRenderTarget2: WebGLCubeRenderTarget;
  private inited = false;

  initOther(texture: Texture) {
    this.inited = true;
    const cubeRenderTarget1 = new WebGLCubeRenderTarget(256, {
      format: RGBFormat,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      encoding: sRGBEncoding,
    });
    this.cubeRenderTarget1 = cubeRenderTarget1;
    this.cubeCamera1 = new CubeCamera(1, 1000, cubeRenderTarget1);

    const cubeRenderTarget2 = new WebGLCubeRenderTarget(256, {
      format: RGBFormat,
      generateMipmaps: true,
      minFilter: LinearMipmapLinearFilter,
      encoding: sRGBEncoding,
    });
    this.cubeRenderTarget2 = cubeRenderTarget2;
    this.cubeCamera2 = new CubeCamera(1, 1000, cubeRenderTarget2);

    const material = new MeshBasicMaterial({
      envMap: cubeRenderTarget2.texture,
      combine: MultiplyOperation,
      reflectivity: 1,
    });
    this.material = material;

    const sphere = new Mesh(new IcosahedronGeometry(20, 8), material);
    this.scene.add(sphere);

    const cube = new Mesh(new BoxGeometry(20, 20, 20), material);
    this.scene.add(cube);
    this.cube = cube;

    const torus = new Mesh(new TorusKnotGeometry(10, 5, 128, 16), material);
    this.scene.add(torus);
    this.torus = torus;
  }

  lon = 0;
  lat = 0;
  phi = 0;
  theta = 0;
  count = 0;

  render() {
    if (!this.inited) {
      return;
    }
    const time = Date.now();

    this.lon += 0.15;
    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = MathUtils.degToRad(90 - this.lat);
    this.theta = MathUtils.degToRad(this.lon);

    this.cube.position.x = Math.cos(time * 0.001) * 30;
    this.cube.position.y = Math.sin(time * 0.001) * 30;
    this.cube.position.z = Math.sin(time * 0.001) * 30;

    this.cube.rotation.x += 0.02;
    this.cube.rotation.y += 0.03;

    this.torus.position.x = Math.cos(time * 0.001 + 10) * 30;
    this.torus.position.y = Math.sin(time * 0.001 + 10) * 30;
    this.torus.position.z = Math.sin(time * 0.001 + 10) * 30;

    this.torus.rotation.x += 0.02;
    this.torus.rotation.y += 0.03;

    this.camera.position.x = 100 * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.y = 100 * Math.cos(this.phi);
    this.camera.position.z = 100 * Math.sin(this.phi) * Math.sin(this.theta);

    this.camera.lookAt(this.scene.position);

    if (this.count % 2 === 0) {
      this.cubeCamera1.update(this.renderer, this.scene);
      this.material.envMap = this.cubeRenderTarget1.texture;
    } else {
      this.cubeCamera2.update(this.renderer, this.scene);
      this.material.envMap = this.cubeRenderTarget2.texture;
    }
    this.count++;
  }
}

new Demo();
