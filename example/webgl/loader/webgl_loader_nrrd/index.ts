import { Main } from '../../../main';

import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
import { VTKLoader } from 'three/examples/jsm/loaders/VTKLoader';
import {
  AxesHelper,
  BoxGeometry,
  BoxHelper,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initCamera() {
    super.initCamera(60, 0.01, 1e10, new Vector3(0, 0, 300));

    this.scene.add(this.camera);
  }

  initScene() {
    super.initScene(0, 0, 0, false);
  }

  initPlane() {
    const loader = new NRRDLoader();
    loader.load('I.nrrd', (volume) => {
      const geometry = new BoxGeometry(
        volume.xLength,
        volume.yLength,
        volume.zLength
      );
      const material = new MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new Mesh(geometry, material);
      cube.visible = false;

      const box = new BoxHelper(cube);
      this.scene.add(box);
      box.applyMatrix4.call(box, volume.matrix);
      this.scene.add(cube);

      // z plane
      const sliceZ = volume.extractSlice(
        'z',
        Math.floor((volume as any).RASDimensions[2] / 4)
      );
      this.scene.add(sliceZ.mesh);

      // y
      const sliceY = volume.extractSlice(
        'y',
        Math.floor((volume as any).RASDimensions[1] / 2)
      );
      this.scene.add(sliceY.mesh);
      // x
      const sliceX = volume.extractSlice(
        'x',
        Math.floor((volume as any).RASDimensions[0] / 2)
      );
      this.scene.add(sliceX.mesh);

      const _volume: {
        RASDimensions: any[];
        min: number;
        max: number;
      } = volume as any;

      gui
        .add(sliceX, 'index', 0, _volume.RASDimensions[0], 1)
        .name('indexX')
        .onChange(() => {
          sliceX.repaint.call(sliceX);
        });

      gui
        .add(sliceY, 'index', 0, _volume.RASDimensions[1], 1)
        .name('indexY')
        .onChange(() => {
          sliceY.repaint.call(sliceY);
        });

      gui
        .add(sliceZ, 'index', 0, _volume.RASDimensions[2], 1)
        .name('indexZ')
        .onChange(() => {
          sliceZ.repaint.call(sliceZ);
        });

      gui
        .add(volume, 'lowerThreshold', _volume.min, _volume.max, 1)
        .name('Lower Threshold')
        .onChange(() => {
          volume.repaintAllSlices();
        });

      gui
        .add(volume, 'upperThreshold', _volume.min, _volume.max, 1)
        .name('Upper Threshold')
        .onChange(() => {
          volume.repaintAllSlices();
        });

      gui
        .add(volume, 'windowLow', _volume.min, _volume.max, 1)
        .name('Window Low')
        .onChange(() => {
          volume.repaintAllSlices();
        });

      gui
        .add(volume, 'windowHigh', _volume.min, _volume.max, 1)
        .name('Window High')
        .onChange(() => {
          volume.repaintAllSlices();
        });
    });

    const vtkmaterial = new MeshLambertMaterial({
      wireframe: false,
      morphTargets: false,
      side: DoubleSide,
      color: 0xff0000,
    });
    const vtkloader = new VTKLoader();
    vtkloader.load('liver.vtk', (geometry) => {
      geometry.computeVertexNormals();

      const mesh = new Mesh(geometry, vtkmaterial);
      this.scene.add(mesh);
      const visibilityControl = {
        visible: true,
      };
      gui
        .add(visibilityControl, 'visible')
        .name('Model Visible')
        .onChange((val) => {
          mesh.visible = val;
        });
    });

    this.setupInset();
  }

  setupInset() {
    const insetWidth = 150,
      insetHeight = 150;
    const container = document.createElement('div');
    container.style.width = insetWidth + 'px';
    container.style.height = insetHeight + 'px';
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    document.body.appendChild(container);

    renderer2 = new WebGLRenderer({ alpha: true });
    renderer2.setClearColor(0x000000, 0);
    renderer2.setSize(insetWidth, insetHeight);
    container.appendChild(renderer2.domElement);

    scene2 = new Scene();

    camera2 = new PerspectiveCamera(50, insetWidth / insetHeight, 1, 1000);
    camera2.up = this.camera.up;

    axes2 = new AxesHelper(100);
    scene2.add(axes2);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (camera2) {
      camera2.position.copy(this.camera.position);
      // camera2.position.sub()
      camera2.position.setLength(300);
      camera2.lookAt(scene2.position);
    }

    this.renderer.render(this.scene, this.camera);
    renderer2 && renderer2.render(scene2, camera2);

    this.stats.update();
  }
}

let gui = new GUI();

let renderer2: WebGLRenderer;
let scene2: Scene;
let camera2: PerspectiveCamera;
let axes2: AxesHelper;

new Demo();
