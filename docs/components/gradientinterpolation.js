import * as culori from "npm:culori@4.0.1"
export {colorInterpolationImgData, colorInterpolationImgDataTriangle};

function colorInterpolationImgData(imgData, c00, c10, c01, c11, mode = "rgb") {
    const { data, width, height } = imgData;
    const rgb = culori.converter("rgb");
    const nx = width - 1;
    const ny = height - 1;
    const interpolatorLeft = culori.interpolate([c00, c01], mode);
    const interpolatorRight = culori.interpolate([c10, c11], mode);
    for (let j = 0; j < height; j++) {
      const u = j / ny;
      const interpolator = culori.interpolate(
        [interpolatorLeft(u), interpolatorRight(u)],
        mode
      );
      for (let i = 0; i < width; i++) {
        const v = i / nx;
        const color = interpolator(v);
        const { r, g, b } = rgb(color);
        const idx = (i + j * width) * 4;
        data[idx] = r * 255;
        data[idx + 1] = g * 255;
        data[idx + 2] = b * 255;
        data[idx + 3] = 255;
      }
    }
}

function colorInterpolationImgDataTriangle(
    imgData,
    cleft,
    cright,
    ctop,
    mode = "rgb"
  ) {
    const { data, width, height } = imgData;
    const rgb = culori.converter("rgb");
    const nx = width - 1;
    const ny = height - 1;
    const interpolatorLeft = culori.interpolate([ctop, cleft], mode);
    const interpolatorRight = culori.interpolate([ctop, cright], mode);
    for (let j = 0; j < height; j++) {
      const u = j / ny;
      const interpolator = culori.interpolate(
        [interpolatorLeft(u), interpolatorRight(u)],
        mode
      );
      const ileft = Math.floor(width / 2 - (j * width) / 2 / height);
      const iright = Math.ceil(width / 2 + (j * width) / 2 / height);
      const segLen = iright - ileft - 1;
      for (let i = 0; i <= nx; i++) {
        const idx = (i + j * width) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      }
      for (let i = ileft; i < iright; i++) {
        const v = (i - ileft) / segLen;
        const color = interpolator(v);
        const { r, g, b } = rgb(color);
        const idx = (i + j * width) * 4;
        data[idx] = r * 255;
        data[idx + 1] = g * 255;
        data[idx + 2] = b * 255;
        data[idx + 3] = 255;
      }
    }
  }