import * as THREE from 'three';

const HIGHLIGHT_EMISSIVE = new THREE.Color(0x00aa00);

export class VRObject {
  name: string;
  object: THREE.Object3D;
  hitSurface: THREE.Object3D;

  grabbable: boolean = true;
  enabled: boolean = true; // Enabled for interaction

  protected highlightMaterials: THREE.MeshStandardMaterial[] = [];

  constructor(obj: THREE.Object3D) {
    this.object = obj;
    this.name = this.object.name;
  }

  get isInteractable() {
    return this.hitSurface != undefined;
  }

  setWorldPosition(pos: THREE.Vector3) {
    const relative = this.object.worldToLocal(pos.clone());
    this.object.position.copy(relative);
  }

  highlight(value = true) {
    this.highlightMaterials.forEach((mat) => {
      const emissive = value ? HIGHLIGHT_EMISSIVE : mat.userData.originalEmissive;
      mat.emissive = emissive;
    });
  }

  onGrabbed(): void {}

  onDropped(): void {}

  protected populateHighlightMats() {
    if (!this.object) return;

    this.object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry && mesh.material) {
        let materials = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        if (!Array.isArray(materials)) materials = [materials];

        materials.forEach((mat) => {
          mat.userData.originalEmissive = mat.emissive;
          this.highlightMaterials.push(mat);
        });
      }
    });
  }
}
