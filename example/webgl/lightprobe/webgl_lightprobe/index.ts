import { Main } from '../../../main';

import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator';
import {
  CubeTextureLoader,
  DirectionalLight,
  LightProbe,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  SphereBufferGeometry,
  sRGBEncoding,
} from 'three';
import { GUI } from 'dat.gui';

const API = {
  lightProbeIntensity: 1.0,
  directionalLightIntensity: 0.2,
  envMapIntensity: 1,
};

class Demo extends Main {
  initRenderer() {
    super.initRenderer(true);
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;
  }
  initDirLight() {}
  initHemiLight() {}
  initPlane() {
    // probe
    lightProbe = new LightProbe();
    this.scene.add(lightProbe);

    // light
    directionalLight = new DirectionalLight(
      0xffffff,
      API.directionalLightIntensity
    );
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // envmap
    const genCubeUrls = (prefix: string, postfix: string) => [
      prefix + 'px' + postfix,
      prefix + 'nx' + postfix,
      prefix + 'py' + postfix,
      prefix + 'ny' + postfix,
      prefix + 'pz' + postfix,
      prefix + 'nz' + postfix,
    ];
    const urls = genCubeUrls('', '.png');

    new CubeTextureLoader().load(urls, (cubeTexture) => {
      cubeTexture.encoding = sRGBEncoding;
      this.scene.background = cubeTexture;

      lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));

      const geometry = new SphereBufferGeometry(5, 64, 32);

      const material = new MeshStandardMaterial({
        color: 0xffffff,
        // matalness:0,
        roughness: 0,
        envMap: cubeTexture,
        envMapIntensity: API.envMapIntensity,
      });

      mesh = new Mesh(geometry, material);
      this.scene.add(mesh);
    });

    this.initGUI();
  }

  initGUI() {
    const gui = new GUI();
    gui.width = 300;
    gui.domElement.style.userSelect = 'none';

    const fl = gui.addFolder('Intensity');
    fl.add(API, 'lightProbeIntensity', 0, 1, 0.02)
      .name('light probe')
      .onChange(() => {
        lightProbe.intensity = API.lightProbeIntensity;
      });

    fl.add(API, 'directionalLightIntensity', 0, 1, 0.02)
      .name('directional light')
      .onChange(() => {
        directionalLight.intensity = API.directionalLightIntensity;
      });

    fl.add(API, 'envMapIntensity', 0, 1, 0.02)
      .name('envMap')
      .onChange(() => {
        (mesh.material as MeshStandardMaterial).envMapIntensity =
          API.envMapIntensity;
      });

    fl.open();
  }
}

let lightProbe: LightProbe;
let directionalLight: DirectionalLight;

let mesh: Mesh;

new Demo();
