import { GUI } from 'dat.gui';
import {
  BufferGeometry,
  DoubleSide,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  PlaneGeometry,
  RGBAFormat,
  RGBA_ASTC_4x4_Format,
  RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT5_Format,
  RGB_ETC1_Format,
  RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format,
  RGB_S3TC_DXT1_Format,
  Vector3,
} from 'three';
import { Main } from '../../../main';

import { KTX2Loader } from './KTX2Loader';

class Demo extends Main {
  initScene() {
    super.initScene(0x202020, 0, 0, false);
  }
  initCamera() {
    super.initCamera(60, 0.1, 100, new Vector3(2, 1.5, 1));
  }

  initPlane() {
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

    const geometry = filpY(new PlaneBufferGeometry());
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    this.scene.add(mesh);

    const formatStrings = {
      [RGBAFormat]: 'RGBA32',
      [RGBA_ASTC_4x4_Format]: 'RGBA_ASTC_4x4',
      [RGB_S3TC_DXT1_Format]: 'RGB_S3TC_DXT1',
      [RGBA_S3TC_DXT5_Format]: 'RGBA_S3TC_DXT5',
      [RGB_PVRTC_4BPPV1_Format]: 'RGB_PVRTC_4BPPV1',
      [RGBA_PVRTC_4BPPV1_Format]: 'RGBA_PVRTC_4BPPV1',
      [RGB_ETC1_Format]: 'RGB_ETC1',
      [RGB_ETC2_Format]: 'RGB_ETC2',
      [RGBA_ETC2_EAC_Format]: 'RGB_ETC2_EAC',
      [RGBA_BPTC_Format]: 'RGBA_BPTC_Format',
    };

    const api = {
      transcoded: '',
    };

    const gui = new GUI();

    new KTX2Loader()
      .detectSupport(this.renderer)
      .load('sample_uastc.ktx2', (texture: any) => {
        // console.log(texture, formatStrings);
        api.transcoded = formatStrings[texture.format] || texture.format;

        gui.add(api, 'transcoded');

        material.map = texture;
        material.transparent = true;

        material.needsUpdate = true;
      });
  }
}

function filpY(geometry: BufferGeometry) {
  const uv = geometry.attributes.uv;

  for (let i = 0; i < uv.count; i++) {
    uv.setY(i, 1 - uv.getY(i));
  }
  return geometry;
}

new Demo();
