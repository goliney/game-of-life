import Vue from 'vue';

const events = {
  BIRTH: 'BIRTH',
  DEATH: 'DEATH',
  MANUAL_BIRTH: 'MANUAL_BIRTH',
  MANUAL_DEATH: 'MANUAL_DEATH',
};

class Generation {
  constructor() {
    this.diff = {};
  }

  getEntry(cell) {
    return this.diff[cell.getKey()];
  }

  addCell(cell, manual) {
    const entry = this.getEntry(cell);
    const key = cell.getKey();
    if (manual && entry && entry.event === events.MANUAL_DEATH) {
      Vue.delete(this.diff, key);
      return;
    }
    Vue.set(this.diff, key, Object.freeze({
      cell,
      event: manual ? events.MANUAL_BIRTH : events.BIRTH,
    }));
  }

  killCell(cell, manual) {
    const entry = this.getEntry(cell);
    const key = cell.getKey();
    if (manual && entry && entry.event === events.MANUAL_BIRTH) {
      Vue.delete(this.diff, key);
      return;
    }
    Vue.set(this.diff, key, Object.freeze({
      cell,
      event: manual ? events.MANUAL_DEATH : events.DEATH,
    }));
  }
}

export default Generation;
