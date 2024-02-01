import { Main } from '../../../main';

import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper';
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  Mesh,
  PolarGridHelper,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

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
    super.initCamera(45, 1, 2000, new Vector3(0, 0, 30));
  }

  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }

  initRenderer() {
    super.initRenderer(true);
  }

  initHemiLight() {}

  initDirLight() {
    const ambient = new AmbientLight(0x666666);
    this.scene.add(ambient);

    const dirLight = new DirectionalLight(0x887766);
    dirLight.position.set(-1, 1, 1).normalize();
    this.scene.add(dirLight);
  }

  initPlane() {
    const gridHelper = new PolarGridHelper(30, 10, 10, 10, 0x000000, 0x000000);
    gridHelper.position.y = -10;
    this.scene.add(gridHelper);

    effect = new OutlineEffect(this.renderer, {});

    const modelFile = 'miku_v2.pmd';
    const vmdFiles = ['wavefile_v2.vmd'];

    helper = new MMDAnimationHelper({ afterglow: 2.0 });

    const loader = new MMDLoader();
    loader.loadWithAnimation(modelFile, vmdFiles, (mmd) => {
      mesh = mmd.mesh;
      mesh.position.y = -10;
      this.scene.add(mesh);

      helper.add(mesh as any, {
        animation: mmd.animation,
        physics: true,
      });

      ikHelper = (helper as any).objects.get(mesh).ikSolver.createHelper();
      ikHelper.visible = false;
      this.scene.add(ikHelper);

      physicsHelper = (helper as any).objects.get(mesh).physics.createHelper();
      physicsHelper.visible = false;
      this.scene.add(physicsHelper);

      // console.log((helper as any).objects);

      this.initGUI();
    });
  }

  initGUI() {
    const api = {
      animation: true,
      ik: true,
      outline: true,
      physics: true,
      'show IK bones': false,
      'show rigid bodies': false,
    };

    const gui = new GUI();

    gui.add(api, 'animation').onChange(() => {
      helper.enable('animation', api.animation);
    });

    gui.add(api, 'ik').onChange(() => {
      helper.enable('ik', api.ik);
    });

    gui.add(api, 'outline').onChange(() => {
      effect.enabled = api.outline;
    });

    gui.add(api, 'physics').onChange(() => {
      helper.enable('physics', api.physics);
    });

    gui.add(api, 'show IK bones').onChange((v) => {
      ikHelper.visible = v;
    });

    gui.add(api, 'show rigid bodies').onChange((v) => {
      if (physicsHelper) {
        physicsHelper.visible = v;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    helper.update(this.clock.getDelta());

    effect.render(this.scene, this.camera);

    this.stats.update();
  }
}

let effect: OutlineEffect;
let helper: MMDAnimationHelper;

let mesh: Mesh;
let ikHelper: any;
let physicsHelper: any;

// new Demo();
