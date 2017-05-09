import Vue from 'vue';
import Control from '@/components/Control';

describe('Control.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Control);
    const vm = new Constructor().$mount();
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Your Vue.js App');
  });
});
