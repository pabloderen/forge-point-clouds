const feettoMeters = 3.28084 * 2;

class PointCloudExtension extends Autodesk.Viewing.Extension {

    load() {
        // Configure decoder and create loader
        THREE.DRACOLoader.setDecoderPath( 'js/draco/' );
        THREE.DRACOLoader.setDecoderConfig( { type: 'wasm' } );
        var dracoLoader = new THREE.DRACOLoader();

        dracoLoader.load( 'data/airsquire.drc', geometry => {
            geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS
            this.material = this.getMaterial();
            this.points = new THREE.PointCloud(geometry, this.material);
            this.viewer.impl.createOverlayScene('pointclouds');
            this.viewer.impl.addOverlay('pointclouds', this.points);

            // Release the cached decoder module.
            THREE.DRACOLoader.releaseDecoderModule();

            viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
                this.alignAndScaleModel();
                setHomeView();
            });
            
            viewer.addEventListener(Autodesk.Viewing.CUTPLANES_CHANGE_EVENT, (e) => {
                if (!e.planes) return;
                this.material.uniforms.clipx = { type: "f", value: (15.25+e.planes[0].w/feettoMeters)};
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
        return new THREE.ShaderMaterial( {
            uniforms: {
                size: { type: "f", value: PointSize },
                texture: { type: "t", value: tex },
                clipx: { type: "f", value: -20.5 },
            },
            vertexShader: `
                    uniform float size;
                    varying vec4 clip_pos;

                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                        gl_PointSize = 1.2 + size / length(mvPosition.xyz) ;
                        gl_Position = projectionMatrix * mvPosition;
                        clip_pos = vec4( position, 1.0 );
                    }
            `,
            fragmentShader: `
                    uniform sampler2D texture;
                    varying vec4 clip_pos;
                    uniform float clipx;
                    void main() {
                        if ( clip_pos.x < clipx ) discard;
                        gl_FragColor = texture2D( texture, gl_PointCoord );
                        if (gl_FragColor.w < 0.45) discard;
                    }                    
            `,
        } );
    }

    alignAndScaleModel() {
        this.points.scale.multiplyScalar(feettoMeters);
        this.points.position.set(-100.0, -160.0, -30);
        //const offset = viewer.model.getData().globalOffset;
        //this.points.position.set(-offset.x, -offset.y, -offset.z);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('PointCloudExtension', PointCloudExtension);
