import {
  CubeTexture,
  CubeTextureLoader,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";
import { Main } from "../../../main";

class Demo extends Main {
  private async loadCubeTextureWithMipmaps() {
    const mipmaps: CubeTexture[] = [];
    const maxLevel = 8;

    async function loadCubeTexture(urls: string[]) {
      return new Promise<CubeTexture>((resolve) => {
        new CubeTextureLoader().load(urls, (cubeTexture) => {
          resolve(cubeTexture);
        });
      });
    }

    const pendings = [];

    for (let level = 0; level <= maxLevel; level++) {
      const urls = [];

      for (let face = 0; face < 6; face++) {
        urls.push("./cube_m0" + level + "_c0" + face + ".jpg");
      }
      const mipmapLevel = level;
      pendings.push(
        loadCubeTexture(urls).then(
          (cubeTexture) => (mipmaps[mipmapLevel] = cubeTexture)
        )
      );
    }

    await Promise.all(pendings);

    const customizedCubeTexture = mipmaps.shift();
    customizedCubeTexture.mipmaps = mipmaps;
    customizedCubeTexture.minFilter = LinearMipmapLinearFilter;
    customizedCubeTexture.magFilter = LinearFilter;
    customizedCubeTexture.generateMipmaps = false;
    customizedCubeTexture.needsUpdate = true;

    return customizedCubeTexture;
  }

  initCamera() {
    super.initCamera(50, 1, 10000);
    this.camera.position.set(0, 0, 500);
  }

  initScene() {
    super.initScene(0, 10, 22, false);
  }

  initRenderer() {
    super.initRenderer(true, { shadowEnabled: false } as any);
  }

  initPlane() {
    this.loadCubeTextureWithMipmaps().then((cubeTexture) => {
      const sphere = new SphereGeometry(100, 128, 128);

      let material = new MeshBasicMaterial({
        color: 0xffffff,
        envMap: cubeTexture,
      });
      material.name = "manual mipmaps";

      let mesh = new Mesh(sphere, material);
      mesh.position.set(100, 0, 0);
      this.scene.add(mesh);

      material = material.clone();
      material.name = "auto mipmaps";

      const autoCubeTexture = cubeTexture.clone();
      autoCubeTexture.mipmaps = [];
      autoCubeTexture.generateMipmaps = true;
      autoCubeTexture.needsUpdate = true;

      material.envMap = autoCubeTexture;

      mesh = new Mesh(sphere, material);
      mesh.position.set(-100, 0, 0);
      this.scene.add(mesh);
    });
  }
}

new Demo();
