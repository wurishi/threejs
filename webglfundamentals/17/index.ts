/// <reference path="../m4.d.ts" />
/// <reference path="../m3.d.ts" />
/// <reference path="../primitives.d.ts" />
/// <reference path="../webgl-utils.d.ts" />
/// <reference path="../texture-utils.d.ts" />
/// <reference path="../chroma.d.ts" />
import * as webglUtils2 from '../webgl-utils';

const vs = `
uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
  v_texCoord = a_texcoord;
  v_position = (u_worldViewProjection * a_position);
  v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;
  v_surfaceToLight = u_lightWorldPos - (u_world * a_position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
  gl_Position = v_position;
}
`;

const fs = `
precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_colorMult;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

vec4 lit(float l, float h, float m) {
  return vec4(1.0, abs(l), (l > 0.0) ? pow(max(0.0, h), m) : 0.0, 1.0);
}

void main() {
  vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
  vec4 litR = lit(dot(a_normal, surfaceToLight), dot(a_normal, halfVector), u_shininess);
  vec4 outColor = vec4((u_lightColor * (diffuseColor * litR.y * u_colorMult + u_specular * litR.z * u_specularFactor)).rgb, diffuseColor.a);
  gl_FragColor = outColor;
}
`;

(() => {
    const canvas = webglUtils2.createCanvas();
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const buffers = primitives.createSphereBuffers(gl, 10, 48, 24);

    const program = webglUtils2.createProgram2(gl, vs, fs);
    const uniformSetters = webglUtils.createUniformSetters(gl, program);
    const attribSetters = webglUtils.createAttributeSetters(gl, program);

    const attribs = {
        a_position: { buffer: buffers.position, numComponents: 3 },
        a_normal: { buffer: buffers.normal, numComponents: 3 },
        a_texcoord: { buffer: buffers.texcoord, numComponents: 2 },
    };

    function degToRad(d: number) {
        return (d * Math.PI) / 180;
    }

    const cameraAngleRadians = degToRad(0);
    const fieldOfViewRadians = degToRad(60);
    const cameraHeight = 50;

    const uniformsThatAreTheSameForAllObjects = {
        u_lightWorldPos: [-50, 30, 100],
        u_viewInverse: m4.identity(),
        u_lightColor: [1, 1, 1, 1],
    };

    const uniformsThatAreComputedForEachObject = {
        u_worldViewProjection: m4.identity(),
        u_world: m4.identity(),
        u_worldInverseTranspose: m4.identity(),
    };

    const rand = function (min: number, max?: number) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    };

    const randInt = function (range: number) {
        return Math.floor(Math.random() * range);
    };

    const textures = [
        textureUtils.makeStripeTexture(gl, { color1: '#fff', color2: '#ccc' }),
        textureUtils.makeCheckerTexture(gl, { color1: '#FFF', color2: '#CCC' }),
        textureUtils.makeCircleTexture(gl, { color1: '#FFF', color2: '#CCC' }),
    ];

    const objects: any[] = [];
    const numObjects = 300;
    const baseColor = rand(240);

    for (let i = 0; i < numObjects; i++) {
        objects.push({
            radius: rand(150),
            xRotation: rand(Math.PI * 2),
            yRotation: rand(Math.PI),
            materialUniforms: {
                u_colorMult: chroma
                    .hsv(rand(baseColor, baseColor + 120), 0.5, 1)
                    .gl(),
                u_diffuse: textures[randInt(textures.length)],
                u_specular: [1, 1, 1, 1],
                u_shininess: rand(500),
                u_specularFactor: rand(1),
            },
        });
    }

    requestAnimationFrame(drawScene);

    function drawScene(time: number) {
        time = time * 0.0001 + 5;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas as any);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        const aspect =
            (gl.canvas as any).clientWidth / (gl.canvas as any).clientHeight;
        const projectionMatrix = m4.perspective(
            fieldOfViewRadians,
            aspect,
            1,
            2000
        );

        const cameraPosition = [0, 0, 100];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        const cameraMatrix = m4.lookAt(
            cameraPosition,
            target,
            up,
            uniformsThatAreTheSameForAllObjects.u_viewInverse
        );

        const viewMatrix = m4.inverse(cameraMatrix);

        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        gl.useProgram(program);

        webglUtils.setAttributes(attribSetters, attribs);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        webglUtils.setUniforms(
            uniformSetters,
            uniformsThatAreTheSameForAllObjects
        );

        // draw objects
        objects.forEach((object) => {
            let worldMatrix = m4.xRotation(object.xRotation * time);
            worldMatrix = m4.yRotate(worldMatrix, object.yRotation * time);
            worldMatrix = m4.translate(worldMatrix, 0, 0, object.radius);
            uniformsThatAreComputedForEachObject.u_world = worldMatrix;

            m4.multiply(
                viewProjectionMatrix,
                worldMatrix,
                uniformsThatAreComputedForEachObject.u_worldViewProjection
            );
            m4.transpose(
                m4.inverse(worldMatrix),
                uniformsThatAreComputedForEachObject.u_worldInverseTranspose
            );

            webglUtils.setUniforms(
                uniformSetters,
                uniformsThatAreComputedForEachObject
            );

            webglUtils.setUniforms(uniformSetters, object.materialUniforms);

            gl.drawElements(
                gl.TRIANGLES,
                buffers.numElements,
                gl.UNSIGNED_SHORT,
                0
            );
        });

        requestAnimationFrame(drawScene);
    }
})();
