'use strict'

// DEBUG MODE
var gIsDebug = true;

// Constants ..................................................................
const MINE = '💣';
const FLAG = '🚩';
const HEART = '❤️';
const BROKEN_HEART = '💔';

// Globals ....................................................................
var gBoard;
var gUndoBoards = [];

var gLevels = [
    { id: 'Beginner', SIZE: 4, MINES: 2, LIVES: 1, highScore: 0},
    { id: 'Medium', SIZE: 8, MINES: 12, LIVES: 2, highScore: 0},
    { id: 'Expert', SIZE: 12, MINES: 30, LIVES: 3, highScore: 0}
];
var gInterval;

var gLevel = gLevels[0];
var gGame;

function init() {

    // disable right-click context menu
    window.oncontextmenu = function () { return false; }
    restartGame();
}

function restartGame() {

    clearInterval(gInterval);

    gGame = {
        isOn: true,
        lives: gLevel.LIVES,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };

    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    // spreadMines(gBoard);
    renderBoard(gBoard);
    renderLives();
    renderTimer();
    renderMinesLeft();
    document.querySelector('button').innerText = '😀';

    console.log(gBoard)

    
}

function changeDiff(level) {
    gLevel = gLevels[level];
    restartGame();
}
function cellClick(elCell) {
    
    if (!gGame.isOn) return;        // start a new game please.

    var pos = getCellPosByClassId(elCell);

    console.log('cell click func:')
    console.log('gGame.shownCount', gGame.shownCount)
    console.log('pos', pos)
    if (gGame.shownCount === 0) {   // starts the timer after 1st click
        gInterval = setInterval(function () { gGame.secsPassed++; renderTimer(); }, 1000);
        spreadMines(gBoard, pos)
    }

    var mouseButton = event.button;

    if (mouseButton === 0) cellLeftClick(pos, elCell);
    if (mouseButton === 2) cellMark(pos, elCell);

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) gameOver(true);
    renderBoard(gBoard);

    // Handle undo
    gUndoBoards.push(gBoard);
    // console.log(gUndoBoards)
}

function gameOver(isVictory) {
    clearInterval(gInterval);
    gGame.isOn = false;

    var elSmiley = document.querySelector('button');
    elSmiley.innerText = (isVictory) ? '😎' : '😩'
}

function cellLeftClick(pos, elCell) {
    if (gBoard[pos.i][pos.j].isMarked === true) return;     // if flagged - do nothing  
    if (gBoard[pos.i][pos.j].isShown === true) return;      // if already shown - do nothing

    if (gBoard[pos.i][pos.j].isMine === true) {             // clicked on a mine
        // debugger;
        gBoard[pos.i][pos.j].isBlown = true;
        gGame.lives--;
        if (gGame.lives === 0) {
            revealBoard(gBoard);
            renderLives();
            gameOver();
            return;
        } else {
            renderLives();
        }
    }

    gBoard[pos.i][pos.j].isShown = true;                    // else - show and count
    expandNegCells(pos);
    gGame.shownCount++;
}

function cellMark(pos, elCell) {

    // if cell is shown - can't flag
    if (gBoard[pos.i][pos.j].isShown === true) return;

    // else: toggle, and update count
    if (gBoard[pos.i][pos.j].isMarked === false) {
        gBoard[pos.i][pos.j].isMarked = true;
        gGame.markedCount++;
    } else {
        gBoard[pos.i][pos.j].isMarked = false;
        gGame.markedCount--;
    }
    renderMinesLeft();
}

function spreadMines(board, pos) {
    for (var n = 0; n < gLevel.MINES; n++) {
        var i = getRandomInteger(0, gLevel.SIZE - 1);
        var j = getRandomInteger(0, gLevel.SIZE - 1);

        // handle 1st click before actually spreading the mines
        if (board[i][j].isShown === true) {
            n--;
            continue;
        }
        if (board[i][j].isMine === true) n--;
        else board[i][j].isMine = true;
    }
    updateBoardMinesCounts(board);
}

function updateBoardMinesCounts(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var pos = { i: i, j: j };
            board[i][j].minesAroundCount = countMinesAroundCell(board, pos);
        }
    }
}

function expandNegCells(pos) {

    if (pos.i < 0 || pos.i > gLevel.SIZE - 1 || pos.j < 0 || pos.j > gLevel.SIZE - 1) return;

    if (gBoard[pos.i][pos.j].minesAroundCount === 0) {

        var count = 0
        for (var i = pos.i - 1; i <= pos.i + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue
            for (var j = pos.j - 1; j <= pos.j + 1; j++) {
                if (j < 0 || j > gBoard[0].length - 1) continue
                if (i === pos.i && j === pos.j) continue
                if (gBoard[i][j].isMine === false) {
                    if (!gBoard[i][j].isShown) {
                        gBoard[i][j].isShown = true;
                        gGame.shownCount++;
                        expandNegCells({ i: i, j: (j + 1) });
                        expandNegCells({ i: i, j: (j - 1) });
                        expandNegCells({ i: (i + 1), j: j });
                        expandNegCells({ i: (i - 1), j: j });
                        expandNegCells({ i: i , j: j });
                    }
                    // expandNegCells({ i: i, j: j });
                }
            }
        }
        return count
    }
}