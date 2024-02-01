import { Main } from '../../../main';

import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper';
import {
  AmbientLight,
  AudioLoader,
  DirectionalLight,
  Mesh,
  PolarGridHelper,
  Vector3,
  Audio as TAudio,
  AudioListener as TAudioListener,
  Clock,
} from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
import { GUI } from 'dat.gui';
import { stats } from './webpack.config';

const s = document.createElement('script');
s.src = './ammo.wasm.js';
document.body.appendChild(s);
s.onload = () => {
  (window as any).Ammo().then((AmmoLib: any) => {
    (window as any).Ammo = AmmoLib;
    new Demo();
  });
};

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(), null);
  }
  initScene() {
    super.initScene(0xffffff, 0, 0, false);
    this.scene.add(new PolarGridHelper(30, 10, 10, 10, 0, 0));
  }

  // initControls() {}

  initPlane() {
    const listener = new TAudioListener();
    this.camera.add(listener);
    this.scene.add(this.camera);

    effect = new OutlineEffect(this.renderer, {});

    const modelFile = 'miku_v2.pmd';
    const vmdFiles = ['wavefile_v2.vmd'];
    const cameraFiles = 'wavefile_camera.vmd';
    const audioFile = 'wavefile_short.mp3';
    const audioParams = {
      delayTime: (160 * 1) / 30,
    };

    helper = new MMDAnimationHelper();

    const loader = new MMDLoader();

    loader.loadWithAnimation(modelFile, vmdFiles, (mmd) => {
      mesh = mmd.mesh;

      helper.add(mesh as any, {
        animation: mmd.animation,
        physics: true,
      });

      loader.loadAnimation(cameraFiles, this.camera, (cameraAnimation) => {
        helper.add(this.camera, { animation: cameraAnimation as any });

        new AudioLoader().load(audioFile, (buffer) => {
          const audio = new TAudio(listener).setBuffer(buffer);

          helper.add(audio, audioParams);
          this.scene.add(mesh);

          ready = true;
        });
      });
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (ready) {
      helper.update(clock.getDelta());
    }
    effect.render(this.scene, this.camera);

    this.stats.update();
  }
}

let effect: OutlineEffect;
let helper: MMDAnimationHelper;
let mesh: Mesh;
let ready = false;
let clock = new Clock();
