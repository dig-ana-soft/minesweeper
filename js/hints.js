'use strict'

var blinkOnOff = false;
var gElCurrHint;
var gShownCells = [];

function renderHints() {
    var strHtml = '';
    var elHearts = document.querySelector('.hints');

    for (var i = 0; i < gGame.hints; i++) {

        strHtml += `<img class="hint-img" src="${HINT_REG}" onclick="hintClick(this)">`;
    }
    elHearts.innerHTML = strHtml;
}

function hintClick(elHint) {

    if (!gGame.isOn) return;
    if (gGame.shownCount === 0) {
        renderAlert('start playing before asking for hint...');
        return;
    }

    var isUsedAlready = elHint.classList.contains('used');

    if (gGame.isHintMode) {
        clearInterval(gHintInterval);
        gGame.isHintMode = false;
        elHint.src = HINT_REG;
        return;
    }
    if (!isUsedAlready) {
        gElCurrHint = elHint;
        gGame.isHintMode = true;
        elHint.src = HINT_GLOW;
        gHintInterval = setInterval(function () { blinkLight(elHint); }, 400);
    }
}

function blinkLight(elHint) {
    if (blinkOnOff) {
        elHint.src = HINT_GLOW;
    } else {
        elHint.src = HINT_REG;
    }
    blinkOnOff = !blinkOnOff;
}

function getHint(elCell) {
    var pos = getCellPosByClassId(elCell);
    revealNegs(pos);
    clearInterval(gHintInterval);

    // Model
    gGame.isHintMode = false;
    gGame.hints--;
    // Dom
    gElCurrHint.src = HINT_USED;
    gElCurrHint.classList.add('used');
}

function revealNegs(pos) {
    gShownCells = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            // console.log('revealing:', i, j);
            if (gBoard[i][j].isShown) {
                continue;
            } else {
                gBoard[i][j].isShown = true;
                gShownCells.push({ i: i, j: j });
            }
        }
    }
    renderBoard(gBoard);
    setTimeout(hideRevealdCells, 1000);
}

function hideRevealdCells() {
    for (var n = 0; n < gShownCells.length; n++) {
        var i = gShownCells[n].i;
        var j = gShownCells[n].j;
        gBoard[i][j].isShown = false;
    }

    renderBoard(gBoard);
}
