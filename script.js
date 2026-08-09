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

  document.getElementById("densityValue").textContent = `${density}%`;
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

function drawFiller(ctx, type, variant, size) {
  ctx.beginPath();

  if (type === "star") {
    const points = variant === "four" ? 4 : 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.45;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();

    if (variant === "outline") {
      ctx.stroke();
    } else {
      ctx.fill();
    }

    if (variant === "sparkle") {
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(size / 2, 0);
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(0, size / 2);
      ctx.stroke();
    }
  }

  if (type === "heart") {
    const s = size / 2;

    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * 1.4, s * 0.1, -s, -s, 0, -s * 0.3);
    ctx.bezierCurveTo(s, -s, s * 1.4, s * 0.1, 0, s);
    ctx.closePath();

    if (variant === "outline") {
      ctx.stroke();
    } else {
      ctx.fill();
    }
  }
}

function drawFillers(objects) {
  for (const filler of objects) {
    ctx.save();
    ctx.translate(filler.x, filler.y);
    ctx.rotate((filler.rotation * Math.PI) / 180);

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 2;

    drawFiller(ctx, filler.type, filler.variant, filler.size);

    ctx.restore();
  }
}

function drawPattern() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fafaf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMotifs(frogs);
  drawMotifs(tulips);
  drawFillers(fillers);
  drawNames(names);
}

async function generatePattern() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fafaf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const density = getControlValue("density");
    const motifRatio = getControlValue("motifRatio");
    const sizeVariation = getControlValue("sizeVariation");
    const rotation = getControlValue("rotation");
    const spacingControl = getControlValue("spacing");
    const nameFrequency = getControlValue("nameFrequency");

    const totalMotifs = Math.round(
      5 + (density / 100) * 35
    );

    const frogCount = Math.round(
      totalMotifs * (motifRatio / 100)
    );

    const tulipCount = totalMotifs - frogCount;

    const frogBaseSize = 600;
    const tulipBaseSize = 400;

    const frogVariation = 100 + sizeVariation;
    const tulipVariation = 100 + sizeVariation;

    const frogMinSize = frogBaseSize * (2 - frogVariation / 100);
    const frogMaxSize = frogBaseSize * (frogVariation / 100);

    const tulipMinSize = tulipBaseSize * (2 - tulipVariation / 100);
    const tulipMaxSize = tulipBaseSize * (tulipVariation / 100);

    const spacing = Math.round((spacingControl / 100) * 50);

    const loadedFrogs = await Promise.all(
      frogImages.map(async (src) => {
        const image = await loadImage(src);

        return {
          image,
          pixelMask: getPixelMask(image),
        };
      })
    );

    const loadedTulips = await Promise.all(
      tulipImages.map(async (src) => {
        const image = await loadImage(src);

        return {
          image,
          pixelMask: getPixelMask(image, 200),
        };
      })
    );

    const name = document.getElementById("name")?.value.trim();

    let generatedNames = [];

    if (name && nameFrequency > 0) {
      const nameCount = Math.max(
        1,
        Math.round(nameFrequency / 20)
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

    names = generatedNames;
    frogs = generatedFrogs;
    tulips = generatedTulips;

    drawPattern();

    updateControlLabels();
  } catch (error) {
    console.error(
      "Pattern generation failed:",
      error
    );
  }
}

document.getElementById("randomizeSeed")?.addEventListener("click", () => {
  seed = Math.floor(Math.random() * 999999);
  generatePattern();
});

document.getElementById("generate")?.addEventListener("click", () => {
  generatePattern();
});

document.fonts.ready.then(() => {
  generatePattern();
});

document.getElementById("export")?.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "greeble-pattern.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

const controls = [
  "density",
  "motifRatio",
  "sizeVariation",
  "rotation",
  "spacing",
  "nameFrequency",
];

controls.forEach((id) => {
  const control = document.getElementById(id);

  control?.addEventListener("input", () => {
    updateControlLabels();
    generatePattern();
  });
});