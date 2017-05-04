import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const universe = new Vuex.Store({
  state: {
    population: {},
  },
  getters: {
    population: state => state.population,
  },
  mutations: {
    add(state, cell) {
      Vue.set(state.population, cell.getXYKey(), cell);
    },
    kill(state, cell) {
      Vue.delete(state.population, cell.getXYKey());
    },
  },
});

export default universe;
