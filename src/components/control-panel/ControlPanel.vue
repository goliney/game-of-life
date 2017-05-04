<template>
  <aside>
    aside
  </aside>
</template>

<script>
export default {
  name: 'control-panel',
  data() {
    return {};
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
