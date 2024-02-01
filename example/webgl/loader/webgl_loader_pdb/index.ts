import { Main, StyleRule } from '../../../main';

import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader';

import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {
  BoxGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Vector3,
} from 'three';
import { GUI } from 'dat.gui';

const style = new StyleRule();
style.addCSSRule(
  '.label',
  `
text-shadow: -1px 1px 1px rgb(0,0,0);
margin-left: 25px;
font-size: 20px;
`
);

const MOLECULES: any = {
  Ethanol: 'ethanol.pdb',
  Aspirin: 'aspirin.pdb',
  Caffeine: 'caffeine.pdb',
  Nicotine: 'nicotine.pdb',
  LSD: 'lsd.pdb',
  Cocaine: 'cocaine.pdb',
  Cholesterol: 'cholesterol.pdb',
  Lycopene: 'lycopene.pdb',
  Glucose: 'glucose.pdb',
  'Aluminium oxide': 'Al2O3.pdb',
  Cubane: 'cubane.pdb',
  Copper: 'cu.pdb',
  Fluorite: 'caf2.pdb',
  Salt: 'nacl.pdb',
  'YBCO superconductor': 'ybco.pdb',
  Buckyball: 'buckyball.pdb',
  Graphite: 'graphite.pdb',
};

const loader = new PDBLoader();
const offset = new Vector3();

class Demo extends Main {
  initScene() {
    super.initScene(0x050505, 0, 0, false);
  }
  initCamera() {
    super.initCamera(70, 1, 5000, new Vector3(0, 0, 1000));
  }

  initPlane() {
    this.scene.add(this.camera);

    root = new Group();
    this.scene.add(root);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    document.body.appendChild(labelRenderer.domElement);

    this.loadMolecule(MOLECULES.Ethanol);
    this.createMenu();
  }

  loadMolecule(url: string) {
    for (let i = root.children.length - 1; i >= 0; i--) {
      const object = root.children[i];
      object.parent.remove(object);
    }

    loader.load(url, (pdb) => {
      const geometryAtoms = pdb.geometryAtoms;
      const geometryBonds = pdb.geometryBonds;
      const json = pdb.json;

      const boxGeometry = new BoxGeometry(1, 1, 1);
      const sphereGeometry = new IcosahedronGeometry(1, 3);

      geometryAtoms.computeBoundingBox();
      geometryAtoms.boundingBox.getCenter(offset).negate();

      geometryAtoms.translate(offset.x, offset.y, offset.z);
      geometryBonds.translate(offset.x, offset.y, offset.z);

      let positions = geometryAtoms.getAttribute('position');
      const colors = geometryAtoms.getAttribute('color');

      const position = new Vector3();
      const color = new Color();

      for (let i = 0; i < positions.count; i++) {
        position.set(positions.getX(i), positions.getY(i), positions.getZ(i));

        color.setRGB(colors.getX(i), colors.getY(i), colors.getZ(i));

        const material = new MeshPhongMaterial({ color });

        const object = new Mesh(sphereGeometry, material);
        object.position.copy(position);
        object.position.multiplyScalar(75);
        object.scale.multiplyScalar(25);
        root.add(object);

        const atom = json.atoms[i];

        const text = document.createElement('div');
        text.className = 'label';
        text.style.color =
          'rgb(' + atom[3][0] + ',' + atom[3][1] + ',' + atom[3][2] + ')';
        text.textContent = atom[4];

        const label = new CSS2DObject(text);
        label.position.copy(object.position);
        root.add(label);
      }

      positions = geometryBonds.getAttribute('position');

      const start = new Vector3();
      const end = new Vector3();

      for (let i = 0; i < positions.count; i += 2) {
        start.set(positions.getX(i), positions.getY(i), positions.getZ(i));

        end.set(
          positions.getX(i + 1),
          positions.getY(i + 1),
          positions.getZ(i + 1)
        );

        start.multiplyScalar(75);
        end.multiplyScalar(75);

        const object = new Mesh(
          boxGeometry,
          new MeshPhongMaterial({ color: 0xffffff })
        );
        object.position.copy(start);
        object.position.lerp(end, 0.5);
        object.scale.set(5, 5, start.distanceTo(end));
        object.lookAt(end);
        root.add(object);
      }
    });
  }

  createMenu() {
    const gui = new GUI();
    const api = {
      module: 'Ethanol',
    };
    gui.add(api, 'module', Object.keys(MOLECULES)).onChange((v) => {
      this.loadMolecule(MOLECULES[v]);
    });
  }

  render() {
    labelRenderer.render(this.scene, this.camera);

    const time = Date.now() * 0.0004;
    root.rotation.x = time;
    root.rotation.y = time * 0.7;
  }

  onWindowResize() {
    super.onWindowResize();

    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }
}

let labelRenderer: CSS2DRenderer;
let root: Group;

new Demo();
