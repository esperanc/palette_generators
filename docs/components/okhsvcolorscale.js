import * as d3 from "npm:d3"; // import everything as a namespace
import {okhsv_to_srgb} from "./colorconversion.js"
export {okhsvColorScale};
const okhsvColorScale = (s = 1, v = 1) => {
    return h => d3.rgb (...okhsv_to_srgb(h+29/360,s,v));
}