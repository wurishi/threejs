import { Main } from '../../../main';
import * as THREE from 'three';
import { Lut } from 'three/examples/jsm/math/Lut';
import { OrthographicCamera, PerspectiveCamera } from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Demo extends Main {
  uiScene: THREE.Scene;
  lut: Lut;

  initScene() {
    super.initScene(0xffffff, 0, 0, false);

    this.uiScene = new THREE.Scene();
    this.lut = new Lut();
  }

  perpCamera: PerspectiveCamera;
  orthoCamera: OrthographicCamera;

  initCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.perpCamera = new THREE.PerspectiveCamera(60, width / height, 1, 100);
    this.perpCamera.position.set(0, 0, 10);
    this.scene.add(this.perpCamera);

    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2);
    this.orthoCamera.position.set(0.5, 0, 1);
  }

  mesh: THREE.Mesh;
  sprite: THREE.Sprite;

  initPlane() {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(this.lut.createCanvas()),
      })
    );
    sprite.scale.x = 0.125;
    this.uiScene.add(sprite);
    this.sprite = sprite;

    const mesh = new THREE.Mesh(
      undefined,
      new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0xf5f5f5,
        vertexColors: true,
      })
    );
    this.mesh = mesh;
    this.scene.add(mesh);

    this.initGUI();
    this.loadModel();
  }

  initHemiLight() {}
  initDirLight() {
    const pointLight = new THREE.PointLight(0xffffff, 1);
    this.perpCamera.add(pointLight);
  }

  params: any;

  initGUI() {
    const gui = new GUI();
    this.params = {
      colorMap: 'rainbow',
    };
    gui
      .add(this.params, 'colorMap', [
        'rainbow',
        'cooltowarm',
        'blackbody',
        'grayscale',
      ])
      .onChange(() => {
        this.updateColors();
        this.render();
      });
  }

  initRenderer() {
    super.initRenderer(true);
    this.renderer.autoClear = false;
  }

  loadModel() {
    const loader = new THREE.BufferGeometryLoader();
    loader.load('pressure.json', (geometry) => {
      geometry.center();
      geometry.computeVertexNormals();

      const colors = [];
      for (let i = 0, n = geometry.attributes.position.count; i < n; i++) {
        colors.push(1, 1, 1);
      }

      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );

      this.mesh.geometry = geometry;
      this.updateColors();
      this.render();
    });
  }

  updateColors() {
    this.lut.setColorMap(this.params.colorMap);

    console.log(this.params);

    this.lut.setMax(2000);
    this.lut.setMin(0);

    const geometry = this.mesh.geometry as THREE.BufferGeometry;
    const pressures = geometry.attributes.pressure;
    const colors = geometry.attributes.color;

    for (let i = 0; i < pressures.array.length; i++) {
      const colorValue = pressures.array[i];
      const color = this.lut.getColor(colorValue);

      if (color === undefined) {
      } else {
        colors.setXYZ(i, color.r, color.g, color.b);
      }
    }

    (colors as THREE.BufferAttribute).needsUpdate = true;

    const map = this.sprite.material.map;
    this.lut.updateCanvas(map.image);
    map.needsUpdate = true;
  }

  initControls() {
    const controls = new OrbitControls(
      this.perpCamera,
      this.renderer.domElement
    );
    controls.addEventListener('change', () => this.render());
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.render();
    this.stats.update();
  }

  render() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.perpCamera);
    this.renderer.render(this.uiScene, this.orthoCamera);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.perpCamera.aspect = width / height;
    this.perpCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.render();
  }
}

new Demo();
