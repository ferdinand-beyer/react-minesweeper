import { Game } from './MinesweeperGame.js';

describe('a newly created game', () => {
  const game = new Game(7, 9);

  it('populates counts', () => {
    expect(game.rowCount).toBe(7);
    expect(game.columnCount).toBe(9);
    expect(game.mineCount).toBe(0);
    expect(game.squares.length).toBe(7 * 9);
  });

  it('has no mines', () => {
    expect.assertions(game.squares.length);
    game.squares.map(square => {
      expect(square).toBe(0);
    });
  });

  it('has no revealed squares', () => {
    expect(game.squares.filter(Game.isRevealed)).toHaveLength(0);
  });
});

describe('find correct adjacent squares', () => {
  const expectAdjacent = (index, expected) => {
    return () => {
      expect(game.adjacentIndexes(index)).toEqual(expected);
    };
  };
  const game = new Game(4, 5);
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

describe('placing a mine in the grid', () => {
  const game = new Game(3, 3);
  game.placeMineAt(4);

  test('increments mine count', () => {
    expect(game.mineCount).toBe(1);
  });

  test('does not effect other squares', () => {
    game.squares.forEach((square, index) => {
      expect(Game.containsMine(square)).toBe(index === 4);
    });
  });

  test('increases adjacent mine count in adjacent squares', () => {
    expect(game.squares.map(Game.adjacentMineCount)).toEqual([
      1, 1, 1,
      1, 0, 1,
      1, 1, 1,
    ]);
  });
});

test('place exact number of random mines', () => {
  const game = new Game(9, 9, 10);
  expect(game.mineCount).toBe(10);
  expect(game.squares.filter(Game.containsMine)).toHaveLength(10);
});

test('populate correct number of adjacent mines for each square', () => {
  const game = new Game(4, 4);
  //  0  1  2  3 | 1 1 1 0
  //  4  5  6  7 | 2 X 2 1
  //  8  9 10 11 | X 5 X 2
  // 12 13 14 15 | X X 3 X
  for (const index of [5, 8, 10, 12, 13, 15]) {
    game.placeMineAt(index);
  }
  expect(game.squares.map(Game.adjacentMineCount)).toEqual([
    1, 1, 1, 0,
    2, 2, 2, 1,
    3, 5, 3, 2,
    2, 3, 3, 1
  ]);
});

describe('when the player reveals a square', () => {
  let game;

  //  0  1  2  3 | 0 0 0 0
  //  4  5  6  7 | 1 1 0 0
  //  8  9 10 11 | X 2 2 1
  // 12 13 14 15 | 2 X 2 X

  beforeEach(() => {
    game = new Game(4, 4);
    game.placeMineAt(8);
    game.placeMineAt(13);
    game.placeMineAt(15);
  });

  describe('containing no mine', () => {
    test('the number of adjacent mines is shown', () => {
      game.reveal(5);
      game.squares.forEach((square, index) => {
        expect(Game.isRevealed(square)).toBe(index === 5);
      });
    });

    test('adjacent squares are revealed recursively', () => {
      game.reveal(0);
      const revealedIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11];
      game.squares.forEach((square, index) => {
        expect(Game.isRevealed(square)).toBe(revealedIndexes.includes(index));
      });
    });
  });

  describe('containing a mine', () => {
    beforeEach(() => {
      game.reveal(8);
    });

    test('the mine explodes', () => {
      expect(Game.isExploded(game.squares[8]));
    });

    test('he loses the game', () => {
      expect(game.isOver()).toBe(true);
      expect(game.isWon()).toBe(false);
    });

    test('all mines are revealed', () => {
      for (const square of game.squares) {
        expect(Game.containsMine(square)).toBe(Game.isRevealed(square));
      }
    });
  });
});

describe('When the user flags a square', () => {
  describe('and the square is not revealed', () => {
    test('the square is flagged', () => {
      const game = new Game(9, 9, 10);
      game.toggleFlag(5);
      expect(Game.isFlagged(game.squares[5])).toBeTruthy();
    });
  });

  describe('and the square is already revealed', () => {
    test('the square is not flagged', () => {
      const game = new Game(9, 9);
      game.placeMineAt(0);
      game.reveal(1);
      game.toggleFlag(1);
      expect(Game.isFlagged(game.squares[1])).toBeFalsy();
    });
  });
});
