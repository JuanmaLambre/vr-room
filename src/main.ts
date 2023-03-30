import './style.css';
import * as THREE from 'three';
import Ammo from 'ammojs-typed';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HandController } from './xr/HandController';
import { SceneManager } from './SceneManager';
import { Clock } from './utils/Clock';
import { RigidGeometry } from './objects/RigidGeometry';
import { DebugBoxObject } from './objects/DebugBoxObject';

(window as any).THREE = THREE;
(window as any).Ammo = Ammo;

let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;

let controls: OrbitControls;

let loaderElement: HTMLElement;

let sceneManager: SceneManager;
let handController0: HandController;
let handController1: HandController;

function setupRenderer() {
  // Make a renderer that fills the screen
  renderer = new THREE.WebGLRenderer({ antialias: true });
  (window as any).renderer = renderer;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.xr.enabled = true;

  renderer.xr.addEventListener('sessionstart', function (event: any) {
    setupControllers();
  });

  renderer.xr.addEventListener('sessionend', function (event: any) {});
}

function setupThreejs() {
  sceneManager = new SceneManager();
  (window as any).sceneManager = sceneManager;

  camera = new THREE.PerspectiveCamera(50, undefined, 0.1, 10000);
  camera.position.set(0, 1, 6);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(-3, 5, -3);
  sceneManager.scene.add(light);
  sceneManager.scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Debug meshes
  sceneManager.scene.add(new THREE.AxesHelper(5));
  const grid = new THREE.GridHelper(10, 50);
  grid.translateY(0.001);
  sceneManager.scene.add(grid);

  controls = new OrbitControls(camera, renderer.domElement);
  document.getElementById('container3D').appendChild(renderer.domElement);

  loaderElement = document.getElementById('loader');

  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();

  // Create a debug ground plane
  const groundGeom = new THREE.PlaneGeometry(10, 10);
  const groundObject = new THREE.Mesh(groundGeom, new THREE.MeshPhongMaterial({ color: 0x111133 }));
  groundObject.rotateX(-Math.PI / 2);
  groundObject.name = 'ground';
  const ground = new RigidGeometry(groundObject);
  ground.setMass(0);
  sceneManager.addRigidObject(ground);

  // Create a debug box
  const box = new DebugBoxObject();
  sceneManager.addRigidObject(box);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupControllers() {
  handController0 = new HandController(renderer.xr, sceneManager);
  handController0.setup(0);
  handController1 = new HandController(renderer.xr, sceneManager);
  handController1.setup(1);

  (window as any).handController0 = handController0;
  (window as any).handController1 = handController1;
}

function render() {
  Clock.update();
  controls.update();

  handController0?.update();
  handController1?.update();

  sceneManager.update();

  // Draw everything
  renderer.render(sceneManager.scene, camera);
}

async function start() {
  setupRenderer();
  await Ammo(Ammo);
  setupThreejs();

  // Add a button to enter/exit vr to the page
  document.body.appendChild(VRButton.createButton(renderer));

  loaderElement.style.visibility = 'hidden';

  Clock.start();
  renderer.setAnimationLoop(render);
}

start();
