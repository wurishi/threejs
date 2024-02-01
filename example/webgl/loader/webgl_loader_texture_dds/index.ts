import { Main } from '../../../main';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import {
  AdditiveBlending,
  BoxGeometry,
  CubeReflectionMapping,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 2000, new Vector3(0, 0, 1000));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initDirLight() {}

  initHemiLight() {}

  initPlane() {
    const geometry = new BoxGeometry(200, 200, 200);

    // DXT1: RGB
    // DXT3: RGBA -  transparent textures with sharp alpha transitions
    // DXT5: RGBA - transparent textures with full alpha range

    const loader = new DDSLoader();

    const map1: any = loader.load('disturb_dxt1_nomip.dds', null);
    map1.minFilter = map1.magFilter = LinearFilter;
    map1.anisotropy = 4;

    const map2: any = loader.load('disturb_dxt1_mip.dds', null);
    map2.anisotropy = 4;

    const map3: any = loader.load('hepatica_dxt3_mip.dds', null);
    map3.anisotropy = 4;

    const map4: any = loader.load('explosion_dxt5_mip.dds', null);
    map4.anisotropy = 4;

    const map5: any = loader.load('disturb_argb_nomip.dds', null);
    map5.minFilter = map5.magFilter = LinearFilter;
    map5.anisotropy = 4;

    const map6: any = loader.load('disturb_argb_mip.dds', null);
    map6.anisotropy = 4;

    const materialList: MeshBasicMaterial[] = [];

    const cubemap1: any = loader.load('Mountains.dds', (texture) => {
      texture.magFilter = texture.minFilter = LinearFilter;
      texture.mapping = CubeReflectionMapping;
      materialList[0].needsUpdate = true;
    });

    const cubemap2: any = loader.load('Mountains_argb_mip.dds', (texture) => {
      texture.magFilter = texture.minFilter = LinearFilter;
      texture.mapping = CubeReflectionMapping;
      materialList[4].needsUpdate = true;
    });

    const cubemap3: any = loader.load('Mountains_argb_nomip.dds', (texture) => {
      texture.magFilter = texture.minFilter = LinearFilter;
      texture.mapping = CubeReflectionMapping;
      materialList[5].needsUpdate = true;
    });

    materialList.push(new MeshBasicMaterial({ map: map1, envMap: cubemap1 }));
    materialList.push(new MeshBasicMaterial({ map: map2 }));
    materialList.push(
      new MeshBasicMaterial({ map: map3, alphaTest: 0.5, side: DoubleSide })
    );
    materialList.push(
      new MeshBasicMaterial({
        map: map4,
        side: DoubleSide,
        blending: AdditiveBlending,
        depthTest: false,
        transparent: true,
      })
    );
    materialList.push(new MeshBasicMaterial({ envMap: cubemap2 }));
    materialList.push(new MeshBasicMaterial({ envMap: cubemap3 }));
    materialList.push(new MeshBasicMaterial({ map: map5 }));
    materialList.push(new MeshBasicMaterial({ map: map6 }));

    const posList = [
      new Vector3(-600, -200),
      new Vector3(-200, -200),
      new Vector3(-200, 200),
      new Vector3(-600, 200),
      new Vector3(200, 200),
      new Vector3(200, -200),
      new Vector3(600, -200),
      new Vector3(600, 200),
    ];

    materialList.forEach((material, i) => {
      const mesh = new Mesh(geometry, material);
      mesh.position.copy(posList[i]);
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

let meshes: Mesh[] = [];

new Demo();
