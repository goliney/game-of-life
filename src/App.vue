<template>
  <div id="app">
    <control-panel></control-panel>
    <field></field>
  </div>
</template>

<script>
import ControlPanel from './components/control-panel/ControlPanel';
import Field from './components/field/Field';

export default {
  name: 'app',
  components: {
    ControlPanel,
    Field,
  },
};
</script>

<style lang="scss">
@import '~assets/scss/global';

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

#app {
  display: flex;
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 14px;
}
</style>
