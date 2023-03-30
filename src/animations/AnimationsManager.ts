import * as THREE from 'three';
import { Clock } from '../utils/Clock';

const mixers: THREE.AnimationMixer[] = [];

export const AnimationsManager = {
  add(mixer: THREE.AnimationMixer) {
    mixers.push(mixer);
  },

  update() {
    mixers.forEach((mixer) => {
      mixer.update(Clock.delta);
    });
  },
};
