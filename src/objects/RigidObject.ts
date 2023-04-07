import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { VRObject } from './VRObject';
import { SceneManager } from '../SceneManager';
import { Clock } from '../utils/Clock';

export class RigidObject extends VRObject {
  rigidBody: Ammo.btRigidBody;

  private syncOnUpdate: boolean = false;
  private deltaPosition: THREE.Vector3 = new THREE.Vector3();

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
    const oldPosition = this.getRBPosition();

    // Update rigid body position and rotation
    const newPosition = this.object.getWorldPosition(new THREE.Vector3());
    this.setRBPosition(newPosition);
    const newQuaternion = this.object.getWorldQuaternion(new THREE.Quaternion());
    this.setRBQuaternion(newQuaternion);

    // Calculate delta
    this.deltaPosition.copy(newPosition).sub(oldPosition).divideScalar(Clock.delta);
  }

  /** Updates the THREE object to the position and rotation of the Ammo rigid body */
  update() {
    if (this.syncOnUpdate) {
      this.sync();
      return;
    }

    const position = this.getRBPosition();
    this.object.position.copy(position);
    const quaternion = this.getRBQuaternion();
    this.object.quaternion.copy(quaternion);
  }

  /** Returns in world coordinates */
  private getRBPosition(): THREE.Vector3 {
    const btTransform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(btTransform);
    const pos = btTransform.getOrigin();
    return new THREE.Vector3(pos.x(), pos.y(), pos.z());
  }

  private setRBPosition(position: THREE.Vector3) {
    const transform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(transform);
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    this.rigidBody.setWorldTransform(transform);
    this.rigidBody.getMotionState().setWorldTransform(transform);
  }

  /** Returns world quaternion */
  private getRBQuaternion(): THREE.Quaternion {
    const btTransform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(btTransform);
    const quat = new Ammo.btQuaternion(0, 0, 0, 0);
    btTransform.getBasis().getRotation(quat);
    return new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
  }

  private setRBQuaternion(quat: THREE.Quaternion) {
    const transform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(transform);
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    this.rigidBody.getMotionState().setWorldTransform(transform);
  }
}
