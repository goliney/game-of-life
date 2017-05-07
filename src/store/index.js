import Vue from 'vue';
import Vuex from 'vuex';
import { statuses, generationEvents } from './types';
import Cell from './entities/Cell';
import Generation from './entities/Generation';
import Snapshot from './entities/Snapshot';
import { patterns } from './entities/Pattern';
import $bus from './bus';

Vue.use(Vuex);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const universe = new Vuex.Store({
  state: {
    status: statuses.PAUSE,
    loopId: null,
    interval: 500,
    population: {},
    generation: new Generation(0),
    generationCount: 0,
    history: [],
    historySize: 100,
    snapshots: [],
    patterns,
    selectedPattern: null,
    isPatternDragged: false,
  },

  getters: {
    islifeInProgress: state => state.status === statuses.RUN,
    islifePaused: state => state.status === statuses.PAUSE,
    lastGeneration: state => state.history[state.history.length - 1],
    populationCount: state => Object.keys(state.population).length,
  },

  mutations: {
    reset(state) {
      $bus.$emit('reset');
      state.status = statuses.PAUSE;
      state.population = {};
      state.history = [];
      state.generationCount = 0;
      state.generation = new Generation(state.generationCount);
    },
    updateInterval(state, { value }) {
      state.interval = value;
    },
    selectPattern(state, pattern) {
      state.selectedPattern = pattern;
    },
    patternDragStart(state) {
      state.isPatternDragged = true;
    },
    patternDragEnd(state) {
      state.isPatternDragged = false;
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
    addPattern({ commit }, { pattern, x, y }) {
      pattern.cells.forEach((cell) => {
        commit({
          type: 'addCell',
          x: cell.x + x,
          y: cell.y + y,
          manual: true,
        });
      });
    },
    randomize({ commit, state, dispatch }) {
      commit({ type: 'reset' });
      const count = getRandomInt(30, 70);

      for (let i = 0; i < count; i += 1) {
        const pattern = state.patterns[getRandomInt(0, state.patterns.length)];
        const x = getRandomInt(-100, 100);
        const y = getRandomInt(-100, 100);
        dispatch({
          type: 'addPattern',
          pattern,
          x,
          y,
        });
      }
    },
  },
});

export default universe;
