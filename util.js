export function randomBetween(min, max, random) {
  return min + random() * (max - min);
}

export function shuffleArray(array, random) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}


// Bounding circle collision check
export function checkCollision(x, y, size, objects, spacing) {
  for (const object of objects) {
    const objectSize =
      object.size ?? Math.max(object.width ?? 0, object.height ?? 0);

    const distanceSquared = (x - object.x) ** 2 + (y - object.y) ** 2;
    const minimumDistance = size / 2 + objectSize / 2 + spacing;

    if (distanceSquared < minimumDistance ** 2) {
      return true;
    }
  }

  return false;
}

// Pixel-perfect collision check
export function checkPixelCollision(objectA, objectB) {
  const maskA = objectA.pixelMask;
  const maskB = objectB.pixelMask;

  if (!maskA || !maskB) {
    return false;
  }

  const scaleA = maskA.scale;
  const scaleB = maskB.scale;

  const halfA =
    Math.max(objectA.width ?? objectA.size, objectA.height ?? objectA.size) / 2;
  const halfB =
    Math.max(objectB.width ?? objectB.size, objectB.height ?? objectB.size) / 2;

  const leftA = objectA.x - halfA;
  const topA = objectA.y - halfA;
  const leftB = objectB.x - halfB;
  const topB = objectB.y - halfB;

  const rightA = objectA.x + halfA;
  const bottomA = objectA.y + halfA;
  const rightB = objectB.x + halfB;
  const bottomB = objectB.y + halfB;

  const startX = Math.max(leftA, leftB);
  const startY = Math.max(topA, topB);
  const endX = Math.min(rightA, rightB);
  const endY = Math.min(bottomA, bottomB);

  if (startX >= endX || startY >= endY) {
    return false;
  }

  const startMaskAX = Math.max(0, Math.floor((startX - leftA) / scaleA));
  const startMaskAY = Math.max(0, Math.floor((startY - topA) / scaleA));
  const endMaskAX = Math.min(maskA.width, Math.ceil((endX - leftA) / scaleA));
  const endMaskAY = Math.min(maskA.height, Math.ceil((endY - topA) / scaleA));

  for (let ay = startMaskAY; ay < endMaskAY; ay++) {
    for (let ax = startMaskAX; ax < endMaskAX; ax++) {
      const indexA = (ay * maskA.width + ax) * 4;

      if (maskA.data[indexA + 3] <= 20) {
        continue;
      }

      const worldX = leftA + (ax + 0.5) * scaleA;
      const worldY = topA + (ay + 0.5) * scaleA;

      const bx = Math.floor((worldX - leftB) / scaleB);
      const by = Math.floor((worldY - topB) / scaleB);

      if (bx < 0 || bx >= maskB.width || by < 0 || by >= maskB.height) {
        continue;
      }

      const indexB = (by * maskB.width + bx) * 4;

      if (maskB.data[indexB + 3] > 20) {
        return true;
      }
    }
  }

  return false;
}




// Extract binary pixel mask from an image
export function getPixelMask(image, maskSize = 200) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = maskSize;
  canvas.height = maskSize;

  ctx.drawImage(image, 0, 0, maskSize, maskSize);

  const imageData = ctx.getImageData(0, 0, maskSize, maskSize);
  const pixels = imageData.data;
  const mask = new Uint8Array(maskSize * maskSize);

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 20) {
      mask[i / 4] = 1;
    }
  }

  return {
    mask,
    width: maskSize,
    height: maskSize,
  };
}

// Render text and generate a pixel mask
export function getTextPixelMask(text, font, maskSize = 200) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = maskSize;
  canvas.height = maskSize;

  ctx.clearRect(0, 0, maskSize, maskSize);
  ctx.fillStyle = "#000000";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(text, maskSize / 2, maskSize / 2);

  const imageData = ctx.getImageData(0, 0, maskSize, maskSize);
  const pixels = imageData.data;
  const mask = new Uint8Array(maskSize * maskSize);

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 20) {
      mask[i / 4] = 1;
    }
  }

  return {
    mask,
    width: maskSize,
    height: maskSize,
  };
}

// Transform an image mask with size, rotation, and flipping
export function createTransformedMask(pixelMask, size, rotation, flip) {
  const maskSize = pixelMask.width;

  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");
  sourceCanvas.width = maskSize;
  sourceCanvas.height = maskSize;

  const sourceImageData = sourceCtx.createImageData(maskSize, maskSize);

  for (let i = 0; i < pixelMask.mask.length; i++) {
    const value = pixelMask.mask[i];
    sourceImageData.data[i * 4] = 255;
    sourceImageData.data[i * 4 + 1] = 255;
    sourceImageData.data[i * 4 + 2] = 255;
    sourceImageData.data[i * 4 + 3] = value ? 255 : 0;
  }

  sourceCtx.putImageData(sourceImageData, 0, 0);

  const canvas = document.createElement("canvas");
  canvas.width = maskSize;
  canvas.height = maskSize;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.translate(maskSize / 2, maskSize / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  if (flip) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(sourceCanvas, -maskSize / 2, -maskSize / 2, maskSize, maskSize);

  const imageData = ctx.getImageData(0, 0, maskSize, maskSize);

  return {
    data: imageData.data,
    width: maskSize,
    height: maskSize,
    scale: size / maskSize,
  };
}

// Transform a text mask with dimensions and rotation
export function createTransformedTextMask(pixelMask, width, height, rotation) {
  const maskSize = pixelMask.width;

  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");
  sourceCanvas.width = maskSize;
  sourceCanvas.height = maskSize;

  const sourceImageData = sourceCtx.createImageData(maskSize, maskSize);

  for (let i = 0; i < pixelMask.mask.length; i++) {
    const value = pixelMask.mask[i];
    sourceImageData.data[i * 4] = 0;
    sourceImageData.data[i * 4 + 1] = 0;
    sourceImageData.data[i * 4 + 2] = 0;
    sourceImageData.data[i * 4 + 3] = value ? 255 : 0;
  }

  sourceCtx.putImageData(sourceImageData, 0, 0);

  const collisionSize = Math.max(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = collisionSize;
  canvas.height = collisionSize;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.translate(collisionSize / 2, collisionSize / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(sourceCanvas, -width / 2, -height / 2, width, height);

  const imageData = ctx.getImageData(0, 0, collisionSize, collisionSize);

  return {
    data: imageData.data,
    width: collisionSize,
    height: collisionSize,
    scale: 1,
  };
}


// Randomly place image motifs without overlapping
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

    const image = imagePool[imageIndex++];
    const size = randomBetween(minSize, maxSize, random);
    const rotation = randomBetween(-rotationRange, rotationRange, random);
    const flip = allowFlip && random() < 0.5;

    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = randomBetween(size / 2, canvas.width - size / 2, random);
      const y = randomBetween(size / 2, canvas.height - size / 2, random);

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

      const nearbyObjects = [...existingObjects, ...objects];

      // Fast bounding circle check
      if (!checkCollision(x, y, size, nearbyObjects, spacing)) {
        objects.push(candidate);
        placed = true;
        break;
      }

      // Precise pixel collision check
      let pixelCollision = false;

      for (const object of nearbyObjects) {
        if (!object.pixelMask) continue;

        if (checkPixelCollision(candidate, object)) {
          pixelCollision = true;
          break;
        }
      }

      if (pixelCollision) continue;

      objects.push(candidate);
      placed = true;
      break;
    }

    if (!placed) {
      console.log("Could not place motif", i);
    }
  }

  return objects;
}

// Randomly place text labels without overlapping
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

  const baseTextMask = getTextPixelMask(
    text,
    `${size}px "Love Light"`,
    200
  );

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
      const rotation = randomBetween(-15, 15, random);

      const candidate = {
        text,
        x,
        y,
        size,
        width: nameWidth,
        height: nameHeight,
        rotation,
        pixelMask: createTransformedTextMask(
          baseTextMask,
          nameWidth,
          nameHeight,
          rotation
        ),
      };

      const nearbyObjects = [...existingObjects, ...objects];
      let collision = false;

      // Bounding box collision check
      for (const object of nearbyObjects) {
        const distanceX = Math.abs(x - object.x);
        const distanceY = Math.abs(y - object.y);

        const objectWidth = object.width ?? object.size;
        const objectHeight = object.height ?? object.size;

        const minimumX = objectWidth / 2 + nameWidth / 2 + spacing;
        const minimumY = objectHeight / 2 + nameHeight / 2 + spacing;

        if (distanceX < minimumX && distanceY < minimumY) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        objects.push(candidate);
        placed = true;
        break;
      }

      // Precise pixel collision check
      let pixelCollision = false;

      for (const object of nearbyObjects) {
        if (!object.pixelMask) continue;

        if (checkPixelCollision(candidate, object)) {
          pixelCollision = true;
          break;
        }
      }

      if (pixelCollision) continue;

      objects.push(candidate);
      placed = true;
      break;
    }

    if (!placed) {
      console.log("Could not place name", i);
    }
  }

  return objects;
}

// Randomly place heart outline shapes in open spaces
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

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const size = randomBetween(minSize, maxSize, random);
      const x = randomBetween(size / 2, canvas.width - size / 2, random);
      const y = randomBetween(size / 2, canvas.height - size / 2, random);
      const rotation = randomBetween(-rotationRange, rotationRange, random);

      const nearbyObjects = [...existingObjects, ...objects];

      if (checkCollision(x, y, size, nearbyObjects, spacing)) {
        continue;
      }

      objects.push({
        type: "heart",
        variant: "outline",
        x,
        y,
        size,
        rotation,
      });

      placed = true;
      break;
    }

    if (!placed) {
      console.log("Could not place filler", i);
    }
  }

  return objects;
}