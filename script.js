import {
  randomBetween,
  loadImage,
  placeMotifs,
  placeNames,
  placeFillers,
} from "./util.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const patternName = "Raymond";

const frogImages = [
  "assets/frog1.png",
  "assets/frog2.png",
  "assets/frog3.png",
  "assets/frog4.png",
  "assets/frog5.png",
  "assets/frog6.png",
];

const tulipImages = [
  "assets/tulip1.png",
  "assets/tulip2.png",
  "assets/peony1.png",
  "assets/peony2.png",
];

let frogs = [];
let tulips = [];
let names = [];
let fillers = [];

let seed = Math.floor(Math.random() * 999999);

function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}


// ------------------------------------
// DRAW MOTIFS
// ------------------------------------

function drawMotifs(objects) {
  for (const object of objects) {
    ctx.save();

    ctx.translate(
      object.x,
      object.y
    );

    ctx.rotate(
      (object.rotation * Math.PI) / 180
    );

    if (object.flip) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      object.image,
      -object.size / 2,
      -object.size / 2,
      object.size,
      object.size
    );

    ctx.restore();
  }
}


// ------------------------------------
// DRAW NAMES
// ------------------------------------

function drawNames(objects) {
  for (const name of objects) {
    ctx.save();

    ctx.translate(
      name.x,
      name.y
    );

    ctx.rotate(
      (name.rotation * Math.PI) / 180
    );

    ctx.fillStyle = "#000000";

    ctx.font =
      `${name.size}px "Love Light"`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      name.text,
      0,
      0
    );

    ctx.restore();
  }
}


// ------------------------------------
// DRAW FILLERS
// ------------------------------------

function drawFillers(objects) {
  for (const filler of objects) {
    ctx.save();

    ctx.translate(
      filler.x,
      filler.y
    );

    ctx.rotate(
      (filler.rotation * Math.PI) / 180
    );

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 2;

    drawFiller(
      ctx,
      filler.type,
      filler.variant,
      filler.size
    );

    ctx.restore();
  }
}


// ------------------------------------
// DRAW ENTIRE PATTERN
// ------------------------------------

function drawPattern() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#fafaf7";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawMotifs(frogs);
  drawMotifs(tulips);
  drawFillers(fillers);
  drawNames(names);
}


// ------------------------------------
// GENERATE PATTERN
// ------------------------------------

async function generatePattern() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#fafaf7";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const loadedFrogs =
    await Promise.all(
      frogImages.map(loadImage)
    );

  const loadedTulips =
    await Promise.all(
      tulipImages.map(loadImage)
    );


  // ----------------------------------
  // FROGS
  // ----------------------------------

  frogs = placeMotifs({
    images: loadedFrogs,

    count: 30,

    minSize: 400,
    maxSize: 800,

    spacing: 5,

    canvas,
    random,

    rotationRange: 35,
    allowFlip: true,
  });


  // ----------------------------------
  // TULIPS / FLOWERS
  // ----------------------------------

  tulips = placeMotifs({
    images: loadedTulips,

    count: 20,

    minSize: 300,
    maxSize: 500,

    spacing: 5,

    canvas,
    random,

    existingObjects: frogs,

    rotationRange: 35,
    allowFlip: true,
  });


  // ----------------------------------
  // FILLER SHAPES
  // ----------------------------------

  fillers = placeFillers({
    count: 40,

    minSize: 50,
    maxSize: 100,

    spacing: 5,

    canvas,
    random,

    existingObjects: [
      ...frogs,
      ...tulips,
    ],

    rotationRange: 180,
  });


  // ----------------------------------
  // NAMES
  // ----------------------------------

  names = placeNames({
    text: patternName,

    count: 5,

    size: 100,

    ctx,
    canvas,
    random,

    existingObjects: [
      ...frogs,
      ...tulips,
      ...fillers,
    ],

    spacing: 30,
  });


  drawPattern();
}


// ------------------------------------
// RANDOMIZE SEED
// ------------------------------------

document
  .getElementById("randomizeSeed")
  .addEventListener(
    "click",
    () => {
      seed =
        Math.floor(
          Math.random() * 999999
        );

      generatePattern();
    }
  );


// ------------------------------------
// GENERATE BUTTON
// ------------------------------------

document
  .getElementById("generate")
  ?.addEventListener(
    "click",
    () => {
      generatePattern();
    }
  );


// ------------------------------------
// INITIAL GENERATION
// ------------------------------------

document.fonts.ready.then(() => {
  generatePattern();
});


// ------------------------------------
// EXPORT PNG
// ------------------------------------

document
  .getElementById("export")
  .addEventListener(
    "click",
    () => {
      const link =
        document.createElement("a");

      link.download =
        "greeble-pattern.png";

      link.href =
        canvas.toDataURL("image/png");

      link.click();
    }
  );