import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui';
import * as Stats from 'stats.js';

const api: { [key: string]: any; state: string } = { state: 'Walking' };

class Main {
  private container: HTMLElement;

  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private clock: THREE.Clock;
  private renderer: THREE.Renderer;

  private model: THREE.Group;

  private stats: Stats;
  private gui: GUI;
  private mixer: THREE.AnimationMixer;
  private actions: { [key: string]: THREE.AnimationAction };
  private activeAction: THREE.AnimationAction;
  private previousAction: THREE.AnimationAction;

  constructor() {
    this.init();
    this.animate();
  }

  private init(): void {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      1000
    );
    this.camera.position.set(-5, 3, 10);
    this.camera.lookAt(0, 2, 0);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe0e0e0);
    this.scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    this.clock = new THREE.Clock();

    let light: THREE.Light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 20, 0);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 20, 10);
    this.scene.add(light);

    const mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);

    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    this.scene.add(grid);

    const loader = new GLTFLoader();
    loader.load('./robot.glb', (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);

      this.createGUI(this.model, gltf.animations);
    });

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);
  }

  private createGUI(
    model: THREE.Group,
    animations: THREE.AnimationClip[]
  ): void {
    const states = [
      'Idle',
      'Walking',
      'Running',
      'Dance',
      'Sitting',
      'Standing',
    ];
    const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
    this.gui = new GUI();
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};

    animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      this.actions[clip.name] = action;
      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    });

    const statesFolder = this.gui.addFolder('States');
    const clipCtrl = statesFolder.add(api, 'state').options(states);
    clipCtrl.onChange(() => this.fadeToAction(api.state, 0.5));
    statesFolder.open();

    const emoteFolder = this.gui.addFolder('Emotes');
    function createEmoteCallback(main: Main, name: string): void {
      api[name] = function () {
        main.fadeToAction(name, 0.2);
        main.mixer.addEventListener('finished', () => main.restoreState);
      };
      emoteFolder.add(api, name);
    }

    for (let i = 0; i < emotes.length; i++) {
      createEmoteCallback(this, emotes[i]);
    }
    emoteFolder.open();

    const face: any = this.model.getObjectByName('Head_2');
    const expressions = Object.keys(face.morphTargetDictionary);
    const expressionFolder = this.gui.addFolder('Expressions');

    for (let i = 0; i < expressions.length; i++) {
      expressionFolder
        .add(face.morphTargetInfluences, i + '', 0, 1, 0.01)
        .name(expressions[i]);
    }

    this.activeAction = this.actions['Walking'];
    this.activeAction.play();

    expressionFolder.open();
  }

  private restoreState = (): void => {
    this.mixer.removeEventListener('finished', this.restoreState);
    this.fadeToAction(api.state, 0.2);
  };

  private fadeToAction(name: string, duration: number): void {
    this.previousAction = this.activeAction;
    this.activeAction = this.actions[name];

    if (this.previousAction !== this.activeAction) {
      this.previousAction.fadeOut(duration);
    }
    this.activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();
  }

  private animate = (): void => {
    const dt = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(dt);
    }

    requestAnimationFrame(this.animate);

    this.renderer.render(this.scene, this.camera);

    this.stats.update();
  };
}

new Main();
