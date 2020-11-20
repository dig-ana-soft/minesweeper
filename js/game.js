'use strict'
/*  Mine Sweeper 2020 by Ori Weinstock
    ----------------------------------

    Created on 18/11/2020, as a 1st Sprint project @Coding Academy
    All rights are reserved for the people, by the people and with
    the help of all people. 

    What's new in V1.1: (20/11/2020)
    - FIXES:
    - Fix a bug that would spread more mines if 1st clicked mouse button is "right-click"
    - Fix an issue when placing mines btn was pressed, and then depressed without finishing placing mines
    - Allowing undo 'till the end (a.k.a 'new game'...)
    - Fixed layout to not be so wide, plus several minor visual touch-ups
    - Fixed cursor to pointer on hint-lightbulbs
    - NEW FEATURES:
    - Added Ctrl-Z for undo
    - Added tool tips for bottom buttons
*/

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
    initDocumentSetup();
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
    renderSafeClicksBtn();
    // hideAlert();
}

function changeDiff(level) {
    gLevel = gLevels[level];
    gIsPlacingMines = false;
    gIsModdedGame = false;
    toggleMinesPlaceButton(false);
    restartGame();
}

function cellClick(elCell) {

    if (!gGame.isOn) return;

    var pos = getCellPosByClassId(elCell);
    if (gIsPlacingMines) {
        placeMine(pos);
        return;
    }

    if (gGame.isHintMode) {
        getHint(elCell);
        return;
    }

    var mouseButton = event.button;

    if (gGame.shownCount === 0 && mouseButton === 0) {   // if 1st click of game
        gInterval = setInterval(function () { gGame.secsPassed++; renderTimer(); }, 1000);
        if (!gIsModdedGame) spreadMines(gBoard, pos);
        gIsModdedGame = false;
    }
    
    if (mouseButton === 0) cellLeftClick(pos, elCell);
    if (mouseButton === 2) cellMark(pos, elCell);


    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) gameOver(true);
    renderBoard(gBoard);

    saveStepForUndo();
}

function cellLeftClick(pos) {

    var clickedCell = gBoard[pos.i][pos.j];
    if (clickedCell.isMarked === true) return;
    if (clickedCell.isShown === true) return;
    if (gGame.isHintMode === true) return;

    if (clickedCell.isMine === true) {
        clickedCell.isBlown = true;
        gGame.lives--;
        if (gGame.lives === 0) {                            // end game
            revealBoard(gBoard);
            renderLives();
            gameOver();
            return;
        } else {                                            // lives left...
            gGame.shownCount--;                             // avoid double ++ (marked & shown)
            gGame.markedCount++;
            renderLives();
            renderMinesLeft();
        }
    }

    clickedCell.isShown = true;                    // else - show and count
    expandNegCells(pos);
    gGame.shownCount++;
}

function cellMark(pos) {

    var clickedCell = gBoard[pos.i][pos.j];
    if (clickedCell.isShown === true) return;

    if (clickedCell.isMarked === false) {
        clickedCell.isMarked = true;
        gGame.markedCount++;
    } else {
        clickedCell.isMarked = false;
        gGame.markedCount--;
    }
    renderMinesLeft();
}


function saveStepForUndo() {
    var copyGameState = JSON.parse(JSON.stringify(gGame));
    var copyBoardState = JSON.parse(JSON.stringify(gBoard));
    gGameSaves.push({ gGameState: copyGameState, gBoardState: copyBoardState });
}

function gameOver(isVictory) {
    clearInterval(gInterval);
    gGame.isOn = false;

    var elSmiley = document.querySelector('button');
    elSmiley.innerText = (isVictory) ? '😎' : '😩'

    if (isVictory) checkForHighScore();
    else renderAlert('game over', 10000);
}

function undoStep() {
    var currStep = gGameSaves.length - 1;
    if (currStep < 1) {
        restartGame();
        return;
    }
    gGameSaves.pop();

    renderGameStep(gGameSaves[currStep - 1]);
}

function renderGameStep(saveGame) {

    // perform DEEP copy of game object/board, and keep timer running
    gBoard = JSON.parse(JSON.stringify(saveGame.gBoardState));
    var tmpTimer = gGame.secsPassed
    gGame = JSON.parse(JSON.stringify(saveGame.gGameState));
    gGame.secsPassed = tmpTimer;

    // render restored step
    renderBoard(gBoard);
    renderLives();
    renderTimer();
    renderMinesLeft();
    renderHints();
}