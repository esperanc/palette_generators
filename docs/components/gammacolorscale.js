import * as d3 from "npm:d3"; // import everything as a namespace
export {gammaColorScale};
const gammaColorScale = gamma => {
    return (x => {
        const rgb = d3.color(`hsl(${x*360},100%,50%)`).rgb()
        for (let field of "rgb") {
            rgb[field] = 255*Math.pow(rgb[field] / 255, 1/gamma); 
        }
        return rgb
    })
};