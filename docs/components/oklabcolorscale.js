import * as d3 from "npm:d3"; // import everything as a namespace
export {oklabColorScale};
const oklabColorScale = (L = 1, C = 1) => {
    return t =>
    oklab(L, C * Math.cos(2 * Math.PI * t), C * Math.sin(2 * Math.PI * t))
}

const oklab = (L, a, b) => {
    const l_ = 0.99999999845 * L + 0.39633779217 * a + 0.21580375806 * b;
    const m_ = 1.00000000888 * L - 0.10556134232 * a - 0.06385417477 * b;
    const s_ = 1.00000005467 * L - 0.08948418209 * a - 1.29148553786 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
  
    return d3.rgb(
      255 * gamma(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      255 * gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      255 * gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    );
  };

const gamma =  x => (x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x);