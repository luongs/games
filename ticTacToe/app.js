/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

function drawBoard() {
    const canvas = document.getElementById('canvas');
    const context = document.getElementById('canvas').getContext('2d');
    const N = 3;

    let maxBounds = [];
    let gameArr = [];
    let index = 0;
    for (let i=0; i<N; i++ ){
        let y = i+1;
        maxBounds[i] = 50*(y+1);

        for (let j=0; j<N; j++){
            let x = j+1;

            let coordArr = [(50*(x+1)), (50*(y+1))];
            gameArr[index++] = coordArr;

            context.strokeRect(50*x, 50*y, 50, 50);
        }
    }
    console.log(gameArr);

    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = isGreaterThan(maxBounds, mouseX);
        let y = isGreaterThan(maxBounds, mouseY);
        drawShape(x, y);
    };

    canvas.addEventListener("mousedown", onmousedown);

    function isGreaterThan(maxArray, pos) {
        for (let i=0; i<maxArray.length; i++){
            if (maxArray[i]>pos){
                return maxArray[i];
            }
        }
        return 0;
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
