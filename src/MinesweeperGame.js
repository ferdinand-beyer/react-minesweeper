import * as Grid from './minesweeper/Grid.js';

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

const ADJACENT_MASK = 0xF;
const MINE = 0x10;
const REVEALED = 0x20;
const FLAGGED = 0x40;
const EXPLODED = 0x80;

const RUNNING = 0;
const WON = 1;
const LOST = 2;

// Beginner: 9x9, 10
// Intermediate: 16x16, 40
// Expert: 16x30, 99

export class Game {
  constructor(grid) {
    this.grid = grid;
    this.status = RUNNING;
  }

  static build(rowCount, columnCount, mineCount) {
    const grid = new Grid.Grid(rowCount, columnCount);
    for (const index of randomIndexes(grid.squareCount, mineCount)) {
      grid.placeMineAt(index);
    }
    return new Game(grid);
  }

  static containsMine(square) {
    return (square & MINE) !== 0;
  }

  static isRevealed(square) {
    return (square & REVEALED) !== 0;
  }

  static isExploded(square) {
    return (square & EXPLODED) !== 0;
  }

  static isFlagged(square) {
    return (square & FLAGGED) !== 0;
  }

  static adjacentMineCount(square) {
    return square & ADJACENT_MASK;
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

  isOver() {
    return this.status !== RUNNING;
  }

  isWon() {
    return this.status === WON;
  }

  toggleFlag(index) {
    if ((this.grid.squares[index] & REVEALED) === 0) {
      this.grid.squares[index] ^= FLAGGED;
    }
  }

  reveal(index) {
    let square = this.grid.squares[index];
    if (square & REVEALED) {
      return;
    }
    this.grid.squares[index] |= REVEALED;
    if (square & MINE) {
      this.grid.squares[index] |= EXPLODED;
      this.revealAllMines();
      this.status = LOST;
    } else if (Grid.adjacentMineCount(this.grid.squares[index]) === 0) {
      this.grid.forEachAdjacent(index, this.reveal.bind(this));
    }
  }

  revealAllMines() {
    this.grid.squares.forEach((square, index, array) => {
      if (square & MINE) {
        array[index] |= REVEALED;
      }
    });
  }
}

export default Game;
