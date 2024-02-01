import { Main } from '../../../main';
import { KTXLoader } from 'three/examples/jsm/loaders/KTXLoader';
import {
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

/**
 * desktop:
 * BC1(DXT1)
 * BC3(DXT5)
 *
 * iOS:
 * PVR2, PVR4
 *
 * Android:
 * ETC1
 * ASTC_4x4, ASTC8x8
 */

let formats: any = {};

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 2000, new Vector3(0, 0, 1000));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    [
      ['astc', 'WEBGL_compressed_texture_astc'],
      ['etc1', 'WEBGL_compressed_texture_etc1'],
      ['s3tc', 'WEBGL_compressed_texture_s3tc'],
      ['pvrtc', 'WEBGL_compressed_texture_pvrtc'],
    ].forEach(([name, key]) => {
      formats[name] = this.renderer.extensions.get(key);
    });

    const urls: any = {
      pvrtc: ['disturb_PVR2bpp.ktx', 'lensflare_PVR4bpp.ktx'],
      s3tc: ['disturb_BC1.ktx', 'lensflare_BC3.ktx'],
      etc1: ['disturb_ETC1.ktx'],
      astc: ['disturb_ASTC4x4.ktx', 'lensflare_ASTC8x8.ktx'],
    };

    const geometry = new BoxGeometry(200, 200, 200);
    const loader = new KTXLoader();

    const api = {
      support: '',
    };

    Object.keys(formats).forEach((key) => {
      if (formats[key]) {
        api.support += key + ';';
        const [url1, url2] = urls[key];
        meshes.push(
          new Mesh(
            geometry,
            new MeshBasicMaterial({
              map: loader.load(url1, null) as any,
            })
          )
        );

        url2 &&
          meshes.push(
            new Mesh(
              geometry,
              new MeshBasicMaterial({
                map: loader.load(url2, null) as any,
                depthTest: false,
                transparent: true,
                side: DoubleSide,
              })
            )
          );
      }
    });

    let x = (-meshes.length / 2) * 150;
    for (let i = 0; i < meshes.length; i++, x += 300) {
      const mesh = meshes[i];
      mesh.position.set(x, 0, 0);
      this.scene.add(mesh);
    }

    const gui = new GUI();
    gui.add(api, 'support').name('支持的格式:');
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
