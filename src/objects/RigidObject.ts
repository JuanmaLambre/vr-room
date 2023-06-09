import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { VRObject } from './VRObject';
import { SceneManager } from '../SceneManager';
import { Clock } from '../utils/Clock';

const ROTATION_INERTIA_FACTOR = 0.5;

export class RigidObject extends VRObject {
  rigidBody: Ammo.btRigidBody;

  private syncOnUpdate: boolean = false;
  private deltaPosition: THREE.Vector3 = new THREE.Vector3();
  private deltaQuaternion: THREE.Quaternion = new THREE.Quaternion();

  constructor(obj: THREE.Object3D, rb: Ammo.btRigidBody) {
    super(obj);
    this.rigidBody = rb;
  }

  setPosition(localPos: THREE.Vector3) {
    this.object.position.copy(localPos);
    const worldPos = this.object.getWorldPosition(new THREE.Vector3());
    this.setRBPosition(worldPos);
  }

  setWorldPosition(pos: THREE.Vector3): void {
    super.setWorldPosition(pos);
    this.setRBPosition(pos);
    this.rigidBody.activate();
  }

  setRotation(localEuler: THREE.Euler) {
    const localQuat = new THREE.Quaternion().setFromEuler(localEuler);
    this.setQuaternion(localQuat);
  }

  setQuaternion(localQuat: THREE.Quaternion) {
    this.object.quaternion.copy(localQuat);
    const worldQuat = this.object.getWorldQuaternion(new THREE.Quaternion());
    this.setRBQuaternion(worldQuat);
  }

  setMass(mass: number) {
    this.rigidBody.setMassProps(mass, new Ammo.btVector3());
  }

  onGrabbed(): void {
    super.onGrabbed();

    this.disablePhysics();
    this.syncOnUpdate = true;
  }

  onDropped(): void {
    super.onDropped();

    this.syncOnUpdate = false;
    this.enablePhysics();

    // Apply position intertia
    var { x, y, z } = this.deltaPosition;
    const impulse = new Ammo.btVector3(x, y, z).op_mul(1 / Clock.delta);
    this.rigidBody.applyCentralImpulse(impulse);

    // Apply rotation intertia
    const rotation = new THREE.Euler().setFromQuaternion(this.deltaQuaternion.clone().invert());
    var { x, y, z } = rotation;
    const torque = new Ammo.btVector3(x, y, z).op_mul(ROTATION_INERTIA_FACTOR);
    this.rigidBody.applyTorqueImpulse(torque);
  }

  disablePhysics() {
    SceneManager.instance.disablePhysics(this);
    this.rigidBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
    this.rigidBody.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
  }

  enablePhysics() {
    SceneManager.instance.enablePhysics(this);
    this.rigidBody.activate();
  }

  /** Updates the Ammo rigid body to the position and rotation of the THREE object */
  sync() {
    const oldPosition = this.getRBPosition();
    const oldQuaternion = this.getRBQuaternion();

    // Update rigid body position and rotation
    const newPosition = this.object.getWorldPosition(new THREE.Vector3());
    this.setRBPosition(newPosition);
    const newQuaternion = this.object.getWorldQuaternion(new THREE.Quaternion());
    this.setRBQuaternion(newQuaternion);

    // Calculate deltas
    this.deltaPosition.copy(newPosition).sub(oldPosition);
    this.deltaQuaternion.copy(oldQuaternion).multiply(newQuaternion.clone().invert());
  }

  /** Updates the THREE object to the position and rotation of the Ammo rigid body */
  update() {
    if (this.syncOnUpdate) {
      this.sync();
      return;
    }

    const worldPosition = this.getRBPosition();
    const localPosition = this.object.parent.worldToLocal(worldPosition);
    this.object.position.copy(localPosition);

    const worldQuat = this.getRBQuaternion();
    this.object.quaternion.copy(worldQuat);
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
    const quat = btTransform.getRotation();
    return new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
  }

  private setRBQuaternion(quat: THREE.Quaternion) {
    const transform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(transform);
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    this.rigidBody.setWorldTransform(transform);
    this.rigidBody.getMotionState().setWorldTransform(transform);
  }
}
