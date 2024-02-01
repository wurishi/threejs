import { Main } from '../../../main';

import { MD2CharacterComplex } from 'three/examples/jsm/misc/MD2CharacterComplex';
import { Gyroscope } from 'three/examples/jsm/misc/Gyroscope';
import {
  Clock,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  RepeatWrapping,
  sRGBEncoding,
  TextureLoader,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls: any = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
};

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 4000, new Vector3(0, 150, 1300));
  }

  initScene() {
    super.initScene(0xffffff, 1000, 4000, true);
  }

  initControls() {
    const cameraControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    cameraControls.target.set(0, 50, 0);
    cameraControls.enableKeys = false;
    cameraControls.update();
  }

  initDirLight() {}

  initPlane() {
    const light = new DirectionalLight(0xffffff, 2.25);
    light.position.set(200, 450, 500);
    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 512;

    light.shadow.camera.near = 100;
    light.shadow.camera.far = 1200;

    light.shadow.camera.left = -1000;
    light.shadow.camera.right = 1000;
    light.shadow.camera.top = 350;
    light.shadow.camera.bottom = -350;

    this.scene.add(light);

    const gt = new TextureLoader().load('grasslight-big.jpg');
    const gg = new PlaneBufferGeometry(16000, 16000);
    const gm = new MeshPhongMaterial({ color: 0xffffff, map: gt });

    const ground = new Mesh(gg, gm);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(64, 64);
    ground.material.map.wrapT = ground.material.map.wrapS = RepeatWrapping;
    ground.material.map.encoding = sRGBEncoding;
    ground.receiveShadow = true;

    this.scene.add(ground);

    document.addEventListener('keydown', keyFn(true), false);
    document.addEventListener('keyup', keyFn(false), false);

    const configOgro = {
      baseUrl: 'models/',

      body: 'ogro.md2',
      skins: [
        'grok.jpg',
        'ogrobase.png',
        'arboshak.png',
        'ctf_r.png',
        'ctf_b.png',
        'darkam.png',
        'freedom.png',
        'gib.png',
        'gordogh.png',
        'igdosh.png',
        'khorne.png',
        'nabogro.png',
        'sharokh.png',
      ],
      weapons: [['weapon.md2', 'weapon.jpg']],
      animations: {
        move: 'run',
        idle: 'stand',
        jump: 'jump',
        attack: 'attack',
        crouchMove: 'cwalk',
        crouchIdle: 'cstand',
        crouchAttach: 'crattack',
      },

      walkSpeed: 350,
      crouchSpeed: 175,
    };

    const nRows = 1;
    const nSkins = configOgro.skins.length;

    nCharacters = nSkins * nRows;

    for (let i = 0; i < nCharacters; i++) {
      const character = new MD2CharacterComplex();
      character.scale = 3;
      character.controls = controls;
      characters.push(character);
    }

    const baseCharacter = new MD2CharacterComplex();
    baseCharacter.scale = 3;

    baseCharacter.onLoadComplete = () => {
      let k = 0;
      for (let j = 0; j < nRows; j++) {
        for (let i = 0; i < nSkins; i++) {
          const cloneCharacter = characters[k];
          cloneCharacter.shareParts(baseCharacter);

          cloneCharacter.setWeapon(0);
          cloneCharacter.setSkin(i);

          cloneCharacter.root.position.set(
            (i - nSkins / 2) * 150,
            cloneCharacter.root.position.y,
            j * 250
          );

          this.scene.add(cloneCharacter.root);

          k++;
        }
      }
      const gyro = new Gyroscope();
      gyro.add(this.camera);
      gyro.add(light, light.target);

      characters[Math.floor(nSkins / 2)].root.add(gyro);
    };

    baseCharacter.loadParts(configOgro);
  }

  render() {
    const delta = clock.getDelta();
    characters.forEach((c) => {
      c.update(delta);
    });
  }
}

let nCharacters = 0;
let characters: MD2CharacterComplex[] = [];
let clock = new Clock();

const keyFn = (flag: boolean) => (event: KeyboardEvent) => {
  switch (event.keyCode) {
    case 38:
    case 87:
      controls.moveForward = flag;
      break;
    case 40:
    case 83:
      controls.moveBackward = flag;
      break;
    case 37:
    case 65:
      controls.moveLeft = flag;
      break;
    case 39:
    case 68:
      controls.moveRight = flag;
      break;
    case 67: // C
      controls.crouch = flag;
      break;
    case 32: // space
      controls.jump = flag;
      break;
    case 17: //ctrl
      controls.attack = flag;
      break;
  }
};

new Demo();
