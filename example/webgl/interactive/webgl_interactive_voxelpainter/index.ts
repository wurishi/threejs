import {
  BoxBufferGeometry,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneBufferGeometry,
  Raycaster,
  TextureLoader,
  Vector2,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initScene() {
    super.initScene(0xf0f0f0, 0, 0, false);
  }

  initPlane() {
    // roll-over helpers
    const rollOverGeo = new BoxBufferGeometry(50, 50, 50);
    rollOverMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    rollOverMesh = new Mesh(rollOverGeo, rollOverMaterial);
    this.scene.add(rollOverMesh);

    // cubes
    cubeGeo = new BoxBufferGeometry(50, 50, 50);
    cubeMaterial = new MeshLambertMaterial({
      color: 0xfeb74c,
      map: new TextureLoader().load('square-outline-textured.png'),
    });

    // grid
    const gridHelper = new GridHelper(1000, 20);
    this.scene.add(gridHelper);

    //
    raycaster = new Raycaster();
    mouse = new Vector2();

    const geometry = new PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);

    plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
    this.scene.add(plane);

    objects.push(plane);

    document.addEventListener('mousemove', (e) => this.mouseMove(e), false);
    document.addEventListener('mousedown', (e) => this.mouseDown(e), false);
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.keyCode === 16) {
          isShiftDown = true;
        }
      },
      false
    );
    document.addEventListener(
      'keyup',
      (event) => {
        if (event.keyCode === 16) {
          isShiftDown = false;
        }
      },
      false
    );
  }

  mouseMove = (e: MouseEvent) => {
    // console.log(e);
    e.preventDefault();

    mouse.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      rollOverMesh.position
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25);
    }
  };

  mouseDown = (e: MouseEvent) => {
    e.preventDefault();

    mouse.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(objects);
    // console.log(intersects);
    if (intersects.length > 0) {
      const intersect = intersects[0];

      if (isShiftDown) {
        // delete cube
        if (intersect.object !== plane) {
          this.scene.remove(intersect.object);
          objects.splice(objects.indexOf(intersect.object as any), 1);
        }
      } else {
        // create cube
        const voxel = new Mesh(cubeGeo, cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position
          .divideScalar(50)
          .floor()
          .multiplyScalar(50)
          .addScalar(25);
        this.scene.add(voxel);

        objects.push(voxel);
      }
    }
  };
}

let rollOverMaterial: MeshBasicMaterial;
let rollOverMesh: Mesh;

let cubeGeo: BoxBufferGeometry;
let cubeMaterial: MeshLambertMaterial;

let raycaster: Raycaster;
let mouse: Vector2;

let plane: Mesh;

let objects: Mesh[] = [];

let isShiftDown = false;

new Demo();
