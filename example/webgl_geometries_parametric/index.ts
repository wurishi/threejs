import { Main } from '../main';
import * as THREE from 'three';
import { Curves } from 'three/examples/jsm/curves/CurveExtras';
import { ParametricGeometries } from 'three/examples/jsm/geometries/ParametricGeometries';

class Demo extends Main {
  initRenderer() {
    super.initRenderer(true, null);
  }

  initCamera() {
    super.initCamera(45, 1, 2000, new THREE.Vector3(0, 400, 0));
  }

  initScene() {
    super.initScene(0x000000, 0, 0, false);
  }

  initHemiLight() {}
  initDirLight() {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.camera.add(pointLight);
    this.scene.add(this.camera);
  }

  initPlane() {
    const map = new THREE.TextureLoader().load('uv_grid_opengl.jpg');
    map.wrapT = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;

    const material = new THREE.MeshPhongMaterial({
      map,
      side: THREE.DoubleSide,
    });

    // let geometry = new THREE.ParametricBufferGeometry(
    //   ParametricGeometries.plane,
    //   10,
    //   10
    // );
    // geometry.center();
    let object: THREE.Mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(100, 100, 10, 10),
      material
    );
    object.position.set(-200, 0, 200);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.ParametricBufferGeometry(ParametricGeometries.klein, 20, 20),
      material
    );
    object.position.set(0, 0, 200);
    object.scale.multiplyScalar(5);
    this.scene.add(object);

    object = new THREE.Mesh(
      new THREE.ParametricBufferGeometry(ParametricGeometries.mobius, 20, 20),
      material
    );
    object.position.set(200, 0, 200);
    object.scale.multiplyScalar(30);
    this.scene.add(object);

    const GrannyKnot = new Curves.GrannyKnot();
    let t_torus: any = new ParametricGeometries.TorusKnotGeometry(
      50,
      10,
      50,
      20,
      2,
      3
    );
    let t_sphere: any = new ParametricGeometries.SphereGeometry(50, 20, 10);
    let t_tube: any = new ParametricGeometries.TubeGeometry(
      GrannyKnot,
      100,
      3,
      8,
      true
    );

    let torus = new THREE.BufferGeometry().fromGeometry(t_torus);
    let sphere = new THREE.BufferGeometry().fromGeometry(t_sphere);
    let tube = new THREE.BufferGeometry().fromGeometry(t_tube);

    object = new THREE.Mesh(torus, material);
    object.position.set(-200, 0, -200);
    this.scene.add(object);

    object = new THREE.Mesh(sphere, material);
    object.position.set(0, 0, -200);
    this.scene.add(object);

    object = new THREE.Mesh(tube, material);
    object.position.set(200, 0, -200);
    this.scene.add(object);
  }

  render() {
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
  }
}

new Demo();
