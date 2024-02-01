import { Main } from '../../../main';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';
import {
  DirectionalLight,
  Euler,
  HemisphereLight,
  LoadingManager,
  Mesh,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  Vector2,
  Vector3,
} from 'three';

class Demo extends Main {
  initScene() {
    super.initScene(0xa0a0a0, 10, 500);
  }

  initCamera() {
    super.initCamera(35, 1, 500, new Vector3(-50, 40, 50));
  }

  initHemiLight() {
    const hemiLight = new HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);
  }

  initDirLight() {
    const dirLight = new DirectionalLight(0xffffff);
    dirLight.position.set(-0, 40, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(dirLight);
  }

  initPlane() {
    const manager = new LoadingManager();

    const loader = new ThreeMFLoader(manager);
    loader.load('truck.3mf', (object) => {
      object.quaternion.setFromEuler(new Euler(-Math.PI / 2, 0, 0));

      object.traverse((child) => {
        child.castShadow = true;
      });

      this.scene.add(object);
    });

    const ground = new Mesh(
      new PlaneBufferGeometry(1000, 1000),
      new MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 11;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }
}

new Demo();
