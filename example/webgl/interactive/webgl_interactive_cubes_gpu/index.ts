import { Main } from '../../../main';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import {
  BoxBufferGeometry,
  BufferGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  Geometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Quaternion,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';

function applyVertexColors(geometry: BufferGeometry, color: Color) {
  const position = geometry.attributes.position;
  const colors: number[] = [];

  for (let i = 0; i < position.count; i++) {
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
}

class Demo extends Main {
  pickingData: any[];
  mouse: Vector2;
  offset: Vector3;

  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }

  initPlane() {
    this.pickingData = [];
    this.mouse = new Vector2();
    this.offset = new Vector3(10, 10, 10);

    this.pickingScene = new Scene();
    this.pickingTexture = new WebGLRenderTarget(1, 1);

    const pickingMaterial = new MeshBasicMaterial({ vertexColors: true });
    const defaultMaterial = new MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      vertexColors: true,
      shininess: 0,
    });

    const geometriesDrawn: BufferGeometry[] = [];
    const geometriesPicking: BufferGeometry[] = [];

    const matrix = new Matrix4();
    const quaternion = new Quaternion();
    const color = new Color();

    for (let i = 0; i < 5000; i++) {
      let geometry = new BoxBufferGeometry();

      const position = new Vector3();
      position.set(
        Math.random() * 10000 - 5000,
        Math.random() * 6000 - 3000,
        Math.random() * 8000 - 4000
      );

      const rotation = new Euler();
      rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      );

      const scale = new Vector3();
      scale.set(
        Math.random() * 200 + 100,
        Math.random() * 200 + 100,
        Math.random() * 200 + 100
      );

      quaternion.setFromEuler(rotation);
      matrix.compose(position, quaternion, scale);

      geometry.applyMatrix4(matrix);

      applyVertexColors(geometry, color.setHex(Math.random() * 0xffffff));

      geometriesDrawn.push(geometry);

      geometry = geometry.clone();

      applyVertexColors(geometry, color.setHex(i));

      geometriesPicking.push(geometry);

      this.pickingData[i] = {
        position,
        rotation,
        scale,
      };
    }

    const objects = new Mesh(
      BufferGeometryUtils.mergeBufferGeometries(geometriesDrawn),
      defaultMaterial
    );
    this.scene.add(objects);

    this.pickingScene.add(
      new Mesh(
        BufferGeometryUtils.mergeBufferGeometries(geometriesPicking),
        pickingMaterial
      )
    );
    this.highlightBox = new Mesh(
      new BoxBufferGeometry(),
      new MeshLambertMaterial({ color: 0xffff00 })
    );
    this.scene.add(this.highlightBox);

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  initControls() {
    const controls = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    this.controls = controls;
  }

  render() {
    this.controls.update();

    this.pick();

    this.renderer.setRenderTarget(null);
  }

  pick() {
    this.camera.setViewOffset(
      this.renderer.domElement.width,
      this.renderer.domElement.height,
      (this.mouse.x * window.devicePixelRatio) | 0,
      (this.mouse.y * window.devicePixelRatio) | 0,
      1,
      1
    );

    this.renderer.setRenderTarget(this.pickingTexture);
    this.renderer.render(this.pickingScene, this.camera);

    this.camera.clearViewOffset();

    const pixelBuffer = new Uint8Array(4);

    this.renderer.readRenderTargetPixels(
      this.pickingTexture,
      0,
      0,
      1,
      1,
      pixelBuffer
    );

    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
    const data = this.pickingData[id];

    if (data) {
      if (data.position && data.rotation && data.scale) {
        this.highlightBox.position.copy(data.position);
        this.highlightBox.rotation.copy(data.rotation);
        this.highlightBox.scale.copy(data.scale).add(this.offset);
        this.highlightBox.visible = true;
      }
    } else {
      this.highlightBox.visible = false;
    }
  }

  pickingScene: Scene;
  pickingTexture: WebGLRenderTarget;
  highlightBox: Mesh;
  controls: TrackballControls;
}

new Demo();
