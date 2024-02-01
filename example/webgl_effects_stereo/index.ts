import { Main } from '../main';
import * as THREE from 'three';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect';
// import {AnaglyphEffect} from 'three/examples/jsm/effects/AnaglyphEffect';

let mouseX = 0,
  mouseY = 0;
let windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2;

const spheres: THREE.Mesh[] = [];

const urls = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];

let effect: StereoEffect;

class Demo extends Main {
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.CubeTextureLoader()
      .setPath('./')
      .load(urls);
  }

  initPlane() {
    const geometry = new THREE.SphereBufferGeometry(100, 32, 16);
    const textureCube = new THREE.CubeTextureLoader().setPath('./').load(urls);
    textureCube.mapping = THREE.CubeRefractionMapping;

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      envMap: textureCube,
      refractionRatio: 0.95,
    });

    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        Math.random() * 10000 - 5000,
        Math.random() * 10000 - 5000,
        Math.random() * 10000 - 5000
      );
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
      this.scene.add(mesh);

      spheres.push(mesh);
    }

    effect = new StereoEffect(this.renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
  }

  initCamera() {
    super.initCamera(60, 1, 100000, new THREE.Vector3(0, 0, 3200));
  }

  onWindowResize() {
    super.onWindowResize();
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    effect.setSize(window.innerWidth, window.innerHeight);
  }

  initControls() {}

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
    this.stats.update();
  }

  render() {
    const timer = 0.0001 * Date.now();

    this.camera.position.x += (mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    spheres.forEach((sphere, i) => {
      sphere.position.x = 5000 * Math.cos(timer + i);
      sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
    });

    effect.render(this.scene, this.camera);
  }
}

function onDocumentMouseMove(event: MouseEvent) {
  mouseX = (event.clientX - windowHalfX) * 10;
  mouseY = (event.clientY - windowHalfY) * 10;
}

new Demo();
