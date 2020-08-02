import * as THREE from 'three';
import { Group } from 'three';

import BasicLights from './Lights.js';

export default class OrbScene extends Group {
  constructor() {
    super();

    const lights = new BasicLights();

    this.add(lights);

    const textureLoader = new THREE.TextureLoader();
    const orbMatcap = textureLoader.load('/src/objects/images/orb_matcap.jpg');

    var matShader;

    // Create earth

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

    const orb1 = new THREE.Mesh(orbgeo, matcapmat);
    orb1.scale.set(.2, .2, .2);
    orb1.position.set(7, 2.5, 0);

    const empty1 = new THREE.Object3D();
    const group1 = new THREE.Group();
    group1.add(orb1, empty1);

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
      this.matShader = shader;
    }

    const plane = new THREE.Mesh(planegeo, planemat)

    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;

    this.add(orb, group1, plane);

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

  render(sceneTime) {
    //this.rotation.y = timeStamp / 20000;

    if(this.matShader) {
      this.matShader.uniforms.time.value = sceneTime * .8;
    }

    if(this.group1) {
      console.log(this.group1)
    }

    //window.addEventListener('mousemove', onMouseMove());
  }
}