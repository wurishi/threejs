import { Main } from '../../../main';

import { GLTFLoader, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PMREMGenerator, Scene, UnsignedByteType, Vector3 } from 'three';
import { GUI } from 'dat.gui';

const state = {
  variant: 'midnight',
};

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 0.25, 20, new Vector3(2.5, 1.5, 3.0));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const pmremGenerator = new PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setDataType(UnsignedByteType)
      .load('quarry_01_1k.hdr', (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        this.scene.background = envMap;
        this.scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();

        const loader = new GLTFLoader();
        loader.load('MaterialsVariantsShoe.gltf', (gltf) => {
          gltf.scene.scale.set(10, 10, 10);

          this.scene.add(gltf.scene);

          const gui = new GUI();

          const parser = gltf.parser;
          const variantsExtension =
            gltf.userData.gltfExtensions['KHR_materials_variants'];
          const variants = variantsExtension.variants.map(
            (variant: any) => variant.name
          );
          const variantsCtrl = gui
            .add(state, 'variant', variants)
            .name('Variant');

          selectVariant(
            this.scene,
            parser,
            variantsExtension,
            state.variant,
            () => this.animate()
          );
          variantsCtrl.onChange((value) => {
            selectVariant(this.scene, parser, variantsExtension, value, () =>
              this.animate()
            );
          });
        });
      });
  }
}

function selectVariant(
  scene: Scene,
  parser: GLTFParser,
  extension: any,
  variantName: string,
  cb: any
) {
  const variantIndex = extension.variants.findIndex((v: any) =>
    v.name.includes(variantName)
  );
  scene.traverse(async (object: any) => {
    if (object.material) {
      object.material = await parser.getDependency('material', variantIndex);
    }
  });
  cb && cb();
}

new Demo();
