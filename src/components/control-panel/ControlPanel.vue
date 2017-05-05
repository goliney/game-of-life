<template>
  <aside>
    <button @click="start()">Start</button>
    <button @click="stop()">Stop</button>
    <button @click="reset()">Reset</button>

    <br>

    <button @click="stepBack()">Step Back</button>
    <button @click="stepForward()">Step Forward</button>
  </aside>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

export default {
  name: 'control-panel',
  data() {
    return {};
  },
  methods: {
    ...mapMutations(['reset']),
    ...mapActions(['start', 'stop']),
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
}
</style>
