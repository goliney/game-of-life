<template>
  <aside>
    <section>
      <span>Generation: {{generationCount}}</span>
      <span>Current Population: {{populationCount}}</span>
    </section>

    <section>
      <button @click="start()" v-if="islifePaused">Start</button>
      <button @click="stop()" v-if="islifeInProgress">Pause</button>
    </section>

    <section>
      <span>Interval: {{interval}}ms</span>
      <input type="range" v-model="interval" min="50" max="1500" step="50">
    </section>

    <section>
      <button @click="stepForward()" :disabled="islifeInProgress">Step Forward</button>
      <button @click="stepBackward()" :disabled="islifeInProgress || !hasHistory">Step Backward</button>
      <span>History Length: {{historyLength}} (max {{historySize}})</span>
    </section>

    <section>
      <button @click="saveSnapshot()" :disabled="islifeInProgress">Save Snapshot</button>

      <ul class="snapshots">
        <li v-for="(snapshot, index) in snapshots">
          <button @click="restoreSnapshot(snapshot)"
            :disabled="islifeInProgress"
            class="restore"
            :title="'Restore Snapshot (' + snapshot.created + ')'">
            Restore ({{snapshot.totalCells}} cells)
          </button>
          <button @click="deleteSnapshot(index)"
            :disabled="islifeInProgress"
            class="delete"
            title="Delete Snapshot">
            x
          </button>
        </li>
      </ul>
    </section>

    <section>
      <span>Add pattern:</span>
      <select v-model="selectedPattern">
        <option v-for="pattern in patterns" :value="pattern">
          {{pattern.name}} ({{pattern.cells.length}})
        </option>
      </select>
      <div
        v-if="selectedPattern"
        class="drag-item"
        :class="{ 'dragged': isPatternDragged }"
        draggable="true"
        @dragstart="dragstart"
        @dragend="dragend">
        Drag Me &rarr;
      </div>
    </section>

    <section>
      <button @click="randomize()">Randomize</button>
      <button @click="reset()">Reset Universe</button>
    </section>
  </aside>
</template>

<script>
import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';

export default {
  name: 'control',
  computed: {
    ...mapGetters([
      'islifePaused',
      'islifeInProgress',
      'populationCount',
    ]),
    ...mapState({
      generationCount: state => state.generationCount,
      hasHistory: state => state.history.length !== 0,
      historyLength: state => state.history.length,
      historySize: state => state.historySize,
      snapshots: state => state.snapshots,
      patterns: state => state.patterns,
      isPatternDragged: state => state.isPatternDragged,
    }),
    interval: {
      get() {
        return this.$store.state.interval;
      },
      set(value) {
        this.$store.dispatch('updateInterval', value);
      },
    },
    selectedPattern: {
      get() {
        return this.$store.state.selectedPattern;
      },
      set(pattern) {
        this.$store.commit('selectPattern', pattern);
      },
    },
  },
  methods: {
    ...mapMutations([
      'reset',
      'saveSnapshot',
      'deleteSnapshot',
    ]),
    ...mapActions([
      'start',
      'stop',
      'stepForward',
      'stepBackward',
      'restoreSnapshot',
    ]),
    dragstart(event) {
      this.$store.commit('patternDragStart');
      const dummyEl = document.createElement('span'); // do not show dragged element
      event.dataTransfer.setDragImage(dummyEl, 0, 0);
    },
    dragend() {
      this.$store.commit('patternDragEnd');
    },
  },
};
</script>

<style scoped lang="scss">
@import '~assets/scss/global.scss';

aside {
  display: flex;
  flex-direction: column;
  width: $control-panel-width;
  padding: 1.5rem;
  background-color: $color-primary;
  color: $color-empty;
  overflow: auto;

  & > section {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
    flex-shrink: 0;
  }
}

ul.snapshots {
  margin: 10px 0 0;
  padding: 0;
  max-height: 200px;
  overflow: auto;
  list-style: none;

  li {
    display: flex;

    .restore {
      flex: 1;
    }
  }
}

.drag-item {
  margin-top: 10px;
  padding: 1rem;
  text-align: center;
  border: 1px dashed $color-vivid;
  cursor: grab;

  &.dragged {
    opacity: 0.5;
  }
}
</style>
