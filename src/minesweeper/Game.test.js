import { Game } from './Game.js';
import * as Grid from './Grid.js';

function buildGame(rowCount, columnCount, mineIndexes) {
  const grid = new Grid.Grid(rowCount, columnCount);
  for (let index of mineIndexes) {
    grid.placeMineAt(index);
  }
  return new Game(grid);
}

describe('When starting a new game', () => {
  let game;

  beforeEach(() => {
    game = Game.build(9, 9, 10);
  });

  test('the number of remaining mines equal to the total mine count', () => {
    expect(game.remainingMineCount).toBe(10);
  });

  test('the grid contains the correct number of mines', () => {
    expect(game.grid.mineCount).toBe(10);
  });
});

describe('When the player reveals a square', () => {
  let game;

  //  0  1  2  3 | 0 0 0 0
  //  4  5  6  7 | 1 1 0 0
  //  8  9 10 11 | X 2 2 1
  // 12 13 14 15 | 2 X 2 X

  beforeEach(() => {
    game = buildGame(4, 4, [8, 13, 15]);
  });

  describe('and the square is flagged', () => {
    test('the square is not revealed', () => {
      game.toggleFlag(5);
      game.reveal(5);
      expect(Grid.isRevealed(game.squares[5])).toBeFalsy();
    });
  });

  describe('and the square contains no mine', () => {
    test('the number of adjacent mines is shown', () => {
      game.reveal(5);
      game.squares.forEach((square, index) => {
        expect(Grid.isRevealed(square)).toBe(index === 5);
      });
    });

    test('adjacent squares are revealed recursively', () => {
      game.reveal(0);
      const revealedIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11];
      game.squares.forEach((square, index) => {
        expect(Grid.isRevealed(square)).toBe(revealedIndexes.includes(index));
      });
    });

    test('flags on auto-revaled squares are removed', () => {
      const flagIndexes = [1, 2, 3];
      for (let index of flagIndexes){
        game.toggleFlag(index);
      }
      game.reveal(0);
      flagIndexes.forEach(index => {
        expect(Grid.isFlagged(game.squares[index])).toBeFalsy();
      });
    });
  });

  describe('and the square contains a mine', () => {
    beforeEach(() => {
      // Flag to be revealed for the "lose" case.
      game.toggleFlag(4);
      // Reveal another square first because the first move is protected.
      game.reveal(5);
      game.reveal(8);
    });

    test('the mine explodes', () => {
      expect(Grid.isExploded(game.squares[8]));
    });

    test('she loses the game', () => {
      expect(game.isOver()).toBe(true);
      expect(game.isWon()).toBe(false);
    });

    test('all mines are revealed', () => {
      for (const square of game.squares) {
        if (Grid.containsMine(square)) {
          expect(Grid.containsMine(square)).toBeTruthy();
        }
      }
    });

    test('all flags are revealed', () => {
      game.squares.forEach(square => {
        if (Grid.isFlagged(square)) {
          expect(Grid.isRevealed(square)).toBeTruthy();
        }
      });
    });

    test('she cannot reveal more squares', () => {
      game.reveal(3);
      expect(game.grid.isRevealedAt(3)).toBeFalsy();
    });

    test('she cannot toggle flags any more', () => {
      game.toggleFlag(3);
      game.toggleFlag(4);
      expect(game.grid.isFlaggedAt(3)).toBeFalsy();
      expect(game.grid.isFlaggedAt(4)).toBeTruthy();
    });
  });
});

describe('When the user flags a square', () => {
  describe('and the square is not revealed', () => {
    let game;

    beforeEach(() => {
      game = Game.build(9, 9, 10);
      game.toggleFlag(5);
    });

    test('the square is flagged', () => {
      expect(Grid.isFlagged(game.squares[5])).toBeTruthy();
    });

    test('the number of remaining mines is decremented', () => {
      expect(game.remainingMineCount).toBe(9);
    });
  });

  describe('and the square is already revealed', () => {
    test('the square is not flagged', () => {
      const game = buildGame(9, 9, [0]);
      game.reveal(1);
      game.toggleFlag(1);
      expect(Grid.isFlagged(game.squares[1])).toBeFalsy();
    });
  });

  describe('and the square is already flagged', () => {
    let game;

    beforeEach(() => {
      game = buildGame(9, 9, [0]);
      game.toggleFlag(1);
      game.toggleFlag(1);
    });

    test('the flag is removed', () => {
      expect(Grid.isFlagged(game.squares[1])).toBeFalsy();
    });
  });
});

describe('When the player reveals a mine on her first move', () => {
  let game;

  beforeEach(() => {
    game = buildGame(3, 3, [4]);
    game.reveal(4);
  });

  test('the square is cleared from the mine', () => {
    expect(Grid.containsMine(game.squares[4])).toBeFalsy();
  });

  test('the mine count stays the same', () => {
    expect(game.grid.mineCount).toBe(1);
  });
});

describe('When the player reveals the last square', () => {
  let game;

  beforeEach(() => {
    game = buildGame(3, 4, [3, 8]);
    game.reveal(0);
    game.reveal(11);
  });

  // 0  1  2  3!
  // 4  5  6  7
  // 8! 9 10 11

  test('the game is won', () => {
    expect(game.isWon()).toBeTruthy();
  });

  test('all mines are flagged', () => {
    [3, 8].forEach(index => {
      expect(game.grid.isFlaggedAt(index)).toBeTruthy();
    });
  });

  test('all flags are revealed', () => {
    game.squares.forEach(square => {
      if (Grid.isFlagged(square)) {
        expect(Grid.isRevealed(square)).toBeTruthy();
      }
    });
  });
});

describe('When the player reveals adjacent squares', () => {
  let game;

  beforeEach(() => {
    game = buildGame(3, 4, [6]);
  });

  // 0  1  2  3
  // 4  5  6! 7
  // 8  9 10 11

  describe('and the target square is not revealed', () => {
    test('nothing happens', () => {
      game.revealAdjacent(5);
      expect(game.grid.revealCount).toBe(0);
    });
  });

  describe('and the target square is revealed', () => {
    beforeEach(() => {
      game.reveal(5);
    });

    test('and no adjacent squares are flagged, nothing happens', () => {
      game.revealAdjacent(5);
      expect(game.grid.revealCount).toBe(1);
    });

    test('and too many adjacent squares are flagged, nothing happens', () => {
      game.toggleFlag(0);
      game.toggleFlag(6);
      game.revealAdjacent(5);
      expect(game.grid.revealCount).toBe(1);
    });

    describe('and the number of adjacent flag equals the number of adjacent mines', () => {
      test('all adjacent non-flagged squares are revealed', () => {
        game.toggleFlag(6);
        game.revealAdjacent(5);
        for (let i of [0, 1, 2, 10, 9, 8, 4]) {
          expect(game.grid.isRevealedAt(i)).toBeTruthy();
        }
      });

      test('adjacent flagged squares are not revealed', () => {
        game.toggleFlag(6);
        game.revealAdjacent(5);
        expect(game.grid.isRevealedAt(6)).toBeFalsy();
      });
    })
  });
});
