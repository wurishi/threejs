import { Main } from '../main';

import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';
import {
  ToonShader1,
  ToonShader2,
  ToonShaderDotted,
  ToonShaderHatching,
} from 'three/examples/jsm/shaders/ToonShader';
import {
  AmbientLight,
  Clock,
  Color,
  CubeRefractionMapping,
  CubeTextureLoader,
  DirectionalLight,
  Material,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PointLight,
  RepeatWrapping,
  ShaderMaterial,
  TextureLoader,
  UniformsUtils,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

class Demo extends Main {
  initCamera() {
    super.initCamera(45, 1, 10000, new Vector3(-500, 500, 1500));
  }

  initScene() {
    super.initScene(0x050505, 0, 0, false);
  }

  initPlane() {
    light = new DirectionalLight(0xffffff);
    light.position.set(0.5, 0.5, 1);
    this.scene.add(light);

    ambientLight = new AmbientLight(0x080808);
    this.scene.add(ambientLight);

    pointLight = new PointLight(0xff3300);
    pointLight.position.set(0, 0, 100);
    this.scene.add(pointLight);

    materials = generateMaterials();
    current_material = 'shiny';

    resolution = 28;

    effect = new MarchingCubes(
      resolution,
      materials[current_material].m,
      true,
      true
    );
    effect.position.set(0, 0, 0);
    effect.scale.setScalar(700);
    effect.enableUvs = false;
    effect.enableColors = false;

    this.scene.add(effect);
    this.initGUI();
  }

  initGUI() {
    const createHandler = (id: string) => () => {
      const mat_old = materials[current_material];
      mat_old.h = m_h.getValue();
      mat_old.s = m_s.getValue();
      mat_old.l = m_l.getValue();

      current_material = id;

      const mat = materials[id];
      effect.material = mat.m;

      m_h.setValue(mat.h);
      m_s.setValue(mat.s);
      m_l.setValue(mat.l);

      effect.enableUvs = current_material === 'textured' ? true : false;
      effect.enableColors =
        current_material === 'colors' || current_material === 'multiColors'
          ? true
          : false;
    };

    const gui = new GUI();

    // material
    let h = gui.addFolder('Materials');

    for (const m in materials) {
      effectController[m] = createHandler(m);
      h.add(effectController, m);
    }
    h.open();

    // material color
    h = gui.addFolder('Material Color');

    const m_h = h.add(effectController, 'hue', 0, 1, 0.025);
    const m_s = h.add(effectController, 'saturation', 0, 1, 0.025);
    const m_l = h.add(effectController, 'lightness', 0, 1, 0.025);
    h.open();

    // light point
    h = gui.addFolder('Point light color');
    h.add(effectController, 'lhue', 0, 1, 0.025).name('hue');
    h.add(effectController, 'lsaturation', 0, 1, 0.025).name('saturation');
    h.add(effectController, 'llightness', 0, 1, 0.025).name('lightness');
    h.open();

    // light dir
    h = gui.addFolder('Directional light orientation');
    h.add(effectController, 'lx', -1, 1, 0.025).name('x');
    h.add(effectController, 'ly', -1, 1, 0.025).name('y');
    h.add(effectController, 'lz', -1, 1, 0.025).name('z');
    h.open();

    // simulation
    h = gui.addFolder('Simulation');
    h.add(effectController, 'speed', 0.1, 8.0, 0.05);
    h.add(effectController, 'numBlobs', 1, 50, 1);
    h.add(effectController, 'resolution', 14, 100, 1);
    h.add(effectController, 'isolation', 10, 300, 1);

    h.add(effectController, 'floor');
    h.add(effectController, 'wallx');
    h.add(effectController, 'wallz');
  }

  render() {
    const delta = clock.getDelta();

    time += delta * effectController.speed * 0.5;

    if (effectController.resolution !== resolution) {
      resolution = effectController.resolution;
      (effect as any).init(Math.floor(resolution));
    }

    if (effectController.isolation !== effect.isolation) {
      effect.isolation = effectController.isolation;
    }

    updateCubes(
      effect,
      time,
      effectController.numBlobs,
      effectController.floor,
      effectController.wallx,
      effectController.wallz
    );

    if (effect.material instanceof ShaderMaterial) {
      effect.material.uniforms['uBaseColor'].value.setHSL(
        effectController.hue,
        effectController.saturation,
        effectController.lightness
      );
    } else {
      (effect.material as any).color.setHSL(
        effectController.hue,
        effectController.saturation,
        effectController.lightness
      );
    }

    // lights
    light.position.set(
      effectController.lx,
      effectController.ly,
      effectController.lz
    );
    light.position.normalize();

    pointLight.color.setHSL(
      effectController.lhue,
      effectController.lsaturation,
      effectController.llightness
    );
  }
}

function updateCubes(
  object: MarchingCubes,
  time: number,
  numblobs: number,
  floor: boolean,
  wallx: boolean,
  wallz: boolean
) {
  object.reset();

  const rainbow = [
    new Color(0xff0000),
    new Color(0xff7f00),
    new Color(0xffff00),
    new Color(0x00ff00),
    new Color(0x0000ff),
    new Color(0x4b0082),
    new Color(0x9400d3),
  ];
  const subtract = 12;
  const strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1);

  for (let i = 0; i < numblobs; i++) {
    const ballx =
      Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 +
      0.5;
    const bally =
      Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77; // dip into the floor
    const ballz =
      Math.cos(i + 1.32 * time * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5;

    if (current_material === 'multiColors') {
      object.addBall(ballx, bally, ballz, strength, subtract, rainbow[i % 7]);
    } else {
      object.addBall(ballx, bally, ballz, strength, subtract, null);
    }
  }

  floor && object.addPlaneY(2, 12);
  wallz && object.addPlaneZ(2, 12);
  wallx && object.addPlaneX(2, 12);
}

const effectController: any = {
  material: 'shiny',

  speed: 1,
  numBlobs: 10,
  resolution: 28,
  isolation: 80,

  floor: true,
  wallx: false,
  wallz: false,

  hue: 0,
  saturation: 0,
  lightness: 0.1,

  lhue: 0.04,
  lsaturation: 1,
  llightness: 0.5,

  lx: 0.5,
  ly: 0.5,
  lz: 1.0,

  dummy: () => {},
};

let light: DirectionalLight;
let ambientLight: AmbientLight;
let pointLight: PointLight;
let materials: {
  [key: string]: {
    m: Material;
    h: number;
    s: number;
    l: number;
  };
};
let current_material = '';
let resolution = 0;
let effect: MarchingCubes;
const clock = new Clock();
let time = 0;

function generateMaterials() {
  const urls = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'];
  const cubeTextureLoader = new CubeTextureLoader();

  const reflectionCube = cubeTextureLoader.load(urls);
  const refractionCube = cubeTextureLoader.load(urls);
  refractionCube.mapping = CubeRefractionMapping;

  const toonMaterial1 = createShaderMaterial(ToonShader1, light, ambientLight);
  const toonMaterial2 = createShaderMaterial(ToonShader2, light, ambientLight);
  const hatchingMaterial = createShaderMaterial(
    ToonShaderHatching,
    light,
    ambientLight
  );
  const dottedMaterial = createShaderMaterial(
    ToonShaderDotted,
    light,
    ambientLight
  );

  const texture = new TextureLoader().load('uv_grid_opengl.jpg');
  texture.wrapS = texture.wrapT = RepeatWrapping;

  const materials: {
    [key: string]: {
      m: Material;
      h: number;
      s: number;
      l: number;
    };
  } = {
    chrome: {
      m: new MeshLambertMaterial({ color: 0xffffff, envMap: reflectionCube }),
      h: 0,
      s: 0,
      l: 1,
    },
    liquid: {
      m: new MeshLambertMaterial({
        color: 0xffffff,
        envMap: refractionCube,
        refractionRatio: 0.85,
      }),
      h: 0,
      s: 0,
      l: 1,
    },

    shiny: {
      m: new MeshStandardMaterial({
        color: 0x550000,
        envMap: reflectionCube,
        roughness: 0.1,
        metalness: 1.0,
      }),
      h: 0,
      s: 0.8,
      l: 0.2,
    },

    matte: {
      m: new MeshPhongMaterial({
        color: 0x000000,
        specular: 0x111111,
        shininess: 1,
      }),
      h: 0,
      s: 0,
      l: 1,
    },

    flat: {
      m: new MeshLambertMaterial({ color: 0x000000, flatShading: true }),
      h: 0,
      s: 0,
      l: 1,
    },

    textured: {
      m: new MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x111111,
        shininess: 1,
        map: texture,
      }),
      h: 0,
      s: 0,
      l: 1,
    },

    colors: {
      m: new MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 2,
        vertexColors: true,
      }),
      h: 0,
      s: 0,
      l: 1,
    },

    multiColors: {
      m: new MeshPhongMaterial({ shininess: 2, vertexColors: true }),
      h: 0,
      s: 0,
      l: 1,
    },

    plastic: {
      m: new MeshPhongMaterial({
        color: 0x000000,
        specular: 0x888888,
        shininess: 250,
      }),
      h: 0.6,
      s: 0.8,
      l: 0.1,
    },

    toon1: {
      m: toonMaterial1,
      h: 0.2,
      s: 1,
      l: 0.75,
    },

    toon2: {
      m: toonMaterial2,
      h: 0.4,
      s: 1,
      l: 0.75,
    },

    hatching: {
      m: hatchingMaterial,
      h: 0.2,
      s: 1,
      l: 0.9,
    },

    dotted: {
      m: dottedMaterial,
      h: 0.2,
      s: 1,
      l: 0.9,
    },
  };
  return materials;
}

function createShaderMaterial(
  shader: { uniforms: any; vertexShader: string; fragmentShader: string },
  light: DirectionalLight,
  ambientLight: AmbientLight
): ShaderMaterial {
  const u = UniformsUtils.clone(shader.uniforms);
  const vs = shader.vertexShader;
  const fs = shader.fragmentShader;
  const material = new ShaderMaterial({
    uniforms: u,
    vertexShader: vs,
    fragmentShader: fs,
  });
  material.uniforms['uDirLightPos'].value = light.position;
  material.uniforms['uDirLightColor'].value = light.color;

  material.uniforms['uAmbientLightColor'].value = ambientLight.color;

  return material;
}

new Demo();
