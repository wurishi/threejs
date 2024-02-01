import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as Stats from 'stats.js';
import { GUI, GUIController } from 'dat.gui';

interface MAction {
  [key: string]: {
    weight: number;
    action?: THREE.AnimationAction;
  };
}

let clock: THREE.Clock;
let scene: THREE.Scene;
let model: THREE.Group;
let skeleton: THREE.SkeletonHelper;
let mixer: THREE.AnimationMixer;
let numAnimations = 0;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let stats: Stats;
let currentBaseAction = 'idle';
const crossFadeControls: GUIController[] = [];

const allActions: THREE.AnimationAction[] = [];
const baseActions: MAction = {
  idle: { weight: 1 },
  walk: { weight: 0 },
  run: { weight: 0 },
};
const additiveActions: MAction = {
  sneak_pose: { weight: 0 },
  sad_pose: { weight: 0 },
  agree: { weight: 0 },
  headShake: { weight: 0 },
};
let panelSettings: any;

function addCSSRule(
  sheet: CSSStyleSheet,
  selector: string,
  rules: string,
  index = 0
): void {
  if (sheet.insertRule) {
    sheet.insertRule(selector + '{' + rules + '}', index);
  } else if (sheet.addRule) {
    sheet.addRule(selector, rules, index);
  }
}

function init(): void {
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  // style.type = 'text/css';
  head.appendChild(style);
  addCSSRule(style.sheet, '.control-inactive', 'color:#888;');

  const container = document.createElement('div');
  container.id = 'container';
  document.body.appendChild(container);

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(3, 10, 10);
  dirLight.castShadow = true;
  const { camera } = dirLight.shadow;
  camera.top = 2;
  camera.bottom = -2;
  camera.left = -2;
  camera.right = 2;
  camera.near = 0.1;
  camera.far = 40;
  scene.add(dirLight);

  const mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const loader = new GLTFLoader();
  loader.load('./xbot.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh && mesh.isMesh) {
        mesh.castShadow = true;
      }
    });

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    numAnimations = animations.length;
    for (let i = 0; i < numAnimations; i++) {
      let clip = animations[i];
      const name = clip.name;
      if (baseActions[name]) {
        const action = mixer.clipAction(clip);
        activateAction(action);
        baseActions[name].action = action;
        allActions.push(action);
      } else if (additiveActions[name]) {
        THREE.AnimationUtils.makeClipAdditive(clip);
        if (clip.name.endsWith('_pose')) {
          clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
        }
        const action = mixer.clipAction(clip);
        activateAction(action);
        additiveActions[name].action = action;
        allActions.push(action);
      }
    }

    createPanel();
    animate();
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const _c = createCamera();

  const controls = new OrbitControls(_c, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.target.set(0, 1, 0);
  controls.update();

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize, false);
}

function createCamera(): THREE.Camera {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.set(-1, 2, 3);
  return camera;
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();

function activateAction(action: THREE.AnimationAction): void {
  const clip = action.getClip();
  const settings = baseActions[clip.name] || additiveActions[clip.name];
  setWeight(action, settings.weight);
  action.play();
}

function createPanel(): void {
  const panel = new GUI({ width: 310 });
  const folder1 = panel.addFolder('Base Actions');
  const folder2 = panel.addFolder('Additive Action Weights');
  const folder3 = panel.addFolder('General Speed');

  panelSettings = {
    'modify time scale': 1.0,
  };

  const baseNames = ['None', ...Object.keys(baseActions)];
  for (let i = 0, l = baseNames.length; i < l; i++) {
    const name = baseNames[i];
    const settings = baseActions[name];
    panelSettings[name] = function () {
      const currentSettings = baseActions[currentBaseAction];
      const currentAction = currentSettings ? currentSettings.action : null;
      const action = settings ? settings.action : null;
      prepareCrossFade(currentAction, action, 0.35);
    };
    crossFadeControls.push(folder1.add(panelSettings, name));
  }

  for (const name of Object.keys(additiveActions)) {
    const settings = additiveActions[name];
    panelSettings[name] = settings.weight;
    folder2
      .add(panelSettings, name, 0.0, 1.0, 0.01)
      .listen()
      .onChange((weight) => {
        setWeight(settings.action, weight);
        settings.weight = weight;
      });
  }

  folder3
    .add(panelSettings, 'modify time scale', 0.0, 1.5, 0.01)
    .onChange(modifyTimeScale);

  folder1.open();
  folder2.open();
  folder3.open();

  crossFadeControls.forEach((control: any) => {
    control.classList1 =
      control.domElement.parentElement.parentElement.classList;
    control.classList2 = control.domElement.previousElementSibling.classList;

    control.setInactive = () => control.classList2.add('control-inactive');
    control.setActive = () => control.classList2.remove('control-inactive');

    const settings = baseActions[control.property];

    if (!settings || !settings.weight) {
      control.setInactive();
    }
  });
}
function animate(): void {
  requestAnimationFrame(animate);

  for (let i = 0; i < numAnimations; i++) {
    const action = allActions[i];
    const clip = action.getClip();
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    settings.weight = action.getEffectiveWeight();
  }

  const mixerUpdateDelta = clock.getDelta();
  mixer.update(mixerUpdateDelta);
  stats.update();
  renderer.render(scene, camera);
}

function prepareCrossFade(
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number
): void {
  if (currentBaseAction === 'idle' || !startAction || !endAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }

  if (endAction) {
    const clip = endAction.getClip();
    currentBaseAction = clip.name;
  } else {
    currentBaseAction = 'None';
  }

  crossFadeControls.forEach((control: any) => {
    const name = control.property;
    if (name === currentBaseAction) {
      control.setActive();
    } else {
      control.setInactive();
    }
  });
}

function executeCrossFade(
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number
): void {
  if (endAction) {
    setWeight(endAction, 1);
    endAction.time = 0;
    if (startAction) {
      startAction.crossFadeTo(endAction, duration, true);
    } else {
      endAction.fadeIn(duration);
    }
  } else {
    startAction.fadeOut(duration);
  }
}

function setWeight(action: THREE.AnimationAction, weight: number): void {
  action.enabled = true;
  action.setEffectiveWeight(1);
  action.setEffectiveWeight(weight);
}

function synchronizeCrossFade(
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number
): void {
  mixer.addEventListener('loop', onLoopFinished);
  function onLoopFinished(event: any) {
    console.log(event);
    if (event.action === startAction) {
      mixer.removeEventListener('loop', onLoopFinished);
      executeCrossFade(startAction, endAction, duration);
    }
  }
}

function modifyTimeScale(speed: number) {
  mixer.timeScale = speed;
}
