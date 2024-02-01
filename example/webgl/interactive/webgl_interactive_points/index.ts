import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  Points,
  Raycaster,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { Main } from '../../../main';

const vertexshader = `
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;

void main() {
  vColor = customColor;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentshader = `
uniform vec3 color;
uniform sampler2D pointTexture;

varying vec3 vColor;

void main() {
  gl_FragColor = vec4(color * vColor, 1.0);
  gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
  if(gl_FragColor.a < ALPHATEST) discard;
}
`;

const PARTICLE_SIZE = 20;

let particles: Points;
let raycaster: Raycaster, mouse: Vector2;

let INTERSECTED: number;

class Demo extends Main {
  initPlane() {
    const vertices = new BoxGeometry(200, 200, 200, 16, 16, 16).vertices;

    const positions = new Float32Array(vertices.length * 3);
    const colors = new Float32Array(vertices.length * 3);
    const sizes = new Float32Array(vertices.length);

    let vertex: Vector3;
    const color = new Color();

    for (let i = 0, l = vertices.length; i < l; i++) {
      vertex = vertices[i];
      vertex.toArray(positions, i * 3);

      color.setHSL(0.01 + 0.1 * (i / l), 1.0, 0.5);
      color.toArray(colors, i * 3);

      sizes[i] = PARTICLE_SIZE * 0.5;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    const material = new ShaderMaterial({
      uniforms: {
        color: {
          value: new Color(0xffffff),
        },
        pointTexture: {
          value: new TextureLoader().load('disc.png'),
        },
      },
      vertexShader: vertexshader,
      fragmentShader: fragmentshader,
      alphaTest: 0.9,
    });
    particles = new Points(geometry, material);
    this.scene.add(particles);

    raycaster = new Raycaster();
    mouse = new Vector2();

    document.addEventListener(
      'mousemove',
      (e) => {
        e.preventDefault();
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );
  }

  render() {
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;

    const geometry = particles.geometry as BufferGeometry;
    const attributes = geometry.attributes;

    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObject(particles);

    if (intersects.length > 0) {
      if (INTERSECTED !== intersects[0].index) {
        (attributes.size.array as Array<number>)[INTERSECTED] =
          PARTICLE_SIZE * 0.5;

        INTERSECTED = intersects[0].index;

        (attributes.size.array as Array<number>)[INTERSECTED] =
          PARTICLE_SIZE * 1.25;
        (attributes.size as BufferAttribute).needsUpdate = true;
      }
    } else if (null !== INTERSECTED) {
      (attributes.size.array as Array<number>)[INTERSECTED] =
        PARTICLE_SIZE * 0.5;
      (attributes.size as BufferAttribute).needsUpdate = true;
      INTERSECTED = null;
    }
  }
}

new Demo();
