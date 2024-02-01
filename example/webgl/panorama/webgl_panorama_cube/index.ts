import {
  BoxGeometry,
  ImageLoader,
  Mesh,
  MeshBasicMaterial,
  Texture,
  Vector3,
} from "three";
import { Main } from "../../../main";

function getTexturesFromAtlasFile(atlasImgUrl: string, tilesNum: number) {
  const textures: Texture[] = [];

  for (let i = 0; i < tilesNum; i++) {
    textures[i] = new Texture();
  }

  new ImageLoader().load(atlasImgUrl, (image) => {
    let canvas: HTMLCanvasElement, context: CanvasRenderingContext2D;
    const tileWidth = image.height;
    for (let i = 0; i < textures.length; i++) {
      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");
      canvas.height = tileWidth;
      canvas.width = tileWidth;
      context.drawImage(
        image,
        tileWidth * i,
        0,
        tileWidth,
        tileWidth,
        0,
        0,
        tileWidth,
        tileWidth
      );
      textures[i].image = canvas;
      textures[i].needsUpdate = true;
    }
  });

  return textures;
}

class Demo extends Main {
  initCamera() {
    super.initCamera(90, 0.1, 100, new Vector3(0, 0, 0.01));
  }

  initPlane() {
    const tilesNum = 6;
    const textures = getTexturesFromAtlasFile(
      "sun_temple_stripe.jpg",
      tilesNum
    );
    const materials: MeshBasicMaterial[] = [];
    for (let i = 0; i < tilesNum; i++) {
      materials.push(new MeshBasicMaterial({ map: textures[i] }));
    }
    const skyBox = new Mesh(new BoxGeometry(1, 1, 1), materials);
    skyBox.geometry.scale(1, 1, -1);
    this.scene.add(skyBox);
  }

  initControls() {
    super.initControls(new Vector3(), false, false);
  }
}

new Demo();
