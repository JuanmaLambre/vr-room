import Ammo from 'ammojs-typed';
import { RigidObject } from './RigidObject';
import { rigidBodyFromObject } from './RigidObjectFactory';

export class HandControllerObject extends RigidObject {
  constructor(obj: THREE.Object3D) {
    const shape = new Ammo.btSphereShape(0.1);
    const rb = rigidBodyFromObject(obj, { shape });

    super(obj, rb);

    this.setMass(0);
  }

  update() {
    // The hand controller logic is different than other objects: the position of the rigid body
    // depends on the position of the mesh

    this.sync();
  }
}
