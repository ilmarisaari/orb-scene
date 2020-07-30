/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import EarthScene from './objects/Scene.js';
import { gsap } from 'gsap';
import * as dat from 'dat.gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({antialias: true});
const earthScene = new EarthScene();

// scene
scene.add(earthScene);

var loader = new THREE.CubeTextureLoader();
loader.setPath( '/src/objects/images/MilkyWay/' );

var textureCube = loader.load( [
  'dark-s_px.jpg', 'dark-s_nx.jpg',
  'dark-s_py.jpg', 'dark-s_ny.jpg',
  'dark-s_pz.jpg', 'dark-s_nz.jpg'
] );

scene.background = textureCube;
scene.environment = textureCube;

// camera
camera.position.set(6,3,-2);
camera.lookAt(new THREE.Vector3(0,0,0));

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);


// post processing effects
var composer = new EffectComposer( renderer );

var renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

var glitchPass = new GlitchPass();
//composer.addPass( glitchPass );

var bloomParams = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: .8,
  bloomRadius: 1
};

var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloomParams.bloomThreshold;
bloomPass.strength = bloomParams.bloomStrength;
bloomPass.radius = bloomParams.bloomRadius;

//composer.addPass( bloomPass );
bloomPass.renderToScreen = true;

// controls
var controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 3.2;
controls.maxDistance = 100;

var guiValues = new function() {
  this.lights = 1;
}

var guiControls = new dat.GUI();
guiControls.add(guiValues, 'lights', 0, 1);

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  
  composer.render()
  //renderer.render(scene, camera);
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

// initial animation
gsap.from(camera.position, 3, {z: -10, ease: "power2.out"})

