import * as glmatrix from "../../_npm/gl-matrix@3.4.3/_esm.js";
export {vec2};

const vec2 = Object.assign({}, glmatrix.vec2);

  //
  // Orientation between 3 points
  //
  vec2.orient = function (a, b, c) {
    return Math.sign(
      glmatrix.mat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]])
    );
  };

  //
  // Returns true iff line segments a-b and c-d intersect.
  //
  vec2.segmentsIntersect = function (a, b, c, d) {
    return (
      vec2.orient(a, b, c) != vec2.orient(a, b, d) &&
      vec2.orient(c, d, a) != vec2.orient(c, d, b)
    );
  };

  //
  // Line intersection. Sets 'out' to
  // the intersection point between lines [x1,y1]-[x2,y2] and [x3,y3]-[x4,y4].
  //
  vec2.lineIntersection = function (
    out,
    [x1, y1],
    [x2, y2],
    [x3, y3],
    [x4, y4]
  ) {
    const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const a = x1 * y2 - y1 * x2,
      b = x3 * y4 - y3 * x4;

    out[0] = (a * (x3 - x4) - (x1 - x2) * b) / D;
    out[1] = (a * (y3 - y4) - (y1 - y2) * b) / D;
    return out;
  };

  //
  // Vector projection. Sets 'out' to the orthogonal projection of vector 'u' onto
  // vetor 'v'. In other words sets 'out' to a vector that has the same direction as 'v'
  // but length that is |u| cos (t), where t is the angle between u and v.
  //
  vec2.orthoProj = function (out, u, v) {
    const vnorm = vec2.normalize([], v);
    return vec2.scale([], vnorm, vec2.dot(vnorm, u));
  };

  //
  // Distance from point to line segment. Returns the distance between p and
  // line segment a-b.
  //
  vec2.distSegment = function (p, a, b) {
    const v = vec2.sub([], b, a);
    const u = vec2.sub([], p, a);
    const vlen = vec2.len(v);
    const vnorm = vec2.scale([], v, 1 / vlen);
    const projSize = vec2.dot(vnorm, u);
    if (projSize > vlen) return vec2.dist(p, b);
    if (projSize < 0) return vec2.dist(p, a);
    return vec2.len(vec2.sub([], p, vec2.lerp([], a, b, projSize / vlen)));
  };

