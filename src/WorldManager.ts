import Ammo from 'ammojs-typed';
import { RigidObject } from './objects/RigidObject';
import { Clock } from './utils/Clock';

/**
 * Wrapper for btDiscreteDynamicsWorld
 */
export class WorldManager {
  rigidObjects: RigidObject[] = [];

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
    if (this.rigidObjects.indexOf(ro) < 0) this.rigidObjects.push(ro);
  }

  remove(ro: RigidObject) {
    this.dynamicsWorld.removeRigidBody(ro.rigidBody);
    const idx = this.rigidObjects.indexOf(ro);
    if (idx >= 0) this.rigidObjects.splice(idx, 1);
  }

  disable(ro: RigidObject) {
    this.remove(ro);
    return;
  }

  enable(ro: RigidObject) {
    this.add(ro);
    return;
  }

  update() {
    this.dynamicsWorld.stepSimulation(Clock.delta, 10);
    this.rigidObjects.forEach((ro) => ro.update());
  }
}
