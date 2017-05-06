class Pattern {
  constructor(name, cells) {
    this.name = name;
    this.cells = cells;
  }
}

const patterns = [
  new Pattern('Aircraft Carrier', [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
  ]),
];

export default Pattern;
export { patterns };
