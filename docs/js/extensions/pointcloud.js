class PointCloudExtension extends Autodesk.Viewing.Extension {

    load() {
        console.log("PointCloudExtension loaded")
        // Configure decoder and create loader
        THREE.DRACOLoader.setDecoderPath( 'js/draco/' );
        THREE.DRACOLoader.setDecoderConfig( { type: 'wasm' } );
        var dracoLoader = new THREE.DRACOLoader();

        dracoLoader.load( 'data/airsquire.drc', geometry => {
            geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS
            console.log(geometry)
            const positions = geometry.attributes['position'].array
            const idColorList = []
            for (var i=0; i< positions.length; i+=3){
                const color = new THREE.Color()
                color.setHex(i)
                idColorList.push(color.r)
                idColorList.push(color.g)
                idColorList.push(color.b)
            }
            const idColor = new Float32Array(idColorList)
            geometry.addAttribute('color', new THREE.BufferAttribute(idColor, 3, true))
            this.points = new THREE.PointCloud(geometry, this.getMaterial());
            this.viewer.impl.createOverlayScene('pointclouds');
            this.viewer.impl.addOverlay('pointclouds', this.points);

            // Release the cached decoder module.
            THREE.DRACOLoader.releaseDecoderModule();

            viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
                this.alignAndScaleModel();
                setHomeView();
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

        return new THREE.ShaderMaterial( {
            uniforms: {
                size: { type: "f", value: PointSize },
                texture: { type: "t", value: tex }
            },
            vertexShader: `
                    uniform float size;
                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                        gl_PointSize = 1.2 + size / length(mvPosition.xyz) ;
                        gl_Position = projectionMatrix * mvPosition;
                    }
            `,
            fragmentShader: `
                    uniform sampler2D texture;
                    void main() {
                        gl_FragColor = texture2D( texture, gl_PointCoord );
                        if (gl_FragColor.w < 0.45) discard;
                    }                    
            `,
        } );
    }

    alignAndScaleModel() {
        const feettoMeters = 3.28084 * 2;
        this.points.scale.multiplyScalar(feettoMeters);
        this.points.position.set(-100.0, -160.0, -30);
        //const offset = viewer.model.getData().globalOffset;
        //this.points.position.set(-offset.x, -offset.y, -offset.z);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('PointCloudExtension', PointCloudExtension);
