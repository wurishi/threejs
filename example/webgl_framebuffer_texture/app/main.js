import Webgl from 'js/core/Webgl';
import loop from 'js/core/Loop';
import props from 'js/core/props';
import Example from 'js/components/Example';
import * as THREE from 'three';


// ##
// INIT
const webgl = new Webgl(window.innerWidth, window.innerHeight);
document.body.appendChild(webgl.dom);
// - Add object update to loop
loop.add(webgl.onUpdate);

// ##
// GUI
// const gui = new dat.GUI();
// gui.add(props, 'rotation', 0.01, 1);
// gui.close();

// ##
// EXAMPLE LIGHT
// const light = new THREE.DirectionalLight(0xffffff, 0.5);
// light.position.set(1, 1, 1);
// webgl.add(light);
const ambientLight = new THREE.AmbientLight(0xcccccc,0.4);
webgl.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff,0.8);
webgl.camera.add(pointLight);

// ##
// EXAMPLE BOX
// const example = new Example();
// webgl.add(example);
// loop.add(example.onUpdate);

// ##
// RENDERER
loop.start();


// ##
// ON RESIZE / ORIENTATION CHANGE
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  webgl.onResize(w, h);
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);
