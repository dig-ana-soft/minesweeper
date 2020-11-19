'use strict'

// DEBUG MODE
var gIsDebug = true;

// Constants ..................................................................
const MINE = '💣';
const FLAG = '🚩';
const HEART = '❤️';
const BROKEN_HEART = '💔';
const GREY_HEART = '♡';
const HINT_REG = `img/light-off.png`;
const HINT_GLOW = `img/light-on.png`;
const HINT_USED = `img/light-used.png`;
const SAFE_CELL = '✔️';

// Globals ....................................................................
var gBoard;
var gGameSaves;

var gLevels = [
    { id: 0, name: 'Beginner', SIZE: 4, MINES: 2, LIVES: 1 },
    { id: 1, name: 'Medium', SIZE: 8, MINES: 12, LIVES: 2 },
    { id: 2, name: 'Expert', SIZE: 12, MINES: 30, LIVES: 3 }
];
var gInterval;
var gHintInterval;
var gHighScores = [];

var gIsPlacingMines = false;
var gPlacedMines = 0;
var gIsModdedGame = false;

var gLevel = gLevels[0];
var gGame;

function init() {
    // disable right-click context menu
    window.oncontextmenu = function () { return false; }
    getHighScores();
    restartGame();
}

function restartGame() {

    clearInterval(gInterval);
    gGameSaves = [];

    gGame = {
        isOn: true,
        lives: gLevel.LIVES,
        safeClicks: 3,
        hints: 3,
        isHintMode: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };

    if (!gIsModdedGame) { 
        gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    } else {
        coverAllCells();
        updateBoardMinesCounts(gBoard);
    }
    // spreadMines(gBoard); // --> after 1st click
    renderBoard(gBoard);
    renderAllButBoard();

    document.querySelector('button').innerText = '😀';
}

function renderAllButBoard() {
    renderLives();
    renderTimer();
    renderMinesLeft();
    renderHighScores();
    renderHints();
    renderSafeClicks();
    hideAlert();
}

function changeDiff(level) {
    gLevel = gLevels[level];
    gIsPlacingMines = false;
    gIsModdedGame = false;
    initMinesButton();
    restartGame();
}

function cellClick(elCell) {
    
    if (!gGame.isOn) return;        // start a new game please.

    var pos = getCellPosByClassId(elCell);
    if (gIsPlacingMines) {
        placeMine(pos);
        return;
    }

    if (gGame.isHintMode) {
        getHint(elCell);
        return;
    }

    if (gGame.shownCount === 0) {   // if 1st click of game
        gInterval = setInterval(function () { gGame.secsPassed++; renderTimer(); }, 1000);
        if (!gIsModdedGame) spreadMines(gBoard, pos);
        gIsModdedGame = false;
        // gGameSaves.push({ gGameState: gGame, gBoardState: gBoard });
        // console.log('after 1st click, 1st saved game = ', gGameSaves[0]);
    }

    var mouseButton = event.button;
    if (mouseButton === 0) cellLeftClick(pos, elCell);
    if (mouseButton === 2) cellMark(pos, elCell);

    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) gameOver(true);
    renderBoard(gBoard);

    // Handle undo
    var copyGameState = JSON.parse(JSON.stringify(gGame));
    var copyBoardState = JSON.parse(JSON.stringify(gBoard));
    gGameSaves.push({ gGameState: copyGameState, gBoardState: copyBoardState });
    var currSaveIdx = gGameSaves.length - 1;
    // console.log('after a click, 1st saved game = ', gGameSaves[0])
    // console.log('after a click, 1st saved time = ', gGameSaves[0].gGameState.secsPassed);
    // console.log('current save:', currSaveIdx);
    // console.log('after a click, last saved time = ', gGameSaves[currSaveIdx].gGameState.secsPassed);
    // console.log('all save array: ...', gGameSaves);
}

function gameOver(isVictory) {
    clearInterval(gInterval);
    gGame.isOn = false;

    var elSmiley = document.querySelector('button');
    elSmiley.innerText = (isVictory) ? '😎' : '😩'

    if (isVictory) checkForHighScore();
    else renderAlert('game over', 10000);
}

function cellLeftClick(pos) {

    if (gBoard[pos.i][pos.j].isMarked === true) return;     // if flagged - do nothing  
    if (gBoard[pos.i][pos.j].isShown === true) return;      // if already shown - do nothing
    if (gGame.isHintMode === true) return;

    if (gBoard[pos.i][pos.j].isMine === true) {             // clicked on a mine
        gBoard[pos.i][pos.j].isBlown = true;
        gGame.lives--;
        if (gGame.lives === 0) {                            // end game
            revealBoard(gBoard);
            renderLives();
            gameOver();
            return;
        } else {                                            // lives left...
            gGame.shownCount--;                             // for now... avoid double ++
            gGame.markedCount++;                            
            renderLives();
            renderMinesLeft();
        }
    }

    gBoard[pos.i][pos.j].isShown = true;                    // else - show and count
    expandNegCells(pos);
    gGame.shownCount++;
}

function cellMark(pos) {

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
                        expandNegCells({ i: i , j: j });    // RECURSE
                    }
                }
            }
        }
        return count
    }
}

function undoStep() {
    var currStep = gGameSaves.length - 1;
    if (currStep < 1) {
        renderAlert('undo again = new game...')
        return;
    }
    gGameSaves.pop();

    console.log('before render, saved game moves count = ', gGameSaves[0].gGameState.shownCount);
    renderGame(gGameSaves[currStep - 1]); // 0 for debug

}

function renderGame(saveGame) {

    gBoard = JSON.parse(JSON.stringify(saveGame.gBoardState));
    var tmpTimer = gGame.secsPassed
    gGame = JSON.parse(JSON.stringify(saveGame.gGameState));
    gGame.secsPassed = tmpTimer;

    renderBoard(gBoard);
    renderLives();
    renderTimer();
    renderMinesLeft();
    renderHints();
    // debugger;
}