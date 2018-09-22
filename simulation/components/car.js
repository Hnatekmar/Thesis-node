import * as CES from 'ces'

/*
 * Component that represents car
 */
export default CES.Component.extend({
  name: 'car',
  force: 0.0,
  init: function (chassis, genome, car, frontWheel, backWheel) {
    this.genome = genome
    this.chassis = chassis
    this.car = car
    this.fitness = 0
    this.frontWheel = frontWheel
    this.backWheel = backWheel
  },
  getAngle: function (wheel, angle) {
    if (angle < wheel.angleFrom) angle = wheel.angleFrom
    if (angle > wheel.angleTo) angle = wheel.angleTo
    return angle
  },
  steer: function (angle) {
    this.wheels.forEach((wheel) => {
      wheel.angle = this.getAngle(wheel, angle)
    })
  }
})
