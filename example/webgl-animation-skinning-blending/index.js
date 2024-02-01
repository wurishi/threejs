import * as THREE from 'three';
import Stats from 'stats.js';
import { GUI } from 'dat.gui';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let scene, camera, renderer;
let stats;
let actions, settings;
let idleAction;
let walkAction;
let runAction;
let idleWeight = 0,
  walkWeight = 0,
  runWeight = 0;
let singleStepMode = false,
  sizeOfNextStep = 0;
let mixer;
let model, skeleton;
let crossFadeControls = [];
let clock;

function addCSSRule(sheet, selector, rules, index = 0) {
  if (sheet.insertRule) {
    sheet.insertRule(selector + '{' + rules + '}', index);
  } else if (sheet.addRule) {
    sheet.addRule(selector, rules, index);
  }
}

!(function init() {
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  const sheet = style.sheet || style.styleSheet;
  addCSSRule(sheet, '.no-pointer-events', 'pointer-events: none;');
  addCSSRule(
    sheet,
    '.control-disabled',
    'color:#888; text-decoration:line-through'
  );

  const container = document.createElement('div');
  container.id = 'container';
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(1, 2, -3);
  camera.lookAt(0, 1, 0);

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

  //

  const mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const loader = new GLTFLoader();
  loader.load('./soldier.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);

    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
      }
    });

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    createPanel();

    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    idleAction = mixer.clipAction(animations[0]);
    walkAction = mixer.clipAction(animations[3]);
    runAction = mixer.clipAction(animations[1]);

    actions = [idleAction, walkAction, runAction];

    activateAllActions();

    animate();
  });
  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);
  window.addEventListener('resize', onWindowResize, false);
})();

function createPanel() {
  const panel = new GUI({ width: 310 });

  const folder1 = panel.addFolder('Visibility');
  const folder2 = panel.addFolder('Activation/Deactivation');
  const folder3 = panel.addFolder('Pausing/Stepping');
  const folder4 = panel.addFolder('Crossfading');
  const folder5 = panel.addFolder('Blend Weights');
  const folder6 = panel.addFolder('General Speed');

  settings = {
    'show model': true,
    'show skeleton': false,
    'deactivate all': deactivateAllActions,
    'activate all': activateAllActions,
    'pause/continue': pauseContinue,
    'make single step': toSingleStepMode,
    'modify step size': 0.05,
    'from walk to idle'() {
      prepareCrossFade(walkAction, idleAction, 1.0);
    },
    'from idle to walk'() {
      prepareCrossFade(idleAction, walkAction, 0.5);
    },
    'from walk to run'() {
      prepareCrossFade(walkAction, runAction, 2.5);
    },
    'from run to walk'() {
      prepareCrossFade(runAction, walkAction, 5.0);
    },
    'use default duration': true,
    'set custom duration': 3.5,
    'modify idle weight': 0.0,
    'modify walk weight': 1.0,
    'modify run weight': 0.0,
    'modify time scale': 1.0,
  };

  folder1.add(settings, 'show model').onChange((v) => (model.visible = v));
  folder1
    .add(settings, 'show skeleton')
    .onChange((v) => (skeleton.visible = v));

  folder2.add(settings, 'deactivate all');
  folder2.add(settings, 'activate all');

  folder3.add(settings, 'pause/continue');
  folder3.add(settings, 'make single step');
  folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);

  crossFadeControls.push(folder4.add(settings, 'from walk to idle'));
  crossFadeControls.push(folder4.add(settings, 'from idle to walk'));
  crossFadeControls.push(folder4.add(settings, 'from walk to run'));
  crossFadeControls.push(folder4.add(settings, 'from run to walk'));
  folder4.add(settings, 'use default duration');
  folder4.add(settings, 'set custom duration', 0, 10, 0.01);

  folder5
    .add(settings, 'modify idle weight', 0.0, 1.0, 0.01)
    .listen()
    .onChange((weight) => setWeight(idleAction, weight));
  folder5
    .add(settings, 'modify walk weight', 0.0, 1.0, 0.01)
    .listen()
    .onChange((weight) => setWeight(walkAction, weight));
  folder5
    .add(settings, 'modify run weight', 0.0, 1.0, 0.01)
    .listen()
    .onChange((weight) => setWeight(runAction, weight));

  folder6
    .add(settings, 'modify time scale', 0.0, 1.5, 0.01)
    .onChange((speed) => (mixer.timeScale = speed));

  folder1.open();
  folder2.open();
  folder3.open();
  folder4.open();
  folder5.open();
  folder6.open();

  crossFadeControls.forEach((control) => {
    control.classList1 =
      control.domElement.parentElement.parentElement.classList;
    control.classList2 = control.domElement.previousElementSibling.classList;

    control.setDisabled = () => {
      control.classList1.add('no-pointer-events');
      control.classList2.add('control-disabled');
    };
    control.setEnabled = () => {
      control.classList1.remove('no-pointer-events');
      control.classList2.remove('control-disabled');
    };
  });
}

function prepareCrossFade(startAction, endAction, defaultDuration) {
  let duration = setCrossFadeDuration(defaultDuration);

  singleStepMode = false;
  unPauseAllActions();

  if (startAction === idleAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }
}

function executeCrossFade(startAction, endAction, duration) {
  setWeight(endAction, 1);
  endAction.time = 0;

  startAction.crossFadeTo(endAction, duration, true);
}

function synchronizeCrossFade(startAction, endAction, duration) {
  mixer.addEventListener('loop', onLoopFinished);
  function onLoopFinished(event) {
    if (event.action === startAction) {
      mixer.removeEventListener('loop', onLoopFinished);
      executeCrossFade(startAction, endAction, duration);
    }
  }
}

function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

function setCrossFadeDuration(defaultDuration) {
  if (settings['use default duration']) {
    return defaultDuration;
  } else {
    return settings['set custom duration'];
  }
}

function deactivateAllActions() {
  actions.forEach((action) => action.stop());
}

function activateAllActions() {
  setWeight(idleAction, settings['modify idle weight']);
  setWeight(walkAction, settings['modify walk weight']);
  setWeight(runAction, settings['modify run weight']);

  actions.forEach((action) => action.play());
}

function pauseContinue() {
  if (singleStepMode) {
    singleStepMode = false;
    unPauseAllActions();
  } else {
    if (idleAction.paused) {
      unPauseAllActions();
    } else {
      pauseAllActions();
    }
  }
}

function pauseAllActions() {
  actions.forEach((action) => (action.paused = true));
}

function unPauseAllActions() {
  actions.forEach((action) => (action.paused = false));
}

function toSingleStepMode() {
  unPauseAllActions();
  singleStepMode = true;
  sizeOfNextStep = settings['modify step size'];
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  idleWeight = idleAction.getEffectiveWeight();
  walkWeight = walkAction.getEffectiveWeight();
  runWeight = runAction.getEffectiveWeight();

  updateWeightSliders();

  updateCrossFadeControls();

  let mixerUpdateDelta = clock.getDelta();

  if (singleStepMode) {
    mixerUpdateDelta = sizeOfNextStep;
    sizeOfNextStep = 0;
  }

  mixer.update(mixerUpdateDelta);

  stats.update();
  renderer.render(scene, camera);
}

function updateWeightSliders() {
  settings['modify idle weight'] = idleWeight;
  settings['modify walk weight'] = walkWeight;
  settings['modify run weight'] = runWeight;
}

function updateCrossFadeControls() {
  crossFadeControls.forEach((control) => {
    control.setDisabled();
  });

  // console.log(idleWeight, walkWeight, runWeight);

  if (idleWeight === 1 && walkWeight === 0 && runWeight === 0) {
    crossFadeControls[1].setEnabled();
  }

  if (idleWeight === 0 && walkWeight === 1 && runWeight === 0) {
    crossFadeControls[0].setEnabled();
    crossFadeControls[2].setEnabled();
  }

  if (idleWeight === 0 && walkWeight === 0 && runWeight === 1) {
    crossFadeControls[3].setEnabled();
  }
}
