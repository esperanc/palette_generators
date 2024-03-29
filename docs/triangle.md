# Triangle

Creates a palette of 7 colors by interactively manipulating a triangle over a gradient image defined by 3 or 4 colors.

```js
import {triangleInteraction} from "./components/triangleinteraction.js";
import {colorInterpolationImgData, colorInterpolationImgDataTriangle} from "./components/gradientinterpolation.js";
import {paletteDisplay} from "./components/palettedisplay.js";
```

```js
//
// The gradient color inputs
//
const defaultColors = [
    "#ffffff","#0000ff","#ff0000","#000000"
    ];
const makeColorInputs = () => defaultColors.map(color => {
        let input = html`<input type="color" value=${color}>`;
        return input;
    });
const [c0,c1,c2,c3] = makeColorInputs();
const colorForm = Inputs.form({c0,c1,c2,c3});
// Object.assign(colorForm.style, {
//   display : "inline-block",
//   verticalAlign : "middle"
// });
colorForm.insertBefore(html`<br>`, c2);
const rgb = Generators.input(colorForm);
const shuffleGradientColors = () => {
  let {c0,c1,c2,c3} = colorForm.value;
  if (gradientTypeInput.value == "3 colors") {
    [c0,c2,c3] = d3.shuffle([c0,c2,c3]);
  } else {
    [c0,c1,c2,c3] = d3.shuffle([c0,c1,c2,c3]);
  }
  colorForm.value = {c0,c1,c2,c3};
  colorForm.dispatchEvent (new CustomEvent("input"));
}
```

```js
// 
// The button to shuffle gradient colors
//
const shuffleGradientColorsButton = html`<button> Shuffle </button`;
shuffleGradientColorsButton.onclick = shuffleGradientColors;
// Object.assign(shuffleGradientColorsButton.style, {
//   verticalAlign : "middle",
//   marginLeft: "10px"
// });
```

```js
//
// Interpolation settings
//
const gradientTypeInput = Inputs.select(["4 colors", "3 colors"], {
  label: "Gradient type"
});
const modeInput = Inputs.select(["rgb", "lrgb"], { label: "Interpolation" });
const mode = Generators.input(modeInput);
const gradientType = Generators.input(gradientTypeInput);
```

```js
//
// Hide some buttons if not 4-colors
//
{
  const displayMode = gradientType == "4 colors" ? "inherit" : "none";
  d3.selectAll("div.fourColorOnly").style("display", displayMode);
}
```


```js
// 
// The main canvas interface
//
function canvasInterface (options = {}) {
  let {width = 500,
    height = 500,
    snapping = false} = options;
  const canvas = html`<canvas width=${width} height=${height}>`;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, width, height);
  const setImgData = () => {
    const colors = colorForm.value;
    if (gradientTypeInput.value == "3 colors") {
      colorInterpolationImgDataTriangle(
        imgData,
        colors.c2,
        colors.c3,
        colors.c0,
        modeInput.value
      );
    } else {
      colorInterpolationImgData(
        imgData,
        colors.c0,
        colors.c1,
        colors.c2,
        colors.c3,
        modeInput.value
      );
    }
  };
  setImgData();
  const m = 10, w=width,h=height;
  const snapPoints = [[m,m], [w/2,m], [w-m,m],
                        [m,h/2], [w/2,h/2], [w-m, h/2],
                        [m,h-m], [w/2,h-m], [w-m, h-m]];
  let vertices = [
    [...snapPoints[1]], [...snapPoints[6]], [...snapPoints[8]]
  ];
  let points;

  const container = html`<div>`;
  Object.assign(container.style, {
    maxWidth: width + "px",
    background: "gray",
    padding: "10px"
  });
  container.append(canvas);
  container.value = [];

  const drawImageData = () => ctx.putImageData(imgData, 0, 0);
  ctx.canvas.drawImageData = drawImageData;

  const drawInteractionWidgets = () => {
    ctx.strokeStyle = "black";
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let p of points.slice(0, 3)) ctx.lineTo(...p);
    ctx.closePath();
    ctx.stroke();
    for (let [i, j] of [
      [0, 4],
      [1, 5],
      [2, 6]
    ]) {
      ctx.beginPath();
      ctx.lineTo(...points[i]);
      ctx.lineTo(...points[j]);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    if (snapping) {
      ctx.strokeStyle = "black";
      for (let p of snapPoints) {
        ctx.beginPath();
        ctx.arc(...p, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    for (let p of points.slice(0, 4)) {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(...p, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(...p, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const palette = [];
    for (let [x, y] of points) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
      const index = (Math.round(x) + Math.round(y) * width) * 4;
      let [r, g, b] = imgData.data.slice(index, index + 3);
      palette.push(`rgb(${r},${g},${b})`);
    }
    container.value = palette;
  };
  canvas.drawInteractionWidgets = drawInteractionWidgets;

  const change = (ctx, pts) => {
    points = pts;
    drawImageData();
    drawInteractionWidgets();
    container.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const interaction = triangleInteraction(ctx, vertices, change);
  const gradientChangeCallback = () => {
    setImgData();
    change(ctx, points);
  };
  colorForm.addEventListener("input", gradientChangeCallback);
  modeInput.addEventListener("input", gradientChangeCallback);
  gradientTypeInput.addEventListener("input", () => {
    if (gradientTypeInput.value == "3 colors") container.setSnapPoints (false);
    gradientChangeCallback ();
  });
  container.resetCentroid = () => {
    interaction.resetCentroid ();
  }
  container.setSnapPoints = (toggle) => {
    snapping = toggle;
    interaction.setSnapPoints(toggle ? snapPoints : [])
    drawImageData();
    drawInteractionWidgets();
  }
  container.rotatePoints = interaction.rotatePoints;
  return container;
}
```

```js
//
// Reactivity to control the width of the canvas input
//
const cardWidth = Mutable(500);
const setCardWidth = (w) => cardWidth.value = w;
```


```js
const paletteInput = canvasInterface({width:cardWidth-20});
const originalPalette = Generators.input(paletteInput);
const saveCanvas = htl.html`<button>save image`;
saveCanvas.onclick = () => {
  const link = document.createElement("a");
  link.download = "image.png";
  const canvas = paletteInput.children[0];
  canvas.drawImageData();
  link.href = canvas.toDataURL("image/png");
  canvas.drawInteractionWidgets();
  link.click();
};
const resetCentroidButton = html`<button>reset centroid`;
resetCentroidButton.onclick = paletteInput.resetCentroid;
const snapToggleCheckbox = html`<input id=snap type=checkbox>`;
const setSnapPoints = () => {
    paletteInput.setSnapPoints (snapToggleCheckbox.checked);
}
snapToggleCheckbox.onclick = setSnapPoints;
const snapToggle = html`<div>${snapToggleCheckbox}<label for=snap>Snap</label></div>`;
const rotateCounterButton = 
  html`<img width=30 src=${await FileAttachment("./data/rotateCounter.png").url()} />`;
rotateCounterButton.onclick = () => paletteInput.rotatePoints(false);
const rotateClockButton = 
  html`<img width=30 src=${await FileAttachment("./data/rotateClock.png").url()} />`;
rotateClockButton.onclick = () => paletteInput.rotatePoints(true);
```

```js
//
// Controls to shuffle the palette
//
const paletteOrder = Mutable(d3.range(7));
const shufflePaletteOrder = () => paletteOrder.value = d3.shuffle(paletteOrder.value);
const resetPaletteOrder = () => paletteOrder.value = d3.range(7);
const shufflePaletteOrderButton = html`<button>shuffle`;
shufflePaletteOrderButton.onclick = shufflePaletteOrder;
const resetPaletteOrderButton = html`<button>reset`;
resetPaletteOrderButton.onclick = resetPaletteOrder;
```

```js
//
// The ordered palette
//
const palette = paletteOrder.map(i=>originalPalette[i])
```

```js
//
// The sample svg url
//
const svgUrl = Mutable(await FileAttachment("./data/testimg.svg").url());
const setSvgUrl = (url => {svgUrl.value = url});
```

```js
//
// The sample svg object
//
const svgObject = html`<object id="testimg" data=${svgUrl} type="image/svg+xml">`;
```

```js
//
// Code to manipulate the path colors of an svg image
//
function getPathClasses (svgImage) {
  let classes = new Set([]);
  d3.select(svgImage)
    .selectAll("path")
    .each(function () {
      classes.add(d3.select(this).attr("class"));
    });
  return classes;
}
const imageClasses = Mutable(new Set());
const findSvgClasses = ()=>{
  const svgSel = d3.select(document.getElementById("testimg").contentDocument);
  const pathSel = svgSel.selectAll("path");
  imageClasses.value = getPathClasses(document.getElementById("testimg").contentDocument);
};
setTimeout(findSvgClasses, 10);
const setSvgColors = (testimg, palette) => {
  let color = {};
  let n = palette.length;
  let pal = [...palette];
  let i = 0;
  for (let c of imageClasses.value) {
    color[c] = pal [i]; //pal[color_order[i]];
    i = (i + 1) % n;
  }
  d3.select(testimg)
    .selectAll("path")
    .each(function () {
      let path = d3.select(this);
      path.style("fill", color[path.attr("class")]);
    });
}
setTimeout(() => setSvgColors (document.getElementById("testimg").contentDocument, palette), 10);
const saveSvg = () => {
    var link = document.createElement("a");
    link.download = "example.svg";

    const svg = document.getElementById("testimg").contentDocument;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const url =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    link.href = url;
    link.click();
  };

const saveSvgButton = html`<button>save svg`;
saveSvgButton.onclick = saveSvg;
const loadSvg = () => {
  const input = loadSvgInputElement;
  if (input.files.length == 0) {
    return;
  }
  for (const file of input.files) {
    setSvgUrl(URL.createObjectURL(file));
  }
}
const loadSvgInputElement = html`<input type=file id="getSvg" style="display:none" accept=".svg">`;
loadSvgInputElement.onchange = loadSvg;
const loadSvgButton = html`
<div><button onclick="document.getElementById('getSvg').click()">load svg</button>${loadSvgInputElement}
  </div>`;
```

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

<div class="grid grid-cols-2" >
  <div class="card inlineSons">${colorForm}${shuffleGradientColorsButton}</div>
  <div class="card">
  ${gradientTypeInput}
  ${modeInput}
  </div>
</div>

<div class="card inlineSons">
  ${paletteDisplay(palette)}${shufflePaletteOrderButton}${resetPaletteOrderButton}
</div>

<div  class="grid grid-cols-2" >
  <div class="card centeredSons">
    ${paletteInput}
    <div class="inlineSons">
    ${saveCanvas}
    ${resetCentroidButton}
    </div>
    <div class="inlineSons fourColorOnly"> 
      ${snapToggle}
      ${rotateCounterButton}
      ${rotateClockButton}
    </div>
  </div>
  <div id=sample class="card centeredSons">
    ${resize((width) => {setCardWidth(width); return svgObject})}
     <div class="inlineSons">
      ${saveSvgButton}
      ${loadSvgButton}
      </div>
  </div>
</div>

