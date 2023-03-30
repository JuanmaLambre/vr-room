import * as THREE from 'three';
import { RigidGeometry } from './RigidGeometry';

export class DebugBoxObject extends RigidGeometry {
  constructor() {
    const boxGeom = new THREE.BoxGeometry(1, 2, 1);
    const object = new THREE.Mesh(boxGeom, new THREE.MeshPhongMaterial({ color: 0xaa0000 }));
    object.position.set(0, 5, -2);
    object.quaternion.set(0, 0, 0.5, 1);
    object.name = 'rigid box';

    super(object);

    this.populateHighlightMats();
    this.hitSurface = this.object;
  }
}
