import { Game } from './Game.js';
import * as Grid from './Grid.js';

function buildGame(rowCount, columnCount, mineIndexes) {
  const grid = new Grid.Grid(rowCount, columnCount);
  for (let index of mineIndexes) {
    grid.placeMineAt(index);
  }
  return new Game(grid);
}

test('place exact number of random mines', () => {
  const game = Game.build(9, 9, 10);
  expect(game.grid.mineCount).toBe(10);
});

describe('when the player reveals a square', () => {
  let game;

  //  0  1  2  3 | 0 0 0 0
  //  4  5  6  7 | 1 1 0 0
  //  8  9 10 11 | X 2 2 1
  // 12 13 14 15 | 2 X 2 X

  beforeEach(() => {
    game = buildGame(4, 4, [8, 13, 15]);
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
      const game = Game.build(9, 9, 10);
      game.toggleFlag(5);
      expect(Game.isFlagged(game.squares[5])).toBeTruthy();
    });
  });

  describe('and the square is already revealed', () => {
    test('the square is not flagged', () => {
      const game = buildGame(9, 9, [0]);
      game.reveal(1);
      game.toggleFlag(1);
      expect(Game.isFlagged(game.squares[1])).toBeFalsy();
    });
  });
});
