import * as THREE from 'three';
import Ammo from 'ammojs-typed';

const HIGHLIGHT_EMISSIVE = new THREE.Color(0x00aa00);

export class RigidObject {
  object: THREE.Object3D;
  rigidBody: Ammo.btRigidBody;
  hitSurface: THREE.BufferGeometry;

  callUpdate: boolean = true;

  protected highlightMaterials: THREE.MeshStandardMaterial[] = [];

  /** World position */
  get rbPosition() {
    const transform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(transform);
    const position = transform.getOrigin();
    return new THREE.Vector3(position.x(), position.y(), position.z());
  }

  highlight(value = true) {
    this.highlightMaterials.forEach((mat) => {
      const emissive = value ? HIGHLIGHT_EMISSIVE : mat.userData.originalEmissive;
      mat.emissive = emissive;
    });
  }

  setMass(mass: number) {
    this.rigidBody.setMassProps(mass, new Ammo.btVector3());
  }

  /** Updates the Ammo rigid body to the position and rotation of the THREE object */
  sync() {
    const position = this.object.getWorldPosition(new THREE.Vector3());

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    // transform.setRotation()

    this.rigidBody.setWorldTransform(transform);
    this.rigidBody.getMotionState().setWorldTransform(transform);
  }

  /** Updates the THREE object to the position and rotation of the Ammo rigid body */
  update() {
    if (!this.callUpdate) return;

    const btTransform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(btTransform);

    const position = btTransform.getOrigin();
    this.object.position.set(position.x(), position.y(), position.z());

    const btQuat = new Ammo.btQuaternion(0, 0, 0, 0);
    btTransform.getBasis().getRotation(btQuat);
    const quaternion = new THREE.Quaternion(btQuat.x(), btQuat.y(), btQuat.z(), btQuat.w());
    this.object.setRotationFromQuaternion(quaternion);
  }

  protected populateHighlightMats() {
    if (!this.object) return;

    this.object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry && mesh.material) {
        let materials = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        if (!Array.isArray(materials)) materials = [materials];

        materials.forEach((mat) => {
          mat.userData.originalEmissive = mat.emissive;
          this.highlightMaterials.push(mat);
        });
      }
    });
  }
}
