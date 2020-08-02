import { Group, DirectionalLight, AmbientLight, HemisphereLight, Color, Scene, DirectionalLightHelper, HemisphereLightHelper } from 'three';

export default class BasicLights extends Group {
  constructor(...args) {
    super(...args);

    const dir = new DirectionalLight(0xFFFFFF, .3);
    const ambi = new AmbientLight( 0x404040 , 0.66);
    const hemi = new HemisphereLight( 0xffffbb, 0x080820, .5 )

    dir.position.set(2, 10, .5);
    //dir.target.position.set(0,0,0);
    dir.castShadow = true;

    dir.shadow.mapSize.width = 512;
    dir.shadow.mapSize.height = 512;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 100;

    console.log(dir.shadow)

    this.add(dir, hemi);


    const dirHelper = new DirectionalLightHelper(dir);
    const hemiHelper = new HemisphereLightHelper(hemi, 5);

    // Add helpers to scene
    
    //this.add(dirHelper, hemiHelper);

  }
}
