import Ammo from 'ammojs-typed';
import { RigidObject } from './RigidObject';
import { rigidBodyFromObject } from './RigidObjectFactory';

export class HandControllerObject extends RigidObject {
  constructor(obj: THREE.Object3D) {
    super();
    this.object = obj;

    const shape = new Ammo.btSphereShape(0.1);
    this.rigidBody = rigidBodyFromObject(obj, { shape });
    this.setMass(0);
  }

  update() {
    // The hand controller logic is different than other objects: the position of the rigid body
    // depends on the position of the mesh

    this.sync();
  }
}
