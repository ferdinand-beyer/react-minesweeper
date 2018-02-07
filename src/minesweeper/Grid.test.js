import {
  Grid, containsMine, adjacentMineCount, isRevealed, isFlagged
} from './Grid.js';

describe('A new Grid', () => {
  const grid = new Grid(7, 9);

  it('has the correct size', () => {
    expect(grid.rowCount).toBe(7);
    expect(grid.columnCount).toBe(9);
    expect(grid.squareCount).toBe(7 * 9);
  });

  it('has the correct number of squares', () => {
    expect(grid.squares.length).toBe(grid.squareCount);
  });

  it('has no mines', () => {
    expect(grid.mineCount).toBe(0);
  });

  it('has no flags', () => {
    expect(grid.flagCount).toBe(0);
  });

  it('has no revealed squares', () => {
    expect(grid.revealCount).toBe(0);
  });

  it('has only blank squares', () => {
    expect(grid.squares).toEqual(Array(7 * 9).fill(0));
  });
});

describe('A grid finds correct adjacent squares', () => {
  const grid = new Grid(4, 5);
  const expectAdjacent = (index, expected) => {
    return () => {
      expect(grid.adjacentIndexes(index)).toEqual(expected);
    };
  };
  //   0  1  2  3  4
  //   5  6  7  8  9
  //  10 11 12 13 14
  //  15 16 17 18 19
  test('in the middle', expectAdjacent(12, [6, 7, 8, 13, 18, 17, 16, 11]));
  test('at the upper-left corner', expectAdjacent(0, [1, 6, 5]));
  test('at the top border', expectAdjacent(2, [3, 8, 7, 6, 1]));
  test('at the upper-right corner', expectAdjacent(4, [9, 8, 3]));
  test('at the right border', expectAdjacent(14, [8, 9, 19, 18, 13]));
  test('at the bottom-right corner', expectAdjacent(19, [13, 14, 18]));
  test('at the bottom border', expectAdjacent(17, [11, 12, 13, 18, 16]));
  test('at the bottom-left corner', expectAdjacent(15, [10, 11, 16]));
  test('at the left border', expectAdjacent(5, [0, 1, 6, 11, 10]));
});

describe('When placing a mine in the grid', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid(3, 3);
    grid.placeMineAt(4);
  });

  test('the mine count is incremented', () => {
    expect(grid.mineCount).toBe(1);
  });

  test('exactly one square contains a mine', () => {
    grid.squares.forEach((square, index) => {
      expect(containsMine(square)).toBe(index === 4);
    });
  });

  test('the adjacent mine count in adjacent squares is incremented', () => {
    expect(grid.squares.map(adjacentMineCount)).toEqual([
      1, 1, 1,
      1, 0, 1,
      1, 1, 1,
    ]);
  });

  describe('and the square already contains a mine', () => {
    test('the mine count is not changed', () => {
      grid.placeMineAt(4);
      expect(grid.mineCount).toBe(1);
    });
  });
});

describe('When placing multiple mines in the grid', () => {
  test('all squares have the correct adjacency number', () => {
    const grid = new Grid(4, 4);
    //  0  1  2  3 | 1 1 1 0
    //  4  5  6  7 | 2 X 2 1
    //  8  9 10 11 | X 5 X 2
    // 12 13 14 15 | X X 3 X
    for (const index of [5, 8, 10, 12, 13, 15]) {
      grid.placeMineAt(index);
    }
    expect(grid.squares.map(adjacentMineCount)).toEqual([
      1, 1, 1, 0,
      2, 2, 2, 1,
      3, 5, 3, 2,
      2, 3, 3, 1
    ]);
  });
});

describe('When removing a mine from a square', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid(3, 3);
    grid.placeMineAt(4);
    grid.placeMineAt(5);
    grid.clearMineAt(4);
  });

  test('the mine count is decremented', () => {
    expect(grid.mineCount).toBe(1);
  });

  test('exactly one square contains a mine', () => {
    grid.squares.forEach((square, index) => {
      expect(containsMine(square)).toBe(index === 5);
    });
  });

  test('the adjacent mine count in adjacent squares is decremented', () => {
    expect(grid.squares.map(adjacentMineCount)).toEqual([
      0, 1, 1,
      0, 1, 0,
      0, 1, 1,
    ]);
  });

  describe('and the square contains no mine', () => {
    test('the mine count is not changed', () => {
      grid.clearMineAt(4);
      expect(grid.mineCount).toBe(1);
    });
  });
});

describe('When revealing a square', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid(4, 4);
    grid.revealAt(3);
  });

  test('the square is marked as revealed', () => {
    expect(grid.isRevealedAt(3)).toBeTruthy();
    expect(isRevealed(grid.squares[3])).toBeTruthy();
  });

  test('the reveal count is incremented', () => {
    expect(grid.revealCount).toBe(1);
  });
});

describe('When placing a flag', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid(4, 4);
    grid.placeFlagAt(3);
  });

  test('the square is marked as flagged', () => {
    expect(grid.isFlaggedAt(3)).toBeTruthy();
    expect(isFlagged(grid.squares[3])).toBeTruthy();
  });

  test('the flag count is incremented', () => {
    expect(grid.flagCount).toBe(1);
  });

  describe('and the square already flagged', () => {
    test('the flag count is not changed', () => {
      grid.placeFlagAt(3);
      expect(grid.flagCount).toBe(1);
    });
  });
});

describe('When removing a flag', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid(4, 4);
    grid.placeFlagAt(3);
    grid.clearFlagAt(3);
  });

  test('the square is no longer marked as flagged', () => {
    expect(grid.isFlaggedAt(3)).toBeFalsy();
    expect(isFlagged(grid.squares[3])).toBeFalsy();
  });

  test('the flag count is decremented', () => {
    expect(grid.flagCount).toBe(0);
  });

  describe('and the square was not flagged before', () => {
    test('the flag count is not changed', () => {
      grid.clearFlagAt(3);
      expect(grid.flagCount).toBe(0);
    });
  });
});
