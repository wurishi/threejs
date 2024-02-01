import { GUI } from 'dat.gui';
import * as webglUtils from '../webgl-utils';

const vertex = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
  // 像素坐标转换为 0.0 -> 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // 0->1 转换为 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // 0->2 转换为 -1 -> + 1 的裁剪坐标
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // 将纹理坐标传给片断着色器
  v_texCoord = a_texCoord;
}
`;

const fragment = `
precision mediump float;

// 纹理
uniform sampler2D u_image;

// 从顶点着色器传入的纹理坐标
varying vec2 v_texCoord;

uniform bool u_flag;

void main() {
  // 在纹理上寻找对应颜色
  if(u_flag) {
    gl_FragColor = texture2D(u_image, v_texCoord);
  } else {
    gl_FragColor = texture2D(u_image, v_texCoord).brga;
  }
}
`;

function main() {
  const image = new Image();
  image.src = './img.jpg';
  image.onload = () => {
    render(image);
  };
}

main();

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

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const flagLocation = gl.getUniformLocation(program, 'u_flag');

  const api = {
    flag: false,
  };
  const gui = new GUI();
  gui.add(api, 'flag').onChange(() => {
    fn(api.flag);
  });

  const fn = (flag: boolean) => {
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

    gl.uniform1i(flagLocation, flag ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  fn(api.flag);
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
