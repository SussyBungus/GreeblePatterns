const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const patternName = "Raymond";

const frogImages = [
  "assets/frog1.png",
  "assets/frog2.png",
  "assets/frog3.png",
  "assets/frog4.png"
];

const tulipImages = [
  "assets/tulip1.png",
  "assets/tulip2.png"
];

let frogs = [];
let tulips = [];
let names = [];

let seed = Math.floor(Math.random() * 999999);

function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randomBetween(min, max) {
  return min + random() * (max - min);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function checkCollision(x, y, size, objects, spacing) {
  for (const object of objects) {
    const distanceX = Math.abs(x - object.x);
    const distanceY = Math.abs(y - object.y);
    const minimumDistance = (size + object.size) / 2 + spacing;

    if (distanceX < minimumDistance && distanceY < minimumDistance) {
      return true;
    }
  }

  return false;
}

function placeMotifs({
  images,
  count,
  minSize,
  maxSize,
  spacing,
  existingObjects = [],
  rotationRange = 35,
  allowFlip = true,
  maxAttempts = 400
}) {
  const objects = [];

  for (let i = 0; i < count; i++) {
    const image = images[Math.floor(random() * images.length)];
    const size = randomBetween(minSize, maxSize);
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = randomBetween(size / 2, canvas.width - size / 2);
      const y = randomBetween(size / 2, canvas.height - size / 2);

      const collision = checkCollision(
        x,
        y,
        size,
        [...existingObjects, ...objects],
        spacing
      );

      if (!collision) {
        objects.push({
          image,
          x,
          y,
          size,
          rotation: randomBetween(-rotationRange, rotationRange),
          flip: allowFlip && random() < 0.5
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log("Could not place motif", i);
    }
  }

  return objects;
}

function placeNames({
  text,
  count,
  size,
  existingObjects = [],
  spacing = 20,
  maxAttempts = 100
}) {
  const objects = [];
  const nameWidth = 120;
  const nameHeight = size;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = randomBetween(
        nameWidth / 2 + spacing,
        canvas.width - nameWidth / 2 - spacing
      );
      const y = randomBetween(
        nameHeight / 2 + spacing,
        canvas.height - nameHeight / 2 - spacing
      );

      let collision = false;

      for (const object of existingObjects) {
        const distanceX = Math.abs(x - object.x);
        const distanceY = Math.abs(y - object.y);
        const minimumX = object.size / 2 + nameWidth / 2 + spacing;
        const minimumY = object.size / 2 + nameHeight / 2 + spacing;

        if (distanceX < minimumX && distanceY < minimumY) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        for (const name of objects) {
          const distanceX = Math.abs(x - name.x);
          const distanceY = Math.abs(y - name.y);

          if (
            distanceX < name.width / 2 + nameWidth / 2 + spacing &&
            distanceY < name.height / 2 + nameHeight / 2 + spacing
          ) {
            collision = true;
            break;
          }
        }
      }

      if (!collision) {
        objects.push({
          text,
          x,
          y,
          size,
          width: nameWidth,
          height: nameHeight,
          rotation: randomBetween(-15, 15)
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log("Could not place name", i);
    }
  }

  return objects;
}

function drawMotifs(objects) {
  for (const object of objects) {
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

async function generatePattern() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fafaf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const loadedFrogs = await Promise.all(frogImages.map(loadImage));
  const loadedTulips = await Promise.all(tulipImages.map(loadImage));

  frogs = placeMotifs({
    images: loadedFrogs,
    count: 20,
    minSize: 160,
    maxSize: 360,
    spacing: 5,
    rotationRange: 35,
    allowFlip: true
  });

  tulips = placeMotifs({
    images: loadedTulips,
    count: 6,
    minSize: 140,
    maxSize: 240,
    spacing: 10,
    existingObjects: frogs,
    rotationRange: 20,
    allowFlip: true
  });

  names = placeNames({
    text: patternName,
    count: 4,
    size: 48,
    existingObjects: [...frogs, ...tulips],
    spacing: 5
  });

  drawPattern();
}

function drawPattern() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fafaf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMotifs(frogs);
  drawMotifs(tulips);
  drawNames(names);
}

document.getElementById("randomizeSeed").addEventListener("click", () => {
  seed = Math.floor(Math.random() * 999999);
  generatePattern();
});

document.getElementById("generate")?.addEventListener("click", () => {
  generatePattern();
});

document.fonts.ready.then(() => {
  generatePattern();
});

document.getElementById("export").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "greeble-pattern.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});