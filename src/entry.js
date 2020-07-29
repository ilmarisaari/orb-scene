/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import EarthScene from './objects/Scene.js';
import { gsap } from 'gsap';
import * as dat from 'dat.gui';

const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});
const earthScene = new EarthScene();

// scene
scene.add(earthScene);

// camera
camera.position.set(6,3,-2);
camera.lookAt(new Vector3(0,0,0));

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);

// controls
var controls = new OrbitControls( camera, renderer.domElement );

var guiValues = new function() {
  this.lights = 1;
}

var guiControls = new dat.GUI();
guiControls.add(guiValues, 'lights', 0, 1);

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  renderer.render(scene, camera);
  earthScene.render && earthScene.render(timeStamp);
  earthScene.children[1].material.emissiveIntensity = guiValues.lights;
  
  controls.update();

  window.requestAnimationFrame(onAnimationFrameHandler);
}
window.requestAnimationFrame(onAnimationFrameHandler);

// resize
const windowResizeHanlder = () => { 
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);

// dom
document.body.style.margin = 0;
document.body.appendChild( renderer.domElement );

gsap.from(camera.position, 3, {z: -10, ease: "power2.out"})

