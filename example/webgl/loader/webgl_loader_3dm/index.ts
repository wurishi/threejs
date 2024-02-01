import { GUI } from 'dat.gui';
import { DirectionalLight, Vector3 } from 'three';
import { Main } from '../../../main';

import { Rhino3dmLoader } from './3DMLoader';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 1, 1000, new Vector3(26, -40, 5));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initDirLight() {
    const dirLight = new DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 2);
    dirLight.castShadow = true;
    dirLight.intensity = 2;
    this.scene.add(dirLight);
  }

  initHemiLight() {}

  initPlane() {
    const loader: any = new Rhino3dmLoader();
    // console.log(loader.load);
    loader.load('Rhino_Logo.3dm', (object: any) => {
      this.scene.add(object);
      this.initGUI(object.userData.layers);
    });
  }

  initGUI(layers: any) {
    console.log(layers);

    const gui = new GUI();
    const layersControl = gui.addFolder('layers');
    layersControl.open();

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      layersControl
        .add(layer, 'visible')
        .name(layer.name)
        .onChange((val) => {
          const name = layer.name;
          this.scene.traverse((child) => {
            if (child.userData.hasOwnProperty('attributes')) {
              if ('layerIndex' in child.userData.attributes) {
                const layerName =
                  layers[child.userData.attributes.layerIndex].name;

                if (layerName === name) {
                  child.visible = val;
                  layer.visible = val;
                }
              }
            }
          });
        });
    }
  }
}

new Demo();
