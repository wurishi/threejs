import { Main } from '../main';
import * as THREE from 'three';

class Demo extends Main {
  initCamera() {
    super.initCamera(20, 1, 10000, new THREE.Vector3(0, 0, 1800));
  }

  initScene() {
    super.initScene(0xffffff, 0, 0, false);
  }

  initDirLight() {
    super.initDirLight(0xffffff, new THREE.Vector3(0, 0, 1), false);
  }
  initHemiLight() {}

  initPlane() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    gradient.addColorStop(0.1, 'rgba(210,210,210,1');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const shadowTexture = new THREE.CanvasTexture(canvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture });
    const shadowGeo = new THREE.PlaneBufferGeometry(300, 300, 1, 1);

    [0, -400, 400].forEach((x) => {
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
      shadowMesh.position.x = x;
      shadowMesh.position.y = -250;
      shadowMesh.rotation.x = -Math.PI / 2;
      this.scene.add(shadowMesh);
    });

    const radius = 200;
    const geometry1 = new THREE.IcosahedronBufferGeometry(radius, 1);

    const count = geometry1.attributes.position.count;
    geometry1.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    );

    const geometry2 = geometry1.clone();
    const geometry3 = geometry1.clone();

    const color = new THREE.Color();
    const pc = [geometry1, geometry2, geometry3].map((geo) => ({
      p: geo.attributes.position,
      c: geo.attributes.color,
    }));
    for (let i = 0; i < count; i++) {
      color.setHSL((pc[0].p.getY(i) / radius + 1) / 2, 1.0, 0.5);
      pc[0].c.setXYZ(i, color.r, color.g, color.b);

      color.setHSL(0, (pc[1].p.getY(i) / radius + 1) / 2, 0.5);
      pc[1].c.setXYZ(i, color.r, color.g, color.b);

      color.setRGB(1, 0.8 - (pc[2].p.getY(i) / radius + 1) / 2, 0);
      pc[2].c.setXYZ(i, color.r, color.g, color.b);
    }

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      vertexColors: true,
      shininess: 0,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      transparent: true,
    });

    [geometry1, geometry2, geometry3].forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, material);
      const wireframe = new THREE.Mesh(geo, wireframeMaterial);
      mesh.add(wireframe);
      if (i == 0) {
        mesh.position.x = -400;
        mesh.rotation.x = -1.87;
      } else if (i == 1) {
        mesh.position.x = 400;
      }
      this.scene.add(mesh);
    });
  }

  mouseX = 0;
  mouseY = 0;

  // initControls() {
  //   document.addEventListener(
  //     'mousemove',
  //     (event) => {
  //       this.mouseX = event.clientX - window.innerWidth / 2;
  //       this.mouseY = event.clientY - window.innerHeight / 2;
  //     },
  //     false
  //   );
  // }

  render() {
    // this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    // this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;

    // this.camera.lookAt(this.scene.position);
  }
}

new Demo();
