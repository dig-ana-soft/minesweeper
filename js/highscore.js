'use strict'

function getHighScores() {
    for (var i = 0; i < gLevels.length; i++) {
        gHighScores[i] = +localStorage.getItem(gLevels[i].name);
    } 
}

function checkForHighScore() {
    var currHighScore = gHighScores[gLevel.id];
    if (currHighScore === 0) currHighScore = Infinity;  // 0/null means no record.

    var currGameScore = gGame.secsPassed;
    if (currGameScore < currHighScore) { 
        setHighScore(gLevel.id, gLevel.name, currGameScore);
        renderAlert('NEW HIGHSCORE!!');
    } else {
        renderAlert('you win the game  ' + getRandomSmiley());
    }
}

function setHighScore(levelId, levelName, score) {
    localStorage.setItem(levelName, score);
    gHighScores[levelId] = score;
    renderHighScores();
}

function resetHighScores() {
    var ans = confirm('ARE YOU SURE?')
    if (ans) {
        localStorage.clear();
        gHighScores = [0, 0, 0];
        renderHighScores();
        renderAlert('High scores cleared')
    }
}

function renderHighScores() {
    var elHighScores = document.querySelectorAll('.high-scores li');

    for (var i = 0; i < elHighScores.length; i++) {
        var elScore = elHighScores[i].querySelector('span')
        var currScore = gHighScores[i];
        elScore.innerText = (currScore > 0) ? currScore + 's' : '-';
    }
}