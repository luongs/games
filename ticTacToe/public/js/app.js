/*jslint node: true */
/*jshint esversion: 6 */    // allow es6 syntax
/*jslint browser:true */    // ignore document error
"use strict";

function drawBoard() {
    const canvas = document.getElementById('canvas');
    const context = document.getElementById('canvas').getContext('2d');
    const msg = document.getElementById('msg');
    const restartButton = document.getElementById('restart');
    const multiBtn = document.getElementById('multi');
    const N = 3;
    let socket = io();
    let playerNum = 0;
    let currentMoveIndex = 0;


    socket.on('connectMsg', function(data){
        console.log("Number of online users: "+data);
        playerNum = data;

        if (playerNum > 1){
            multiBtn.style.visibility = "visible";
        }
    });

    socket.on('emitClearCanvas', function(data){
        console.log("Clearing canvas for multiplayer");
        clearCanvas();
        gameArr = createGameArr();
        freeSpaceArr = createFreeSpaceArr(gameArr);
        currentMoveIndex = 0;
    });

    socket.on('disconnect', function(data){
        console.log("Number of online users: "+data);
        playerNum = data;
    });

    socket.on('emitWinner', function(data){
        msg.innerHTML = data;
        freeSpaceArr = freezeBoard(freeSpaceArr);
    });


    function createGameArr(){
        let index = 0;
        let gameArr = [];

        for (let i=0; i<N; i++ ){
            let y = i+1;

            for (let j=0; j<N; j++){
                let x = j+1;

                let coordArr = [(50*(x+1)), (50*(y+1))];
                gameArr[index++] = coordArr;

                context.strokeRect(50*x, 50*y, 50, 50);
            }
        }
        return gameArr;
    }

    let FREE = 0;
    function createFreeSpaceArr(gameArr){
        let freeSpaceArr = [];
        for (let i=0; i<gameArr.length; i++){
            freeSpaceArr[i] = FREE;
        }
        return freeSpaceArr;
    }

    // Setup board
    let gameArr = createGameArr();
    let freeSpaceArr = createFreeSpaceArr(gameArr);


    let O = -1;
    let X = 1;
    let O_WIN = -3;
    let X_WIN = 3;
    let FREEZE_MOVE = false;

    socket.on('emitQuadrant', function(data){
        currentMoveIndex = data.moveIndex;

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

    //TODO:
    //      Emit restart to mult sessions

    // Majority of game logic
    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = getXCoordInQuadrant(gameArr, mouseX, N);
        let y = getYCoordInQuadrant(gameArr, mouseY, N);
        let index = getIndex(x, y, gameArr);

        let data = {xKey: x, yKey: y, indexKey: index};

        if (freeSpaceArr[index] == FREE){

            if (playerNum === 1 || FREEZE_MOVE === false) {

                if (currentMoveIndex % 2 === 0){
                    drawCircle(x, y);
                    freeSpaceArr[index] = O;
                    data.moveIndex = currentMoveIndex++;
                    socket.emit('pickQuadrant', data);
                }
                else {
                    drawX(x, y);
                    freeSpaceArr[index] = X;
                    data.moveIndex = currentMoveIndex++;
                    socket.emit('pickQuadrant', data);
                }
                FREEZE_MOVE = true;
            }

            let winner = checkWinner(freeSpaceArr);
            const X_WIN_MSG = "X is the winner!";
            const O_WIN_MSG = "O is the winner!";
            if (winner == X_WIN){

                socket.emit('alertWinner', X_WIN_MSG);
                msg.innerHTML = X_WIN_MSG;
                freeSpaceArr = freezeBoard(freeSpaceArr);
            }
            else if (winner == O_WIN){
                socket.emit('alertWinner', O_WIN_MSG);
                msg.innerHTML = O_WIN_MSG;
                freeSpaceArr = freezeBoard(freeSpaceArr);
            }
        }
    };

    canvas.addEventListener("mousedown", onmousedown);

    function getXCoordInQuadrant(maxArray, pos, N) {

        for (let i=0; i<N; i++){
            if (maxArray[i][0]>pos){
                return maxArray[i][0];
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
                if (x == maxArray[i][0] && y == maxArray[i][1]){
                    index = i;
                    return index;
                }
            }
        }

        return index;
    }

    function drawCircle(x, y) {
        context.lineWidth = 2;
        context.beginPath();
        context.arc(x-25, y-25, 20, 0, 2*Math.PI);
        context.stroke();
    }

    function drawX(x, y) {
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x-10, y-10);
        context.lineTo(x-40, y-40);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.moveTo(x-10, y-40);
        context.lineTo(x-40, y-10);
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

    function freezeBoard(freeSpaceArr){
        return freeSpaceArr.fill(-2);
    }

    const WHITE = "#ffffff";
    function clearCanvas(){
        context.fillStyle = WHITE;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height );

    }

    restartButton.onclick = function ( e ){
        clearCanvas();
        gameArr = createGameArr();
        freeSpaceArr = createFreeSpaceArr(gameArr);
    };

    multiBtn.onclick = function ( e ){
        socket.emit('clearCanvas', '');
    };
}
