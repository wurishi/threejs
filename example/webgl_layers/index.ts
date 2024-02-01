import { GUI } from 'dat.gui';
import { BoxBufferGeometry, Mesh, MeshLambertMaterial } from 'three';
import { Main, randomLR } from '../main';

const radius = 100;

class Demo extends Main {
  initCamera() {
    super.initCamera(70, 1, 10000);
    this.camera.layers.enable(0); // default
    this.camera.layers.enable(1);
    this.camera.layers.enable(2);
  }

  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }

  initPlane() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    const geometry = new BoxBufferGeometry(20, 20, 20);

    for (let i = 0; i < 300; i++) {
      const layer = i % 3;

      const object = new Mesh(
        geometry,
        new MeshLambertMaterial({ color: colors[layer] })
      );

      object.position.set(randomLR(800), randomLR(800), randomLR(800));

      object.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      );

      object.scale.set(
        Math.random() + 0.5,
        Math.random() + 0.5,
        Math.random() + 0.5
      );

      object.layers.set(layer);

      this.scene.add(object);
    }

    this.initGUI();
  }

  initGUI() {
    const layers = {
      'toggle red': () => {
        this.camera.layers.toggle(0);
      },
      'toggle green': () => {
        this.camera.layers.toggle(1);
      },
      'toggle blue': () => {
        this.camera.layers.toggle(2);
      },
      'enable all': () => {
        this.camera.layers.enableAll();
      },
      'disable all': () => {
        this.camera.layers.disableAll();
      },
    };

    const gui = new GUI();
    gui.add(layers, 'toggle red');
    gui.add(layers, 'toggle green');
    gui.add(layers, 'toggle blue');
    gui.add(layers, 'enable all');
    gui.add(layers, 'disable all');
  }
}

new Demo();
