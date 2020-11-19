/*  Mine Sweeper 2020 by Ori Weinstock
    ----------------------------------

    Created on 18/11/2020, as a 1st Sprint project @Coding Academy
    All rights are reserved for the people, by the people and with
    the help of all people. */


// Array / Board functions ....................................................
function buildBoard(rowsCount, colsCount) {
    var mat = [];
    for (var i = 0; i < rowsCount; i++) {       // iterate rows
        mat[i] = [];                            // create empty row array
        for (var j = 0; j < colsCount; j++) {   // iterate cols
            mat[i][j] = {                       // insert cell object
                isMine: false,                  // with default values
                isShown: false,
                isMarked: false,
                isBlown: false,
                minesAroundCount: 0
            };
        }
    }
    return mat;
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {       // iterate rows
        strHtml += '<tr>';                      // create new table row 
        for (var j = 0; j < board[0].length; j++) {   // iterate cols
            var currCellValue = getCellInnerText(board, i, j);
            var className = `cell-${i}-${j}`;
            if (board[i][j].isShown === false) className += ' covered';
            if (board[i][j].isBlown === true) className += ' blown';
            strHtml += `<td class="${className}" onmousedown="cellClick(this)">${currCellValue}</td>`
        }
        strHtml += '</tr>';                     // end table row 
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
}

function revealBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].isShown = true;
        }
    }
}

// Cell Functions .............................................................
function renderSafeCell(pos, value = null) {
    var elCell = getCellElByPosition(pos);

    if (!value) {
        var currCell = gBoard[pos.i][pos.j];
        if (currCell.isShown === false) value =' ';
        else if (currCell.minesAroundCount > 0) value = currCell.minesAroundCount;
    }

    elCell.innerText = value;
}

function countMinesAroundCell(board, pos) {
    var count = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isMine === true) {
                count++;
            }
        }
    }
    return count;
}

function getCellInnerText(board, i, j) {

    var currCell = board[i][j];

    if (currCell.isMarked === true) {
        return FLAG;
    }
    if (currCell.isShown === false) return ' ';
    if (currCell.isMine === true) {
        return MINE;
    } else if (currCell.isMarked === true) {
        return FLAG;
    } else {
        var minesAround = currCell.minesAroundCount
        return (minesAround) ? minesAround : ' ';
    }
}

function getCellPosByClassId(elCell) {
    var strClass = elCell.classList[0].split("-");  // gets the 1st class "cell-1-4" and splits
    var pos = { i: +strClass[1], j: +strClass[2] };   // create position object for model
    // if (gIsDebug) console.log('position receieved from cell click:', pos);
    return pos;
}

function getCellElByPosition(pos) {
    var cellClass = `.cell-${pos.i}-${pos.j}`;
    var elCell = document.querySelector(cellClass);
    return elCell;
}

// Update Status Bar ..........................................................
function renderMinesLeft() {
    var elMinesLeft = document.querySelectorAll('.status-bar span')[0];
    elMinesLeft.innerText = gLevel.MINES - gGame.markedCount;
}
function renderTimer() {
    var elMinesLeft = document.querySelectorAll('.status-bar span')[1];
    var strNumber = '';

    if (gGame.secsPassed < 10) strNumber = '00' + gGame.secsPassed;
    else if (gGame.secsPassed < 100) strNumber = '0' + gGame.secsPassed;
    else strNumber += gGame.secsPassed;

    elMinesLeft.innerText = strNumber;
}
function renderLives() {
    var elHearts = document.querySelector('.hearts');
    elHearts.innerText = (gGame.lives) ? HEART.repeat(gGame.lives) : BROKEN_HEART;
}

// Console table for debugging
function consoleRender(logStr) {

    console.log('printing table from func:', logStr);
    var tbl = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        tbl[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            // console.log(gBoard[i][j].minesAroundCount);
            if (gBoard[i][j].isMine) tbl[i][j] = 'X';
            else tbl[i][j] = ' ';
        }
    }
    // console.clear();
    console.table(tbl);
}

// Alerts .....................................................................
function renderAlert(msg, duration = 4000) {
    msg = msg.toUpperCase();
    var elMsg = document.querySelector('.message');
    elMsg.innerText = msg;
    elMsg.classList.add('horiz-move');
    elMsg.style.visibility = 'visible';
    elMsg.style.fontSize = '20px';
    setTimeout(hideAlert, duration);
}

function hideAlert() {
    var elMsg = document.querySelector('.message');
    elMsg.style.visibility = 'hidden';
    elMsg.style.fontSize = '18px';
    elMsg.classList.remove('horiz-move');

}

// Random funcs ...............................................................
function getRandomInteger(min, max) {

    var numRange = max - min + 1;       // range of allowed numbers
    return Math.floor(Math.random() * numRange) + min;    // shift by min value
}

function getRandomSmiley() {
    var arr = ['😬', '😇', '😃', '🤩', '🥳', '🤠', '👍', '🎓']
    return arr[getRandomInteger(0, arr.length - 1)];
}