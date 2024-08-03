import {html} from "../../_npm/htl@0.3.1/_esm.js";
export {paletteDisplay};

function paletteDisplay(palette, options = {}) {
    const { width = 300, height = 40 } = options;
    const canvas = html`<canvas width=${width} height=${height}>`;
    const ctx = canvas.getContext("2d");
    const n = palette.length;
    const w = width / n;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = palette[i];
      ctx.fillRect(i * w, 0, w, height);
    }
    return canvas;
  }