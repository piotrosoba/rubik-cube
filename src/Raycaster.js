import * as THREE from 'three'

export default class Raycaster extends THREE.Raycaster {
  constructor(game) {
    super()
    this.game = game
    this.canvas = game.canvas
    this.downIntersected = null

    this.canvas.addEventListener('pointerdown', evt => {
      if (evt.button !== 0 || !this.game.canPlay) return

      const x = (evt.clientX / this.canvas.clientWidth) * 2 - 1
      const y = -(evt.clientY / this.canvas.clientHeight) * 2 + 1

      const point = new THREE.Vector2(x, y)
      this.setFromCamera(point, this.game.sceneManager.camera)
      const intersectedWall = this.intersectObjects(this.game.cubeManager.walls)[0]
      const intersectedBrick = this.intersectObjects(this.game.cubeManager.bricks)[0]

      if (intersectedWall && intersectedBrick) {
        this.downIntersectedWall = intersectedWall
        this.downIntersectedBrick = intersectedBrick
        this.game.sceneManager.orbitControl.enabled = false
      } else {
        this.downIntersectedWall = null
        this.downIntersectedBrick = null
      }
    })

    this.canvas.addEventListener('pointermove', evt => {
      if (this.downIntersectedWall && this.downIntersectedBrick && this.game.canPlay) {
        const x = (evt.clientX / this.canvas.clientWidth) * 2 - 1
        const y = -(evt.clientY / this.canvas.clientHeight) * 2 + 1

        const point = new THREE.Vector2(x, y)
        this.setFromCamera(point, this.game.sceneManager.camera)
        const intersectedWall = this.intersectObjects(this.game.cubeManager.walls)[0]

        if (intersectedWall && intersectedWall.object === this.downIntersectedWall.object) {
          const distance = intersectedWall.point.distanceTo(this.downIntersectedWall.point)
          if (distance > 0.5) {
            const diff = this.downIntersectedWall.point.clone().sub(intersectedWall.point)

            let axisKey = 'x'
            if (Math.abs(diff.y) > Math.abs(diff[axisKey])) axisKey = 'y'
            if (Math.abs(diff.z) > Math.abs(diff[axisKey])) axisKey = 'z'
            const { map } = intersectedWall.object
            const mappedValues = map[axisKey]
            const axis = mappedValues[0] || axisKey
            const direction = (diff[axisKey] > 0 ? 1 : -1) * (mappedValues[1] || 1)
            this.game.cubeManager.rotateWall(this.downIntersectedBrick.object, axis, direction)
          }
        }
      }
    })

    this.canvas.addEventListener('pointerup', () => {
      this.game.sceneManager.orbitControl.enabled = true
      this.downIntersectedWall = null
      this.downIntersectedBrick = null
    })
  }
}
