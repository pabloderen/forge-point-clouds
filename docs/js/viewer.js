let viewer = null;

window.addEventListener('DOMContentLoaded', ()=>loadModel("dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cG9pbnRjbG91ZC9TYW1wbGVkLnJ2dA"));


function loadModel(urn) {

    const options = {
        env: 'AutodeskProduction',
        accessToken: _adsk.token.access_token,
        applyRefPoint: true,
        isAEC: true,
        extensions:["PointCloudExtension"]
    };

    Autodesk.Viewing.Initializer(options, () => {

        const div = document.getElementById('forgeViewer');
        const config = { extensions:["PointCloudExtension"] };

        viewer = new Autodesk.Viewing.Private.GuiViewer3D(div, config);
        viewer.start();
        Autodesk.Viewing.Document.load(`urn:${urn}`, (doc) => {
            var viewables = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, viewables).then( onLoadFinished );
        });
    });

    function onLoadFinished() {
        // viewer.impl.toggleEnvMapBackground(false);
        // viewer.setTheme("light-theme");
        // viewer.autocam.shotParams.destinationPercent=3;
        // viewer.autocam.shotParams.duration = 3;
    }
}


