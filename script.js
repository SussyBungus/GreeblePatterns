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

    names = placeNames({
      text: patternName,
      count: 5,
      size: 100,
      ctx,
      canvas,
      random,
      existingObjects: [...frogs, ...tulips],
      spacing: 30,
    });

    fillers = placeFillers({
      count: 40,
      minSize: 50,
      maxSize: 100,
      spacing: 5,
      canvas,
      random,
      existingObjects: [...frogs, ...tulips, ...names],
      rotationRange: 180,
    });

    drawPattern();
  } catch (error) {
    console.error("Pattern generation failed:", error);
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