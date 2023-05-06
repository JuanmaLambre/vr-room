import Ammo from 'ammojs-typed';
import { RigidObject } from './objects/RigidObject';
import { Clock } from './utils/Clock';

type RigidObjectEntry = {
  ro: RigidObject;
  inWorld: boolean;
};

/**
 * Wrapper for btDiscreteDynamicsWorld
 */
export class WorldManager {
  rigidObjects: RigidObjectEntry[] = [];

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
    const entry = this.getEntry(ro);

    if (!entry) {
      this.rigidObjects.push({ ro, inWorld: true });
      this.dynamicsWorld.addRigidBody(ro.rigidBody);
    } else if (!entry.inWorld) {
      this.dynamicsWorld.addRigidBody(ro.rigidBody);
    }
  }

  remove(ro: RigidObject) {
    const entry = this.getEntry(ro);

    if (entry) {
      const idx = this.rigidObjects.indexOf(entry);
      this.rigidObjects.splice(idx, 1);
      if (entry.inWorld) this.dynamicsWorld.removeRigidBody(ro.rigidBody);
    }
  }

  disable(ro: RigidObject) {
    const entry = this.getEntry(ro);
    if (!entry || !entry.inWorld) return;

    this.dynamicsWorld.removeRigidBody(ro.rigidBody);
  }

  enable(ro: RigidObject) {
    const entry = this.getEntry(ro);
    if (entry && entry.inWorld) return;

    if (!entry) this.add(ro);
    else this.dynamicsWorld.addRigidBody(ro.rigidBody);
  }

  update() {
    this.dynamicsWorld.stepSimulation(Clock.delta, 10);
    this.rigidObjects.forEach((entry) => entry.ro.update());
  }

  private getEntry(ro: RigidObject): RigidObjectEntry {
    return this.rigidObjects.find((entry) => entry.ro == ro);
  }
}
