/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

function drawBoard() {
    const canvas = document.getElementById('canvas');
    const context = document.getElementById('canvas').getContext('2d');

    let maxBounds = [];
    for (let i=0; i<3; i++ ){
        let spaceY = i+1;
        let maxBound = i+2;
        maxBounds[i] = 50*(maxBound);

        for (let j=0; j<3; j++){
            let spaceX = j+1;

            context.strokeRect(50*spaceX, 50*spaceY, 50, 50);
        }
    }

    let onmousedown = function(e){
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        let x = isGreaterThan(maxBounds, mouseX);
        let y = isGreaterThan(maxBounds, mouseY);
        console.log("X coord: "+mouseX);
        console.log("Y coord: "+mouseY);
        console.log("X quadrant: "+x);
        console.log("Y coord: "+y);
        drawX(x, y);
        //drawCircle(x, y);
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

    function drawCircle(x, y) {
        context.beginPath();
        context.arc(x-25, y-25, 20, 0, 2*Math.PI);
        context.stroke();
    }

    function drawX(x, y) {
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
