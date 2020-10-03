/*
    Algo Num - Labo personnel
    Brendan Studer
    Equipe 5
    14.06.2019

    Version : 1.0
*/

var canvas = document.getElementById('simulationArea');
var ctx = canvas.getContext("2d");

var height = canvas.height;
var width = canvas.width;

var lightAngle = document.getElementById('lightAngle');
var lenghtSlider = document.getElementById('lenghtSlider');
var focalInput = document.getElementById('focalInput');

var currentLens = null;
var currenLenght = lenghtSlider.value;
var moveLight = false;

var lightX = width/2;
var lightY = height/2;

var lensTab = new Array();
var rayTab = new Array();

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Lens {
    constructor(startPos, endPos, focale) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.focale = focale;
    }
}

class Ray {
    constructor(startPos, endPos) {
        this.startPos = startPos;
        this.endPos = endPos;
    }
}

/**
 * Function returning position of the mouse
 * @param {Element} canvas
 * @param {event} evt
 */
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

/**
 * Function triggered when mouse is double-clicked.
 *if the radio button is on "lens", place a lens, do nothing otherwise
 * @param {event} event
 */
canvas.ondblclick = function (event) {
    var pos = getMousePos(canvas, event);
    if ($('#lensRadio').is(':checked')) {

        lensTab.push(new Lens(new Point(pos.x, pos.y - Math.abs(lenghtSlider.value / 2)), new Point(pos.x, pos.y + Math.abs(lenghtSlider.value / 2)), focalInput.value));
        draw();
    } else {

    }

}

/**
 * Function triggered when mouse is clicked
 * allow to move the light or one lens depending on the radio button
 * @param {event} event
 */
canvas.onmousedown = function (event) {

    var pos = getMousePos(canvas, event);
    if ($('#lensRadio').is(':checked')) {
        if (currentLens != null) {
            lensTab[currentLens].startPos = new Point(pos.x, pos.y - Math.abs(currenLenght / 2));
            lensTab[currentLens].endPos = new Point(pos.x, pos.y + Math.abs(currenLenght / 2));
            currentLens = null;
            currenLenght = null;
        } else {
            for (var i = 0; i < lensTab.length; i++) {
                if (pos.x >= lensTab[i].endPos.x - 10 && pos.x <= lensTab[i].endPos.x + 10 && pos.y >= lensTab[i].startPos.y && pos.y <= lensTab[i].endPos.y) {
                    currentLens = i;
                    currenLenght = lensTab[i].endPos.y - lensTab[i].startPos.y;
                }
            }


        }
    }
    else
        {
            if(!moveLight)
                {
                    if(Math.abs(pos.x-lightX)<30 && Math.abs(pos.y-lightY)<30)
                        {
                           moveLight = true;
                        }
                }
            else
                {
                    moveLight = false;
                    lightX = pos.x;
                    lightY = pos.y;
                    
                }
        }

}

/**
 * Function triggered when the mouse move
 * move the light or the selected lens at the mouse position and refresh the canvas by calling draw()
 * @param {event} event
 */
canvas.onmousemove = function (event) {
    var pos = getMousePos(canvas, event);

    if (currentLens != null) {
        lensTab[currentLens].startPos = new Point(pos.x, pos.y - Math.abs(currenLenght / 2));
        lensTab[currentLens].endPos = new Point(pos.x, pos.y + Math.abs(currenLenght / 2));
        draw();
    }
    else if(moveLight)
        {
            lightX = pos.x;
            lightY = pos.y;
            draw();
        }

}

/**
 * Function computing the position of one ray and calling itself to compute the position of the next ray if it exists.
 * @param {Number} startX 
 * @param {Number} startY
 * @param {Number} angle
 */
function computeRays(startX, startY, angle) {
    var m = Math.tan((angle) / 180 * Math.PI);
    var h = startY-m*startX;
    var x = startX;
    if (angle>90)
        {
            var sens = -1;
        }
    else
        {
            var sens = 1;
        }
    var found = false;
    while (x>0 && x <= width && !found) {

        var y = m * x + h;
        lensTab.forEach(function (element) {
            if (Math.abs(x - element.startPos.x) < 1) {

                if (y > element.startPos.y && y < element.endPos.y) {
                    if (Math.abs(y - ((element.startPos.y + element.endPos.y) / 2)) > 1) {
                        rayTab.push(new Ray(new Point(startX, startY), new Point(x, y)));
                        found = true;
                        var h2 = ((element.startPos.y + element.endPos.y) / 2) - m * x;
                        var y2 = m * x + h2;
                        var newAngle = Math.atan(1 / (element.focale * 5 / Math.abs(y2 - y))) / Math.PI * 180;
                        if (y > ((element.endPos.y + element.startPos.y) / 2)) {
                            computeRays(x + sens*2, y, angle - sens*newAngle);
                        } else {
                            computeRays(x + sens*2, y, angle + sens*newAngle);
                        }

                    }

                }

            }
        });

        x += sens*0.1;
    }
    if (!found) {
        if(sens==1)
            {
                var yfinal = m * width + h;
                rayTab.push(new Ray(new Point(startX, startY), new Point(width, yfinal)));
            }
        else
            {
               var yfinal = h;
                rayTab.push(new Ray(new Point(startX, startY), new Point(0, yfinal)));
            }
            
        
    }
}


/**
 * Function computing the light by removing previous rays and triggering new rays calculation
 */
function computeLights() {
    rayTab.length = 0;
    computeRays(lightX, lightY, lightAngle.value - 90);
}

/**
 * Function removing all lenses
 */
function removeAllLens() {
    lensTab.length = 0;
    draw();
}

/**
 * Function showing the current value of the focal slider in the parameters <div>
 */
function updateFocal() {
    $("#focalvalue").text(focalInput.value);
}

/**
 * Function showing the current value of the length slider in the parameters <div>
 */
function updateLength()
{
    $("#lengthvalue").text(lenghtSlider.value);
}

/**
 * Function drawing or redrawing the canvas
 */
function draw() {
    $('canvas').clearCanvas();
    computeLights();
    drawLight();
    drawLens();
}

/**
 * Function drawing or redrawing the light by drawing the rays stocked in rayTab
 */
function drawLight() {
    
    $('canvas').drawArc({
        strokeWidth: 0,
        fillStyle: '#464646',
        x: lightX,
        y: lightY,
        radius: 30,
        // start and end angles in degrees
        start: 0,
        end: 360
    });

    rayTab.forEach(function (element) {
        $('canvas').drawLine({
            strokeStyle: '#fdf04d',
            strokeWidth: 2,
            x1: element.startPos.x,
            y1: element.startPos.y,
            x2: element.endPos.x,
            y2: element.endPos.y
        });
    });

}

/**
 * Function drawing or redrawing lenses stocked in lensTab
 */
function drawLens() {
    lensTab.forEach(function (element) {
        if (element.focale < 0) {
            $('canvas').drawLine({
                strokeStyle: '#ffffff',
                strokeWidth: 2,
                startArrow: true,
                endArrow: true,
                arrowRadius: 10,
                arrowAngle: 270,
                x1: element.startPos.x,
                y1: element.startPos.y,
                x2: element.endPos.x,
                y2: element.endPos.y
            });
        } else {
            $('canvas').drawLine({
                strokeStyle: '#ffffff',
                strokeWidth: 2,
                startArrow: true,
                endArrow: true,
                arrowRadius: 10,
                arrowAngle: 90,
                x1: element.startPos.x,
                y1: element.startPos.y,
                x2: element.endPos.x,
                y2: element.endPos.y
            });
        }

    });

}
