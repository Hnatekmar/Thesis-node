import * as CES from 'ces'
import PhysicsComponent from '../components/physics.js'
import * as p2 from 'p2'

export default function (x, y, w, h, world) {
  const entity = new CES.Entity()
  let body = new p2.Body({
    mass: 0,
    position: [x, y]
  })
  body.addShape(new p2.Box(
    {
      width: w,
      height: h
    }))
  entity.addComponent(new PhysicsComponent(
    body
    // Matter.Bodies.rectangle(x, y, w, h, {
    //   isStatic: true
    // })
  ))
  world.addEntity(entity)
  return entity
}
