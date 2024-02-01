import {
  AmbientLight,
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  PCFSoftShadowMap,
  PlaneBufferGeometry,
  SpotLight,
  SpotLightHelper,
  sRGBEncoding,
  Vector2,
  Vector3,
} from 'three';
import { Main } from '../../../main';

class Demo extends Main {
  initRenderer() {
    super.initRenderer(true, {
      shadowEnabled: true,
      shadowType: PCFSoftShadowMap,
      outputEncoding: sRGBEncoding,
    });
  }
  initScene() {
    super.initScene(0, 0, 0, false);
  }
  initCamera() {
    super.initCamera(35, 1, 2000, new Vector3(46, 22, -21));
  }

  initHemiLight() {}
  initDirLight() {}

  initPlane() {
    spotLight1.position.set(15, 40, 45);
    spotLight2.position.set(0, 40, 35);
    spotLight3.position.set(-15, 40, 45);

    lightHelper1 = new SpotLightHelper(spotLight1);
    lightHelper2 = new SpotLightHelper(spotLight2);
    lightHelper3 = new SpotLightHelper(spotLight3);

    matFloor.color.set(0x808080);

    mshFloor.receiveShadow = true;
    mshFloor.position.set(0, -0.05, 0);

    mshBox.castShadow = true;
    mshBox.receiveShadow = true;
    mshBox.position.set(0, 5, 0);

    this.scene.add(mshFloor);
    this.scene.add(mshBox);
    this.scene.add(ambient);
    this.scene.add(spotLight1, spotLight2, spotLight3);
    this.scene.add(lightHelper1, lightHelper2, lightHelper3);
  }

  render() {
    tweenPos(spotLight1, 30);
    tweenPos(spotLight2, 50);
    tweenPos(spotLight3, 40);

    tween2(spotLight1, 30);
    tween2(spotLight2, 50);
    tween2(spotLight3, 40);

    lightHelper1.update();
    lightHelper2.update();
    lightHelper3.update();
  }
}

const _tweenMap = new Map<SpotLight, Vector3>();
function tweenPos(light: SpotLight, time = 30) {
  const target =
    _tweenMap.get(light) ||
    new Vector3(
      Math.random() * 30 - 15,
      Math.random() * 10 + 15,
      Math.random() * 30 - 15
    );
  _tweenMap.set(light, target);
  if (
    Math.abs(light.position.x - target.x) < 0.1 &&
    Math.abs(light.position.y - target.y) < 0.1 &&
    Math.abs(light.position.z - target.z) < 0.1
  ) {
    _tweenMap.set(
      light,
      new Vector3(
        Math.random() * 30 - 15,
        Math.random() * 10 + 15,
        Math.random() * 30 - 15
      )
    );
  } else {
    light.position.x += (target.x - light.position.x) / time;
    light.position.y += (target.y - light.position.y) / time;
    light.position.z += (target.z - light.position.z) / time;
  }
}

const _tweenMap2 = new Map<SpotLight, Vector2>();
function tween2(light: SpotLight, time = 30) {
  const t =
    _tweenMap2.get(light) ||
    new Vector2(Math.random() * 0.7 + 0.1, Math.random() + 1);
  _tweenMap2.set(light, t);
  if (
    Math.abs(light.angle - t.x) < 0.1 &&
    Math.abs(light.penumbra - t.y) < 0.1
  ) {
    _tweenMap2.set(
      light,
      new Vector2(Math.random() * 0.7 + 0.1, Math.random() + 1)
    );
  } else {
    light.angle += (t.x - light.angle) / time;
    light.penumbra += (t.y - light.penumbra) / time;
  }
}

const matFloor = new MeshPhongMaterial();
const matBox = new MeshPhongMaterial({ color: 0xaaaaaa });

const geoFloor = new PlaneBufferGeometry(2000, 2000);
const geoBox = new BoxBufferGeometry(3, 1, 2);

const mshFloor = new Mesh(geoFloor, matFloor);
mshFloor.rotation.x = -Math.PI * 0.5;
const mshBox = new Mesh(geoBox, matBox);

const ambient = new AmbientLight(0x111111);

function createSpotlight(color: number) {
  const newObj = new SpotLight(color, 2);

  newObj.castShadow = true;
  newObj.angle = 0.3;
  newObj.penumbra = 0.2;
  newObj.decay = 2;
  newObj.distance = 50;

  return newObj;
}

const spotLight1 = createSpotlight(0xff7f00);
const spotLight2 = createSpotlight(0x00ff7f);
const spotLight3 = createSpotlight(0x7f00ff);
let lightHelper1: SpotLightHelper,
  lightHelper2: SpotLightHelper,
  lightHelper3: SpotLightHelper;

new Demo();
