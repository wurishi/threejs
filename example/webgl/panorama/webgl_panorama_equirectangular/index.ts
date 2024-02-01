import {
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TextureLoader,
  Vector3,
} from "three";
import { Main } from "../../../main";

class Demo extends Main {
  initCamera() {
    super.initCamera(75, 1, 1100, new Vector3(), null);
  }

  initScene() {
    super.defaultScene();
  }

  initPlane() {
    const geometry = new SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const texture = new TextureLoader().load("./bg.jpg");
    const material = new MeshBasicMaterial({ map: texture });

    const mesh = new Mesh(geometry, material);
    this.scene.add(mesh);

    document.addEventListener("drop", (event) => {
      event.preventDefault();

      const reader = new FileReader();
      reader.addEventListener("load", (evt) => {
        material.map.image.src = evt.target.result;
        material.map.needsUpdate = true;
      });
      reader.readAsDataURL(event.dataTransfer.files[0]);
      document.body.style.opacity = "1";
    });
    document.addEventListener("dragenter", () => {
      document.body.style.opacity = "0.5";
    });
    document.addEventListener("dragleave", () => {
      document.body.style.opacity = "1";
    });
    document.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
  }
}

new Demo();
