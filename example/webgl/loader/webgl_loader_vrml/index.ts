import { Main } from '../../../main';

import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader';
import { Scene, Vector3 } from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const params = {
  asset: 'house',
};

const assets = [
  'creaseAngle',
  'crystal',
  'house',
  'elevationGrid1',
  'elevationGrid2',
  'extrusion1',
  'extrusion2',
  'extrusion3',
  'lines',
  'meshWithLines',
  'meshWithTexture',
  'pixelTexture',
  'points',
];

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 0.1, 1e10, new Vector3(-10, 5, 10));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    loader = new VRMLLoader();
    this.loadAsset(params.asset);

    const gui = new GUI({ width: 300 });
    gui.add(params, 'asset', assets).onChange((value) => {
      this.loadAsset(value);
    });
  }

  loadAsset(asset: string) {
    if (vrmlScene) {
      vrmlScene.traverse((object) => {
        const { material, geometry } = object as any;
        material && material.dispose();
        material && material.map && material.map.dispose();
        geometry && geometry.dispose();
        this.scene.remove(vrmlScene);
      });
    }
    vrmlScene = null;
    loader.load(asset + '.wrl', (object) => {
      vrmlScene = object;
      this.scene.add(object);
      controls.reset();
    });
  }

  initControls() {
    controls = new OrbitControls(this.camera, this.renderer.domElement);
  }
}

let loader: VRMLLoader;
let vrmlScene: Scene;
let controls: OrbitControls;

new Demo();
