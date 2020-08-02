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
import { gsap } from 'gsap';

import OrbScene from './objects/Scene.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({antialias: true});
const orbScene = new OrbScene();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();

// scene
scene.add(orbScene);

const axesHelper = new THREE.AxesHelper(8);
scene.add(axesHelper);

var loader = new THREE.CubeTextureLoader();
loader.setPath( '/src/objects/images/MilkyWay/' );

var textureCube = loader.load( [
  'dark-s_px.jpg', 'dark-s_nx.jpg',
  'dark-s_py.jpg', 'dark-s_ny.jpg',
  'dark-s_pz.jpg', 'dark-s_nz.jpg'
] );


//renderer.setClearColor( 0xedb941, 1 );
scene.background = new THREE.Color( 0xeed59a );
scene.environment = textureCube;


scene.fog = new THREE.Fog(0xeeed59a, .1, 70);

// camera
camera.position.set(6,2,-14);
camera.lookAt(new THREE.Vector3(0,2,0));

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

/* var guiValues = new function() {
  this.lights = 1;
}

var guiControls = new dat.GUI();
guiControls.add(guiValues, 'lights', 0, 1);
*/


// render loop
const onAnimationFrameHandler = (timeStamp) => {

  const time = clock.getElapsedTime();

  composer.render()
  orbScene.render(time);
  
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
gsap.from(orbScene.children[1].position, {duration: 5, y: 2.5, ease: "Sine.easeOut", repeat: -1, yoyo: true})
