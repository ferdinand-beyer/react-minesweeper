import React from 'react';
import Game from '../minesweeper/Game.js';
import * as GridMod from '../minesweeper/Grid.js';
import './Minesweeper.css'

const NBSP = '\u00A0';
const FLAG = '\u2691';
const BOMB = '\uD83D\uDCA3';

class Square extends React.Component {
  text() {
    const value = this.props.value;
    if (GridMod.isFlagged(value)) {
      return FLAG;
    }
    if (!GridMod.isRevealed(value)) {
      return NBSP;
    }
    if (GridMod.containsMine(value)) {
      return 'X';
    }
    const count = GridMod.adjacentMineCount(value);
    return (count === 0) ? NBSP : count;
  }

  className() {
    const value = this.props.value;
    if (GridMod.isFlagged(value)) {
      return 'flagged';
    }
    if (!GridMod.isRevealed(value)) {
      return 'active';
    }
    const classes = [
      'revealed',
    ];
    if (!GridMod.containsMine(value)) {
      classes.push('adjacent' + GridMod.adjacentMineCount(value));
    } else if (GridMod.isExploded(value)) {
      classes.push('exploded');
    }
    return classes.join(' ');
  }

  handleContextMenu(e) {
    e.preventDefault();
    this.props.onFlag();
  }

  render() {
    const { onClick } = this.props;
    return (
      <td
        className={this.className()}
        onClick={onClick}
        onContextMenu={e => this.handleContextMenu(e)}
      >
        {this.text()}
      </td>
    );
  }
}

class Grid extends React.Component {
  renderSquare(index) {
    const { squares, onSquareClick, onSquareFlag } = this.props;
    return (
      <Square
        key={index}
        value={squares[index]}
        onClick={e => onSquareClick(index)}
        onFlag={e => onSquareFlag(index)}
      />
    );
  }

  renderRows() {
    const { rows, cols } = this.props;
    const columnRange = Array.from(Array(cols).keys());

    return Array.from(Array(rows), (val, row) => {
      return (
        <tr key={row}>
          {columnRange.map(col => this.renderSquare((row * cols) + col))}
        </tr>
      );
    });
  }

  render() {
    return (
      <div className="grid">
        <table>
          <tbody>
            {this.renderRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

class Minesweeper extends React.Component {
  constructor(props) {
    super(props);

    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.handleSquareFlag = this.handleSquareFlag.bind(this);

    this.game = Game.build(9, 9, 10);
    this.state = this.getGameState();
  }

  getGameState() {
    const game = this.game;
    return {
      rows: game.rowCount,
      cols: game.columnCount,
      squares: [...game.squares],
      minesRemaining: game.remainingMineCount,
    };
  }

  syncGameState() {
    this.setState(this.getGameState());
  }

  handleSquareClick(index) {
    this.game.reveal(index);
    this.syncGameState();
  }

  handleSquareFlag(index) {
    this.game.toggleFlag(index);
    this.syncGameState();
  }

  render() {
    const { rows, cols, squares, minesRemaining } = this.state;
    return (
      <div className="Minesweeper">
        <header>
          Remaining: {minesRemaining}
        </header>
        <Grid
          rows={rows}
          cols={cols}
          squares={squares}
          onSquareClick={this.handleSquareClick}
          onSquareFlag={this.handleSquareFlag}
        />
      </div>
    );
  }
}

export default Minesweeper;
