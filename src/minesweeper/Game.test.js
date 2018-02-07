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
      game.reveal(8);
    });

    test('the mine explodes', () => {
      expect(Grid.isExploded(game.squares[8]));
    });

    test('he loses the game', () => {
      expect(game.isOver()).toBe(true);
      expect(game.isWon()).toBe(false);
    });

    test('all mines are revealed', () => {
      for (const square of game.squares) {
        expect(Grid.containsMine(square)).toBe(Grid.isRevealed(square));
      }
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
