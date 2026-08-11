const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let seed = Math.floor(Math.random() * 999999);

const random = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const randInt = (max) => Math.floor(random() * max);

const pixelSize = 10
const colours = ["#1b8f70", "#ddff00", "#2f0d79", "#a50780"];
const gridW = Math.floor(canvas.width / pixelSize)
const gridH = Math.floor(canvas.height / pixelSize)


// new collison system, mask system if touch colour of text decline replcae etc.. 

function drawPixels(namePixels) {
    const pixelSize = 10, 
    squareSize = 5, 
    squareCount = 2, 
    pixelCount = 2000;

    // Draw 5x5 block clusters
    for (let s = 0; s < squareCount; s++) {
        let placed = false 
        for (let attempt = 0; attempt < 100; attempt++) {
        const startX = randInt(gridW - squareSize + 1);
        const startY = randInt(gridH - squareSize + 1) ;
        let collision = false
        for (let y = 0; y< squareSize; y++) {
            for(let x = 0; x< squareSize; x++) {
                const gridX = startX +x;
                const gridY = startY +y;
                if (namePixels.has(`${gridX},${gridY}`)){
                    collision = true;
                    break
                }
            }
        
    if (collision) {
        continue
    }
}
        ctx.fillStyle = colours[randInt(colours.length)];
        ctx.fillRect(startX, startY, squareSize * pixelSize, squareSize * pixelSize);
        placed = true;
        break;
    }
    if(!placed){
        console.log("could not plcae",s)
    }
}
    // Draw individual pixels
    for (let i = 0; i < pixelCount; i++) {
        const x = randInt(gridW) * pixelSize;
        const y = randInt(gridH) * pixelSize
        if (namePixels.has(`${x},${y}`)){
            continue
        }
        ctx.fillStyle = colours[randInt(colours.length)];
        ctx.fillRect(x, y, pixelSize, pixelSize);
    }
}



// pixel manipulation of name test
// thinking time, next step collison system maybe? fix blocks? etc...
// use same collsion system from frog 
//needs better accuracy rns over laps border wise. 
function drawName(){
    const name = "RAYMOND"
    const textCanvas = document.createElement("canvas")
    const textCtx = textCanvas.getContext("2d")

    textCanvas.width = 2200
    textCanvas.height = 1200
    textCtx.font = "bold 200px serif"
    textCtx.fillStyle = "black"
    textCtx.textAlign = "center"
    textCtx.textBaseline = "middle"
    textCtx.fillText(name,textCanvas.width /2, textCanvas.height /2  )


    const imageData = textCtx.getImageData (0,0, textCanvas.width, textCanvas.height)

    const namePixels = new Set();

    for (let gridY = 0; gridY < gridH; gridY++) {
        for (let gridX =0; gridX < gridW; gridX++ ){
            const sampleX = gridX * pixelSize + pixelSize /2 
            const sampleY = gridY * pixelSize + pixelSize /2 
            const index = (Math.floor(sampleY)* textCanvas.width + Math.floor(sampleX)) *4
            const alpha = imageData.data[index + 3]
            if (alpha>0) {
                namePixels.add(`${gridX},${gridY}`)
            }
        }
    }
    for (
        const cell of namePixels 
     ) {
        const [gridX, gridY] = cell.split(",").map(Number);
        ctx.fillStyle = "red"
        ctx.fillRect(gridX*pixelSize,gridY*pixelSize,pixelSize,pixelSize)
     }
    return namePixels
}

function generatePattern() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const namePixels = drawName();
    drawPixels(namePixels);
}
function randomizePattern() {
    seed = Math.floor(Math.random() * 999999);
    generatePattern();
}

document.getElementById("randomizeSeed")?.addEventListener("click", randomizePattern);
generatePattern();

