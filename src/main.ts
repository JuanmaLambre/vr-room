import './style.css';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HandController } from './xr/HandController';
import { SceneManager } from './SceneManager';
import { Clock } from './utils/Clock';
import { CanvasLogger, canvaslog } from './utils/logger';
import { DebugVRBox } from './objects/DebugVRBox';

// For debugging
const w = window as any;
w.THREE = THREE;

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
  w.renderer = renderer;

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
  sceneManager = SceneManager.instance;
  w.sceneManager = sceneManager;

  camera = new THREE.PerspectiveCamera(50, undefined, 0.01, 10000);
  camera.position.set(0, 1, 5);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(-3, 5, -3);
  sceneManager.scene.add(light);
  sceneManager.scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Debug meshes
  sceneManager.scene.add(new THREE.AxesHelper(5));
  const grid = new THREE.GridHelper(10, 20);
  grid.translateY(0.001);
  sceneManager.scene.add(grid);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  document.getElementById('container3D').appendChild(renderer.domElement);

  loaderElement = document.getElementById('loader');

  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();

  // Add debug console
  const boardGeom = new THREE.PlaneGeometry(4, 2);
  const board = new THREE.Mesh(boardGeom, CanvasLogger.buildMaterial(boardGeom));
  board.translateY(boardGeom.parameters.height);
  board.translateZ(-5);
  sceneManager.scene.add(board);

  const box = new DebugVRBox();
  sceneManager.addVRObject(box);
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

  w.handController0 = handController0;
  w.handController1 = handController1;
}

function render() {
  Clock.update();
  controls.update();

  handController0?.update();
  handController1?.update();

  // Draw everything
  renderer.render(sceneManager.scene, camera);
}

async function start() {
  setupRenderer();
  setupThreejs();

  w.canvaslog = canvaslog;

  // Add a button to enter/exit vr to the page
  document.body.appendChild(VRButton.createButton(renderer));

  loaderElement.style.visibility = 'hidden';

  Clock.start();
  renderer.setAnimationLoop(render);
}

start();
