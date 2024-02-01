import * as THREE from 'three';
import { OrbitControls } from '../OrbitControls';

const dpr = window.devicePixelRatio;
const textureSize = 128 * dpr;

export default class Webgl {
  constructor(w, h) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x20252f);

    this.vector = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(70, w / h, 1, 1000);
    this.camera.position.z = 20;
    this.scene.add(this.camera);

    this.cameraOrtho = new THREE.OrthographicCamera(
      -w / 2,
      w / 2,
      h / 2,
      -h / 2,
      1,
      10
    );
    this.cameraOrtho.position.z = 10;

    this.sceneOrtho = new THREE.Scene();

    const geometry = new THREE.TorusKnotBufferGeometry(3, 1, 256, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x6083c2 });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    // this._renderer.setClearColor(0x0c171a);
    this._renderer.setSize(w, h);
    this._renderer.autoClear = false;
    this.dom = this._renderer.domElement;

    this.usePostprocessing = false;
    this._composer = false;
    this._passes = {};
    this.initPostprocessing();
    this.onResize(w, h);

    this.onUpdate = this.onUpdate.bind(this);
    this.onResize = this.onResize.bind(this);

    const data = new Uint8Array(textureSize * textureSize * 3);

    this.texture = new THREE.DataTexture(
      data,
      textureSize,
      textureSize,
      THREE.RGBFormat
    );
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    const spriteMaterial = new THREE.SpriteMaterial({ map: this.texture });
    this.sprite = new THREE.Sprite(spriteMaterial);
    this.sprite.scale.set(textureSize, textureSize);
    this.sceneOrtho.add(this.sprite);

    this.updateSpritePosition(w, h);

    const controls = new OrbitControls(this.camera, this.dom);
    controls.enablePan = false;
  }

  updateSpritePosition(w, h) {
    const halfWidth = w / 2;
    const halfHeight = h / 2;
    const halfImageWidth = textureSize / 2;
    const halfImageHeight = textureSize / 2;

    this.sprite &&
      this.sprite.position.set(
        -halfWidth + halfImageWidth,
        halfHeight - halfImageHeight,
        1
      );
  }

  initPostprocessing() {
    if (!this.usePostprocessing) return;
    // TODO add WAGNER
    this._composer = new WAGNER.Composer(this._renderer);
    this._composer.setSize(this.width, this.height);
    this._passes.vignettePass = new WAGNER.VignettePass();
    this._passes.fxaaPass = new WAGNER.FXAAPass();
  }

  add(mesh) {
    this.scene.add(mesh);
  }

  onUpdate() {
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.1;

    this._renderer.clear();
    this._renderer.render(this.scene, this.camera);

    this.vector.x = (this.width * dpr) / 2 - textureSize / 2;
    this.vector.y = (this.height * dpr) / 2 - textureSize / 2;

    this._renderer.copyFramebufferToTexture(this.vector, this.texture);

    this._renderer.clearDepth();
    this._renderer.render(this.sceneOrtho, this.cameraOrtho);
  }

  onResize(w, h) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.cameraOrtho.left = -w / 2;
    this.cameraOrtho.right = w / 2;
    this.cameraOrtho.top = h / 2;
    this.cameraOrtho.bottom = -h / 2;
    this.cameraOrtho.updateProjectionMatrix();

    this._renderer.setSize(w, h);

    this.updateSpritePosition(w, h);
  }
}
