'use strict'

function spreadMines(board, pos) {

    for (var n = 0; n < gLevel.MINES; n++) {
        var i = getRandomInteger(0, gLevel.SIZE - 1);
        var j = getRandomInteger(0, gLevel.SIZE - 1);

        // handle 1st click before actually spreading the mines
        if (i === pos.i && j === pos.j) {
            n--;
            continue;
        }
        // avoid duplicates
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

// Manual placement ...........................................................
function placeMines() {
    restartGame();
    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    gIsPlacingMines = true;
    highlightMinesButton();

    uncoverAllCells();
}
function placeMine(pos) {
    // Model
    gBoard[pos.i][pos.j].isMine = true;
    gPlacedMines++;
    gGame.markedCount++;    // re-use global for 'alike' need...
    // Dom
    var elCell = getCellElByPosition(pos);
    elCell.innerHTML = MINE;
    renderMinesLeft();

    // Is finished placing?
    if (gGame.markedCount === gLevel.MINES) {
        gIsPlacingMines = false;
        renderAlert('finished placing mines');
        gIsModdedGame = true;
        setTimeout(function () { renderAlert('proccessing field setup'); }, 2000);
        setTimeout(restartGame, 4000);
        initMinesButton();
    }
}

// Todo: change to toggle :)
function uncoverAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isShown = true;
        }
    }
    renderBoard(gBoard);
}

function coverAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isShown = false;
        }
    }
    renderBoard(gBoard);
}

// Todo: change to toggle :)
function highlightMinesButton() {
    var elButton = document.querySelectorAll('.right-bottom button')[2];
    elButton.style.backgroundColor = 'tomato';
}
function initMinesButton() {
    var elButton = document.querySelectorAll('.right-bottom button')[2];
    elButton.style.backgroundColor = 'cadetblue';
}