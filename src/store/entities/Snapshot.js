class Snapshot {
  constructor(population) {
    this.population = Object.assign({}, population);
    this.created = new Date();
    this.totalCells = Object.keys(this.population).length;
  }
}

export default Snapshot;
