import {vec2} from "./vec2.js";
export {triangleInteraction};

// Area of triangle pqr
const triangleArea = (p, q, r) => {
  const [x1,y1] = p;
  const [x2,y2] = q;
  const [x3,y3] = r;
  return 0.5 * Math.abs(x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2));
}

// barycentric coordinates of point p defined on triangle a,b,c
const cartesianToBarycentric = (p, a, b, c) => {
    const A = triangleArea(a, b, c);
    return [
    triangleArea(b, c, p) / A,
    triangleArea(a, c, p) / A,
    triangleArea(a, b, p) / A
    ];
}

// cartesian coordinates of point with barycentric coordinates bary defined on triangle p,q,r
const barycentricToCartesian = (bary, p, q, r) => {
    const [a, b, c] = bary;
    const sum = 1;//a + b + c;
    const center = [0, 0];
    vec2.scaleAndAdd(center, center, p, a / sum);
    vec2.scaleAndAdd(center, center, q, b / sum);
    vec2.scaleAndAdd(center, center, r, c / sum);
    return center;
}

function triangleInteraction(ctx, vertices, change) {
    const canvas = ctx.canvas,
      width = canvas.width,
      height = canvas.height;
  
    let baryCoords, center, points, snapPoints = [];
    const resetCenter = () => {
      baryCoords = [1 / 3, 1 / 3, 1 / 3];
      center = barycentricToCartesian(baryCoords, ...vertices);
    } ;
    resetCenter();
    const snapVertices = () => {
      for (let i = 0; i < 3; i++) {
        let dmin = Infinity, snap = null;
        for (let p of snapPoints) {
          const d = vec2.dist(p, vertices[i]);
          if (d < dmin) {
            snap = p;
            dmin = d;
          }
        }
        if (snap) {
          vertices [i] = [...snap]
        }
      }
      center = barycentricToCartesian(baryCoords, ...vertices);
    }
    const rotateVertices = (clockwise = true) => {
      const angle = clockwise ? Math.PI/2 : -Math.PI/2;
      const middle = [width/2,height/2];
      for (let i = 0; i < 3; i++) {
        vec2.rotate (vertices[i],vertices[i],middle,angle);
        // vertices[i][0] = Math.max(0,Math.min(width,vertices[i][0]));
        // vertices[i][1] = Math.max(0,Math.min(height,vertices[i][1]));
      }
      vec2.rotate (center, center, middle, angle);
    };
    const callChange = () => {
      const edgePoints = [
        vec2.lineIntersection([], vertices[0], center, vertices[1], vertices[2]),
        vec2.lineIntersection([], vertices[1], center, vertices[2], vertices[0]),
        vec2.lineIntersection([], vertices[2], center, vertices[0], vertices[1])
      ];
      points = [...vertices, center, ...edgePoints];
      change(ctx, points);
    };
    callChange();
  
    let selected = -1;
    let mouse;
  
    // Disable context menu
    canvas.oncontextmenu = () => {
      return false;
    };
  
    //let originalBarycoords;

    canvas.onmousedown = function (event) {
      mouse = [event.offsetX, event.offsetY];
      selected = -1;
      let i = 0;
      //originalBarycoords = [...baryCoords];
      for (let p of [...vertices, center]) {
        if (vec2.dist(mouse, p) < 8) {
          selected = i;
          break;
        }
        i++;
      }
    };
    canvas.onmousemove = function (event) {
      if (selected < 0) return;
      let newMouse = [event.offsetX, event.offsetY];
      let v = vec2.sub([], newMouse, mouse);
      if (selected == 3) {
        vec2.add(center, center, v);
        baryCoords = cartesianToBarycentric(center, ...vertices);
      } else {
        vec2.add(vertices[selected], vertices[selected], v);
        center = barycentricToCartesian(baryCoords, ...vertices);
      }
      mouse = newMouse;
      callChange();
    };
    canvas.onmouseup = function (event) {
      if (snapPoints.length > 0) {
        snapVertices();
        callChange();
      }
      selected = -1;
    };
    // Return an object with a few utility functions
    return {
      resetCentroid : () => {
        resetCenter(); 
        callChange();
      },
      setSnapPoints : (sp) => {
        snapPoints = sp;
        snapVertices();
        callChange();
      },
      rotatePoints : (clockwise) => {
        rotateVertices(clockwise);
        callChange();
      }
    };
  }