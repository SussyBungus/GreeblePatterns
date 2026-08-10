import {
  loadImage,
  getPixelMask,
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
let exportResolution = 2744;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function getControlValue(id) {
  return Number(document.getElementById(id)?.value ?? 0);
}

function updateControlLabels() {
  const density = getControlValue("density");
  const motifRatio = getControlValue("motifRatio");
  const sizeVariation = getControlValue("sizeVariation");
  const rotation = getControlValue("rotation");
  const spacing = getControlValue("spacing");

  document.getElementById("densityValue").textContent =
    `${density}%`;

  document.getElementById("motifRatioValue").textContent =
    `${motifRatio}/${100 - motifRatio}`;

  document.getElementById("sizeVariationValue").textContent =
    `${sizeVariation}%`;

  document.getElementById("rotationValue").textContent =
    `${rotation}°`;

  document.getElementById("spacingValue").textContent =
    `${spacing}%`;
}

function drawMotifs(objects) {
  for (const object of objects) {
    if (!object.image) continue;

    ctx.save();

    ctx.translate(object.x, object.y);
    ctx.rotate((object.rotation * Math.PI) / 180);

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

function drawNames(objects) {
  for (const name of objects) {
    ctx.save();

    ctx.translate(name.x, name.y);
    ctx.rotate((name.rotation * Math.PI) / 180);

    ctx.fillStyle = "#000000";
    ctx.font = `${name.size}px "Love Light"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(name.text, 0, 0);

    ctx.restore();
  }
}

/* =========================
   HEART FILLER
========================= */

function drawHeart(ctx, size, filled = true) {
  const scale = size / 20;

  ctx.beginPath();

  ctx.moveTo(0, 8 * scale);

  ctx.bezierCurveTo(
    -2 * scale,
    5 * scale,
    -10 * scale,
    0,
    -10 * scale,
    -5 * scale
  );

  ctx.bezierCurveTo(
    -10 * scale,
    -10 * scale,
    -4 * scale,
    -13 * scale,
    0,
    -8 * scale
  );

  ctx.bezierCurveTo(
    4 * scale,
    -13 * scale,
    10 * scale,
    -10 * scale,
    10 * scale,
    -5 * scale
  );

  ctx.bezierCurveTo(
    10 * scale,
    0,
    2 * scale,
    5 * scale,
    0,
    8 * scale
  );

  ctx.closePath();

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function drawOutlineHeart(ctx, size) {
  drawHeart(ctx, size, false);
}

function drawFiller(ctx, type, variant, size) {
  if (type === "heart" && variant === "outline") {
    drawOutlineHeart(ctx, size);
  }
}

function drawFillers(objects) {
  for (const filler of objects) {
    ctx.save();

    ctx.translate(filler.x, filler.y);
    ctx.rotate((filler.rotation * Math.PI) / 180);

    ctx.strokeStyle = "#000000";
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

/* =========================
   DRAW PATTERN
========================= */

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

/* =========================
   GENERATE PATTERN
========================= */

async function generatePattern() {
  try {
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

    /* =========================
       CONTROLS
    ========================= */

    const density = getControlValue("density");
    const motifRatio = getControlValue("motifRatio");
    const sizeVariation =
      getControlValue("sizeVariation");
    const rotation =
      getControlValue("rotation");
    const spacingControl =
      getControlValue("spacing");
    const nameFrequency =
      getControlValue("nameFrequency");

    /* =========================
       MOTIF COUNTS
    ========================= */

    const totalMotifs = Math.round(
      5 + (density / 100) * 50
    );

    const frogCount = Math.round(
      totalMotifs * (motifRatio / 100)
    );

    const tulipCount =
      totalMotifs - frogCount;

    /* =========================
       SIZE
    ========================= */

    const frogBaseSize = 600;
    const tulipBaseSize = 400;

    const frogVariation =
      100 + sizeVariation;

    const tulipVariation =
      100 + sizeVariation;

    const frogMinSize =
      frogBaseSize *
      (2 - frogVariation / 100);

    const frogMaxSize =
      frogBaseSize *
      (frogVariation / 100);

    const tulipMinSize =
      tulipBaseSize *
      (2 - tulipVariation / 100);

    const tulipMaxSize =
      tulipBaseSize *
      (tulipVariation / 100);

    /* =========================
       SPACING
    ========================= */

    const spacing = Math.round(
      (spacingControl / 100) * 50
    );

    /* =========================
       LOAD FROGS
    ========================= */

    const loadedFrogs = await Promise.all(
      frogImages.map(async (src) => {
        const image = await loadImage(src);

        return {
          image,
          pixelMask: getPixelMask(image),
        };
      })
    );

    /* =========================
       LOAD FLOWERS
    ========================= */

    const loadedTulips = await Promise.all(
      tulipImages.map(async (src) => {
        const image = await loadImage(src);

        return {
          image,
          pixelMask: getPixelMask(image, 200),
        };
      })
    );

    /* =========================
       NAMES
    ========================= */

    const name =
      document
        .getElementById("name")
        ?.value
        .trim();

    let generatedNames = [];

    if (name && nameFrequency > 0) {
      const nameCount = Math.max(
        1,
        Math.round(nameFrequency / 25)
      );

      generatedNames = placeNames({
        text: name,
        count: nameCount,
        size: 100,
        ctx,
        canvas,
        random,
        existingObjects: [],
        spacing: spacing + 30,
      });
    }

    /* =========================
       FROGS
    ========================= */

    const generatedFrogs = placeMotifs({
      images: loadedFrogs,

      count: frogCount,

      minSize: frogMinSize,
      maxSize: frogMaxSize,

      spacing,
      canvas,
      random,

      existingObjects: generatedNames,

      rotationRange: rotation,
      allowFlip: true,
    });

    /* =========================
       FLOWERS
    ========================= */

    const generatedTulips = placeMotifs({
      images: loadedTulips,

      count: tulipCount,

      minSize: tulipMinSize,
      maxSize: tulipMaxSize,

      spacing,
      canvas,
      random,

      existingObjects: [
        ...generatedNames,
        ...generatedFrogs,
      ],

      rotationRange: rotation,
      allowFlip: true,
    });

    /* =========================
       OUTLINE HEART FILLERS
    ========================= */

    fillers = placeFillers({
      count: 60,

      minSize: 40,
      maxSize: 80,

      spacing: 25,

      canvas,
      random,

      existingObjects: [
        ...generatedNames,
        ...generatedFrogs,
        ...generatedTulips,
      ],

      rotationRange: 180,
    });

    /* =========================
       UPDATE GLOBAL OBJECTS
    ========================= */

    names = generatedNames;
    frogs = generatedFrogs;
    tulips = generatedTulips;

    /* =========================
       DRAW
    ========================= */

    drawPattern();

    updateControlLabels();

  } catch (error) {
    console.error(
      "Pattern generation failed:",
      error
    );
  }
}

/* =========================
   RANDOMIZE
========================= */

document
  .getElementById("randomizeSeed")
  ?.addEventListener("click", () => {
    seed = Math.floor(
      Math.random() * 999999
    );

    generatePattern();
  });

/* =========================
   GENERATE BUTTON
========================= */

document
  .getElementById("generate")
  ?.addEventListener("click", () => {
    generatePattern();
  });

/* =========================
   INITIAL GENERATION
========================= */

document.fonts.ready.then(() => {
  generatePattern();
});

/* =========================
   EXPORT
========================= */
const resolutionButtons =
  document.querySelectorAll(
    ".resolution-option"
  );

resolutionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    exportResolution = Number(
      button.dataset.resolution
    );

    resolutionButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  });
});
document.getElementById("export")?.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");

  exportCanvas.width = exportResolution;
  exportCanvas.height = exportResolution;

  const exportCtx = exportCanvas.getContext("2d");

  // White/background
  exportCtx.fillStyle = "#fafaf7";
  exportCtx.fillRect(
    0,
    0,
    exportResolution,
    exportResolution
  );

  // Scale the preview canvas to export resolution
  exportCtx.drawImage(
    canvas,
    0,
    0,
    exportResolution,
    exportResolution
  );

  const link = document.createElement("a");

  link.download = `greeble-pattern-${exportResolution}x${exportResolution}.png`;

  link.href = exportCanvas.toDataURL(
    "image/png"
  );

  link.click();
});

/* =========================
   RANGE CONTROLS
========================= */

const controls = [
  "density",
  "motifRatio",
  "sizeVariation",
  "rotation",
  "spacing",
  "nameFrequency",
];

controls.forEach((id) => {
  const control =
    document.getElementById(id);

  control?.addEventListener(
    "input",
    () => {
      updateControlLabels();
      generatePattern();
    }
  );
});

