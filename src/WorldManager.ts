import Ammo from 'ammojs-typed';
import { RigidObject } from './objects/RigidObject';
import { Clock } from './utils/Clock';

/**
 * Wrapper for btDiscreteDynamicsWorld
 */
export class WorldManager {
  rigidObjects: { object: RigidObject; enabled: boolean }[] = [];

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
    this.rigidObjects.push({ object: ro, enabled: true });
  }

  remove(ro: RigidObject) {
    this.dynamicsWorld.removeRigidBody(ro.rigidBody);
    const idx = this.rigidObjects.findIndex(({ object }) => object == ro);
    if (idx >= 0) this.rigidObjects.splice(idx, 1);
  }

  disable(ro: RigidObject) {
    this.dynamicsWorld.removeRigidBody(ro.rigidBody);
  }

  enable(ro: RigidObject) {
    this.dynamicsWorld.addRigidBody(ro.rigidBody);
  }

  update() {
    this.dynamicsWorld.stepSimulation(Clock.delta, 10);

    const updating = this.rigidObjects.filter(({ enabled }) => enabled);
    updating.forEach((entry) => entry.object.update());
  }
}
