export function randomBetween(min, max, random) {
  return min + random() * (max - min);
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = src;
  });
}

export function checkCollision(x, y, size, objects, spacing) {
  for (const object of objects) {
    const distanceSquared = (x - object.x) ** 2 + (y - object.y) ** 2;
    const minimumDistance = size / 2 + object.size / 2 + spacing;

    if (distanceSquared < minimumDistance ** 2) {
      return true;
    }
  }

  return false;
}

export function shuffleArray(array, random) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function getPixelMask(image, maskSize = 200) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  canvas.width = maskSize;
  canvas.height = maskSize;

  ctx.drawImage(
    image,
    0,
    0,
    maskSize,
    maskSize
  );

  const imageData = ctx.getImageData(
    0,
    0,
    maskSize,
    maskSize
  );

  const pixels = imageData.data;

  const mask = new Uint8Array(
    maskSize * maskSize
  );

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];

    if (alpha > 20) {
      mask[i / 4] = 1;
    }
  }

  return {
    mask,
    width: maskSize,
    height: maskSize,
  };
}

export function createTransformedMask(pixelMask, size, rotation, flip) {
  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");

  sourceCanvas.width = pixelMask.width;
  sourceCanvas.height = pixelMask.height;

  const sourceImageData = sourceCtx.createImageData(
    pixelMask.width,
    pixelMask.height
  );

  for (let i = 0; i < pixelMask.mask.length; i++) {
    const value = pixelMask.mask[i];

    sourceImageData.data[i * 4] = 255;
    sourceImageData.data[i * 4 + 1] = 255;
    sourceImageData.data[i * 4 + 2] = 255;
    sourceImageData.data[i * 4 + 3] = value ? 255 : 0;
  }

  sourceCtx.putImageData(sourceImageData, 0, 0);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = Math.ceil(size * 2);
  canvas.height = Math.ceil(size * 2);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  if (flip) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(sourceCanvas, -size / 2, -size / 2, size, size);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return {
    data: imageData.data,
    width: canvas.width,
    height: canvas.height,
  };
}

export function checkPixelCollision(objectA, objectB) {
  const halfA = objectA.pixelMask.width / 2;
  const halfB = objectB.pixelMask.width / 2;

  const leftA = objectA.x - halfA;
  const topA = objectA.y - halfA;
  const leftB = objectB.x - halfB;
  const topB = objectB.y - halfB;

  const startX = Math.max(leftA, leftB);
  const startY = Math.max(topA, topB);

  const endX = Math.min(
    leftA + objectA.pixelMask.width,
    leftB + objectB.pixelMask.width
  );
  const endY = Math.min(
    topA + objectA.pixelMask.height,
    topB + objectB.pixelMask.height
  );

  if (startX >= endX || startY >= endY) {
    return false;
  }

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const ax = Math.floor(x - leftA);
      const ay = Math.floor(y - topA);
      const bx = Math.floor(x - leftB);
      const by = Math.floor(y - topB);

      const indexA = (ay * objectA.pixelMask.width + ax) * 4;
      const indexB = (by * objectB.pixelMask.width + bx) * 4;

      const alphaA = objectA.pixelMask.data[indexA + 3];
      const alphaB = objectB.pixelMask.data[indexB + 3];

      if (alphaA > 20 && alphaB > 20) {
    console.log("PIXEL COLLISION!");
    return true;
}
    }
  }

  return false;
}

export function placeMotifs({
  images,
  count,
  minSize,
  maxSize,
  spacing,
  canvas,
  random,
  existingObjects = [],
  rotationRange = 35,
  allowFlip = true,
  maxAttempts = 100,
}) {
  const objects = [];

  let imagePool = shuffleArray(images, random);
  let imageIndex = 0;

  for (let i = 0; i < count; i++) {
    if (imageIndex >= imagePool.length) {
      imagePool = shuffleArray(images, random);
      imageIndex = 0;
    }

    const image = imagePool[imageIndex];
    imageIndex++;

    const size = randomBetween(minSize, maxSize, random);
    const rotation = randomBetween(
      -rotationRange,
      rotationRange,
      random
    );

    const flip =
      allowFlip && random() < 0.5;

    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = randomBetween(
        size / 2,
        canvas.width - size / 2,
        random
      );

      const y = randomBetween(
        size / 2,
        canvas.height - size / 2,
        random
      );

      const collision = checkCollision(
        x,
        y,
        size,
        [...existingObjects, ...objects],
        spacing
      );

      if (collision) {
        continue;
      }


      const candidate = {
        image: image.image,

        pixelMask: createTransformedMask(
          image.pixelMask,
          size,
          rotation,
          flip
        ),

        x,
        y,
        size,
        rotation,
        flip,
      };


      let pixelCollision = false;

      for (const object of [
        ...existingObjects,
        ...objects,
      ]) {
        if (
          object.pixelMask &&
          candidate.pixelMask
        ) {
          if (
            checkPixelCollision(
              candidate,
              object
            )
          ) {
            pixelCollision = true;
            break;
          }
        }
      }

      if (pixelCollision) {
        continue;
      }


      objects.push(candidate);

      placed = true;
      break;
    }

    if (!placed) {
      console.log(
        "Could not place motif",
        i
      );
    }
  }

  return objects;
}
export function placeNames({
  text,
  count,
  size,
  ctx,
  canvas,
  random,
  existingObjects = [],
  spacing = 30,
  maxAttempts = 200,
}) {
  const objects = [];

  ctx.font = `${size}px "Love Light"`;

  const textWidth = ctx.measureText(text).width;
  const namePadding = 40;
  const nameWidth = textWidth + namePadding;
  const nameHeight = size + namePadding;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = randomBetween(
        nameWidth / 2 + spacing,
        canvas.width - nameWidth / 2 - spacing,
        random
      );

      const y = randomBetween(
        nameHeight / 2 + spacing,
        canvas.height - nameHeight / 2 - spacing,
        random
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
          rotation: randomBetween(-15, 15, random),
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

export function placeFillers({
  count,
  minSize,
  maxSize,
  spacing = 5,
  canvas,
  random,
  existingObjects = [],
  rotationRange = 180,
  maxAttempts = 300,
}) {
  const objects = [];

  const types = ["star", "heart"];
  const starVariants = ["four", "five", "outline", "sparkle"];
  const heartVariants = ["filled", "outline"];

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const size = randomBetween(minSize, maxSize, random);
      const x = randomBetween(size / 2, canvas.width - size / 2, random);
      const y = randomBetween(size / 2, canvas.height - size / 2, random);
      const rotation = randomBetween(-rotationRange, rotationRange, random);

      const collision = checkCollision(
        x,
        y,
        size,
        [...existingObjects, ...objects],
        spacing
      );

      if (!collision) {
        const type = types[Math.floor(random() * types.length)];
        let variant;

        if (type === "star") {
          variant =
            starVariants[Math.floor(random() * starVariants.length)];
        } else {
          variant =
            heartVariants[Math.floor(random() * heartVariants.length)];
        }

        objects.push({
          type,
          variant,
          x,
          y,
          size,
          rotation,
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log("Could not place filler", i);
    }
  }

  return objects;
}