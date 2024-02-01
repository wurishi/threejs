import { Main } from '../../../main';

import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import {
  GridHelper,
  HemisphereLight,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  Scene,
  SphereBufferGeometry,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(2, 2, 3));
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initHemiLight() {
    this.scene.add(new HemisphereLight(0xffeeee, 0x111122));
  }
  initDirLight() {}
  initRenderer() {
    super.initRenderer(true, null);
  }
  initPlane() {
    const loader = new ColladaLoader();
    loader.load('abb.dae', (collada) => {
      dae = collada.scene;

      dae.traverse((child) => {
        if (child.type === 'Mesh') {
          const mesh = child as Mesh;
          (mesh.material as Material).flatShading = true;
        }
      });

      dae.scale.set(10.0, 10.0, 10.0);
      dae.updateMatrix();

      kinematics = collada.kinematics;

      this.init();
      this.setupTween();
    });
  }

  init() {
    const grid = new GridHelper(20, 20, 0x888888, 0x444444);
    this.scene.add(grid);

    this.scene.add(dae);

    particleLight = new Mesh(
      new SphereBufferGeometry(4, 8, 8),
      new MeshBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(particleLight);

    particleLight.add(new PointLight(0xffffff, 0.3));
  }

  setupTween() {
    const duration = MathUtils.randInt(1000, 5000);

    for (const prop in kinematics.joints) {
      if (kinematics.joints.hasOwnProperty(prop)) {
        if (!kinematics.joints[prop].static) {
          const joint = kinematics.joints[prop];
          const old = tweenParameters[prop];
          const position = old ? old : joint.zeroPosition;
          tweenParameters[prop] = position;
          target[prop] = MathUtils.randInt(joint.limits.min, joint.limits.max);
        }
      }
    }

    console.log(target);

    setTimeout(() => {
      this.setupTween();
    }, duration);
  }

  render() {
    const timer = Date.now() * 0.0001;

    this.camera.position.set(Math.cos(timer) * 20, 10, Math.sin(timer) * 20);
    this.camera.lookAt(0, 5, 0);

    particleLight &&
      particleLight.position.set(
        Math.sin(timer * 4) * 3009,
        Math.cos(timer * 5) * 4000,
        Math.cos(timer * 4) * 3009
      );

    if (kinematics) {
      for (const prop in kinematics.joints) {
        if (kinematics.joints.hasOwnProperty(prop)) {
          if (!kinematics.joints[prop].static) {
            const t = target[prop];
            let a = kinematics.getJointValue(prop);
            if (Math.abs(t - a) < 0.1) {
              a = t;
            } else {
              a += (t - a) / 100;
            }
            kinematics.setJointValue(prop, a);
            // let a =
            //   kinematics.getJointValue(prop) +
            //   (kinematics.getJointValue(prop) - t) * 0.1;
            // // console.log(kinematics.joints[prop], t);
            // // console.log(kinematics.getJointValue(prop), t);
            // kinematics.setJointValue(prop, a);
          }
        }
      }
    }
  }
}

let dae: Scene;
let kinematics: any;
let particleLight: Mesh;

const tweenParameters: any = {};
const target: any = {};

new Demo();
