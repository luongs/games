/*jslint node: true */
/*jshint esversion: 6 */    // allow es6 syntax
/*jslint browser:true */    // ignore document error
"use strict";

function getCanvas() {
    return document.getElementById('canvas');
}

function getContext() {
    return document.getElementById('canvas').getContext('2d');
}

function exec(canvas, context) {
    const msg = document.getElementById('msg');
    const singleBtn = document.getElementById('single');
    const multiBtn = document.getElementById('multi');
    const N = 3;
    let socket = io();
    let playerNum = 0;
    let currentMoveIndex = 0;
    let isMultiplayer = false;


    socket.on('connectMsg', function(data){
        console.log("Number of online users: "+data);
        playerNum = data;

        if (playerNum > 1){
            multiBtn.style.visibility = "visible";
        }
    });

    socket.on('emitStartSingleplayer', function(data){
        isMultiplayer = data.isMultiplayer;
        clearCanvas(context, canvas);
        gameArr = createGameArr(context, N);
        freeSpaceArr = createFreeSpaceArr(gameArr);
        eraseOuterSquare(context);
        currentMoveIndex = 0;
        msg.innerHTML = "";
        multiBtn.innerHTML = "Multiplayer";
        singleBtn.innerHTML = "Restart";
        msg.innerHTML = data.msg;
        FREEZE_MOVE = false;
    });

    socket.on('emitStartMultiplayer', function(data){
        isMultiplayer = data;
        clearCanvas(context, canvas);
        gameArr = createGameArr(context, N);
        freeSpaceArr = createFreeSpaceArr(gameArr);
        eraseOuterSquare(context);
        currentMoveIndex = 0;
        msg.innerHTML = "";
        multiBtn.innerHTML = "Restart";
        singleBtn.innerHTML = "Single player";
        FREEZE_MOVE = false;

    });

    socket.on('disconnect', function(data){
        console.log("Number of online users: "+data);
        playerNum = data;

        if (playerNum === 1){
            multiBtn.style.visibility = "hidden";
            isMultiplayer = false;
        }
    });

    socket.on('emitWinner', function(data){
        msg.innerHTML = data;
        freeSpaceArr = freezeBoard(freeSpaceArr);
    });



    // Setup board
    let gameArr = createGameArr(context, N);
    let freeSpaceArr = createFreeSpaceArr(gameArr);
    eraseOuterSquare(context);


    let O = -1;
    let X = 1;
    let O_WIN = -3;
    let X_WIN = 3;
    let FREEZE_MOVE = false;

    socket.on('emitQuadrant', function(data){
        currentMoveIndex = data.moveIndex;
        msg.innerHTML = "";

        if (currentMoveIndex % 2 === 0){
            drawCircle(data.xKey, data.yKey);
            freeSpaceArr[data.indexKey] = O;
        }
        else {
            drawX(data.xKey, data.yKey);
            freeSpaceArr[data.indexKey] = X;
        }

        FREEZE_MOVE = false;
        currentMoveIndex++;
    });

    //TODO: Single player AI
    //      Refactor

    // Majority of game logic
    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = getXCoordInQuadrant(gameArr, mouseX, N);
        let y = getYCoordInQuadrant(gameArr, mouseY, N);
        let index = getIndex(x, y, gameArr);

        let data = {xKey: x, yKey: y, indexKey: index};

        if (freeSpaceArr[index] == FREE){

            if (FREEZE_MOVE === false) {

                if (currentMoveIndex % 2 === 0){
                    drawCircle(x, y);
                    freeSpaceArr[index] = O;
                }
                else {
                    drawX(x, y);
                    freeSpaceArr[index] = X;
                }


                if (isMultiplayer){
                    data.moveIndex = currentMoveIndex;
                    socket.emit('pickQuadrant', data);
                    msg.innerHTML = "Waiting...";
                    FREEZE_MOVE = true;
                }

                currentMoveIndex++;
            }

            let winner = checkWinner(freeSpaceArr);
            const X_WIN_MSG = "X is the winner!";
            const O_WIN_MSG = "O is the winner!";

            if (winner == X_WIN){
                if (isMultiplayer){
                    socket.emit('alertWinner', X_WIN_MSG);
                }
                msg.innerHTML = X_WIN_MSG;
                freeSpaceArr = freezeBoard(freeSpaceArr);
            }
            else if (winner == O_WIN){
                if (isMultiplayer){
                    socket.emit('alertWinner', O_WIN_MSG);
                }
                msg.innerHTML = O_WIN_MSG;
                freeSpaceArr = freezeBoard(freeSpaceArr);
            }
        }
    };

    canvas.addEventListener("mousedown", onmousedown);

    const X_OFFSET = 100;   // board is shifted 100 px over from css
    function getXCoordInQuadrant(maxArray, pos, N) {

        for (let i=0; i<N; i++){
            let xBound = maxArray[i][0]+X_OFFSET;
            if (xBound > pos){
                return xBound;
            }
        }
        return 0;
    }

    function getYCoordInQuadrant(maxArray, pos, N) {

        let yIndex = 0;
        for (let i=0; i<N; i++){

            if (maxArray[yIndex][1]>pos){
                return maxArray[yIndex][1];
            }

            yIndex += 3;
        }
        return 0;
    }

    function getIndex(x, y, maxArray){
        let index = -1;

        for (let i=0; i<maxArray.length; i++){
            for (let j=0; j<maxArray[i].length; j++){
                let xBound = maxArray[i][0]+X_OFFSET;
                if (x == xBound && y == maxArray[i][1]){
                    index = i;
                    return index;
                }
            }
        }

        return index;
    }

    const YELLOW = "#f1c40f";
    function drawCircle(x, y) {
        context.strokeStyle = YELLOW;
        context.lineWidth = 8;
        context.beginPath();
        context.arc(x-150, y-50, 30, 0, 2*Math.PI);
        context.stroke();
    }

    const GREEN = "#16a085";
    function drawX(x, y) {
        context.strokeStyle = GREEN;
        context.lineWidth = 8;
        context.beginPath();
        context.moveTo(x-180, y-80);
        context.lineTo(x-120, y-20);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.moveTo(x-180, y-20);
        context.lineTo(x-120, y-80);
        context.closePath();
        context.stroke();
    }

    function checkWinner(freeSpaceArr) {

        let total = 0;

        total = checkHorizontal(freeSpaceArr);
        if (total == X_WIN || total == O_WIN){
            return total;
        }

        total = 0;
        total = checkVertical(freeSpaceArr);
        if (total == X_WIN || total == O_WIN){
            return total;
        }

        total = 0;
        total = checkDiagonal(freeSpaceArr);
        if (total == X_WIN || total == O_WIN){
            return total;
        }

        return 0;
    }

    function checkHorizontal(freeSpaceArr){
        let index = 0;
        let total = 0;

        for (let i=0; i<freeSpaceArr.length; i++){
            if (index%N === 0){
                total = 0;
            }

            total += freeSpaceArr[index];
            index++;

            if (total == X_WIN || total == O_WIN){
                return total;
            }
        }
        return total;
    }

    function checkVertical(freeSpaceArr){
        let index = 0;
        let total = 0;

        for (let i=0; i<freeSpaceArr.length; i++){
            if (index >= freeSpaceArr.length){
                index -= 8; // 8 will set index to the start of adj row
                total = 0;
            }
            total += freeSpaceArr[index];
            index += N;

            if (total == X_WIN || total == O_WIN){
                return total;
            }
        }
        return total;
    }

    function checkDiagonal(freeSpaceArr){
        let index = 0;
        let total = 0;

        total = freeSpaceArr[index] + freeSpaceArr[index+4] +
            freeSpaceArr[index+8];
        if (total == X_WIN || total == O_WIN){
            return total;
        }

        index = 2;
        total = freeSpaceArr[index] + freeSpaceArr[index+2] +
            freeSpaceArr[index+4];
        if (total == X_WIN || total == O_WIN){
            return total;
        }
        return total;

    }

    singleBtn.onclick = function ( e ){
        clearCanvas(context, canvas);
        gameArr = createGameArr(context, N);
        freeSpaceArr = createFreeSpaceArr(gameArr);
        eraseOuterSquare(context);
        currentMoveIndex = 0;
        msg.innerHTML = "";
        multiBtn.innerHTML = "Multiplayer";
        singleBtn.innerHTML = "Restart";
        FREEZE_MOVE = false;

        // Reset board if a multiplayer game was started
        if (isMultiplayer){
            let data = {isMultiplayer: false,
                    msg: "Other player started single player"};
            socket.emit('startSingleplayer', data);
        }
    };

    multiBtn.onclick = function ( e ){
        isMultiplayer = true;
        socket.emit('startMultiplayer', isMultiplayer);
    };
}

//==============================================================
// Board functions
const GREY = "#C0C0C0";
let createGameArr = function(context, numColumns){
    let index = 0;
    let gameArr = [];

    for (let i=0; i<numColumns; i++ ){
        let y = i+1;

        for (let j=0; j<numColumns; j++){
            let x = j+1;

            let coordArr = [(100*(x+1)), (100*(y+1))];
            gameArr[index++] = coordArr;

            context.lineWidth = 2;
            context.strokeStyle = GREY;
            context.lineCap = "round";
            context.strokeRect(100*x, 100*y, 100, 100);
        }
    }
    return gameArr;
};

const WHITE = "#FFFFFF";
let eraseOuterSquare = function(context){
    context.strokeStyle = WHITE;
    context.lineWidth = 4;
    context.strokeRect(100, 100, 300, 300);
};


const FREE = 0;
function createFreeSpaceArr(gameArr){
    let freeSpaceArr = [];
    for (let i=0; i<gameArr.length; i++){
        freeSpaceArr[i] = FREE;
    }
    return freeSpaceArr;
}

const TAKEN = -2;
function freezeBoard(freeSpaceArr){
    return freeSpaceArr.fill(TAKEN);
}

function clearCanvas(context, canvas){
    context.fillStyle = WHITE;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height );

}


//==============================================================

window.onload = function (e){

    const canvas = getCanvas();
    const context = getContext();
    exec(canvas, context);

};

