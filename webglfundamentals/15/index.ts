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

uniform bool u_specular;
uniform float u_shininess;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_color;

uniform vec3 u_lightColor;
uniform vec3 u_specularColor;

void main() {
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);

  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float light = dot(normal, surfaceToLightDirection);
  // float specular = dot(normal, halfVector);
  float specular = 0.0;
  if(light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }

  gl_FragColor = u_color;
  gl_FragColor.rgb *= light * u_lightColor;

  if(u_specular) {
    gl_FragColor.rgb += specular * u_specularColor;
  }
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
  const u_lightWorldPosition = webglUtils.getUniformLocation(
    gl,
    program,
    'u_lightWorldPosition'
  );
  const u_world = webglUtils.getUniformLocation(gl, program, 'u_world');
  const u_viewWorldPosition = webglUtils.getUniformLocation(
    gl,
    program,
    'u_viewWorldPosition'
  );
  const u_specular = webglUtils.getUniformLocation(gl, program, 'u_specular');
  const u_shininess = webglUtils.getUniformLocation(gl, program, 'u_shininess');
  const u_lightColor = webglUtils.getUniformLocation(
    gl,
    program,
    'u_lightColor'
  );
  const u_specularColor = webglUtils.getUniformLocation(
    gl,
    program,
    'u_specularColor'
  );

  a_position.setFloat32(getGeometry(), 3, false);
  a_normal.setFloat32(normalsArr, 3, false);

  const fieldOfViewRadians = m3.degToRad(60);
  let fRotationRadians = 0;
  let specular = false;
  let shininess = 150;

  drawScene();

  const gui = new GUI();
  const api = {
    fRotation: fRotationRadians,
    specular: false,
    shininess,
  };
  gui.add(api, 'fRotation', 0, 360).onChange((r) => {
    fRotationRadians = m3.degToRad(r);
    drawScene();
  });
  gui
    .add(api, 'specular')
    .name('高光')
    .onChange((v) => {
      specular = v;
      drawScene();
    });
  gui.add(api, 'shininess', 1, 300).onChange((s) => {
    shininess = s;
    drawScene();
  });

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

    u_worldViewProjection.uniformMatrix4fv(worldViewProjectionMatrix, false);
    u_worldInverseTranspose.uniformMatrix4fv(
      worldInverseTransposeMatrix,
      false
    );
    u_world.uniformMatrix4fv(worldMatrix, false);

    u_color.uniform4fv([0.2, 1, 0.2, 1]);
    u_lightWorldPosition.uniform3fv([20, 30, 60]);

    u_viewWorldPosition.uniform3fv(camera);

    u_specular.uniform1f(specular ? 1 : 0);
    u_shininess.uniform1f(shininess);

    u_lightColor.uniform3fv(m4.normalize([1, 0.6, 0.6]));
    u_specularColor.uniform3fv(m4.normalize([1, 0.6, 0.6]));

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  }
})();
