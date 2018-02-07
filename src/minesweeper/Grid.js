export const ADJACENT_MASK = 0xF;
export const MINE = 0x10;
export const REVEALED = 0x20;
export const FLAGGED = 0x40;
export const EXPLODED = 0x80;

export function containsMine(square) {
  return (square & MINE) !== 0;
}

export function isRevealed(square) {
  return (square & REVEALED) !== 0;
}

export function isExploded(square) {
  return (square & EXPLODED) !== 0;
}

export function isFlagged(square) {
  return (square & FLAGGED) !== 0;
}

export function adjacentMineCount(square) {
  return square & ADJACENT_MASK;
}

export class Grid {
  constructor(rowCount, columnCount) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.squareCount = rowCount * columnCount;
    this.mineCount = 0;
    this.flagCount = 0;
    this.revealCount = 0;
    this.squares = Array(this.squareCount).fill(0);
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
    const south = (index < (this.squareCount - stride));
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

  placeMineAt(index) {
    this.squares[index] |= MINE;
    this.mineCount++;
    this.forEachAdjacent(index, i => {
      this.squares[i] = ((this.squares[i] & ADJACENT_MASK) + 1) | (this.squares[i] & ~ADJACENT_MASK);
    });
  }
}
