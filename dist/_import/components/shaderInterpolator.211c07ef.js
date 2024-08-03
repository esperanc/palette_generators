import {require} from "../../_npm/d3-require@1.3.0/_esm.js";
const createRegl = await require("regl@2.1.0/dist/regl.js");
import {html} from "../../_npm/htl@0.3.1/_esm.js";
export {gradientMaker};

function gradientMaker(options = {}) {
    const { width = 500, height = 500 } = options;
    const canvas = html`<canvas width=${width} height=${height} >`;
    const regl = createRegl({
      canvas: canvas,
      attributes: {preserveDrawingBuffer:true},
      extensions: ["webgl_draw_buffers", "oes_texture_float"]
    });
    const grad3 = gradient3(regl);
    const grad4 = gradient4(regl);
    canvas.getPixel = (x,y) => regl.read({x,y,width:1,height:1});
    canvas.gradient = (colors, mode = 'lrgb') => {
      const modeIndex = mode == "rgb" ? 0 : mode == "lrgb" ? 1 : 2;
      regl.clear({
        color: [0, 0, 0, 0],
        depth: 1
      });
      if (colors.length == 3) {
        grad3({
          positions: [
            [0, 1],
            [-1, -1],
            [1, -1]
          ],
          colors,
          modeIndex
        });
      } else {
        grad4({
          colors,
          modeIndex
        });
      }
      return canvas;
    };
    return canvas;
  }

  const conversionFuncs = `
    vec3 rgb2lrgb(vec3 x) {
      vec3 xlo = x / 12.92;
      vec3 xhi = pow((x + 0.055) / 1.055, vec3(2.4));
      return mix(xlo, xhi, step(0.04045, x));
    }
    vec3 lrgb2rgb(vec3 x) {
      vec3 xlo = 12.92 * x;
      vec3 xhi = 1.055 * pow(x, vec3(1.0 / 2.4)) - 0.055;
      return mix(xlo, xhi, step(vec3(0.0031308), x));
    }
    vec3 oklab2lrgb(vec3 oklab) {
      vec3 lms = oklab * mat3(1,  0.3963377774,  0.2158037573,
                              1, -0.1055613458, -0.0638541728,
                              1, -0.0894841775, -1.2914855480);
      lms *= lms * lms;
      return lms * mat3( 4.0767416621, -3.3077115913,  0.2309699292, 
                        -1.2684380046,  2.6097574011, -0.3413193965, 
                        -0.0041960863, -0.7034186147,  1.7076147010);
    }
    vec3 lrgb2oklab(vec3 lrgb) {
      vec3 lms = lrgb * mat3(0.4121656120, 0.5362752080, 0.0514575653,
                            0.2118591070, 0.6807189584, 0.1074065790,
                            0.0883097947, 0.2818474174, 0.6302613616);
      return pow(lms, vec3(1.0 / 3.0)) * mat3(0.2104542553,  0.7936177850, -0.0040720468,
                                              1.9779984951, -2.4285922050,  0.4505937099,
                                              0.0259040371,  0.7827717662, -0.8086757660);
    }
  `;


  function gradient3(regl) {
    return regl({
      frag: `
        precision highp float;
        uniform float modeIndex;
        varying vec3 color;
        ${conversionFuncs}
        void main () {
          gl_FragColor = vec4 ((modeIndex == 2.) ? lrgb2rgb(oklab2lrgb(color)) : 
                               (modeIndex == 1.) ? lrgb2rgb(color) : color, 1.);
        }`,
      vert: `
        precision highp float;
        attribute vec2 index;
        uniform vec4 color1;
        uniform vec2 position1;
        uniform vec4 color2;
        uniform vec2 position2;
        uniform vec4 color3;
        uniform vec2 position3;
        uniform float modeIndex;
        varying vec3 color;
        ${conversionFuncs}
        void main () {
          vec3 baseColor = vec3(0.);
          if (index.x == 1.) {
            gl_Position = vec4(position1,0,1);
            baseColor = color1.rgb;
          } else if (index.x == 2.) {
            gl_Position = vec4(position2,0,1);
            baseColor = color2.rgb;        
          } else {
            gl_Position = vec4(position3,0,1);
            baseColor = color3.rgb;   
          }
          color = (modeIndex == 2.) ? lrgb2oklab(rgb2lrgb(baseColor)) : 
                  (modeIndex == 1.) ? rgb2lrgb(baseColor) : baseColor;
        }`,
  
      // These are the vertex attributes that will be passed
      // on to the vertex shader
      attributes: {
        index: [
          [1, 0],
          [2, 0],
          [3, 0]
        ]
      },
  
      uniforms: {
        color1: (_, props) => props.colors[0],
        color2: (_, props) => props.colors[1],
        color3: (_, props) => props.colors[2],
        position1: (_, props) => props.positions[0],
        position2: (_, props) => props.positions[1],
        position3: (_, props) => props.positions[2],
        modeIndex: (_, props) => props.modeIndex || 0.0
      },
  
      // The depth buffer
      depth: {
        enable: false,
        mask: false
      },
      count: 3
    });
  }

  function gradient4(regl) {
    return regl({
      frag: `
      precision highp float;
      uniform vec4 color0;
      uniform vec4 color1;
      uniform vec4 color2;
      uniform vec4 color3;
      uniform vec2 iResolution;
      uniform float modeIndex;
      ${conversionFuncs}
      void main () {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        if (modeIndex == 1.) {
          vec3 colorLeft = mix(rgb2lrgb(color2.rgb),rgb2lrgb(color0.rgb),uv.y);
          vec3 colorRight = mix(rgb2lrgb(color3.rgb),rgb2lrgb(color1.rgb),uv.y);
          vec3 color = lrgb2rgb(mix(colorLeft,colorRight,uv.x));
          gl_FragColor = vec4(color,1.);
        } else if (modeIndex == 2.) {
          vec3 colorLeft = mix(lrgb2oklab(rgb2lrgb(color2.rgb)),lrgb2oklab(rgb2lrgb(color0.rgb)),uv.y);
          vec3 colorRight = mix(lrgb2oklab(rgb2lrgb(color3.rgb)),lrgb2oklab(rgb2lrgb(color1.rgb)),uv.y);
          vec3 color = lrgb2rgb(oklab2lrgb(mix(colorLeft,colorRight,uv.x)));
          gl_FragColor = vec4(color,1.);
        } else {
          vec4 colorLeft = mix(color2,color0,uv.y);
          vec4 colorRight = mix(color3,color1,uv.y);
          vec4 color = mix(colorLeft,colorRight,uv.x);
          gl_FragColor = color;
        }

      }`,
      vert: `
        attribute vec2 position;
        void main () {
          gl_Position = vec4(position, 0., 1.0);
        }`,
  
      // These are the vertex attributes that will be passed
      // on to the vertex shader
      attributes: {
        position: [
          [-1, -1],
          [1, -1],
          [1, 1],
          [1, 1],
          [-1, 1],
          [-1, -1]
        ]
      },
  
      uniforms: {
        iResolution: (_) => [_.viewportWidth, _.viewportHeight],
        color0: (_, props) => props.colors[0],
        color1: (_, props) => props.colors[1],
        color2: (_, props) => props.colors[2],
        color3: (_, props) => props.colors[3],
        modeIndex: (_, props) => props.modeIndex || 0.0
      },
  
      // The depth buffer
      depth: {
        enable: false,
        mask: false
      },
      count: 6
    });
  }