import * as CES from 'ces'
import * as p2 from 'p2'

export default CES.System.extend({
  addedToWorld: function (world) {
    this._super(world)

    this.p2World = new p2.World({
      gravity: [0, 0]
    })

    world.entityAdded('physics').add((entity) => {
      let physicsComponent = entity.getComponent('physics')
      physicsComponent.world = this.p2World
      this.p2World.addBody(physicsComponent.body)
    })
    world.entityRemoved('physics').add(
      (entity) => {
        this.p2World.removeBody(entity.getComponent('physics').body)
      })
  },
  update: function (dt) {
    this.p2World.step(1 / 30.0, dt, 20)
  }
})
