# Hue Contrast

The role of hue contrast in picking *Background*, *Dominant*, *Subordinate* and *Accent* colors in a palette.

```js
import {paletteDisplay} from "./components/palettedisplay.js";
```

```js
//
// The palette
//
const palette = Mutable(["black","black","black"]);
const setPalette = (colors) => {
    palette.value = colors.map(c=>c.formatHex());
}
const getPalette = () => palette.value;
```

```js
//
// The sample svg url
//
const defaultSvg = {
    2 : await FileAttachment("./data/Default2.svg").url(),
    2.5 : await FileAttachment("./data/Default2p5.svg").url(),
    3 :  await FileAttachment("./data/Default3.svg").url()
}
const svgUrl = Mutable(defaultSvg[2]);
const setSvgUrl = (url => {
    svgUrl.value = url;
});
```

```js
//
// The sample svg object
//
const svgObject = html`<object id="testimg" data=${svgUrl} type="image/svg+xml" style="width:100%;">`;
svgObject.onload = () => {
    setSvgColors (document.getElementById("testimg").contentDocument, getPalette());
}
```


```js
//
// The hue  wheel and interactions
//
const size = 600;
const radius = 250;
const innerRadius = radius*0.6;
const outerRadius = radius;
const main = d3.create("svg")
      .attr("viewBox", [-size/2, -size / 2, size, size])
    //   .attr("width", size)
    //   .attr("height", size);
const hueCircle = main.append("g").attr("class", "hueCircle");
const colors = [];
const primaries = ['red','green','blue'];
const gamma = 1.5;
const colorScale = (x => {
    const rgb = d3.color(`hsl(${x*360},100%,50%)`).rgb()
    for (let field of "rgb") {
        rgb[field] = 255*Math.pow(rgb[field] / 255, 1/gamma); 
    }
    return rgb
});
for (let i = 0; i < 360; i++) colors.push(colorScale (i/360));
const data = d3.range(360).map(d=>1); 
const pie = d3.pie(); 
const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
hueCircle.selectAll("path.huesegments")
    .data(pie(data))
    .join("path")
      .attr("d", arc)
      .attr("fill", (d,i)=>colors[i])
      .attr("stroke", (d,i)=>colors[i]);
let flipDominant = false;
let flipSubordinate = false;
const colorAngles = (baseAngle, ratio) => {
    return [0, 0.5, 
        flipSubordinate ? - 0.5 / ratio : 0.5 / ratio, 
        flipDominant ? -0.5 /ratio /ratio : 0.5 /ratio /ratio]
        .map(d => d+baseAngle)
}
const radians = (colorAngle) => (colorAngle-0.25)*Math.PI*2;
const middleRadius = (outerRadius + innerRadius) / 2;
const baseRadius = (outerRadius - innerRadius) / 2; 
const colorRadii = [baseRadius*0.6, baseRadius *0.15, baseRadius*0.3, baseRadius*0.45];
const colorCircleGroup = main.append("g").attr("class","colorCircles");

const colorCircles = colorCircleGroup.selectAll("g.colorCircle")
    .data(d3.range(4))
    .join("g")
        .attr("class", "colorCircle")
        .each(function (d,i) {
            const group = d3.select(this);
            group.append("circle")
                .attr("r",colorRadii[i])
                .attr("stroke-width", 3)
                .attr("stroke", "black")
                .attr("fill", "none");
            group.append("line")
                .attr("stroke-width", 1.5)
                .attr("stroke", "black")
                .attr("x1", 0)
                .attr("y1", 0)
        });

const updateCircles = (baseAngle,ratio) => {
    const angles = colorAngles (baseAngle,ratio);
    setPalette([angles[0], angles[3], angles[2], angles [1]].map(colorScale));
    colorCircles.each (function(d,i) {
        const group = d3.select(this);
        const ang = radians(angles[i])
        const [sin,cos] = [Math.sin(ang), Math.cos(ang)];
        group.select("circle")
            .attr("cx", middleRadius*cos)
            .attr("cy", middleRadius*sin);
        group.select("line")
            .attr("x2", (middleRadius-colorRadii[i])*cos)
            .attr("y2", (middleRadius-colorRadii[i])*sin)
    })
};

let baseAngle = 0.5;
let ratio = 2;
{
    let dragging = false;
    let mouse;
    main.on ("mousedown", (e) => {
        dragging = true;
        mouse = d3.pointer(e);
        main.style("cursor", "pointer")
    });
    main.on ("mousemove", (e) => {
        if (!dragging) return;
        const [x0,y0] = mouse;
        mouse = d3.pointer(e);
        const [x1,y1] = mouse;
        const angle0 = Math.atan2(y0,x0);
        const angle1 = Math.atan2(y1,x1);
        const dangle = angle1 - angle0;
        baseAngle = (baseAngle +dangle /  Math.PI / 2);
        updateCircles (baseAngle, ratio)
    })
    main.on ("mouseup", (e) => {
        dragging = false;
        main.style("cursor", "default")
    })
}

const flipAlongAxisButton = html`<button style="float:left">Flip all along axis`;
flipAlongAxisButton.onclick = () => {
    baseAngle = (baseAngle + 0.5) % 1;
    flipDominant = !flipDominant;
    flipSubordinate = !flipSubordinate;
    updateCircles(baseAngle, ratio);     
}
const flipAcrossAxisButton = html`<button style="float:left">Flip all across axis`;
flipAcrossAxisButton.onclick = () => {
    flipDominant = !flipDominant;
    flipSubordinate = !flipSubordinate;
    updateCircles(baseAngle, ratio);     
}
const flipDominantButton = html`<button style="float:right">Flip Dominant`;
flipDominantButton.onclick = () => {
    flipDominant = !flipDominant;
    updateCircles(baseAngle, ratio);     
}
const flipSubordinateButton = html`<button style="float:right">Flip Subordinate`;
flipSubordinateButton.onclick = () => {
    flipSubordinate = !flipSubordinate;
    updateCircles(baseAngle, ratio);     
}
const contrastRata = [2,2.5,3].map(d=>({label:`Common ratio of ${d}`, ratio:d}))
const contrastRatioInput = Inputs.select(
    contrastRata,
    {label:"Select contrast ratio", format:d=>d.label}
);
let usingDefaultSvg = true;
const setUsingDefaultSvg = (val) => { usingDefaultSvg = val;} ;
const loadDefaultSvg = () => setSvgUrl(defaultSvg[ratio]);
contrastRatioInput.addEventListener("input", () => {
    ratio = contrastRatioInput.value.ratio;
    if (usingDefaultSvg) loadDefaultSvg();
    updateCircles(baseAngle, ratio);  
})
updateCircles(baseAngle, ratio);
```

```js
//
// Code to manipulate the path colors of an svg image
//
const setSvgColors = (testimg, palette) => {
  let counter = 0;
  d3.select(testimg)
    .selectAll("path")
    .each(function () {
      let path = d3.select(this);
      path.style("fill", palette[counter]);
      counter = (counter+1) % palette.length;
    });
}
```

```js
//
// Load / save svg buttons
//
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
    setUsingDefaultSvg(false);
    setSvgUrl(URL.createObjectURL(file));
  }
}
const loadSvgInputElement = html`<input type=file id="getSvg" style="display:none" accept=".svg">`;
loadSvgInputElement.onchange = loadSvg;
const loadSvgButton = html`
<button onclick="document.getElementById('getSvg').click()">load custom svg</button>${loadSvgInputElement}`;

const loadDefaultSvgButton = html`<button>load default svg`;
loadDefaultSvgButton.onclick = () => {
    setUsingDefaultSvg(true);
    loadDefaultSvg();
}
```

```js
// 
// Update svg whenever palette changes
//
setTimeout(
    () => setSvgColors (document.getElementById("testimg").contentDocument, palette), 
    10
);
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

<div class="card inlineSons">
  ${paletteDisplay(palette)}
</div>

<div  class="grid grid-cols-2" >
  <div class="card centeredSons">
    ${main.node()}
    <div  class="inlineSons" >
        <div class="grid centeredSons">
        ${flipAlongAxisButton}
        ${flipAcrossAxisButton}
        </div>
        <div class="grid centeredSons">
        ${flipDominantButton}
        ${flipSubordinateButton}
        </div>
    </div>
    ${contrastRatioInput}
  </div>
  <div id=sample class="card centeredSons">
  ${svgObject}
  <div class="inlineSons">
      ${loadDefaultSvgButton}
      ${loadSvgButton}
      </div>
         ${saveSvgButton}

  </div>
</div>

