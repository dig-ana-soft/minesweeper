// Helper for random number

// -- Random numbers / letters
function getRandomInteger(min, max) {

    var numRange = max - min + 1;       // range of allowed numbers
    return Math.floor(Math.random() * numRange) + min;    // shift by min value
}
function getRandomLetter(isCapital) {

    var min = 97;       // 'a'
    var max = 122;      // 'z'

    var numRange = max - min + 1;       // range of allowed numbers
    var charCode = Math.floor(Math.random() * numRange) + min;
    var charStr = String.fromCharCode(charCode);
    if (isCapital) charStr = charStr.toUpperCase();

    return charStr;    // shift by min value
}
function getRandomItemFromArray(arr) {
    return arr[getRandomInteger(0, arr.length - 1)];
}
function getRandomFromArr(nums) {
    var idx = getRandomInteger(0, nums.length - 1)
    var num = nums[idx]
    nums.splice(idx, 1)
    return num
}
function shuffleItems(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInteger(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// -- Matrix / Array functions. create, sum etc..
function getNumsArray(min, max) {
    var arr = [];
    for (var i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
}

function getMat(rowsCount, colsCount, minValue = 0, maxValue = 10, isUniqueVals = false) {

    // Get matrix with rows/cols sent to function
    var mat = [];
    var placedValues = [];  // to hold already 'drawn' numbers. for unique values

    // Protect against arguments error - which may cause endless loop
    if (isUniqueVals && (rowsCount * colsCount) > (maxValue - minValue + 1)) {
        console.log('cannot create unique matrix greater than allowed values')
        return null;
    }

    for (var i = 0; i < rowsCount; i++) {       // iterate rows
        mat[i] = [];                            // create empty row array
        for (var j = 0; j < colsCount; j++) {   // iterate cols
            var currRandNumber = getRandomInteger(minValue, maxValue);  // get rand int

            if (isUniqueVals) {     // make sure no duplicates
                if (placedValues.indexOf(currRandNumber) === -1) {  // no duplicate
                    mat[i][j] = currRandNumber;                     // push value
                    placedValues.push(currRandNumber);              // it's here
                } else {
                    j--;  // go get another random integer.
                }

            } else {    // duplicates are allowed
                mat[i][j] = currRandNumber;                     // push value
            }
        }
    }
    return mat;
}

function sumArrCol(arr, colIdx, isLogEnabled = false) {

    // TBD - Doesn't work for (rowsCount !== colsCount) yet
    var sum = 0;

    for (var i = 0; i < arr.length; i++) {
        sum += arr[i][colIdx];
    }
    if (isLogEnabled) console.log('Summing column #' + colIdx + ' = ' + sum);
    return sum;
}

function sumArrRow(arr, rowIdx, isLogEnabled = false) {

    var sum = 0;

    for (var i = 0; i < arr[rowIdx].length; i++) {
        sum += arr[rowIdx][i];
    }

    if (isLogEnabled) console.log('Summing row #' + rowIdx + ' = ' + sum);
    return sum;
}

function matrixToObjectMap(mat) {
    var countMap = {}

    // count unique values and map them
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {

            var currVal = mat[i][j];
            var count = countMap[currVal];

            countMap[currVal] = (count) ? count + 1 : 1;
        }
    }
}

function countMatNeighbours(mat, pos, lookFor) {
    var count = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === pos.i && j === pos.j) continue
            if (mat[i][j] === lookFor) count++
        }
    }
    return count

}
// -- Sorting
function getTopValsFromMap(objMap, isLogEnabled = false, isObjReturn = false) {

    var maxCount = 0;              // Tester 

    var currKeyCount = 0;
    var maxValues = [];

    for (key in objMap) {
        // debugger;
        currKeyCount = objMap[key];
        if (currKeyCount > maxCount) {                  // found new record
            maxCount = parseInt(objMap[key]);
            maxValues = (isObjReturn) ? [{ key: key, count: currKeyCount }] : [key];
        } else if (currKeyCount === maxCount) {    // maybe force typeof later? ==/===
            if (isObjReturn) {
                maxValues.push({ key: key, count: currKeyCount });
            } else {
                maxValues.push(key);
            }
        }
    }
    if (isLogEnabled) {
        console.log('Received Object Map:', objMap);
        console.log('Most Frequent Item(s):', maxValues);
    }
    return maxValues;
}

// -- Formatting
function getFormattedDate(ts) {     // gets YYYY-MM-DD
    if (!ts) ts = Date.now();

    var date = new Date(ts);
    // console.log(date)
    var dateStr = date.getFullYear() + '-'
        + (date.getMonth() + 1) + '-' + date.getDate();
    // console.log(str)
    return dateStr
}
function getFormattedTime(ts) {     // gets HH:MM

    if (!ts) ts = Date.now();

    var date = new Date(ts);
    var timeStr = date.getHours() + ':' +
        date.getMinutes();
    return timeStr;
}

