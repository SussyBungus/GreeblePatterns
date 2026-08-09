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

export function checkCollision(
  x,
  y,
  size,
  objects,
  spacing
) {
  for (const object of objects) {
    const distanceSquared =
      (x - object.x) ** 2 +
      (y - object.y) ** 2;

    const minimumDistance =
      size / 2 +
      object.size / 2 +
      spacing;

    if (
      distanceSquared <
      minimumDistance ** 2
    ) {
      return true;
    }
  }

  return false;
}

export function shuffleArray(array, random) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}


// ------------------------------------
// MOTIF PLACEMENT
// ------------------------------------

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
  maxAttempts = 400,
}) {
  const objects = [];

  // Make a randomized pool of images
  let imagePool = shuffleArray(images, random);
  let imageIndex = 0;

  for (let i = 0; i < count; i++) {

    // Once every image has been used,
    // shuffle them again
    if (imageIndex >= imagePool.length) {
      imagePool = shuffleArray(images, random);
      imageIndex = 0;
    }

    const image = imagePool[imageIndex];
    imageIndex++;

    const size = randomBetween(
      minSize,
      maxSize,
      random
    );

    let placed = false;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt++
    ) {
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

      if (!collision) {
        objects.push({
          image,
          x,
          y,
          size,

          rotation: randomBetween(
            -rotationRange,
            rotationRange,
            random
          ),

          flip:
            allowFlip &&
            random() < 0.5,
        });

        placed = true;
        break;
      }
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


// ------------------------------------
// NAME PLACEMENT
// ------------------------------------

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

  const textWidth =
    ctx.measureText(text).width;

  const namePadding = 40;

  const nameWidth =
    textWidth + namePadding;

  const nameHeight =
    size + namePadding;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt++
    ) {
      const x = randomBetween(
        nameWidth / 2 + spacing,
        canvas.width -
          nameWidth / 2 -
          spacing,
        random
      );

      const y = randomBetween(
        nameHeight / 2 + spacing,
        canvas.height -
          nameHeight / 2 -
          spacing,
        random
      );

      let collision = false;

      // Check against frogs, flowers, etc.
      for (const object of existingObjects) {
        const distanceX =
          Math.abs(x - object.x);

        const distanceY =
          Math.abs(y - object.y);

        const minimumX =
          object.size / 2 +
          nameWidth / 2 +
          spacing;

        const minimumY =
          object.size / 2 +
          nameHeight / 2 +
          spacing;

        if (
          distanceX < minimumX &&
          distanceY < minimumY
        ) {
          collision = true;
          break;
        }
      }

      // Check against other names
      if (!collision) {
        for (const name of objects) {
          const distanceX =
            Math.abs(x - name.x);

          const distanceY =
            Math.abs(y - name.y);

          if (
            distanceX <
              name.width / 2 +
                nameWidth / 2 +
                spacing &&
            distanceY <
              name.height / 2 +
                nameHeight / 2 +
                spacing
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

          rotation: randomBetween(
            -15,
            15,
            random
          ),
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log(
        "Could not place name",
        i
      );
    }
  }

  return objects;
}


// ------------------------------------
// FILLER SHAPES
// ------------------------------------

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

  const types = [
    "star",
    "heart",
  ];

  const starVariants = [
    "four",
    "five",
    "outline",
    "sparkle",
  ];

  const heartVariants = [
    "filled",
    "outline",
  ];

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt++
    ) {
      const size = randomBetween(
        minSize,
        maxSize,
        random
      );

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

      if (!collision) {
        const type =
          types[
            Math.floor(
              random() * types.length
            )
          ];

        let variant;

        if (type === "star") {
          variant =
            starVariants[
              Math.floor(
                random() *
                  starVariants.length
              )
            ];
        } else {
          variant =
            heartVariants[
              Math.floor(
                random() *
                  heartVariants.length
              )
            ];
        }

        objects.push({
          type,
          variant,
          x,
          y,
          size,

          rotation: randomBetween(
            -rotationRange,
            rotationRange,
            random
          ),
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log(
        "Could not place filler",
        i
      );
    }
  }

  return objects;
}