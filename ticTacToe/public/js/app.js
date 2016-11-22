/*jslint node: true */
/*jshint esversion: 6 */    // allow es6 syntax
/*jslint browser:true */    // ignore document error
"use strict";

function drawBoard() {
    const canvas = document.getElementById('canvas');
    const context = document.getElementById('canvas').getContext('2d');
    const msg = document.getElementById('msg');
    const restartButton = document.getElementById('restart');
    const N = 3;
    let socket = io();
    let numUsers = 0;


    socket.on('connectMsg', function(data){
        console.log("Number of online users: "+data);
        numUsers = data;
    });

    socket.on('disconnect', function(data){
        console.log("Number of online users: "+data);
        numUsers = data;
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


    let isCircle = true;
    let O = -1;
    let X = 1;
    let O_WIN = -3;
    let X_WIN = 3;
    let FREEZE_MOVE = false;

    socket.on('emitQuadrant', function(data){
        if (data.isCircleKey){
            drawCircle(data.xKey, data.yKey);
            freeSpaceArr[data.indexKey] = O;
        }
        else {
            drawX(data.xKey, data.yKey);
            freeSpaceArr[data.indexKey] = X;
        }
        FREEZE_MOVE = false;
    });

    //TODO:
    //      Alternate X and O's
    //      Emit restart to mult sessions

    // Majority of game logic
    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = getXCoordInQuadrant(gameArr, mouseX, N);
        let y = getYCoordInQuadrant(gameArr, mouseY, N);
        let index = getIndex(x, y, gameArr);

        let data = {xKey: x, yKey: y, indexKey: index};
        console.log("Freeze move val"+FREEZE_MOVE);

        if (freeSpaceArr[index] == FREE){

            if (numUsers === 1 || FREEZE_MOVE === false) {

                if (isCircle){
                    drawCircle(x, y);
                    freeSpaceArr[index] = O;
                    data.isCircleKey= isCircle;
                    data.waitForMove = false;
                    socket.emit('pickQuadrant', data);
                    isCircle = false;
                }
                else {
                    drawX(x, y);
                    freeSpaceArr[index] = X;
                    data.isCircleKey = isCircle;
                    data.waitForMove = false;
                    socket.emit('pickQuadrant', data);
                    isCircle = true;
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
}
