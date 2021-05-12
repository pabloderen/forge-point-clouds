const feettoMeters = 3.28084 * 2;

class PointCloudExtension extends Autodesk.Viewing.Extension {

    load() {
        console.log("PointCloudExtension loaded")
        // Configure decoder and create loader
        THREE.DRACOLoader.setDecoderPath( 'js/draco/' );
        THREE.DRACOLoader.setDecoderConfig( { type: 'wasm' } );
        var dracoLoader = new THREE.DRACOLoader();

        dracoLoader.load( 'data/airsquire.drc', geometry => {
            geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS
            const positions = geometry.attributes['position'].array
            const idColorList = []
            for (let i=0; i< positions.length; i+=3){
                const color = new THREE.Color()
                color.setHex(i)
                idColorList.push(color.r)
                idColorList.push(color.g)
                idColorList.push(color.b)
            }
            const idColor = new Float32Array(idColorList)
            geometry.addAttribute('color', new THREE.BufferAttribute(idColor, 3, true))
            this.material = this.getMaterial();
            this.points = new THREE.PointCloud(geometry, this.material);
            this.points.scale.multiplyScalar(feettoMeters);
            this.points.position.set(-100.0, -160.0, -30);
            this.viewer.impl.createOverlayScene('pointclouds');
            this.viewer.impl.addOverlay('pointclouds', this.points);

            // Release the cached decoder module.
            THREE.DRACOLoader.releaseDecoderModule();

            viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
  
 
            });
            
            viewer.addEventListener(Autodesk.Viewing.CUTPLANES_CHANGE_EVENT, (e) => {
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
                
                this.material.needsUpdate = true;
            });

        });
        return true;
    }

    unload() {
        return true;
    }

    getMaterial() {
        const PointSize = 350.0 * viewer.impl.glrenderer().getPixelRatio();
        var tex = THREE.ImageUtils.loadTexture("css/disc.png");
        var uniforms = {
            color: { type:"c",  value: new THREE.Color(0xffffff) },
            texture1: { type: "t", value: tex},
            size: { type:"f",
                value: PointSize
            },
            scale: {
                type:"f",
                value: window.innerHeight / 2.0
            },
            clipx: { type: "f", value: 35 },
            clipy: { type: "f", value: -20.5 },
            clipz: { type: "f", value: 20.5 },
        };

        var vertexShader=  `
        uniform float size;
        varying vec4 clip_pos;

        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = 1.2 + size / length(mvPosition.xyz) ;
            gl_Position = projectionMatrix * mvPosition;
            clip_pos = vec4( position, 1.0 );
        }
            `;
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
            }          
            
            `;
        return new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        } );
    }


}

Autodesk.Viewing.theExtensionManager.registerExtension('PointCloudExtension', PointCloudExtension);
