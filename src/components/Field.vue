<template>
<main id="main">
  <svg
    id="field"
    @click="addCell($event)"
    @mousedown="mousedown($event)"
    @mouseup="mouseup($event)"
    @dragover.prevent="dragover($event)"
    @drop="drop($event)"
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg">
    <g fill="none" class="svg-viewport">
      <rect
        v-for="cell in population"
        @click.stop="killCell(cell)"
        :x="cell.coordinates.x"
        :y="cell.coordinates.y"
        width="5"
        height="5"
        class="cell"
      />

      <use v-if="isPatternDragged" :x="patternX" :y="patternY" xlink:href="#pattern"></use>
    </g>

    <defs>
      <g id="pattern" v-if="isPatternDragged">
        <rect
          v-for="coordinate in selectedPattern.coordinates"
          :x="coordinate.x"
          :y="coordinate.y"
          width="5"
          height="5"
          class="cell"
        />
      </g>
    </defs>
  </svg>
  <section class="zoom-control">
    <button @click.stop="zoomIn()">+</button>
    <button @click.stop="resetZoom()">Reset Zoom</button>
    <button @click.stop="zoomOut()">-</button>
  </section>
</main>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

const cellSize = 5;

export default {
  name: 'field',
  data() {
    return {
      patternX: 0,
      patternY: 0,
    };
  },
  mounted() {
    this.field = svgPanZoom('#field', {
      viewportSelector: '.svg-viewport',
      controlIconsEnabled: false,
      zoomEnabled: true,
      dblClickZoomEnabled: false,
      fit: false,
      center: true,
      minZoom: 0.25,
      maxZoom: 10,
    });
    this.mousedownXY = {};  // used to prevent click on pan
  },
  computed: {
    ...mapGetters([
      'islifePaused',
      'islifeInProgress',
    ]),
    ...mapState({
      population: state => state.population,
      selectedPattern: state => state.selectedPattern,
      isPatternDragged: state => state.isPatternDragged,
    }),
  },
  methods: {
    mousedown(event) {
      this.preventClick = true;
      this.mousedownXY = {
        x: event.clientX,
        y: event.clientY,
      };
    },
    mouseup(event) {
      const { clientX, clientY } = event;
      const deltaX = Math.abs(clientX - this.mousedownXY.x);
      const deltaY = Math.abs(clientY - this.mousedownXY.y);
      this.preventClick = deltaX > 0 || deltaY > 0;
    },
    dragover(event) {
      const { x, y } = this.getCoordinatesFromEvent(event);
      this.patternX = x * cellSize;
      this.patternY = y * cellSize;
    },
    drop(event) {
      const { x, y } = this.getCoordinatesFromEvent(event);
      this.$store.dispatch({ type: 'addPattern', pattern: this.selectedPattern, x, y });
    },
    zoomIn() {
      this.field.zoomIn();
    },
    zoomOut() {
      this.field.zoomOut();
    },
    resetZoom() {
      this.field.resetZoom();
      this.field.center();
    },
    addCell(event) {
      if (this.islifeInProgress || this.preventClick) {
        return;
      }
      const { x, y } = this.getCoordinatesFromEvent(event);
      this.$store.commit({ type: 'addCell', manual: true, x, y });
    },
    killCell(cell) {
      if (this.islifeInProgress || this.preventClick) {
        return;
      }
      this.$store.commit({ type: 'killCell', manual: true, cell });
    },
    getCoordinatesFromEvent(event) {
      const fieldSize = document.getElementById('main').getBoundingClientRect();
      const zoom = this.field.getZoom();
      const pan = this.field.getPan();
      const x = Math.floor((event.clientX - fieldSize.left - pan.x) / (zoom * cellSize));
      const y = Math.floor((event.clientY - fieldSize.top - pan.y) / (zoom * cellSize));
      return { x, y };
    },
  },
};
</script>

<style scoped lang="scss">
@import '~assets/scss/global.scss';
main {
  flex: 1;
  display: flex;
  position: relative;
}

.cell {
  fill: $color-primary;
}

#pattern .cell {
  fill: $color-vivid;
}

.zoom-control {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
</style>
