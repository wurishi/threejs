/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';
import { GUI } from 'dat.gui';

const geometry = [
  // left column
  0,
  0,
  30,
  0,
  0,
  150,
  0,
  150,
  30,
  0,
  30,
  150,

  // top rung
  30,
  0,
  100,
  0,
  30,
  30,
  30,
  30,
  100,
  0,
  100,
  30,

  // middle rung
  30,
  60,
  67,
  60,
  30,
  90,
  30,
  90,
  67,
  60,
  67,
  90,
];

const vs = `
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_matrix;

void main() {
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fs = `
precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;

(() => {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vs, fs);

  const a_position = webglUtils.getAttribLocation(gl, program, 'a_position');

  const u_resolution = webglUtils.getUniformLocation(
    gl,
    program,
    'u_resolution'
  );
  const u_color = webglUtils.getUniformLocation(gl, program, 'u_color');
  const u_matrix = webglUtils.getUniformLocation(gl, program, 'u_matrix');

  a_position.setFloat32(new Float32Array(geometry));

  const translation = [60, 40];
  let angleInRadians = 0;
  const scale = [0.85, 0.85];
  const color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  const gui = new GUI();
  const api = {
    tx: translation[0],
    ty: translation[1],
    angle: angleInRadians,
    sx: scale[0],
    sy: scale[1],
  };

  gui.add(api, 'tx', 0, canvas.width).onChange((tx) => {
    translation[0] = tx;
    drawScene();
  });
  gui.add(api, 'ty', 0, canvas.height).onChange((ty) => {
    translation[1] = ty;
    drawScene();
  });
  gui.add(api, 'angle', 0, 360).onChange((angle) => {
    angleInRadians = (angle * Math.PI) / 180;
    drawScene();
  });
  gui.add(api, 'sx', -3, 3).onChange((sx) => {
    scale[0] = sx;
    drawScene();
  });
  gui.add(api, 'sy', -3, 3).onChange((sy) => {
    scale[1] = sy;
    drawScene();
  });

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    a_position.bindBuffer();

    u_resolution.uniform2f(canvas.width, canvas.height);
    u_color.uniform4fv(color);

    const translationMatrix = m3.translation(translation[0], translation[1]);
    const rotationMatrix = m3.rotation(angleInRadians);
    const scaleMatrix = m3.scaling(scale[0], scale[1]);

    let matrix = m3.identity();

    for (let i = 0; i < 5; i++) {
      matrix = m3.multiply(matrix, translationMatrix);
      matrix = m3.multiply(matrix, rotationMatrix);
      matrix = m3.multiply(matrix, scaleMatrix);

      // matrix = m3.multiply(matrix, m3.translation(-50, -75));

      u_matrix.uniformMatrix3fv(matrix, false);

      gl.drawArrays(gl.TRIANGLES, 0, 18);
    }
  }
})();
