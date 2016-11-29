
import {vec2} from 'gl-matrix'
import Stats from 'stats-js'

export default class BioCrowds {
  constructor(scene) {
    this.shouldRun = false
    this.agents = []
    this.scene = scene
    this.stats = new Stats()
  }

  start() {
    this.shouldRun = true
    this.tick()
  }

  stop() {
    this.shouldRun = false
  }

  restart() {

  }

  tick() {
    if (this.shouldRun) {
      this.stats.begin()
      for (let i = 0; i < this.agents.length; ++i) {
        vec2.scaleAndAdd(this.agents[i].position, this.agents[i].position, this.agents[i].velocity, 0.1)
        this.agents[i].updateMesh()
      }
      
      this.scene.render()
      this.stats.end()
      requestAnimationFrame(this.tick.bind(this))
    }
  }

  addAgent(agent) {
    this.agents.push(agent)
    this.scene.scene.add(agent.mesh)
  }
}