/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';
import { GUI } from 'dat.gui';

const vertex = `
attribute vec2 a_position;
attribute vec4 a_color;

uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  v_color = a_color;
}
`;

const fragment = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

const canvas = webglUtils.createCanvas();
const gl = canvas.getContext('webgl');

// if (gl) {
const program = webglUtils.createProgram2(gl, vertex, fragment);

const positionLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getAttribLocation(program, 'a_color');

const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

setGeometry(gl);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

setColors(gl);

const translation = [200, 150];
let angleInRadians = 0;
const scale = [1, 1];

drawScene();

const api = {
  x: translation[0],
  y: translation[1],
  angle: angleInRadians,
  sx: scale[0],
  sy: scale[1],
};

const gui = new GUI();
gui.add(api, 'x', 0, canvas.width).onChange((x) => {
  translation[0] = x;
  drawScene();
});
gui.add(api, 'y', 0, canvas.height).onChange((y) => {
  translation[1] = y;
  drawScene();
});
gui.add(api, 'angle', 0, 360).onChange((a) => {
  angleInRadians = (a * Math.PI) / 180;
  drawScene();
});
gui.add(api, 'sx', -5, 5).onChange((x) => {
  scale[0] = x;
  drawScene();
});
gui.add(api, 'sy', -5, 5).onChange((y) => {
  scale[1] = y;
  drawScene();
});
// }

function drawScene() {
  webglUtils.resizeCanvasToDisplaySize(canvas);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clear(gl.COLOR_BUFFER_BIT);

  //

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

  let matrix = m3.projection(canvas.clientWidth, canvas.clientHeight);
  matrix = m3.translate(matrix, translation[0], translation[1]);
  matrix = m3.rotate(matrix, angleInRadians);
  matrix = m3.scale(matrix, scale[0], scale[1]);

  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function setGeometry(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -150,
      -100,
      150,
      -100,
      -150,
      100,
      150,
      -100,
      -150,
      100,
      150,
      100,
    ]),
    gl.STATIC_DRAW
  );
}

function setColors(gl: WebGLRenderingContext) {
  const [r1, b1, g1, r2, b2, g2] = [0, 0, 0, 0, 0, 0].map((v) => Math.random());

  gl.bufferData(
    gl.ARRAY_BUFFER,
    // new Float32Array([
    //   r1,b1,g1,1,
    //   r1,b1,g1,1,
    //   r1,b1,g1,1,
    //   r2,b2,g2,1,
    //   r2,b2,g2,1,
    //   r2,b2,g2,1
    // ]),
    new Float32Array([
      Math.random(),
      Math.random(),
      Math.random(),
      1,
      Math.random(),
      Math.random(),
      Math.random(),
      1,
      Math.random(),
      Math.random(),
      Math.random(),
      1,
      Math.random(),
      Math.random(),
      Math.random(),
      1,
      Math.random(),
      Math.random(),
      Math.random(),
      1,
      Math.random(),
      Math.random(),
      Math.random(),
      1,
    ]),
    gl.STATIC_DRAW
  );
}
