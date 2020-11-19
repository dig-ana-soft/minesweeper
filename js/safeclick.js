'use strict'

function getSafeCells() {
    var safeCells = [];
    
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isShown === false && 
                currCell.isMine === false &&
                currCell.isMarked === false) {
                var pos = { i: i, j: j };
                safeCells.push(pos);
                }
        }
    }
    return safeCells;
}

function safeBtnClick() {
    if (gGame.safeClicks === 0) {
        renderAlert('no more safe clicks ❌')
        return;
    }
    if (gGame.shownCount === 0) { 
        renderAlert('please start game first 🕹')
        return;
    }
    
    var safeCells = getSafeCells();
    if (safeCells.length === 0) {
        renderAlert('no more safe cells...!?');
        return;
    }
    var idx = getRandomInteger(0, safeCells.length - 1);
    
    var pos = safeCells[idx];
    renderSafeCell(pos, SAFE_CELL);
    gGame.safeClicks--;
    setTimeout(function () { hideSafeCell(pos); }, 1000);
    renderSafeClicks();
}

function hideSafeCell(pos) {
    renderSafeCell(pos);
}

function renderSafeClicks() {
    var elSafeBtnSpan = document.querySelector('.right-bottom span');
    elSafeBtnSpan.innerText = gGame.safeClicks;
}
