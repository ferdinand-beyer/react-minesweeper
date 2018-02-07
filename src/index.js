import React from 'react';
import ReactDOM from 'react-dom';
import Minesweeper from './components/Minesweeper.js';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(<Minesweeper />, document.getElementById('root'));
registerServiceWorker();
