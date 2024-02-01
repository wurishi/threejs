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

const vertex = `
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;

void main() {
  // 缩放
  vec2 scaledPosition = a_position * u_scale;

  vec2 rotatedPosition = vec2(
    scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
    scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
  );

  vec2 position = rotatedPosition + u_translation;
  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fragment = `
precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;

(function main() {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vertex, fragment);

  const a_position = webglUtils.getAttribLocation(gl, program, 'a_position');

  const u_resolution = webglUtils.getUniformLocation(
    gl,
    program,
    'u_resolution'
  );
  const u_color = webglUtils.getUniformLocation(gl, program, 'u_color');
  const u_translation = webglUtils.getUniformLocation(
    gl,
    program,
    'u_translation'
  );
  const u_rotation = webglUtils.getUniformLocation(gl, program, 'u_rotation');
  const u_scale = webglUtils.getUniformLocation(gl, program, 'u_scale');

  a_position.setFloat32(new Float32Array(geometry));

  const translation = [100, 150];
  const rotation = [0, 1];
  const scale = [1, 1];
  const color = [Math.random(), Math.random(), Math.random(), 1];

  const gui = new GUI();
  const api = {
    x: translation[0],
    y: translation[1],
    angle: 0,
    sx: scale[0],
    sy: scale[1],
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
    const angleInRadians = (angle * Math.PI) / 180;
    rotation[0] = Math.sin(angleInRadians);
    rotation[1] = Math.cos(angleInRadians);
    drawScene();
  });
  gui.add(api, 'sx', -3, 3).onChange((x) => {
    scale[0] = x;
    drawScene();
  });
  gui.add(api, 'sy', -3, 3).onChange((y) => {
    scale[1] = y;
    drawScene();
  });

  drawScene();

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    a_position.bindBuffer();

    u_resolution.uniform2f(canvas.width, canvas.height);
    u_color.uniform4fv(color);
    u_translation.uniform2fv(translation);
    u_rotation.uniform2fv(rotation);
    u_scale.uniform2fv(scale);

    gl.drawArrays(gl.TRIANGLES, 0, 18);
  }
})();
