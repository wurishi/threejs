import * as WebGLUtils from '../webgl-utils';

const vertex = `
// 一个属性值, 将会从缓冲中获取数据
attribute vec4 a_position;

// 所有着色器都有一个 main 方法
void main() {
  // gl_Position 是一个顶点着色器主要设置的变量
  gl_Position = a_position;
}
`;

const fragment = `
// 片断着色器没有默认精度, 需要设置一个精度
// mediump 代表 "medium precision" 中等精度
precision mediump float;

void main() {
  // gl_FragColor 是一个片断着色器主要设置的变量
  gl_FragColor = vec4(1, 0, 0.5, 1); // 红紫色
}
`;

const canvas = WebGLUtils.createCanvas();
const gl = canvas.getContext('webgl');
if (!gl) {
  // 不能使用 WebGL!
} else {
  // 编译顶点着色器
  const vertexShader = WebGLUtils.compileShader(gl, vertex, gl.VERTEX_SHADER);
  // 编译片断着色器
  const fragmentShader = WebGLUtils.compileShader(
    gl,
    fragment,
    gl.FRAGMENT_SHADER
  );
  // 将两个着色器链接到着色程序
  const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);

  // 获取着色程序属性值 a_position
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  // 创建缓冲
  const positionBuffer = gl.createBuffer();

  // 绑定缓冲
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 向缓冲中存放数据
  // 三个二维点坐标
  const positions = [
    0,
    0, //
    0,
    0.5, //
    0.7,
    0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // 以下为渲染代码, 按需求可能需要多次重复调用

  // 调整 canvas 的尺寸以匹配它的显示尺寸
  WebGLUtils.resizeCanvasToDisplaySize(canvas, true);

  // 裁剪空间坐标对应到画布像素坐标
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 清空画布
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 使用着色器程序
  gl.useProgram(program);

  // 启用对应的属性
  gl.enableVertexAttribArray(positionAttributeLocation);

  // 然后指定从缓冲中读取数据的方式
  // 将绑定点绑定到缓冲数据
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 告诉属性怎么从 positionBuffer 中读取数据 (ARRAY_BUFFER)
  const size = 2; // 每次迭代运行提取两个单位数据
  const type = gl.FLOAT; // 每个单位数据类型是 32位浮点型
  const normalize = false; // 不需要归一化数据
  const stride = 0; // 0 = 移动单位数量 * 每个单位占用内存 (sizeof(type)), 即每次迭代运行运行多少内存到下一个数据开始点
  let offset = 0; // 从缓冲起始位置开始读取
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // 运行 GLSL 着色程序
  const primitiveType = gl.TRIANGLES;
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}
