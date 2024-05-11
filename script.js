let STAVE;
let OSC;

let SPACING;
let STAVEMOUSE = {x:0, y:0, isDown:false}
let OSCMOUSE = {x:0, y:0, isDown:false}
let SNAPLOC = {x:0, x:0}
let PLAYHEAD = {x:0, isPlaying:false}
let BPM = 50;
let TOOL = "create";

let SELECTED = 0;
let SELECT = false;
let STLENGTH = 0;
let RELENGTH = 0;

let SELECTEDOSC = 0;
let SECECTOSC = false;

let NOTES = ["E6", "D6", "C6", "B5", "A5", "G5", "F5", "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3", "G3", "F3"];

let FREQ = [1318.51, 1174.66, 1046.5, 987.767, 880, 783.991, 698.45, 659.255, 587.33, 523.251, 493.883, 436.04, 392.44, 349.228, 329.620, 293.665, 261.626, 246.942, 222, 195.998, 174.614];

let MOVING_NOTES = [];
let OSC_POINTS = [
    {x:0.0, y:1.0},
    {x:0.5, y:0.5},
    {x:1.0, y:0.0}
];

let AUDIO_CONTEXT;

class MovingNote{
    constructor(location) {
        let index = Math.round(location.y/SPACING);
        let indexInArray = 0;
        this.frequency = FREQ[index];
        this.length = 1;
        this.location = {
            x:location.x,
            y:index*SPACING
        }
    }
    draw(ctx) {
        drawNote(ctx, this.location, "fill", this.indexInArray);
    }
    play() {
        if(AUDIO_CONTEXT == null) {
            AUDIO_CONTEXT=new(AudioContext || webkitAudioContext || window.webkitAudioContext) ()
        }
        let duration = this.length*0.25;
        let osc = AUDIO_CONTEXT.createOscillator();

        let gainNode = AUDIO_CONTEXT.createGain();
        gainNode.gain.setValueAtTime(0, AUDIO_CONTEXT.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, AUDIO_CONTEXT.currentTime+0.05);
        gainNode.gain.linearRampToValueAtTime(0.0, AUDIO_CONTEXT.currentTime+duration);

        osc.frequency.value = this.frequency;
        osc.start(AUDIO_CONTEXT.currentTime);
        osc.stop(AUDIO_CONTEXT.currentTime+duration);
        osc.connect(gainNode);
        gainNode.connect(AUDIO_CONTEXT.destination);
    }
}

function main() {
    STAVE = document.getElementById("staveCanvas");
    OSC = document.getElementById("oscillatorCanvas")
    MOVING_NOTES.push(new MovingNote(-10, -10));
    fitToScreen();
    addEventListeners();
    drawStave();
    drawOscillator();
    animate();
}
function addEventListeners() {
    STAVE.addEventListener("mousemove", onMouseMoveStave);
    STAVE.addEventListener("mousedown", onMouseDownStave);
    STAVE.addEventListener("mouseup", onMouseUpStave);
    OSC.addEventListener("mousemove", onMouseMoveOsc);
    OSC.addEventListener("mousedown", onMouseDownOsc);
    OSC.addEventListener("mouseup", onMouseUpOsc);
    window.addEventListener("resize", fitToScreen);
}
function fitToScreen() {
    STAVE.width = window.innerWidth-50;
    STAVE.height = 300;
    OSC.width = 200; OSC.height = 100;
    SPACING = STAVE.height/20;
    drawStave();
}
function animate() {
    updatePlayhead();
    drawStave();
    drawOscillator();
    window.requestAnimationFrame(animate);
}

function togglePlayhead() {
    PLAYHEAD.isPlaying = !PLAYHEAD.isPlaying;
    if (PLAYHEAD.isPlaying) {document.getElementById("playButton").innerHTML = "||"}
    else {document.getElementById("playButton").innerHTML = ">"}
}
function updatePlayhead() {
    if (PLAYHEAD.isPlaying) {PLAYHEAD.x = PLAYHEAD.x + 1;}
    if (PLAYHEAD.x > STAVE.width)
    {PLAYHEAD.x = 0;}

    for (let i = 0; i < MOVING_NOTES.length; i++) {
        if (MOVING_NOTES[i].location.x == PLAYHEAD.x)
        {MOVING_NOTES[i].play();}
    }
}
function movePlayhead(point) {PLAYHEAD.x = point;}

function onMouseMoveStave(event) {
    STAVEMOUSE.x = event.x-10;
    STAVEMOUSE.y = event.y-60;

    let xSnap = Math.round(STAVEMOUSE.x/SPACING);
    let ySnap = Math.round(STAVEMOUSE.y/SPACING);
    SNAPLOC = {
        x:xSnap*SPACING,
        y:ySnap*SPACING
    }
}
function onMouseDownStave(event) {
    STAVEMOUSE.isDown = true;

    if (TOOL == "create") {
        MOVING_NOTES.push(new MovingNote(SNAPLOC));
        MOVING_NOTES[MOVING_NOTES.length-1].play();
    }
    else if (TOOL == "delete") {
        let newArray = [];
        for (let i = 0; i < MOVING_NOTES.length; i++) {
            if (MOVING_NOTES[i] !== MOVING_NOTES[getNoteUnderMouse()]) {
                newArray.push(MOVING_NOTES[i]);
            }
        }
        MOVING_NOTES = newArray;
    }
    else if (TOOL == "move") {
        SELECTED = getNoteUnderMouse(); SELECT = true;
    }
    else if (TOOL == "length") {
        SELECTED = getNoteUnderMouse(); SELECT = true; STLENGTH = MOVING_NOTES[getNoteUnderMouse()].location.x;
    }
}
function onMouseUpStave(event) {
    STAVEMOUSE.isDown = false;

    if (TOOL == "move" && SELECT) {
        MOVING_NOTES[SELECTED].location = SNAPLOC;
        MOVING_NOTES[SELECTED].frequency = FREQ[MOVING_NOTES[SELECTED].location.y/SPACING];
        SELECT = false;
    }
    else if (TOOL == "length" && SELECT) {
        MOVING_NOTES[SELECTED].length = (SNAPLOC.x - MOVING_NOTES[SELECTED].location.x)/SPACING;
        console.log(MOVING_NOTES[SELECTED].location.x);
        console.log(MOVING_NOTES[SELECTED].length);
        SELECT = false;
    }
}

function getNoteUnderMouse() {
    for (let i = 0; i < MOVING_NOTES.length; i++) {
        if (SNAPLOC.x == MOVING_NOTES[i].location.x && SNAPLOC.y == MOVING_NOTES[i].location.y) {
            return i;
        }
    }
}

function createTool()
{TOOL = "create";}
function deleteTool()
{TOOL = "delete";}
function moveTool()
{TOOL = "move";}
function lengthTool()
{TOOL = "length";}

const saveFile = () => {
      const link = document.createElement("a");
      const content = JSON.stringify(MOVING_NOTES);
      const file = new Blob([content], { type: 'text/plain' });
      link.href = URL.createObjectURL(file);
      link.download = "notes.json";
      link.click();
      URL.revokeObjectURL(link.href);
};

function drawNote(ctx, location, style, i) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    let drawWidth = MOVING_NOTES[i].length;

    if (style == "fill") {
        ctx.fillStyle = "white";
        ctx.fillRect (
            location.x-SPACING, location.y-SPACING,
            SPACING*drawWidth, SPACING
        );

        ctx.fillStyle = "gray";
        ctx.fillRect (
            location.x-SPACING+(SPACING*drawWidth)-5, location.y-SPACING,
            5, SPACING
        );

    }

    if (style == "line") {ctx.strokeRect
    (location.x-SPACING, location.y-SPACING,
     SPACING*drawWidth, SPACING);}
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

function drawStave() {
    let ctx = STAVE.getContext("2d");
    ctx.clearRect(0, 0, STAVE.width, STAVE.height);
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    for (let i = -1; i <= 2; i++) {
        let y = STAVE.height/2+i*SPACING*2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(STAVE.width, y);
        ctx.stroke();
    }

    drawNote(ctx, SNAPLOC, "line", 0);
    document.getElementById("noteLabel").innerHTML = NOTES[SNAPLOC.y/SPACING];

    for(let i = 0; i < MOVING_NOTES.length; i++) {
        MOVING_NOTES[i].indexInArray = i;
        MOVING_NOTES[i].draw(ctx);
    }

    ctx.fillRect(PLAYHEAD.x-SPACING, 0, 2, STAVE.height);
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
