import {
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  PointLight,
  RepeatWrapping,
  SphereBufferGeometry,
  sRGBEncoding,
  TextureLoader,
  TorusBufferGeometry,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 1, 300, new Vector3(0, 15, 150), new Vector3(0, 0, 0));
  }

  initScene() {
    super.initScene(0x040306, 10, 300, true);
  }

  initHemiLight() {}
  initDirLight() {}

  initPlane() {
    // texture

    const textureLoader = new TextureLoader();
    const texture = textureLoader.load('disturb.jpg');
    texture.repeat.set(20, 10);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.encoding = sRGBEncoding;

    // materials
    const groundMaterial = new MeshPhongMaterial({
      color: 0xffffff,
      map: texture,
    });
    const objectMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1.0,
    });

    // ground
    const mesh = new Mesh(
      new PlaneBufferGeometry(800, 400, 2, 2),
      groundMaterial
    );
    mesh.position.y = -5;
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);

    // objects
    const objectGeometry = new TorusBufferGeometry(1.5, 0.4, 8, 16);

    for (let i = 0; i < 5000; i++) {
      const mesh = new Mesh(objectGeometry, objectMaterial);

      mesh.position.set(
        400 * (0.5 - Math.random()),
        50 * (0.5 - Math.random()) + 25,
        200 * (0.5 - Math.random())
      );

      mesh.rotation.set(
        3.14 * (0.5 - Math.random()),
        3.14 * (0.5 - Math.random()),
        0
      );

      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.scene.add(mesh);
    }

    // lights

    const intensity = 2.5;
    const distance = 100;
    const decay = 2.0;

    const sphere = new SphereBufferGeometry(0.25, 16, 8);

    [0xff0040, 0x0040ff, 0x80ff80, 0xffaa00, 0x00ffaa, 0xff1100].forEach(
      (color) => {
        const light = new PointLight(color, intensity, distance, decay);
        light.add(new Mesh(sphere, new MeshBasicMaterial({ color })));
        this.scene.add(light);
        lightList.push(light);
      }
    );

    const dlight = new DirectionalLight(0xffffff, 0.05);
    dlight.position.set(0.5, 1, 0).normalize();
    this.scene.add(dlight);
  }

  render() {
    const time = Date.now() * 0.00025;
    const d = 150;

    [
      [0.7, 0, 0, 0.3],
      [0, 0.3, 0.7, 0],
      [0.7, 0, 0.5, 0],
      [0.3, 0, 0.5, 0],
      [0, 0.3, 0.5, 0],
      [0, 0.7, 0, 0.5],
    ].forEach((arr, i) => {
      lightList[i].position.set(
        (arr[0] ? Math.sin(time * arr[0]) : Math.cos(time * arr[1])) * d,
        0,
        (arr[2] ? Math.sin(time * arr[2]) : Math.cos(time * arr[3])) * d
      );
    });
  }
}

let lightList: PointLight[] = [];

new Demo();
