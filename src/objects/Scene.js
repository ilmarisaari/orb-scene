import * as THREE from 'three';
import { Group } from 'three';

import BasicLights from './Lights.js';

export default class earthScene extends Group {
  constructor() {
    super();

    const lights = new BasicLights();

    this.add(lights);

    const textureLoader = new THREE.TextureLoader();
    const earthAlbedo = textureLoader.load('/src/objects/images/earth_albedo.jpg');
    const earthBump = textureLoader.load('/src/objects/images/earth_bump.jpg');
    const earthClouds = textureLoader.load('/src/objects/images/earth_clouds.jpg');
    const earthLights = textureLoader.load('/src/objects/images/earth_lights.jpg');
    const earthGroundStencil = textureLoader.load('/src/objects/images/earth_ground_stencil.jpg');

    // Create earth

    const earthRadius = 2;
    const earthResolution = 64;

    const earthgeo = new THREE.SphereGeometry(earthRadius, earthResolution, earthResolution);
    const earthmat = new THREE.MeshStandardMaterial({
      map: earthAlbedo,
      bumpMap: earthBump,
      bumpScale: .3,
      emissive: 0xFCEEBE,
      emissiveMap: earthLights,
      emissiveIntensity: 1,
      roughnessMap: earthGroundStencil,
      roughness: .6,
    });

    // Create clouds

    const cloudsgeo = new THREE.SphereGeometry(1.01*earthRadius, earthResolution, earthResolution);
    const cloudsmat = new THREE.MeshStandardMaterial({
      map: earthClouds,
      alphaMap: earthClouds,
      transparent: true
    });

    // Create atmosphere

    const atmospheregeo = new THREE.SphereGeometry(1.005*earthRadius, earthResolution, earthResolution);

    const vertexShader =
    [
	
      "varying vec3 vPositionW;",
      "varying vec3 vNormalW;",
  
      "void main() {",
  
      "	vPositionW = vec3( vec4( position, 1.0 ) * modelMatrix);",
      " vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );",
  
      "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  
      "}"
  
    ].join( "\n" );

    const fragmentShader =
    [
	
      "varying vec3 vPositionW;",
      "varying vec3 vNormalW;",
  
      "void main() {",
      
      "	vec3 color = vec3(.4, .6, 1.);",
      "	vec3 viewDirectionW = normalize(cameraPosition - vPositionW);",
      "	float fresnelTerm = dot(viewDirectionW, vNormalW);",
      "	fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);",
  
      "	gl_FragColor = vec4( color * fresnelTerm, fresnelTerm);",
  
      "}"
  
    ].join( "\n" );

    const atmospheremat = new THREE.ShaderMaterial( {
      uniforms: {},
			vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
		});

    // Add objects to scene

    const earth = new THREE.Mesh(earthgeo, earthmat);
    const atmosphere = new THREE.Mesh(atmospheregeo, atmospheremat);
    const clouds = new THREE.Mesh(cloudsgeo, cloudsmat);

    this.add(earth, atmosphere, clouds);

    //const raycaster = new THREE.Raycaster();
    //const mouse = new THREE.Vector2();
  }

  /* onMouseMove(event) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = ( event.clientY / window.innerHeight ) * 2 - 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);
    for (var i = 0; i < intersects.length; i++) {
      intersects[i].object.material.wireframe = true;
    }
  }

  */

  render(timeStamp) {
    //this.rotation.y = timeStamp / 20000;
    this.children[3].rotation.y = timeStamp / 200000;
    this.children[3].rotation.x = -timeStamp / 150000;

    //window.addEventListener('mousemove', onMouseMove());
  }
}