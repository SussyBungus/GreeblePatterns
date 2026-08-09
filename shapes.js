function drawFourPointStar(ctx, size, filled = true) {
  const outer = size / 2;
  const inner = size * 0.12;

  ctx.beginPath();

  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? outer : inner;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function drawFivePointStar(ctx, size, filled = true) {
  const outer = size / 2;
  const inner = size * 0.22;

  ctx.beginPath();

  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function drawSparkle(ctx, size) {
  const outer = size / 2;
  const inner = size * 0.08;

  ctx.beginPath();

  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? outer : inner;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.stroke();
}

function drawOutlineStar(ctx, size) {
  drawFivePointStar(ctx, size, false);
}

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

  if (type === "star") {

    if (variant === "four") {
      drawFourPointStar(ctx, size, true);
    } else if (variant === "five") {
      drawFivePointStar(ctx, size, true);
    } else if (variant === "outline") {
      drawOutlineStar(ctx, size);
    } else if (variant === "sparkle") {
      drawSparkle(ctx, size);
    }

  } else if (type === "heart") {

    if (variant === "filled") {
      drawHeart(ctx, size, true);
    } else if (variant === "outline") {
      drawOutlineHeart(ctx, size);
    }

  }
}