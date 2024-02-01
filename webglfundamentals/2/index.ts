/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';
import { GUI } from 'dat.gui';

const vertex = `
attribute vec2 a_position;
uniform mat3 u_matrix;
varying vec4 v_color;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  v_color = gl_Position * 0.5 + 0.5;
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

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

setGeometry(gl);

const translation = [200, 150];
let angleInRadians = 0;
const scale = [1, 1];

drawScene();

const gui = new GUI();
const api = {
  x: translation[0],
  y: translation[1],
  angle: angleInRadians,
  scaleX: scale[0],
  scaleY: scale[1],
};
gui.add(api, 'x', 0, canvas.width).onChange((x) => {
  translation[0] = x;
  drawScene();
});
gui.add(api, 'y', 0, canvas.height).onChange((y) => {
  translation[1] = y;
  drawScene();
});
gui.add(api, 'angle', 0, 360).onChange((angle) => {
  angleInRadians = (angle * Math.PI) / 180;
  drawScene();
});
gui.add(api, 'scaleX', -5, 5, 0.01).onChange((x) => {
  scale[0] = x;
  drawScene();
});
gui.add(api, 'scaleY', -5, 5, 0.01).onChange((y) => {
  scale[1] = y;
  drawScene();
});

function drawScene() {
  webglUtils.resizeCanvasToDisplaySize(canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  let matrix = m3.projection(canvas.clientWidth, canvas.clientHeight);
  matrix = m3.translate(matrix, translation[0], translation[1]);
  matrix = m3.rotate(matrix, angleInRadians);
  matrix = m3.scale(matrix, scale[0], scale[1]);

  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
// }

function setGeometry(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, -100, 150, 125, -175, 100]),
    gl.STATIC_DRAW
  );
}
