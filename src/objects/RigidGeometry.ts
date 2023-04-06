import { Object3DWithGeometry } from '../types/global';
import { RigidObject } from './RigidObject';
import { rigidBodyFromObject } from './RigidObjectFactory';

export class RigidGeometry extends RigidObject {
  constructor(object: Object3DWithGeometry) {
    const rb = rigidBodyFromObject(object);
    super(object, rb);
  }
}
