import * as d3 from "../../_npm/d3@7.9.0/_esm.js"; // import everything as a namespace
import {okhsv_to_srgb} from "./colorconversion.83ea89a4.js"
export {okhsvColorScale};
const okhsvColorScale = (s = 1, v = 1) => {
    return h => d3.rgb (...okhsv_to_srgb(h+29/360,s,v));
}