import Vue from 'vue';
import Vuex from 'vuex';
import { statuses, generationEvents } from './types';
import Cell from './entities/Cell';
import Generation from './entities/Generation';
import Snapshot from './entities/Snapshot';
import { patterns } from './entities/Pattern';

Vue.use(Vuex);

const universe = new Vuex.Store({
  state: {
    status: statuses.PAUSE,
    loopId: null,
    interval: 100,
    population: {},
    generation: new Generation(0),
    generationCount: 0,
    history: [],
    historySize: 100,
    snapshots: [],
    activePattern: null,
    patterns,
  },

  getters: {
    islifeInProgress: state => state.status === statuses.RUN,
    islifePaused: state => state.status === statuses.PAUSE,
    lastGeneration: state => state.history[state.history.length - 1],
    populationCount: state => Object.keys(state.population).length,
  },

  mutations: {
    reset(state) {
      state.status = statuses.PAUSE;
      state.population = {};
      state.history = [];
      state.generationCount = 0;
      state.generation = new Generation(state.generationCount);
    },
    updateInterval(state, { value }) {
      state.interval = value;
    },
    addNewGeneration(state) {
      if (state.history.length >= state.historySize) {
        state.history.shift();
      }
      state.history.push(state.generation);
      state.generationCount += 1;
      state.generation = new Generation(state.generationCount);
    },
    removeLastGeneration(state) {
      state.generationCount -= 1;
      return state.history.pop();
    },
    addCell(state, { cell, x, y, manual }) {
      if (!cell) {
        cell = new Cell(x, y);
      }
      const key = cell.getKey();
      cell = Object.freeze(cell);
      Vue.set(state.population, key, cell);
      state.generation.addCell(cell, manual);
    },
    killCell(state, payload) {
      const { cell, manual } = payload;
      Vue.delete(state.population, cell.getKey());
      state.generation.killCell(cell, manual);
    },
    saveSnapshot(state) {
      const snapshot = new Snapshot(state.population);
      state.snapshots.push(snapshot);
    },
    deleteSnapshot(state, { index }) {
      state.snapshots.splice(index, 1);
    },
  },

  actions: {
    start({ state, getters, dispatch }) {
      state.status = statuses.RUN;
      state.loopId = setInterval(() => {
        if (!getters.islifeInProgress) {
          clearInterval(state.loopId);
          return;
        } // else
        dispatch('stepForward');
      }, state.interval);
    },
    stop({ state }) {
      state.status = statuses.PAUSE;
      clearInterval(state.loopId);
    },
    updateInterval({ commit, getters, state, dispatch }, value) {
      commit({ type: 'updateInterval', value });
      if (getters.islifeInProgress) {
        clearInterval(state.loopId);
        dispatch('start');
      }
    },
    stepForward({ commit, state }) {
      commit('addNewGeneration');

      const births = {};
      const deaths = {};
      const traversed = {};

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

        // kill doomed cell
        if (liveNeighbors.length !== 2 && liveNeighbors.length !== 3) {
          deaths[key] = cell;
        }

        // bring dead neighbors to life if needed
        deadNeighbors.forEach((neighborKey) => {
          if (traversed[neighborKey]) {
            return;
          }
          traversed[neighborKey] = true;
          const surrounding = Cell.getNeighborsFromKey(neighborKey);
          const aliveSurrouning = surrounding.filter(i => state.population[i]);
          if (aliveSurrouning.length === 3) {
            const { x, y } = Cell.getCoordinatesFromKey(neighborKey);
            births[neighborKey] = new Cell(x, y);
          }
        });
      });

      Object.keys(births).forEach(key => commit({ type: 'addCell', cell: births[key] }));
      Object.keys(deaths).forEach(key => commit({ type: 'killCell', cell: deaths[key] }));
    },
    stepBackward({ commit, state, getters }) {
      if (state.history.length === 0) {
        return;
      }
      Object.keys(state.generation.diff).forEach((key) => {
        const { cell, event } = state.generation.diff[key];
        switch (event) {
          case generationEvents.BIRTH: {
            commit({ type: 'killCell', cell });
            break;
          }
          case generationEvents.DEATH: {
            commit({ type: 'addCell', cell });
            break;
          }
          case generationEvents.MANUAL_BIRTH: {
            commit({ type: 'killCell', manual: true, cell });
            break;
          }
          case generationEvents.MANUAL_DEATH: {
            commit({ type: 'addCell', manual: true, cell });
            break;
          }
          default:
            break;
        }
      });
      Vue.set(state, 'generation', getters.lastGeneration);
      commit({ type: 'removeLastGeneration' });
    },
    restoreSnapshot({ commit }, snapshot) {
      commit({ type: 'reset' });
      Object.keys(snapshot.population).forEach((key) => {
        const cell = snapshot.population[key];
        commit({ type: 'addCell', manual: true, cell });
      });
    },
  },
});

export default universe;
