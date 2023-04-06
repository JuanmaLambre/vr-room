import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { info } from '../utils/logger';
import { RigidGeometry } from './RigidGeometry';

export class DebugBoxObject extends RigidGeometry {
  static readonly SHOW_RBCORNERS = true;

  private corners: THREE.Group = new THREE.Group();

  constructor() {
    const boxGeom = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const object = new THREE.Mesh(boxGeom, new THREE.MeshPhongMaterial({ color: 0xaa0000 }));
    object.position.set(0, 5, -2);
    object.quaternion.set(0, 0, 0.5, 1);
    object.name = 'rigid box';

    super(object);

    const { width, height, depth } = this;
    object.add(new THREE.AxesHelper(Math.max(width, height, depth) / 1.7));
    object.add(this.corners);

    this.populateHighlightMats();
    this.hitSurface = new THREE.Mesh(boxGeom);
    this.hitSurface.name = 'hitSurface';
    this.hitSurface.visible = false;
    this.object.add(this.hitSurface);

    (window as any).box = this;
    if (DebugBoxObject.SHOW_RBCORNERS) this.showRBCorners();
  }

  get width() {
    return ((this.object as THREE.Mesh).geometry as THREE.BoxGeometry).parameters.width;
  }

  get height() {
    return ((this.object as THREE.Mesh).geometry as THREE.BoxGeometry).parameters.height;
  }

  get depth() {
    return ((this.object as THREE.Mesh).geometry as THREE.BoxGeometry).parameters.depth;
  }

  update() {
    super.update();

    const positions = this.getRBCorners();
    this.corners.children.forEach((child, idx) => {
      this.corners.worldToLocal(positions[idx]);
      child.position.copy(positions[idx]);
    });
  }

  debugPrint() {
    const stringify = (v: THREE.Vector3) => `(${v.x}, ${v.y}, ${v.z})`;

    // Mesh info
    const meshCorners = this.getMeshCorners();
    info(`Mesh corners:\n${meshCorners.map(stringify).join('\n')}\n`);

    // Rigid body info
    const rbCorners = this.getRBCorners();
    info(`RB corners:\n${rbCorners.map(stringify).join('\n')}\n`);

    const diffs = meshCorners.map((meshCorner, idx) => {
      const rbCorner = rbCorners[idx];
      return stringify(meshCorner.clone().sub(rbCorner));
    });
    info(`Diffs:\n${diffs.join('\n')}`);
  }

  private getMeshCorners() {
    const { width, height, depth } = this;
    const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(this.object.quaternion).multiplyScalar(width / 2);
    const yAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(this.object.quaternion).multiplyScalar(height / 2);
    const zAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(this.object.quaternion).multiplyScalar(depth / 2);

    const meshPos = this.object.position;
    const corner000 = this.object.parent.localToWorld(meshPos.clone().add(xAxis).add(yAxis).add(zAxis));
    const corner001 = this.object.parent.localToWorld(meshPos.clone().add(xAxis).add(yAxis).sub(zAxis));
    const corner010 = this.object.parent.localToWorld(meshPos.clone().add(xAxis).sub(yAxis).add(zAxis));
    const corner011 = this.object.parent.localToWorld(meshPos.clone().add(xAxis).sub(yAxis).sub(zAxis));
    const corner100 = this.object.parent.localToWorld(meshPos.clone().sub(xAxis).add(yAxis).add(zAxis));
    const corner101 = this.object.parent.localToWorld(meshPos.clone().sub(xAxis).add(yAxis).sub(zAxis));
    const corner110 = this.object.parent.localToWorld(meshPos.clone().sub(xAxis).sub(yAxis).add(zAxis));
    const corner111 = this.object.parent.localToWorld(meshPos.clone().sub(xAxis).sub(yAxis).sub(zAxis));
    return [corner000, corner001, corner010, corner011, corner100, corner101, corner110, corner111];
  }

  private getRBCorners() {
    const { width, height, depth } = this;

    const btTransform = new Ammo.btTransform();
    this.rigidBody.getMotionState().getWorldTransform(btTransform);
    const btPos = btTransform.getOrigin();
    const rbPos = new THREE.Vector3(btPos.x(), btPos.y(), btPos.z());

    const btQuat = new Ammo.btQuaternion(0, 0, 0, 0);
    btTransform.getBasis().getRotation(btQuat);
    const rbQuat = new THREE.Quaternion(btQuat.x(), btQuat.y(), btQuat.z(), btQuat.w());

    const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(rbQuat).multiplyScalar(width / 2);
    const yAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(rbQuat).multiplyScalar(height / 2);
    const zAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(rbQuat).multiplyScalar(depth / 2);

    const corner000 = rbPos.clone().add(xAxis).add(yAxis).add(zAxis);
    const corner001 = rbPos.clone().add(xAxis).add(yAxis).sub(zAxis);
    const corner010 = rbPos.clone().add(xAxis).sub(yAxis).add(zAxis);
    const corner011 = rbPos.clone().add(xAxis).sub(yAxis).sub(zAxis);
    const corner100 = rbPos.clone().sub(xAxis).add(yAxis).add(zAxis);
    const corner101 = rbPos.clone().sub(xAxis).add(yAxis).sub(zAxis);
    const corner110 = rbPos.clone().sub(xAxis).sub(yAxis).add(zAxis);
    const corner111 = rbPos.clone().sub(xAxis).sub(yAxis).sub(zAxis);
    return [corner000, corner001, corner010, corner011, corner100, corner101, corner110, corner111];
  }

  private showRBCorners() {
    this.corners.clear();
    const cornerPoints = this.getRBCorners();
    cornerPoints.forEach((corner) => {
      const geom = new THREE.SphereGeometry(0.02);
      const mat = new THREE.MeshBasicMaterial({ color: 0x880088 });
      const ball = new THREE.Mesh(geom, mat);
      this.corners.worldToLocal(corner);
      ball.position.copy(corner);
      this.corners.add(ball);
    });
  }
}
