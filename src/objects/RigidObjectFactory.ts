import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { warn } from '../utils/logger';

type RBOpts = {
  shape?: Ammo.btCollisionShape;
};

export function rigidBodyFromObject(object: THREE.Object3D, opts: RBOpts = {}): Ammo.btRigidBody {
  const geometry = (object as any).geometry as THREE.BufferGeometry;

  if (!geometry && !opts.shape) {
    warn('Cannot create a btRigidBody without geometry or shape');
    return undefined;
  }

  const shape = opts.shape || buildShapeFrom(geometry);
  if (!shape) return undefined;

  const mass = 1;
  const localIntertia = new Ammo.btVector3();
  shape.calculateLocalInertia(mass, localIntertia);

  const pos = object.getWorldPosition(new THREE.Vector3());
  const quat = object.getWorldQuaternion(new THREE.Quaternion());
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

  const motionState = new Ammo.btDefaultMotionState(transform);
  const bodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localIntertia);
  const rb = new Ammo.btRigidBody(bodyInfo);

  return rb;
}

function createCustomShapeFrom(geometry: THREE.BufferGeometry): Ammo.btBvhTriangleMeshShape {
  // create a new triangle mesh
  const triangleMesh = new Ammo.btTriangleMesh();

  // extract the positions from the buffer geometry
  const positions = (geometry.getAttribute('position') as THREE.BufferAttribute).array;

  // extract the indices from the buffer geometry, if any
  const indexAttribute = geometry.getIndex();
  const indices = indexAttribute?.array;
  const indexCount = indexAttribute?.count || positions.length;

  // add each face to the triangle mesh
  let index = 0;
  for (let i = 0; i < indexCount; i += 3) {
    const index0 = indexAttribute ? indices[i] : index++;
    const index1 = indexAttribute ? indices[i + 1] : index++;
    const index2 = indexAttribute ? indices[i + 2] : index++;

    const v0 = new Ammo.btVector3(positions[index0 * 3], positions[index0 * 3 + 1], positions[index0 * 3 + 2]);
    const v1 = new Ammo.btVector3(positions[index1 * 3], positions[index1 * 3 + 1], positions[index1 * 3 + 2]);
    const v2 = new Ammo.btVector3(positions[index2 * 3], positions[index2 * 3 + 1], positions[index2 * 3 + 2]);

    triangleMesh.addTriangle(v0, v1, v2);
  }

  // create a new btBvhTriangleMeshShape using the triangle mesh
  const shape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true, true);

  return shape;
}

function buildShapeFrom(geometry: THREE.BufferGeometry): Ammo.btCollisionShape {
  if (geometry.type == 'BoxGeometry') {
    const boxGeom = geometry as THREE.BoxGeometry;
    const { width, height, depth } = boxGeom.parameters;
    const halfExtents = new Ammo.btVector3(width / 2, height / 2, depth / 2);
    return new Ammo.btBoxShape(halfExtents);
  } else {
    // Create a custom shape
    return createCustomShapeFrom(geometry);
  }
}
