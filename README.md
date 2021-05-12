# Forge-point-clouds

Forked from https://github.com/wallabyway/forge-point-clouds

## How to run:

```
git clone https://github.com/pabloderen/forge-point-clouds.git
cd docs
python server.py
```

## Main changes:

- Shaders

```
var vertexShader=  `
        uniform float size;
        varying vec4 clip_pos;

        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = 1.2 + size / length(mvPosition.xyz) ;
            gl_Position = projectionMatrix * mvPosition;
            clip_pos = vec4( position, 1.0 );
        }`;

var fragmentShader =  `
            uniform sampler2D texture1;
            varying vec4 clip_pos;
            uniform float clipx;
            uniform float clipy;
            uniform float clipz;
            void main() {
                if ( clip_pos.x > clipx ) discard;
                if ( clip_pos.y < clipy ) discard;
                if ( clip_pos.z > clipz ) discard;
                gl_FragColor = texture2D(texture1, gl_PointCoord);
                if (gl_FragColor.w < 0.45) discard;
            }`;
```

- Section of point cloud - so far hardcoded

```
 if (!e.planes) {
    this.material.uniforms.clipx ={ type: "f", value: 35};
    this.material.uniforms.clipz = { type: "f", value: 20.5};
    this.material.uniforms.clipy ={ type: "f", value: -20.5};
    this.material.needsUpdate = true;
    return;
}

e.planes.forEach(element => {
    if  (element.x != 0){
        this.material.uniforms.clipx = { type: "f", value: 10 -(e.planes[0].w/feettoMeters)};
        console.log(this.material.uniforms.clipx.value + " "+ e.planes[0].w/feettoMeters);
    }
    if  (element.y != 0){
        this.material.uniforms.clipy = { type: "f", value: (25+e.planes[0].w/feettoMeters)};
    }
    if  (element.z != 0){
        this.material.uniforms.clipz = { type: "f", value:5 - ( e.planes[0].w/feettoMeters)};

    }
});
```
