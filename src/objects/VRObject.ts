import * as THREE from 'three';

const HIGHLIGHT_EMISSIVE = new THREE.Color(0x00aa00);

export class VRObject {
  object: THREE.Object3D;
  hitSurface: THREE.Object3D;

  grabbable: boolean = true;
  enabled: boolean = true; // Enabled for interaction

  protected highlightMaterials: THREE.MeshStandardMaterial[] = [];

  get isInteractable() {
    return this.hitSurface != undefined;
  }

  highlight(value = true) {
    this.highlightMaterials.forEach((mat) => {
      const emissive = value ? HIGHLIGHT_EMISSIVE : mat.userData.originalEmissive;
      mat.emissive = emissive;
    });
  }

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
