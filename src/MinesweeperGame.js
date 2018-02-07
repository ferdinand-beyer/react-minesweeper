// Minesweeper game

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
  constructor(rowCount, columnCount, mineCount = 0) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.squares = Array(rowCount * columnCount).fill(0);
    this.mineCount = 0;
    this.status = RUNNING;
    if (mineCount > 0) {
      this.placeRandomMines(mineCount);
    }
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

  isOver() {
    return this.status !== RUNNING;
  }

  isWon() {
    return this.status === WON;
  }

  placeRandomMines(count) {
    for (const index of randomIndexes(this.squares.length, count)) {
      this.placeMineAt(index);
    }
  }

  placeMineAt(index) {
    this.squares[index] |= MINE;
    this.mineCount++;
    this.forEachAdjacent(index, i => {
      this.squares[i] = ((this.squares[i] & ADJACENT_MASK) + 1) | (this.squares[i] & ~ADJACENT_MASK);
    });
  }

  toggleFlag(index) {
    if ((this.squares[index] & REVEALED) === 0) {
      this.squares[index] ^= FLAGGED;
    }
  }

  reveal(index) {
    let square = this.squares[index];
    if (square & REVEALED) {
      return;
    }
    this.squares[index] |= REVEALED;
    if (square & MINE) {
      this.squares[index] |= EXPLODED;
      this.revealAllMines();
      this.status = LOST;
    } else if (Game.adjacentMineCount(this.squares[index]) === 0) {
      this.forEachAdjacent(index, this.reveal.bind(this));
    }
  }

  revealAllMines() {
    this.squares.forEach((square, index, array) => {
      if (square & MINE) {
        array[index] |= REVEALED;
      }
    });
  }

  adjacentIndexes(index) {
    let indexes = [];
    this.forEachAdjacent(index, indexes.push.bind(indexes));
    return indexes;
  }

  forEachAdjacent(index, f) {
    const stride = this.columnCount;
    const col = index % stride;

    const north = (index >= stride);
    const south = (index < (this.squares.length - stride));
    const west = (col > 0);
    const east = (col < (stride - 1));

    north && west && f(index - stride - 1);
    north && f(index - stride);
    north && east && f(index - stride + 1);
    east && f(index + 1);
    south && east && f(index + stride + 1);
    south && f(index + stride);
    south && west && f(index + stride - 1);
    west && f(index - 1);
  }
}

export default Game;
