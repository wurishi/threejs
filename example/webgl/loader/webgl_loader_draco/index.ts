import { Main } from '../../../main';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import {
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  SpotLight,
  Vector3,
} from 'three';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('libs/');
dracoLoader.setDecoderConfig({ type: 'js' });

class Demo extends Main {
  initCamera() {
    super.initCamera(35, 0.1, 15, new Vector3(3, 0.25, 3));
  }
  initScene() {
    super.initScene(0x443333, 1, 4, true);
  }

  initHemiLight() {
    super.initHemiLight(0x443333, 0x111122, new Vector3());
  }

  initDirLight() {
    const spotLight = new SpotLight();
    spotLight.angle = Math.PI / 16;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.position.set(-1, 1, 1);
    this.scene.add(spotLight);
  }

  initPlane() {
    const plane = new Mesh(
      new PlaneBufferGeometry(8, 8),
      new MeshPhongMaterial({
        color: 0x999999,
        specular: 0x101010,
      })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0.03;
    plane.receiveShadow = true;
    this.scene.add(plane);

    dracoLoader.load('bunny.drc', (geometry) => {
      geometry.computeVertexNormals();

      const material = new MeshStandardMaterial({ color: 0x606060 });
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      dracoLoader.dispose();
    });
  }

  render() {
    const timer = Date.now() * 0.0003;

    this.camera.position.x = Math.sin(timer) * 0.5;
    this.camera.position.z = Math.cos(timer) * 0.5;
    this.camera.lookAt(0, 0.1, 0);
  }
}

new Demo();
