import * as THREE from 'three';
import { VRObject } from './VRObject';

export type DebugVRBoxProps = {
  width?: number;
  height?: number;
  depth?: number;
};

export class DebugVRBox extends VRObject {
  constructor(props: DebugVRBoxProps = {}) {
    const { width = 1, height = 1, depth = 1 } = props;

    const geometry = new THREE.BoxGeometry(width / 2, height / 2, depth / 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x990022 });
    const mesh = new THREE.Mesh(geometry, material);

    const hitSurface = new THREE.Mesh(geometry);
    hitSurface.name = 'hitSurface';
    mesh.add(hitSurface);

    super(mesh);

    this.populateHitSurface();
    this.populateHighlightMats();
  }
}
