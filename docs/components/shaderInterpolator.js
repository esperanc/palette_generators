import {require} from "npm:d3-require";
const createRegl = await require("regl@2.1.0/dist/regl.js");
import {html} from "npm:htl";
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
    canvas.gradient = (colors, lrgb = true) => {
      lrgb = +lrgb;
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
          lrgb
        });
      } else {
        grad4({
          colors,
          lrgb
        });
      }
      return canvas;
    };
    return canvas;
  }

  function gradient3(regl) {
    return regl({
      frag: `
        precision mediump float;
        uniform float lrgb;
        varying vec4 color;
        float fn (float c) {
          float tmp = abs(c);
            if (tmp > 0.0031308) {
                return 1.055 * pow(tmp, 1. / 2.4) - 0.055;
          }
            return c * 12.92;
        }
        void main () {
          gl_FragColor = (lrgb != 0.) ? vec4(fn(color.r),fn(color.g),fn(color.b),color.a) : color;
        }`,
      vert: `
        attribute vec2 index;
        uniform vec4 color1;
        uniform vec2 position1;
        uniform vec4 color2;
        uniform vec2 position2;
        uniform vec4 color3;
        uniform vec2 position3;
        varying vec4 color;
        void main () {
          if (index.x == 1.) {
            gl_Position = vec4(position1,0,1);
            color = color1;
          } else if (index.x == 2.) {
            gl_Position = vec4(position2,0,1);
            color = color2;        
          } else {
            gl_Position = vec4(position3,0,1);
            color = color3;   
          }
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
        lrgb: (_, props) => props.lrgb || 0.0
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
        precision mediump float;
        uniform vec4 color0;
        uniform vec4 color1;
        uniform vec4 color2;
        uniform vec4 color3;
        uniform vec2 iResolution;
        uniform float lrgb;
        float fn (float c) {
          float tmp = abs(c);
            if (tmp > 0.0031308) {
                return 1.055 * pow(tmp, 1. / 2.4) - 0.055;
          }
            return c * 12.92;
        }
        void main () {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          vec4 colorLeft = mix(color2,color0,uv.y);
          vec4 colorRight = mix(color3,color1,uv.y);
          vec4 color = mix(colorLeft,colorRight,uv.x);
          gl_FragColor = (lrgb != 0.) ? vec4(fn(color.r),fn(color.g),fn(color.b),color.a) : color;
        }`,
      vert: `
        attribute vec2 position;
        void main () {
          gl_Position = vec4(position, 1, 1.0);
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
        lrgb: (_, props) => props.lrgb || 0.0
      },
  
      // The depth buffer
      depth: {
        enable: false,
        mask: false
      },
      count: 6
    });
  }