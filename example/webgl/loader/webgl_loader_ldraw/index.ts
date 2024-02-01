// LDraw.org

import { Main } from '../../../main';

import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader';
import {
  Box3,
  CubeReflectionMapping,
  CubeTextureLoader,
  LineSegments,
  Object3D,
  Texture,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';

const modelFileList = {
  Car: 'models/car.ldr_Packed.mpd',
  'Lunar Vehicle': 'models/1621-1-LunarMPVVehicle.mpd_Packed.mpd',
  'Radar Truck': 'models/889-1-RadarTruck.mpd_Packed.mpd',
  Trailer: 'models/4838-1-MiniVehicles.mpd_Packed.mpd',
  Bulldozer: 'models/4915-1-MiniConstruction.mpd_Packed.mpd',
  Helicopter: 'models/4918-1-MiniFlyers.mpd_Packed.mpd',
  Plane: 'models/5935-1-IslandHopper.mpd_Packed.mpd',
  Lighthouse: 'models/30023-1-Lighthouse.ldr_Packed.mpd',
  'X-Wing mini': 'models/30051-1-X-wingFighter-Mini.mpd_Packed.mpd',
  'AT-ST mini': 'models/30054-1-AT-ST-Mini.mpd_Packed.mpd',
  'AT-AT mini': 'models/4489-1-AT-AT-Mini.mpd_Packed.mpd',
  Shuttle: 'models/4494-1-Imperial-Shuttle-Mini.mpd_Packed.mpd',
  'TIE Interceptor': 'models/6965-1-TIEIntercep_4h4MXk5.mpd_Packed.mpd',
  'Star fighter': 'models/6966-1-JediStarfighter-Mini.mpd_Packed.mpd',
  'X-Wing': 'models/7140-1-X-wingFighter.mpd_Packed.mpd',
  'AT-ST': 'models/10174-1-ImperialAT-ST-UCS.mpd_Packed.mpd',
};

const guiData = {
  modelFileName: modelFileList['Car'],
  envMapActivated: false,
  separateObjects: false,
  displayLines: true,
  conditionalLines: true,
  smoothNormals: true,
  constructionStep: 0,
  noConstructionSteps: 'No steps.',
};

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 10000, new Vector3(150, 200, 250));
  }

  initScene() {
    super.initScene(0xdeebed, 0, 0, false);
  }

  initControls() {
    controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  initPlane() {
    progressBarDiv = document.createElement('div');
    progressBarDiv.innerText = 'Loading...';
    progressBarDiv.style.fontSize = '3em';
    progressBarDiv.style.color = '#888';
    progressBarDiv.style.display = 'block';
    progressBarDiv.style.position = 'absolute';
    progressBarDiv.style.top = '50%';
    progressBarDiv.style.width = '100%';
    progressBarDiv.style.textAlign = 'center';

    this.reloadObject(true);
  }

  reloadObject(resetCamera: boolean) {
    if (model) {
      this.scene.remove(model);
    }
    model = null;

    updateProgressBar(0);
    showProgressBar();

    const lDrawLoader = new LDrawLoader();
    (lDrawLoader as any).separateObjects = guiData.separateObjects;
    (lDrawLoader as any).smoothNormals = guiData.smoothNormals;
    lDrawLoader.load(
      guiData.modelFileName,
      (group2) => {
        if (model) {
          this.scene.remove(model);
        }
        model = group2;

        model.rotation.x = Math.PI;

        this.scene.add(model);

        const materials: any[] = (lDrawLoader as any).materials;

        if (envMapActivated) {
          if (!textureCube) {
            textureCube = new CubeTextureLoader().load([
              'posx.jpg',
              'negx.jpg',
              'posy.jpg',
              'negy.jpg',
              'posz.jpg',
              'negz.jpg',
            ]);
            textureCube.mapping = CubeReflectionMapping;

            this.scene.background = textureCube;
            this.scene.environment = textureCube;

            materials.forEach((material) => {
              if (material.userData.canHaveEnvMap) {
                material.envMap = textureCube;
              }
            });
          }
        } else {
          this.scene.background = null;
          this.scene.environment = null;
        }

        guiData.constructionStep = model.userData.numConstructionSteps - 1;

        updateObjectsVisibility();

        const bbox = new Box3().setFromObject(model);
        const size = bbox.getSize(new Vector3());
        const radius = Math.max(size.x, Math.max(size.y, size.z)) * 0.5;

        if (resetCamera) {
          controls.target.copy(bbox.getCenter(new Vector3()));
          // controls.set
          controls.reset();
        }

        this.createGUI();

        hideProgressBar();
      },
      (xhr) => {
        console.log(xhr);
        if (xhr.lengthComputable) {
          updateProgressBar(xhr.loaded / xhr.total);
        }
      },
      () => {
        progressBarDiv.innerText = 'Error Loading Model';
      }
    );
  }

  createGUI() {
    if (gui) {
      gui.destroy();
    }
    gui = new GUI();

    gui
      .add(guiData, 'modelFileName', modelFileList)
      .name('Model')
      .onFinishChange(() => {
        this.reloadObject(true);
      });

    gui
      .add(guiData, 'separateObjects')
      .name('Separate Objects')
      .onChange(() => {
        this.reloadObject(false);
      });

    if (guiData.separateObjects) {
      if (model.userData.numConstructionSteps > 1) {
        gui
          .add(
            guiData,
            'constructionStep',
            0,
            model.userData.numConstructionSteps - 1
          )
          .step(1)
          .name('Construction step')
          .onChange(() => updateObjectsVisibility());
      } else {
        gui
          .add(guiData, 'noConstructionSteps')
          .name('Construction step')
          .onChange(() => updateObjectsVisibility());
      }
    }

    gui
      .add(guiData, 'envMapActivated')
      .name('Env. map')
      .onChange((val) => {
        envMapActivated = val;
        this.reloadObject(false);
      });

    gui
      .add(guiData, 'smoothNormals')
      .name('Smooth Normals')
      .onChange(() => this.reloadObject(false));

    gui
      .add(guiData, 'displayLines')
      .name('Display Lines')
      .onChange(updateObjectsVisibility);

    gui
      .add(guiData, 'conditionalLines')
      .name('Conditional Lines')
      .onChange(updateObjectsVisibility);
  }
}

function updateObjectsVisibility() {
  model.traverse((c) => {
    if (c.type === 'LineSegments') {
      const line = c as any;
      if (line.isConditionalLine) {
        c.visible = guiData.conditionalLines;
      } else {
        c.visible = guiData.displayLines;
      }
    } else if (c.type === 'Group') {
      c.visible = c.userData.constructionStep <= guiData.constructionStep;
    }
  });
}

function updateProgressBar(fraction: number) {
  progressBarDiv &&
    (progressBarDiv.innerText =
      'Loading... ' + Math.round(fraction * 100).toFixed(2) + '%');
}

function showProgressBar() {
  document.body.appendChild(progressBarDiv);
}

function hideProgressBar() {
  document.body.removeChild(progressBarDiv);
}

let progressBarDiv: HTMLElement;
let model: Object3D;

let envMapActivated = false;
let textureCube: Texture;

let controls: OrbitControls;

let gui: GUI;

new Demo();
