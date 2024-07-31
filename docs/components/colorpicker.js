import {html,svg} from "npm:htl";
export {cartesianRgb2normXy, polarRgb2normXy, colorPicker};

const clamp = x => Math.max(0,Math.min(1,x));

function cartesianRgb2normXy(rgb2color, colorComponents = [0, 1], ranges = [255, 255]) {
    if (colorComponents.length == 1) {
        const j = colorComponents[0];
        const ry = ranges[0];
        return (r,g,b) => {
            const color = rgb2color(r,g,b);
            const y = color[j]/ry;
            return [0.5, ry < 0 ? (y-ry) : y].map(clamp)
        }
    }
    else {
        const [i,j] = colorComponents;
        const [rx,ry] = ranges;
        return (r,g,b) => {
            const color = rgb2color(r,g,b);
            const x = color[i]/rx;
            const y = color[j]/ry;
            return [rx < 0 ? (x-rx) : x, ry < 0 ? (y-ry) : y].map(clamp)
        }
    }
}

function polarRgb2normXy(rgb2color, angleComponent = 0, radiusComponent = 1, ranges = [360, 100]) {
    return (r,g,b) => {
        const color = rgb2color(r,g,b);
        const angle = color[angleComponent]/ranges[0] * Math.PI * 2;
        const radius = Math.min(0.5,color[radiusComponent]/ranges[1] * 0.5);
        return [0.5 + radius*Math.cos(angle), 
                0.5 - radius*Math.sin(angle)]
    }
}

function colorPicker (imgData, rgb2normXy, callback = (normx,normy) => {}) {
    const width = imgData.width;
    const height = imgData.height;
    const canvas = html`<canvas width=${width} height=${height} >`;
    const ctx = canvas.getContext("2d");
    const margin = 10;
    Object.assign (canvas.style, {
        position: "absolute",
        left: margin+"px",
        top: margin+"px"
    });
    const container = html`<div>`;
    Object.assign(container.style, {
        position:"relative",
        width: width+margin*2+"px",
        height: height+margin*2+"px",
    })
    const cursorSvg = html`<svg width=${width+margin*2} height=${height+margin*2} 
    viewbox="${-margin} ${-margin} ${width+margin*2} ${height+margin*2}" style="z-index:1">`;
    Object.assign(cursorSvg.style, {
        position: "absolute",
        left: 0,
        top: 0
    })
    const cursor = svg`<circle cx=0 cy=0 r=5 fill=white stroke=black>`;
    cursorSvg.append(cursor);
    container.append (canvas,cursorSvg);
    let [r,g,b] = [127, 127, 127];
    let [x,y] = [width/2,height/2];
    const update = () => {
        ctx.clearRect(0,0,width,height);
        ctx.putImageData (imgData, 0, 0);
        cursor.setAttribute("cx", x);
        cursor.setAttribute("cy", y);
    };
    update();
    const setRgb = (r_in, g_in, b_in) => {
        [r,g,b] = [r_in, g_in, b_in];
        const [normx, normy] = rgb2normXy(r,g,b);
        [x,y] = [normx*width,normy*height]
        update()
    }
    const setImgData = (imgData_in) => {
        imgData = imgData_in;
        update ();
    }
    container.onmousedown = container.onmousemove = (e) => {
        if (e.buttons == 1) callback (clamp((e.offsetX-margin) / width), clamp((e.offsetY - margin) / height));
    }
    Object.assign (container, {setRgb, setImgData});
    return container;
}

