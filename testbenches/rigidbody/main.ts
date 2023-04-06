import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Clock } from '../../src/utils/Clock';
import { ACTIVE_TAG, DISABLE_SIMULATION } from '../../src/types/AmmoConstants';

(window as any).THREE = THREE;
(window as any).Ammo = Ammo;

type RO = { object?: THREE.Object3D; rb?: Ammo.btRigidBody };

const width = 1,
  height = 0.5,
  depth = 0.7;

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;

let dynamicsWorld: Ammo.btDiscreteDynamicsWorld;
const ground: RO = {};
const box: RO = {};

function createRB(opts: { shape: any; position?: THREE.Vector3; quaternion?: THREE.Quaternion }): any {
  const mass = 1;
  const localIntertia = new Ammo.btVector3();
  opts.shape.calculateLocalInertia(mass, localIntertia);

  const pos = opts.position || new THREE.Vector3();
  const quat = opts.quaternion || new THREE.Quaternion();
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

  const motionState = new Ammo.btDefaultMotionState(transform);
  const bodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, opts.shape, localIntertia);
  return new Ammo.btRigidBody(bodyInfo);
}

function setupRenderer() {
  // Make a renderer that fills the screen
  renderer = new THREE.WebGLRenderer({ antialias: true });
  (window as any).renderer = renderer;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.1;
}

async function setupAmmo() {
  await Ammo(Ammo);

  // Build dynamic world
  const collisionConfig = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();
  dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfig);
  (window as any).dynamicsWorld = dynamicsWorld;
  dynamicsWorld.setGravity(new Ammo.btVector3(0, -5, 0));

  // Ground plane
  const groundShape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(0, 1, 0), 0);
  const groundTransform = new Ammo.btTransform();
  groundTransform.setIdentity();
  const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
  const groundRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(0, groundMotionState, groundShape);
  ground.rb = new Ammo.btRigidBody(groundRigidBodyInfo);
  ground.rb.setMassProps(0, new Ammo.btVector3());
  dynamicsWorld.addRigidBody(ground.rb);

  // Box
  const boxShape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2, height / 2, depth / 2));
  box.rb = createRB({
    shape: boxShape,
    position: new THREE.Vector3(0, 4, 0),
    quaternion: new THREE.Quaternion(0.5, 0.2, 0, 0),
  });
  dynamicsWorld.addRigidBody(box.rb);
}

function setupThreejs() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, undefined, 0.1, 10000);
  camera.position.set(0, 1, 8);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, 0);
  document.getElementById('container3D').appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();
}

function setupScene() {
  // Lights
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(-3, 5, -3);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Debug meshes
  scene.add(new THREE.AxesHelper(5));
  const grid = new THREE.GridHelper(10, 20);
  grid.translateY(-0.005);
  scene.add(grid);

  // Box mesh
  const boxGeom = new THREE.BoxGeometry(width, height, depth);
  const boxMat = new THREE.MeshPhongMaterial({ color: 0xdd2200 });
  box.object = new THREE.Mesh(boxGeom, boxMat);
  scene.add(box.object);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  Clock.update();
  controls.update();

  dynamicsWorld.stepSimulation(Clock.delta, 10);

  // Update box mesh
  const btTransform = new Ammo.btTransform();
  box.rb.getMotionState().getWorldTransform(btTransform);

  const position = btTransform.getOrigin();
  box.object.position.set(position.x(), position.y(), position.z());

  const btQuat = new Ammo.btQuaternion(0, 0, 0, 0);
  btTransform.getBasis().getRotation(btQuat);
  const quaternion = new THREE.Quaternion(btQuat.x(), btQuat.y(), btQuat.z(), btQuat.w());
  box.object.setRotationFromQuaternion(quaternion);

  // Draw everything
  renderer.render(scene, camera);
}

async function start() {
  setupRenderer();
  await setupAmmo();
  setupThreejs();

  setupScene();

  (window as any).box = box;

  (window as any).disablePhysics = () => {
    dynamicsWorld.removeRigidBody(box.rb);
  };

  (window as any).enablePhysics = () => {
    dynamicsWorld.addRigidBody(box.rb);
  };

  setTimeout(() => (window as any).disablePhysics(), 500);
  setTimeout(() => (window as any).enablePhysics(), 1500);

  Clock.start();
  renderer.setAnimationLoop(render);
}

start();
