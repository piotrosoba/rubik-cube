import * as THREE from 'three'
import getRandomArrayValue from './utils/getRandomArrayValue'

const SOLVE_ANIMATION_SPEED = 350
const ROTATE_WALL_SPEED = 150
const RANDOMIZE_MOVES = 30

export default class CubeManager {
  constructor(game) {
    this.game = game
    this.box = null
    this.bricks = []
    this.walls = []

    this.makeCube()
  }

  AXIS_TO_ROTATE = { x: 'y', y: 'x', z: 'z' }
  wallColors = {
    top: new THREE.MeshBasicMaterial({ color: 0x719382 }),
    bottom: new THREE.MeshBasicMaterial({ color: 0xaebb8f }),
    left: new THREE.MeshBasicMaterial({ color: 0xdc9770 }),
    right: new THREE.MeshBasicMaterial({ color: 0xcc7161 }),
    front: new THREE.MeshBasicMaterial({ color: 0x894c4a }),
    back: new THREE.MeshBasicMaterial({ color: 0xebd79c }),
    default: new THREE.MeshBasicMaterial({ color: 0x524744 })
  }
  getWallColor = wall => this.wallColors[wall] || this.wallColors.default

  makeCube() {
    this.makeWalls()
    this.makeBricks()
  }

  makeBrick(wallKeys) {
    const material = [
      this.getWallColor(wallKeys.includes('right') && 'right'),
      this.getWallColor(wallKeys.includes('left') && 'left'),
      this.getWallColor(wallKeys.includes('top') && 'top'),
      this.getWallColor(wallKeys.includes('bottom') && 'bottom'),
      this.getWallColor(wallKeys.includes('front') && 'front'),
      this.getWallColor(wallKeys.includes('back') && 'back')
    ]

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const cube = new THREE.Mesh(geometry, material)
    this.game.sceneManager.scene.add(cube)
    return cube
  }

  makeBricks() {
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        for (let z = -1; z < 2; z++) {
          const wallKeys = []
          if (x === -1) {
            wallKeys.push('left')
          }
          if (x === 1) {
            wallKeys.push('right')
          }
          if (y === -1) {
            wallKeys.push('bottom')
          }
          if (y === 1) {
            wallKeys.push('top')
          }
          if (z === -1) {
            wallKeys.push('back')
          }
          if (z === 1) {
            wallKeys.push('front')
          }
          const brick = this.makeBrick(wallKeys)
          brick.data = new THREE.Vector3(x, y, z)
          brick.initialData = brick.data.clone()
          brick.currentRotation = new THREE.Euler()
          this.bricks.push(brick)
          const multiply = 1.075
          brick.geometry.translate(x * multiply, y * multiply, z * multiply)
        }
      }
    }
  }

  makeWalls() {
    const size = 3
    const halfPI = Math.PI / 2

    const data = [
      { key: 'right', rotation: new THREE.Euler(0, halfPI, 0), map: { x: [], y: ['z', -1], z: ['x', 1] } },
      { key: 'left', rotation: new THREE.Euler(0, -halfPI, 0), map: { x: [], y: ['z', 1], z: ['x', -1] } },
      { key: 'top', rotation: new THREE.Euler(-halfPI, 0, 0), map: { x: ['z', 1], y: [], z: ['y', -1] } },
      { key: 'bottom', rotation: new THREE.Euler(halfPI, 0, 0), map: { x: ['z', -1], y: [], z: ['y', 1] } },
      { key: 'front', rotation: new THREE.Euler(0, 0, 0), map: { x: ['x', -1], y: [], z: [] } },
      { key: 'back', rotation: new THREE.Euler(Math.PI, 0, 0), map: { x: [], y: ['y', -1], z: ['z', -1] } }
    ]

    const geometry = new THREE.PlaneGeometry(size, size)
    const material = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 })
    data.forEach(({ key, rotation, map }) => {
      const wall = new THREE.Mesh(geometry, material)
      wall.map = map
      wall.key = key
      wall.rotation.copy(rotation)
      this.walls.push(wall)
      this.game.sceneManager.scene.add(wall)
    })
  }

  rotateWall(brick, axis, direction) {
    this.game.setCanPlay(false)
    const halfPI = Math.PI / 2
    const axisToRotate = this.AXIS_TO_ROTATE[axis]
    const axisVector = new THREE.Vector3()
    axisVector[axisToRotate] = 1
    const quaternion = new THREE.Quaternion()
    quaternion.setFromAxisAngle(axisVector, direction * halfPI)

    const bricksToRotate = this.bricks.filter(b => {
      if (b.data && brick.data[axisToRotate] === b.data[axisToRotate]) {
        b.targetQuaternion = b.quaternion.clone().premultiply(quaternion)
        b.data.applyQuaternion(quaternion)
        b.data.x = Math.round(b.data.x)
        b.data.y = Math.round(b.data.y)
        b.data.z = Math.round(b.data.z)
        return true
      }
      return false
    })

    const onTick = (ratio, ratioDiff) => {
      if (ratio === 1) {
        bricksToRotate.forEach(brick => brick.quaternion.copy(brick.targetQuaternion))
        this.game.setCanPlay(true)
        this.game.events.emit('wallRotated')
      } else {
        bricksToRotate.forEach(brick => brick.quaternion.rotateTowards(brick.targetQuaternion, ratioDiff * halfPI))
      }
    }

    this.game.makeTransition(onTick, ROTATE_WALL_SPEED)
  }

  solve = () => {
    if (!this.game.canPlay) return
    this.game.setCanPlay(false)
    this.explodeAnimation()
      .then(this.implodeAnimation)
      .then(() => {
        this.game.setCanPlay(true)
        this.bricks.forEach(brick => {
          brick.data.copy(brick.initialData)
        })
      })
  }

  explodeAnimation = () => {
    return new Promise(resolve => {
      const onTick = ratio => {
        this.bricks.forEach(brick => brick.position.copy(brick.data).multiplyScalar(ratio * 8))
        ratio === 1 && setTimeout(resolve, SOLVE_ANIMATION_SPEED)
      }

      this.game.makeTransition(onTick, SOLVE_ANIMATION_SPEED)
    })
  }

  implodeAnimation = () => {
    return new Promise(resolve => {
      const quaternion = new THREE.Quaternion()
      this.bricks.forEach(brick => {
        brick.angleToStartRotation = brick.quaternion.angleTo(quaternion)
      })

      const onTick = (ratio, ratioDiff) => {
        if (ratio === 1) {
          this.bricks.forEach(brick => {
            brick.position.set(0, 0, 0)
            brick.quaternion.copy(quaternion)
            delete brick.angleToStartRotation
          })
          resolve(true)
        } else {
          const ratioInv = 1 - ratio
          this.bricks.forEach(brick => {
            brick.position.copy(brick.data).multiplyScalar(ratioInv * 8)
            brick.quaternion.rotateTowards(quaternion, ratioDiff * brick.angleToStartRotation)
          })
        }
      }
      this.game.makeTransition(onTick, SOLVE_ANIMATION_SPEED)
    })
  }

  randomize = () => {
    if (!this.game.canPlay) return
    let appliedMoves = 0
    let lastAxis = null

    const randomRotate = () => {
      this.game.setCanPlay(false)
      const brick = getRandomArrayValue(this.bricks)
      const axis = getRandomArrayValue(['x', 'y', 'z'].filter(el => el !== lastAxis))
      lastAxis = axis
      const direction = getRandomArrayValue([-1, 1])
      this.rotateWall(brick, axis, direction)

      appliedMoves += 1
      if (appliedMoves < RANDOMIZE_MOVES) {
        this.game.events.once('wallRotated', randomRotate)
      }
    }
    randomRotate()
  }
}
