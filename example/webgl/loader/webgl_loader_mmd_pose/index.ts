import { Main } from '../../../main';

import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper';
import { AmbientLight, DirectionalLight, Mesh, Vector3 } from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
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

const modelFile = 'miku_v2.pmd';
const vpdFiles = [
  'vpds/01.vpd',
  'vpds/02.vpd',
  'vpds/03.vpd',
  'vpds/04.vpd',
  'vpds/05.vpd',
  'vpds/06.vpd',
  'vpds/07.vpd',
  'vpds/08.vpd',
  'vpds/09.vpd',
  'vpds/10.vpd',
  'vpds/11.vpd',
];

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(0, 0, 25));
  }

  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }

  initHemiLight() {}

  initDirLight() {
    const ambient = new AmbientLight(0x666666);
    this.scene.add(ambient);

    const dirLight = new DirectionalLight(0x887766);
    dirLight.position.set(-1, 1, 1).normalize();
    this.scene.add(dirLight);
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  onWindowResize() {
    super.onWindowResize();
    effect.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    effect.render(this.scene, this.camera);

    this.stats.update();
  }

  initPlane() {
    effect = new OutlineEffect(this.renderer, {});

    helper = new MMDAnimationHelper();

    const loader = new MMDLoader();
    loader.load(modelFile, (object) => {
      mesh = object;
      mesh.position.y = -10;

      this.scene.add(mesh);

      let vpdIndex = 0;

      const loadVpd = () => {
        const vpdFile = vpdFiles[vpdIndex];
        loader.loadVPD(vpdFile, false, (vpd) => {
          vpds.push(vpd);
          vpdIndex++;
          if (vpdIndex < vpdFiles.length) {
            loadVpd();
          } else {
            this.initGUI();
          }
        });
      };

      loadVpd();
    });
  }

  initGUI() {
    const gui = new GUI();
    const dictionary = mesh.morphTargetDictionary;
    const controls: any = {};
    const keys: any[] = [];

    const poses = gui.addFolder('Poses');
    const morphs = gui.addFolder('Morphs');

    const getBaseName = (s: string) => s.slice(s.lastIndexOf('/') + 1);
    const initControls = () => {
      for (const key in dictionary) {
        controls[key] = 0;
      }
      controls.pose = -1;

      for (let i = 0; i < vpdFiles.length; i++) {
        controls[getBaseName(vpdFiles[i])] = false;
      }
    };
    const initKeys = () => {
      for (const key in dictionary) {
        keys.push(key);
      }
    };

    const onChangeMorph = () => {
      keys.forEach((key, i) => {
        const value = controls[key];
        mesh.morphTargetInfluences[i] = value;
      });
    };

    const onChangePose = () => {
      const index = parseInt(controls.pose);
      if (index === -1) {
        (mesh as any).pose();
      } else {
        helper.pose(mesh as any, vpds[index]);
      }
    };

    const initPoses = () => {
      const files: any = { default: -1 };
      vpdFiles.forEach((v, i) => (files[getBaseName(v)] = i));
      poses.add(controls, 'pose', files).onChange(onChangePose);
    };
    const initMorphs = () => {
      for (const key in dictionary) {
        morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(onChangeMorph);
      }
    };

    initControls();
    initKeys();
    initPoses();
    initMorphs();

    onChangeMorph();
    onChangePose();

    poses.open();
    morphs.open();
  }
}

let effect: OutlineEffect;

let helper: MMDAnimationHelper;

let mesh: Mesh;

let vpds: any[] = [];
