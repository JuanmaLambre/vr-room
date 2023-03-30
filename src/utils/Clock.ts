import * as THREE from 'three';

const clock = new THREE.Clock();

export const Clock = {
  delta: 0,
  elapsed: 0,

  start() {
    clock.start();
  },

  update() {
    this.delta = clock.getDelta();
    this.elapsed = clock.elapsedTime;
  },
};
