import { Main } from '../../../main';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  ConeBufferGeometry,
  FogExp2,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  PlaneBufferGeometry,
  Raycaster,
  Texture,
  Vector2,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const worldWidth = 256,
  worldDepth = 256,
  worldHalfWidth = worldWidth / 2,
  worldHalfDepth = worldDepth / 2;

class Demo extends Main {
  mesh: Mesh;
  texture: Texture;

  initCamera() {
    super.initCamera(60, 1, 20000, new Vector3());
  }

  initScene() {
    super.initScene(0xbfd1e5, 0, 0, false);
  }

  initPlane() {
    const data = this.generateHeight(worldWidth, worldDepth);

    this.camera.position.y =
      data[worldHalfWidth + worldHalfDepth * worldWidth] * 10 + 500;

    const geometry = new PlaneBufferGeometry(
      7500,
      7500,
      worldWidth - 1,
      worldDepth - 1
    );
    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array as number[];

    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 1] = data[i] * 10;
    }

    this.texture = new CanvasTexture(
      this.generateTexture(data, worldWidth, worldDepth)
    );
    this.texture.wrapS = this.texture.wrapT = ClampToEdgeWrapping;

    this.mesh = new Mesh(
      geometry,
      new MeshBasicMaterial({ map: this.texture })
    );
    this.scene.add(this.mesh);

    return data;
  }

  generateHeight(width: number, height: number) {
    const size = width * height,
      data = new Uint8Array(size),
      perlin = new ImprovedNoise(),
      z = Math.random() * 100;
    let quality = 1;
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < size; i++) {
        const x = i % width,
          y = ~~(i / width);

        data[i] += Math.abs(
          perlin.noise(x / quality, y / quality, z) * quality * 1.75
        );
      }
      quality *= 5;
    }
    return data;
  }

  generateTexture(data: Uint8Array, width: number, height: number) {
    let shade: number, context: CanvasRenderingContext2D;
    let image: ImageData, imageData: Uint8ClampedArray;

    const vector3 = new Vector3(0, 0, 0);
    const sun = new Vector3(1, 1, 1);
    sun.normalize();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
      vector3.x = data[j - 2] - data[j + 2];
      vector3.y = 2;
      vector3.z = data[j - width * 2] - data[j + width * 2];
      vector3.normalize();

      shade = vector3.dot(sun);

      imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
      imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
      imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
    }

    context.putImageData(image, 0, 0);

    // 4x

    const canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (let i = 0, l = imageData.length; i < l; i += 4) {
      const v = ~~(Math.random() * 5);
      imageData[i] += v;
      imageData[i + 1] += v;
      imageData[i + 2] += v;
    }
    context.putImageData(image, 0, 0);
    return canvasScaled;
  }
}

class DemoFog extends Demo {
  initScene() {
    super.initScene();
    this.scene.fog = new FogExp2(0xefd1b5, 0.0025);
  }
}

class DemoRaycast extends Demo {
  helper: Mesh;
  mouse: Vector2 = new Vector2();
  raycaster = new Raycaster();
  controls: OrbitControls;
  data: Uint8Array;

  initPlane() {
    const data = super.initPlane();

    const geometryHelper = new ConeBufferGeometry(20, 100, 3);
    geometryHelper.translate(0, 50, 0);
    geometryHelper.rotateX(Math.PI / 2);

    this.helper = new Mesh(geometryHelper, new MeshNormalMaterial());
    this.scene.add(this.helper);

    this.container.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this),
      false
    );

    this.data = data;
    return data;
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 1000;
    this.controls.maxDistance = 10000;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.controls.target.y =
      this.data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;
    this.camera.position.y = this.controls.target.y + 2000;
    this.camera.position.x = 2000;
    this.controls.update();
  }

  onMouseMove(event: MouseEvent) {
    const { clientWidth, clientHeight } = this.renderer.domElement;
    const { clientX, clientY } = event;
    this.mouse.x = (clientX / clientWidth) * 2 - 1;
    this.mouse.y = (clientY / clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.mesh);
    // console.log(intersects.length);
    if (intersects.length > 0) {
      this.helper.position.set(0, 0, 0);
      this.helper.lookAt(intersects[0].face.normal);

      this.helper.position.copy(intersects[0].point);
    }
  }
}

new Demo(); //
// new DemoFog(); // Fog
// new DemoRaycast(); // Raycast
