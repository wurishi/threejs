import { GUI } from 'dat.gui';
import * as webglUtils from '../webgl-utils';

const vertex = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_flipY;

varying vec2 v_texCoord;

void main() {
  vec2 zeroToOne = a_position / u_resolution;

  vec2 zeroToTwo = zeroToOne * 2.0;

  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

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
  vec4 colorSum = 
      texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
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

(() => {
  const image = new Image();
  image.src = './img.jpg';
  image.onload = () => render(image);
})();

function render(image: HTMLImageElement) {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vertex, fragment);

  const positionLoc = gl.getAttribLocation(program, 'a_position');
  const texcoordLoc = gl.getAttribLocation(program, 'a_texCoord');

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  webglUtils.setRectangle(gl, gl.ARRAY_BUFFER, 0, 0, image.width, image.height);

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  webglUtils.setTexcoord(gl, gl.ARRAY_BUFFER);

  const originalImageTexture = webglUtils.createAndSetupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];

  for (let i = 0; i < 2; i++) {
    const texture = webglUtils.createAndSetupTexture(gl);
    textures.push(texture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      image.width,
      image.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    const fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
  }

  const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
  const textureSizeLoc = gl.getUniformLocation(program, 'u_textureSize');
  const kernelLoc = gl.getUniformLocation(program, 'u_kernel[0]');
  const kernelWeightLoc = gl.getUniformLocation(program, 'u_kernelWeight');
  const filpYLoc = gl.getUniformLocation(program, 'u_flipY');

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

  const api: any = {};
  const gui = new GUI();
  const effects = Object.keys(kernels);
  effects.forEach((key, i) => {
    api[key] = false;
    if (i > 0) {
      gui.add(api, key).onChange(() => {
        drawEffects();
      });
    }
  });
  drawEffects();

  function drawEffects() {
    webglUtils.resizeCanvasToDisplaySize(canvas);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(texcoordLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(textureSizeLoc, image.width, image.height);

    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    // 帧缓冲并不用显示, 所以不需要翻转
    gl.uniform1f(filpYLoc, 1);

    let count = 0;
    for (let i = 1; i < effects.length; i++) {
      const key = effects[i];
      if (api[key]) {
        setFramebuffer(framebuffers[count % 2], image.width, image.height);

        drawWithKernel(key);

        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);
        count++;
      }
    }

    // 最后需要绘制到画布上, 需要将y轴翻转一下
    gl.uniform1f(filpYLoc, -1);
    // 设置为null, 表示在画布上绘制, 而不是在帧缓冲上
    setFramebuffer(null, canvas.width, canvas.height);
    drawWithKernel('normal');
  }

  function setFramebuffer(
    fbo: WebGLFramebuffer,
    width: number,
    height: number
  ) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    // 帧缓冲对应的裁剪空间为图片大小
    // 要在画布上渲染时, 将裁剪空间设置为画布大小
    gl.uniform2f(resolutionLoc, width, height);
    gl.viewport(0, 0, width, height);
  }

  function drawWithKernel(name: string) {
    gl.uniform1fv(kernelLoc, kernels[name]);
    gl.uniform1f(kernelWeightLoc, computeKernelWeight(kernels[name]));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

function computeKernelWeight(kernel: number[]) {
  const weight = kernel.reduce((prev, curr) => prev + curr, 0);
  return weight <= 0 ? 1 : weight;
}
