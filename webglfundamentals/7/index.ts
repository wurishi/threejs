import { GUI } from 'dat.gui';
import * as webglUtils from '../webgl-utils';

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

void main() {
  vec2 position = a_position + u_translation;
  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fragment = `
precision mediump float;

uniform vec4 u_color;
uniform float u_time;

void main() {
  gl_FragColor = u_color * u_time;
}
`;

function main() {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vertex, fragment);
  gl.useProgram(program);

  const a_position = webglUtils.getAttribLocation(gl, program, 'a_position');
  a_position.setFloat32(new Float32Array(geometry));

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
  const u_time = webglUtils.getUniformLocation(gl, program, 'u_time');
  u_time.uniform1f(1.0);

  const translation = [0, 0];
  const color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  const api = {
    x: 0,
    y: 0,
  };

  const gui = new GUI();
  gui.add(api, 'x').onChange((x) => {
    translation[0] = x;
  });
  gui.add(api, 'y').onChange((y) => {
    translation[1] = y;
  });

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    a_position.bindBuffer();

    u_resolution.uniform2f(canvas.width, canvas.height);
    u_color.uniform4fv(color);
    u_translation.uniform2fv(translation);

    gl.drawArrays(gl.TRIANGLES, 0, 18);
  }

  let _t = 0;
  let flag = true;
  function time() {
    flag ? _t++ : _t--;
    u_time.uniform1f(_t / 100);
    if (_t > 100) {
      flag = false;
    } else if (_t < 10) {
      flag = true;
    }
    drawScene();
    requestAnimationFrame(time);
  }
  time();
}

main();
