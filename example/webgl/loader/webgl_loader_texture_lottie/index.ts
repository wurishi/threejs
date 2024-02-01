import { Main, linkScript } from '../../../main';

import { RoomEnvironment } from './RoomEnvironment';
import { RoundedBoxGeometry } from './RoundedBoxGeometry';
import { LottieLoader } from './LottieLoader';
import { Mesh, MeshStandardMaterial, PMREMGenerator, Vector3 } from 'three';

linkScript('lottie_canvas.js', () => {
  new Demo();
});

class Demo extends Main {
  initCamera() {
    super.initCamera(50, 0.1, 10, new Vector3(0, 0, 2.5), null);
  }
  initScene() {
    super.initScene(0x111111, 0, 0, false);
  }

  initPlane() {
    const loader = new LottieLoader();
    loader.setQuality(2);
    loader.load('24017-lottie-logo-animation.json', (texture: any) => {
      setupControls(texture.animation);

      const geometry = new RoundedBoxGeometry(1, 1, 1, 7, 0.2);
      const material = new MeshStandardMaterial({
        roughness: 0.1,
        map: texture,
      });
      mesh = new Mesh(geometry, material);
      this.scene.add(mesh);
    });

    const EnvClass: any = RoomEnvironment;
    const environment = new EnvClass();
    const pmremGenerator = new PMREMGenerator(this.renderer);

    this.scene.environment = pmremGenerator.fromScene(environment).texture;
  }

  render() {
    mesh.rotation.y -= 0.001;
  }
}

function setupControls(animation: any) {
  const scrubber = document.createElement('input');
  scrubber.type = 'range';
  scrubber.value = '0';
  scrubber.style.width = '300px';
  scrubber.style.position = 'absolute';
  scrubber.style.left = 'calc(50% - 150px)';
  scrubber.style.top = '50px';
  scrubber.style.zIndex = '10';
  document.body.appendChild(scrubber);

  scrubber.max = animation.totalFrames;

  scrubber.addEventListener('pointerdown', () => animation.pause());
  scrubber.addEventListener('pointerup', () => animation.play());
  scrubber.addEventListener('input', () => {
    animation.goToAndStop(parseFloat(scrubber.value), true);
  });
  animation.addEventListener('enterFrame', () => {
    scrubber.value = animation.currentFrame;
  });
}

let mesh: Mesh;
