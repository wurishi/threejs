/// <reference path="../m4.d.ts" />
/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';
import { GUI } from 'dat.gui';
import * as utils from '../utils';

// 18
const geometry = [
  // left column
  0,
  0,
  0,
  30,
  0,
  0,
  0,
  150,
  0,
  0,
  150,
  0,
  30,
  0,
  0,
  30,
  150,
  0,

  // top rung
  30,
  0,
  0,
  100,
  0,
  0,
  30,
  30,
  0,
  30,
  30,
  0,
  100,
  0,
  0,
  100,
  30,
  0,

  // middle rung
  30,
  60,
  0,
  67,
  60,
  0,
  30,
  90,
  0,
  30,
  90,
  0,
  67,
  60,
  0,
  67,
  90,
  0,
];

// 16*6
const geometry2 = [
  // left column front
  0,
  0,
  0,
  30,
  0,
  0,
  0,
  150,
  0,
  0,
  150,
  0,
  30,
  0,
  0,
  30,
  150,
  0,

  // top rung front
  30,
  0,
  0,
  100,
  0,
  0,
  30,
  30,
  0,
  30,
  30,
  0,
  100,
  0,
  0,
  100,
  30,
  0,

  // middle rung front
  30,
  60,
  0,
  67,
  60,
  0,
  30,
  90,
  0,
  30,
  90,
  0,
  67,
  60,
  0,
  67,
  90,
  0,

  // left column back
  0,
  0,
  30,
  30,
  0,
  30,
  0,
  150,
  30,
  0,
  150,
  30,
  30,
  0,
  30,
  30,
  150,
  30,

  // top rung back
  30,
  0,
  30,
  100,
  0,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  100,
  0,
  30,
  100,
  30,
  30,

  // middle rung back
  30,
  60,
  30,
  67,
  60,
  30,
  30,
  90,
  30,
  30,
  90,
  30,
  67,
  60,
  30,
  67,
  90,
  30,

  // top
  0,
  0,
  0,
  100,
  0,
  0,
  100,
  0,
  30,
  0,
  0,
  0,
  100,
  0,
  30,
  0,
  0,
  30,

  // top rung right
  100,
  0,
  0,
  100,
  30,
  0,
  100,
  30,
  30,
  100,
  0,
  0,
  100,
  30,
  30,
  100,
  0,
  30,

  // under top rung
  30,
  30,
  0,
  30,
  30,
  30,
  100,
  30,
  30,
  30,
  30,
  0,
  100,
  30,
  30,
  100,
  30,
  0,

  // between top rung and middle
  30,
  30,
  0,
  30,
  30,
  30,
  30,
  60,
  30,
  30,
  30,
  0,
  30,
  60,
  30,
  30,
  60,
  0,

  // top of middle rung
  30,
  60,
  0,
  30,
  60,
  30,
  67,
  60,
  30,
  30,
  60,
  0,
  67,
  60,
  30,
  67,
  60,
  0,

  // right of middle rung
  67,
  60,
  0,
  67,
  60,
  30,
  67,
  90,
  30,
  67,
  60,
  0,
  67,
  90,
  30,
  67,
  90,
  0,

  // bottom of middle rung.
  30,
  90,
  0,
  30,
  90,
  30,
  67,
  90,
  30,
  30,
  90,
  0,
  67,
  90,
  30,
  67,
  90,
  0,

  // right of bottom
  30,
  90,
  0,
  30,
  90,
  30,
  30,
  150,
  30,
  30,
  90,
  0,
  30,
  150,
  30,
  30,
  150,
  0,

  // bottom
  0,
  150,
  0,
  0,
  150,
  30,
  30,
  150,
  30,
  0,
  150,
  0,
  30,
  150,
  30,
  30,
  150,
  0,

  // left side
  0,
  0,
  0,
  0,
  0,
  30,
  0,
  150,
  30,
  0,
  0,
  0,
  0,
  150,
  30,
  0,
  150,
  0,
];

const colorsArr = [
  // left column front
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,

  // top rung front
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,

  // middle rung front
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,
  200,
  70,
  120,

  // left column back
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,

  // top rung back
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,

  // middle rung back
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,
  80,
  70,
  200,

  // top
  70,
  200,
  210,
  70,
  200,
  210,
  70,
  200,
  210,
  70,
  200,
  210,
  70,
  200,
  210,
  70,
  200,
  210,

  // top rung right
  200,
  200,
  70,
  200,
  200,
  70,
  200,
  200,
  70,
  200,
  200,
  70,
  200,
  200,
  70,
  200,
  200,
  70,

  // under top rung
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,

  // between top rung and middle
  210,
  160,
  70,
  210,
  160,
  70,
  210,
  160,
  70,
  210,
  160,
  70,
  210,
  160,
  70,
  210,
  160,
  70,

  // top of middle rung
  70,
  180,
  210,
  70,
  180,
  210,
  70,
  180,
  210,
  70,
  180,
  210,
  70,
  180,
  210,
  70,
  180,
  210,

  // right of middle rung
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,
  100,
  70,
  210,

  // bottom of middle rung.
  76,
  210,
  100,
  76,
  210,
  100,
  76,
  210,
  100,
  76,
  210,
  100,
  76,
  210,
  100,
  76,
  210,
  100,

  // right of bottom
  140,
  210,
  80,
  140,
  210,
  80,
  140,
  210,
  80,
  140,
  210,
  80,
  140,
  210,
  80,
  140,
  210,
  80,

  // bottom
  90,
  130,
  110,
  90,
  130,
  110,
  90,
  130,
  110,
  90,
  130,
  110,
  90,
  130,
  110,
  90,
  130,
  110,

  // left side
  160,
  160,
  220,
  160,
  160,
  220,
  160,
  160,
  220,
  160,
  160,
  220,
  160,
  160,
  220,
  160,
  160,
  220,
];

const vs = `
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;

varying vec4 v_color;

void main() {
  gl_Position = u_matrix * a_position;

  v_color = a_color;
}
`;

const fs = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

(() => {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vs, fs);

  const a_position = webglUtils.getAttribLocation(gl, program, 'a_position');
  const a_color = webglUtils.getAttribLocation(gl, program, 'a_color');

  // const u_color = webglUtils.getUniformLocation(gl, program, 'u_color');
  const u_matrix = webglUtils.getUniformLocation(gl, program, 'u_matrix');

  a_position.setFloat32(new Float32Array(geometry2), 3);
  a_color.setUInt8(new Uint8Array(colorsArr), 3, true);

  const translation = [45, 150, 0];
  const rotation = [m3.degToRad(40), m3.degToRad(25), m3.degToRad(325)];
  const scale = [1, 1, 1];
  // const color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  const gui = new GUI();
  const api = {
    x: translation[0],
    y: translation[1],
    z: translation[2],
    rx: 40,
    ry: 25,
    rz: 325,
    sx: scale[0],
    sy: scale[1],
    sz: scale[2],
  };

  const folder1 = gui.addFolder('移动');
  const folder2 = gui.addFolder('旋转');
  const folder3 = gui.addFolder('缩放');
  ['x', 'y', 'z'].forEach((k, i) => {
    folder1.add(api, k, 0, 400).onChange((x) => {
      translation[i] = x;
      drawScene();
    });

    folder2.add(api, 'r' + k, 0, 360).onChange((r) => {
      rotation[i] = (r * Math.PI) / 180;
      drawScene();
    });

    folder3.add(api, 's' + k, -5, 5).onChange((s) => {
      scale[i] = s;
      drawScene();
    });
  });

  folder1.open();
  folder2.open();
  folder3.open();

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 清除深度缓冲
    gl.enable(gl.CULL_FACE); // 剔除背面三角形
    gl.enable(gl.DEPTH_TEST); // 开启深度缓冲
    gl.useProgram(program);

    a_position.bindBuffer();
    a_color.bindBuffer();

    // u_color.uniform4fv(color);

    let matrix = utils.projection(canvas.clientWidth, canvas.clientHeight, 400);
    matrix = m4.translate(
      matrix,
      translation[0],
      translation[1],
      translation[2]
    );
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    u_matrix.uniformMatrix4fv(matrix, false);

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  }
})();
