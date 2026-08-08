const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const frogImages = [
  "assets/frog1.png",
  "assets/frog2.png",
  "assets/frog3.png",
  "assets/frog4.png"
];

const frogs =[];

let seed = Math.floor(Math.random() *999999)
function random() {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

function randomBetween(min, max) {
  return min + random() * (max-min)
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror=reject;
    image.src = src;

  })
}

async function generatePattern() {
  ctx.clearRect(0, 0 , canvas.width, canvas.height)
  ctx.fillStyle = "#fafaf7"
  ctx.fillRect(0,0,canvas.width, canvas.height)
  const images = await Promise.all(
    frogImages.map(loadImage)
  );

  frogs.length = 0;

  const frogCount = 20;
const spacing = 1;
const maxAttempts = 50;

for (let i = 0; i < frogCount; i++) {
  const image =
    images[Math.floor(random() * images.length)];

  const size = randomBetween(100, 500);

  let placed = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = randomBetween(
      size / 2,
      canvas.width - size / 2
    );

    const y = randomBetween(
      size / 2,
      canvas.height - size / 2
    );

    let collision = false;

    for (const frog of frogs) {
      const distanceX = Math.abs(x - frog.x);
      const distanceY = Math.abs(y - frog.y);

      const minimumDistance =
        (size + frog.size) / 2 + spacing;

      if (
        distanceX < minimumDistance &&
        distanceY < minimumDistance
      ) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      frogs.push({
        image,
        x,
        y,
        size,
        rotation: randomBetween(-25, 25)
      });

      placed = true;
      break;
    }
  }

  if (!placed) {
    console.log("Could not find space for frog", i);
  }
}
drawPattern()
}
function drawPattern() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fafaf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const frog of frogs) {
    ctx.save();

    ctx.translate(frog.x, frog.y);
    ctx.rotate((frog.rotation * Math.PI) / 180);

    ctx.drawImage(
      frog.image,
      -frog.size / 2,
      -frog.size / 2,
      frog.size,
      frog.size
    );

    ctx.restore();
  }
}

document
  .getElementById("randomizeSeed")
  .addEventListener("click", () => {
    seed = Math.floor(Math.random() * 999999);
    generatePattern();
  });

generatePattern();

document.getElementById("export").addEventListener("click", () => {
  const link = document.createElement("a");

  link.download = "greeble-pattern.png";
  link.href = canvas.toDataURL("image/png");

  link.click();
});
