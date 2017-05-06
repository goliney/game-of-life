<template>
  <div id="app">
    <control></control>
    <field></field>
  </div>
</template>

<script>
import Control from './components/Control';
import Field from './components/Field';

export default {
  name: 'app',
  components: {
    Control,
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
