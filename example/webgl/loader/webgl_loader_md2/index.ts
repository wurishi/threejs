import { Main } from '../../../main';

import { MD2Character } from 'three/examples/jsm/misc/MD2Character';
import {
  AnimationClip,
  Clock,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  RepeatWrapping,
  sRGBEncoding,
  TextureLoader,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const playbackConfig: any = {
  speed: 1.0,
  wireframe: false,
};

class Demo extends Main {
  initCamera() {
    super.initCamera(40, 1, 1000, new Vector3(0, 150, 400));
  }

  initScene() {
    super.initScene(0x050505, 400, 1000, true);
  }

  initPlane() {
    const gt = new TextureLoader().load('grasslight-big.jpg');
    const gg = new PlaneBufferGeometry(2000, 2000);
    const gm = new MeshPhongMaterial({
      color: 0xffffff,
      map: gt,
    });

    const ground = new Mesh(gg, gm);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(8, 8);
    ground.material.map.wrapS = ground.material.map.wrapT = RepeatWrapping;
    ground.material.map.encoding = sRGBEncoding;
    ground.receiveShadow = true;

    this.scene.add(ground);

    this.initGUI();
  }

  initGUI() {
    gui = new GUI();

    gui.add(playbackConfig, 'speed', 0, 2).onChange(() => {
      character.setPlaybackRate(playbackConfig.speed);
    });

    gui.add(playbackConfig, 'wireframe', false).onChange(() => {
      character.setWireframe(playbackConfig.wireframe);
    });

    const config: any = {
      baseUrl: 'models/',
      body: 'ratamahatta.md2',
      skins: [
        'ratamahatta.png',
        'ctf_b.png',
        'ctf_r.png',
        'dead.png',
        'gearwhore.png',
      ],
      weapons: [
        ['weapon.md2', 'weapon.png'],
        ['w_bfg.md2', 'w_bfg.png'],
        ['w_blaster.md2', 'w_blaster.png'],
        ['w_chaingun.md2', 'w_chaingun.png'],
        ['w_glauncher.md2', 'w_glauncher.png'],
        ['w_hyperblaster.md2', 'w_hyperblaster.png'],
        ['w_machinegun.md2', 'w_machinegun.png'],
        ['w_railgun.md2', 'w_railgun.png'],
        ['w_rlauncher.md2', 'w_rlauncher.png'],
        ['w_shotgun.md2', 'w_shotgun.png'],
        ['w_sshotgun.md2', 'w_sshotgun.png'],
      ],
    };

    character = new MD2Character();
    character.scale = 3;

    character.onLoadComplete = () => {
      setupSkinsGUI(character);
      setupWeaponsGUI(character);
      setupGUIAnimations(character);

      character.setAnimation(
        (character.meshBody.geometry as Geometry).animations[0].name
      );
    };

    character.loadParts(config);
    this.scene.add(character.root);
  }

  render() {
    character && character.update(clock.getDelta());
  }
}

function setupSkinsGUI(character: MD2Character) {
  const folder = gui.addFolder('Skins');

  const generateCallback = (index: number) => () => character.setSkin(index);

  const guiItems = [];
  character.skinsBody.forEach(({ name }, i) => {
    playbackConfig[name] = generateCallback(i);
    guiItems[i] = folder.add(playbackConfig, name).name(labelize(name));
  });

  // folder.open();
}

function setupWeaponsGUI(character: MD2Character) {
  const folder = gui.addFolder('Weapons');

  const generateCallback = (index: number) => () => character.setWeapon(index);

  const guiItems = [];

  character.weapons.forEach(({ name }, i) => {
    playbackConfig[name] = generateCallback(i);
    guiItems[i] = folder.add(playbackConfig, name).name(labelize(name));
  });

  // folder.open();
}

function setupGUIAnimations(character: MD2Character) {
  const folder = gui.addFolder('Animations');

  const generateCallback = (animationClip: AnimationClip) => () =>
    character.setAnimation(animationClip.name);

  const guiItems = [];
  const animations = (character.meshBody.geometry as Geometry).animations;

  for (let i = 0; i < animations.length; i++) {
    const clip = animations[i];

    playbackConfig[clip.name] = generateCallback(clip);
    guiItems[i] = folder.add(playbackConfig, clip.name, clip.name);
    // i++;
  }

  // folder.open();
}

function labelize(text: string) {
  const parts = text.split('.');
  if (parts.length > 1) {
    parts.length -= 1;
    return parts.join('.');
  }
  return text;
}

let character: MD2Character;
let gui: GUI;
let clock = new Clock();

new Demo();
