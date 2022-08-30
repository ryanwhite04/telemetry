class Port1 {
    constructor(device){
        this.device_ = device;
        this.interfaceNumber = 0;
        this.endpointIn = 0;
        this.endpointOut = 0;
    }
    disconnect() {
        return this.device_.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 34,
            'value': 0,
            'index': this.interfaceNumber
        }).then(()=>this.device_.close()
        );
    }
    send(message) {
        let data = new TextEncoder('utf-8').encode(message);
        console.log('sending', data, message, this.device_, this.endpointOut);
        return this.device_.transferOut(this.endpointOut, data);
    }
    connect() {
        let readLoop = ()=>{
            this.device_.transferIn(this.endpointIn, 64).then((result)=>{
                this.onReceive(result.data);
                readLoop();
            }, (error)=>{
                this.onReceiveError(error);
            });
        };
        return this.device_.open().then(()=>this.device_.configuration || this.device_.selectConfiguration(1)
        ).then(()=>{
            var interfaces = this.device_.configuration.interfaces;
            interfaces.forEach((element)=>{
                element.alternates.forEach((elementalt)=>{
                    if (elementalt.interfaceClass == 255) {
                        this.interfaceNumber = element.interfaceNumber;
                        elementalt.endpoints.forEach((ee)=>{
                            if (ee.direction == "out") this.endpointOut = ee.endpointNumber;
                            if (ee.direction == "in") this.endpointIn = ee.endpointNumber;
                        });
                    }
                });
            });
        }).then(()=>this.device_.claimInterface(this.interfaceNumber)
        ).then(()=>this.device_.selectAlternateInterface(this.interfaceNumber, 0)
        ).then(()=>this.device_.controlTransferOut({
                requestType: 'class',
                recipient: 'interface',
                request: 34,
                value: 1,
                index: this.interfaceNumber
            })
        ).then(readLoop);
    }
}
function t2(t, e, s) {
    if (t && t.length) {
        const [n, a] = e, o = Math.PI / 180 * s, r = Math.cos(o), h = Math.sin(o);
        t.forEach((t)=>{
            const [e, s] = t;
            t[0] = (e - n) * r - (s - a) * h + n, t[1] = (e - n) * h + (s - a) * r + a;
        });
    }
}
function e3(t) {
    const e = t[0], s = t[1];
    return Math.sqrt(Math.pow(e[0] - s[0], 2) + Math.pow(e[1] - s[1], 2));
}
function s2(e2, s) {
    const n = s.hachureAngle + 90;
    let a = s.hachureGap;
    a < 0 && (a = 4 * s.strokeWidth), a = Math.max(a, 0.1);
    const o = [
        0,
        0
    ];
    if (n) for (const s1 of e2)t2(s1, o, n);
    const r = function(t, e) {
        const s = [];
        for (const e1 of t){
            const t = [
                ...e1
            ];
            t[0].join(",") !== t[t.length - 1].join(",") && t.push([
                t[0][0],
                t[0][1]
            ]), t.length > 2 && s.push(t);
        }
        const n = [];
        e = Math.max(e, 0.1);
        const a = [];
        for (const t1 of s)for(let e4 = 0; e4 < t1.length - 1; e4++){
            const s = t1[e4], n = t1[e4 + 1];
            if (s[1] !== n[1]) {
                const t = Math.min(s[1], n[1]);
                a.push({
                    ymin: t,
                    ymax: Math.max(s[1], n[1]),
                    x: t === s[1] ? s[0] : n[0],
                    islope: (n[0] - s[0]) / (n[1] - s[1])
                });
            }
        }
        if (a.sort((t, e)=>t.ymin < e.ymin ? -1 : t.ymin > e.ymin ? 1 : t.x < e.x ? -1 : t.x > e.x ? 1 : t.ymax === e.ymax ? 0 : (t.ymax - e.ymax) / Math.abs(t.ymax - e.ymax)
        ), !a.length) return n;
        let o = [], r = a[0].ymin;
        for(; o.length || a.length;){
            if (a.length) {
                let t = -1;
                for(let e = 0; e < a.length && !(a[e].ymin > r); e++)t = e;
                a.splice(0, t + 1).forEach((t)=>{
                    o.push({
                        s: r,
                        edge: t
                    });
                });
            }
            if (o = o.filter((t)=>!(t.edge.ymax <= r)
            ), o.sort((t, e)=>t.edge.x === e.edge.x ? 0 : (t.edge.x - e.edge.x) / Math.abs(t.edge.x - e.edge.x)
            ), o.length > 1) for(let t = 0; t < o.length; t += 2){
                const e = t + 1;
                if (e >= o.length) break;
                const s = o[t].edge, a = o[e].edge;
                n.push([
                    [
                        Math.round(s.x),
                        r
                    ],
                    [
                        Math.round(a.x),
                        r
                    ]
                ]);
            }
            r += e, o.forEach((t)=>{
                t.edge.x = t.edge.x + e * t.edge.islope;
            });
        }
        return n;
    }(e2, a);
    if (n) {
        for (const s of e2)t2(s, o, -n);
        !function(e, s, n) {
            const a = [];
            e.forEach((t)=>a.push(...t)
            ), t2(a, s, n);
        }(r, o, -n);
    }
    return r;
}
class n2 {
    constructor(t){
        this.helper = t;
    }
    fillPolygons(t, e) {
        return this._fillPolygons(t, e);
    }
    _fillPolygons(t, e) {
        const n = s2(t, e);
        return {
            type: "fillSketch",
            ops: this.renderLines(n, e)
        };
    }
    renderLines(t, e) {
        const s = [];
        for (const n of t)s.push(...this.helper.doubleLineOps(n[0][0], n[0][1], n[1][0], n[1][1], e));
        return s;
    }
}
class a extends n2 {
    fillPolygons(t, n) {
        let a = n.hachureGap;
        a < 0 && (a = 4 * n.strokeWidth), a = Math.max(a, 0.1);
        const o = s2(t, Object.assign({
        }, n, {
            hachureGap: a
        })), r = Math.PI / 180 * n.hachureAngle, h = [], i = 0.5 * a * Math.cos(r), c = 0.5 * a * Math.sin(r);
        for (const [t1, s1] of o)e3([
            t1,
            s1
        ]) && h.push([
            [
                t1[0] - i,
                t1[1] + c
            ],
            [
                ...s1
            ]
        ], [
            [
                t1[0] + i,
                t1[1] - c
            ],
            [
                ...s1
            ]
        ]);
        return {
            type: "fillSketch",
            ops: this.renderLines(h, n)
        };
    }
}
class o extends n2 {
    fillPolygons(t, e) {
        const s = this._fillPolygons(t, e), n = Object.assign({
        }, e, {
            hachureAngle: e.hachureAngle + 90
        }), a = this._fillPolygons(t, n);
        return s.ops = s.ops.concat(a.ops), s;
    }
}
class r2 {
    constructor(t){
        this.helper = t;
    }
    fillPolygons(t, e) {
        const n = s2(t, e = Object.assign({
        }, e, {
            hachureAngle: 0
        }));
        return this.dotsOnLines(n, e);
    }
    dotsOnLines(t, s) {
        const n = [];
        let a = s.hachureGap;
        a < 0 && (a = 4 * s.strokeWidth), a = Math.max(a, 0.1);
        let o = s.fillWeight;
        o < 0 && (o = s.strokeWidth / 2);
        const r = a / 4;
        for (const h of t){
            const t = e3(h), i = t / a, c = Math.ceil(i) - 1, l = t - c * a, u = (h[0][0] + h[1][0]) / 2 - a / 4, p = Math.min(h[0][1], h[1][1]);
            for(let t1 = 0; t1 < c; t1++){
                const e = p + l + t1 * a, h = u - r + 2 * Math.random() * r, i = e - r + 2 * Math.random() * r, c = this.helper.ellipse(h, i, o, o, s);
                n.push(...c.ops);
            }
        }
        return {
            type: "fillSketch",
            ops: n
        };
    }
}
class h {
    constructor(t){
        this.helper = t;
    }
    fillPolygons(t, e) {
        const n = s2(t, e);
        return {
            type: "fillSketch",
            ops: this.dashedLine(n, e)
        };
    }
    dashedLine(t, s) {
        const n = s.dashOffset < 0 ? s.hachureGap < 0 ? 4 * s.strokeWidth : s.hachureGap : s.dashOffset, a = s.dashGap < 0 ? s.hachureGap < 0 ? 4 * s.strokeWidth : s.hachureGap : s.dashGap, o = [];
        return t.forEach((t)=>{
            const r = e3(t), h = Math.floor(r / (n + a)), i = (r + a - h * (n + a)) / 2;
            let c = t[0], l = t[1];
            c[0] > l[0] && (c = t[1], l = t[0]);
            const u = Math.atan((l[1] - c[1]) / (l[0] - c[0]));
            for(let t1 = 0; t1 < h; t1++){
                const e = t1 * (n + a), r = e + n, h = [
                    c[0] + e * Math.cos(u) + i * Math.cos(u),
                    c[1] + e * Math.sin(u) + i * Math.sin(u)
                ], l = [
                    c[0] + r * Math.cos(u) + i * Math.cos(u),
                    c[1] + r * Math.sin(u) + i * Math.sin(u)
                ];
                o.push(...this.helper.doubleLineOps(h[0], h[1], l[0], l[1], s));
            }
        }), o;
    }
}
class i2 {
    constructor(t){
        this.helper = t;
    }
    fillPolygons(t, e) {
        const n = e.hachureGap < 0 ? 4 * e.strokeWidth : e.hachureGap, a = e.zigzagOffset < 0 ? n : e.zigzagOffset, o = s2(t, e = Object.assign({
        }, e, {
            hachureGap: n + a
        }));
        return {
            type: "fillSketch",
            ops: this.zigzagLines(o, a, e)
        };
    }
    zigzagLines(t, s, n) {
        const a = [];
        return t.forEach((t)=>{
            const o = e3(t), r = Math.round(o / (2 * s));
            let h = t[0], i = t[1];
            h[0] > i[0] && (h = t[1], i = t[0]);
            const c = Math.atan((i[1] - h[1]) / (i[0] - h[0]));
            for(let t1 = 0; t1 < r; t1++){
                const e = 2 * t1 * s, o = 2 * (t1 + 1) * s, r = Math.sqrt(2 * Math.pow(s, 2)), i = [
                    h[0] + e * Math.cos(c),
                    h[1] + e * Math.sin(c)
                ], l = [
                    h[0] + o * Math.cos(c),
                    h[1] + o * Math.sin(c)
                ], u = [
                    i[0] + r * Math.cos(c + Math.PI / 4),
                    i[1] + r * Math.sin(c + Math.PI / 4)
                ];
                a.push(...this.helper.doubleLineOps(i[0], i[1], u[0], u[1], n), ...this.helper.doubleLineOps(u[0], u[1], l[0], l[1], n));
            }
        }), a;
    }
}
const c = {
};
class l {
    constructor(t){
        this.seed = t;
    }
    next() {
        return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
    }
}
const u = {
    A: 7,
    a: 7,
    C: 6,
    c: 6,
    H: 1,
    h: 1,
    L: 2,
    l: 2,
    M: 2,
    m: 2,
    Q: 4,
    q: 4,
    S: 4,
    s: 4,
    T: 2,
    t: 2,
    V: 1,
    v: 1,
    Z: 0,
    z: 0
};
function p(t, e) {
    return t.type === e;
}
function f(t) {
    const e = [], s = function(t) {
        const e = new Array();
        for(; "" !== t;)if (t.match(/^([ \t\r\n,]+)/)) t = t.substr(RegExp.$1.length);
        else if (t.match(/^([aAcChHlLmMqQsStTvVzZ])/)) e[e.length] = {
            type: 0,
            text: RegExp.$1
        }, t = t.substr(RegExp.$1.length);
        else {
            if (!t.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
            e[e.length] = {
                type: 1,
                text: `${parseFloat(RegExp.$1)}`
            }, t = t.substr(RegExp.$1.length);
        }
        return e[e.length] = {
            type: 2,
            text: ""
        }, e;
    }(t);
    let n = "BOD", a = 0, o = s[a];
    for(; !p(o, 2);){
        let r = 0;
        const h = [];
        if ("BOD" === n) {
            if ("M" !== o.text && "m" !== o.text) return f("M0,0" + t);
            a++, r = u[o.text], n = o.text;
        } else p(o, 1) ? r = u[n] : (a++, r = u[o.text], n = o.text);
        if (!(a + r < s.length)) throw new Error("Path data ended short");
        for(let t1 = a; t1 < a + r; t1++){
            const e = s[t1];
            if (!p(e, 1)) throw new Error("Param not a number: " + n + "," + e.text);
            h[h.length] = +e.text;
        }
        if ("number" != typeof u[n]) throw new Error("Bad segment: " + n);
        {
            const t = {
                key: n,
                data: h
            };
            e.push(t), a += r, o = s[a], "M" === n && (n = "L"), "m" === n && (n = "l");
        }
    }
    return e;
}
function d(t) {
    let e = 0, s = 0, n = 0, a = 0;
    const o = [];
    for (const { key: r , data: h  } of t)switch(r){
        case "M":
            o.push({
                key: "M",
                data: [
                    ...h
                ]
            }), [e, s] = h, [n, a] = h;
            break;
        case "m":
            e += h[0], s += h[1], o.push({
                key: "M",
                data: [
                    e,
                    s
                ]
            }), n = e, a = s;
            break;
        case "L":
            o.push({
                key: "L",
                data: [
                    ...h
                ]
            }), [e, s] = h;
            break;
        case "l":
            e += h[0], s += h[1], o.push({
                key: "L",
                data: [
                    e,
                    s
                ]
            });
            break;
        case "C":
            o.push({
                key: "C",
                data: [
                    ...h
                ]
            }), e = h[4], s = h[5];
            break;
        case "c":
            {
                const t = h.map((t, n)=>n % 2 ? t + s : t + e
                );
                o.push({
                    key: "C",
                    data: t
                }), e = t[4], s = t[5];
                break;
            }
        case "Q":
            o.push({
                key: "Q",
                data: [
                    ...h
                ]
            }), e = h[2], s = h[3];
            break;
        case "q":
            {
                const t = h.map((t, n)=>n % 2 ? t + s : t + e
                );
                o.push({
                    key: "Q",
                    data: t
                }), e = t[2], s = t[3];
                break;
            }
        case "A":
            o.push({
                key: "A",
                data: [
                    ...h
                ]
            }), e = h[5], s = h[6];
            break;
        case "a":
            e += h[5], s += h[6], o.push({
                key: "A",
                data: [
                    h[0],
                    h[1],
                    h[2],
                    h[3],
                    h[4],
                    e,
                    s
                ]
            });
            break;
        case "H":
            o.push({
                key: "H",
                data: [
                    ...h
                ]
            }), e = h[0];
            break;
        case "h":
            e += h[0], o.push({
                key: "H",
                data: [
                    e
                ]
            });
            break;
        case "V":
            o.push({
                key: "V",
                data: [
                    ...h
                ]
            }), s = h[0];
            break;
        case "v":
            s += h[0], o.push({
                key: "V",
                data: [
                    s
                ]
            });
            break;
        case "S":
            o.push({
                key: "S",
                data: [
                    ...h
                ]
            }), e = h[2], s = h[3];
            break;
        case "s":
            {
                const t = h.map((t, n)=>n % 2 ? t + s : t + e
                );
                o.push({
                    key: "S",
                    data: t
                }), e = t[2], s = t[3];
                break;
            }
        case "T":
            o.push({
                key: "T",
                data: [
                    ...h
                ]
            }), e = h[0], s = h[1];
            break;
        case "t":
            e += h[0], s += h[1], o.push({
                key: "T",
                data: [
                    e,
                    s
                ]
            });
            break;
        case "Z":
        case "z":
            o.push({
                key: "Z",
                data: []
            }), e = n, s = a;
    }
    return o;
}
function g(t) {
    const e = [];
    let s = "", n = 0, a = 0, o = 0, r = 0, h = 0, i = 0;
    for (const { key: c , data: l  } of t){
        switch(c){
            case "M":
                e.push({
                    key: "M",
                    data: [
                        ...l
                    ]
                }), [n, a] = l, [o, r] = l;
                break;
            case "C":
                e.push({
                    key: "C",
                    data: [
                        ...l
                    ]
                }), n = l[4], a = l[5], h = l[2], i = l[3];
                break;
            case "L":
                e.push({
                    key: "L",
                    data: [
                        ...l
                    ]
                }), [n, a] = l;
                break;
            case "H":
                n = l[0], e.push({
                    key: "L",
                    data: [
                        n,
                        a
                    ]
                });
                break;
            case "V":
                a = l[0], e.push({
                    key: "L",
                    data: [
                        n,
                        a
                    ]
                });
                break;
            case "S":
                {
                    let t = 0, o = 0;
                    "C" === s || "S" === s ? (t = n + (n - h), o = a + (a - i)) : (t = n, o = a), e.push({
                        key: "C",
                        data: [
                            t,
                            o,
                            ...l
                        ]
                    }), h = l[0], i = l[1], n = l[2], a = l[3];
                    break;
                }
            case "T":
                {
                    const [t, o] = l;
                    let r = 0, c = 0;
                    "Q" === s || "T" === s ? (r = n + (n - h), c = a + (a - i)) : (r = n, c = a);
                    const u = n + 2 * (r - n) / 3, p = a + 2 * (c - a) / 3, f = t + 2 * (r - t) / 3, d = o + 2 * (c - o) / 3;
                    e.push({
                        key: "C",
                        data: [
                            u,
                            p,
                            f,
                            d,
                            t,
                            o
                        ]
                    }), h = r, i = c, n = t, a = o;
                    break;
                }
            case "Q":
                {
                    const [t, s, o, r] = l, c = n + 2 * (t - n) / 3, u = a + 2 * (s - a) / 3, p = o + 2 * (t - o) / 3, f = r + 2 * (s - r) / 3;
                    e.push({
                        key: "C",
                        data: [
                            c,
                            u,
                            p,
                            f,
                            o,
                            r
                        ]
                    }), h = t, i = s, n = o, a = r;
                    break;
                }
            case "A":
                {
                    const t = Math.abs(l[0]), s = Math.abs(l[1]), o = l[2], r = l[3], h = l[4], i = l[5], c = l[6];
                    if (0 === t || 0 === s) e.push({
                        key: "C",
                        data: [
                            n,
                            a,
                            i,
                            c,
                            i,
                            c
                        ]
                    }), n = i, a = c;
                    else if (n !== i || a !== c) {
                        k(n, a, i, c, t, s, o, r, h).forEach(function(t) {
                            e.push({
                                key: "C",
                                data: t
                            });
                        }), n = i, a = c;
                    }
                    break;
                }
            case "Z":
                e.push({
                    key: "Z",
                    data: []
                }), n = o, a = r;
        }
        s = c;
    }
    return e;
}
function M(t, e, s) {
    return [
        t * Math.cos(s) - e * Math.sin(s),
        t * Math.sin(s) + e * Math.cos(s)
    ];
}
function k(t, e, s, n, a, o, r, h, i, c) {
    const l = (u = r, Math.PI * u / 180);
    var u;
    let p = [], f = 0, d = 0, g = 0, b = 0;
    if (c) [f, d, g, b] = c;
    else {
        [t, e] = M(t, e, -l), [s, n] = M(s, n, -l);
        const r = (t - s) / 2, c = (e - n) / 2;
        let u = r * r / (a * a) + c * c / (o * o);
        u > 1 && (u = Math.sqrt(u), a *= u, o *= u);
        const p = a * a, k = o * o, y = p * k - p * c * c - k * r * r, m = p * c * c + k * r * r, w = (h === i ? -1 : 1) * Math.sqrt(Math.abs(y / m));
        g = w * a * c / o + (t + s) / 2, b = w * -o * r / a + (e + n) / 2, f = Math.asin(parseFloat(((e - b) / o).toFixed(9))), d = Math.asin(parseFloat(((n - b) / o).toFixed(9))), t < g && (f = Math.PI - f), s < g && (d = Math.PI - d), f < 0 && (f = 2 * Math.PI + f), d < 0 && (d = 2 * Math.PI + d), i && f > d && (f -= 2 * Math.PI), !i && d > f && (d -= 2 * Math.PI);
    }
    let y = d - f;
    if (Math.abs(y) > 120 * Math.PI / 180) {
        const t = d, e = s, h = n;
        d = i && d > f ? f + 120 * Math.PI / 180 * 1 : f + 120 * Math.PI / 180 * -1, p = k(s = g + a * Math.cos(d), n = b + o * Math.sin(d), e, h, a, o, r, 0, i, [
            d,
            t,
            g,
            b
        ]);
    }
    y = d - f;
    const m = Math.cos(f), w = Math.sin(f), x = Math.cos(d), P = Math.sin(d), v = Math.tan(y / 4), O = 4 / 3 * a * v, S = 4 / 3 * o * v, L = [
        t,
        e
    ], T = [
        t + O * w,
        e - S * m
    ], D = [
        s + O * P,
        n - S * x
    ], A = [
        s,
        n
    ];
    if (T[0] = 2 * L[0] - T[0], T[1] = 2 * L[1] - T[1], c) return [
        T,
        D,
        A
    ].concat(p);
    {
        p = [
            T,
            D,
            A
        ].concat(p);
        const t = [];
        for(let e = 0; e < p.length; e += 3){
            const s = M(p[e][0], p[e][1], l), n = M(p[e + 1][0], p[e + 1][1], l), a = M(p[e + 2][0], p[e + 2][1], l);
            t.push([
                s[0],
                s[1],
                n[0],
                n[1],
                a[0],
                a[1]
            ]);
        }
        return t;
    }
}
const b = {
    randOffset: function(t, e) {
        return A(t, e);
    },
    randOffsetWithRange: function(t, e, s) {
        return D(t, e, s);
    },
    ellipse: function(t, e, s, n, a) {
        const o = P(s, n, a);
        return v(t, e, a, o).opset;
    },
    doubleLineOps: function(t, e, s, n, a) {
        return I(t, e, s, n, a, !0);
    }
};
function y(t, e, s, n, a) {
    return {
        type: "path",
        ops: I(t, e, s, n, a)
    };
}
function m(t, e, s) {
    const n = (t || []).length;
    if (n > 2) {
        const a = [];
        for(let e1 = 0; e1 < n - 1; e1++)a.push(...I(t[e1][0], t[e1][1], t[e1 + 1][0], t[e1 + 1][1], s));
        return e && a.push(...I(t[n - 1][0], t[n - 1][1], t[0][0], t[0][1], s)), {
            type: "path",
            ops: a
        };
    }
    return 2 === n ? y(t[0][0], t[0][1], t[1][0], t[1][1], s) : {
        type: "path",
        ops: []
    };
}
function w(t, e, s, n, a) {
    return (function(t, e) {
        return m(t, !0, e);
    })([
        [
            t,
            e
        ],
        [
            t + s,
            e
        ],
        [
            t + s,
            e + n
        ],
        [
            t,
            e + n
        ]
    ], a);
}
function x(t, e) {
    let s = _(t, 1 * (1 + 0.2 * e.roughness), e);
    if (!e.disableMultiStroke) {
        const n = _(t, 1.5 * (1 + 0.22 * e.roughness), function(t) {
            const e = Object.assign({
            }, t);
            e.randomizer = void 0, t.seed && (e.seed = t.seed + 1);
            return e;
        }(e));
        s = s.concat(n);
    }
    return {
        type: "path",
        ops: s
    };
}
function P(t, e, s) {
    const n = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t / 2, 2) + Math.pow(e / 2, 2)) / 2)), a = Math.max(s.curveStepCount, s.curveStepCount / Math.sqrt(200) * n), o = 2 * Math.PI / a;
    let r = Math.abs(t / 2), h = Math.abs(e / 2);
    const i = 1 - s.curveFitting;
    return r += A(r * i, s), h += A(h * i, s), {
        increment: o,
        rx: r,
        ry: h
    };
}
function v(t, e, s, n) {
    const [a, o] = z(n.increment, t, e, n.rx, n.ry, 1, n.increment * D(0.1, D(0.4, 1, s), s), s);
    let r = W(a, null, s);
    if (!s.disableMultiStroke && 0 !== s.roughness) {
        const [a] = z(n.increment, t, e, n.rx, n.ry, 1.5, 0, s), o = W(a, null, s);
        r = r.concat(o);
    }
    return {
        estimatedPoints: o,
        opset: {
            type: "path",
            ops: r
        }
    };
}
function O(t, e, s, n, a, o, r, h, i) {
    const c = t, l = e;
    let u = Math.abs(s / 2), p = Math.abs(n / 2);
    u += A(0.01 * u, i), p += A(0.01 * p, i);
    let f = a, d = o;
    for(; f < 0;)f += 2 * Math.PI, d += 2 * Math.PI;
    d - f > 2 * Math.PI && (f = 0, d = 2 * Math.PI);
    const g = 2 * Math.PI / i.curveStepCount, M = Math.min(g / 2, (d - f) / 2), k = E(M, c, l, u, p, f, d, 1, i);
    if (!i.disableMultiStroke) {
        const t = E(M, c, l, u, p, f, d, 1.5, i);
        k.push(...t);
    }
    return r && (h ? k.push(...I(c, l, c + u * Math.cos(f), l + p * Math.sin(f), i), ...I(c, l, c + u * Math.cos(d), l + p * Math.sin(d), i)) : k.push({
        op: "lineTo",
        data: [
            c,
            l
        ]
    }, {
        op: "lineTo",
        data: [
            c + u * Math.cos(f),
            l + p * Math.sin(f)
        ]
    })), {
        type: "path",
        ops: k
    };
}
function S(t, e) {
    const s = [];
    for (const n of t)if (n.length) {
        const t = e.maxRandomnessOffset || 0, a = n.length;
        if (a > 2) {
            s.push({
                op: "move",
                data: [
                    n[0][0] + A(t, e),
                    n[0][1] + A(t, e)
                ]
            });
            for(let o = 1; o < a; o++)s.push({
                op: "lineTo",
                data: [
                    n[o][0] + A(t, e),
                    n[o][1] + A(t, e)
                ]
            });
        }
    }
    return {
        type: "fillPath",
        ops: s
    };
}
function L(t, e) {
    return (function(t, e) {
        let s = t.fillStyle || "hachure";
        if (!c[s]) switch(s){
            case "zigzag":
                c[s] || (c[s] = new a(e));
                break;
            case "cross-hatch":
                c[s] || (c[s] = new o(e));
                break;
            case "dots":
                c[s] || (c[s] = new r2(e));
                break;
            case "dashed":
                c[s] || (c[s] = new h(e));
                break;
            case "zigzag-line":
                c[s] || (c[s] = new i2(e));
                break;
            case "hachure":
            default:
                s = "hachure", c[s] || (c[s] = new n2(e));
        }
        return c[s];
    })(e, b).fillPolygons(t, e);
}
function T(t) {
    return t.randomizer || (t.randomizer = new l(t.seed || 0)), t.randomizer.next();
}
function D(t, e, s, n = 1) {
    return s.roughness * n * (T(s) * (e - t) + t);
}
function A(t, e, s = 1) {
    return D(-t, t, e, s);
}
function I(t, e, s, n, a, o = !1) {
    const r = o ? a.disableMultiStrokeFill : a.disableMultiStroke, h = C(t, e, s, n, a, !0, !1);
    if (r) return h;
    const i = C(t, e, s, n, a, !0, !0);
    return h.concat(i);
}
function C(t, e, s, n, a, o, r) {
    const h = Math.pow(t - s, 2) + Math.pow(e - n, 2), i = Math.sqrt(h);
    let c = 1;
    c = i < 200 ? 1 : i > 500 ? 0.4 : -0.0016668 * i + 1.233334;
    let l = a.maxRandomnessOffset || 0;
    l * l * 100 > h && (l = i / 10);
    const u = l / 2, p = 0.2 + 0.2 * T(a);
    let f = a.bowing * a.maxRandomnessOffset * (n - e) / 200, d = a.bowing * a.maxRandomnessOffset * (t - s) / 200;
    f = A(f, a, c), d = A(d, a, c);
    const g = [], M = ()=>A(u, a, c)
    , k = ()=>A(l, a, c)
    , b = a.preserveVertices;
    return o && (r ? g.push({
        op: "move",
        data: [
            t + (b ? 0 : M()),
            e + (b ? 0 : M())
        ]
    }) : g.push({
        op: "move",
        data: [
            t + (b ? 0 : A(l, a, c)),
            e + (b ? 0 : A(l, a, c))
        ]
    })), r ? g.push({
        op: "bcurveTo",
        data: [
            f + t + (s - t) * p + M(),
            d + e + (n - e) * p + M(),
            f + t + 2 * (s - t) * p + M(),
            d + e + 2 * (n - e) * p + M(),
            s + (b ? 0 : M()),
            n + (b ? 0 : M())
        ]
    }) : g.push({
        op: "bcurveTo",
        data: [
            f + t + (s - t) * p + k(),
            d + e + (n - e) * p + k(),
            f + t + 2 * (s - t) * p + k(),
            d + e + 2 * (n - e) * p + k(),
            s + (b ? 0 : k()),
            n + (b ? 0 : k())
        ]
    }), g;
}
function _(t, e, s) {
    const n = [];
    n.push([
        t[0][0] + A(e, s),
        t[0][1] + A(e, s)
    ]), n.push([
        t[0][0] + A(e, s),
        t[0][1] + A(e, s)
    ]);
    for(let a = 1; a < t.length; a++)n.push([
        t[a][0] + A(e, s),
        t[a][1] + A(e, s)
    ]), a === t.length - 1 && n.push([
        t[a][0] + A(e, s),
        t[a][1] + A(e, s)
    ]);
    return W(n, null, s);
}
function W(t, e, s) {
    const n = t.length, a = [];
    if (n > 3) {
        const o = [], r = 1 - s.curveTightness;
        a.push({
            op: "move",
            data: [
                t[1][0],
                t[1][1]
            ]
        });
        for(let e1 = 1; e1 + 2 < n; e1++){
            const s = t[e1];
            o[0] = [
                s[0],
                s[1]
            ], o[1] = [
                s[0] + (r * t[e1 + 1][0] - r * t[e1 - 1][0]) / 6,
                s[1] + (r * t[e1 + 1][1] - r * t[e1 - 1][1]) / 6
            ], o[2] = [
                t[e1 + 1][0] + (r * t[e1][0] - r * t[e1 + 2][0]) / 6,
                t[e1 + 1][1] + (r * t[e1][1] - r * t[e1 + 2][1]) / 6
            ], o[3] = [
                t[e1 + 1][0],
                t[e1 + 1][1]
            ], a.push({
                op: "bcurveTo",
                data: [
                    o[1][0],
                    o[1][1],
                    o[2][0],
                    o[2][1],
                    o[3][0],
                    o[3][1]
                ]
            });
        }
        if (e && 2 === e.length) {
            const t = s.maxRandomnessOffset;
            a.push({
                op: "lineTo",
                data: [
                    e[0] + A(t, s),
                    e[1] + A(t, s)
                ]
            });
        }
    } else 3 === n ? (a.push({
        op: "move",
        data: [
            t[1][0],
            t[1][1]
        ]
    }), a.push({
        op: "bcurveTo",
        data: [
            t[1][0],
            t[1][1],
            t[2][0],
            t[2][1],
            t[2][0],
            t[2][1]
        ]
    })) : 2 === n && a.push(...I(t[0][0], t[0][1], t[1][0], t[1][1], s));
    return a;
}
function z(t, e, s, n, a, o, r, h) {
    const i = [], c = [], l = A(0.5, h) - Math.PI / 2, u = 0 === h.roughness;
    u || c.push([
        A(o, h) + e + 0.9 * n * Math.cos(l - t),
        A(o, h) + s + 0.9 * a * Math.sin(l - t)
    ]);
    const p = 2 * Math.PI + (u ? 0 : l - 0.01);
    for(let r1 = l; r1 < p; r1 += t){
        const t = [
            A(o, h) + e + n * Math.cos(r1),
            A(o, h) + s + a * Math.sin(r1)
        ];
        i.push(t), c.push(t);
    }
    return u || (c.push([
        A(o, h) + e + n * Math.cos(l + 2 * Math.PI + 0.5 * r),
        A(o, h) + s + a * Math.sin(l + 2 * Math.PI + 0.5 * r)
    ]), c.push([
        A(o, h) + e + 0.98 * n * Math.cos(l + r),
        A(o, h) + s + 0.98 * a * Math.sin(l + r)
    ]), c.push([
        A(o, h) + e + 0.9 * n * Math.cos(l + 0.5 * r),
        A(o, h) + s + 0.9 * a * Math.sin(l + 0.5 * r)
    ])), [
        c,
        i
    ];
}
function E(t, e, s, n, a, o, r, h, i) {
    const c = o + A(0.1, i), l = [];
    l.push([
        A(h, i) + e + 0.9 * n * Math.cos(c - t),
        A(h, i) + s + 0.9 * a * Math.sin(c - t)
    ]);
    for(let o1 = c; o1 <= r; o1 += t)l.push([
        A(h, i) + e + n * Math.cos(o1),
        A(h, i) + s + a * Math.sin(o1)
    ]);
    return l.push([
        e + n * Math.cos(r),
        s + a * Math.sin(r)
    ]), l.push([
        e + n * Math.cos(r),
        s + a * Math.sin(r)
    ]), W(l, null, i);
}
function $(t, e, s, n, a, o, r, h) {
    const i = [], c = [
        h.maxRandomnessOffset || 1,
        (h.maxRandomnessOffset || 1) + 0.3
    ];
    let l = [
        0,
        0
    ];
    const u = h.disableMultiStroke ? 1 : 2, p = h.preserveVertices;
    for(let f = 0; f < u; f++)0 === f ? i.push({
        op: "move",
        data: [
            r[0],
            r[1]
        ]
    }) : i.push({
        op: "move",
        data: [
            r[0] + (p ? 0 : A(c[0], h)),
            r[1] + (p ? 0 : A(c[0], h))
        ]
    }), l = p ? [
        a,
        o
    ] : [
        a + A(c[f], h),
        o + A(c[f], h)
    ], i.push({
        op: "bcurveTo",
        data: [
            t + A(c[f], h),
            e + A(c[f], h),
            s + A(c[f], h),
            n + A(c[f], h),
            l[0],
            l[1]
        ]
    });
    return i;
}
function G(t) {
    return [
        ...t
    ];
}
function R(t, e) {
    return Math.pow(t[0] - e[0], 2) + Math.pow(t[1] - e[1], 2);
}
function q(t, e, s) {
    const n = R(e, s);
    if (0 === n) return R(t, e);
    let a = ((t[0] - e[0]) * (s[0] - e[0]) + (t[1] - e[1]) * (s[1] - e[1])) / n;
    return a = Math.max(0, Math.min(1, a)), R(t, j(e, s, a));
}
function j(t, e, s) {
    return [
        t[0] + (e[0] - t[0]) * s,
        t[1] + (e[1] - t[1]) * s
    ];
}
function F(t, e, s, n) {
    const a = n || [];
    if ((function(t, e) {
        const s = t[e + 0], n = t[e + 1], a = t[e + 2], o = t[e + 3];
        let r = 3 * n[0] - 2 * s[0] - o[0];
        r *= r;
        let h = 3 * n[1] - 2 * s[1] - o[1];
        h *= h;
        let i = 3 * a[0] - 2 * o[0] - s[0];
        i *= i;
        let c = 3 * a[1] - 2 * o[1] - s[1];
        return c *= c, r < i && (r = i), h < c && (h = c), r + h;
    })(t, e) < s) {
        const s = t[e + 0];
        if (a.length) {
            (o = a[a.length - 1], r = s, Math.sqrt(R(o, r))) > 1 && a.push(s);
        } else a.push(s);
        a.push(t[e + 3]);
    } else {
        const n = 0.5, o = t[e + 0], r = t[e + 1], h = t[e + 2], i = t[e + 3], c = j(o, r, n), l = j(r, h, n), u = j(h, i, n), p = j(c, l, n), f = j(l, u, n), d = j(p, f, n);
        F([
            o,
            c,
            p,
            d
        ], 0, s, a), F([
            d,
            f,
            u,
            i
        ], 0, s, a);
    }
    var o, r;
    return a;
}
function V(t, e) {
    return Z(t, 0, t.length, e);
}
function Z(t, e, s, n, a) {
    const o = a || [], r = t[e], h = t[s - 1];
    let i = 0, c = 1;
    for(let n1 = e + 1; n1 < s - 1; ++n1){
        const e = q(t[n1], r, h);
        e > i && (i = e, c = n1);
    }
    return Math.sqrt(i) > n ? (Z(t, e, c + 1, n, o), Z(t, c, s, n, o)) : (o.length || o.push(r), o.push(h)), o;
}
function Q(t, e = 0.15, s) {
    const n = [], a = (t.length - 1) / 3;
    for(let s1 = 0; s1 < a; s1++){
        F(t, 3 * s1, e, n);
    }
    return s && s > 0 ? Z(n, 0, n.length, s) : n;
}
const H = "none";
class N {
    constructor(t){
        this.defaultOptions = {
            maxRandomnessOffset: 2,
            roughness: 1,
            bowing: 1,
            stroke: "#000",
            strokeWidth: 1,
            curveTightness: 0,
            curveFitting: 0.95,
            curveStepCount: 9,
            fillStyle: "hachure",
            fillWeight: -1,
            hachureAngle: -41,
            hachureGap: -1,
            dashOffset: -1,
            dashGap: -1,
            zigzagOffset: -1,
            seed: 0,
            disableMultiStroke: !1,
            disableMultiStrokeFill: !1,
            preserveVertices: !1
        }, this.config = t || {
        }, this.config.options && (this.defaultOptions = this._o(this.config.options));
    }
    static newSeed() {
        return Math.floor(Math.random() * 2 ** 31);
    }
    _o(t) {
        return t ? Object.assign({
        }, this.defaultOptions, t) : this.defaultOptions;
    }
    _d(t, e, s) {
        return {
            shape: t,
            sets: e || [],
            options: s || this.defaultOptions
        };
    }
    line(t, e, s, n, a) {
        const o = this._o(a);
        return this._d("line", [
            y(t, e, s, n, o)
        ], o);
    }
    rectangle(t, e, s, n, a) {
        const o = this._o(a), r = [], h = w(t, e, s, n, o);
        if (o.fill) {
            const a = [
                [
                    t,
                    e
                ],
                [
                    t + s,
                    e
                ],
                [
                    t + s,
                    e + n
                ],
                [
                    t,
                    e + n
                ]
            ];
            "solid" === o.fillStyle ? r.push(S([
                a
            ], o)) : r.push(L([
                a
            ], o));
        }
        return o.stroke !== H && r.push(h), this._d("rectangle", r, o);
    }
    ellipse(t, e, s, n, a) {
        const o = this._o(a), r = [], h = P(s, n, o), i = v(t, e, o, h);
        if (o.fill) if ("solid" === o.fillStyle) {
            const s = v(t, e, o, h).opset;
            s.type = "fillPath", r.push(s);
        } else r.push(L([
            i.estimatedPoints
        ], o));
        return o.stroke !== H && r.push(i.opset), this._d("ellipse", r, o);
    }
    circle(t, e, s, n) {
        const a = this.ellipse(t, e, s, s, n);
        return a.shape = "circle", a;
    }
    linearPath(t, e) {
        const s = this._o(e);
        return this._d("linearPath", [
            m(t, !1, s)
        ], s);
    }
    arc(t, e, s, n, a, o, r = !1, h) {
        const i = this._o(h), c = [], l = O(t, e, s, n, a, o, r, !0, i);
        if (r && i.fill) if ("solid" === i.fillStyle) {
            const r = Object.assign({
            }, i);
            r.disableMultiStroke = !0;
            const h = O(t, e, s, n, a, o, !0, !1, r);
            h.type = "fillPath", c.push(h);
        } else c.push(function(t, e, s, n, a, o, r) {
            const h = t, i = e;
            let c = Math.abs(s / 2), l = Math.abs(n / 2);
            c += A(0.01 * c, r), l += A(0.01 * l, r);
            let u = a, p = o;
            for(; u < 0;)u += 2 * Math.PI, p += 2 * Math.PI;
            p - u > 2 * Math.PI && (u = 0, p = 2 * Math.PI);
            const f = (p - u) / r.curveStepCount, d = [];
            for(let t1 = u; t1 <= p; t1 += f)d.push([
                h + c * Math.cos(t1),
                i + l * Math.sin(t1)
            ]);
            return d.push([
                h + c * Math.cos(p),
                i + l * Math.sin(p)
            ]), d.push([
                h,
                i
            ]), L([
                d
            ], r);
        }(t, e, s, n, a, o, i));
        return i.stroke !== H && c.push(l), this._d("arc", c, i);
    }
    curve(t, e) {
        const s = this._o(e), n = [], a = x(t, s);
        if (s.fill && s.fill !== H && t.length >= 3) {
            const e = Q(function(t, e = 0) {
                const s = t.length;
                if (s < 3) throw new Error("A curve must have at least three points.");
                const n = [];
                if (3 === s) n.push(G(t[0]), G(t[1]), G(t[2]), G(t[2]));
                else {
                    const s = [];
                    s.push(t[0], t[0]);
                    for(let e1 = 1; e1 < t.length; e1++)s.push(t[e1]), e1 === t.length - 1 && s.push(t[e1]);
                    const a = [], o = 1 - e;
                    n.push(G(s[0]));
                    for(let t1 = 1; t1 + 2 < s.length; t1++){
                        const e = s[t1];
                        a[0] = [
                            e[0],
                            e[1]
                        ], a[1] = [
                            e[0] + (o * s[t1 + 1][0] - o * s[t1 - 1][0]) / 6,
                            e[1] + (o * s[t1 + 1][1] - o * s[t1 - 1][1]) / 6
                        ], a[2] = [
                            s[t1 + 1][0] + (o * s[t1][0] - o * s[t1 + 2][0]) / 6,
                            s[t1 + 1][1] + (o * s[t1][1] - o * s[t1 + 2][1]) / 6
                        ], a[3] = [
                            s[t1 + 1][0],
                            s[t1 + 1][1]
                        ], n.push(a[1], a[2], a[3]);
                    }
                }
                return n;
            }(t), 10, (1 + s.roughness) / 2);
            "solid" === s.fillStyle ? n.push(S([
                e
            ], s)) : n.push(L([
                e
            ], s));
        }
        return s.stroke !== H && n.push(a), this._d("curve", n, s);
    }
    polygon(t, e) {
        const s = this._o(e), n = [], a = m(t, !0, s);
        return s.fill && ("solid" === s.fillStyle ? n.push(S([
            t
        ], s)) : n.push(L([
            t
        ], s))), s.stroke !== H && n.push(a), this._d("polygon", n, s);
    }
    path(t, e) {
        const s = this._o(e), n = [];
        if (!t) return this._d("path", n, s);
        t = (t || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
        const a = s.fill && "transparent" !== s.fill && s.fill !== H, o = s.stroke !== H, r = !!(s.simplification && s.simplification < 1), h = function(t, e, s) {
            const n = g(d(f(t))), a = [];
            let o = [], r = [
                0,
                0
            ], h = [];
            const i = ()=>{
                h.length >= 4 && o.push(...Q(h, e)), h = [];
            }, c = ()=>{
                i(), o.length && (a.push(o), o = []);
            };
            for (const { key: t1 , data: e1  } of n)switch(t1){
                case "M":
                    c(), r = [
                        e1[0],
                        e1[1]
                    ], o.push(r);
                    break;
                case "L":
                    i(), o.push([
                        e1[0],
                        e1[1]
                    ]);
                    break;
                case "C":
                    if (!h.length) {
                        const t = o.length ? o[o.length - 1] : r;
                        h.push([
                            t[0],
                            t[1]
                        ]);
                    }
                    h.push([
                        e1[0],
                        e1[1]
                    ]), h.push([
                        e1[2],
                        e1[3]
                    ]), h.push([
                        e1[4],
                        e1[5]
                    ]);
                    break;
                case "Z":
                    i(), o.push([
                        r[0],
                        r[1]
                    ]);
            }
            if (c(), !s) return a;
            const l = [];
            for (const t2 of a){
                const e = V(t2, s);
                e.length && l.push(e);
            }
            return l;
        }(t, 1, r ? 4 - 4 * s.simplification : (1 + s.roughness) / 2);
        return a && ("solid" === s.fillStyle ? n.push(S(h, s)) : n.push(L(h, s))), o && (r ? h.forEach((t)=>{
            n.push(m(t, !1, s));
        }) : n.push(function(t, e) {
            const s = g(d(f(t))), n = [];
            let a = [
                0,
                0
            ], o = [
                0,
                0
            ];
            for (const { key: t1 , data: r  } of s)switch(t1){
                case "M":
                    {
                        const t = 1 * (e.maxRandomnessOffset || 0), s = e.preserveVertices;
                        n.push({
                            op: "move",
                            data: r.map((n)=>n + (s ? 0 : A(t, e))
                            )
                        }), o = [
                            r[0],
                            r[1]
                        ], a = [
                            r[0],
                            r[1]
                        ];
                        break;
                    }
                case "L":
                    n.push(...I(o[0], o[1], r[0], r[1], e)), o = [
                        r[0],
                        r[1]
                    ];
                    break;
                case "C":
                    {
                        const [t, s, a, h, i, c] = r;
                        n.push(...$(t, s, a, h, i, c, o, e)), o = [
                            i,
                            c
                        ];
                        break;
                    }
                case "Z":
                    n.push(...I(o[0], o[1], a[0], a[1], e)), o = [
                        a[0],
                        a[1]
                    ];
            }
            return {
                type: "path",
                ops: n
            };
        }(t, s))), this._d("path", n, s);
    }
    opsToPath(t, e) {
        let s = "";
        for (const n of t.ops){
            const t = "number" == typeof e && e >= 0 ? n.data.map((t)=>+t.toFixed(e)
            ) : n.data;
            switch(n.op){
                case "move":
                    s += `M${t[0]} ${t[1]} `;
                    break;
                case "bcurveTo":
                    s += `C${t[0]} ${t[1]}, ${t[2]} ${t[3]}, ${t[4]} ${t[5]} `;
                    break;
                case "lineTo":
                    s += `L${t[0]} ${t[1]} `;
            }
        }
        return s.trim();
    }
    toPaths(t) {
        const e = t.sets || [], s = t.options || this.defaultOptions, n = [];
        for (const t1 of e){
            let e = null;
            switch(t1.type){
                case "path":
                    e = {
                        d: this.opsToPath(t1),
                        stroke: s.stroke,
                        strokeWidth: s.strokeWidth,
                        fill: H
                    };
                    break;
                case "fillPath":
                    e = {
                        d: this.opsToPath(t1),
                        stroke: H,
                        strokeWidth: 0,
                        fill: s.fill || H
                    };
                    break;
                case "fillSketch":
                    e = this.fillSketch(t1, s);
            }
            e && n.push(e);
        }
        return n;
    }
    fillSketch(t, e) {
        let s = e.fillWeight;
        return s < 0 && (s = e.strokeWidth / 2), {
            d: this.opsToPath(t),
            stroke: e.fill || H,
            strokeWidth: s,
            fill: H
        };
    }
}
class B {
    constructor(t, e){
        this.canvas = t, this.ctx = this.canvas.getContext("2d"), this.gen = new N(e);
    }
    draw(t) {
        const e = t.sets || [], s = t.options || this.getDefaultOptions(), n = this.ctx, a = t.options.fixedDecimalPlaceDigits;
        for (const o of e)switch(o.type){
            case "path":
                n.save(), n.strokeStyle = "none" === s.stroke ? "transparent" : s.stroke, n.lineWidth = s.strokeWidth, s.strokeLineDash && n.setLineDash(s.strokeLineDash), s.strokeLineDashOffset && (n.lineDashOffset = s.strokeLineDashOffset), this._drawToContext(n, o, a), n.restore();
                break;
            case "fillPath":
                {
                    n.save(), n.fillStyle = s.fill || "";
                    const e = "curve" === t.shape || "polygon" === t.shape || "path" === t.shape ? "evenodd" : "nonzero";
                    this._drawToContext(n, o, a, e), n.restore();
                    break;
                }
            case "fillSketch":
                this.fillSketch(n, o, s);
        }
    }
    fillSketch(t, e, s) {
        let n = s.fillWeight;
        n < 0 && (n = s.strokeWidth / 2), t.save(), s.fillLineDash && t.setLineDash(s.fillLineDash), s.fillLineDashOffset && (t.lineDashOffset = s.fillLineDashOffset), t.strokeStyle = s.fill || "", t.lineWidth = n, this._drawToContext(t, e, s.fixedDecimalPlaceDigits), t.restore();
    }
    _drawToContext(t, e, s, n = "nonzero") {
        t.beginPath();
        for (const n1 of e.ops){
            const e = "number" == typeof s && s >= 0 ? n1.data.map((t)=>+t.toFixed(s)
            ) : n1.data;
            switch(n1.op){
                case "move":
                    t.moveTo(e[0], e[1]);
                    break;
                case "bcurveTo":
                    t.bezierCurveTo(e[0], e[1], e[2], e[3], e[4], e[5]);
                    break;
                case "lineTo":
                    t.lineTo(e[0], e[1]);
            }
        }
        "fillPath" === e.type ? t.fill(n) : t.stroke();
    }
    get generator() {
        return this.gen;
    }
    getDefaultOptions() {
        return this.gen.defaultOptions;
    }
    line(t, e, s, n, a) {
        const o = this.gen.line(t, e, s, n, a);
        return this.draw(o), o;
    }
    rectangle(t, e, s, n, a) {
        const o = this.gen.rectangle(t, e, s, n, a);
        return this.draw(o), o;
    }
    ellipse(t, e, s, n, a) {
        const o = this.gen.ellipse(t, e, s, n, a);
        return this.draw(o), o;
    }
    circle(t, e, s, n) {
        const a = this.gen.circle(t, e, s, n);
        return this.draw(a), a;
    }
    linearPath(t, e) {
        const s = this.gen.linearPath(t, e);
        return this.draw(s), s;
    }
    polygon(t, e) {
        const s = this.gen.polygon(t, e);
        return this.draw(s), s;
    }
    arc(t, e, s, n, a, o, r = !1, h) {
        const i = this.gen.arc(t, e, s, n, a, o, r, h);
        return this.draw(i), i;
    }
    curve(t, e) {
        const s = this.gen.curve(t, e);
        return this.draw(s), s;
    }
    path(t, e) {
        const s = this.gen.path(t, e);
        return this.draw(s), s;
    }
}
const J = "http://www.w3.org/2000/svg";
class K {
    constructor(t, e){
        this.svg = t, this.gen = new N(e);
    }
    draw(t) {
        const e = t.sets || [], s = t.options || this.getDefaultOptions(), n = this.svg.ownerDocument || window.document, a = n.createElementNS(J, "g"), o = t.options.fixedDecimalPlaceDigits;
        for (const r of e){
            let e = null;
            switch(r.type){
                case "path":
                    e = n.createElementNS(J, "path"), e.setAttribute("d", this.opsToPath(r, o)), e.setAttribute("stroke", s.stroke), e.setAttribute("stroke-width", s.strokeWidth + ""), e.setAttribute("fill", "none"), s.strokeLineDash && e.setAttribute("stroke-dasharray", s.strokeLineDash.join(" ").trim()), s.strokeLineDashOffset && e.setAttribute("stroke-dashoffset", `${s.strokeLineDashOffset}`);
                    break;
                case "fillPath":
                    e = n.createElementNS(J, "path"), e.setAttribute("d", this.opsToPath(r, o)), e.setAttribute("stroke", "none"), e.setAttribute("stroke-width", "0"), e.setAttribute("fill", s.fill || ""), "curve" !== t.shape && "polygon" !== t.shape || e.setAttribute("fill-rule", "evenodd");
                    break;
                case "fillSketch":
                    e = this.fillSketch(n, r, s);
            }
            e && a.appendChild(e);
        }
        return a;
    }
    fillSketch(t, e, s) {
        let n = s.fillWeight;
        n < 0 && (n = s.strokeWidth / 2);
        const a = t.createElementNS(J, "path");
        return a.setAttribute("d", this.opsToPath(e, s.fixedDecimalPlaceDigits)), a.setAttribute("stroke", s.fill || ""), a.setAttribute("stroke-width", n + ""), a.setAttribute("fill", "none"), s.fillLineDash && a.setAttribute("stroke-dasharray", s.fillLineDash.join(" ").trim()), s.fillLineDashOffset && a.setAttribute("stroke-dashoffset", `${s.fillLineDashOffset}`), a;
    }
    get generator() {
        return this.gen;
    }
    getDefaultOptions() {
        return this.gen.defaultOptions;
    }
    opsToPath(t, e) {
        return this.gen.opsToPath(t, e);
    }
    line(t, e, s, n, a) {
        const o = this.gen.line(t, e, s, n, a);
        return this.draw(o);
    }
    rectangle(t, e, s, n, a) {
        const o = this.gen.rectangle(t, e, s, n, a);
        return this.draw(o);
    }
    ellipse(t, e, s, n, a) {
        const o = this.gen.ellipse(t, e, s, n, a);
        return this.draw(o);
    }
    circle(t, e, s, n) {
        const a = this.gen.circle(t, e, s, n);
        return this.draw(a);
    }
    linearPath(t, e) {
        const s = this.gen.linearPath(t, e);
        return this.draw(s);
    }
    polygon(t, e) {
        const s = this.gen.polygon(t, e);
        return this.draw(s);
    }
    arc(t, e, s, n, a, o, r = !1, h) {
        const i = this.gen.arc(t, e, s, n, a, o, r, h);
        return this.draw(i);
    }
    curve(t, e) {
        const s = this.gen.curve(t, e);
        return this.draw(s);
    }
    path(t, e) {
        const s = this.gen.path(t, e);
        return this.draw(s);
    }
}
var U = {
    canvas: (t, e)=>new B(t, e)
    ,
    svg: (t, e)=>new K(t, e)
    ,
    generator: (t)=>new N(t)
    ,
    newSeed: ()=>N.newSeed()
};
const t1 = window.ShadowRoot && (void 0 === window.ShadyCSS || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, e1 = Symbol(), n1 = new Map();
class s1 {
    constructor(t, n){
        if (this._$cssResult$ = !0, n !== e1) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t;
    }
    get styleSheet() {
        let e = n1.get(this.cssText);
        return t1 && void 0 === e && (n1.set(this.cssText, e = new CSSStyleSheet()), e.replaceSync(this.cssText)), e;
    }
    toString() {
        return this.cssText;
    }
}
const o1 = (t)=>new s1("string" == typeof t ? t : t + "", e1)
, r1 = (t, ...n)=>{
    const o = 1 === t.length ? t[0] : n.reduce((e, n, s)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(n) + t[s + 1]
    , t[0]);
    return new s1(o, e1);
}, i1 = (e, n)=>{
    t1 ? e.adoptedStyleSheets = n.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet
    ) : n.forEach((t)=>{
        const n = document.createElement("style"), s = window.litNonce;
        void 0 !== s && n.setAttribute("nonce", s), n.textContent = t.cssText, e.appendChild(n);
    });
}, S1 = t1 ? (t)=>t
 : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const n of t.cssRules)e += n.cssText;
        return o1(e);
    })(t) : t
;
var s3;
const e2 = window.trustedTypes, r3 = e2 ? e2.emptyScript : "", h1 = window.reactiveElementPolyfillSupport, o2 = {
    toAttribute (t, i) {
        switch(i){
            case Boolean:
                t = t ? r3 : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, i) {
        let s = t;
        switch(i){
            case Boolean:
                s = null !== t;
                break;
            case Number:
                s = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    s = JSON.parse(t);
                } catch (t3) {
                    s = null;
                }
        }
        return s;
    }
}, n3 = (t, i)=>i !== t && (i == i || t == t)
, l1 = {
    attribute: !0,
    type: String,
    converter: o2,
    reflect: !1,
    hasChanged: n3
};
class a1 extends HTMLElement {
    constructor(){
        super(), this._$Et = new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$Ei = null, this.o();
    }
    static addInitializer(t) {
        var i;
        null !== (i = this.l) && void 0 !== i || (this.l = []), this.l.push(t);
    }
    static get observedAttributes() {
        this.finalize();
        const t = [];
        return this.elementProperties.forEach((i, s)=>{
            const e = this._$Eh(s, i);
            void 0 !== e && (this._$Eu.set(e, s), t.push(e));
        }), t;
    }
    static createProperty(t, i = l1) {
        if (i.state && (i.attribute = !1), this.finalize(), this.elementProperties.set(t, i), !i.noAccessor && !this.prototype.hasOwnProperty(t)) {
            const s = "symbol" == typeof t ? Symbol() : "__" + t, e = this.getPropertyDescriptor(t, s, i);
            void 0 !== e && Object.defineProperty(this.prototype, t, e);
        }
    }
    static getPropertyDescriptor(t, i, s) {
        return {
            get () {
                return this[i];
            },
            set (e) {
                const r = this[t];
                this[i] = e, this.requestUpdate(t, r, s);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) || l1;
    }
    static finalize() {
        if (this.hasOwnProperty("finalized")) return !1;
        this.finalized = !0;
        const t = Object.getPrototypeOf(this);
        if (t.finalize(), this.elementProperties = new Map(t.elementProperties), this._$Eu = new Map(), this.hasOwnProperty("properties")) {
            const t = this.properties, i = [
                ...Object.getOwnPropertyNames(t),
                ...Object.getOwnPropertySymbols(t)
            ];
            for (const s of i)this.createProperty(s, t[s]);
        }
        return this.elementStyles = this.finalizeStyles(this.styles), !0;
    }
    static finalizeStyles(i) {
        const s = [];
        if (Array.isArray(i)) {
            const e = new Set(i.flat(1 / 0).reverse());
            for (const i3 of e)s.unshift(S1(i3));
        } else void 0 !== i && s.push(S1(i));
        return s;
    }
    static _$Eh(t, i) {
        const s = i.attribute;
        return !1 === s ? void 0 : "string" == typeof s ? s : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    o() {
        var t;
        this._$Ep = new Promise((t)=>this.enableUpdating = t
        ), this._$AL = new Map(), this._$Em(), this.requestUpdate(), null === (t = this.constructor.l) || void 0 === t || t.forEach((t)=>t(this)
        );
    }
    addController(t) {
        var i, s;
        (null !== (i = this._$Eg) && void 0 !== i ? i : this._$Eg = []).push(t), void 0 !== this.renderRoot && this.isConnected && (null === (s = t.hostConnected) || void 0 === s || s.call(t));
    }
    removeController(t) {
        var i;
        null === (i = this._$Eg) || void 0 === i || i.splice(this._$Eg.indexOf(t) >>> 0, 1);
    }
    _$Em() {
        this.constructor.elementProperties.forEach((t, i)=>{
            this.hasOwnProperty(i) && (this._$Et.set(i, this[i]), delete this[i]);
        });
    }
    createRenderRoot() {
        var t;
        const s = null !== (t = this.shadowRoot) && void 0 !== t ? t : this.attachShadow(this.constructor.shadowRootOptions);
        return i1(s, this.constructor.elementStyles), s;
    }
    connectedCallback() {
        var t;
        void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (t = this._$Eg) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostConnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    enableUpdating(t) {
    }
    disconnectedCallback() {
        var t;
        null === (t = this._$Eg) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostDisconnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    attributeChangedCallback(t, i, s) {
        this._$AK(t, s);
    }
    _$ES(t, i, s = l1) {
        var e, r;
        const h = this.constructor._$Eh(t, s);
        if (void 0 !== h && !0 === s.reflect) {
            const n = (null !== (r = null === (e = s.converter) || void 0 === e ? void 0 : e.toAttribute) && void 0 !== r ? r : o2.toAttribute)(i, s.type);
            this._$Ei = t, null == n ? this.removeAttribute(h) : this.setAttribute(h, n), this._$Ei = null;
        }
    }
    _$AK(t, i) {
        var s, e, r;
        const h = this.constructor, n = h._$Eu.get(t);
        if (void 0 !== n && this._$Ei !== n) {
            const t = h.getPropertyOptions(n), l = t.converter, a = null !== (r = null !== (e = null === (s = l) || void 0 === s ? void 0 : s.fromAttribute) && void 0 !== e ? e : "function" == typeof l ? l : null) && void 0 !== r ? r : o2.fromAttribute;
            this._$Ei = n, this[n] = a(i, t.type), this._$Ei = null;
        }
    }
    requestUpdate(t, i, s) {
        let e = !0;
        void 0 !== t && (((s = s || this.constructor.getPropertyOptions(t)).hasChanged || n3)(this[t], i) ? (this._$AL.has(t) || this._$AL.set(t, i), !0 === s.reflect && this._$Ei !== t && (void 0 === this._$E_ && (this._$E_ = new Map()), this._$E_.set(t, s))) : e = !1), !this.isUpdatePending && e && (this._$Ep = this._$EC());
    }
    async _$EC() {
        this.isUpdatePending = !0;
        try {
            await this._$Ep;
        } catch (t) {
            Promise.reject(t);
        }
        const t3 = this.scheduleUpdate();
        return null != t3 && await t3, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        var t;
        if (!this.isUpdatePending) return;
        this.hasUpdated, this._$Et && (this._$Et.forEach((t, i)=>this[i] = t
        ), this._$Et = void 0);
        let i = !1;
        const s = this._$AL;
        try {
            i = this.shouldUpdate(s), i ? (this.willUpdate(s), null === (t = this._$Eg) || void 0 === t || t.forEach((t)=>{
                var i;
                return null === (i = t.hostUpdate) || void 0 === i ? void 0 : i.call(t);
            }), this.update(s)) : this._$EU();
        } catch (t3) {
            throw i = !1, this._$EU(), t3;
        }
        i && this._$AE(s);
    }
    willUpdate(t) {
    }
    _$AE(t) {
        var i;
        null === (i = this._$Eg) || void 0 === i || i.forEach((t)=>{
            var i;
            return null === (i = t.hostUpdated) || void 0 === i ? void 0 : i.call(t);
        }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$EU() {
        this._$AL = new Map(), this.isUpdatePending = !1;
    }
    get updateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._$Ep;
    }
    shouldUpdate(t) {
        return !0;
    }
    update(t) {
        void 0 !== this._$E_ && (this._$E_.forEach((t, i)=>this._$ES(i, this[i], t)
        ), this._$E_ = void 0), this._$EU();
    }
    updated(t) {
    }
    firstUpdated(t) {
    }
}
a1.finalized = !0, a1.elementProperties = new Map(), a1.elementStyles = [], a1.shadowRootOptions = {
    mode: "open"
}, null == h1 || h1({
    ReactiveElement: a1
}), (null !== (s3 = globalThis.reactiveElementVersions) && void 0 !== s3 ? s3 : globalThis.reactiveElementVersions = []).push("1.0.2");
var t3;
const i3 = globalThis.trustedTypes, s4 = i3 ? i3.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, e4 = `lit$${(Math.random() + "").slice(9)}$`, o3 = "?" + e4, n4 = `<${o3}>`, l2 = document, h2 = (t = "")=>l2.createComment(t)
, r4 = (t)=>null === t || "object" != typeof t && "function" != typeof t
, d1 = Array.isArray, u1 = (t)=>{
    var i;
    return d1(t) || "function" == typeof (null === (i = t) || void 0 === i ? void 0 : i[Symbol.iterator]);
}, c1 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, v1 = /-->/g, a2 = />/g, f1 = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g, _1 = /'/g, m1 = /"/g, g1 = /^(?:script|style|textarea)$/i, $1 = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        })
, p1 = $1(1), y1 = $1(2), b1 = Symbol.for("lit-noChange"), T1 = Symbol.for("lit-nothing"), x1 = new WeakMap(), w1 = (t, i, s)=>{
    var e, o;
    const n = null !== (e = null == s ? void 0 : s.renderBefore) && void 0 !== e ? e : i;
    let l = n._$litPart$;
    if (void 0 === l) {
        const t = null !== (o = null == s ? void 0 : s.renderBefore) && void 0 !== o ? o : null;
        n._$litPart$ = l = new N1(i.insertBefore(h2(), t), t, void 0, null != s ? s : {
        });
    }
    return l._$AI(t), l;
}, A1 = l2.createTreeWalker(l2, 129, null, !1), C1 = (t, i)=>{
    const o = t.length - 1, l = [];
    let h, r = 2 === i ? "<svg>" : "", d = c1;
    for(let i4 = 0; i4 < o; i4++){
        const s = t[i4];
        let o, u, $ = -1, p = 0;
        for(; p < s.length && (d.lastIndex = p, u = d.exec(s), null !== u);)p = d.lastIndex, d === c1 ? "!--" === u[1] ? d = v1 : void 0 !== u[1] ? d = a2 : void 0 !== u[2] ? (g1.test(u[2]) && (h = RegExp("</" + u[2], "g")), d = f1) : void 0 !== u[3] && (d = f1) : d === f1 ? ">" === u[0] ? (d = null != h ? h : c1, $ = -1) : void 0 === u[1] ? $ = -2 : ($ = d.lastIndex - u[2].length, o = u[1], d = void 0 === u[3] ? f1 : '"' === u[3] ? m1 : _1) : d === m1 || d === _1 ? d = f1 : d === v1 || d === a2 ? d = c1 : (d = f1, h = void 0);
        const y = d === f1 && t[i4 + 1].startsWith("/>") ? " " : "";
        r += d === c1 ? s + n4 : $ >= 0 ? (l.push(o), s.slice(0, $) + "$lit$" + s.slice($) + e4 + y) : s + e4 + (-2 === $ ? (l.push(void 0), i4) : y);
    }
    const u = r + (t[o] || "<?>") + (2 === i ? "</svg>" : "");
    return [
        void 0 !== s4 ? s4.createHTML(u) : u,
        l
    ];
};
class P1 {
    constructor({ strings: t , _$litType$: s  }, n){
        let l;
        this.parts = [];
        let r = 0, d = 0;
        const u = t.length - 1, c = this.parts, [v, a] = C1(t, s);
        if (this.el = P1.createElement(v, n), A1.currentNode = this.el.content, 2 === s) {
            const t = this.el.content, i = t.firstChild;
            i.remove(), t.append(...i.childNodes);
        }
        for(; null !== (l = A1.nextNode()) && c.length < u;){
            if (1 === l.nodeType) {
                if (l.hasAttributes()) {
                    const t = [];
                    for (const i of l.getAttributeNames())if (i.endsWith("$lit$") || i.startsWith(e4)) {
                        const s = a[d++];
                        if (t.push(i), void 0 !== s) {
                            const t = l.getAttribute(s.toLowerCase() + "$lit$").split(e4), i = /([.?@])?(.*)/.exec(s);
                            c.push({
                                type: 1,
                                index: r,
                                name: i[2],
                                strings: t,
                                ctor: "." === i[1] ? M1 : "?" === i[1] ? H1 : "@" === i[1] ? I1 : S2
                            });
                        } else c.push({
                            type: 6,
                            index: r
                        });
                    }
                    for (const i1 of t)l.removeAttribute(i1);
                }
                if (g1.test(l.tagName)) {
                    const t = l.textContent.split(e4), s = t.length - 1;
                    if (s > 0) {
                        l.textContent = i3 ? i3.emptyScript : "";
                        for(let i1 = 0; i1 < s; i1++)l.append(t[i1], h2()), A1.nextNode(), c.push({
                            type: 2,
                            index: ++r
                        });
                        l.append(t[s], h2());
                    }
                }
            } else if (8 === l.nodeType) if (l.data === o3) c.push({
                type: 2,
                index: r
            });
            else {
                let t = -1;
                for(; -1 !== (t = l.data.indexOf(e4, t + 1));)c.push({
                    type: 7,
                    index: r
                }), t += e4.length - 1;
            }
            r++;
        }
    }
    static createElement(t, i) {
        const s = l2.createElement("template");
        return s.innerHTML = t, s;
    }
}
function V1(t, i, s = t, e) {
    var o, n, l, h;
    if (i === b1) return i;
    let d = void 0 !== e ? null === (o = s._$Cl) || void 0 === o ? void 0 : o[e] : s._$Cu;
    const u = r4(i) ? void 0 : i._$litDirective$;
    return (null == d ? void 0 : d.constructor) !== u && (null === (n = null == d ? void 0 : d._$AO) || void 0 === n || n.call(d, !1), void 0 === u ? d = void 0 : (d = new u(t), d._$AT(t, s, e)), void 0 !== e ? (null !== (l = (h = s)._$Cl) && void 0 !== l ? l : h._$Cl = [])[e] = d : s._$Cu = d), void 0 !== d && (i = V1(t, d._$AS(t, i.values), d, e)), i;
}
class E1 {
    constructor(t, i){
        this.v = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    p(t) {
        var i;
        const { el: { content: s  } , parts: e  } = this._$AD, o = (null !== (i = null == t ? void 0 : t.creationScope) && void 0 !== i ? i : l2).importNode(s, !0);
        A1.currentNode = o;
        let n = A1.nextNode(), h = 0, r = 0, d = e[0];
        for(; void 0 !== d;){
            if (h === d.index) {
                let i;
                2 === d.type ? i = new N1(n, n.nextSibling, this, t) : 1 === d.type ? i = new d.ctor(n, d.name, d.strings, this, t) : 6 === d.type && (i = new L1(n, this, t)), this.v.push(i), d = e[++r];
            }
            h !== (null == d ? void 0 : d.index) && (n = A1.nextNode(), h++);
        }
        return o;
    }
    m(t) {
        let i = 0;
        for (const s of this.v)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class N1 {
    constructor(t, i, s, e){
        var o;
        this.type = 2, this._$AH = T1, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cg = null === (o = null == e ? void 0 : e.isConnected) || void 0 === o || o;
    }
    get _$AU() {
        var t, i;
        return null !== (i = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) && void 0 !== i ? i : this._$Cg;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === t.nodeType && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = V1(this, t, i), r4(t) ? t === T1 || null == t || "" === t ? (this._$AH !== T1 && this._$AR(), this._$AH = T1) : t !== this._$AH && t !== b1 && this.$(t) : void 0 !== t._$litType$ ? this.T(t) : void 0 !== t.nodeType ? this.S(t) : u1(t) ? this.M(t) : this.$(t);
    }
    A(t, i = this._$AB) {
        return this._$AA.parentNode.insertBefore(t, i);
    }
    S(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.A(t));
    }
    $(t) {
        this._$AH !== T1 && r4(this._$AH) ? this._$AA.nextSibling.data = t : this.S(l2.createTextNode(t)), this._$AH = t;
    }
    T(t) {
        var i;
        const { values: s , _$litType$: e  } = t, o = "number" == typeof e ? this._$AC(t) : (void 0 === e.el && (e.el = P1.createElement(e.h, this.options)), e);
        if ((null === (i = this._$AH) || void 0 === i ? void 0 : i._$AD) === o) this._$AH.m(s);
        else {
            const t = new E1(o, this), i = t.p(this.options);
            t.m(s), this.S(i), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = x1.get(t.strings);
        return void 0 === i && x1.set(t.strings, i = new P1(t)), i;
    }
    M(t) {
        d1(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const o of t)e === i.length ? i.push(s = new N1(this.A(h2()), this.A(h2()), this, this.options)) : s = i[e], s._$AI(o), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        var s;
        for(null === (s = this._$AP) || void 0 === s || s.call(this, !1, !0, i); t && t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        var i;
        void 0 === this._$AM && (this._$Cg = t, null === (i = this._$AP) || void 0 === i || i.call(this, t));
    }
}
class S2 {
    constructor(t, i, s, e, o){
        this.type = 1, this._$AH = T1, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = o, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = T1;
    }
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t, i = this, s, e) {
        const o = this.strings;
        let n = !1;
        if (void 0 === o) t = V1(this, t, i, 0), n = !r4(t) || t !== this._$AH && t !== b1, n && (this._$AH = t);
        else {
            const e = t;
            let l, h;
            for(t = o[0], l = 0; l < o.length - 1; l++)h = V1(this, e[s + l], i, l), h === b1 && (h = this._$AH[l]), n || (n = !r4(h) || h !== this._$AH[l]), h === T1 ? t = T1 : t !== T1 && (t += (null != h ? h : "") + o[l + 1]), this._$AH[l] = h;
        }
        n && !e && this.k(t);
    }
    k(t) {
        t === T1 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t ? t : "");
    }
}
class M1 extends S2 {
    constructor(){
        super(...arguments), this.type = 3;
    }
    k(t) {
        this.element[this.name] = t === T1 ? void 0 : t;
    }
}
const k1 = i3 ? i3.emptyScript : "";
class H1 extends S2 {
    constructor(){
        super(...arguments), this.type = 4;
    }
    k(t) {
        t && t !== T1 ? this.element.setAttribute(this.name, k1) : this.element.removeAttribute(this.name);
    }
}
class I1 extends S2 {
    constructor(t, i, s, e, o){
        super(t, i, s, e, o), this.type = 5;
    }
    _$AI(t, i = this) {
        var s;
        if ((t = null !== (s = V1(this, t, i, 0)) && void 0 !== s ? s : T1) === b1) return;
        const e = this._$AH, o = t === T1 && e !== T1 || t.capture !== e.capture || t.once !== e.once || t.passive !== e.passive, n = t !== T1 && (e === T1 || o);
        o && this.element.removeEventListener(this.name, this, e), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        var i, s;
        "function" == typeof this._$AH ? this._$AH.call(null !== (s = null === (i = this.options) || void 0 === i ? void 0 : i.host) && void 0 !== s ? s : this.element, t) : this._$AH.handleEvent(t);
    }
}
class L1 {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        V1(this, t);
    }
}
const R1 = {
    P: "$lit$",
    V: e4,
    L: o3,
    I: 1,
    N: C1,
    R: E1,
    D: u1,
    j: V1,
    H: N1,
    O: S2,
    F: H1,
    B: I1,
    W: M1,
    Z: L1
}, z1 = window.litHtmlPolyfillSupport;
null == z1 || z1(P1, N1), (null !== (t3 = globalThis.litHtmlVersions) && void 0 !== t3 ? t3 : globalThis.litHtmlVersions = []).push("2.0.2");
var l3, o4;
class s5 extends a1 {
    constructor(){
        super(...arguments), this.renderOptions = {
            host: this
        }, this._$Dt = void 0;
    }
    createRenderRoot() {
        var t, e;
        const i = super.createRenderRoot();
        return null !== (t = (e = this.renderOptions).renderBefore) && void 0 !== t || (e.renderBefore = i.firstChild), i;
    }
    update(t) {
        const i = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Dt = w1(i, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
        var t;
        super.connectedCallback(), null === (t = this._$Dt) || void 0 === t || t.setConnected(!0);
    }
    disconnectedCallback() {
        var t;
        super.disconnectedCallback(), null === (t = this._$Dt) || void 0 === t || t.setConnected(!1);
    }
    render() {
        return b1;
    }
}
s5.finalized = !0, s5._$litElement$ = !0, null === (l3 = globalThis.litElementHydrateSupport) || void 0 === l3 || l3.call(globalThis, {
    LitElement: s5
});
const n5 = globalThis.litElementPolyfillSupport;
null == n5 || n5({
    LitElement: s5
});
(null !== (o4 = globalThis.litElementVersions) && void 0 !== o4 ? o4 : globalThis.litElementVersions = []).push("3.0.2");
const t4 = {
    ATTRIBUTE: 1,
    CHILD: 2,
    PROPERTY: 3,
    BOOLEAN_ATTRIBUTE: 4,
    EVENT: 5,
    ELEMENT: 6
}, e5 = (t)=>(...e)=>({
            _$litDirective$: t,
            values: e
        })
;
class i4 {
    constructor(t){
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AT(t, e, i) {
        this._$Ct = t, this._$AM = e, this._$Ci = i;
    }
    _$AS(t, e) {
        return this.update(t, e);
    }
    update(t, e) {
        return this.render(...e);
    }
}
const { H: i5  } = R1, r5 = (o)=>void 0 === o.strings
, f2 = {
}, s6 = (o, i = f2)=>o._$AH = i
;
const l4 = e5(class extends i4 {
    constructor(r1){
        if (super(r1), r1.type !== t4.PROPERTY && r1.type !== t4.ATTRIBUTE && r1.type !== t4.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
        if (!r5(r1)) throw Error("`live` bindings can only contain a single expression");
    }
    render(r) {
        return r;
    }
    update(i, [t]) {
        if (t === b1 || t === T1) return t;
        const o = i.element, l = i.name;
        if (i.type === t4.PROPERTY) {
            if (t === o[l]) return b1;
        } else if (i.type === t4.BOOLEAN_ATTRIBUTE) {
            if (!!t === o.hasAttribute(l)) return b1;
        } else if (i.type === t4.ATTRIBUTE && o.getAttribute(l) === t + "") return b1;
        return s6(i), t;
    }
});
const isCEPolyfill = typeof window !== 'undefined' && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== undefined;
const removeNodes = (container, start, end = null)=>{
    while(start !== end){
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
const boundAttributeSuffix = '$lit$';
class Template {
    constructor(result, element){
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        const walker = document.createTreeWalker(element.content, 133, null, false);
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings , values: { length  }  } = result;
        while(partIndex < length){
            const node = walker.nextNode();
            if (node === null) {
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length  } = attributes;
                    let count = 0;
                    for(let i = 0; i < length; i++){
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while(count-- > 0){
                        const stringForPart = strings[partIndex];
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({
                            type: 'attribute',
                            index,
                            name,
                            strings: statics
                        });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            } else if (node.nodeType === 3) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    for(let i = 0; i < lastIndex; i++){
                        let insert;
                        let s = strings[i];
                        if (s === '') {
                            insert = createMarker();
                        } else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({
                            type: 'node',
                            index: ++index
                        });
                    }
                    if (strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    } else {
                        node.data = strings[lastIndex];
                    }
                    partIndex += lastIndex;
                }
            } else if (node.nodeType === 8) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({
                        type: 'node',
                        index
                    });
                    if (node.nextSibling === null) {
                        node.data = '';
                    } else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                } else {
                    let i = -1;
                    while((i = node.data.indexOf(marker, i + 1)) !== -1){
                        this.parts.push({
                            type: 'node',
                            index: -1
                        });
                        partIndex++;
                    }
                }
            }
        }
        for (const n of nodesToRemove){
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix)=>{
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = (part)=>part.index !== -1
;
const createMarker = ()=>document.createComment('')
;
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content  } , parts  } = template;
    const walker = document.createTreeWalker(content, 133, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while(walker.nextNode()){
        nodeIndex++;
        const node = walker.currentNode;
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while(part !== undefined && part.index === nodeIndex){
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach((n)=>n.parentNode.removeChild(n)
    );
}
const countNodes = (node)=>{
    let count = node.nodeType === 11 ? 0 : 1;
    const walker = document.createTreeWalker(node, 133, null, false);
    while(walker.nextNode()){
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1)=>{
    for(let i = startIndex + 1; i < parts.length; i++){
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content  } , parts  } = template;
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, 133, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while(walker.nextNode()){
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while(partIndex !== -1 && parts[partIndex].index === walkerIndex){
            if (insertCount > 0) {
                while(partIndex !== -1){
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}
const directives = new WeakMap();
const isDirective = (o)=>{
    return typeof o === 'function' && directives.has(o);
};
const noChange = {
};
const nothing = {
};
class TemplateInstance {
    constructor(template, processor, options){
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts){
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part1 of this.__parts){
            if (part1 !== undefined) {
                part1.commit();
            }
        }
    }
    _clone() {
        const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        const walker = document.createTreeWalker(fragment, 133, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        while(partIndex < parts.length){
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            while(nodeIndex < part.index){
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            } else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}
const policy = window.trustedTypes && trustedTypes.createPolicy('lit-html', {
    createHTML: (s)=>s
});
const commentMarker = ` ${marker} `;
class TemplateResult {
    constructor(strings, values, type, processor){
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for(let i = 0; i < l; i++){
            const s = this.strings[i];
            const commentOpen = s.lastIndexOf('<!--');
            isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1;
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            } else {
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        let value = this.getHTML();
        if (policy !== undefined) {
            value = policy.createHTML(value);
        }
        template.innerHTML = value;
        return template;
    }
}
const isPrimitive = (value)=>{
    return value === null || !(typeof value === 'object' || typeof value === 'function');
};
const isIterable = (value)=>{
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};
class AttributeCommitter {
    constructor(element, name, strings){
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for(let i = 0; i < strings.length - 1; i++){
            this.parts[i] = this._createPart();
        }
    }
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        const parts = this.parts;
        if (l === 1 && strings[0] === '' && strings[1] === '') {
            const v = parts[0].value;
            if (typeof v === 'symbol') {
                return String(v);
            }
            if (typeof v === 'string' || !isIterable(v)) {
                return v;
            }
        }
        let text = '';
        for(let i = 0; i < l; i++){
            text += strings[i];
            const part = parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                } else {
                    for (const t of v){
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
class AttributePart {
    constructor(committer){
        this.value = undefined;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while(isDirective(this.value)){
            const directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
class NodePart {
    constructor(options){
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while(isDirective(this.__pendingValue)){
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        } else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        } else if (value instanceof Node) {
            this.__commitNode(value);
        } else if (isIterable(value)) {
            this.__commitIterable(value);
        } else if (value === nothing) {
            this.value = nothing;
            this.clear();
        } else {
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling && node.nodeType === 3) {
            node.data = valueAsString;
        } else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance && this.value.template === template) {
            this.value.update(value.values);
        } else {
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value){
            itemPart = itemParts[partIndex];
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                } else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
class BooleanAttributePart {
    constructor(element, name, strings){
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while(isDirective(this.__pendingValue)){
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            } else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    }
}
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings){
        super(element, name, strings);
        this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
let eventOptionsSupported = false;
(()=>{
    try {
        const options = {
            get capture () {
                eventOptionsSupported = true;
                return false;
            }
        };
        window.addEventListener('test', options, options);
        window.removeEventListener('test', options, options);
    } catch (_e) {
    }
})();
class EventPart {
    constructor(element, eventName, eventContext){
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e)=>this.handleEvent(e)
        ;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while(isDirective(this.__pendingValue)){
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        } else {
            this.value.handleEvent(event);
        }
    }
}
const getOptions = (o)=>o && (eventOptionsSupported ? {
        capture: o.capture,
        passive: o.passive,
        once: o.once
    } : o.capture)
;
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        template = new Template(result, result.getTemplateElement());
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();
const parts = new WeakMap();
const render = (result, container, options)=>{
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({
            templateFactory
        }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};
class DefaultTemplateProcessor {
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer = new PropertyCommitter(element, name.slice(1), strings);
            return committer.parts;
        }
        if (prefix === '@') {
            return [
                new EventPart(element, name.slice(1), options.eventContext)
            ];
        }
        if (prefix === '?') {
            return [
                new BooleanAttributePart(element, name.slice(1), strings)
            ];
        }
        const committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.4.1');
}
const html1 = (strings, ...values)=>new TemplateResult(strings, values, 'html', defaultTemplateProcessor)
;
const getTemplateCacheKey = (type, scopeName)=>`${type}--${scopeName}`
;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
} else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected. ` + `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` + `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
const shadyTemplateFactory = (scopeName)=>(result)=>{
        const cacheKey = getTemplateCacheKey(result.type, scopeName);
        let templateCache = templateCaches.get(cacheKey);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(cacheKey, templateCache);
        }
        let template = templateCache.stringsArray.get(result.strings);
        if (template !== undefined) {
            return template;
        }
        const key = result.strings.join(marker);
        template = templateCache.keyString.get(key);
        if (template === undefined) {
            const element = result.getTemplateElement();
            if (compatibleShadyCSSVersion) {
                window.ShadyCSS.prepareTemplateDom(element, scopeName);
            }
            template = new Template(result, element);
            templateCache.keyString.set(key, template);
        }
        templateCache.stringsArray.set(result.strings, template);
        return template;
    }
;
const TEMPLATE_TYPES = [
    'html',
    'svg'
];
const removeStylesFromLitTemplates = (scopeName)=>{
    TEMPLATE_TYPES.forEach((type)=>{
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach((template)=>{
                const { element: { content  }  } = template;
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s)=>{
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
const prepareTemplateStyles = (scopeName, renderedDOM, template)=>{
    shadyRenderSet.add(scopeName);
    const templateElement = !!template ? template.element : document.createElement('template');
    const styles = renderedDOM.querySelectorAll('style');
    const { length  } = styles;
    if (length === 0) {
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    for(let i = 0; i < length; i++){
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    removeStylesFromLitTemplates(scopeName);
    const content = templateElement.content;
    if (!!template) {
        insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
    } else {
        content.insertBefore(condensedStyle, content.firstChild);
    }
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    const style = content.querySelector('style');
    if (window.ShadyCSS.nativeShadow && style !== null) {
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    } else if (!!template) {
        content.insertBefore(condensedStyle, content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
const render1 = (result, container, options)=>{
    if (!options || typeof options !== 'object' || !options.scopeName) {
        throw new Error('The `scopeName` option is required.');
    }
    const scopeName = options.scopeName;
    const hasRendered = parts.has(container);
    const needsScoping = compatibleShadyCSSVersion && container.nodeType === 11 && !!container.host;
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    render(result, renderContainer, Object.assign({
        templateFactory: shadyTemplateFactory(scopeName)
    }, options));
    if (firstScopeRender) {
        const part = parts.get(renderContainer);
        parts.delete(renderContainer);
        const template = part.value instanceof TemplateInstance ? part.value.template : undefined;
        prepareTemplateStyles(scopeName, renderContainer, template);
        removeNodes(container, container.firstChild);
        container.appendChild(renderContainer);
        parts.set(container, part);
    }
    if (!hasRendered && needsScoping) {
        window.ShadyCSS.styleElement(container.host);
    }
};
var _a;
window.JSCompiler_renameProperty = (prop, _obj)=>prop
;
const defaultConverter = {
    toAttribute (value, type) {
        switch(type){
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute (value, type) {
        switch(type){
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                return JSON.parse(value);
        }
        return value;
    }
};
const notEqual = (value, old)=>{
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
const finalized = 'finalized';
class UpdatingElement extends HTMLElement {
    constructor(){
        super();
        this.initialize();
    }
    static get observedAttributes() {
        this.finalize();
        const attributes = [];
        this._classProperties.forEach((v, p)=>{
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    static _ensureClassProperties() {
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k)=>this._classProperties.set(k, v)
                );
            }
        }
    }
    static createProperty(name, options = defaultPropertyDeclaration) {
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        const descriptor = this.getPropertyDescriptor(name, key, options);
        if (descriptor !== undefined) {
            Object.defineProperty(this.prototype, name, descriptor);
        }
    }
    static getPropertyDescriptor(name, key, options) {
        return {
            get () {
                return this[key];
            },
            set (value) {
                const oldValue = this[name];
                this[key] = value;
                this.requestUpdateInternal(name, oldValue, options);
            },
            configurable: true,
            enumerable: true
        };
    }
    static getPropertyOptions(name) {
        return this._classProperties && this._classProperties.get(name) || defaultPropertyDeclaration;
    }
    static finalize() {
        const superCtor = Object.getPrototypeOf(this);
        if (!superCtor.hasOwnProperty(finalized)) {
            superCtor.finalize();
        }
        this[finalized] = true;
        this._ensureClassProperties();
        this._attributeToPropertyMap = new Map();
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertySymbols(props) : []
            ];
            for (const p of propKeys){
                this.createProperty(p, props[p]);
            }
        }
    }
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ? undefined : typeof attribute === 'string' ? attribute : typeof name === 'string' ? name.toLowerCase() : undefined;
    }
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = typeof converter === 'function' ? converter : converter.fromAttribute;
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute || defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    initialize() {
        this._updateState = 0;
        this._updatePromise = new Promise((res)=>this._enableUpdatingResolver = res
        );
        this._changedProperties = new Map();
        this._saveInstanceProperties();
        this.requestUpdateInternal();
    }
    _saveInstanceProperties() {
        this.constructor._classProperties.forEach((_v, p)=>{
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    _applyInstanceProperties() {
        this._instanceProperties.forEach((v, p)=>this[p] = v
        );
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        this.enableUpdating();
    }
    enableUpdating() {
        if (this._enableUpdatingResolver !== undefined) {
            this._enableUpdatingResolver();
            this._enableUpdatingResolver = undefined;
        }
    }
    disconnectedCallback() {
    }
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            if (attrValue === undefined) {
                return;
            }
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            } else {
                this.setAttribute(attr, attrValue);
            }
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor.getPropertyOptions(propName);
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] = ctor._propertyValueFromAttribute(value, options);
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    requestUpdateInternal(name, oldValue, options) {
        let shouldRequestUpdate = true;
        if (name !== undefined) {
            const ctor = this.constructor;
            options = options || ctor.getPropertyOptions(name);
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                if (options.reflect === true && !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            } else {
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._updatePromise = this._enqueueUpdate();
        }
    }
    requestUpdate(name, oldValue) {
        this.requestUpdateInternal(name, oldValue);
        return this.updateComplete;
    }
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        try {
            await this._updatePromise;
        } catch (e) {
        }
        const result = this.performUpdate();
        if (result != null) {
            await result;
        }
        return !this._hasRequestedUpdate;
    }
    get _hasRequestedUpdate() {
        return this._updateState & STATE_UPDATE_REQUESTED;
    }
    get hasUpdated() {
        return this._updateState & 1;
    }
    performUpdate() {
        if (!this._hasRequestedUpdate) {
            return;
        }
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            } else {
                this._markUpdated();
            }
        } catch (e) {
            shouldUpdate = false;
            this._markUpdated();
            throw e;
        }
        if (shouldUpdate) {
            if (!(this._updateState & 1)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    get updateComplete() {
        return this._getUpdateComplete();
    }
    _getUpdateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._updatePromise;
    }
    shouldUpdate(_changedProperties) {
        return true;
    }
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined && this._reflectingProperties.size > 0) {
            this._reflectingProperties.forEach((v, k)=>this._propertyToAttribute(k, this[k], v)
            );
            this._reflectingProperties = undefined;
        }
        this._markUpdated();
    }
    updated(_changedProperties) {
    }
    firstUpdated(_changedProperties) {
    }
}
_a = finalized;
UpdatingElement[_a] = true;
const supportsAdoptingStyleSheets = window.ShadowRoot && (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow) && 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken){
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    get styleSheet() {
        if (this._styleSheet === undefined) {
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            } else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
const unsafeCSS = (value)=>{
    return new CSSResult(String(value), constructionToken);
};
const textFromCSSResult = (value)=>{
    if (value instanceof CSSResult) {
        return value.cssText;
    } else if (typeof value === 'number') {
        return value;
    } else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
    }
};
const css1 = (strings, ...values)=>{
    const cssText = values.reduce((acc, v, idx)=>acc + textFromCSSResult(v) + strings[idx + 1]
    , strings[0]);
    return new CSSResult(cssText, constructionToken);
};
const legacyCustomElement = (tagName, clazz)=>{
    window.customElements.define(tagName, clazz);
    return clazz;
};
const standardCustomElement = (tagName, descriptor)=>{
    const { kind , elements  } = descriptor;
    return {
        kind,
        elements,
        finisher (clazz) {
            window.customElements.define(tagName, clazz);
        }
    };
};
const customElement = (tagName)=>(classOrDescriptor)=>typeof classOrDescriptor === 'function' ? legacyCustomElement(tagName, classOrDescriptor) : standardCustomElement(tagName, classOrDescriptor)
;
const standardProperty = (options, element)=>{
    if (element.kind === 'method' && element.descriptor && !('value' in element.descriptor)) {
        return Object.assign(Object.assign({
        }, element), {
            finisher (clazz) {
                clazz.createProperty(element.key, options);
            }
        });
    } else {
        return {
            kind: 'field',
            key: Symbol(),
            placement: 'own',
            descriptor: {
            },
            initializer () {
                if (typeof element.initializer === 'function') {
                    this[element.key] = element.initializer.call(this);
                }
            },
            finisher (clazz) {
                clazz.createProperty(element.key, options);
            }
        };
    }
};
const legacyProperty = (options, proto, name)=>{
    proto.constructor.createProperty(name, options);
};
function property(options) {
    return (protoOrDescriptor, name)=>name !== undefined ? legacyProperty(options, protoOrDescriptor, name) : standardProperty(options, protoOrDescriptor)
    ;
}
function query(selector, cache) {
    return (protoOrDescriptor, name)=>{
        const descriptor = {
            get () {
                return this.renderRoot.querySelector(selector);
            },
            enumerable: true,
            configurable: true
        };
        if (cache) {
            const prop = name !== undefined ? name : protoOrDescriptor.key;
            const key = typeof prop === 'symbol' ? Symbol() : `__${prop}`;
            descriptor.get = function() {
                if (this[key] === undefined) {
                    this[key] = this.renderRoot.querySelector(selector);
                }
                return this[key];
            };
        }
        return name !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name) : standardQuery(descriptor, protoOrDescriptor);
    };
}
const legacyQuery = (descriptor, proto, name)=>{
    Object.defineProperty(proto, name, descriptor);
};
const standardQuery = (descriptor, element)=>({
        kind: 'method',
        placement: 'prototype',
        key: element.key,
        descriptor
    })
;
const ElementProto = Element.prototype;
ElementProto.msMatchesSelector || ElementProto.webkitMatchesSelector;
(window['litElementVersions'] || (window['litElementVersions'] = [])).push('2.5.1');
const renderNotImplemented = {
};
class LitElement1 extends UpdatingElement {
    static getStyles() {
        return this.styles;
    }
    static _getUniqueStyles() {
        if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
            return;
        }
        const userStyles = this.getStyles();
        if (Array.isArray(userStyles)) {
            const addStyles = (styles, set)=>styles.reduceRight((set, s)=>Array.isArray(s) ? addStyles(s, set) : (set.add(s), set)
                , set)
            ;
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach((v)=>styles.unshift(v)
            );
            this._styles = styles;
        } else {
            this._styles = userStyles === undefined ? [] : [
                userStyles
            ];
        }
        this._styles = this._styles.map((s)=>{
            if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
                const cssText = Array.prototype.slice.call(s.cssRules).reduce((css, rule)=>css + rule.cssText
                , '');
                return unsafeCSS(cssText);
            }
            return s;
        });
    }
    initialize() {
        super.initialize();
        this.constructor._getUniqueStyles();
        this.renderRoot = this.createRenderRoot();
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    createRenderRoot() {
        return this.attachShadow(this.constructor.shadowRootOptions);
    }
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s)=>s.cssText
            ), this.localName);
        } else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets = styles.map((s)=>s instanceof CSSStyleSheet ? s : s.styleSheet
            );
        } else {
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    update(changedProperties) {
        const templateResult = this.render();
        super.update(changedProperties);
        if (templateResult !== renderNotImplemented) {
            this.constructor.render(templateResult, this.renderRoot, {
                scopeName: this.localName,
                eventContext: this
            });
        }
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach((s)=>{
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    render() {
        return renderNotImplemented;
    }
}
LitElement1['finalized'] = true;
LitElement1.render = render1;
LitElement1.shadowRootOptions = {
    mode: 'open'
};
var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = this && this.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const BaseCSS = css1`
:host {
  opacity: 0;
}
:host(.wired-rendered) {
  opacity: 1;
}
#overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
svg {
  display: block;
}
path {
  stroke: currentColor;
  stroke-width: 0.7;
  fill: transparent;
}
.hidden {
  display: none !important;
}
`;
class WiredBase extends LitElement1 {
    constructor(){
        super(...arguments);
        this.lastSize = [
            0,
            0
        ];
        this.seed = Math.floor(Math.random() * 2 ** 31);
    }
    updated(_changed) {
        this.wiredRender();
    }
    wiredRender(force = false) {
        if (this.svg) {
            const size = this.canvasSize();
            if (!force && size[0] === this.lastSize[0] && size[1] === this.lastSize[1]) {
                return;
            }
            while(this.svg.hasChildNodes()){
                this.svg.removeChild(this.svg.lastChild);
            }
            this.svg.setAttribute('width', `${size[0]}`);
            this.svg.setAttribute('height', `${size[1]}`);
            this.draw(this.svg, size);
            this.lastSize = size;
            this.classList.add('wired-rendered');
        }
    }
}
__decorate([
    query('svg'),
    __metadata("design:type", SVGSVGElement)
], WiredBase.prototype, "svg", void 0);
function fire(element, name, detail, bubbles = true, composed = true) {
    if (name) {
        const init = {
            bubbles: typeof bubbles === 'boolean' ? bubbles : true,
            composed: typeof composed === 'boolean' ? composed : true
        };
        if (detail) {
            init.detail = detail;
        }
        element.dispatchEvent(new CustomEvent(name, init));
    }
}
function t5(t, n, e) {
    if (t && t.length) {
        const [o, s] = n, r = Math.PI / 180 * e, i = Math.cos(r), a = Math.sin(r);
        t.forEach((t)=>{
            const [n, e] = t;
            t[0] = (n - o) * i - (e - s) * a + o, t[1] = (n - o) * a + (e - s) * i + s;
        });
    }
}
function n6(t) {
    const n = t[0], e = t[1];
    return Math.sqrt(Math.pow(n[0] - e[0], 2) + Math.pow(n[1] - e[1], 2));
}
function e6(t, n, e, o) {
    const s = n[1] - t[1], r = t[0] - n[0], i = s * t[0] + r * t[1], a = o[1] - e[1], c = e[0] - o[0], h = a * e[0] + c * e[1], u = s * c - a * r;
    return u ? [
        (c * i - r * h) / u,
        (s * h - a * i) / u
    ] : null;
}
function o5(t, n, e) {
    const o = t.length;
    if (o < 3) return !1;
    const a = [
        Number.MAX_SAFE_INTEGER,
        e
    ], c = [
        n,
        e
    ];
    let h = 0;
    for(let n7 = 0; n7 < o; n7++){
        const e = t[n7], u = t[(n7 + 1) % o];
        if (i6(e, u, c, a)) {
            if (0 === r6(e, c, u)) return s7(e, c, u);
            h++;
        }
    }
    return h % 2 == 1;
}
function s7(t, n, e) {
    return n[0] <= Math.max(t[0], e[0]) && n[0] >= Math.min(t[0], e[0]) && n[1] <= Math.max(t[1], e[1]) && n[1] >= Math.min(t[1], e[1]);
}
function r6(t, n, e) {
    const o = (n[1] - t[1]) * (e[0] - n[0]) - (n[0] - t[0]) * (e[1] - n[1]);
    return 0 === o ? 0 : o > 0 ? 1 : 2;
}
function i6(t, n, e, o) {
    const i = r6(t, n, e), a = r6(t, n, o), c = r6(e, o, t), h = r6(e, o, n);
    return i !== a && c !== h || !(0 !== i || !s7(t, e, n)) || !(0 !== a || !s7(t, o, n)) || !(0 !== c || !s7(e, t, o)) || !(0 !== h || !s7(e, n, o));
}
function a3(n, e) {
    const o = [
        0,
        0
    ], s = Math.round(e.hachureAngle + 90);
    s && t5(n, o, s);
    const r = function(t8, n) {
        const e = [
            ...t8
        ];
        e[0].join(",") !== e[e.length - 1].join(",") && e.push([
            e[0][0],
            e[0][1]
        ]);
        const o = [];
        if (e && e.length > 2) {
            let t = n.hachureGap;
            t < 0 && (t = 4 * n.strokeWidth), t = Math.max(t, 0.1);
            const s = [];
            for(let t6 = 0; t6 < e.length - 1; t6++){
                const n = e[t6], o = e[t6 + 1];
                if (n[1] !== o[1]) {
                    const t = Math.min(n[1], o[1]);
                    s.push({
                        ymin: t,
                        ymax: Math.max(n[1], o[1]),
                        x: t === n[1] ? n[0] : o[0],
                        islope: (o[0] - n[0]) / (o[1] - n[1])
                    });
                }
            }
            if (s.sort((t, n)=>t.ymin < n.ymin ? -1 : t.ymin > n.ymin ? 1 : t.x < n.x ? -1 : t.x > n.x ? 1 : t.ymax === n.ymax ? 0 : (t.ymax - n.ymax) / Math.abs(t.ymax - n.ymax)
            ), !s.length) return o;
            let r = [], i = s[0].ymin;
            for(; r.length || s.length;){
                if (s.length) {
                    let t = -1;
                    for(let n = 0; n < s.length && !(s[n].ymin > i); n++)t = n;
                    s.splice(0, t + 1).forEach((t)=>{
                        r.push({
                            s: i,
                            edge: t
                        });
                    });
                }
                if (r = r.filter((t)=>!(t.edge.ymax <= i)
                ), r.sort((t, n)=>t.edge.x === n.edge.x ? 0 : (t.edge.x - n.edge.x) / Math.abs(t.edge.x - n.edge.x)
                ), r.length > 1) for(let t7 = 0; t7 < r.length; t7 += 2){
                    const n = t7 + 1;
                    if (n >= r.length) break;
                    const e = r[t7].edge, s = r[n].edge;
                    o.push([
                        [
                            Math.round(e.x),
                            i
                        ],
                        [
                            Math.round(s.x),
                            i
                        ]
                    ]);
                }
                i += t, r.forEach((n)=>{
                    n.edge.x = n.edge.x + t * n.edge.islope;
                });
            }
        }
        return o;
    }(n, e);
    return s && (t5(n, o, -s), (function(n, e, o) {
        const s = [];
        n.forEach((t)=>s.push(...t)
        ), t5(s, e, o);
    })(r, o, -s)), r;
}
class c2 extends class {
    constructor(t){
        this.helper = t;
    }
    fillPolygon(t, n) {
        return this._fillPolygon(t, n);
    }
    _fillPolygon(t, n, e = !1) {
        let o = a3(t, n);
        if (e) {
            const n = this.connectingLines(t, o);
            o = o.concat(n);
        }
        return {
            type: "fillSketch",
            ops: this.renderLines(o, n)
        };
    }
    renderLines(t, n) {
        const e = [];
        for (const o of t)e.push(...this.helper.doubleLineOps(o[0][0], o[0][1], o[1][0], o[1][1], n));
        return e;
    }
    connectingLines(t, e) {
        const o = [];
        if (e.length > 1) for(let s = 1; s < e.length; s++){
            const r = e[s - 1];
            if (n6(r) < 3) continue;
            const i = [
                e[s][0],
                r[1]
            ];
            if (n6(i) > 3) {
                const n = this.splitOnIntersections(t, i);
                o.push(...n);
            }
        }
        return o;
    }
    midPointInPolygon(t, n) {
        return o5(t, (n[0][0] + n[1][0]) / 2, (n[0][1] + n[1][1]) / 2);
    }
    splitOnIntersections(t, s) {
        const r = Math.max(5, 0.1 * n6(s)), a = [];
        for(let o = 0; o < t.length; o++){
            const c = t[o], h = t[(o + 1) % t.length];
            if (i6(c, h, ...s)) {
                const t = e6(c, h, s[0], s[1]);
                if (t) {
                    const e = n6([
                        t,
                        s[0]
                    ]), o = n6([
                        t,
                        s[1]
                    ]);
                    e > r && o > r && a.push({
                        point: t,
                        distance: e
                    });
                }
            }
        }
        if (a.length > 1) {
            const n = a.sort((t, n)=>t.distance - n.distance
            ).map((t)=>t.point
            );
            if (o5(t, ...s[0]) || n.shift(), o5(t, ...s[1]) || n.pop(), n.length <= 1) return this.midPointInPolygon(t, s) ? [
                s
            ] : [];
            const e = [
                s[0],
                ...n,
                s[1]
            ], r = [];
            for(let n7 = 0; n7 < e.length - 1; n7 += 2){
                const o = [
                    e[n7],
                    e[n7 + 1]
                ];
                this.midPointInPolygon(t, o) && r.push(o);
            }
            return r;
        }
        return this.midPointInPolygon(t, s) ? [
            s
        ] : [];
    }
} {
    fillPolygon(t, n) {
        return this._fillPolygon(t, n, !0);
    }
}
class h3 {
    constructor(t){
        this.seed = t;
    }
    next() {
        return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
    }
}
function u2(t, n, e, o, s) {
    return {
        type: "path",
        ops: M2(t, n, e, o, s)
    };
}
function l5(t, n8) {
    return (function(t, n, e) {
        const o = (t || []).length;
        if (o > 2) {
            const s = [];
            for(let n7 = 0; n7 < o - 1; n7++)s.push(...M2(t[n7][0], t[n7][1], t[n7 + 1][0], t[n7 + 1][1], e));
            return n && s.push(...M2(t[o - 1][0], t[o - 1][1], t[0][0], t[0][1], e)), {
                type: "path",
                ops: s
            };
        }
        return 2 === o ? u2(t[0][0], t[0][1], t[1][0], t[1][1], e) : {
            type: "path",
            ops: []
        };
    })(t, !0, n8);
}
function f3(t, n, e, o, s) {
    return (function(t, n, e, o) {
        const [s, r] = b2(o.increment, t, n, o.rx, o.ry, 1, o.increment * g2(0.1, g2(0.4, 1, e), e), e);
        let i = y2(s, null, e);
        if (!e.disableMultiStroke) {
            const [s] = b2(o.increment, t, n, o.rx, o.ry, 1.5, 0, e), r = y2(s, null, e);
            i = i.concat(r);
        }
        return {
            estimatedPoints: r,
            opset: {
                type: "path",
                ops: i
            }
        };
    })(t, n, s, p2(e, o, s)).opset;
}
function p2(t, n, e) {
    const o = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t / 2, 2) + Math.pow(n / 2, 2)) / 2)), s = Math.max(e.curveStepCount, e.curveStepCount / Math.sqrt(200) * o), r = 2 * Math.PI / s;
    let i = Math.abs(t / 2), a = Math.abs(n / 2);
    const c = 1 - e.curveFitting;
    return i += m2(i * c, e), a += m2(a * c, e), {
        increment: r,
        rx: i,
        ry: a
    };
}
function d2(t) {
    return t.randomizer || (t.randomizer = new h3(t.seed || 0)), t.randomizer.next();
}
function g2(t, n, e, o = 1) {
    return e.roughness * o * (d2(e) * (n - t) + t);
}
function m2(t, n, e = 1) {
    return g2(-t, t, n, e);
}
function M2(t, n, e, o, s, r = !1) {
    const i = r ? s.disableMultiStrokeFill : s.disableMultiStroke, a = x2(t, n, e, o, s, !0, !1);
    if (i) return a;
    const c = x2(t, n, e, o, s, !0, !0);
    return a.concat(c);
}
function x2(t, n, e, o, s, r, i) {
    const a = Math.pow(t - e, 2) + Math.pow(n - o, 2), c = Math.sqrt(a);
    let h = 1;
    h = c < 200 ? 1 : c > 500 ? 0.4 : -0.0016668 * c + 1.233334;
    let u = s.maxRandomnessOffset || 0;
    u * u * 100 > a && (u = c / 10);
    const l = u / 2, f = 0.2 + 0.2 * d2(s);
    let p = s.bowing * s.maxRandomnessOffset * (o - n) / 200, g = s.bowing * s.maxRandomnessOffset * (t - e) / 200;
    p = m2(p, s, h), g = m2(g, s, h);
    const M = [], x = ()=>m2(l, s, h)
    , y = ()=>m2(u, s, h)
    ;
    return r && (i ? M.push({
        op: "move",
        data: [
            t + x(),
            n + x()
        ]
    }) : M.push({
        op: "move",
        data: [
            t + m2(u, s, h),
            n + m2(u, s, h)
        ]
    })), i ? M.push({
        op: "bcurveTo",
        data: [
            p + t + (e - t) * f + x(),
            g + n + (o - n) * f + x(),
            p + t + 2 * (e - t) * f + x(),
            g + n + 2 * (o - n) * f + x(),
            e + x(),
            o + x()
        ]
    }) : M.push({
        op: "bcurveTo",
        data: [
            p + t + (e - t) * f + y(),
            g + n + (o - n) * f + y(),
            p + t + 2 * (e - t) * f + y(),
            g + n + 2 * (o - n) * f + y(),
            e + y(),
            o + y()
        ]
    }), M;
}
function y2(t, n, e) {
    const o = t.length, s = [];
    if (o > 3) {
        const r = [], i = 1 - e.curveTightness;
        s.push({
            op: "move",
            data: [
                t[1][0],
                t[1][1]
            ]
        });
        for(let n7 = 1; n7 + 2 < o; n7++){
            const e = t[n7];
            r[0] = [
                e[0],
                e[1]
            ], r[1] = [
                e[0] + (i * t[n7 + 1][0] - i * t[n7 - 1][0]) / 6,
                e[1] + (i * t[n7 + 1][1] - i * t[n7 - 1][1]) / 6
            ], r[2] = [
                t[n7 + 1][0] + (i * t[n7][0] - i * t[n7 + 2][0]) / 6,
                t[n7 + 1][1] + (i * t[n7][1] - i * t[n7 + 2][1]) / 6
            ], r[3] = [
                t[n7 + 1][0],
                t[n7 + 1][1]
            ], s.push({
                op: "bcurveTo",
                data: [
                    r[1][0],
                    r[1][1],
                    r[2][0],
                    r[2][1],
                    r[3][0],
                    r[3][1]
                ]
            });
        }
        if (n && 2 === n.length) {
            const t = e.maxRandomnessOffset;
            s.push({
                op: "lineTo",
                data: [
                    n[0] + m2(t, e),
                    n[1] + m2(t, e)
                ]
            });
        }
    } else 3 === o ? (s.push({
        op: "move",
        data: [
            t[1][0],
            t[1][1]
        ]
    }), s.push({
        op: "bcurveTo",
        data: [
            t[1][0],
            t[1][1],
            t[2][0],
            t[2][1],
            t[2][0],
            t[2][1]
        ]
    })) : 2 === o && s.push(...M2(t[0][0], t[0][1], t[1][0], t[1][1], e));
    return s;
}
function b2(t, n, e, o, s, r, i, a) {
    const c = [], h = [], u = m2(0.5, a) - Math.PI / 2;
    h.push([
        m2(r, a) + n + 0.9 * o * Math.cos(u - t),
        m2(r, a) + e + 0.9 * s * Math.sin(u - t)
    ]);
    for(let i7 = u; i7 < 2 * Math.PI + u - 0.01; i7 += t){
        const t = [
            m2(r, a) + n + o * Math.cos(i7),
            m2(r, a) + e + s * Math.sin(i7)
        ];
        c.push(t), h.push(t);
    }
    return h.push([
        m2(r, a) + n + o * Math.cos(u + 2 * Math.PI + 0.5 * i),
        m2(r, a) + e + s * Math.sin(u + 2 * Math.PI + 0.5 * i)
    ]), h.push([
        m2(r, a) + n + 0.98 * o * Math.cos(u + i),
        m2(r, a) + e + 0.98 * s * Math.sin(u + i)
    ]), h.push([
        m2(r, a) + n + 0.9 * o * Math.cos(u + 0.5 * i),
        m2(r, a) + e + 0.9 * s * Math.sin(u + 0.5 * i)
    ]), [
        h,
        c
    ];
}
const P2 = {
    randOffset: (t, n)=>t
    ,
    randOffsetWithRange: (t, n, e)=>(t + n) / 2
    ,
    ellipse: (t, n, e, o, s)=>f3(t, n, e, o, s)
    ,
    doubleLineOps: (t, n, e, o, s)=>(function(t, n, e, o, s) {
            return M2(t, n, e, o, s, !0);
        })(t, n, e, o, s)
};
function v2(t) {
    return {
        maxRandomnessOffset: 2,
        roughness: 1,
        bowing: 0.85,
        stroke: "#000",
        strokeWidth: 1.5,
        curveTightness: 0,
        curveFitting: 0.95,
        curveStepCount: 9,
        fillStyle: "hachure",
        fillWeight: 3.5,
        hachureAngle: -41,
        hachureGap: 5,
        dashOffset: -1,
        dashGap: -1,
        zigzagOffset: 0,
        combineNestedSvgPaths: !1,
        disableMultiStroke: !1,
        disableMultiStrokeFill: !1,
        seed: t
    };
}
function w2(t, n) {
    let e = "";
    for (const o of t.ops){
        const t = o.data;
        switch(o.op){
            case "move":
                if (n && e) break;
                e += `M${t[0]} ${t[1]} `;
                break;
            case "bcurveTo":
                e += `C${t[0]} ${t[1]}, ${t[2]} ${t[3]}, ${t[4]} ${t[5]} `;
                break;
            case "lineTo":
                e += `L${t[0]} ${t[1]} `;
        }
    }
    return e.trim();
}
function I2(t, n) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", t);
    if (n) for(const t6 in n)e.setAttributeNS(null, t6, n[t6]);
    return e;
}
function S3(t, n, e = !1) {
    const o = I2("path", {
        d: w2(t, e)
    });
    return n && n.appendChild(o), o;
}
function k2(t, n, e, o, s, r) {
    return S3(function(t, n, e, o, s) {
        return l5([
            [
                t,
                n
            ],
            [
                t + e,
                n
            ],
            [
                t + e,
                n + o
            ],
            [
                t,
                n + o
            ]
        ], s);
    }(n + 2, e + 2, o - 4, s - 4, v2(r)), t);
}
function O1(t, n, e, o, s, r) {
    return S3(u2(n, e, o, s, v2(r)), t);
}
function $2(t, n, e, o, s, r) {
    return S3(f3(n, e, o = Math.max(o > 10 ? o - 4 : o - 1, 1), s = Math.max(s > 10 ? s - 4 : s - 1, 1), v2(r)), t);
}
function E2(t, n) {
    return S3(new c2(P2).fillPolygon(t, v2(n)), null);
}
function L2(t, n, e, o, s) {
    const r = p2(e, o, v2(s)), i = [];
    let a = 0;
    for(; a <= 2 * Math.PI;)i.push([
        t + r.rx * Math.cos(a),
        n + r.ry * Math.sin(a)
    ]), a += r.increment;
    return E2(i, s);
}
var __decorate1 = this && this.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata1 = this && this.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let WiredButton1 = class WiredButton extends WiredBase {
    constructor(){
        super();
        this.elevation = 1;
        this.disabled = false;
        if (window.ResizeObserver) {
            this.resizeObserver = new window.ResizeObserver(()=>{
                if (this.svg) {
                    this.wiredRender(true);
                }
            });
        }
    }
    static get styles() {
        return [
            BaseCSS,
            css1`
        :host {
          display: inline-block;
          font-size: 14px;
        }
        path {
          transition: transform 0.05s ease;
        }
        button {
          position: relative;
          user-select: none;
          border: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          letter-spacing: 1.25px;
          text-transform: uppercase;
          text-align: center;
          padding: 10px;
          color: inherit;
          outline: none;
        }
        button[disabled] {
          opacity: 0.6 !important;
          background: rgba(0, 0, 0, 0.07);
          cursor: default;
          pointer-events: none;
        }
        button:active path {
          transform: scale(0.97) translate(1.5%, 1.5%);
        }
        button:focus path {
          stroke-width: 1.5;
        }
        button::-moz-focus-inner {
          border: 0;
        }
      `
        ];
    }
    render() {
        return html1`
    <button ?disabled="${this.disabled}">
      <slot @slotchange="${this.wiredRender}"></slot>
      <div id="overlay">
        <svg></svg>
      </div>
    </button>
    `;
    }
    focus() {
        if (this.button) {
            this.button.focus();
        } else {
            super.focus();
        }
    }
    canvasSize() {
        if (this.button) {
            const size = this.button.getBoundingClientRect();
            const elev = Math.min(Math.max(1, this.elevation), 5);
            const w = size.width + (elev - 1) * 2;
            const h = size.height + (elev - 1) * 2;
            return [
                w,
                h
            ];
        }
        return this.lastSize;
    }
    draw(svg, size) {
        const elev = Math.min(Math.max(1, this.elevation), 5);
        const s = {
            width: size[0] - (elev - 1) * 2,
            height: size[1] - (elev - 1) * 2
        };
        k2(svg, 0, 0, s.width, s.height, this.seed);
        for(let i = 1; i < elev; i++){
            O1(svg, i * 2, s.height + i * 2, s.width + i * 2, s.height + i * 2, this.seed).style.opacity = `${(75 - i * 10) / 100}`;
            O1(svg, s.width + i * 2, s.height + i * 2, s.width + i * 2, i * 2, this.seed).style.opacity = `${(75 - i * 10) / 100}`;
            O1(svg, i * 2, s.height + i * 2, s.width + i * 2, s.height + i * 2, this.seed).style.opacity = `${(75 - i * 10) / 100}`;
            O1(svg, s.width + i * 2, s.height + i * 2, s.width + i * 2, i * 2, this.seed).style.opacity = `${(75 - i * 10) / 100}`;
        }
    }
    updated() {
        super.updated();
        this.attachResizeListener();
    }
    disconnectedCallback() {
        this.detachResizeListener();
    }
    attachResizeListener() {
        if (this.button && this.resizeObserver && this.resizeObserver.observe) {
            this.resizeObserver.observe(this.button);
        }
    }
    detachResizeListener() {
        if (this.button && this.resizeObserver && this.resizeObserver.unobserve) {
            this.resizeObserver.unobserve(this.button);
        }
    }
};
__decorate1([
    property({
        type: Number
    }),
    __metadata1("design:type", Object)
], WiredButton1.prototype, "elevation", void 0);
__decorate1([
    property({
        type: Boolean,
        reflect: true
    }),
    __metadata1("design:type", Object)
], WiredButton1.prototype, "disabled", void 0);
__decorate1([
    query('button'),
    __metadata1("design:type", HTMLButtonElement)
], WiredButton1.prototype, "button", void 0);
WiredButton1 = __decorate1([
    customElement('wired-button'),
    __metadata1("design:paramtypes", [])
], WiredButton1);
var __decorate2 = this && this.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata2 = this && this.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let WiredSlider1 = class WiredSlider extends WiredBase {
    constructor(){
        super(...arguments);
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.disabled = false;
        this.canvasWidth = 300;
    }
    static get styles() {
        return [
            BaseCSS,
            css1`
      :host {
        display: inline-block;
        position: relative;
        width: 300px;
        box-sizing: border-box;
      }
      :host([disabled]) {
        opacity: 0.45 !important;
        cursor: default;
        pointer-events: none;
        background: rgba(0, 0, 0, 0.07);
        border-radius: 5px;
      }
      input[type=range] {
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        margin: 0;
        -webkit-appearance: none;
        background: transparent;
        outline: none;
        position: relative;
      }
      input[type=range]:focus {
        outline: none;
      }
      input[type=range]::-ms-track {
        width: 100%;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }
      input[type=range]::-moz-focus-outer {
        outline: none;
        border: 0;
      }
      input[type=range]::-moz-range-thumb {
        border-radius: 50px;
        background: none;
        cursor: pointer;
        border: none;
        margin: 0;
        height: 20px;
        width: 20px;
        line-height: 1;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 50px;
        background: none;
        cursor: pointer;
        border: none;
        height: 20px;
        width: 20px;
        margin: 0;
        line-height: 1;
      }
      .knob{
        fill: var(--wired-slider-knob-color, rgb(51, 103, 214));
        stroke: var(--wired-slider-knob-color, rgb(51, 103, 214));
      }
      .bar {
        stroke: var(--wired-slider-bar-color, rgb(0, 0, 0));
      }
      input:focus + div svg .knob {
        stroke: var(--wired-slider-knob-outline-color, #000);
        fill-opacity: 0.8;
      }
      `
        ];
    }
    get value() {
        if (this.input) {
            return +this.input.value;
        }
        return this.min;
    }
    set value(v) {
        if (this.input) {
            this.input.value = `${v}`;
        } else {
            this.pendingValue = v;
        }
        this.updateThumbPosition();
    }
    firstUpdated() {
        this.value = this.pendingValue || +(this.getAttribute('value') || this.value || this.min);
        delete this.pendingValue;
    }
    render() {
        return html1`
    <div id="container">
      <input type="range" 
        min="${this.min}"
        max="${this.max}"
        step="${this.step}"
        ?disabled="${this.disabled}"
        @input="${this.onInput}">
      <div id="overlay">
        <svg></svg>
      </div>
    </div>
    `;
    }
    focus() {
        if (this.input) {
            this.input.focus();
        } else {
            super.focus();
        }
    }
    onInput(e) {
        e.stopPropagation();
        this.updateThumbPosition();
        if (this.input) {
            fire(this, 'change', {
                value: +this.input.value
            });
        }
    }
    wiredRender(force = false) {
        super.wiredRender(force);
        this.updateThumbPosition();
    }
    canvasSize() {
        const s = this.getBoundingClientRect();
        return [
            s.width,
            s.height
        ];
    }
    draw(svg, size) {
        this.canvasWidth = size[0];
        const midY = Math.round(size[1] / 2);
        O1(svg, 0, midY, size[0], midY, this.seed).classList.add('bar');
        this.knob = $2(svg, 10, midY, 20, 20, this.seed);
        this.knob.classList.add('knob');
    }
    updateThumbPosition() {
        if (this.input) {
            const value = +this.input.value;
            const delta = Math.max(this.step, this.max - this.min);
            const pct = (value - this.min) / delta;
            if (this.knob) {
                this.knob.style.transform = `translateX(${pct * (this.canvasWidth - 20)}px)`;
            }
        }
    }
};
__decorate2([
    property({
        type: Number
    }),
    __metadata2("design:type", Object)
], WiredSlider1.prototype, "min", void 0);
__decorate2([
    property({
        type: Number
    }),
    __metadata2("design:type", Object)
], WiredSlider1.prototype, "max", void 0);
__decorate2([
    property({
        type: Number
    }),
    __metadata2("design:type", Object)
], WiredSlider1.prototype, "step", void 0);
__decorate2([
    property({
        type: Boolean,
        reflect: true
    }),
    __metadata2("design:type", Object)
], WiredSlider1.prototype, "disabled", void 0);
__decorate2([
    query('input'),
    __metadata2("design:type", HTMLInputElement)
], WiredSlider1.prototype, "input", void 0);
WiredSlider1 = __decorate2([
    customElement('wired-slider')
], WiredSlider1);
var __decorate3 = this && this.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata3 = this && this.__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let WiredToggle1 = class WiredToggle extends WiredBase {
    constructor(){
        super(...arguments);
        this.checked = false;
        this.disabled = false;
    }
    static get styles() {
        return [
            BaseCSS,
            css1`
      :host {
        display: inline-block;
        cursor: pointer;
        position: relative;
        outline: none;
      }
      :host([disabled]) {
        opacity: 0.4 !important;
        cursor: default;
        pointer-events: none;
      }
      :host([disabled]) svg {
        background: rgba(0, 0, 0, 0.07);
      }
      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        cursor: pointer;
        opacity: 0;
      }
      .knob {
        transition: transform 0.3s ease;
      }
      .knob path {
        stroke-width: 0.7;
      }
      .knob.checked {
        transform: translateX(48px);
      }
      path.knobfill {
        stroke-width: 3 !important;
        fill: transparent;
      }
      .knob.unchecked path.knobfill {
        stroke: var(--wired-toggle-off-color, gray);
      }
      .knob.checked path.knobfill {
        stroke: var(--wired-toggle-on-color, rgb(63, 81, 181));
      }
      `
        ];
    }
    render() {
        return html1`
    <div style="position: relative;">
      <svg></svg>
      <input type="checkbox" .checked="${this.checked}" ?disabled="${this.disabled}"  @change="${this.onChange}">
    </div>
    `;
    }
    focus() {
        if (this.input) {
            this.input.focus();
        } else {
            super.focus();
        }
    }
    wiredRender(force = false) {
        super.wiredRender(force);
        this.refreshKnob();
    }
    onChange() {
        this.checked = this.input.checked;
        this.refreshKnob();
        fire(this, 'change', {
            checked: this.checked
        });
    }
    canvasSize() {
        return [
            80,
            34
        ];
    }
    draw(svg, size) {
        const rect = k2(svg, 16, 8, size[0] - 32, 18, this.seed);
        rect.classList.add('toggle-bar');
        this.knob = I2('g');
        this.knob.classList.add('knob');
        svg.appendChild(this.knob);
        const knobFill = L2(16, 16, 32, 32, this.seed);
        knobFill.classList.add('knobfill');
        this.knob.appendChild(knobFill);
        $2(this.knob, 16, 16, 32, 32, this.seed);
    }
    refreshKnob() {
        if (this.knob) {
            const cl = this.knob.classList;
            if (this.checked) {
                cl.remove('unchecked');
                cl.add('checked');
            } else {
                cl.remove('checked');
                cl.add('unchecked');
            }
        }
    }
};
__decorate3([
    property({
        type: Boolean
    }),
    __metadata3("design:type", Object)
], WiredToggle1.prototype, "checked", void 0);
__decorate3([
    property({
        type: Boolean,
        reflect: true
    }),
    __metadata3("design:type", Object)
], WiredToggle1.prototype, "disabled", void 0);
__decorate3([
    query('input'),
    __metadata3("design:type", HTMLInputElement)
], WiredToggle1.prototype, "input", void 0);
WiredToggle1 = __decorate3([
    customElement('wired-toggle')
], WiredToggle1);
export { Port1 as Port, U as rough, s5 as LitElement, p1 as html, r1 as css, l4 as live };
