import React from 'react';
import Game from '../MinesweeperGame';
import './Minesweeper.css'

const NBSP = '\u00A0';

class Square extends React.Component {
  text() {
    const value = this.props.value;
    if (Game.isFlagged(value)) {
      return '\u2691';
    }
    if (!Game.isRevealed(value)) {
      return NBSP;
    }
    if (Game.containsMine(value)) {
      return 'X';
    }
    const count = Game.adjacentMineCount(value);
    return (count === 0) ? NBSP : count;
  }

  className() {
    const value = this.props.value;
    if (!Game.isRevealed(value)) {
      return 'active';
    }
    const classes = [
      'revealed',
    ];
    if (!Game.containsMine(value)) {
      classes.push('adjacent' + Game.adjacentMineCount(value));
    } else if (Game.isExploded(value)) {
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

    this.game = new Game(16, 16, 40);
    this.state = this.getGameState();
  }

  getGameState() {
    return {
      rows: this.game.rowCount,
      cols: this.game.columnCount,
      squares: [...this.game.squares],
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
    const { rows, cols, squares } = this.state;
    return (
      <div className="Minesweeper">
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
