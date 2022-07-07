import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class SceneManager {
  constructor(game) {
    this.game = game
    this.canvas = game.canvas

    this.makeScene()
    this.makeCamera()
    this.addLight()
    this.animate()
  }

  makeScene() {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    this.renderer.shadowMap.enabled = true
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0xdddddd)
  }

  makeCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.canvas.width / this.canvas.height, 1, 3000)
    this.camera.position.set(0, 0, 25)

    this.updateCamera()
    window.addEventListener('resize', this.updateCamera)

    this.orbitControl = new OrbitControls(this.camera, this.canvas)
    this.orbitControl.maxDistance = 50
    this.orbitControl.minDistance = 5
    this.orbitControl.enableDamping = true
    this.orbitControl.enablePan = false
  }

  updateCamera = () => {
    const widths = [window.innerWidth]
    window.screen && widths.push(window.screen.width)
    const width = Math.min(...widths)
    const heights = [window.innerHeight]
    window.screen && heights.push(window.screen.height)
    const height = Math.min(...heights)
    this.renderer.setSize(width, height, true)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  addLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(4.263356228449997, 6.924253511044325, 6.679265606906219)
    this.scene.add(light)
  }

  animate = time => {
    this.game.events.emit('beforeRerender', time)
    this.orbitControl.update()
    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.animate)
  }
}
