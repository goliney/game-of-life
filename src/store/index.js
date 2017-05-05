import Vue from 'vue';
import Vuex from 'vuex';
import { statuses } from './types';
import Cell from './entities/Cell';
import Generation from './entities/Generation';

Vue.use(Vuex);

const universe = new Vuex.Store({
  state: {
    status: statuses.PAUSE,
    speed: 1000,
    population: {},
    generation: new Generation(),
    history: [],
  },

  getters: {
    population: state => state.population,
    propagationInProgress: state => state.status === statuses.RUN,
  },

  mutations: {
    reset(state) {
      state.status = statuses.PAUSE;
      state.population = {};
      state.history = [];
    },
    addNewGeneration(state) {
      state.history.push(state.generation);
      state.generation = new Generation();
    },
    add(state, payload) {
      let cell = payload.cell;
      const { x, y, manual } = payload;
      if (!cell) {
        cell = new Cell(x, y);
      }
      const key = cell.getKey();
      Vue.set(state.population, key, cell);
      state.generation.addCell(cell, manual);
    },
    kill(state, payload) {
      const { cell, manual } = payload;
      Vue.delete(state.population, cell.getKey());
      state.generation.killCell(cell, manual);
    },
  },

  actions: {
    start({ state, dispatch }) {
      state.status = statuses.RUN;
      const loop = setInterval(() => {
        if (state.status !== statuses.RUN) {
          clearInterval(loop);
          return;
        } // else
        dispatch('propagate');
      }, state.speed);
    },
    stop({ state }) {
      state.status = statuses.PAUSE;
    },
    propagate({ commit, state }) {
      commit('addNewGeneration');

      const births = {};
      const deaths = {};

      Object.keys(state.population).forEach((key) => {
        const cell = state.population[key];

        const { liveNeighbors, deadNeighbors } = cell.neighborsKeys.reduce((acc, neighborKey) => {
          const neighbor = state.population[neighborKey];
          if (neighbor) {
            acc.liveNeighbors.push(neighborKey);
          } else {
            acc.deadNeighbors.push(neighborKey);
          }
          return acc;
        }, { liveNeighbors: [], deadNeighbors: [] });

        if (liveNeighbors.length !== 2 && liveNeighbors.length !== 3) {
          deaths[key] = cell;
        }

        deadNeighbors
          .filter(neighborKey => !births[neighborKey])
          .forEach((neighborKey) => {
            const surrounding = Cell.getNeighborsFromKey(neighborKey);
            const aliveSurrouning = surrounding.filter(i => state.population[i]);
            if (aliveSurrouning.length === 3) {
              const { x, y } = Cell.getCoordinatesFromKey(neighborKey);
              births[neighborKey] = new Cell(x, y);
            }
          });
      });

      Object.keys(births).forEach(key => commit({ type: 'add', cell: births[key] }));
      Object.keys(deaths).forEach(key => commit({ type: 'kill', cell: deaths[key] }));
    },
  },
});

export default universe;
