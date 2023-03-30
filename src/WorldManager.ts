import Ammo from 'ammojs-typed';
import { RigidObject } from './objects/RigidObject';
import { Clock } from './utils/Clock';

export class WorldManager {
  private rigidObjects: RigidObject[] = [];
  private dynamicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor() {
    // Create dynamics world
    const collisionConfig = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfig);
    this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -5, 0));
  }

  add(ro: RigidObject) {
    this.dynamicsWorld.addRigidBody(ro.rigidBody);
    this.rigidObjects.push(ro);
  }

  update() {
    this.dynamicsWorld.stepSimulation(Clock.delta, 10);

    this.rigidObjects.forEach((ro) => ro.update());
  }
}
