let OSC;

let OSCMOUSE = {x:0, y:0, isDown:false}

let SELECTEDOSC = 0;
let SECECTOSC = false;

let OSC_POINTS = [
    {x:0.0, y:1.0},
    {x:0.5, y:0.5},
    {x:1.0, y:0.0}
];

function main() {
    OSC = document.getElementById("oscillatorCanvas")
    addEventListeners();
    drawOscillator();
    animate();
}
function addEventListeners() {
    OSC.addEventListener("mousemove", onMouseMoveOsc);
    OSC.addEventListener("mousedown", onMouseDownOsc);
    OSC.addEventListener("mouseup", onMouseUpOsc);
}
function animate() {
    drawOscillator();
    window.requestAnimationFrame(animate);
}

function onMouseMoveOsc(event) {
    OSCMOUSE.x = event.x-10;
    OSCMOUSE.y = event.y-390;
}
function onMouseDownOsc(event) {
    for (let i = 0; i < OSC_POINTS.length; i++) {
        if (OSCMOUSE.x >= OSC_POINTS[i].x*OSC.width-5 && OSCMOUSE.x <= OSC_POINTS[i].x*OSC.width+5 &&
            OSCMOUSE.y >= -OSC_POINTS[i].y*OSC.height+OSC.height-5 && OSCMOUSE.y <= -OSC_POINTS[i].y*OSC.height+OSC.height+5) {
            OSC_POINTS[i].x = OSCMOUSE.x/OSC.width+5; console.log(OSC_POINTS[i].x)
        }
    }
}
function onMouseUpOsc(event) {
}

function drawOscillator() {
    let ctx = OSC.getContext("2d");
    ctx.clearRect(0, 0, OSC.width, OSC.height);
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;

    ctx.moveTo(OSC_POINTS[0].x*OSC.width-5, -OSC_POINTS[0].y*OSC.height+OSC.height-5);
    ctx.quadraticCurveTo(OSC_POINTS[1].x*OSC.width-5, -OSC_POINTS[1].y*OSC.height+OSC.height-5, OSC_POINTS[2].x*OSC.width-5, -OSC_POINTS[2].y*OSC.height+OSC.height-5);
    ctx.stroke();

    for (let i = 0; i < OSC_POINTS.length; i++) {
        ctx.fillRect(OSC_POINTS[i].x*OSC.width-5, -OSC_POINTS[i].y*OSC.height+OSC.height-5, 10, 10);
    }
}
