/// <reference path="../m4.d.ts" />
/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';
import { GUI } from 'dat.gui';

const geometry = new Float32Array([
  // left column front
  0,
  0,
  0,
  0,
  150,
  0,
  30,
  0,
  0,
  0,
  150,
  0,
  30,
  150,
  0,
  30,
  0,
  0,

  // top rung front
  30,
  0,
  0,
  30,
  30,
  0,
  100,
  0,
  0,
  30,
  30,
  0,
  100,
  30,
  0,
  100,
  0,
  0,

  // middle rung front
  30,
  60,
  0,
  30,
  90,
  0,
  67,
  60,
  0,
  30,
  90,
  0,
  67,
  90,
  0,
  67,
  60,
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
  60,
  30,
  30,
  30,
  30,
  30,
  30,
  0,
  30,
  60,
  0,
  30,
  60,
  30,

  // top of middle rung
  30,
  60,
  0,
  67,
  60,
  30,
  30,
  60,
  30,
  30,
  60,
  0,
  67,
  60,
  0,
  67,
  60,
  30,

  // right of middle rung
  67,
  60,
  0,
  67,
  90,
  30,
  67,
  60,
  30,
  67,
  60,
  0,
  67,
  90,
  0,
  67,
  90,
  30,

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
  150,
  30,
  30,
  90,
  30,
  30,
  90,
  0,
  30,
  150,
  0,
  30,
  150,
  30,

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
]);

const colorArr = new Uint8Array([
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
]);

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

  const u_matrix = webglUtils.getUniformLocation(gl, program, 'u_matrix');

  a_position.setFloat32(geometry, 3, false);
  a_color.setUInt8(colorArr, 3, true);

  let cameraAngleRadians = m3.degToRad(0);
  const fieldOfViewRadians = m3.degToRad(60);

  drawScene();

  const gui = new GUI();
  gui.add({ cameraAngle: 0 }, 'cameraAngle', 0, 360).onChange((a) => {
    cameraAngleRadians = m3.degToRad(a);
    drawScene();
  });

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    a_position.bindBuffer();
    a_color.bindBuffer();

    const numFs = 5;
    const radius = 200;

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const projectionMatrix = m4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar
    );

    let cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

    const viewMatrix = m4.inverse(cameraMatrix);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    for (let i = 0; i < numFs; i++) {
      const angle = (i * Math.PI * 2) / numFs;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const matrix = m4.translate(viewProjectionMatrix, x, 0, y);

      u_matrix.uniformMatrix4fv(matrix, false);

      gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
    }
  }
})();
