import * as Grid from './Grid.js';

function randomSample(sequence, k) {
  const pool = Array.from(sequence);
  const n = pool.length;
  const result = new Array(k);
  for (let i = 0; i < k; i++) {
    let j = Math.floor(Math.random() * (n - i));
    result[i] = pool[j];
    pool[j] = pool[n - i - 1];
  }
  return result;
}

function randomIndexes(n, k) {
  return randomSample(Array(n).keys(), k);
}

const RUNNING = 0;
const WON = 1;
const LOST = 2;

export class Game {
  constructor(grid) {
    this.grid = grid;
    this.status = RUNNING;
  }

  // Beginner: 9x9, 10
  // Intermediate: 16x16, 40
  // Expert: 16x30, 99
  static build(rowCount, columnCount, mineCount) {
    const grid = new Grid.Grid(rowCount, columnCount);
    for (const index of randomIndexes(grid.squareCount, mineCount)) {
      grid.placeMineAt(index);
    }
    return new Game(grid);
  }

  get rowCount() {
    return this.grid.rowCount;
  }

  get columnCount() {
    return this.grid.columnCount;
  }

  get squares() {
    return this.grid.squares;
  }

  get remainingMineCount() {
    return this.grid.mineCount - this.grid.flagCount;
  }

  isOver() {
    return this.status !== RUNNING;
  }

  isWon() {
    return this.status === WON;
  }

  toggleFlag(index) {
    const grid = this.grid;
    if (!grid.isRevealedAt(index)) {
      if (grid.isFlaggedAt(index)) {
        grid.clearFlagAt(index);
      } else {
        grid.placeFlagAt(index);
      }
    }
  }

  reveal(index) {
    let square = this.grid.squares[index];
    if (square & Grid.REVEALED) {
      return;
    }
    this.grid.squares[index] |= Grid.REVEALED;
    if (square & Grid.MINE) {
      this.grid.squares[index] |= Grid.EXPLODED;
      this.revealAllMines();
      this.status = LOST;
    } else if (Grid.adjacentMineCount(this.grid.squares[index]) === 0) {
      this.grid.forEachAdjacent(index, this.reveal.bind(this));
    }
  }

  revealAllMines() {
    this.grid.squares.forEach((square, index, array) => {
      if (square & Grid.MINE) {
        array[index] |= Grid.REVEALED;
      }
    });
  }
}

export default Game;
