import { Main } from '../../../main';

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import {
  Euler,
  Material,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  Scene,
  Vector3,
} from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(35, 1, 15, new Vector3(3, 0.15, 3));

    this.camera.lookAt(new Vector3(0, -0.25, 0));
  }

  initScene() {
    super.initScene(0x72645b, 2, 15);
  }

  initPlane() {
    const plane = new Mesh(
      new PlaneGeometry(40, 40),
      new MeshPhongMaterial({
        color: 0x999999,
        specular: 0x101010,
      })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    this.scene.add(plane);

    plane.receiveShadow = true;

    load(
      this.scene,
      'slotted_disk.stl',
      new MeshPhongMaterial({
        color: 0xff5533,
        specular: 0x111111,
        shininess: 200,
      }),
      new Vector3(0, -0.25, 0.6),
      new Euler(0, -Math.PI / 2, 0),
      0.5
    );

    load(
      this.scene,
      'pr2_head_pan.stl',
      new MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 200,
      }),
      new Vector3(0, -0.37, -0.6),
      new Euler(-Math.PI / 2, 0, 0),
      2
    );

    load(
      this.scene,
      'pr2_head_tilt.stl',
      new MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 200,
      }),
      new Vector3(0.136, -0.37, -0.6),
      new Euler(-Math.PI / 2, 0.3, 0),
      2
    );

    load(
      this.scene,
      'colored.stl',
      new MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 200,
      }),
      new Vector3(0.5, 0.2, 0),
      new Euler(-Math.PI / 2, Math.PI / 2, 0),
      0.3
    );
  }
}

const loader = new STLLoader();

function load(
  scene: Scene,
  url: string,
  material: Material,
  pos: Vector3,
  r: Euler,
  scale: number
) {
  loader.load(url, (geometry) => {
    let meshMaterial = material;
    const _g: any = geometry;
    if (_g.hasColors) {
      meshMaterial = new MeshPhongMaterial({
        opacity: _g.alpha,
        vertexColors: true,
      });
    }
    const mesh = new Mesh(geometry, meshMaterial);

    mesh.position.copy(pos);
    mesh.rotation.copy(r);
    mesh.scale.set(scale, scale, scale);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
  });
}

new Demo();
