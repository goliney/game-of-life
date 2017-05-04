const size = 10;

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.coordinates = Object.freeze({
      x: this.x * size,
      y: this.y * size,
    });
  }

  getXYKey() {
    return `${this.x},${this.y}`;
  }
}

export default Cell;
