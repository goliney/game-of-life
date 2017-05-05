<template>
<main id="main">
  <svg id="field" @click="addCell($event)" :width="fieldSize.width" :height="fieldSize.height" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" class="svg-viewport">
      <rect
        class="cell"
        v-for="cell in population"
        @click.stop="killCell(cell)"
        :x="cell.coordinates.x"
        :y="cell.coordinates.y"
        width="10"
        height="10"
      />
    </g>
  </svg>
</main>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'canvas-component',
  data() {
    return {
      fieldSize: {
        width: '100%',
        height: '100%',
      },
    };
  },
  mounted() {
    this.fieldSize = document.getElementById('main').getBoundingClientRect();
    this.field = svgPanZoom('#field', {
      viewportSelector: '.svg-viewport',
      controlIconsEnabled: true,
      zoomEnabled: true,
      dblClickZoomEnabled: false,
      fit: false,
      center: true,
    });
  },
  updated() {
//    this.field.resize();
  },
  computed: {
    ...mapGetters(['population', 'propagationInProgress']),
  },
  methods: {
    addCell(event) {
      if (this.propagationInProgress) {
        return;
      }
      const zoom = this.field.getZoom();
      const pan = this.field.getPan();
      const x = Math.floor((event.clientX - this.fieldSize.left - pan.x) / (zoom * 10));
      const y = Math.floor((event.clientY - this.fieldSize.top - pan.y) / (zoom * 10));
      this.$store.commit({ type: 'add', manual: true, x, y });
    },
    killCell(cell) {
      this.$store.commit({ type: 'kill', manual: true, cell });
    },
  },
};
</script>

<style scoped lang="scss">
@import '~assets/scss/global.scss';
main {
  flex: 1;
  display: flex;
}

.cell {
  fill: $color-primary;
}
</style>
