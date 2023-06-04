import * as THREE from 'three';
import { VRObject } from './objects/VRObject';

export class SceneManager {
  scene: THREE.Scene;
  marker: THREE.Mesh;
  floor: THREE.Mesh;
  walkingArea: THREE.Box3;

  private static _instance: SceneManager;
  private vrObjectsList: VRObject[] = [];

  static get instance(): SceneManager {
    if (this._instance == undefined) this._instance = new SceneManager();
    return this._instance;
  }

  private constructor() {
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

  get vrObjects() {
    return [...this.vrObjectsList];
  }

  addVRObject(obj: VRObject, addToScene = true) {
    this.vrObjectsList.push(obj);
    if (addToScene) this.scene.add(obj.object);
  }
}
