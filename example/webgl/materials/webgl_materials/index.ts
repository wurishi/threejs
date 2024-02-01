import {
  AdditiveBlending,
  Geometry,
  GridHelper,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  PointLight,
  SphereGeometry,
  Texture,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 2000, new Vector3(0, 200, 800));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const helper = new GridHelper(1000, 40, 0x303030, 0x303030);
    helper.position.y = -75;
    this.scene.add(helper);

    const texture = new Texture(generateTexture());
    texture.needsUpdate = true;

    materials.push(
      new MeshLambertMaterial({ map: texture, transparent: true })
    );
    materials.push(new MeshLambertMaterial({ color: 0xdddddd }));
    materials.push(
      new MeshPhongMaterial({
        color: 0xdddddd,
        specular: 0x009900,
        shininess: 30,
        flatShading: true,
      })
    );
    materials.push(new MeshNormalMaterial());
    materials.push(
      new MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        blending: AdditiveBlending,
      })
    );
    materials.push(new MeshLambertMaterial({ color: 0xdddddd }));
    materials.push(
      new MeshPhongMaterial({
        color: 0xdddddd,
        specular: 0x009900,
        shininess: 30,
        map: texture,
        transparent: true,
      })
    );
    materials.push(new MeshNormalMaterial({ flatShading: true }));
    materials.push(new MeshBasicMaterial({ color: 0xffaa00, wireframe: true }));
    materials.push(new MeshDepthMaterial());
    materials.push(
      new MeshLambertMaterial({ color: 0x666666, emissive: 0xff0000 })
    );
    materials.push(
      new MeshPhongMaterial({
        color: 0x000000,
        specular: 0x666666,
        emissive: 0xff0000,
        shininess: 10,
        opacity: 0.9,
        transparent: true,
      })
    );
    materials.push(new MeshBasicMaterial({ map: texture, transparent: true }));

    const geometry = new SphereGeometry(70, 32, 16);
    materials.forEach((material) => this.addMesh(geometry, material));

    pointLight = new PointLight(0xffffff, 1);
    this.scene.add(pointLight);

    pointLight.add(
      new Mesh(
        new SphereGeometry(4, 8, 8),
        new MeshBasicMaterial({ color: 0xffffff })
      )
    );
  }

  addMesh(geometry: Geometry, material: Material) {
    const mesh = new Mesh(geometry, material);
    mesh.position.x = (objects.length % 4) * 200 - 400;
    mesh.position.z = Math.floor(objects.length / 4) * 200 - 200;

    mesh.rotation.set(
      Math.random() * 200 - 100,
      Math.random() * 200 - 100,
      Math.random() * 200 - 100
    );
    objects.push(mesh);

    this.scene.add(mesh);
  }

  render() {
    const timer = 0.0001 * Date.now();

    this.camera.position.set(
      Math.cos(timer) * 1000,
      this.camera.position.y,
      Math.sin(timer) * 1000
    );
    this.camera.lookAt(this.scene.position);

    objects.forEach((object) => {
      object.rotation.x += 0.01;
      object.rotation.y += 0.005;
    });

    (materials[materials.length - 2] as any).emissive.setHSL(
      0.54,
      1,
      0.35 * (0.5 + 0.5 * Math.sin(35 * timer))
    );
    (materials[materials.length - 3] as any).emissive.setHSL(
      0.04,
      1,
      0.35 * (0.5 + 0.5 * Math.cos(35 * timer))
    );

    pointLight.position.set(
      Math.sin(timer * 7) * 300,
      Math.cos(timer * 5) * 400,
      Math.cos(timer * 3) * 300
    );
  }
}

const materials: Material[] = [];
const objects: Mesh[] = [];
let pointLight: PointLight;

function generateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext('2d');
  const image = context.getImageData(0, 0, 256, 256);

  let x = 0,
    y = 0;
  for (let i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {
    x = j % 256;
    y = x === 0 ? y + 1 : y;

    image.data[i] = 255;
    image.data[i + 1] = 255;
    image.data[i + 2] = 255;
    image.data[i + 3] = Math.floor(x ^ y);
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

new Demo();
