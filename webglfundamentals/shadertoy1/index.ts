import * as webglUtils from '../webgl-utils';

const vs = `
attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

const fs = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  // gl_FragColor = vec4(1, 0, 0.5, 1);
  // gl_FragColor = vec4(fract(gl_FragCoord.xy / 50.0), 0, 1);
  // gl_FragColor = vec4(fract(gl_FragCoord.xy / u_resolution), 0, 1);
  // gl_FragColor = vec4(fract((gl_FragCoord.xy - u_mouse) / u_resolution), 0, 1);
  gl_FragColor = vec4(fract((gl_FragCoord.xy - u_mouse) / u_resolution), fract(u_time), 1);
}
`;

function main() {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vs, fs);

  const a_position = webglUtils.getAttribLocation(gl, program, 'a_position');
  a_position.setFloat32(
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
  );
  const u_resolution = webglUtils.getUniformLocation(
    gl,
    program,
    'u_resolution'
  );
  const u_mouse = webglUtils.getUniformLocation(gl, program, 'u_mouse');
  const u_time = webglUtils.getUniformLocation(gl, program, 'u_time');

  let mouseX = 0;
  let mouseY = 0;

  function render(time: number) {
    time *= 0.001; // 毫秒转换为秒
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(program);

    a_position.bindBuffer();

    u_resolution.uniform2f(canvas.width, canvas.height);
    u_mouse.uniform2f(mouseX, mouseY);
    u_time.uniform1f(time);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  canvas.addEventListener('mousemove', setMousePosition);

  function setMousePosition(e: any) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = rect.height - (e.clientY - rect.top) - 1; // 在 WebGL 中, 底部为0
    // render();
  }

  canvas.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
      setMousePosition(e.touches[0]);
    },
    { passive: false }
  );
}

main();
