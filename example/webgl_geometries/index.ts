import { Main } from '../main';
import * as THREE from 'three';

class Demo extends Main {
  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    super.initCamera(45, 1, 2000, new THREE.Vector3(0, 400, 0));
  }

  initPlane() {
    const map = new THREE.TextureLoader().load('uv_grid_opengl.jpg');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;

    const material = new THREE.MeshPhongMaterial({
      map,
      side: THREE.DoubleSide,
    });

    let object: THREE.Mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(75, 20, 10),
      material
    );
    object.position.set(-300, 0, 200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(75, 1),
      material
    );
    object.position.set(-100, 0, 200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.OctahedronBufferGeometry(75, 2),
      material
    );
    object.position.set(100, 0, 200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.TetrahedronBufferGeometry(75, 0),
      material
    );
    object.position.set(300, 0, 200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(100, 100, 4, 4),
      material
    );
    object.position.set(-300, 0, 0);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.BoxBufferGeometry(100, 100, 100, 4, 4, 4),
      material
    );
    object.position.set(-100, 0, 0);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.CircleBufferGeometry(50, 20, 0, Math.PI * 2),
      material
    );
    object.position.set(100, 0, 0);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.RingBufferGeometry(10, 50, 20, 5, 0, Math.PI * 2),
      material
    );
    object.position.set(300, 0, 0);
    this.scene.add(object);

    //

    object = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(25, 75, 100, 40, 5),
      material
    );
    object.position.set(-300, 0, -200);
    this.scene.add(object);

    const points: THREE.Vector2[] = [];

    for (let i = 0; i < 50; i++) {
      points.push(
        new THREE.Vector2(
          Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50,
          (i - 5) * 2
        )
      );
    }

    object = new THREE.Mesh(
      new THREE.LatheBufferGeometry(points, 20),
      material
    );
    object.position.set(-100, 0, -200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.TorusBufferGeometry(50, 20, 20, 20),
      material
    );
    object.position.set(100, 0, -200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.TorusBufferGeometry(50, 10, 50, 20),
      material
    );
    object.position.set(300, 0, -200);
    this.scene.add(object);
  }

  initDirLight() {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.camera.add(pointLight);
    this.scene.add(this.camera);
  }

  initHemiLight() {}

  animate() {
    requestAnimationFrame(() => this.animate());

    const timer = Date.now() * 0.0001;

    this.camera.position.x = Math.cos(timer) * 800;
    this.camera.position.z = Math.sin(timer) * 800;

    this.camera.lookAt(this.scene.position);

    this.scene.traverse((object: any) => {
      if (object.isMesh === true) {
        object.rotation.x = timer * 5;
        object.rotation.y = timer * 2.5;
      }
    });

    this.renderer.render(this.scene, this.camera);
    this.stats.update();
  }
}

new Demo();
