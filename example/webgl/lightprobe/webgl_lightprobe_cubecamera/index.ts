import { Main } from '../../../main';

import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator';
import {
  CubeCamera,
  CubeTextureLoader,
  LightProbe,
  RGBAFormat,
  sRGBEncoding,
  WebGLCubeRenderTarget,
} from 'three';

class Demo extends Main {
  initPlane() {
    const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
      encoding: sRGBEncoding,
      format: RGBAFormat,
    });
    cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget);

    // probe
    lightProbe = new LightProbe();
    this.scene.add(lightProbe);

    // envmap
    const urls = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(
      (str) => '' + str + '.png'
    );
    new CubeTextureLoader().load(urls, (cubeTexture) => {
      cubeTexture.encoding = sRGBEncoding;
      this.scene.background = cubeTexture;
      cubeCamera.update(this.renderer, this.scene);
      lightProbe.copy(
        LightProbeGenerator.fromCubeRenderTarget(
          this.renderer,
          cubeRenderTarget
        )
      );

      this.scene.add(new LightProbeHelper(lightProbe, 2));
    });
  }
}

let cubeCamera: CubeCamera;

let lightProbe: LightProbe;

new Demo();
