import PhysicsGroup from './physicsGroup'

export default function (x, y, world, walls) {
  let wallPhysicsComponent = walls.map((wall) => wall.getComponent('physics'))
  return new PhysicsGroup(wallPhysicsComponent)
}
