import {
  DynamicDrawUsage,
  FogExp2,
  PlaneBufferGeometry,
  Vector3,
  BufferAttribute,
  TextureLoader,
  RepeatWrapping,
  MeshBasicMaterial,
  Mesh,
} from 'three';
import { Main } from '../../../main';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

class Demo extends Main {
  worldWidth = 128;
  worldDepth = 128;

  initCamera() {
    super.initCamera(60, 1, 20000, new Vector3(0, 200, 0), null);
  }

  initScene() {
    super.initScene(0xaaccff, 0, 0, false);
    this.scene.fog = new FogExp2(0xaaccff, 0.0007);
  }

  initRenderer() {
    super.initRenderer(true, null);
  }

  initDirLight() {}
  initHemiLight() {}

  geometry: PlaneBufferGeometry;

  initPlane() {
    const geometry = new PlaneBufferGeometry(
      20000,
      20000,
      this.worldWidth - 1,
      this.worldDepth - 1
    );
    geometry.rotateX(-Math.PI / 2);
    this.geometry = geometry;

    const position = geometry.attributes.position as BufferAttribute;
    position.usage = DynamicDrawUsage;

    for (let i = 0; i < position.count; i++) {
      const y = 35 * Math.sin(i / 2);
      position.setY(i, y);
    }

    const texture = new TextureLoader().load('water.jpg');
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(5, 5);

    const material = new MeshBasicMaterial({ color: 0x0044ff, map: texture });

    const mesh = new Mesh(geometry, material);
    this.scene.add(mesh);
  }

  controls: FirstPersonControls;
  initControls() {
    const controls = new FirstPersonControls(
      this.camera,
      this.renderer.domElement
    );
    controls.movementSpeed = 500;
    controls.lookSpeed = 0.1;

    this.controls = controls;
  }

  onWindowResize() {
    super.onWindowResize();

    this.controls.handleResize();
  }

  render() {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime() * 10;

    const position = this.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const y = 35 * Math.sin(i / 5 + (time + i) / 7);
      position.setY(i, y);
    }

    position.needsUpdate = true;

    // this.controls.update(delta);
  }
}

new Demo();
