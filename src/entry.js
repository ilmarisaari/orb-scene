import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { gsap } from 'gsap';

import BasicLights from './objects/Lights.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();


//const axesHelper = new THREE.AxesHelper(8);
//scene.add(axesHelper);

var loader = new THREE.CubeTextureLoader();
loader.setPath( '/src/objects/images/MilkyWay/' );

var textureCube = loader.load( [
  'dark-s_px.jpg', 'dark-s_nx.jpg',
  'dark-s_py.jpg', 'dark-s_ny.jpg',
  'dark-s_pz.jpg', 'dark-s_nz.jpg'
] );

var audiolistener = new THREE.AudioListener();

camera.add( audiolistener );

var sceneAmbient = new THREE.Audio( audiolistener );

scene.add( sceneAmbient );

var audioloader = new THREE.AudioLoader();

audioloader.load(
  '/src/objects/sounds/ambient_world_sound.ogg',

  // onLoad callback
  function(audioBuffer) {
    
    sceneAmbient.setBuffer(audioBuffer);

    sceneAmbient.play();
  },

  // onProgress callback
  function ( xhr ) {
		//console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
);


scene.background = new THREE.Color( 0xeed59a );
scene.environment = textureCube;


scene.fog = new THREE.Fog(0xeeed59a, .1, 70);

// camera
camera.position.set(6,2,-14);
camera.lookAt(new THREE.Vector3(0,2,0));

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);


// **post processing effects**
var composer = new EffectComposer( renderer );

var renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

var afterimagePass = new AfterimagePass();
afterimagePass.setSize(2048, 2048);
//composer.addPass( afterimagePass );

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
afterimagePass.renderToScreen = true;

// controls
var controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 3.2;
controls.maxDistance = 100;

// **scene contents**

const lights = new BasicLights();

scene.add(lights);

const textureLoader = new THREE.TextureLoader();
const orbMatcap = textureLoader.load('/src/objects/images/orb_matcap.jpg');

var matShader;

// Setup main orb

const orbRadius = 2;
const orbResolution = 64;

const orbgeo = new THREE.SphereGeometry(orbRadius, orbResolution, orbResolution);
const matcapmat = new THREE.MeshMatcapMaterial({
  matcap: orbMatcap
});

const orb = new THREE.Mesh(orbgeo, matcapmat);

orb.position.set(0, 3, 0);
orb.castShadow = true;
orb.receiveShadow = false;


// Setup smaller orbs

function createOrb(scale, offset) {
  let orb = new THREE.Mesh(orbgeo, matcapmat);
  orb.scale.set(scale, scale, scale);
  orb.position.set(offset, 2.5, 0);

  let empty = new THREE.Object3D();
  let group = new THREE.Group();
  group.add(orb, empty);
  group.rotation.y = Math.random()*2*Math.PI;
  orb.receiveShadow = true;
  orb.castShadow = true;

  return group;
}

var orb1 = createOrb(.2, 7);
var orb2 = createOrb(.1, 9);
var orb3 = createOrb(.15, 13);
var orb4 = createOrb(.12, 18);
var orb5 = createOrb(.18, 21);

// Setup ground plane

const planegeo = new THREE.PlaneBufferGeometry( 80, 80, 200, 200);
const planemat = new THREE.MeshStandardMaterial({ color: 0xfafafa });

planemat.onBeforeCompile = (shader) => {
  shader.uniforms.time = { value: 0 };
  shader.vertexShader = 
  `uniform float time;
  ${shader.vertexShader}
  `;

  const token = '#include <begin_vertex>';
  const customTransform = `
    vec3 transformed = vec3(position);
    float freq = length( transformed.xy ) * .8;
    float amp = 0.2;
    float angle = -time*2.0 + freq*3.0;
    transformed.z += sin(angle) * amp;
    
    objectNormal = normalize( vec3( 0.0, -amp * freq * cos(angle), 1.0 ) );
    vNormal = normalMatrix * objectNormal;
  `;
  shader.vertexShader = shader.vertexShader.replace(token, customTransform);
  matShader = shader;
}

const plane = new THREE.Mesh(planegeo, planemat)

plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;

scene.add(orb, plane, orb1, orb2, orb3, orb4, orb5);

// **render loop**
function update() {

  const time = clock.getElapsedTime();

  composer.render()
  if(matShader) {
    matShader.uniforms.time.value = time * .8;
  }
  orb1.rotation.y += .002;
  orb2.rotation.y += .0015;
  orb3.rotation.y += .003;
  orb4.rotation.y += .004;
  orb5.rotation.y += .003;
  
  controls.update();

  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);


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
gsap.from(orb.position, {duration: 5, y: 2.5, ease: "Sine.easeOut", repeat: -1, yoyo: true})
