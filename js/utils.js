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
    var cellClass = `cell-${pos.i}-${pos.j}`;
    console.log('cell class:', cellClass)
    var elCell = document.querySelector(cellClass);
    console.log('render cell:', elCell);
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
// Expanding neighbour cells ..................................................
