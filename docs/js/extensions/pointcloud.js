

class PointCloudExtension extends Autodesk.Viewing.Extension {
    load() {

                const PointSize = 10.0;
                var tex = THREE.ImageUtils.loadTexture("css/disc.png");
                var material = new THREE.ShaderMaterial( {
                    uniforms: {
                        size: { type: "f", value: PointSize },
                        texture: { type: "t", value: tex }
                    },
                    vertexShader: document.getElementById( 'vertexshader' ).textContent,
                    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                    alphaTest: 0.9
                } );


        // Configure decoder and create loader.
        THREE.DRACOLoader.setDecoderPath( 'js/draco/' );
        THREE.DRACOLoader.setDecoderConfig( { type: 'wasm' } );
        var dracoLoader = new THREE.DRACOLoader();
        THREE.DRACOLoader.getDecoderModule().then(module=>{
          THREE.DRACOmodule = module;
        });

        dracoLoader.load( 'data/airsquire.drc', geometry => {
            geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS
            this.points = new THREE.PointCloud(geometry, material);

            const feettoMeters = 3.28084 * 2;
            this.points.scale.multiplyScalar(feettoMeters);
            this.points.position.set(-100.0, -160.0, -30);
            this.viewer.impl.createOverlayScene('pointclouds');
            this.viewer.impl.addOverlay('pointclouds', this.points);

            // Release the cached decoder module.
            THREE.DRACOLoader.releaseDecoderModule();

            viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
                const offset = viewer.model.getData().globalOffset;
                //this.points.position.set(-offset.x, -offset.y, -offset.z);
                viewer.impl.invalidate(false,false,true);
            });

            addEventListener('mousemove', e=>{
                //this.points.position.set(-200.0+(e.canvasX/5.0) , -260.0-(e.canvasY/5.0) , -30);
                //viewer.impl.invalidate(false,false, true);
            })
        });
        return true;
    }

    unload() {
        return true;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('PointCloudExtension', PointCloudExtension);
