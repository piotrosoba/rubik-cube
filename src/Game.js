import EventEmitter from 'eventemitter3'
import SceneManager from './SceneManager'
import CubeManager from './CubeManager'
import Raycaster from './Raycaster'

export default class Game {
  constructor(canvas) {
    window.game = this
    this.canPlay = true
    this.events = new EventEmitter()
    this.canvas = canvas
    this.sceneManager = new SceneManager(this)
    this.cubeManager = new CubeManager(this)
    this.raycaster = new Raycaster(this)

    this.setButtonsListeners()
  }

  setCanPlay(bool) {
    this.canPlay = bool
  }

  setButtonsListeners() {
    const solveButton = document.getElementById('solve')
    const randomButton = document.getElementById('random')

    solveButton.addEventListener('click', this.cubeManager.solve)
    randomButton.addEventListener('click', this.cubeManager.randomize)
  }

  makeTransition(onTick, transitionTime = 1000) {
    let lastTime
    let totalTime = 0

    const onBeforeRerender = time => {
      if (!lastTime) {
        lastTime = time
        return
      }

      const timeDiff = time - lastTime
      lastTime = time
      totalTime += timeDiff

      const ratio = Math.min(1, totalTime / transitionTime)
      const ratioDiff = timeDiff / transitionTime

      onTick(ratio, ratioDiff)
      if (ratio === 1) this.events.off('beforeRerender', onBeforeRerender)
    }

    this.events.on('beforeRerender', onBeforeRerender)
  }
}
