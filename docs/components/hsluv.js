//Copyright (c) 2012-2021 Alexei Boronine
//Copyright (c) 2016 Florian Dormont
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE.

export {hsluv};

const hsluv = (function() {
    function f(a) {
        var c = [],
            b = Math.pow(a + 16, 3) / 1560896;
        b = b > g ? b : a / k;
        for (var d = 0; 3 > d;) 
        {
            var e = d++,
                h = l[e][0],
                w = l[e][1];
            e = l[e][2];
            for (var x = 0; 2 > x;) 
            {
                var y = x++,
                    z = (632260 * e - 126452 * w) * b + 126452 * y;
                c.push({
                    b: (284517 * h - 94839 * e) * b / z,
                    a: ((838422 * e + 769860 * w + 731718 * h) * a * b - 769860 * y * a) / z
                })
            }
        }
        return c
    }

    function m(a) {
        a = f(a);
        for (var c = Infinity, b = 0; b < a.length;) {
            var d = a[b];
            ++b;
            c = Math.min(c, Math.abs(d.a) / Math.sqrt(Math.pow(d.b, 2) + 1))
        }
        return c
    }

    function n(a, c) {
        c = c / 360 * Math.PI * 2;
        a = f(a);
        for (var b = Infinity, d = 0; d < a.length;) {
            var e = a[d];
            ++d;
            e = e.a / (Math.sin(c) - e.b * Math.cos(c));
            0 <= e && (b = Math.min(b, e))
        }
        return b
    }

    function p(a, c) {
        for (var b = 0, d = 0, e = a.length; d < e;) {
            var h = d++;
            b += a[h] * c[h]
        }
        return b
    }

    function q(a) {
        return .0031308 >= a ? 12.92 * a : 1.055 * Math.pow(a, .4166666666666667) - .055
    }

    function r(a) {
        return .04045 < a ? Math.pow((a + .055) / 1.055, 2.4) : a / 12.92
    }

    function t(a) {
        return [q(p(l[0], a)), q(p(l[1], a)), q(p(l[2], a))]
    }

    function u(a) {
        a = [r(a[0]), r(a[1]), r(a[2])];
        return [p(v[0], a), p(v[1], a), p(v[2], a)]
    }

    function A(a) {
        var c = a[0],
            b = a[1];
        a = c + 15 * b + 3 * a[2];
        0 != a ? (c = 4 * c / a, a = 9 * b / a) : a = c = NaN;
        b = b <= g ? b / B * k : 116 * Math.pow(b / B, .3333333333333333) - 16;
        return 0 == b ? [0, 0, 0] : [b, 13 * b * (c - C), 13 * b * (a - D)]
    }

    function E(a) {
        var c = a[0];
        if (0 == c) return [0, 0, 0];
        var b = a[1] / (13 * c) + C;
        a = a[2] / (13 * c) + D;
        c = 8 >= c ? B * c / k : B * Math.pow((c + 16) / 116, 3);
        b = 0 - 9 * c * b / ((b - 4) * a - b * a);
        return [b, c, (9 * c - 15 * a * c - a * b) / (3 * a)]
    }

    function F(a) {
        var c = a[0],
            b = a[1],
            d = a[2];
        a = Math.sqrt(b * b + d * d);
        1E-8 > a ? b = 0 : (b = 180 * Math.atan2(d, b) / Math.PI, 0 > b && (b = 360 + b));
        return [c, a, b]
    }

    function G(a) {
        var c = a[1],
            b = a[2] / 360 * 2 * Math.PI;
        return [a[0], Math.cos(b) * c, Math.sin(b) * c]
    }

    function H(a) {
        var c = a[0],
            b = a[1];
        a = a[2];
        if (99.9999999 < a) return [100, 0, c];
        if (1E-8 > a) return [0, 0, c];
        b = n(a, c) / 100 * b;
        return [a, b, c]
    }

    function I(a) {
        var c = a[0],
            b = a[1];
        a = a[2];
        if (99.9999999 < c) return [a, 0, 100];
        if (1E-8 > c) return [a, 0, 0];
        var d = n(c, a);
        return [a, b / d * 100, c]
    }

    function J(a) {
        var c = a[0],
            b = a[1];
        a = a[2];
        if (99.9999999 < a) return [100, 0, c];
        if (1E-8 > a) return [0, 0, c];
        b = m(a) / 100 * b;
        return [a, b, c]
    }

    function K(a) {
        var c = a[0],
            b = a[1];
        a = a[2];
        if (99.9999999 < c) return [a, 0, 100];
        if (1E-8 > c) return [a, 0, 0];
        var d = m(c);
        return [a, b / d * 100, c]
    }

    function L(a) {
        for (var c = "#", b = 0; 3 > b;) {
            var d = b++;
            d = Math.round(255 * a[d]);
            var e = d % 16;
            c += M.charAt((d - e) / 16 | 0) + M.charAt(e)
        }
        return c
    }

    function N(a) {
        a = a.toLowerCase();
        for (var c = [], b = 0; 3 > b;) {
            var d = b++;
            c.push((16 * M.indexOf(a.charAt(2 * d + 1)) + M.indexOf(a.charAt(2 * d + 2))) / 255)
        }
        return c
    }

    function O(a) {
        return t(E(G(a)))
    }

    function P(a) {
        return F(A(u(a)))
    }

    function Q(a) {
        return O(H(a))
    }

    function R(a) {
        return I(P(a))
    }

    function S(a) {
        return O(J(a))
    }

    function T(a) {
        return K(P(a))
    }
    var l = [
            [3.240969941904521, -1.537383177570093, -.498610760293],
            [-.96924363628087, 1.87596750150772, .041555057407175],
            [.055630079696993, -.20397695888897, 1.056971514242878]
        ],
        v = [
            [.41239079926595, .35758433938387, .18048078840183],
            [.21263900587151, .71516867876775, .072192315360733],
            [.019330818715591, .11919477979462, .95053215224966]
        ],
        B = 1,
        C = .19783000664283,
        D = .46831999493879,
        k = 903.2962962,
        g = .0088564516,
        M = "0123456789abcdef";
    return {
        hsluvToRgb: Q,
        rgbToHsluv: R,
        hpluvToRgb: S,
        rgbToHpluv: T,
        hsluvToHex: function(a) {
            return L(Q(a))
        },
        hexToHsluv: function(a) {
            return R(N(a))
        },
        hpluvToHex: function(a) {
            return L(S(a))
        },
        hexToHpluv: function(a) {
            return T(N(a))
        },
        lchToHpluv: K,
        hpluvToLch: J,
        lchToHsluv: I,
        hsluvToLch: H,
        lchToLuv: G,
        luvToLch: F,
        xyzToLuv: A,
        luvToXyz: E,
        xyzToRgb: t,
        rgbToXyz: u,
        lchToRgb: O,
        rgbToLch: P
    };
})();