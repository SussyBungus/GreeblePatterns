function drawHeart(ctx, size) {
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

  ctx.stroke();
}


function drawFiller(ctx, type, variant, size) {
  if (type === "heart" && variant === "outline") {
    drawHeart(ctx, size);
  }
}