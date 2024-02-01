/// <reference path="../m4.d.ts" />
/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';
import { geometryArr, normalsArr } from './data';
import { GUI } from 'dat.gui';

const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_worldViewProjection;
// uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;

varying vec3 v_normal;

void main() {
  gl_Position = u_worldViewProjection * a_position;

  // v_normal = mat3(u_world) * a_normal;
  // v_normal = mat3(u_worldInverseTranspose) * a_normal; // 方法一
  v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz; // mat3()*normal 的另一种方式
}
`;

const fs = `
precision mediump float;

varying vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

void main() {
  vec3 normal = normalize(v_normal);

  float light = dot(normal, u_reverseLightDirection);

  gl_FragColor = u_color;

  gl_FragColor.rgb *= light;
}
`;

(() => {
  const canvas = webglUtils.createCanvas();
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const program = webglUtils.createProgram2(gl, vs, fs);

  const a_position = webglUtils.getAttribLocation(gl, program, 'a_position');
  const a_normal = webglUtils.getAttribLocation(gl, program, 'a_normal');

  const u_worldViewProjection = webglUtils.getUniformLocation(
    gl,
    program,
    'u_worldViewProjection'
  );
  // const u_world = webglUtils.getUniformLocation(gl, program, 'u_world');
  const u_worldInverseTranspose = webglUtils.getUniformLocation(
    gl,
    program,
    'u_worldInverseTranspose'
  );
  const u_color = webglUtils.getUniformLocation(gl, program, 'u_color');
  const u_reverseLightDirection = webglUtils.getUniformLocation(
    gl,
    program,
    'u_reverseLightDirection'
  );

  let matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, -50, -75, -15);

  for (let i = 0; i < geometryArr.length; i += 3) {
    const vector = m4.transformPoint(matrix, [
      geometryArr[i + 0],
      geometryArr[i + 1],
      geometryArr[i + 2],
      1,
    ]);
    geometryArr[i + 0] = vector[0];
    geometryArr[i + 1] = vector[1];
    geometryArr[i + 2] = vector[2];
  }

  a_position.setFloat32(geometryArr, 3, false);
  a_normal.setFloat32(normalsArr, 3, false);

  const fieldOfViewRadians = m3.degToRad(60);
  let fRotationRadians = 0;

  drawScene();

  const gui = new GUI();
  const api = {
    r: 0,
  };
  gui
    .add(api, 'r', 0, 360)
    .name('fRotationRadians')
    .onChange((r) => {
      fRotationRadians = m3.degToRad(r);
      drawScene();
    });

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    a_position.bindBuffer();
    a_normal.bindBuffer();

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const projectionMatrix = m4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar
    );

    const camera = [100, 150, 200];
    const target = [0, 35, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(camera, target, up);

    const viewMatrix = m4.inverse(cameraMatrix);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    const worldMatrix = m4.yRotation(fRotationRadians);

    const worldViewProjectionMatrix = m4.multiply(
      viewProjectionMatrix,
      worldMatrix
    );

    //
    const worldInverseMatrix = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    u_worldViewProjection.uniformMatrix4fv(worldViewProjectionMatrix, false);
    // u_world.uniformMatrix4fv(worldMatrix, false);
    u_worldInverseTranspose.uniformMatrix4fv(
      worldInverseTransposeMatrix,
      false
    );

    u_color.uniform4fv([0.2, 1, 0.2, 1]); // green
    u_reverseLightDirection.uniform3fv(m4.normalize([0.5, 0.7, 1]));

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  }
})();
