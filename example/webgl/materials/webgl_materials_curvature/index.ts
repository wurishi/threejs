import { Main } from "../../../main";

const vertexShaderRaw = `
attribute float curvature;
varying float vCurvature;

void main() {
  vec3 p = position;
  vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
  vCurvature = curvature;
}
`;

const fragmentShaderRaw = `
varying vec3 vViewPosition;
varying float vCurvature;

void main() {
  gl_FragColor = vec4(vCurvature * 2.0, 0.0, 0.0, 0.0);
}
`;

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { GUI } from "dat.gui";

function average(dict: any) {
  let sum = 0;
  let length = 0;
  Object.keys(dict).forEach((key) => {
    sum += dict[key];
    length++;
  });
  return sum / length;
}

function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(number, max));
}

function filterConcave(curvature: Float32Array) {
  for (let i = 0; i < curvature.length; i++) {
    curvature[i] = Math.abs(clamp(curvature[i], -1, 0));
  }
}

function filterConvex(curvature: Float32Array) {
  for (let i = 0; i < curvature.length; i++) {
    curvature[i] = clamp(curvature[i], 0, 1);
  }
}

function filterBoth(curvature: Float32Array) {
  for (let i = 0; i < curvature.length; i++) {
    curvature[i] = Math.abs(curvature[i]);
  }
}

class Demo extends Main {
  private bufferGeo: BufferGeometry;
  private curvatureAttribute: Float32Array;
  private ninjaMeshRaw: Mesh;

  initCamera() {
    super.initCamera(75, 0.1, 1000, new Vector3(-23, 2, 24));
  }

  initRenderer() {
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;
    this.container.appendChild(this.renderer.domElement);
  }

  initPlane() {
    const loader = new OBJLoader();
    loader.load("ninja.obj", (object) => {
      object.traverse((child) => {
        if (child instanceof Mesh) {
          this.bufferGeo = child.geometry;
          this.bufferGeo.center();
          const dict: any = {};

          for (
            let i = 0;
            i < this.bufferGeo.attributes.position.count;
            i += 3
          ) {
            const array = this.bufferGeo.attributes.position.array;
            const normArray = this.bufferGeo.attributes.normal.array;

            const posA = new Vector3(
              array[3 * i],
              array[3 * i + 1],
              array[3 * i + 2]
            );
            const posB = new Vector3(
              array[3 * (i + 1)],
              array[3 * (i + 1) + 1],
              array[3 * (i * 1) + 2]
            );
            const posC = new Vector3(
              array[3 * (i + 2)],
              array[3 * (i + 2) + 1],
              array[3 * (i + 2) + 2]
            );

            const normA = new Vector3(
              normArray[3 * i],
              normArray[3 * i + 1],
              normArray[3 * i + 2]
            ).normalize();
            const normB = new Vector3(
              normArray[3 * (i + 1)],
              normArray[3 * (i + 1) + 1],
              normArray[3 * (i + 1) + 2]
            ).normalize();
            const normC = new Vector3(
              normArray[3 * (i + 2)],
              normArray[3 * (i + 2) + 1],
              normArray[3 * (i + 2) + 2]
            ).normalize();

            const strA = posA.toArray().toString();
            const strB = posB.toArray().toString();
            const strC = posC.toArray().toString();

            const posB_A = new Vector3().subVectors(posB, posA);
            const posB_C = new Vector3().subVectors(posB, posC);
            const posC_A = new Vector3().subVectors(posC, posA);

            const b2a = normB.dot(posB_A.normalize());
            const b2c = normB.dot(posB_C.normalize());
            const c2a = normC.dot(posC_A.normalize());

            const a2b = -normA.dot(posB_A.normalize());
            const c2b = -normC.dot(posB_C.normalize());
            const a2c = -normA.dot(posC_A.normalize());

            if (dict[strA] === undefined) {
              dict[strA] = {};
            }
            if (dict[strB] === undefined) {
              dict[strB] = {};
            }
            if (dict[strC] === undefined) {
              dict[strC] = {};
            }
            dict[strA][strB] = a2b;
            dict[strA][strC] = a2c;
            dict[strB][strA] = b2a;
            dict[strB][strC] = b2c;
            dict[strC][strA] = c2a;
            dict[strC][strB] = c2b;
          }

          let curvatureDict: any = {};
          let min = 10,
            max = 0;
          Object.keys(dict).forEach(
            (key) => (curvatureDict[key] = average(dict[key]))
          );

          const smoothCurvatureDict = Object.create(curvatureDict);
          Object.keys(dict).forEach((key) => {
            let count = 0,
              sum = 0;
            Object.keys(dict[key]).forEach((key2) => {
              sum += smoothCurvatureDict[key2];
              count++;
            });
            smoothCurvatureDict[key] = sum / count;
          });
          curvatureDict = smoothCurvatureDict;

          Object.keys(curvatureDict).forEach((key) => {
            const val = Math.abs(curvatureDict[key]);
            if (val < min) min = val;
            if (val > max) max = val;
          });

          const range = max - min;
          Object.keys(curvatureDict).forEach((key) => {
            const val = Math.abs(curvatureDict[key]);
            if (curvatureDict[key] < 0) {
              curvatureDict[key] = (min - val) / range;
            } else {
              curvatureDict[key] = (val - min) / range;
            }
          });

          this.curvatureAttribute = new Float32Array(
            this.bufferGeo.attributes.position.count
          );

          for (let i = 0; i < this.bufferGeo.attributes.position.count; i++) {
            const array = this.bufferGeo.attributes.position.array;
            const pos = new Vector3(
              array[3 * i],
              array[3 * i + 1],
              array[3 * i + 2]
            );
            const str = pos.toArray().toString();
            this.curvatureAttribute[i] = curvatureDict[str];
          }
          this.bufferGeo.setAttribute(
            "curvature",
            new BufferAttribute(this.curvatureAttribute, 1)
          );
          const curvatureFiltered = new Float32Array(this.curvatureAttribute);
          filterBoth(curvatureFiltered);

          const materialRaw = new ShaderMaterial({
            vertexShader: vertexShaderRaw,
            fragmentShader: fragmentShaderRaw,
          });
          this.ninjaMeshRaw = new Mesh(this.bufferGeo, materialRaw);
        }
      });
      this.scene.add(this.ninjaMeshRaw);
      this.initUI();
    });
  }

  initUI() {
    const that = this;
    const params = {
      filterConvex: () => {
        const curvatureFiltered = new Float32Array(this.curvatureAttribute);
        filterConvex(curvatureFiltered);
        (this.bufferGeo.attributes.curvature as BufferAttribute).array =
          curvatureFiltered;
        (this.bufferGeo.attributes.curvature as BufferAttribute).needsUpdate =
          true;
      },
      filterConcave() {
        const curvatureFiltered = new Float32Array(that.curvatureAttribute);
        filterConcave(curvatureFiltered);
        (that.bufferGeo.attributes.curvature as BufferAttribute).array =
          curvatureFiltered;
        (that.bufferGeo.attributes.curvature as BufferAttribute).needsUpdate =
          true;
      },
      filterBoth() {
        const curvatureFiltered = new Float32Array(that.curvatureAttribute);
        filterBoth(curvatureFiltered);
        (that.bufferGeo.attributes.curvature as BufferAttribute).array =
          curvatureFiltered;
        (that.bufferGeo.attributes.curvature as BufferAttribute).needsUpdate =
          true;
      },
    };
    const gui = new GUI();
    const topologyFolder = gui.addFolder("Topology");
    topologyFolder.add(params, "filterConvex");
    topologyFolder.add(params, "filterConcave");
    topologyFolder.add(params, "filterBoth");
    topologyFolder.open();
  }
}

new Demo();
