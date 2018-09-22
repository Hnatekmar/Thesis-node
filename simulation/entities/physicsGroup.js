
export default class PhysicsGroup {
  constructor (bodies) {
    let assert = require('assert')
    assert(bodies instanceof Array)
    this.bodies = bodies
    this.bodies.forEach((el) => {
      el.oldOrigin = el.body.position.slice(0)
    })
  }
  /**
   * moves all object by relative offset
   */
  move (offsetX, offsetY) {
    this.bodies.forEach((el) => {
      el.body.position[0] += offsetX
      el.body.position[1] += offsetY
    })
  }
  moveAbsolute (x, y) {
    this.bodies.forEach((el) => {
      el.body.position = el.oldOrigin.slice(0)
    })
    this.move(x, y)
  }
}
