class Cell {
  constructor(x, y) {
    const size = 5;
    this.x = x;
    this.y = y;
    this.coordinates = Object.freeze({
      x: this.x * size,
      y: this.y * size,
    });
    this.neighborsKeys = Object.freeze(Cell.getNeighborsFromCoordinates(this.x, this.y));
  }

  getKey() {
    return Cell.getKeyFromCoordinates(this.x, this.y);
  }

  static getKeyFromCoordinates(x, y) {
    return `${x},${y}`;
  }

  static getCoordinatesFromKey(key) {
    const [x, y] = key.split(',').map(i => parseInt(i, 10));
    return { x, y };
  }

  static getNeighborsFromCoordinates(x, y) {
    const neighbors = [];
    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        if (i !== 0 || j !== 0) {
          neighbors.push(Cell.getKeyFromCoordinates(i + x, j + y));
        }
      }
    }
    return neighbors;
  }

  static getNeighborsFromKey(key) {
    const { x, y } = Cell.getCoordinatesFromKey(key);
    return Cell.getNeighborsFromCoordinates(x, y);
  }
}

export default Cell;

