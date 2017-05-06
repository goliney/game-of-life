import Vue from 'vue';
import { generationEvents } from '../types';

class Generation {
  constructor(count) {
    this.count = count;
    this.diff = {};
  }

  getEntry(cell) {
    return this.diff[cell.getKey()];
  }

  addCell(cell, manual) {
    const entry = this.getEntry(cell);
    const key = cell.getKey();
    if (manual && entry && entry.event === generationEvents.MANUAL_DEATH) {
      Vue.delete(this.diff, key);
      return;
    }
    Vue.set(this.diff, key, Object.freeze({
      cell,
      event: manual ? generationEvents.MANUAL_BIRTH : generationEvents.BIRTH,
    }));
  }

  killCell(cell, manual) {
    const entry = this.getEntry(cell);
    const key = cell.getKey();
    if (manual && entry && entry.event === generationEvents.MANUAL_BIRTH) {
      Vue.delete(this.diff, key);
      return;
    }
    Vue.set(this.diff, key, Object.freeze({
      cell,
      event: manual ? generationEvents.MANUAL_DEATH : generationEvents.DEATH,
    }));
  }
}

export default Generation;
