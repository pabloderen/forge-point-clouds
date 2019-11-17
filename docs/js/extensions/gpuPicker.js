
class GPUPickerExtension extends Autodesk.Viewing.Extension {
  load() {
    console.log("GPUPickerExtension loaded")
    this.webGLDOM = this.viewer.canvas.parentElement.parentElement.parentElement
    if (this.viewer.toolbar) {
      this.createUI()
    } else {
      this.viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        this.onToolbarCreated
      )
    }
  }

  unload() {

  }


  onToolbarCreated = () => {
    this.viewer.removeEventListener(
      Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      this.onToolbarCreated
    )
    this.createUI()
  }

  createUI() {
    this.toolbarBtn = new Autodesk.Viewing.UI.Button("GPU Picker extension")
    this.toolbarBtn.icon.innerHTML =
      '<img style="max-width: 100%;" src="img/measure.png">'
    this.toolbarBtn.setToolTip("Picker")

    this.toolbarBtn.onClick = () => {
      if (this.isPickerEnabled) {
        this.toolbarBtn.removeClass("active")
        this.deactiveGPUPicker()
        this.isPickerEnabled = false
      } else {
        this.toolbarBtn.addClass("active")
        this.activateGPUPicker()
        this.isPickerEnabled = true
      }
    }
    // SubToolbar
    this.subToolbar = this.viewer.toolbar.getControl("AirsquireCustomTools")
      ? this.viewer.toolbar.getControl("AirsquireCustomTools")
      : new Autodesk.Viewing.UI.ControlGroup("AirsquireCustomTools")
    this.subToolbar.addControl(this.toolbarBtn)
    this.viewer.toolbar.addControl(this.subToolbar)

    this.panel = new GPUPickerPanel(
      this.viewer.container,
      "gpu-picker-panel",
      "GPU Picker Panel"
    )
  }

  activateGPUPicker = () => {
    this.panel.setVisible(true)
    this.panel.add("Selecting from model...")
    this.snapper = new Autodesk.Viewing.Extensions.Snapping.Snapper(this.viewer)
    this.snapper.activate()
    this.pointCloudExtension = this.viewer.getLoadedExtensions().PointCloudExtension
    console.log(this.pointCloudExtension)
    this.webGLDOM.addEventListener(
      "mousemove",
      this.onMouseMove,
      false
    )
    this.viewer.canvas.addEventListener(
      "mousedown",
      this.onMouseDown,
      false
    )

    this.webGLDOM.addEventListener(
      "mouseup",
      this.onMouseUp,
      false
    )
  }

  onMouseMove = (event) => {
    if (this.startPickingFromPointCloud) {

    } else {
      this.snapper.handleMouseMove(event)
      this.snapper.indicator.render()
    }
  }

  onMouseDown = (event) => {
  }

  onMouseUp = (mouse) => {
    if (this.startPickingFromPointCloud) {
      const renderer = this.viewer.impl.glrenderer()
      const pixelRatio = renderer.getPixelRatio()
      const pickWndSize = Math.floor(pixelRatio)
      const material = this.pointCloudExtension.points.material
      if (this.renderTarget) {
        this.renderTarget.dispose()
      }
      const width = Math.ceil(renderer.domElement.clientWidth * pixelRatio)
      const height = Math.ceil(renderer.domElement.clientHeight * pixelRatio)
      this.renderTarget = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
      })
      this.renderTarget.setSize(width, height)
      renderer.setRenderTarget(this.renderTarget)
      renderer.state.setDepthTest(material.depthTest)
      renderer.state.setDepthWrite(material.depthWrite)
      renderer.state.setBlending(THREE.NoBlending)
      renderer.clear(
        renderer.autoClearColor,
        renderer.autoClearDepth,
        renderer.autoClearStencil
      )
      const camera = this.viewer.getCamera()
      const pixelPosition = new THREE.Vector3()

      const nmouse = {
        x: ( mouse.clientX / width ) * 2 - 1,
        y: ( mouse.clientY / height ) * -2 + 1
      }

      const ray = this.getRay(camera, nmouse)

      pixelPosition.addVectors(camera.position, ray.direction).project(camera)
      pixelPosition.x = (pixelPosition.x + 1) * width * 0.5
      pixelPosition.y = (pixelPosition.y + 1) * height * 0.5
  
      const pickMaterial = this.createPickMaterial()
      renderer.renderBufferDirect(
        camera,
        [],
        null,
        pickMaterial,
        this.pointCloudExtension.points.geometry,
        this.pointCloudExtension.points
      )
      const pixelBuffer = new Uint8Array(4);

      renderer.context.readPixels(
        pixelPosition.x - (pickWndSize - 1) / 2,
        pixelPosition.y - (pickWndSize - 1) / 2,
        1,
        1,
        renderer.context.RGBA,
        renderer.context.UNSIGNED_BYTE,
        pixelBuffer
      )
      const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
      const positionX = this.pointCloudExtension.points.geometry.attributes.position.array[id]
      const positionY = this.pointCloudExtension.points.geometry.attributes.position.array[id + 1]
      const positionZ = this.pointCloudExtension.points.geometry.attributes.position.array[id + 2]
      const position = new THREE.Vector3(positionX, positionY, positionZ)
      this.panel.add("Point from point cloud selected:")
      this.panel.add(`Selected point in model X: ${position.x.toFixed(4)} Y: ${position.y.toFixed(4)} Z: ${position.z.toFixed(4)}`)
      this.panel.add(`Distance betwen this point to model point is ${position.distanceTo(this.pickPointInModel).toFixed(4)}`)
      this.panel.add("Selecting from point cloud...")
    } else {
      const snapResult = this.snapper.getSnapResult()
      this.pickPointInModel = snapResult.getVertex()
      this.panel.add(`Selected point in model X: ${this.pickPointInModel.x.toFixed(4)} Y: ${this.pickPointInModel.y.toFixed(4)} Z: ${this.pickPointInModel.z.toFixed(4)}`)
      this.panel.add("Model selection done")
      this.panel.add("Selecting from point cloud...")
      this.startPickingFromPointCloud = true
    }
  }


  deactiveGPUPicker = () => {

  }

  getRay(
    camera,
    nmouse
  ) {
    const raycaster = new THREE.Raycaster()
    const raycasterOrigin = new THREE.Vector3()
    const raycasterDirection = new THREE.Vector3()
    raycasterOrigin.setFromMatrixPosition(camera.matrixWorld)
    raycasterDirection
      .set(nmouse.x, nmouse.y, 0.5)
      .unproject(camera)
      .sub(raycasterOrigin)
      .normalize()
    raycaster.set(raycasterOrigin, raycasterDirection)
    return raycaster.ray
  }

  createPickMaterial = () => {

    return new THREE.ShaderMaterial({
      uniforms: {
      },
      vertexShader: `
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = 10.0;
                    }
            `,
      fragmentShader: `
                    varying vec3 vColor;
                    void main() {
                        gl_FragColor = vec4(vColor, 1.0);
                    }                    
            `,
    });
  }
}


class GPUPickerPanel extends Autodesk.Viewing.UI.DockingPanel {
  
  constructor(container, id, title) {
    super(container, id, title)
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title)
    this.container.classList.add("docking-panel-container-solid-color-a")
    this.adjustSize()
    this.container.style.resize = "auto"
    this.container.style.fontFamily = "Abel"
    this.div = document.createElement("div")
    this.div.style.margin = "20px"
    this.container.appendChild(this.div)
  }

  setVisible(show) {
    super.setVisible(show)
  }

  adjustSize() {
    this.container.style.top = "30px"
    this.container.style.left = "0px"
    this.container.style.width = "450px"
    this.container.style.height = "800px"
    this.container.style.overflow = "scroll"
  }

  add (text) {
    const newDiv = document.createElement("div")
    newDiv.style= `
      font-size: 16px;
    `
    newDiv.innerText = text
    this.div.appendChild(newDiv)
  }
}


Autodesk.Viewing.theExtensionManager.registerExtension('GPUPickerExtension', GPUPickerExtension);
