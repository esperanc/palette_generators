# Perceptual Color Mixer

```js
import {
    rgb_to_hsl, hsl_to_rgb, rgb_to_hsv, hsv_to_rgb, srgb_transfer_function, srgb_transfer_function_inv, 
    linear_srgb_to_oklab, oklab_to_linear_srgb, toe_inv, okhsv_to_srgb, srgb_to_okhsv,
    find_gamut_intersection, srgb_to_okhsl, okhsl_to_srgb, rgb_to_oklch, oklch_to_rgb 
} from "./components/colorconversion.js";

import {cartesianRgb2normXy, polarRgb2normXy, colorPicker} from "./components/colorpicker.js";
import {proportionWidget} from "./components/proportionwidget.js";
import {colorWidget} from "./components/colorwidget.js";
```

```js
import {render, render_okhsl, render_static, oklab_C_scale} from "./components/pickerrender.js"; 
const rgb = Mutable(d3.color('red'));
const clamp = x => isNaN(x) ? 0 : Math.max(0,Math.min(1,x));
const clamp255 = x => isNaN(x) ? 0 : Math.max(0,Math.min(255,x));
const set_rgb = (r,g,b) => rgb.value = Object.assign(rgb.value, {r:clamp255(r),g:clamp255(g),b:clamp255(b)});
const get_rgb = () => [rgb.value.r, rgb.value.g, rgb.value.b];
let result = render_static();
Object.assign(result, render(...get_rgb()));
Object.assign(result, render_okhsl(...get_rgb()));
function imageDataCanvas (imgData) {
    const [w, h] = [imgData.width, imgData.height];
    const canvas = html`<canvas width=${w} height=${h}>`;
    const ctx = canvas.getContext("2d");
    const setImgData = () => {
        ctx.putImageData(imgData, 0, 0);
    }
    setImgData();
    const margin = 10;
    Object.assign (canvas.style, {
        position: "absolute",
        left: margin+"px",
        top: margin+"px"
    })
    const container = html`<div>`;
    Object.assign(container.style, {
        position:"relative",
    })
    const cursorSvg = html`<svg width=${w+margin*2} height=${h+margin*2} viewbox="${-margin} ${-margin} ${w+margin*2} ${h+margin*2}" >`;
    cursorSvg.append (svg`<rect x=0 y=0 width=${w} height=${h} stroke=blue fill=none>`);
    container.append(canvas,cursorSvg)
    return container;
}
```

```js
const safe_srgb_to_okhsl = (r,g,b) => srgb_to_okhsl(r,g,b).map(clamp);
const okhsl = safe_srgb_to_okhsl (...get_rgb());
const torgb = okhsl_to_srgb (...okhsl);
```


```js
// OKHSL_HL
const okhsl_hl = {};
okhsl_hl.rgb2normXy = cartesianRgb2normXy (safe_srgb_to_okhsl, [0,2], [1,-1]);
okhsl_hl.callback = (normx,normy) => { 
    const rgb_before = get_rgb();
    const okhsl = safe_srgb_to_okhsl (...rgb_before);
    const s = okhsl[1];
    const [h,l] = [normx,1-normy];
    const rgb_after = okhsl_to_srgb (clamp(h), clamp(s), clamp(l));
    set_rgb (...rgb_after);
};
okhsl_hl.picker = colorPicker (result.okhsl_hl, okhsl_hl.rgb2normXy, okhsl_hl.callback);
```


```js
// OKHSL_HS
const okhsl_hs = {};
okhsl_hs.rgb2normXy = polarRgb2normXy (srgb_to_okhsl, 0, 1, [1,1]);
okhsl_hs.callback = (normx,normy) => {
    const rgb_before = get_rgb();
    const okhsl = srgb_to_okhsl (...rgb_before);
    const hsl_a = 2*normy-1;
    const hsl_b = 2*(1 - normx)-1;
    const h = Math.atan2(hsl_a, hsl_b) / Math.PI * 0.5 + 0.5;
    const s = 2 * Math.hypot(normy-0.5,normx-0.5);
    const l = okhsl[2];
    const rgb_after = okhsl_to_srgb (clamp(h),clamp(s),clamp(l));
    set_rgb (...rgb_after);
}
okhsl_hs.picker = colorPicker (result.okhsl_hs, okhsl_hs.rgb2normXy, okhsl_hs.callback)
```

```js
// OKLCH_H
const oklch_h = {};
oklch_h.rgb2normXy = cartesianRgb2normXy (rgb_to_oklch, [2], [1]);
oklch_h.callback = (normx,normy) => { 
    const rgb_before = get_rgb();
    const lch = rgb_to_oklch (...rgb_before);
    const h = normy;
    const rgb_after = oklch_to_rgb (clamp(lch[0]),clamp(lch[1]),clamp(h));
    set_rgb (...rgb_after);
};
oklch_h.picker = colorPicker (result.oklch_h, oklch_h.rgb2normXy,oklch_h.callback);
display (oklch_h.picker);
```

```js
// OKLCH_LC
const oklch_lc = {};
oklch_lc.rgb2normXy = cartesianRgb2normXy (rgb_to_oklch, [1,0], [oklab_C_scale,-1]);
oklch_lc.callback = (normx,normy) => { 
    const rgb_before = get_rgb();
    const lch = rgb_to_oklch (...rgb_before);
    const [c,l] = [normx*oklab_C_scale,1-normy];
    const rgb_after = oklch_to_rgb (clamp(l), clamp(c), clamp(lch[2]));
    set_rgb (...rgb_after);
};
oklch_lc.picker = colorPicker (result.oklch_lc, oklch_lc.rgb2normXy,oklch_lc.callback);
display (oklch_lc.picker);
```

```js
const parts = Mutable([0.5, 0.5]);
const getParts = () => [...parts.value]
const setParts = (newParts) => parts.value = newParts;
```

```js
const selected = Mutable(0);
const getSelected = () => selected.value
const setSelected = (newsel) => selected.value = newsel;
```

```js
const colors = Mutable(d3.schemeAccent);
const getColors = () => colors.value;
const setColors = (newColors) => {colors.value = newColors };
const getColor = (i) => colors.value[i];
const setColor = (i,color) => {colors.value[i] = color};
```

```js
const proportionsInput = proportionWidget({parts, selected: getSelected(), color: getColor, width:width-30});
const proportions = Generators.input(proportionsInput);
```

```js
// Reactivity:
// Updates selectedColor with the value of the new selected color
// Modifies the parts array without triggering the reactivity
{
  const prop = proportions;
  setSelected(prop.selected);
  const col = d3.color(getColor(prop.selected));
  set_rgb (col.r, col.g, col.b);
  prop.parts.forEach((d, i) => {
    parts[i] = d;
  });
}
```

```js
// Reactivity:
// Updates the display of the proportions widget with the value of input selectedColor
{
  rgb;
  setColor(getSelected(),rgb.formatHex());
  proportionsInput.update();
}
```

```js
const insertButton = html`<button>insert`;
insertButton.onclick = () => {
    let pts = getParts();
    const n = pts.length;
    if (n < 8) {
      const sum = pts.reduce((a, b) => a + b, 0);
      pts = pts.map((x) => ((x / sum) * n) / (n + 1));
      pts.push(1 / (n + 1));
      setParts(pts);
    }
};
```

```js
const removeButton = html`<button>remove`;
removeButton.onclick = () => {
    let pts = getParts();
    const n = pts.length;    
    if (n > 1) {
      let col = getColors();
      let isel = getSelected();
      pts.splice(isel, 1);
      let deletedColor = col[isel];
      col.splice(isel, 1);
      col.push(deletedColor);
      if (isel >= pts.length) {
        isel = pts.length - 1;
        setSelected(isel);
      }
      const curColor = d3.color(col[isel]);
      set_rgb (curColor.r, curColor.g, curColor.b);
      const sum = pts.reduce((a, b) => a + b, 0);
      pts = pts.map((x) => x / sum);
      setColors(col);
      setParts(pts);
    }
};
```

```js
//
// Button enable / disable
{
  proportions;
  const n = proportions.parts.length;
  insertButton.disabled = n >= 8;
  removeButton.disabled = n <= 2;
}
```

```js
rgb;
const rgbWidgetInput = colorWidget({value:get_rgb()});
rgbWidgetInput.oninput = () => set_rgb(...rgbWidgetInput.value);
```

```js
proportions;
rgb;
let averageSample;
{
    let oklab_avg = [0,0,0];
    const parts = proportions.parts;
    const n = parts.length;
    for (let i = 0; i < n; i++) {
        const part = parts[i];
        const color = d3.color(colors[i]);
        let oklab = linear_srgb_to_oklab (color.r/255, color.g/255, color.b/255);
        for (let j = 0; j < 3; j++) {
            oklab_avg[j] += part * oklab[j];
        }
    }
    let [r,g,b] = oklab_to_linear_srgb(...oklab_avg);
    const rgbColor = `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;
    const avgColor = d3.color(rgbColor);
    averageSample = html`<div>`;
    Object.assign(averageSample.style, {
        width: (width-30)+"px",
        height: "100px",
        background: avgColor.formatHex()
    })
}
```


```js
// Reactive Update 
rgb;
//hsv_h.picker.setRgb(...get_rgb());
//okhsv_h.picker.setRgb(...get_rgb());
//hsv_sv.picker.setRgb(...get_rgb());

// Update cursors
oklch_h.picker.setRgb(...get_rgb());
oklch_lc.picker.setRgb(...get_rgb());
okhsl_hs.picker.setRgb(...get_rgb());
okhsl_hl.picker.setRgb(...get_rgb());
// Update imgDatas
Object.assign(result, render(...get_rgb()));
Object.assign(result, render_okhsl(...get_rgb()));
//hsv_sv.picker.setImgData(result.hsv_sv);
oklch_lc.picker.setImgData(result.oklch_lc);
okhsl_hs.picker.setImgData(result.okhsl_hs);
okhsl_hl.picker.setImgData(result.okhsl_hl);
```

<style>
  svg.proportion g.handles .dragging {
    filter: drop-shadow(0 0 0.1rem black);
  }
  svg.proportion g.percentages text {
    font-family: sans-serif;
    font-size: 14pt;
    fill: white;
    stroke: none;
    filter: drop-shadow(0 0 1px black);
  }
</style>

<style>
  div.inlineSons >* {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
  }

  div.centeredSons >* {
    display: inline-block;
    margin-left: auto;
    margin-bottom: 10px;
    width:100%;
    text-align:center;
  }
</style>

<style>
  form.colorwidget label {
    font-family: sans-serif;
    font-size: 10pt;
    padding-right: 1em;
  }
  form.colorwidget label input {
    margin-left: 0.5em;
  }
</style>

<div class=card >
${averageSample}
</div>

<div class=card >
${proportionsInput}
    <div class=centeredSons>
        <div>
        ${insertButton}
        ${removeButton}
        </div>
    </div>
</div>

<div class=card>
    <div class=centeredSons>
        ${rgbWidgetInput}
    </div>
    <div  style="display:flex" >
        <div style="flex-grow:1">${oklch_h.picker}</div>
        <div style="flex-grow:1">${oklch_lc.picker}</div>
        <div style="flex-grow:1">${okhsl_hs.picker}</div>
        <div style="flex-grow:1">${okhsl_hl.picker}</div>
    </div>
</div>
