/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

function drawBoard() {
    const canvas = document.getElementById('canvas');
    const context = document.getElementById('canvas').getContext('2d');

    for (let i=0; i<3; i++ ){
        let spaceY = i+1;

        for (let j=0; j<3; j++){
            let spaceX = j+1;

            context.strokeRect(50*spaceX, 50*spaceY, 50, 50);
        }
    }
}
