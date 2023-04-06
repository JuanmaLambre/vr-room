import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { VRObject } from './VRObject';
import { SceneManager } from '../SceneManager';

export class RigidObject extends VRObject {
  rigidBody: Ammo.btRigidBody;

  private syncOnUpdate: boolean = false;

  constructor(obj: THREE.Object3D, rb: Ammo.btRigidBody) {
    super(obj);
    this.rigidBody = rb;
  }

  /** World position */
  get rbPosition() {
    const transform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(transform);
    const position = transform.getOrigin();
    return new THREE.Vector3(position.x(), position.y(), position.z());
  }

  setMass(mass: number) {
    this.rigidBody.setMassProps(mass, new Ammo.btVector3());
  }

  onGrabbed(): void {
    this.disablePhysics();
    this.syncOnUpdate = true;
  }

  onDropped(): void {
    this.enablePhysics();
    this.syncOnUpdate = false;
  }

  disablePhysics() {
    SceneManager.instance.world.disable(this);
    this.rigidBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
    this.rigidBody.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
  }

  enablePhysics() {
    SceneManager.instance.world.enable(this);
    this.rigidBody.activate();
  }

  /** Updates the Ammo rigid body to the position and rotation of the THREE object */
  sync() {
    const position = this.object.getWorldPosition(new THREE.Vector3());
    const quat = this.object.getWorldQuaternion(new THREE.Quaternion());

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

    this.rigidBody.setWorldTransform(transform);
    this.rigidBody.getMotionState().setWorldTransform(transform);
  }

  /** Updates the THREE object to the position and rotation of the Ammo rigid body */
  update() {
    if (this.syncOnUpdate) {
      this.sync();
      return;
    }

    const btTransform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(btTransform);

    const position = btTransform.getOrigin();
    this.object.position.set(position.x(), position.y(), position.z());

    const btQuat = new Ammo.btQuaternion(0, 0, 0, 0);
    btTransform.getBasis().getRotation(btQuat);
    const quaternion = new THREE.Quaternion(btQuat.x(), btQuat.y(), btQuat.z(), btQuat.w());
    this.object.setRotationFromQuaternion(quaternion);
  }
}
