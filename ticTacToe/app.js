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
    let freeSpaceArr = [];
    for (let i=0; i<gameArr.length; i++){
        freeSpaceArr[i] = true;
    }

    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = getXCoordInQuadrant(gameArr, mouseX, N);
        let y = getYCoordInQuadrant(gameArr, mouseY, N);
        let freeIndex = getFreeIndex(x, y, gameArr, freeSpaceArr);
        if (freeSpaceArr[freeIndex]){
            drawShape(x, y);
            freeSpaceArr[freeIndex] = false;
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

    function getFreeIndex(x, y, maxArray, freeSpaceArr){
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

    let isCircle = true;
    function drawShape(x, y){
        if (isCircle){
            drawCircle(x, y);
            isCircle = false;
        }
        else{
            drawX(x, y);
            isCircle = true;
        }
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
}
