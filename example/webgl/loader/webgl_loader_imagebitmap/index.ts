import {
  BoxBufferGeometry,
  CanvasTexture,
  GridHelper,
  Group,
  ImageBitmapLoader,
  ImageLoader,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { Main } from '../../../main';

const geometry = new BoxBufferGeometry(1, 1, 1);

class Demo extends Main {
  initCamera() {
    super.initCamera(30, 1, 1500, new Vector3(0, 4, 7), new Vector3(0, 0, 0));
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    group = new Group();
    this.scene.add(group);

    group.add(new GridHelper(4, 12, 0x888888, 0x444444));

    cubes = new Group();
    group.add(cubes);

    setTimeout(addImage, 300);
    setTimeout(addImage, 600);
    setTimeout(addImage, 900);
    setTimeout(addImageBitmap, 1300);
    setTimeout(addImageBitmap, 1600);
    setTimeout(addImageBitmap, 1900);
  }

  render() {
    group.rotation.y = performance.now() / 3000;
  }
}

function addImageBitmap() {
  new ImageBitmapLoader()
    .setOptions({ imageOrientation: 'none' })
    .load('earth_atmos_2048.jpg?' + performance.now(), (imageBitmap: any) => {
      const texture = new CanvasTexture(imageBitmap);
      const material = new MeshBasicMaterial({ map: texture });

      addCube(material);
    });
}

function addImage() {
  new ImageLoader()
    .setCrossOrigin('*')
    .load('earth_atmos_2048.jpg?' + performance.now(), (image) => {
      const texture = new CanvasTexture(image);
      const material = new MeshBasicMaterial({
        color: 0xff8888,
        map: texture,
      });
      addCube(material);
    });
}

function addCube(material: MeshBasicMaterial) {
  const cube = new Mesh(geometry, material);
  cube.position.set(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  );
  cube.rotation.set(
    Math.random() * 2 * Math.PI,
    Math.random() * 2 * Math.PI,
    Math.random() * 2 * Math.PI
  );
  cubes.add(cube);
}

let group: Group;
let cubes: Group;

new Demo();
