import { Main } from '../../../main';
import { PVRLoader } from 'three/examples/jsm/loaders/PVRLoader';
import {
  BoxGeometry,
  CubeReflectionMapping,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  TorusGeometry,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 2000, new Vector3(0, 0, 1000));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const geometry = new BoxGeometry(200, 200, 200);

    const loader = new PVRLoader();

    const disturb_4bpp_rgb: any = loader.load('disturb_4bpp_rgb.pvr', null);
    const disturb_4bpp_rgb_v3: any = loader.load(
      'disturb_4bpp_rgb_v3.pvr',
      null
    );
    const disturb_4bpp_rgb_mips: any = loader.load(
      'disturb_4bpp_rgb_mips.pvr',
      null
    );
    const disturb_2bpp_rgb: any = loader.load('disturb_2bpp_rgb.pvr', null);
    const flare_4bpp_rgba: any = loader.load('flare_4bpp_rgba.pvr', null);
    const flare_2bpp_rgba: any = loader.load('flare_2bpp_rgba.pvr', null);
    const park3_cube_nomip_4bpp_rgb: any = loader.load(
      'park3_cube_nomip_4bpp_rgb.pvr',
      (texture) => {
        texture.magFilter = texture.minFilter = LinearFilter;
        texture.mapping = CubeReflectionMapping;
        materialList[5].needsUpdate = true;
      }
    );
    const park3_cube_mip_2bpp_rgb_v3: any = loader.load(
      'park3_cube_mip_2bpp_rgb_v3.pvr',
      (texture) => {
        texture.magFilter = texture.minFilter = LinearFilter;
        texture.mapping = CubeReflectionMapping;
        materialList[7].needsUpdate = true;
      }
    );

    disturb_2bpp_rgb.minFilter = disturb_2bpp_rgb.magFilter = flare_4bpp_rgba.minFilter = flare_4bpp_rgba.magFilter = disturb_4bpp_rgb.minFilter = disturb_4bpp_rgb.magFilter = disturb_4bpp_rgb_v3.minFilter = disturb_4bpp_rgb_v3.magFilter = flare_2bpp_rgba.minFilter = flare_2bpp_rgba.magFilter = LinearFilter;

    const materialList: MeshBasicMaterial[] = [];

    materialList.push(
      new MeshBasicMaterial({ map: disturb_4bpp_rgb }), //
      new MeshBasicMaterial({ map: disturb_4bpp_rgb_mips }),
      new MeshBasicMaterial({ map: disturb_2bpp_rgb }),
      new MeshBasicMaterial({
        map: flare_4bpp_rgba,
        side: DoubleSide,
        depthTest: false,
        transparent: true,
      }),
      new MeshBasicMaterial({
        map: flare_2bpp_rgba,
        side: DoubleSide,
        depthTest: false,
        transparent: true,
      }),
      new MeshBasicMaterial({
        envMap: park3_cube_nomip_4bpp_rgb,
      }),
      new MeshBasicMaterial({
        map: disturb_4bpp_rgb_v3,
      }),
      new MeshBasicMaterial({
        envMap: park3_cube_mip_2bpp_rgb_v3,
      })
    );

    [
      new Vector3(-500, 200),
      new Vector3(-166, 200),
      new Vector3(166, 200),
      new Vector3(-500, -200),
      new Vector3(-166, -200),
    ].forEach((pos, i) => {
      const mesh = new Mesh(geometry, materialList[i]);
      mesh.position.copy(pos);
      this.scene.add(mesh);
      meshes.push(mesh);
    });

    const mesh = new Mesh(geometry, materialList[6]);
    mesh.position.x = 500;
    mesh.position.y = 200;
    this.scene.add(mesh);
    meshes.push(mesh);

    const torus = new TorusGeometry(100, 50, 32, 24);
    [
      [5, 166, -200],
      [7, 500, -200],
    ].forEach(([i, x, y]) => {
      const mesh = new Mesh(torus, materialList[i]);
      mesh.position.x = x;
      mesh.position.y = y;
      this.scene.add(mesh);
      meshes.push(mesh);
    });
  }

  render() {
    const time = Date.now() * 0.001;
    meshes.forEach((mesh) => {
      mesh.rotation.x = time;
      mesh.rotation.y = time;
    });
  }
}

const meshes: Mesh[] = [];

new Demo();
