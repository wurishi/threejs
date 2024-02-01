/// <reference path="../m4.d.ts" />
/// <reference path="../m3.d.ts" />
import * as webglUtils from '../webgl-utils';

import { getGeometry, normalsArr } from '../data';
import { GUI } from 'dat.gui';

const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
  gl_Position = u_worldViewProjection * a_position;

  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`;

const fs = `
precision mediump float;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightDirection;
uniform float u_innerLimit;
uniform float u_outerLimit;

void main() {
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float dotFromDirection = dot(surfaceToLightDirection, -u_lightDirection);
  float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);
  float light = inLight * dot(normal, surfaceToLightDirection);
  float specular = inLight * pow(dot(normal, halfVector), u_shininess);

  gl_FragColor = u_color;

  gl_FragColor.rgb *= light;

  gl_FragColor.rgb += specular;
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
  const u_worldInverseTranspose = webglUtils.getUniformLocation(
    gl,
    program,
    'u_worldInverseTranspose'
  );
  const u_color = webglUtils.getUniformLocation(gl, program, 'u_color');
  const u_shininess = webglUtils.getUniformLocation(gl, program, 'u_shininess');
  const u_lightDirection = webglUtils.getUniformLocation(
    gl,
    program,
    'u_lightDirection'
  );
  const u_innerLimit = webglUtils.getUniformLocation(
    gl,
    program,
    'u_innerLimit'
  );
  const u_outerLimit = webglUtils.getUniformLocation(
    gl,
    program,
    'u_outerLimit'
  );
  const u_lightWorldPosition = webglUtils.getUniformLocation(
    gl,
    program,
    'u_lightWorldPosition'
  );
  const u_viewWorldPosition = webglUtils.getUniformLocation(
    gl,
    program,
    'u_viewWorldPosition'
  );
  const u_world = webglUtils.getUniformLocation(gl, program, 'u_world');

  a_position.setFloat32(getGeometry(), 3);
  a_normal.setFloat32(normalsArr, 3);

  const fieldOfViewRadians = m3.degToRad(60);
  let fRotationRadians = 0;
  let shininess = 150;
  let innerLimit = m3.degToRad(10);
  let outerLimit = m3.degToRad(20);
  const api = {
    r: 0,
    shininess: 150,
    lightRotationX: 0,
    lightRotationY: 0,
    lightDirection: [0, 0, 1],
    i: 10,
    o: 20,
  };

  const gui = new GUI();
  gui
    .add(api, 'r')
    .name('fRotationRadians')
    .onChange((r) => {
      fRotationRadians = m3.degToRad(r);
      drawScene();
    });
  gui.add(api, 'shininess', 0, 300).onChange((s) => {
    shininess = s;
    drawScene();
  });
  gui.add(api, 'lightRotationX', -2, 2).onChange(() => {
    drawScene();
  });
  gui.add(api, 'lightRotationY', -2, 2).onChange(() => {
    drawScene();
  });
  gui
    .add(api, 'i', 0, 180)
    .name('innerLimit')
    .onChange((i) => {
      innerLimit = m3.degToRad(i);
      drawScene();
    });
  gui
    .add(api, 'o', 0, 180)
    .name('outerLimit')
    .onChange((o) => {
      outerLimit = m3.degToRad(o);
      drawScene();
    });

  drawScene();

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    const worldInverseMatrix = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    u_worldViewProjection.uniformMatrix4fv(worldViewProjectionMatrix);
    u_worldInverseTranspose.uniformMatrix4fv(worldInverseTransposeMatrix);
    u_world.uniformMatrix4fv(worldMatrix);

    u_color.uniform4fv([0.2, 1, 0.2, 1]);

    const lightPosition = [40, 60, 120];
    u_lightWorldPosition.uniform3fv(lightPosition);
    u_viewWorldPosition.uniform3fv(camera);
    u_shininess.uniform1f(shininess);

    let lmat = m4.lookAt(lightPosition, target, up);
    lmat = m4.multiply(m4.xRotation(api.lightRotationX), lmat);
    lmat = m4.multiply(m4.yRotation(api.lightRotationY), lmat);
    api.lightDirection = [-lmat[8], -lmat[9], -lmat[10]];

    u_lightDirection.uniform3fv(api.lightDirection);
    u_innerLimit.uniform1f(Math.cos(innerLimit));
    u_outerLimit.uniform1f(Math.cos(outerLimit));

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  }
})();
