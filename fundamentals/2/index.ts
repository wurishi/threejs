import * as THREE from 'three';
import { Geometry, Mesh } from 'three';

const head = document.head || document.getElementsByTagName('head')[0];
const style = document.createElement('style');
head.appendChild(style);

function addCSSRule(selector: string, rules: string, index = 0) {
  if (style.sheet.insertRule) {
    style.sheet.insertRule(selector + '{' + rules + '}', index);
  } else if (style.sheet.addRule) {
    style.sheet.addRule(selector, rules, index);
  }
}

addCSSRule('html', 'margin:0; height:100%;');
addCSSRule('body', 'margin:0; height:100%;');
addCSSRule('canvas', 'width:100%; height:100%; display:block;');

function main() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setPixelRatio(window.devicePixelRatio);

  // const renderer = new THREE.WebGLRenderer();
  // document.body.appendChild(renderer.domElement);

  const fov = 75;
  const aspect = 2; // 相机默认值
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry: Geometry, color: number, x: number): Mesh {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new Mesh(geometry, material);
    cube.position.x = x;

    scene.add(cube);
    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
  ];

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  renderer.render(scene, camera);

  function render(time: number) {
    time *= 0.001; // 时间单位从毫秒变为秒

    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render); // 调用另一个帧动画继续循环.
  }
  requestAnimationFrame(render); // 开始渲染循环.
}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

main();
