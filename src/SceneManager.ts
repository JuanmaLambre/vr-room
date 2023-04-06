import * as THREE from 'three';
import { RigidObject } from './objects/RigidObject';
import { WorldManager } from './WorldManager';

export class SceneManager {
  world: WorldManager;
  scene: THREE.Scene;
  marker: THREE.Mesh;
  floor: THREE.Mesh;
  walkingArea: THREE.Box3;

  private static _instance: SceneManager;

  static get instance(): SceneManager {
    if (this._instance == undefined) this._instance = new SceneManager();
    return this._instance;
  }

  private constructor() {
    this.world = new WorldManager();
    this.scene = new THREE.Scene();

    const markerGeom = new THREE.CircleGeometry(0.1);
    markerGeom.rotateX(-Math.PI / 2);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x009999 });
    this.marker = new THREE.Mesh(markerGeom, markerMat);
    this.marker.visible = false;
    this.marker.name = 'marker';
    this.scene.add(this.marker);

    const floorGeom = new THREE.PlaneGeometry(10, 10);
    floorGeom.rotateX(-Math.PI / 2);
    this.floor = new THREE.Mesh(floorGeom);
    this.floor.name = 'floor';

    floorGeom.computeBoundingBox();
    this.walkingArea = floorGeom.boundingBox.clone();
  }

  get rigidObjects() {
    return [...this.world.rigidObjects];
  }

  addRigidObject(ro: RigidObject, addToScene = true) {
    this.world.add(ro);
    if (addToScene) this.scene.add(ro.object);
  }

  removeRigidObject(ro: RigidObject) {
    this.world.remove(ro);
  }

  update() {
    this.world.update();
  }
}
