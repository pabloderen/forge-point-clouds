let viewer = null;

window.addEventListener('DOMContentLoaded', ()=>loadModel("dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cG9pbnRjbG91ZC9TYW1wbGVkLnJ2dA"));


function loadModel(urn) {

    const options = {
        env: 'AutodeskProduction',
        accessToken: _adsk.token.access_token,
        applyRefPoint: true,
        isAEC: true,
        extensions:["PointCloudExtension", "GPUPickerExtension"]
    };

    Autodesk.Viewing.Initializer(options, () => {

        const div = document.getElementById('forgeViewer');
        const config = { extensions:["PointCloudExtension", "GPUPickerExtension"] };

        viewer = new Autodesk.Viewing.Private.GuiViewer3D(div, config);
        viewer.start();
        Autodesk.Viewing.Document.load(`urn:${urn}`, (doc) => {
            var viewables = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, viewables).then( onLoadFinished );
        });
    });

    function onLoadFinished() {
        viewer.impl.toggleEnvMapBackground(false);
        viewer.setTheme("light-theme");
        viewer.autocam.shotParams.destinationPercent=3;
        viewer.autocam.shotParams.duration = 3;
    }
}

function setHomeView() {
    // To capture an initial camera view, use `ss=viewer.getState(); delete(ss.seedURN);delete(ss.objectSet); JSON.stringify(ss)``
    viewer.restoreState({"viewport":{"name":"","eye":[65.34524923046399,-120.13322386541662,194.83473160322663],"target":[63.07024751549242,-112.91079668728337,181.88068617237252],"up":[-0.25937569183597114,0.823437641270813,0.5046530505436099],"worldUpVector":[0,0,1],"pivotPoint":[48.137529415859944,21.36101531982422,21.96073908333046],"distanceToOrbit":219.96159273088915,"aspectRatio":1.74002574002574,"projection":"perspective","isOrthographic":false,"fieldOfView":49},"renderOptions":{"environment":"Contrast","ambientOcclusion":{"enabled":false,"radius":12,"intensity":1},"toneMap":{"method":1,"exposure":-1,"lightMultiplier":-1},"appearance":{"ghostHidden":true,"ambientShadow":false,"antiAliasing":true,"progressiveDisplay":true,"swapBlackAndWhite":false,"displayLines":true,"displayPoints":true}},"cutplanes":[]})
    const bm = viewer.getExtension('Autodesk.BimWalk');
    if (bm) bm.deactivate();
}

function setWalkView() {
    viewer.restoreState({"viewport":{"name":"","eye":[-66.73650219669983,175.79195610709456,-14.322727254740014],"target":[-50.69954796715915,157.52847762767902,-14.119889819375144],"up":[-0.005506296164228191,0.006270774366333662,0.9999651784394286],"worldUpVector":[0,0,1],"pivotPoint":[47.43881712446404,14.799335479736325,19.030016711262554],"distanceToOrbit":196.58037875687498,"aspectRatio":1.74002574002574,"projection":"perspective","isOrthographic":false,"fieldOfView":49},"renderOptions":{"environment":"Contrast","ambientOcclusion":{"enabled":false,"radius":12,"intensity":1},"toneMap":{"method":1,"exposure":0,"lightMultiplier":-1e-20},"appearance":{"ghostHidden":true,"ambientShadow":false,"antiAliasing":true,"progressiveDisplay":true,"swapBlackAndWhite":false,"displayLines":true,"displayPoints":true}},"cutplanes":[]});
    viewer.getExtension('Autodesk.BimWalk').activate();
}
