import { Main } from '../main';
import {
  Lensflare,
  LensflareElement,
} from 'three/examples/jsm/objects/Lensflare';
import {
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PointLight,
  Scene,
  TextureLoader,
  Vector3,
} from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';

class Demo extends Main {
  initScene() {
    const color = new Color().setHSL(0.51, 0.4, 0.01);
    super.initScene(color.getHex(), 3500, 15000);
    this.scene.background = color;
  }

  initCamera() {
    super.initCamera(40, 1, 15000, new Vector3(0, 0, 250));
  }

  initHemiLight() {}
  initDirLight() {
    const dirLight = new DirectionalLight(0xffffff, 0.05);
    dirLight.position.set(0, -1, 0).normalize();
    dirLight.color.setHSL(0.1, 0.7, 0.5);
    this.scene.add(dirLight);
    // console.log(dirLight.position);
  }

  initPlane() {
    const s = 250;
    const geometry = new BoxBufferGeometry(s, s, s);
    const material = new MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 50,
    });

    for (let i = 0; i < 3000; i++) {
      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        8000 * (2 * Math.random() - 1),
        8000 * (2 * Math.random() - 1),
        8000 * (2 * Math.random() - 1)
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();

      this.scene.add(mesh);
    }

    const textureLoader = new TextureLoader();

    const textureFlare0 = textureLoader.load('lensflare0.png');
    const textureFlare3 = textureLoader.load('lensflare3.png');

    const scene = this.scene;

    function addLight(
      h: number,
      s: number,
      l: number,
      x: number,
      y: number,
      z: number
    ) {
      const light = new PointLight(0xffffff, 1.5, 2000);
      light.color.setHSL(h, s, l);
      light.position.set(x, y, z);
      scene.add(light);

      const lensflare = new Lensflare();
      lensflare.addElement(
        new LensflareElement(textureFlare0, 700, 0, light.color)
      );
      lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
      lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
      lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
      lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
      light.add(lensflare);
    }

    addLight(0.55, 0.9, 0.5, 5000, 0, -1000);
    addLight(0.08, 0.8, 0.5, 0, 0, -1000);
    addLight(0.995, 0.5, 0.9, 5000, 5000, -1000);
  }

  // controls: FlyControls;
  // initControls() {
  //   const container = document.createElement('div');
  //   document.body.appendChild(container);

  //   const controls = new FlyControls(this.camera, this.renderer.domElement);
  //   controls.movementSpeed = 2500;
  //   controls.domElement = container;
  //   controls.rollSpeed = Math.PI / 6;
  //   controls.autoForward = false;
  //   controls.dragToLook = false;

  //   this.controls = controls;
  // }

  // render() {
  //   const delta = this.clock.getDelta();
  //   this.controls && this.controls.update(delta);
  // }
}

new Demo();
