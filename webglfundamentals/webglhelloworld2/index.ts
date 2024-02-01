import * as WebGLUtils from '../webgl-utils';

const vertex = `
attribute vec2 a_position;
uniform vec2 u_resolution;

void main() {
  vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
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

const canvas = WebGLUtils.createCanvas();

const gl = canvas.getContext('webgl');

if (gl) {
  const program = WebGLUtils.createProgram2(gl, vertex, fragment);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    'u_resolution'
  );
  const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  WebGLUtils.resizeCanvasToDisplaySize(canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  for (let i = 0; i < 50; i++) {
    setRectangle(
      gl,
      gl.ARRAY_BUFFER,
      randomInt(300),
      randomInt(300),
      randomInt(300),
      randomInt(300)
    );

    //
    gl.uniform4f(
      colorUniformLocation,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

function randomInt(range: number) {
  return Math.floor(Math.random() * range);
}

function setRectangle(
  gl: WebGLRenderingContext,
  target: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const x1 = x,
    x2 = x + width;
  const y1 = y,
    y2 = y + height;
  gl.bufferData(
    target,
    new Float32Array([
      x1,
      y1, //
      x2,
      y1,
      x1,
      y2,
      x1,
      y2,
      x2,
      y1,
      x2,
      y2,
    ]),
    gl.STATIC_DRAW
  );
}
