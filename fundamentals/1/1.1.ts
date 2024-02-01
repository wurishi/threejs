import * as THREE from 'three';

export function main() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas });

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

  // const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  renderer.render(scene, camera);

  function render(time: number) {
    time *= 0.001; // 时间单位从毫秒变为秒

    cube.rotation.x = time;
    cube.rotation.y = time; // 旋转角度是弧度制的, 一圈的弧度为2∏, 所以立方体每个方向旋转一周的时间为6.28秒左右.

    renderer.render(scene, camera);

    requestAnimationFrame(render); // 调用另一个帧动画继续循环.
  }
  requestAnimationFrame(render); // 开始渲染循环.
}
