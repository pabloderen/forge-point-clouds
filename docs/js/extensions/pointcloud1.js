class PointCloudExtension extends Autodesk.Viewing.Extension {
    load() {
        return true;
    }

    unload() {
        return true;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('PointCloudExtension', PointCloudExtension);


//Step 0 - load Revit model
//Step 1 - add new pointcloud.js extension class
//Step 2 - add draco loader, pc material and geometry, add overlay
//Step 3 - set alignment


