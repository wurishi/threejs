import { Main } from '../../../main';

import { XLoader } from 'three/examples/jsm/loaders/XLoader';
import {
  Clock,
  GridHelper,
  LoopOnce,
  Mesh,
  SkeletonHelper,
  SkinnedMesh,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(2, 10, -28));
    this.camera.up.set(0, 1, 0);
  }

  initPlane() {
    const gridHelper = new GridHelper(14, 1, 0x303030, 0x303030);
    this.scene.add(gridHelper);

    const loader = new XLoader();
    loader.load(['SSR06_model.x'] as any, (object) => {
      object.models.forEach((model) => {
        model.scale.x *= -1;
        Models.push(model);
      });

      loadAnimation('stand', 0, () => {
        this.scene.add(Models[0]);
        if (Models[0] instanceof SkinnedMesh) {
          skeletonHelper = new SkeletonHelper(Models[0]);
          this.scene.add(skeletonHelper);
        }
        actions[0]['stand'].play();
      });
    });

    this.initGUI();
  }

  initGUI() {
    const gui = new GUI();
    const param = {
      action: 'stand',
      skeleton: true,
    };
    gui.add(param, 'action', ['stand', 'wark', 'attack']).onChange((val) => {
      loadAnimation(val, 0, () => {
        Object.keys(actions[0]).forEach((p) => {
          if (p == val) {
            actions[0][p].play();
          } else {
            actions[0][p].stop();
          }
        });
      });
    });
    gui.add(param, 'skeleton').onChange((val) => {
      skeletonHelper.visible = val;
    });
  }

  render() {
    const delta = clock.getDelta();

    animates.forEach((ani) => {
      // console.log(ani);
      ani && ani.update(delta * 1000);
    });
  }
}

function loadAnimation(
  animeName: string,
  modelId: number,
  _callback: () => void
) {
  if (actions[modelId] && actions[modelId][animeName]) {
    _callback && _callback();
  } else {
    const loader2 = new XLoader();
    loader2.load(
      ['xfile/' + animeName + '.x', { putPos: false, putScl: false }] as any,
      () => {
        // !important!
        (loader2 as any).assignAnimation(Models[modelId]);
        if (!animates[modelId]) {
          animates[modelId] = Models[modelId].animationMixer;
        }
        actions[modelId] = actions[modelId] || {};
        actions[modelId][animeName] = Models[modelId].animationMixer.clipAction(
          animeName
        );
        if (animeName === 'stand') {
          actions[modelId][animeName].setLoop(LoopOnce);
        }
        actions[modelId][animeName].clampWhenFinished = true;
        if (_callback) {
          _callback();
          return;
        }
        actions[modelId][animeName].play();
      }
    );
  }
}

const Models: any[] = [];
const actions: any[] = [];
const animates: any[] = [];
const clock = new Clock();
let skeletonHelper: SkeletonHelper;

new Demo();
