import { GUI } from 'dat.gui';
import * as webglUtils from '../webgl-utils';

const vertex = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
  vec2 zeroToOne = a_position / u_resolution;

  vec2 zeroToTwo = zeroToOne * 2.0;

  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = a_texCoord;
}
`;

const fragment = `
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[9];
uniform float u_kernelWeight;

varying vec2 v_texCoord;

void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

  vec4 colorSum = texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
  texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
  texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
  texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
  texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
  texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
  texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
  texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
  texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;

  gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}
`;

function main() {
  const image = new Image();
  image.src = './img.jpg';
  image.onload = () => {
    render(image);
    const img = document.createElement('img');
    img.src = './img.jpg';
    img.style.position = 'fixed';
    img.style.right = '0';
    img.style.top = '100px';
    document.body.appendChild(img);
  };
}

function render(image: HTMLImageElement) {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  const program = webglUtils.createProgram2(gl, vertex, fragment);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoord(gl);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  setTexture(gl, image);

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');
  const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
  const kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight');

  const kernels: any = {
    normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    gaussianBlur: [
      0.045,
      0.122,
      0.045,
      0.122,
      0.332,
      0.122,
      0.045,
      0.122,
      0.045,
    ],
    gaussianBlur2: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    gaussianBlur3: [0, 1, 0, 1, 1, 1, 0, 1, 0],
    unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
    sharpness: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    sharpen: [-1, -1, -1, -1, 16, -1, -1, -1, -1],
    edgeDetect: [
      -0.125,
      -0.125,
      -0.125,
      -0.125,
      1,
      -0.125,
      -0.125,
      -0.125,
      -0.125,
    ],
    edgeDetect2: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    edgeDetect3: [-5, 0, 0, 0, 0, 0, 0, 0, 5],
    edgeDetect4: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    edgeDetect5: [-1, -1, -1, 2, 2, 2, -1, -1, -1],
    edgeDetect6: [-5, -5, -5, -5, 39, -5, -5, -5, -5],
    sobelHorizontal: [1, 2, 1, 0, 0, 0, -1, -2, -1],
    sobelVertical: [1, 0, -1, 2, 0, -2, 1, 0, -1],
    previtHorizontal: [1, 1, 1, 0, 0, 0, -1, -1, -1],
    previtVertical: [1, 0, -1, 1, 0, -1, 1, 0, -1],
    boxBlur: [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
    triangleBlur: [
      0.0625,
      0.125,
      0.0625,
      0.125,
      0.25,
      0.125,
      0.0625,
      0.125,
      0.0625,
    ],
    emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
  };
  const api = {
    mode: 'edgeDetect2',
  };
  const gui = new GUI();
  gui.add(api, 'mode', Object.keys(kernels)).onChange((mode) => {
    drawWithKernel(mode);
  });
  drawWithKernel(api.mode);

  function drawWithKernel(name: string) {
    webglUtils.resizeCanvasToDisplaySize(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    gl.uniform1fv(kernelLocation, kernels[name]);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

function computeKernelWeight(kernel: number[]) {
  const weight = kernel.reduce((prev, curr) => prev + curr, 0);
  return weight <= 0 ? 1 : weight;
}

function setRectangle(
  gl: WebGLRenderingContext,
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
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

function setTexcoord(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0,
      1.0,
    ]),
    gl.STATIC_DRAW
  );
}

function setTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

main();
