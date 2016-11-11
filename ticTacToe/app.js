/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

function drawBoard() {
    const canvas = document.getElementById('canvas');
    const context = document.getElementById('canvas').getContext('2d');
    const N = 3;

    let gameArr = [];
    let index = 0;
    // Create game grid
    for (let i=0; i<N; i++ ){
        let y = i+1;

        for (let j=0; j<N; j++){
            let x = j+1;

            let coordArr = [(50*(x+1)), (50*(y+1))];
            gameArr[index++] = coordArr;

            context.strokeRect(50*x, 50*y, 50, 50);
        }
    }

    // Create empty filled array
    let FREE = 0;
    let freeSpaceArr = [];
    for (let i=0; i<gameArr.length; i++){
        freeSpaceArr[i] = FREE;
    }


    let isCircle = true;
    let O = -1;
    let X = 1;
    let O_WIN = -3;
    let X_WIN = 3;

    // Majority of game logic
    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = getXCoordInQuadrant(gameArr, mouseX, N);
        let y = getYCoordInQuadrant(gameArr, mouseY, N);
        let index = getIndex(x, y, gameArr);

        if (freeSpaceArr[index] == FREE){

            if (isCircle){
                drawCircle(x, y);
                freeSpaceArr[index] = O;
                isCircle = false;
            }
            else {
                drawX(x, y);
                freeSpaceArr[index] = X;
                isCircle = true;
            }

            let winner = checkWinner(freeSpaceArr);
            if (winner == X_WIN){
                // TODO: Stop game
                //       clear board and prompt
                console.log("X is the winner!");
            }
            else if (winner == O_WIN){
                console.log("O is the winner!");
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
        let index = 0;

        // check horizontal
        for (let i=0; i<freeSpaceArr.length; i++){
            if (total == X_WIN || total == O_WIN){
                return total;
            }

            if (index == N){
                index = 0;
                total = 0;
            }
            else {
                total += freeSpaceArr[index];
                index++;
            }
        }

        // check vertical
        index = 0;
        total = 0;
        for (let i=0; i<freeSpaceArr.length; i++){
            if (total == X_WIN || total == O_WIN){
                return total;
            }

            if (index > freeSpaceArr.length){
                index -= 8; // 8 will set index to the start of adj row
                total = 0;
            }
            else {
                total += freeSpaceArr[index];
                index += N;
            }
        }

        // check diagonal
        index = 0;
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

        return 0;
    }
}
