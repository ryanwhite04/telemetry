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
function t2(t1, e, s) {
    if (t1 && t1.length) {
        const [n, o] = e, a = Math.PI / 180 * s, r = Math.cos(a), h = Math.sin(a);
        t1.forEach((t2)=>{
            const [e1, s1] = t2;
            t2[0] = (e1 - n) * r - (s1 - o) * h + n, t2[1] = (e1 - n) * h + (s1 - o) * r + o;
        });
    }
}
function e1(t1) {
    const e1 = t1[0], s = t1[1];
    return Math.sqrt(Math.pow(e1[0] - s[0], 2) + Math.pow(e1[1] - s[1], 2));
}
function s1(t1, e1, s1, n) {
    const o = e1[1] - t1[1], a = t1[0] - e1[0], r = o * t1[0] + a * t1[1], h = n[1] - s1[1], i = s1[0] - n[0], c = h * s1[0] + i * s1[1], l = o * i - h * a;
    return l ? [
        (i * r - a * c) / l,
        (o * c - h * r) / l
    ] : null;
}
function n1(t1, e1, s1) {
    const n1 = t1.length;
    if (n1 < 3) return !1;
    const h = [
        Number.MAX_SAFE_INTEGER,
        s1
    ], i = [
        e1,
        s1
    ];
    let c = 0;
    for(let e2 = 0; e2 < n1; e2++){
        const s2 = t1[e2], l = t1[(e2 + 1) % n1];
        if (r1(s2, l, i, h)) {
            if (0 === a1(s2, i, l)) return o1(s2, i, l);
            c++;
        }
    }
    return c % 2 == 1;
}
function o1(t1, e1, s1) {
    return e1[0] <= Math.max(t1[0], s1[0]) && e1[0] >= Math.min(t1[0], s1[0]) && e1[1] <= Math.max(t1[1], s1[1]) && e1[1] >= Math.min(t1[1], s1[1]);
}
function a1(t1, e1, s1) {
    const n1 = (e1[1] - t1[1]) * (s1[0] - e1[0]) - (e1[0] - t1[0]) * (s1[1] - e1[1]);
    return 0 === n1 ? 0 : n1 > 0 ? 1 : 2;
}
function r1(t1, e1, s1, n1) {
    const r1 = a1(t1, e1, s1), h = a1(t1, e1, n1), i = a1(s1, n1, t1), c = a1(s1, n1, e1);
    return r1 !== h && i !== c || !(0 !== r1 || !o1(t1, s1, e1)) || !(0 !== h || !o1(t1, n1, e1)) || !(0 !== i || !o1(s1, t1, n1)) || !(0 !== c || !o1(s1, e1, n1));
}
function h1(e1, s1) {
    const n1 = [
        0,
        0
    ], o1 = Math.round(s1.hachureAngle + 90);
    o1 && t2(e1, n1, o1);
    const a1 = function(t1, e2) {
        const s2 = [
            ...t1
        ];
        s2[0].join(",") !== s2[s2.length - 1].join(",") && s2.push([
            s2[0][0],
            s2[0][1]
        ]);
        const n2 = [];
        if (s2 && s2.length > 2) {
            let t2 = e2.hachureGap;
            t2 < 0 && (t2 = 4 * e2.strokeWidth), t2 = Math.max(t2, 0.1);
            const o2 = [];
            for(let t3 = 0; t3 < s2.length - 1; t3++){
                const e3 = s2[t3], n3 = s2[t3 + 1];
                if (e3[1] !== n3[1]) {
                    const t4 = Math.min(e3[1], n3[1]);
                    o2.push({
                        ymin: t4,
                        ymax: Math.max(e3[1], n3[1]),
                        x: t4 === e3[1] ? e3[0] : n3[0],
                        islope: (n3[0] - e3[0]) / (n3[1] - e3[1])
                    });
                }
            }
            if (o2.sort((t4, e3)=>t4.ymin < e3.ymin ? -1 : t4.ymin > e3.ymin ? 1 : t4.x < e3.x ? -1 : t4.x > e3.x ? 1 : t4.ymax === e3.ymax ? 0 : (t4.ymax - e3.ymax) / Math.abs(t4.ymax - e3.ymax)
            ), !o2.length) return n2;
            let a2 = [], r1 = o2[0].ymin;
            for(; a2.length || o2.length;){
                if (o2.length) {
                    let t4 = -1;
                    for(let e3 = 0; e3 < o2.length && !(o2[e3].ymin > r1); e3++)t4 = e3;
                    o2.splice(0, t4 + 1).forEach((t5)=>{
                        a2.push({
                            s: r1,
                            edge: t5
                        });
                    });
                }
                if (a2 = a2.filter((t4)=>!(t4.edge.ymax <= r1)
                ), a2.sort((t4, e3)=>t4.edge.x === e3.edge.x ? 0 : (t4.edge.x - e3.edge.x) / Math.abs(t4.edge.x - e3.edge.x)
                ), a2.length > 1) for(let t4 = 0; t4 < a2.length; t4 += 2){
                    const e3 = t4 + 1;
                    if (e3 >= a2.length) break;
                    const s3 = a2[t4].edge, o3 = a2[e3].edge;
                    n2.push([
                        [
                            Math.round(s3.x),
                            r1
                        ],
                        [
                            Math.round(o3.x),
                            r1
                        ]
                    ]);
                }
                r1 += t2, a2.forEach((e3)=>{
                    e3.edge.x = e3.edge.x + t2 * e3.edge.islope;
                });
            }
        }
        return n2;
    }(e1, s1);
    return o1 && (t2(e1, n1, -o1), (function(e2, s2, n2) {
        const o2 = [];
        e2.forEach((t1)=>o2.push(...t1)
        ), t2(o2, s2, n2);
    })(a1, n1, -o1)), a1;
}
class i2 {
    constructor(t1){
        this.helper = t1;
    }
    fillPolygon(t, e) {
        return this._fillPolygon(t, e);
    }
    _fillPolygon(t, e, s = !1) {
        let n1 = h1(t, e);
        if (s) {
            const e2 = this.connectingLines(t, n1);
            n1 = n1.concat(e2);
        }
        return {
            type: "fillSketch",
            ops: this.renderLines(n1, e)
        };
    }
    renderLines(t, e) {
        const s2 = [];
        for (const n1 of t)s2.push(...this.helper.doubleLineOps(n1[0][0], n1[0][1], n1[1][0], n1[1][1], e));
        return s2;
    }
    connectingLines(t, s) {
        const n1 = [];
        if (s.length > 1) for(let o1 = 1; o1 < s.length; o1++){
            const a1 = s[o1 - 1];
            if (e1(a1) < 3) continue;
            const r1 = [
                s[o1][0],
                a1[1]
            ];
            if (e1(r1) > 3) {
                const e2 = this.splitOnIntersections(t, r1);
                n1.push(...e2);
            }
        }
        return n1;
    }
    midPointInPolygon(t, e) {
        return n1(t, (e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2);
    }
    splitOnIntersections(t, o) {
        const a1 = Math.max(5, 0.1 * e1(o)), h1 = [];
        for(let n1 = 0; n1 < t.length; n1++){
            const i1 = t[n1], c = t[(n1 + 1) % t.length];
            if (r1(i1, c, ...o)) {
                const t3 = s1(i1, c, o[0], o[1]);
                if (t3) {
                    const s2 = e1([
                        t3,
                        o[0]
                    ]), n2 = e1([
                        t3,
                        o[1]
                    ]);
                    s2 > a1 && n2 > a1 && h1.push({
                        point: t3,
                        distance: s2
                    });
                }
            }
        }
        if (h1.length > 1) {
            const e2 = h1.sort((t3, e3)=>t3.distance - e3.distance
            ).map((t3)=>t3.point
            );
            if (n1(t, ...o[0]) || e2.shift(), n1(t, ...o[1]) || e2.pop(), e2.length <= 1) return this.midPointInPolygon(t, o) ? [
                o
            ] : [];
            const s2 = [
                o[0],
                ...e2,
                o[1]
            ], a2 = [];
            for(let e3 = 0; e3 < s2.length - 1; e3 += 2){
                const n2 = [
                    s2[e3],
                    s2[e3 + 1]
                ];
                this.midPointInPolygon(t, n2) && a2.push(n2);
            }
            return a2;
        }
        return this.midPointInPolygon(t, o) ? [
            o
        ] : [];
    }
}
class c extends i2 {
    fillPolygon(t, e) {
        return this._fillPolygon(t, e, !0);
    }
}
class l extends i2 {
    fillPolygon(t, e) {
        const s2 = this._fillPolygon(t, e), n1 = Object.assign({
        }, e, {
            hachureAngle: e.hachureAngle + 90
        }), o2 = this._fillPolygon(t, n1);
        return s2.ops = s2.ops.concat(o2.ops), s2;
    }
}
class u1 {
    constructor(t3){
        this.helper = t3;
    }
    fillPolygon(t, e) {
        const s2 = h1(t, e = Object.assign({
        }, e, {
            curveStepCount: 4,
            hachureAngle: 0,
            roughness: 1
        }));
        return this.dotsOnLines(s2, e);
    }
    dotsOnLines(t, s) {
        const n1 = [];
        let o2 = s.hachureGap;
        o2 < 0 && (o2 = 4 * s.strokeWidth), o2 = Math.max(o2, 0.1);
        let a1 = s.fillWeight;
        a1 < 0 && (a1 = s.strokeWidth / 2);
        const r1 = o2 / 4;
        for (const h1 of t){
            const t4 = e1(h1), i1 = t4 / o2, c1 = Math.ceil(i1) - 1, l1 = t4 - c1 * o2, u1 = (h1[0][0] + h1[1][0]) / 2 - o2 / 4, p = Math.min(h1[0][1], h1[1][1]);
            for(let t5 = 0; t5 < c1; t5++){
                const e2 = p + l1 + t5 * o2, h2 = this.helper.randOffsetWithRange(u1 - r1, u1 + r1, s), i2 = this.helper.randOffsetWithRange(e2 - r1, e2 + r1, s), c2 = this.helper.ellipse(h2, i2, a1, a1, s);
                n1.push(...c2.ops);
            }
        }
        return {
            type: "fillSketch",
            ops: n1
        };
    }
}
class p1 {
    constructor(t4){
        this.helper = t4;
    }
    fillPolygon(t, e) {
        const s2 = h1(t, e);
        return {
            type: "fillSketch",
            ops: this.dashedLine(s2, e)
        };
    }
    dashedLine(t, s) {
        const n1 = s.dashOffset < 0 ? s.hachureGap < 0 ? 4 * s.strokeWidth : s.hachureGap : s.dashOffset, o2 = s.dashGap < 0 ? s.hachureGap < 0 ? 4 * s.strokeWidth : s.hachureGap : s.dashGap, a1 = [];
        return t.forEach((t5)=>{
            const r1 = e1(t5), h1 = Math.floor(r1 / (n1 + o2)), i1 = (r1 + o2 - h1 * (n1 + o2)) / 2;
            let c1 = t5[0], l1 = t5[1];
            c1[0] > l1[0] && (c1 = t5[1], l1 = t5[0]);
            const u1 = Math.atan((l1[1] - c1[1]) / (l1[0] - c1[0]));
            for(let t6 = 0; t6 < h1; t6++){
                const e2 = t6 * (n1 + o2), r2 = e2 + n1, h2 = [
                    c1[0] + e2 * Math.cos(u1) + i1 * Math.cos(u1),
                    c1[1] + e2 * Math.sin(u1) + i1 * Math.sin(u1)
                ], l2 = [
                    c1[0] + r2 * Math.cos(u1) + i1 * Math.cos(u1),
                    c1[1] + r2 * Math.sin(u1) + i1 * Math.sin(u1)
                ];
                a1.push(...this.helper.doubleLineOps(h2[0], h2[1], l2[0], l2[1], s));
            }
        }), a1;
    }
}
class f {
    constructor(t5){
        this.helper = t5;
    }
    fillPolygon(t, e) {
        const s2 = e.hachureGap < 0 ? 4 * e.strokeWidth : e.hachureGap, n1 = e.zigzagOffset < 0 ? s2 : e.zigzagOffset, o2 = h1(t, e = Object.assign({
        }, e, {
            hachureGap: s2 + n1
        }));
        return {
            type: "fillSketch",
            ops: this.zigzagLines(o2, n1, e)
        };
    }
    zigzagLines(t, s, n) {
        const o2 = [];
        return t.forEach((t6)=>{
            const a1 = e1(t6), r1 = Math.round(a1 / (2 * s));
            let h1 = t6[0], i1 = t6[1];
            h1[0] > i1[0] && (h1 = t6[1], i1 = t6[0]);
            const c1 = Math.atan((i1[1] - h1[1]) / (i1[0] - h1[0]));
            for(let t7 = 0; t7 < r1; t7++){
                const e2 = 2 * t7 * s, a2 = 2 * (t7 + 1) * s, r2 = Math.sqrt(2 * Math.pow(s, 2)), i2 = [
                    h1[0] + e2 * Math.cos(c1),
                    h1[1] + e2 * Math.sin(c1)
                ], l1 = [
                    h1[0] + a2 * Math.cos(c1),
                    h1[1] + a2 * Math.sin(c1)
                ], u1 = [
                    i2[0] + r2 * Math.cos(c1 + Math.PI / 4),
                    i2[1] + r2 * Math.sin(c1 + Math.PI / 4)
                ];
                o2.push(...this.helper.doubleLineOps(i2[0], i2[1], u1[0], u1[1], n), ...this.helper.doubleLineOps(u1[0], u1[1], l1[0], l1[1], n));
            }
        }), o2;
    }
}
const d = {
};
class g1 {
    constructor(t6){
        this.seed = t6;
    }
    next() {
        return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
    }
}
const M1 = {
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
function k(t7, e2) {
    return t7.type === e2;
}
function b1(t7) {
    const e2 = [], s2 = function(t8) {
        const e3 = new Array();
        for(; "" !== t8;)if (t8.match(/^([ \t\r\n,]+)/)) t8 = t8.substr(RegExp.$1.length);
        else if (t8.match(/^([aAcChHlLmMqQsStTvVzZ])/)) e3[e3.length] = {
            type: 0,
            text: RegExp.$1
        }, t8 = t8.substr(RegExp.$1.length);
        else {
            if (!t8.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
            e3[e3.length] = {
                type: 1,
                text: `${parseFloat(RegExp.$1)}`
            }, t8 = t8.substr(RegExp.$1.length);
        }
        return e3[e3.length] = {
            type: 2,
            text: ""
        }, e3;
    }(t7);
    let n2 = "BOD", o2 = 0, a1 = s2[o2];
    for(; !k(a1, 2);){
        let r1 = 0;
        const h1 = [];
        if ("BOD" === n2) {
            if ("M" !== a1.text && "m" !== a1.text) return b1("M0,0" + t7);
            o2++, r1 = M1[a1.text], n2 = a1.text;
        } else k(a1, 1) ? r1 = M1[n2] : (o2++, r1 = M1[a1.text], n2 = a1.text);
        if (!(o2 + r1 < s2.length)) throw new Error("Path data ended short");
        for(let t8 = o2; t8 < o2 + r1; t8++){
            const e3 = s2[t8];
            if (!k(e3, 1)) throw new Error("Param not a number: " + n2 + "," + e3.text);
            h1[h1.length] = +e3.text;
        }
        if ("number" != typeof M1[n2]) throw new Error("Bad segment: " + n2);
        {
            const t9 = {
                key: n2,
                data: h1
            };
            e2.push(t9), o2 += r1, a1 = s2[o2], "M" === n2 && (n2 = "L"), "m" === n2 && (n2 = "l");
        }
    }
    return e2;
}
function y1(t7) {
    let e2 = 0, s2 = 0, n2 = 0, o2 = 0;
    const a1 = [];
    for (const { key: r1 , data: h1  } of t7)switch(r1){
        case "M":
            a1.push({
                key: "M",
                data: [
                    ...h1
                ]
            }), [e2, s2] = h1, [n2, o2] = h1;
            break;
        case "m":
            e2 += h1[0], s2 += h1[1], a1.push({
                key: "M",
                data: [
                    e2,
                    s2
                ]
            }), n2 = e2, o2 = s2;
            break;
        case "L":
            a1.push({
                key: "L",
                data: [
                    ...h1
                ]
            }), [e2, s2] = h1;
            break;
        case "l":
            e2 += h1[0], s2 += h1[1], a1.push({
                key: "L",
                data: [
                    e2,
                    s2
                ]
            });
            break;
        case "C":
            a1.push({
                key: "C",
                data: [
                    ...h1
                ]
            }), e2 = h1[4], s2 = h1[5];
            break;
        case "c":
            {
                const t8 = h1.map((t9, n3)=>n3 % 2 ? t9 + s2 : t9 + e2
                );
                a1.push({
                    key: "C",
                    data: t8
                }), e2 = t8[4], s2 = t8[5];
                break;
            }
        case "Q":
            a1.push({
                key: "Q",
                data: [
                    ...h1
                ]
            }), e2 = h1[2], s2 = h1[3];
            break;
        case "q":
            {
                const t8 = h1.map((t9, n3)=>n3 % 2 ? t9 + s2 : t9 + e2
                );
                a1.push({
                    key: "Q",
                    data: t8
                }), e2 = t8[2], s2 = t8[3];
                break;
            }
        case "A":
            a1.push({
                key: "A",
                data: [
                    ...h1
                ]
            }), e2 = h1[5], s2 = h1[6];
            break;
        case "a":
            e2 += h1[5], s2 += h1[6], a1.push({
                key: "A",
                data: [
                    h1[0],
                    h1[1],
                    h1[2],
                    h1[3],
                    h1[4],
                    e2,
                    s2
                ]
            });
            break;
        case "H":
            a1.push({
                key: "H",
                data: [
                    ...h1
                ]
            }), e2 = h1[0];
            break;
        case "h":
            e2 += h1[0], a1.push({
                key: "H",
                data: [
                    e2
                ]
            });
            break;
        case "V":
            a1.push({
                key: "V",
                data: [
                    ...h1
                ]
            }), s2 = h1[0];
            break;
        case "v":
            s2 += h1[0], a1.push({
                key: "V",
                data: [
                    s2
                ]
            });
            break;
        case "S":
            a1.push({
                key: "S",
                data: [
                    ...h1
                ]
            }), e2 = h1[2], s2 = h1[3];
            break;
        case "s":
            {
                const t8 = h1.map((t9, n3)=>n3 % 2 ? t9 + s2 : t9 + e2
                );
                a1.push({
                    key: "S",
                    data: t8
                }), e2 = t8[2], s2 = t8[3];
                break;
            }
        case "T":
            a1.push({
                key: "T",
                data: [
                    ...h1
                ]
            }), e2 = h1[0], s2 = h1[1];
            break;
        case "t":
            e2 += h1[0], s2 += h1[1], a1.push({
                key: "T",
                data: [
                    e2,
                    s2
                ]
            });
            break;
        case "Z":
        case "z":
            a1.push({
                key: "Z",
                data: []
            }), e2 = n2, s2 = o2;
    }
    return a1;
}
function m1(t7) {
    const e2 = [];
    let s2 = "", n2 = 0, o2 = 0, a1 = 0, r1 = 0, h1 = 0, i1 = 0;
    for (const { key: c1 , data: l1  } of t7){
        switch(c1){
            case "M":
                e2.push({
                    key: "M",
                    data: [
                        ...l1
                    ]
                }), [n2, o2] = l1, [a1, r1] = l1;
                break;
            case "C":
                e2.push({
                    key: "C",
                    data: [
                        ...l1
                    ]
                }), n2 = l1[4], o2 = l1[5], h1 = l1[2], i1 = l1[3];
                break;
            case "L":
                e2.push({
                    key: "L",
                    data: [
                        ...l1
                    ]
                }), [n2, o2] = l1;
                break;
            case "H":
                n2 = l1[0], e2.push({
                    key: "L",
                    data: [
                        n2,
                        o2
                    ]
                });
                break;
            case "V":
                o2 = l1[0], e2.push({
                    key: "L",
                    data: [
                        n2,
                        o2
                    ]
                });
                break;
            case "S":
                {
                    let t8 = 0, a2 = 0;
                    "C" === s2 || "S" === s2 ? (t8 = n2 + (n2 - h1), a2 = o2 + (o2 - i1)) : (t8 = n2, a2 = o2), e2.push({
                        key: "C",
                        data: [
                            t8,
                            a2,
                            ...l1
                        ]
                    }), h1 = l1[0], i1 = l1[1], n2 = l1[2], o2 = l1[3];
                    break;
                }
            case "T":
                {
                    const [t8, a2] = l1;
                    let r2 = 0, c2 = 0;
                    "Q" === s2 || "T" === s2 ? (r2 = n2 + (n2 - h1), c2 = o2 + (o2 - i1)) : (r2 = n2, c2 = o2);
                    const u1 = n2 + 2 * (r2 - n2) / 3, p1 = o2 + 2 * (c2 - o2) / 3, f1 = t8 + 2 * (r2 - t8) / 3, d1 = a2 + 2 * (c2 - a2) / 3;
                    e2.push({
                        key: "C",
                        data: [
                            u1,
                            p1,
                            f1,
                            d1,
                            t8,
                            a2
                        ]
                    }), h1 = r2, i1 = c2, n2 = t8, o2 = a2;
                    break;
                }
            case "Q":
                {
                    const [t8, s3, a2, r2] = l1, c2 = n2 + 2 * (t8 - n2) / 3, u1 = o2 + 2 * (s3 - o2) / 3, p1 = a2 + 2 * (t8 - a2) / 3, f1 = r2 + 2 * (s3 - r2) / 3;
                    e2.push({
                        key: "C",
                        data: [
                            c2,
                            u1,
                            p1,
                            f1,
                            a2,
                            r2
                        ]
                    }), h1 = t8, i1 = s3, n2 = a2, o2 = r2;
                    break;
                }
            case "A":
                {
                    const t8 = Math.abs(l1[0]), s3 = Math.abs(l1[1]), a2 = l1[2], r2 = l1[3], h2 = l1[4], i2 = l1[5], c2 = l1[6];
                    if (0 === t8 || 0 === s3) e2.push({
                        key: "C",
                        data: [
                            n2,
                            o2,
                            i2,
                            c2,
                            i2,
                            c2
                        ]
                    }), n2 = i2, o2 = c2;
                    else if (n2 !== i2 || o2 !== c2) {
                        P(n2, o2, i2, c2, t8, s3, a2, r2, h2).forEach(function(t9) {
                            e2.push({
                                key: "C",
                                data: t9
                            });
                        }), n2 = i2, o2 = c2;
                    }
                    break;
                }
            case "Z":
                e2.push({
                    key: "Z",
                    data: []
                }), n2 = a1, o2 = r1;
        }
        s2 = c1;
    }
    return e2;
}
function w(t7, e2, s2) {
    return [
        t7 * Math.cos(s2) - e2 * Math.sin(s2),
        t7 * Math.sin(s2) + e2 * Math.cos(s2)
    ];
}
function P(t7, e2, s2, n2, o2, a1, r1, h1, i1, c1) {
    const l1 = (u2 = r1, Math.PI * u2 / 180);
    var u2;
    let p1 = [], f1 = 0, d1 = 0, g1 = 0, M1 = 0;
    if (c1) [f1, d1, g1, M1] = c1;
    else {
        [t7, e2] = w(t7, e2, -l1), [s2, n2] = w(s2, n2, -l1);
        const r2 = (t7 - s2) / 2, c2 = (e2 - n2) / 2;
        let u3 = r2 * r2 / (o2 * o2) + c2 * c2 / (a1 * a1);
        u3 > 1 && (u3 = Math.sqrt(u3), o2 *= u3, a1 *= u3);
        const p2 = o2 * o2, k1 = a1 * a1, b1 = p2 * k1 - p2 * c2 * c2 - k1 * r2 * r2, y1 = p2 * c2 * c2 + k1 * r2 * r2, m1 = (h1 === i1 ? -1 : 1) * Math.sqrt(Math.abs(b1 / y1));
        g1 = m1 * o2 * c2 / a1 + (t7 + s2) / 2, M1 = m1 * -a1 * r2 / o2 + (e2 + n2) / 2, f1 = Math.asin(parseFloat(((e2 - M1) / a1).toFixed(9))), d1 = Math.asin(parseFloat(((n2 - M1) / a1).toFixed(9))), t7 < g1 && (f1 = Math.PI - f1), s2 < g1 && (d1 = Math.PI - d1), f1 < 0 && (f1 = 2 * Math.PI + f1), d1 < 0 && (d1 = 2 * Math.PI + d1), i1 && f1 > d1 && (f1 -= 2 * Math.PI), !i1 && d1 > f1 && (d1 -= 2 * Math.PI);
    }
    let k1 = d1 - f1;
    if (Math.abs(k1) > 120 * Math.PI / 180) {
        const t8 = d1, e3 = s2, h2 = n2;
        d1 = i1 && d1 > f1 ? f1 + 120 * Math.PI / 180 * 1 : f1 + 120 * Math.PI / 180 * -1, p1 = P(s2 = g1 + o2 * Math.cos(d1), n2 = M1 + a1 * Math.sin(d1), e3, h2, o2, a1, r1, 0, i1, [
            d1,
            t8,
            g1,
            M1
        ]);
    }
    k1 = d1 - f1;
    const b1 = Math.cos(f1), y1 = Math.sin(f1), m1 = Math.cos(d1), x = Math.sin(d1), v = Math.tan(k1 / 4), O = 4 / 3 * o2 * v, S = 4 / 3 * a1 * v, L = [
        t7,
        e2
    ], T = [
        t7 + O * y1,
        e2 - S * b1
    ], I = [
        s2 + O * x,
        n2 - S * m1
    ], A = [
        s2,
        n2
    ];
    if (T[0] = 2 * L[0] - T[0], T[1] = 2 * L[1] - T[1], c1) return [
        T,
        I,
        A
    ].concat(p1);
    {
        p1 = [
            T,
            I,
            A
        ].concat(p1);
        const t8 = [];
        for(let e3 = 0; e3 < p1.length; e3 += 3){
            const s3 = w(p1[e3][0], p1[e3][1], l1), n3 = w(p1[e3 + 1][0], p1[e3 + 1][1], l1), o3 = w(p1[e3 + 2][0], p1[e3 + 2][1], l1);
            t8.push([
                s3[0],
                s3[1],
                n3[0],
                n3[1],
                o3[0],
                o3[1]
            ]);
        }
        return t8;
    }
}
const x1 = {
    randOffset: function(t7, e2) {
        return W(t7, e2);
    },
    randOffsetWithRange: function(t7, e2, s2) {
        return E(t7, e2, s2);
    },
    ellipse: function(t7, e2, s2, n2, o2) {
        const a1 = T(s2, n2, o2);
        return I(t7, e2, o2, a1).opset;
    },
    doubleLineOps: function(t7, e2, s2, n2, o2) {
        return z(t7, e2, s2, n2, o2, !0);
    }
};
function v2(t7, e2, s2, n2, o2) {
    return {
        type: "path",
        ops: z(t7, e2, s2, n2, o2)
    };
}
function O(t7, e2, s2) {
    const n2 = (t7 || []).length;
    if (n2 > 2) {
        const o2 = [];
        for(let e3 = 0; e3 < n2 - 1; e3++)o2.push(...z(t7[e3][0], t7[e3][1], t7[e3 + 1][0], t7[e3 + 1][1], s2));
        return e2 && o2.push(...z(t7[n2 - 1][0], t7[n2 - 1][1], t7[0][0], t7[0][1], s2)), {
            type: "path",
            ops: o2
        };
    }
    return 2 === n2 ? v2(t7[0][0], t7[0][1], t7[1][0], t7[1][1], s2) : {
        type: "path",
        ops: []
    };
}
function S(t7, e2, s2, n2, o2) {
    return (function(t8, e3) {
        return O(t8, !0, e3);
    })([
        [
            t7,
            e2
        ],
        [
            t7 + s2,
            e2
        ],
        [
            t7 + s2,
            e2 + n2
        ],
        [
            t7,
            e2 + n2
        ]
    ], o2);
}
function L(t7, e2) {
    let s2 = $(t7, 1 * (1 + 0.2 * e2.roughness), e2);
    if (!e2.disableMultiStroke) {
        const n2 = $(t7, 1.5 * (1 + 0.22 * e2.roughness), function(t8) {
            const e3 = Object.assign({
            }, t8);
            e3.randomizer = void 0, t8.seed && (e3.seed = t8.seed + 1);
            return e3;
        }(e2));
        s2 = s2.concat(n2);
    }
    return {
        type: "path",
        ops: s2
    };
}
function T(t7, e2, s2) {
    const n2 = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t7 / 2, 2) + Math.pow(e2 / 2, 2)) / 2)), o2 = Math.max(s2.curveStepCount, s2.curveStepCount / Math.sqrt(200) * n2), a1 = 2 * Math.PI / o2;
    let r1 = Math.abs(t7 / 2), h1 = Math.abs(e2 / 2);
    const i1 = 1 - s2.curveFitting;
    return r1 += W(r1 * i1, s2), h1 += W(h1 * i1, s2), {
        increment: a1,
        rx: r1,
        ry: h1
    };
}
function I(t7, e2, s2, n2) {
    const [o2, a1] = q(n2.increment, t7, e2, n2.rx, n2.ry, 1, n2.increment * E(0.1, E(0.4, 1, s2), s2), s2);
    let r1 = G(o2, null, s2);
    if (!s2.disableMultiStroke) {
        const [o3] = q(n2.increment, t7, e2, n2.rx, n2.ry, 1.5, 0, s2), a2 = G(o3, null, s2);
        r1 = r1.concat(a2);
    }
    return {
        estimatedPoints: a1,
        opset: {
            type: "path",
            ops: r1
        }
    };
}
function A(t7, e2, s2, n2, o2, a1, r1, h1, i1) {
    const c1 = t7, l1 = e2;
    let u2 = Math.abs(s2 / 2), p1 = Math.abs(n2 / 2);
    u2 += W(0.01 * u2, i1), p1 += W(0.01 * p1, i1);
    let f1 = o2, d1 = a1;
    for(; f1 < 0;)f1 += 2 * Math.PI, d1 += 2 * Math.PI;
    d1 - f1 > 2 * Math.PI && (f1 = 0, d1 = 2 * Math.PI);
    const g1 = 2 * Math.PI / i1.curveStepCount, M1 = Math.min(g1 / 2, (d1 - f1) / 2), k1 = F(M1, c1, l1, u2, p1, f1, d1, 1, i1);
    if (!i1.disableMultiStroke) {
        const t8 = F(M1, c1, l1, u2, p1, f1, d1, 1.5, i1);
        k1.push(...t8);
    }
    return r1 && (h1 ? k1.push(...z(c1, l1, c1 + u2 * Math.cos(f1), l1 + p1 * Math.sin(f1), i1), ...z(c1, l1, c1 + u2 * Math.cos(d1), l1 + p1 * Math.sin(d1), i1)) : k1.push({
        op: "lineTo",
        data: [
            c1,
            l1
        ]
    }, {
        op: "lineTo",
        data: [
            c1 + u2 * Math.cos(f1),
            l1 + p1 * Math.sin(f1)
        ]
    })), {
        type: "path",
        ops: k1
    };
}
function D(t7, e2) {
    const s2 = [];
    if (t7.length) {
        const n2 = e2.maxRandomnessOffset || 0, o2 = t7.length;
        if (o2 > 2) {
            s2.push({
                op: "move",
                data: [
                    t7[0][0] + W(n2, e2),
                    t7[0][1] + W(n2, e2)
                ]
            });
            for(let a1 = 1; a1 < o2; a1++)s2.push({
                op: "lineTo",
                data: [
                    t7[a1][0] + W(n2, e2),
                    t7[a1][1] + W(n2, e2)
                ]
            });
        }
    }
    return {
        type: "fillPath",
        ops: s2
    };
}
function _(t7, e2) {
    return (function(t8, e3) {
        let s2 = t8.fillStyle || "hachure";
        if (!d[s2]) switch(s2){
            case "zigzag":
                d[s2] || (d[s2] = new c(e3));
                break;
            case "cross-hatch":
                d[s2] || (d[s2] = new l(e3));
                break;
            case "dots":
                d[s2] || (d[s2] = new u1(e3));
                break;
            case "dashed":
                d[s2] || (d[s2] = new p1(e3));
                break;
            case "zigzag-line":
                d[s2] || (d[s2] = new f(e3));
                break;
            case "hachure":
            default:
                s2 = "hachure", d[s2] || (d[s2] = new i2(e3));
        }
        return d[s2];
    })(e2, x1).fillPolygon(t7, e2);
}
function C(t7) {
    return t7.randomizer || (t7.randomizer = new g1(t7.seed || 0)), t7.randomizer.next();
}
function E(t7, e2, s2, n2 = 1) {
    return s2.roughness * n2 * (C(s2) * (e2 - t7) + t7);
}
function W(t7, e2, s2 = 1) {
    return E(-t7, t7, e2, s2);
}
function z(t7, e2, s2, n2, o2, a1 = !1) {
    const r1 = a1 ? o2.disableMultiStrokeFill : o2.disableMultiStroke, h1 = R(t7, e2, s2, n2, o2, !0, !1);
    if (r1) return h1;
    const i1 = R(t7, e2, s2, n2, o2, !0, !0);
    return h1.concat(i1);
}
function R(t7, e2, s2, n2, o2, a1, r1) {
    const h1 = Math.pow(t7 - s2, 2) + Math.pow(e2 - n2, 2), i1 = Math.sqrt(h1);
    let c1 = 1;
    c1 = i1 < 200 ? 1 : i1 > 500 ? 0.4 : -0.0016668 * i1 + 1.233334;
    let l1 = o2.maxRandomnessOffset || 0;
    l1 * l1 * 100 > h1 && (l1 = i1 / 10);
    const u2 = l1 / 2, p1 = 0.2 + 0.2 * C(o2);
    let f1 = o2.bowing * o2.maxRandomnessOffset * (n2 - e2) / 200, d1 = o2.bowing * o2.maxRandomnessOffset * (t7 - s2) / 200;
    f1 = W(f1, o2, c1), d1 = W(d1, o2, c1);
    const g1 = [], M1 = ()=>W(u2, o2, c1)
    , k1 = ()=>W(l1, o2, c1)
    , b1 = o2.preserveVertices;
    return a1 && (r1 ? g1.push({
        op: "move",
        data: [
            t7 + (b1 ? 0 : M1()),
            e2 + (b1 ? 0 : M1())
        ]
    }) : g1.push({
        op: "move",
        data: [
            t7 + (b1 ? 0 : W(l1, o2, c1)),
            e2 + (b1 ? 0 : W(l1, o2, c1))
        ]
    })), r1 ? g1.push({
        op: "bcurveTo",
        data: [
            f1 + t7 + (s2 - t7) * p1 + M1(),
            d1 + e2 + (n2 - e2) * p1 + M1(),
            f1 + t7 + 2 * (s2 - t7) * p1 + M1(),
            d1 + e2 + 2 * (n2 - e2) * p1 + M1(),
            s2 + (b1 ? 0 : M1()),
            n2 + (b1 ? 0 : M1())
        ]
    }) : g1.push({
        op: "bcurveTo",
        data: [
            f1 + t7 + (s2 - t7) * p1 + k1(),
            d1 + e2 + (n2 - e2) * p1 + k1(),
            f1 + t7 + 2 * (s2 - t7) * p1 + k1(),
            d1 + e2 + 2 * (n2 - e2) * p1 + k1(),
            s2 + (b1 ? 0 : k1()),
            n2 + (b1 ? 0 : k1())
        ]
    }), g1;
}
function $(t7, e2, s2) {
    const n2 = [];
    n2.push([
        t7[0][0] + W(e2, s2),
        t7[0][1] + W(e2, s2)
    ]), n2.push([
        t7[0][0] + W(e2, s2),
        t7[0][1] + W(e2, s2)
    ]);
    for(let o2 = 1; o2 < t7.length; o2++)n2.push([
        t7[o2][0] + W(e2, s2),
        t7[o2][1] + W(e2, s2)
    ]), o2 === t7.length - 1 && n2.push([
        t7[o2][0] + W(e2, s2),
        t7[o2][1] + W(e2, s2)
    ]);
    return G(n2, null, s2);
}
function G(t7, e2, s2) {
    const n2 = t7.length, o2 = [];
    if (n2 > 3) {
        const a1 = [], r1 = 1 - s2.curveTightness;
        o2.push({
            op: "move",
            data: [
                t7[1][0],
                t7[1][1]
            ]
        });
        for(let e3 = 1; e3 + 2 < n2; e3++){
            const s3 = t7[e3];
            a1[0] = [
                s3[0],
                s3[1]
            ], a1[1] = [
                s3[0] + (r1 * t7[e3 + 1][0] - r1 * t7[e3 - 1][0]) / 6,
                s3[1] + (r1 * t7[e3 + 1][1] - r1 * t7[e3 - 1][1]) / 6
            ], a1[2] = [
                t7[e3 + 1][0] + (r1 * t7[e3][0] - r1 * t7[e3 + 2][0]) / 6,
                t7[e3 + 1][1] + (r1 * t7[e3][1] - r1 * t7[e3 + 2][1]) / 6
            ], a1[3] = [
                t7[e3 + 1][0],
                t7[e3 + 1][1]
            ], o2.push({
                op: "bcurveTo",
                data: [
                    a1[1][0],
                    a1[1][1],
                    a1[2][0],
                    a1[2][1],
                    a1[3][0],
                    a1[3][1]
                ]
            });
        }
        if (e2 && 2 === e2.length) {
            const t8 = s2.maxRandomnessOffset;
            o2.push({
                op: "lineTo",
                data: [
                    e2[0] + W(t8, s2),
                    e2[1] + W(t8, s2)
                ]
            });
        }
    } else 3 === n2 ? (o2.push({
        op: "move",
        data: [
            t7[1][0],
            t7[1][1]
        ]
    }), o2.push({
        op: "bcurveTo",
        data: [
            t7[1][0],
            t7[1][1],
            t7[2][0],
            t7[2][1],
            t7[2][0],
            t7[2][1]
        ]
    })) : 2 === n2 && o2.push(...z(t7[0][0], t7[0][1], t7[1][0], t7[1][1], s2));
    return o2;
}
function q(t7, e2, s2, n2, o2, a1, r1, h1) {
    const i1 = [], c1 = [], l1 = W(0.5, h1) - Math.PI / 2;
    c1.push([
        W(a1, h1) + e2 + 0.9 * n2 * Math.cos(l1 - t7),
        W(a1, h1) + s2 + 0.9 * o2 * Math.sin(l1 - t7)
    ]);
    for(let r2 = l1; r2 < 2 * Math.PI + l1 - 0.01; r2 += t7){
        const t8 = [
            W(a1, h1) + e2 + n2 * Math.cos(r2),
            W(a1, h1) + s2 + o2 * Math.sin(r2)
        ];
        i1.push(t8), c1.push(t8);
    }
    return c1.push([
        W(a1, h1) + e2 + n2 * Math.cos(l1 + 2 * Math.PI + 0.5 * r1),
        W(a1, h1) + s2 + o2 * Math.sin(l1 + 2 * Math.PI + 0.5 * r1)
    ]), c1.push([
        W(a1, h1) + e2 + 0.98 * n2 * Math.cos(l1 + r1),
        W(a1, h1) + s2 + 0.98 * o2 * Math.sin(l1 + r1)
    ]), c1.push([
        W(a1, h1) + e2 + 0.9 * n2 * Math.cos(l1 + 0.5 * r1),
        W(a1, h1) + s2 + 0.9 * o2 * Math.sin(l1 + 0.5 * r1)
    ]), [
        c1,
        i1
    ];
}
function F(t7, e2, s2, n2, o2, a1, r1, h1, i1) {
    const c1 = a1 + W(0.1, i1), l1 = [];
    l1.push([
        W(h1, i1) + e2 + 0.9 * n2 * Math.cos(c1 - t7),
        W(h1, i1) + s2 + 0.9 * o2 * Math.sin(c1 - t7)
    ]);
    for(let a2 = c1; a2 <= r1; a2 += t7)l1.push([
        W(h1, i1) + e2 + n2 * Math.cos(a2),
        W(h1, i1) + s2 + o2 * Math.sin(a2)
    ]);
    return l1.push([
        e2 + n2 * Math.cos(r1),
        s2 + o2 * Math.sin(r1)
    ]), l1.push([
        e2 + n2 * Math.cos(r1),
        s2 + o2 * Math.sin(r1)
    ]), G(l1, null, i1);
}
function V(t7, e2, s2, n2, o2, a1, r1, h1) {
    const i1 = [], c1 = [
        h1.maxRandomnessOffset || 1,
        (h1.maxRandomnessOffset || 1) + 0.3
    ];
    let l1 = [
        0,
        0
    ];
    const u2 = h1.disableMultiStroke ? 1 : 2, p1 = h1.preserveVertices;
    for(let f1 = 0; f1 < u2; f1++)0 === f1 ? i1.push({
        op: "move",
        data: [
            r1[0],
            r1[1]
        ]
    }) : i1.push({
        op: "move",
        data: [
            r1[0] + (p1 ? 0 : W(c1[0], h1)),
            r1[1] + (p1 ? 0 : W(c1[0], h1))
        ]
    }), l1 = p1 ? [
        o2,
        a1
    ] : [
        o2 + W(c1[f1], h1),
        a1 + W(c1[f1], h1)
    ], i1.push({
        op: "bcurveTo",
        data: [
            t7 + W(c1[f1], h1),
            e2 + W(c1[f1], h1),
            s2 + W(c1[f1], h1),
            n2 + W(c1[f1], h1),
            l1[0],
            l1[1]
        ]
    });
    return i1;
}
function j(t7) {
    return [
        ...t7
    ];
}
function N(t7, e2) {
    return Math.pow(t7[0] - e2[0], 2) + Math.pow(t7[1] - e2[1], 2);
}
function Z(t7, e2, s2) {
    const n2 = N(e2, s2);
    if (0 === n2) return N(t7, e2);
    let o2 = ((t7[0] - e2[0]) * (s2[0] - e2[0]) + (t7[1] - e2[1]) * (s2[1] - e2[1])) / n2;
    return o2 = Math.max(0, Math.min(1, o2)), N(t7, Q(e2, s2, o2));
}
function Q(t7, e2, s2) {
    return [
        t7[0] + (e2[0] - t7[0]) * s2,
        t7[1] + (e2[1] - t7[1]) * s2
    ];
}
function H(t7, e2, s2, n2) {
    const o2 = n2 || [];
    if ((function(t8, e3) {
        const s3 = t8[e3 + 0], n3 = t8[e3 + 1], o3 = t8[e3 + 2], a1 = t8[e3 + 3];
        let r1 = 3 * n3[0] - 2 * s3[0] - a1[0];
        r1 *= r1;
        let h1 = 3 * n3[1] - 2 * s3[1] - a1[1];
        h1 *= h1;
        let i1 = 3 * o3[0] - 2 * a1[0] - s3[0];
        i1 *= i1;
        let c1 = 3 * o3[1] - 2 * a1[1] - s3[1];
        return c1 *= c1, r1 < i1 && (r1 = i1), h1 < c1 && (h1 = c1), r1 + h1;
    })(t7, e2) < s2) {
        const s3 = t7[e2 + 0];
        if (o2.length) {
            (a2 = o2[o2.length - 1], r2 = s3, Math.sqrt(N(a2, r2))) > 1 && o2.push(s3);
        } else o2.push(s3);
        o2.push(t7[e2 + 3]);
    } else {
        const n3 = 0.5, a2 = t7[e2 + 0], r2 = t7[e2 + 1], h1 = t7[e2 + 2], i1 = t7[e2 + 3], c1 = Q(a2, r2, n3), l1 = Q(r2, h1, n3), u2 = Q(h1, i1, n3), p1 = Q(c1, l1, n3), f1 = Q(l1, u2, n3), d1 = Q(p1, f1, n3);
        H([
            a2,
            c1,
            p1,
            d1
        ], 0, s2, o2), H([
            d1,
            f1,
            u2,
            i1
        ], 0, s2, o2);
    }
    var a2, r2;
    return o2;
}
function B(t7, e2) {
    return X(t7, 0, t7.length, e2);
}
function X(t7, e2, s2, n2, o2) {
    const a2 = o2 || [], r2 = t7[e2], h1 = t7[s2 - 1];
    let i1 = 0, c1 = 1;
    for(let n3 = e2 + 1; n3 < s2 - 1; ++n3){
        const e3 = Z(t7[n3], r2, h1);
        e3 > i1 && (i1 = e3, c1 = n3);
    }
    return Math.sqrt(i1) > n2 ? (X(t7, e2, c1 + 1, n2, a2), X(t7, c1, s2, n2, a2)) : (a2.length || a2.push(r2), a2.push(h1)), a2;
}
function J(t7, e2 = 0.15, s2) {
    const n2 = [], o2 = (t7.length - 1) / 3;
    for(let s3 = 0; s3 < o2; s3++){
        H(t7, 3 * s3, e2, n2);
    }
    return s2 && s2 > 0 ? X(n2, 0, n2.length, s2) : n2;
}
const K = "none";
class U {
    constructor(t7){
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
            combineNestedSvgPaths: !1,
            disableMultiStroke: !1,
            disableMultiStrokeFill: !1,
            preserveVertices: !1
        }, this.config = t7 || {
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
    line(t, e, s, n, o) {
        const a2 = this._o(o);
        return this._d("line", [
            v2(t, e, s, n, a2)
        ], a2);
    }
    rectangle(t, e, s, n, o) {
        const a2 = this._o(o), r2 = [], h1 = S(t, e, s, n, a2);
        if (a2.fill) {
            const o2 = [
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
            "solid" === a2.fillStyle ? r2.push(D(o2, a2)) : r2.push(_(o2, a2));
        }
        return a2.stroke !== K && r2.push(h1), this._d("rectangle", r2, a2);
    }
    ellipse(t, e, s, n, o) {
        const a2 = this._o(o), r2 = [], h1 = T(s, n, a2), i1 = I(t, e, a2, h1);
        if (a2.fill) {
            if ("solid" === a2.fillStyle) {
                const s2 = I(t, e, a2, h1).opset;
                s2.type = "fillPath", r2.push(s2);
            } else r2.push(_(i1.estimatedPoints, a2));
        }
        return a2.stroke !== K && r2.push(i1.opset), this._d("ellipse", r2, a2);
    }
    circle(t, e, s, n) {
        const o2 = this.ellipse(t, e, s, s, n);
        return o2.shape = "circle", o2;
    }
    linearPath(t, e) {
        const s2 = this._o(e);
        return this._d("linearPath", [
            O(t, !1, s2)
        ], s2);
    }
    arc(t, e, s, n, o, a, r = !1, h) {
        const i1 = this._o(h), c1 = [], l1 = A(t, e, s, n, o, a, r, !0, i1);
        if (r && i1.fill) {
            if ("solid" === i1.fillStyle) {
                const r2 = A(t, e, s, n, o, a, !0, !1, i1);
                r2.type = "fillPath", c1.push(r2);
            } else c1.push(function(t8, e2, s2, n2, o2, a2, r2) {
                const h2 = t8, i2 = e2;
                let c2 = Math.abs(s2 / 2), l2 = Math.abs(n2 / 2);
                c2 += W(0.01 * c2, r2), l2 += W(0.01 * l2, r2);
                let u2 = o2, p1 = a2;
                for(; u2 < 0;)u2 += 2 * Math.PI, p1 += 2 * Math.PI;
                p1 - u2 > 2 * Math.PI && (u2 = 0, p1 = 2 * Math.PI);
                const f1 = (p1 - u2) / r2.curveStepCount, d1 = [];
                for(let t9 = u2; t9 <= p1; t9 += f1)d1.push([
                    h2 + c2 * Math.cos(t9),
                    i2 + l2 * Math.sin(t9)
                ]);
                return d1.push([
                    h2 + c2 * Math.cos(p1),
                    i2 + l2 * Math.sin(p1)
                ]), d1.push([
                    h2,
                    i2
                ]), _(d1, r2);
            }(t, e, s, n, o, a, i1));
        }
        return i1.stroke !== K && c1.push(l1), this._d("arc", c1, i1);
    }
    curve(t, e) {
        const s2 = this._o(e), n2 = [], o2 = L(t, s2);
        if (s2.fill && s2.fill !== K && t.length >= 3) {
            const e2 = J(function(t8, e3 = 0) {
                const s3 = t8.length;
                if (s3 < 3) throw new Error("A curve must have at least three points.");
                const n3 = [];
                if (3 === s3) n3.push(j(t8[0]), j(t8[1]), j(t8[2]), j(t8[2]));
                else {
                    const s4 = [];
                    s4.push(t8[0], t8[0]);
                    for(let e4 = 1; e4 < t8.length; e4++)s4.push(t8[e4]), e4 === t8.length - 1 && s4.push(t8[e4]);
                    const o3 = [], a2 = 1 - e3;
                    n3.push(j(s4[0]));
                    for(let t9 = 1; t9 + 2 < s4.length; t9++){
                        const e5 = s4[t9];
                        o3[0] = [
                            e5[0],
                            e5[1]
                        ], o3[1] = [
                            e5[0] + (a2 * s4[t9 + 1][0] - a2 * s4[t9 - 1][0]) / 6,
                            e5[1] + (a2 * s4[t9 + 1][1] - a2 * s4[t9 - 1][1]) / 6
                        ], o3[2] = [
                            s4[t9 + 1][0] + (a2 * s4[t9][0] - a2 * s4[t9 + 2][0]) / 6,
                            s4[t9 + 1][1] + (a2 * s4[t9][1] - a2 * s4[t9 + 2][1]) / 6
                        ], o3[3] = [
                            s4[t9 + 1][0],
                            s4[t9 + 1][1]
                        ], n3.push(o3[1], o3[2], o3[3]);
                    }
                }
                return n3;
            }(t), 10, (1 + s2.roughness) / 2);
            "solid" === s2.fillStyle ? n2.push(D(e2, s2)) : n2.push(_(e2, s2));
        }
        return s2.stroke !== K && n2.push(o2), this._d("curve", n2, s2);
    }
    polygon(t, e) {
        const s2 = this._o(e), n2 = [], o2 = O(t, !0, s2);
        return s2.fill && ("solid" === s2.fillStyle ? n2.push(D(t, s2)) : n2.push(_(t, s2))), s2.stroke !== K && n2.push(o2), this._d("polygon", n2, s2);
    }
    path(t, e) {
        const s2 = this._o(e), n2 = [];
        if (!t) return this._d("path", n2, s2);
        t = (t || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
        const o2 = s2.fill && "transparent" !== s2.fill && s2.fill !== K, a2 = s2.stroke !== K, r2 = !!(s2.simplification && s2.simplification < 1), h2 = function(t8, e2, s3) {
            const n3 = m1(y1(b1(t8))), o3 = [];
            let a3 = [], r3 = [
                0,
                0
            ], h3 = [];
            const i1 = ()=>{
                h3.length >= 4 && a3.push(...J(h3, e2)), h3 = [];
            }, c1 = ()=>{
                i1(), a3.length && (o3.push(a3), a3 = []);
            };
            for (const { key: t9 , data: e3  } of n3)switch(t9){
                case "M":
                    c1(), r3 = [
                        e3[0],
                        e3[1]
                    ], a3.push(r3);
                    break;
                case "L":
                    i1(), a3.push([
                        e3[0],
                        e3[1]
                    ]);
                    break;
                case "C":
                    if (!h3.length) {
                        const t10 = a3.length ? a3[a3.length - 1] : r3;
                        h3.push([
                            t10[0],
                            t10[1]
                        ]);
                    }
                    h3.push([
                        e3[0],
                        e3[1]
                    ]), h3.push([
                        e3[2],
                        e3[3]
                    ]), h3.push([
                        e3[4],
                        e3[5]
                    ]);
                    break;
                case "Z":
                    i1(), a3.push([
                        r3[0],
                        r3[1]
                    ]);
            }
            if (c1(), !s3) return o3;
            const l1 = [];
            for (const t10 of o3){
                const e4 = B(t10, s3);
                e4.length && l1.push(e4);
            }
            return l1;
        }(t, 1, r2 ? 4 - 4 * s2.simplification : (1 + s2.roughness) / 2);
        if (o2) {
            if (s2.combineNestedSvgPaths) {
                const t8 = [];
                h2.forEach((e2)=>t8.push(...e2)
                ), "solid" === s2.fillStyle ? n2.push(D(t8, s2)) : n2.push(_(t8, s2));
            } else h2.forEach((t8)=>{
                "solid" === s2.fillStyle ? n2.push(D(t8, s2)) : n2.push(_(t8, s2));
            });
        }
        return a2 && (r2 ? h2.forEach((t8)=>{
            n2.push(O(t8, !1, s2));
        }) : n2.push(function(t8, e2) {
            const s3 = m1(y1(b1(t8))), n3 = [];
            let o3 = [
                0,
                0
            ], a3 = [
                0,
                0
            ];
            for (const { key: t9 , data: r3  } of s3)switch(t9){
                case "M":
                    {
                        const t10 = 1 * (e2.maxRandomnessOffset || 0), s4 = e2.preserveVertices;
                        n3.push({
                            op: "move",
                            data: r3.map((n4)=>n4 + (s4 ? 0 : W(t10, e2))
                            )
                        }), a3 = [
                            r3[0],
                            r3[1]
                        ], o3 = [
                            r3[0],
                            r3[1]
                        ];
                        break;
                    }
                case "L":
                    n3.push(...z(a3[0], a3[1], r3[0], r3[1], e2)), a3 = [
                        r3[0],
                        r3[1]
                    ];
                    break;
                case "C":
                    {
                        const [t10, s4, o4, h3, i1, c1] = r3;
                        n3.push(...V(t10, s4, o4, h3, i1, c1, a3, e2)), a3 = [
                            i1,
                            c1
                        ];
                        break;
                    }
                case "Z":
                    n3.push(...z(a3[0], a3[1], o3[0], o3[1], e2)), a3 = [
                        o3[0],
                        o3[1]
                    ];
            }
            return {
                type: "path",
                ops: n3
            };
        }(t, s2))), this._d("path", n2, s2);
    }
    opsToPath(t, e) {
        let s2 = "";
        for (const n2 of t.ops){
            const t8 = "number" == typeof e && e >= 0 ? n2.data.map((t9)=>+t9.toFixed(e)
            ) : n2.data;
            switch(n2.op){
                case "move":
                    s2 += `M${t8[0]} ${t8[1]} `;
                    break;
                case "bcurveTo":
                    s2 += `C${t8[0]} ${t8[1]}, ${t8[2]} ${t8[3]}, ${t8[4]} ${t8[5]} `;
                    break;
                case "lineTo":
                    s2 += `L${t8[0]} ${t8[1]} `;
            }
        }
        return s2.trim();
    }
    toPaths(t) {
        const e2 = t.sets || [], s2 = t.options || this.defaultOptions, n2 = [];
        for (const t8 of e2){
            let e3 = null;
            switch(t8.type){
                case "path":
                    e3 = {
                        d: this.opsToPath(t8),
                        stroke: s2.stroke,
                        strokeWidth: s2.strokeWidth,
                        fill: K
                    };
                    break;
                case "fillPath":
                    e3 = {
                        d: this.opsToPath(t8),
                        stroke: K,
                        strokeWidth: 0,
                        fill: s2.fill || K
                    };
                    break;
                case "fillSketch":
                    e3 = this.fillSketch(t8, s2);
            }
            e3 && n2.push(e3);
        }
        return n2;
    }
    fillSketch(t, e) {
        let s2 = e.fillWeight;
        return s2 < 0 && (s2 = e.strokeWidth / 2), {
            d: this.opsToPath(t),
            stroke: e.fill || K,
            strokeWidth: s2,
            fill: K
        };
    }
}
class Y {
    constructor(t8, e2){
        this.canvas = t8, this.ctx = this.canvas.getContext("2d"), this.gen = new U(e2);
    }
    draw(t) {
        const e3 = t.sets || [], s2 = t.options || this.getDefaultOptions(), n2 = this.ctx;
        for (const o2 of e3)switch(o2.type){
            case "path":
                n2.save(), n2.strokeStyle = "none" === s2.stroke ? "transparent" : s2.stroke, n2.lineWidth = s2.strokeWidth, s2.strokeLineDash && n2.setLineDash(s2.strokeLineDash), s2.strokeLineDashOffset && (n2.lineDashOffset = s2.strokeLineDashOffset), this._drawToContext(n2, o2), n2.restore();
                break;
            case "fillPath":
                n2.save(), n2.fillStyle = s2.fill || "";
                const e3 = "curve" === t.shape || "polygon" === t.shape ? "evenodd" : "nonzero";
                this._drawToContext(n2, o2, e3), n2.restore();
                break;
            case "fillSketch":
                this.fillSketch(n2, o2, s2);
        }
    }
    fillSketch(t, e, s) {
        let n2 = s.fillWeight;
        n2 < 0 && (n2 = s.strokeWidth / 2), t.save(), s.fillLineDash && t.setLineDash(s.fillLineDash), s.fillLineDashOffset && (t.lineDashOffset = s.fillLineDashOffset), t.strokeStyle = s.fill || "", t.lineWidth = n2, this._drawToContext(t, e), t.restore();
    }
    _drawToContext(t, e, s = "nonzero") {
        t.beginPath();
        for (const s2 of e.ops){
            const e3 = s2.data;
            switch(s2.op){
                case "move":
                    t.moveTo(e3[0], e3[1]);
                    break;
                case "bcurveTo":
                    t.bezierCurveTo(e3[0], e3[1], e3[2], e3[3], e3[4], e3[5]);
                    break;
                case "lineTo":
                    t.lineTo(e3[0], e3[1]);
            }
        }
        "fillPath" === e.type ? t.fill(s) : t.stroke();
    }
    get generator() {
        return this.gen;
    }
    getDefaultOptions() {
        return this.gen.defaultOptions;
    }
    line(t, e, s, n, o) {
        const a2 = this.gen.line(t, e, s, n, o);
        return this.draw(a2), a2;
    }
    rectangle(t, e, s, n, o) {
        const a2 = this.gen.rectangle(t, e, s, n, o);
        return this.draw(a2), a2;
    }
    ellipse(t, e, s, n, o) {
        const a2 = this.gen.ellipse(t, e, s, n, o);
        return this.draw(a2), a2;
    }
    circle(t, e, s, n) {
        const o2 = this.gen.circle(t, e, s, n);
        return this.draw(o2), o2;
    }
    linearPath(t, e) {
        const s2 = this.gen.linearPath(t, e);
        return this.draw(s2), s2;
    }
    polygon(t, e) {
        const s2 = this.gen.polygon(t, e);
        return this.draw(s2), s2;
    }
    arc(t, e, s, n, o, a, r = !1, h) {
        const i1 = this.gen.arc(t, e, s, n, o, a, r, h);
        return this.draw(i1), i1;
    }
    curve(t, e) {
        const s2 = this.gen.curve(t, e);
        return this.draw(s2), s2;
    }
    path(t, e) {
        const s2 = this.gen.path(t, e);
        return this.draw(s2), s2;
    }
}
const tt = "http://www.w3.org/2000/svg";
class et {
    constructor(t9, e3){
        this.svg = t9, this.gen = new U(e3);
    }
    draw(t) {
        const e4 = t.sets || [], s2 = t.options || this.getDefaultOptions(), n2 = this.svg.ownerDocument || window.document, o2 = n2.createElementNS(tt, "g"), a2 = t.options.fixedDecimalPlaceDigits;
        for (const r2 of e4){
            let e5 = null;
            switch(r2.type){
                case "path":
                    e5 = n2.createElementNS(tt, "path"), e5.setAttribute("d", this.opsToPath(r2, a2)), e5.setAttribute("stroke", s2.stroke), e5.setAttribute("stroke-width", s2.strokeWidth + ""), e5.setAttribute("fill", "none"), s2.strokeLineDash && e5.setAttribute("stroke-dasharray", s2.strokeLineDash.join(" ").trim()), s2.strokeLineDashOffset && e5.setAttribute("stroke-dashoffset", `${s2.strokeLineDashOffset}`);
                    break;
                case "fillPath":
                    e5 = n2.createElementNS(tt, "path"), e5.setAttribute("d", this.opsToPath(r2, a2)), e5.setAttribute("stroke", "none"), e5.setAttribute("stroke-width", "0"), e5.setAttribute("fill", s2.fill || ""), "curve" !== t.shape && "polygon" !== t.shape || e5.setAttribute("fill-rule", "evenodd");
                    break;
                case "fillSketch":
                    e5 = this.fillSketch(n2, r2, s2);
            }
            e5 && o2.appendChild(e5);
        }
        return o2;
    }
    fillSketch(t, e, s) {
        let n2 = s.fillWeight;
        n2 < 0 && (n2 = s.strokeWidth / 2);
        const o2 = t.createElementNS(tt, "path");
        return o2.setAttribute("d", this.opsToPath(e, s.fixedDecimalPlaceDigits)), o2.setAttribute("stroke", s.fill || ""), o2.setAttribute("stroke-width", n2 + ""), o2.setAttribute("fill", "none"), s.fillLineDash && o2.setAttribute("stroke-dasharray", s.fillLineDash.join(" ").trim()), s.fillLineDashOffset && o2.setAttribute("stroke-dashoffset", `${s.fillLineDashOffset}`), o2;
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
    line(t, e, s, n, o) {
        const a2 = this.gen.line(t, e, s, n, o);
        return this.draw(a2);
    }
    rectangle(t, e, s, n, o) {
        const a2 = this.gen.rectangle(t, e, s, n, o);
        return this.draw(a2);
    }
    ellipse(t, e, s, n, o) {
        const a2 = this.gen.ellipse(t, e, s, n, o);
        return this.draw(a2);
    }
    circle(t, e, s, n) {
        const o2 = this.gen.circle(t, e, s, n);
        return this.draw(o2);
    }
    linearPath(t, e) {
        const s2 = this.gen.linearPath(t, e);
        return this.draw(s2);
    }
    polygon(t, e) {
        const s2 = this.gen.polygon(t, e);
        return this.draw(s2);
    }
    arc(t, e, s, n, o, a, r = !1, h) {
        const i1 = this.gen.arc(t, e, s, n, o, a, r, h);
        return this.draw(i1);
    }
    curve(t, e) {
        const s2 = this.gen.curve(t, e);
        return this.draw(s2);
    }
    path(t, e) {
        const s2 = this.gen.path(t, e);
        return this.draw(s2);
    }
}
var st = {
    canvas: (t10, e4)=>new Y(t10, e4)
    ,
    svg: (t10, e4)=>new et(t10, e4)
    ,
    generator: (t10)=>new U(t10)
    ,
    newSeed: ()=>U.newSeed()
};
const isCEPolyfill = typeof window !== 'undefined' && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== undefined;
const reparentNodes = (container, start, end = null, before = null)=>{
    while(start !== end){
        const n2 = start.nextSibling;
        container.insertBefore(start, before);
        start = n2;
    }
};
const removeNodes = (container, start, end = null)=>{
    while(start !== end){
        const n2 = start.nextSibling;
        container.removeChild(start);
        start = n2;
    }
};
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
const boundAttributeSuffix = '$lit$';
class Template {
    constructor(result, element5){
        this.parts = [];
        this.element = element5;
        const nodesToRemove = [];
        const stack = [];
        const walker = document.createTreeWalker(element5.content, 133, null, false);
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings: strings5 , values: { length  }  } = result;
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
                    const { length: length1  } = attributes;
                    let count = 0;
                    for(let i1 = 0; i1 < length1; i1++){
                        if (endsWith(attributes[i1].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while((count--) > 0){
                        const stringForPart = strings5[partIndex];
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
                    const strings1 = data.split(markerRegex);
                    const lastIndex = strings1.length - 1;
                    for(let i1 = 0; i1 < lastIndex; i1++){
                        let insert;
                        let s2 = strings1[i1];
                        if (s2 === '') {
                            insert = createMarker();
                        } else {
                            const match = lastAttributeNameRegex.exec(s2);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s2 = s2.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s2);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({
                            type: 'node',
                            index: ++index
                        });
                    }
                    if (strings1[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    } else {
                        node.data = strings1[lastIndex];
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
                    let i1 = -1;
                    while((i1 = node.data.indexOf(marker, i1 + 1)) !== -1){
                        this.parts.push({
                            type: 'node',
                            index: -1
                        });
                        partIndex++;
                    }
                }
            }
        }
        for (const n2 of nodesToRemove){
            n2.parentNode.removeChild(n2);
        }
    }
}
const endsWith = (str, suffix)=>{
    const index1 = str.length - suffix.length;
    return index1 >= 0 && str.slice(index1) === suffix;
};
const isTemplatePartActive = (part)=>part.index !== -1
;
const createMarker = ()=>document.createComment('')
;
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
function removeNodesFromTemplate(template, nodesToRemove1) {
    const { element: { content  } , parts  } = template;
    const walker1 = document.createTreeWalker(content, 133, null, false);
    let partIndex1 = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex1];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while(walker1.nextNode()){
        nodeIndex++;
        const node = walker1.currentNode;
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        if (nodesToRemove1.has(node)) {
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
            partIndex1 = nextActiveIndexInTemplateParts(parts, partIndex1);
            part = parts[partIndex1];
        }
    }
    nodesToRemoveInTemplate.forEach((n3)=>n3.parentNode.removeChild(n3)
    );
}
const countNodes = (node)=>{
    let count = node.nodeType === 11 ? 0 : 1;
    const walker1 = document.createTreeWalker(node, 133, null, false);
    while(walker1.nextNode()){
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1)=>{
    for(let i1 = startIndex + 1; i1 < parts.length; i1++){
        const part = parts[i1];
        if (isTemplatePartActive(part)) {
            return i1;
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
    const walker1 = document.createTreeWalker(content, 133, null, false);
    let partIndex1 = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while(walker1.nextNode()){
        walkerIndex++;
        const walkerNode = walker1.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while(partIndex1 !== -1 && parts[partIndex1].index === walkerIndex){
            if (insertCount > 0) {
                while(partIndex1 !== -1){
                    parts[partIndex1].index += insertCount;
                    partIndex1 = nextActiveIndexInTemplateParts(parts, partIndex1);
                }
                return;
            }
            partIndex1 = nextActiveIndexInTemplateParts(parts, partIndex1);
        }
    }
}
const directives = new WeakMap();
const directive = (f1)=>(...args)=>{
        const d1 = f1(...args);
        directives.set(d1, true);
        return d1;
    }
;
const isDirective = (o2)=>{
    return typeof o2 === 'function' && directives.has(o2);
};
const noChange = {
};
const nothing = {
};
class TemplateInstance {
    constructor(template, processor, options2){
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options2;
    }
    update(values) {
        let i1 = 0;
        for (const part of this.__parts){
            if (part !== undefined) {
                part.setValue(values[i1]);
            }
            i1++;
        }
        for (const part1 of this.__parts){
            if (part1 !== undefined) {
                part1.commit();
            }
        }
    }
    _clone() {
        const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
        const stack1 = [];
        const parts = this.template.parts;
        const walker1 = document.createTreeWalker(fragment, 133, null, false);
        let partIndex1 = 0;
        let nodeIndex = 0;
        let part;
        let node = walker1.nextNode();
        while(partIndex1 < parts.length){
            part = parts[partIndex1];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex1++;
                continue;
            }
            while(nodeIndex < part.index){
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack1.push(node);
                    walker1.currentNode = node.content;
                }
                if ((node = walker1.nextNode()) === null) {
                    walker1.currentNode = stack1.pop();
                    node = walker1.nextNode();
                }
            }
            if (part.type === 'node') {
                const part1 = this.processor.handleTextExpression(this.options);
                part1.insertAfterNode(node.previousSibling);
                this.__parts.push(part1);
            } else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex1++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}
const policy = window.trustedTypes && trustedTypes.createPolicy('lit-html', {
    createHTML: (s2)=>s2
});
const commentMarker = ` ${marker} `;
class TemplateResult {
    constructor(strings1, values, type1, processor1){
        this.strings = strings1;
        this.values = values;
        this.type = type1;
        this.processor = processor1;
    }
    getHTML() {
        const l1 = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for(let i1 = 0; i1 < l1; i1++){
            const s2 = this.strings[i1];
            const commentOpen = s2.lastIndexOf('<!--');
            isCommentBinding = (commentOpen > -1 || isCommentBinding) && s2.indexOf('-->', commentOpen + 1) === -1;
            const attributeMatch = lastAttributeNameRegex.exec(s2);
            if (attributeMatch === null) {
                html += s2 + (isCommentBinding ? commentMarker : nodeMarker);
            } else {
                html += s2.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
            }
        }
        html += this.strings[l1];
        return html;
    }
    getTemplateElement() {
        const template1 = document.createElement('template');
        let value = this.getHTML();
        if (policy !== undefined) {
            value = policy.createHTML(value);
        }
        template1.innerHTML = value;
        return template1;
    }
}
class SVGTemplateResult extends TemplateResult {
    getHTML() {
        return `<svg>${super.getHTML()}</svg>`;
    }
    getTemplateElement() {
        const template1 = super.getTemplateElement();
        const content = template1.content;
        const svgElement = content.firstChild;
        content.removeChild(svgElement);
        reparentNodes(content, svgElement.firstChild);
        return template1;
    }
}
const isPrimitive = (value)=>{
    return value === null || !(typeof value === 'object' || typeof value === 'function');
};
const isIterable = (value)=>{
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};
class AttributeCommitter {
    constructor(element1, name3, strings2){
        this.dirty = true;
        this.element = element1;
        this.name = name3;
        this.strings = strings2;
        this.parts = [];
        for(let i1 = 0; i1 < strings2.length - 1; i1++){
            this.parts[i1] = this._createPart();
        }
    }
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings3 = this.strings;
        const l1 = strings3.length - 1;
        const parts = this.parts;
        if (l1 === 1 && strings3[0] === '' && strings3[1] === '') {
            const v1 = parts[0].value;
            if (typeof v1 === 'symbol') {
                return String(v1);
            }
            if (typeof v1 === 'string' || !isIterable(v1)) {
                return v1;
            }
        }
        let text = '';
        for(let i2 = 0; i2 < l1; i2++){
            text += strings3[i2];
            const part = parts[i2];
            if (part !== undefined) {
                const v1 = part.value;
                if (isPrimitive(v1) || !isIterable(v1)) {
                    text += typeof v1 === 'string' ? v1 : String(v1);
                } else {
                    for (const t10 of v1){
                        text += typeof t10 === 'string' ? t10 : String(t10);
                    }
                }
            }
        }
        text += strings3[l1];
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
            const directive1 = this.value;
            this.value = noChange;
            directive1(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
class NodePart {
    constructor(options1){
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options1;
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
            const directive1 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive1(this);
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
        const template1 = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance && this.value.template === template1) {
            this.value.update(value.values);
        } else {
            const instance = new TemplateInstance(template1, value.processor, this.options);
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
        let partIndex1 = 0;
        let itemPart;
        for (const item of value){
            itemPart = itemParts[partIndex1];
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex1 === 0) {
                    itemPart.appendIntoPart(this);
                } else {
                    itemPart.insertAfterPart(itemParts[partIndex1 - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex1++;
        }
        if (partIndex1 < itemParts.length) {
            itemParts.length = partIndex1;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
class BooleanAttributePart {
    constructor(element2, name1, strings3){
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings3.length !== 2 || strings3[0] !== '' || strings3[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element2;
        this.name = name1;
        this.strings = strings3;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while(isDirective(this.__pendingValue)){
            const directive1 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive1(this);
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
    constructor(element3, name2, strings4){
        super(element3, name2, strings4);
        this.single = strings4.length === 2 && strings4[0] === '' && strings4[1] === '';
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
        const options2 = {
            get capture () {
                eventOptionsSupported = true;
                return false;
            }
        };
        window.addEventListener('test', options2, options2);
        window.removeEventListener('test', options2, options2);
    } catch (_e) {
    }
})();
class EventPart {
    constructor(element4, eventName, eventContext){
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element4;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e4)=>this.handleEvent(e4)
        ;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while(isDirective(this.__pendingValue)){
            const directive1 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive1(this);
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
const getOptions = (o2)=>o2 && (eventOptionsSupported ? {
        capture: o2.capture,
        passive: o2.passive,
        once: o2.once
    } : o2.capture)
;
function templateFactory(result1) {
    let templateCache = templateCaches.get(result1.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result1.type, templateCache);
    }
    let template1 = templateCache.stringsArray.get(result1.strings);
    if (template1 !== undefined) {
        return template1;
    }
    const key = result1.strings.join(marker);
    template1 = templateCache.keyString.get(key);
    if (template1 === undefined) {
        template1 = new Template(result1, result1.getTemplateElement());
        templateCache.keyString.set(key, template1);
    }
    templateCache.stringsArray.set(result1.strings, template1);
    return template1;
}
const templateCaches = new Map();
const parts = new WeakMap();
const render = (result1, container, options2)=>{
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({
            templateFactory
        }, options2)));
        part.appendInto(container);
    }
    part.setValue(result1);
    part.commit();
};
class DefaultTemplateProcessor {
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer1 = new PropertyCommitter(element, name.slice(1), strings);
            return committer1.parts;
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
        const committer1 = new AttributeCommitter(element, name, strings);
        return committer1.parts;
    }
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.4.1');
}
const html1 = (strings6, ...values1)=>new TemplateResult(strings6, values1, 'html', defaultTemplateProcessor)
;
const svg1 = (strings6, ...values1)=>new SVGTemplateResult(strings6, values1, 'svg', defaultTemplateProcessor)
;
const getTemplateCacheKey = (type1, scopeName)=>`${type1}--${scopeName}`
;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
} else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected. ` + `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` + `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
const shadyTemplateFactory = (scopeName)=>(result1)=>{
        const cacheKey = getTemplateCacheKey(result1.type, scopeName);
        let templateCache = templateCaches.get(cacheKey);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(cacheKey, templateCache);
        }
        let template1 = templateCache.stringsArray.get(result1.strings);
        if (template1 !== undefined) {
            return template1;
        }
        const key = result1.strings.join(marker);
        template1 = templateCache.keyString.get(key);
        if (template1 === undefined) {
            const element6 = result1.getTemplateElement();
            if (compatibleShadyCSSVersion) {
                window.ShadyCSS.prepareTemplateDom(element6, scopeName);
            }
            template1 = new Template(result1, element6);
            templateCache.keyString.set(key, template1);
        }
        templateCache.stringsArray.set(result1.strings, template1);
        return template1;
    }
;
const TEMPLATE_TYPES = [
    'html',
    'svg'
];
const removeStylesFromLitTemplates = (scopeName)=>{
    TEMPLATE_TYPES.forEach((type1)=>{
        const templates = templateCaches.get(getTemplateCacheKey(type1, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach((template1)=>{
                const { element: { content  }  } = template1;
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s2)=>{
                    styles.add(s2);
                });
                removeNodesFromTemplate(template1, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
const prepareTemplateStyles = (scopeName, renderedDOM, template1)=>{
    shadyRenderSet.add(scopeName);
    const templateElement = !!template1 ? template1.element : document.createElement('template');
    const styles = renderedDOM.querySelectorAll('style');
    const { length: length1  } = styles;
    if (length1 === 0) {
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    for(let i2 = 0; i2 < length1; i2++){
        const style = styles[i2];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    removeStylesFromLitTemplates(scopeName);
    const content = templateElement.content;
    if (!!template1) {
        insertNodeIntoTemplate(template1, condensedStyle, content.firstChild);
    } else {
        content.insertBefore(condensedStyle, content.firstChild);
    }
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    const style = content.querySelector('style');
    if (window.ShadyCSS.nativeShadow && style !== null) {
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    } else if (!!template1) {
        content.insertBefore(condensedStyle, content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template1, removes);
    }
};
const render1 = (result1, container, options3)=>{
    if (!options3 || typeof options3 !== 'object' || !options3.scopeName) {
        throw new Error('The `scopeName` option is required.');
    }
    const scopeName = options3.scopeName;
    const hasRendered = parts.has(container);
    const needsScoping = compatibleShadyCSSVersion && container.nodeType === 11 && !!container.host;
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    render(result1, renderContainer, Object.assign({
        templateFactory: shadyTemplateFactory(scopeName)
    }, options3));
    if (firstScopeRender) {
        const part = parts.get(renderContainer);
        parts.delete(renderContainer);
        const template1 = part.value instanceof TemplateInstance ? part.value.template : undefined;
        prepareTemplateStyles(scopeName, renderContainer, template1);
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
        this._classProperties.forEach((v1, p1)=>{
            const attr = this._attributeNameForProperty(p1, v1);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p1);
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
                superProperties.forEach((v1, k1)=>this._classProperties.set(k1, v1)
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
            for (const p1 of propKeys){
                this.createProperty(p1, props[p1]);
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
        const type2 = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = typeof converter === 'function' ? converter : converter.fromAttribute;
        return fromAttribute ? fromAttribute(value, type2) : value;
    }
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type2 = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute || defaultConverter.toAttribute;
        return toAttribute(value, type2);
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
        this.constructor._classProperties.forEach((_v, p1)=>{
            if (this.hasOwnProperty(p1)) {
                const value = this[p1];
                delete this[p1];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p1, value);
            }
        });
    }
    _applyInstanceProperties() {
        this._instanceProperties.forEach((v1, p1)=>this[p1] = v1
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
            const options3 = ctor.getPropertyOptions(propName);
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] = ctor._propertyValueFromAttribute(value, options3);
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
        } catch (e4) {
        }
        const result1 = this.performUpdate();
        if (result1 != null) {
            await result1;
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
        } catch (e4) {
            shouldUpdate = false;
            this._markUpdated();
            throw e4;
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
            this._reflectingProperties.forEach((v1, k1)=>this._propertyToAttribute(k1, this[k1], v1)
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
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`);
    }
};
const css1 = (strings6, ...values1)=>{
    const cssText1 = values1.reduce((acc, v1, idx)=>acc + textFromCSSResult(v1) + strings6[idx + 1]
    , strings6[0]);
    return new CSSResult(cssText1, constructionToken);
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
const standardProperty = (options3, element6)=>{
    if (element6.kind === 'method' && element6.descriptor && !('value' in element6.descriptor)) {
        return Object.assign(Object.assign({
        }, element6), {
            finisher (clazz) {
                clazz.createProperty(element6.key, options3);
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
                if (typeof element6.initializer === 'function') {
                    this[element6.key] = element6.initializer.call(this);
                }
            },
            finisher (clazz) {
                clazz.createProperty(element6.key, options3);
            }
        };
    }
};
const legacyProperty = (options3, proto, name4)=>{
    proto.constructor.createProperty(name4, options3);
};
function property(options3) {
    return (protoOrDescriptor, name4)=>name4 !== undefined ? legacyProperty(options3, protoOrDescriptor, name4) : standardProperty(options3, protoOrDescriptor)
    ;
}
function query(selector, cache) {
    return (protoOrDescriptor, name4)=>{
        const descriptor = {
            get () {
                return this.renderRoot.querySelector(selector);
            },
            enumerable: true,
            configurable: true
        };
        if (cache) {
            const prop = name4 !== undefined ? name4 : protoOrDescriptor.key;
            const key = typeof prop === 'symbol' ? Symbol() : `__${prop}`;
            descriptor.get = function() {
                if (this[key] === undefined) {
                    this[key] = this.renderRoot.querySelector(selector);
                }
                return this[key];
            };
        }
        return name4 !== undefined ? legacyQuery(descriptor, protoOrDescriptor, name4) : standardQuery(descriptor, protoOrDescriptor);
    };
}
const legacyQuery = (descriptor, proto, name4)=>{
    Object.defineProperty(proto, name4, descriptor);
};
const standardQuery = (descriptor, element6)=>({
        kind: 'method',
        placement: 'prototype',
        key: element6.key,
        descriptor
    })
;
const standardEventOptions = (options3, element6)=>{
    return Object.assign(Object.assign({
    }, element6), {
        finisher (clazz) {
            Object.assign(clazz.prototype[element6.key], options3);
        }
    });
};
const legacyEventOptions = (options3, proto, name4)=>{
    Object.assign(proto[name4], options3);
};
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
            const addStyles = (styles, set)=>styles.reduceRight((set1, s2)=>Array.isArray(s2) ? addStyles(s2, set1) : (set1.add(s2), set1)
                , set)
            ;
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach((v1)=>styles.unshift(v1)
            );
            this._styles = styles;
        } else {
            this._styles = userStyles === undefined ? [] : [
                userStyles
            ];
        }
        this._styles = this._styles.map((s2)=>{
            if (s2 instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
                const cssText1 = Array.prototype.slice.call(s2.cssRules).reduce((css1, rule)=>css1 + rule.cssText
                , '');
                return unsafeCSS(cssText1);
            }
            return s2;
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
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s2)=>s2.cssText
            ), this.localName);
        } else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets = styles.map((s2)=>s2 instanceof CSSStyleSheet ? s2 : s2.styleSheet
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
            this.constructor._styles.forEach((s2)=>{
                const style = document.createElement('style');
                style.textContent = s2.cssText;
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
    var c1 = arguments.length, r2 = c1 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d1;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r2 = Reflect.decorate(decorators, target, key, desc);
    else for(var i2 = decorators.length - 1; i2 >= 0; i2--)if (d1 = decorators[i2]) r2 = (c1 < 3 ? d1(r2) : c1 > 3 ? d1(target, key, r2) : d1(target, key)) || r2;
    return (c1 > 3 && r2 && Object.defineProperty(target, key, r2), r2);
};
var __metadata = this && this.__metadata || function(k1, v1) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k1, v1);
};
const BaseCSS = css1`\n:host {\n  opacity: 0;\n}\n:host(.wired-rendered) {\n  opacity: 1;\n}\n#overlay {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  pointer-events: none;\n}\nsvg {\n  display: block;\n}\npath {\n  stroke: currentColor;\n  stroke-width: 0.7;\n  fill: transparent;\n}\n.hidden {\n  display: none !important;\n}\n`;
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
function fire(element6, name4, detail, bubbles = true, composed = true) {
    if (name4) {
        const init = {
            bubbles: typeof bubbles === 'boolean' ? bubbles : true,
            composed: typeof composed === 'boolean' ? composed : true
        };
        if (detail) {
            init.detail = detail;
        }
        element6.dispatchEvent(new CustomEvent(name4, init));
    }
}
function t10(t11, n3, e4) {
    if (t11 && t11.length) {
        const [o2, s2] = n3, r2 = Math.PI / 180 * e4, i2 = Math.cos(r2), a2 = Math.sin(r2);
        t11.forEach((t12)=>{
            const [n4, e5] = t12;
            t12[0] = (n4 - o2) * i2 - (e5 - s2) * a2 + o2, t12[1] = (n4 - o2) * a2 + (e5 - s2) * i2 + s2;
        });
    }
}
function n3(t11) {
    const n4 = t11[0], e4 = t11[1];
    return Math.sqrt(Math.pow(n4[0] - e4[0], 2) + Math.pow(n4[1] - e4[1], 2));
}
function e4(t11, n4, e5, o2) {
    const s2 = n4[1] - t11[1], r2 = t11[0] - n4[0], i2 = s2 * t11[0] + r2 * t11[1], a2 = o2[1] - e5[1], c1 = e5[0] - o2[0], h2 = a2 * e5[0] + c1 * e5[1], u2 = s2 * c1 - a2 * r2;
    return u2 ? [
        (c1 * i2 - r2 * h2) / u2,
        (s2 * h2 - a2 * i2) / u2
    ] : null;
}
function o2(t11, n4, e5) {
    const o3 = t11.length;
    if (o3 < 3) return !1;
    const a2 = [
        Number.MAX_SAFE_INTEGER,
        e5
    ], c1 = [
        n4,
        e5
    ];
    let h2 = 0;
    for(let n5 = 0; n5 < o3; n5++){
        const e6 = t11[n5], u2 = t11[(n5 + 1) % o3];
        if (i3(e6, u2, c1, a2)) {
            if (0 === r2(e6, c1, u2)) return s2(e6, c1, u2);
            h2++;
        }
    }
    return h2 % 2 == 1;
}
function s2(t11, n4, e5) {
    return n4[0] <= Math.max(t11[0], e5[0]) && n4[0] >= Math.min(t11[0], e5[0]) && n4[1] <= Math.max(t11[1], e5[1]) && n4[1] >= Math.min(t11[1], e5[1]);
}
function r2(t11, n4, e5) {
    const o3 = (n4[1] - t11[1]) * (e5[0] - n4[0]) - (n4[0] - t11[0]) * (e5[1] - n4[1]);
    return 0 === o3 ? 0 : o3 > 0 ? 1 : 2;
}
function i3(t11, n4, e5, o3) {
    const i4 = r2(t11, n4, e5), a2 = r2(t11, n4, o3), c1 = r2(e5, o3, t11), h2 = r2(e5, o3, n4);
    return i4 !== a2 && c1 !== h2 || !(0 !== i4 || !s2(t11, e5, n4)) || !(0 !== a2 || !s2(t11, o3, n4)) || !(0 !== c1 || !s2(e5, t11, o3)) || !(0 !== h2 || !s2(e5, n4, o3));
}
function a2(n4, e5) {
    const o3 = [
        0,
        0
    ], s3 = Math.round(e5.hachureAngle + 90);
    s3 && t10(n4, o3, s3);
    const r3 = function(t11, n5) {
        const e6 = [
            ...t11
        ];
        e6[0].join(",") !== e6[e6.length - 1].join(",") && e6.push([
            e6[0][0],
            e6[0][1]
        ]);
        const o4 = [];
        if (e6 && e6.length > 2) {
            let t12 = n5.hachureGap;
            t12 < 0 && (t12 = 4 * n5.strokeWidth), t12 = Math.max(t12, 0.1);
            const s4 = [];
            for(let t13 = 0; t13 < e6.length - 1; t13++){
                const n6 = e6[t13], o5 = e6[t13 + 1];
                if (n6[1] !== o5[1]) {
                    const t14 = Math.min(n6[1], o5[1]);
                    s4.push({
                        ymin: t14,
                        ymax: Math.max(n6[1], o5[1]),
                        x: t14 === n6[1] ? n6[0] : o5[0],
                        islope: (o5[0] - n6[0]) / (o5[1] - n6[1])
                    });
                }
            }
            if (s4.sort((t14, n6)=>t14.ymin < n6.ymin ? -1 : t14.ymin > n6.ymin ? 1 : t14.x < n6.x ? -1 : t14.x > n6.x ? 1 : t14.ymax === n6.ymax ? 0 : (t14.ymax - n6.ymax) / Math.abs(t14.ymax - n6.ymax)
            ), !s4.length) return o4;
            let r4 = [], i4 = s4[0].ymin;
            for(; r4.length || s4.length;){
                if (s4.length) {
                    let t14 = -1;
                    for(let n6 = 0; n6 < s4.length && !(s4[n6].ymin > i4); n6++)t14 = n6;
                    s4.splice(0, t14 + 1).forEach((t15)=>{
                        r4.push({
                            s: i4,
                            edge: t15
                        });
                    });
                }
                if (r4 = r4.filter((t14)=>!(t14.edge.ymax <= i4)
                ), r4.sort((t14, n6)=>t14.edge.x === n6.edge.x ? 0 : (t14.edge.x - n6.edge.x) / Math.abs(t14.edge.x - n6.edge.x)
                ), r4.length > 1) for(let t14 = 0; t14 < r4.length; t14 += 2){
                    const n6 = t14 + 1;
                    if (n6 >= r4.length) break;
                    const e7 = r4[t14].edge, s5 = r4[n6].edge;
                    o4.push([
                        [
                            Math.round(e7.x),
                            i4
                        ],
                        [
                            Math.round(s5.x),
                            i4
                        ]
                    ]);
                }
                i4 += t12, r4.forEach((n6)=>{
                    n6.edge.x = n6.edge.x + t12 * n6.edge.islope;
                });
            }
        }
        return o4;
    }(n4, e5);
    return s3 && (t10(n4, o3, -s3), (function(n5, e6, o4) {
        const s4 = [];
        n5.forEach((t11)=>s4.push(...t11)
        ), t10(s4, e6, o4);
    })(r3, o3, -s3)), r3;
}
class c1 extends class {
    constructor(t11){
        this.helper = t11;
    }
    fillPolygon(t, n) {
        return this._fillPolygon(t, n);
    }
    _fillPolygon(t, n, e = !1) {
        let o3 = a2(t, n);
        if (e) {
            const n4 = this.connectingLines(t, o3);
            o3 = o3.concat(n4);
        }
        return {
            type: "fillSketch",
            ops: this.renderLines(o3, n)
        };
    }
    renderLines(t, n) {
        const e5 = [];
        for (const o3 of t)e5.push(...this.helper.doubleLineOps(o3[0][0], o3[0][1], o3[1][0], o3[1][1], n));
        return e5;
    }
    connectingLines(t, e) {
        const o3 = [];
        if (e.length > 1) for(let s3 = 1; s3 < e.length; s3++){
            const r3 = e[s3 - 1];
            if (n3(r3) < 3) continue;
            const i4 = [
                e[s3][0],
                r3[1]
            ];
            if (n3(i4) > 3) {
                const n4 = this.splitOnIntersections(t, i4);
                o3.push(...n4);
            }
        }
        return o3;
    }
    midPointInPolygon(t, n) {
        return o2(t, (n[0][0] + n[1][0]) / 2, (n[0][1] + n[1][1]) / 2);
    }
    splitOnIntersections(t, s) {
        const r3 = Math.max(5, 0.1 * n3(s)), a3 = [];
        for(let o3 = 0; o3 < t.length; o3++){
            const c2 = t[o3], h2 = t[(o3 + 1) % t.length];
            if (i3(c2, h2, ...s)) {
                const t12 = e4(c2, h2, s[0], s[1]);
                if (t12) {
                    const e5 = n3([
                        t12,
                        s[0]
                    ]), o4 = n3([
                        t12,
                        s[1]
                    ]);
                    e5 > r3 && o4 > r3 && a3.push({
                        point: t12,
                        distance: e5
                    });
                }
            }
        }
        if (a3.length > 1) {
            const n4 = a3.sort((t12, n5)=>t12.distance - n5.distance
            ).map((t12)=>t12.point
            );
            if (o2(t, ...s[0]) || n4.shift(), o2(t, ...s[1]) || n4.pop(), n4.length <= 1) return this.midPointInPolygon(t, s) ? [
                s
            ] : [];
            const e5 = [
                s[0],
                ...n4,
                s[1]
            ], r4 = [];
            for(let n5 = 0; n5 < e5.length - 1; n5 += 2){
                const o4 = [
                    e5[n5],
                    e5[n5 + 1]
                ];
                this.midPointInPolygon(t, o4) && r4.push(o4);
            }
            return r4;
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
class h2 {
    constructor(t12){
        this.seed = t12;
    }
    next() {
        return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
    }
}
function u2(t13, n4, e5, o3, s3) {
    return {
        type: "path",
        ops: M2(t13, n4, e5, o3, s3)
    };
}
function l1(t13, n4) {
    return (function(t14, n5, e5) {
        const o3 = (t14 || []).length;
        if (o3 > 2) {
            const s3 = [];
            for(let n6 = 0; n6 < o3 - 1; n6++)s3.push(...M2(t14[n6][0], t14[n6][1], t14[n6 + 1][0], t14[n6 + 1][1], e5));
            return n5 && s3.push(...M2(t14[o3 - 1][0], t14[o3 - 1][1], t14[0][0], t14[0][1], e5)), {
                type: "path",
                ops: s3
            };
        }
        return 2 === o3 ? u2(t14[0][0], t14[0][1], t14[1][0], t14[1][1], e5) : {
            type: "path",
            ops: []
        };
    })(t13, !0, n4);
}
function f1(t13, n4, e5, o3, s3) {
    return (function(t14, n5, e6, o4) {
        const [s4, r3] = b2(o4.increment, t14, n5, o4.rx, o4.ry, 1, o4.increment * g2(0.1, g2(0.4, 1, e6), e6), e6);
        let i4 = y2(s4, null, e6);
        if (!e6.disableMultiStroke) {
            const [s5] = b2(o4.increment, t14, n5, o4.rx, o4.ry, 1.5, 0, e6), r4 = y2(s5, null, e6);
            i4 = i4.concat(r4);
        }
        return {
            estimatedPoints: r3,
            opset: {
                type: "path",
                ops: i4
            }
        };
    })(t13, n4, s3, p2(e5, o3, s3)).opset;
}
function p2(t13, n4, e5) {
    const o3 = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t13 / 2, 2) + Math.pow(n4 / 2, 2)) / 2)), s3 = Math.max(e5.curveStepCount, e5.curveStepCount / Math.sqrt(200) * o3), r3 = 2 * Math.PI / s3;
    let i4 = Math.abs(t13 / 2), a3 = Math.abs(n4 / 2);
    const c2 = 1 - e5.curveFitting;
    return i4 += m2(i4 * c2, e5), a3 += m2(a3 * c2, e5), {
        increment: r3,
        rx: i4,
        ry: a3
    };
}
function d1(t13) {
    return t13.randomizer || (t13.randomizer = new h2(t13.seed || 0)), t13.randomizer.next();
}
function g2(t13, n4, e5, o3 = 1) {
    return e5.roughness * o3 * (d1(e5) * (n4 - t13) + t13);
}
function m2(t13, n4, e5 = 1) {
    return g2(-t13, t13, n4, e5);
}
function M2(t13, n4, e5, o3, s3, r3 = !1) {
    const i4 = r3 ? s3.disableMultiStrokeFill : s3.disableMultiStroke, a3 = x2(t13, n4, e5, o3, s3, !0, !1);
    if (i4) return a3;
    const c2 = x2(t13, n4, e5, o3, s3, !0, !0);
    return a3.concat(c2);
}
function x2(t13, n4, e5, o3, s3, r3, i4) {
    const a3 = Math.pow(t13 - e5, 2) + Math.pow(n4 - o3, 2), c2 = Math.sqrt(a3);
    let h3 = 1;
    h3 = c2 < 200 ? 1 : c2 > 500 ? 0.4 : -0.0016668 * c2 + 1.233334;
    let u3 = s3.maxRandomnessOffset || 0;
    u3 * u3 * 100 > a3 && (u3 = c2 / 10);
    const l2 = u3 / 2, f2 = 0.2 + 0.2 * d1(s3);
    let p3 = s3.bowing * s3.maxRandomnessOffset * (o3 - n4) / 200, g3 = s3.bowing * s3.maxRandomnessOffset * (t13 - e5) / 200;
    p3 = m2(p3, s3, h3), g3 = m2(g3, s3, h3);
    const M3 = [], x3 = ()=>m2(l2, s3, h3)
    , y2 = ()=>m2(u3, s3, h3)
    ;
    return r3 && (i4 ? M3.push({
        op: "move",
        data: [
            t13 + x3(),
            n4 + x3()
        ]
    }) : M3.push({
        op: "move",
        data: [
            t13 + m2(u3, s3, h3),
            n4 + m2(u3, s3, h3)
        ]
    })), i4 ? M3.push({
        op: "bcurveTo",
        data: [
            p3 + t13 + (e5 - t13) * f2 + x3(),
            g3 + n4 + (o3 - n4) * f2 + x3(),
            p3 + t13 + 2 * (e5 - t13) * f2 + x3(),
            g3 + n4 + 2 * (o3 - n4) * f2 + x3(),
            e5 + x3(),
            o3 + x3()
        ]
    }) : M3.push({
        op: "bcurveTo",
        data: [
            p3 + t13 + (e5 - t13) * f2 + y2(),
            g3 + n4 + (o3 - n4) * f2 + y2(),
            p3 + t13 + 2 * (e5 - t13) * f2 + y2(),
            g3 + n4 + 2 * (o3 - n4) * f2 + y2(),
            e5 + y2(),
            o3 + y2()
        ]
    }), M3;
}
function y2(t13, n4, e5) {
    const o3 = t13.length, s3 = [];
    if (o3 > 3) {
        const r3 = [], i4 = 1 - e5.curveTightness;
        s3.push({
            op: "move",
            data: [
                t13[1][0],
                t13[1][1]
            ]
        });
        for(let n5 = 1; n5 + 2 < o3; n5++){
            const e6 = t13[n5];
            r3[0] = [
                e6[0],
                e6[1]
            ], r3[1] = [
                e6[0] + (i4 * t13[n5 + 1][0] - i4 * t13[n5 - 1][0]) / 6,
                e6[1] + (i4 * t13[n5 + 1][1] - i4 * t13[n5 - 1][1]) / 6
            ], r3[2] = [
                t13[n5 + 1][0] + (i4 * t13[n5][0] - i4 * t13[n5 + 2][0]) / 6,
                t13[n5 + 1][1] + (i4 * t13[n5][1] - i4 * t13[n5 + 2][1]) / 6
            ], r3[3] = [
                t13[n5 + 1][0],
                t13[n5 + 1][1]
            ], s3.push({
                op: "bcurveTo",
                data: [
                    r3[1][0],
                    r3[1][1],
                    r3[2][0],
                    r3[2][1],
                    r3[3][0],
                    r3[3][1]
                ]
            });
        }
        if (n4 && 2 === n4.length) {
            const t14 = e5.maxRandomnessOffset;
            s3.push({
                op: "lineTo",
                data: [
                    n4[0] + m2(t14, e5),
                    n4[1] + m2(t14, e5)
                ]
            });
        }
    } else 3 === o3 ? (s3.push({
        op: "move",
        data: [
            t13[1][0],
            t13[1][1]
        ]
    }), s3.push({
        op: "bcurveTo",
        data: [
            t13[1][0],
            t13[1][1],
            t13[2][0],
            t13[2][1],
            t13[2][0],
            t13[2][1]
        ]
    })) : 2 === o3 && s3.push(...M2(t13[0][0], t13[0][1], t13[1][0], t13[1][1], e5));
    return s3;
}
function b2(t13, n4, e5, o3, s3, r3, i4, a3) {
    const c2 = [], h3 = [], u3 = m2(0.5, a3) - Math.PI / 2;
    h3.push([
        m2(r3, a3) + n4 + 0.9 * o3 * Math.cos(u3 - t13),
        m2(r3, a3) + e5 + 0.9 * s3 * Math.sin(u3 - t13)
    ]);
    for(let i5 = u3; i5 < 2 * Math.PI + u3 - 0.01; i5 += t13){
        const t14 = [
            m2(r3, a3) + n4 + o3 * Math.cos(i5),
            m2(r3, a3) + e5 + s3 * Math.sin(i5)
        ];
        c2.push(t14), h3.push(t14);
    }
    return h3.push([
        m2(r3, a3) + n4 + o3 * Math.cos(u3 + 2 * Math.PI + 0.5 * i4),
        m2(r3, a3) + e5 + s3 * Math.sin(u3 + 2 * Math.PI + 0.5 * i4)
    ]), h3.push([
        m2(r3, a3) + n4 + 0.98 * o3 * Math.cos(u3 + i4),
        m2(r3, a3) + e5 + 0.98 * s3 * Math.sin(u3 + i4)
    ]), h3.push([
        m2(r3, a3) + n4 + 0.9 * o3 * Math.cos(u3 + 0.5 * i4),
        m2(r3, a3) + e5 + 0.9 * s3 * Math.sin(u3 + 0.5 * i4)
    ]), [
        h3,
        c2
    ];
}
function v1(t13) {
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
        seed: t13
    };
}
function w1(t13, n4) {
    let e5 = "";
    for (const o3 of t13.ops){
        const t14 = o3.data;
        switch(o3.op){
            case "move":
                if (n4 && e5) break;
                e5 += `M${t14[0]} ${t14[1]} `;
                break;
            case "bcurveTo":
                e5 += `C${t14[0]} ${t14[1]}, ${t14[2]} ${t14[3]}, ${t14[4]} ${t14[5]} `;
                break;
            case "lineTo":
                e5 += `L${t14[0]} ${t14[1]} `;
        }
    }
    return e5.trim();
}
function I1(t13, n4) {
    const e5 = document.createElementNS("http://www.w3.org/2000/svg", t13);
    if (n4) for(const t14 in n4)e5.setAttributeNS(null, t14, n4[t14]);
    return e5;
}
function S1(t13, n4, e5 = !1) {
    const o3 = I1("path", {
        d: w1(t13, e5)
    });
    return n4 && n4.appendChild(o3), o3;
}
function k1(t13, n4, e5, o3, s3, r3) {
    return S1(function(t14, n5, e6, o4, s4) {
        return l1([
            [
                t14,
                n5
            ],
            [
                t14 + e6,
                n5
            ],
            [
                t14 + e6,
                n5 + o4
            ],
            [
                t14,
                n5 + o4
            ]
        ], s4);
    }(n4 + 2, e5 + 2, o3 - 4, s3 - 4, v1(r3)), t13);
}
function O1(t13, n4, e5, o3, s3, r3) {
    return S1(u2(n4, e5, o3, s3, v1(r3)), t13);
}
function $1(t13, n4, e5, o3, s3, r3) {
    return S1(f1(n4, e5, o3 = Math.max(o3 > 10 ? o3 - 4 : o3 - 1, 1), s3 = Math.max(s3 > 10 ? s3 - 4 : s3 - 1, 1), v1(r3)), t13);
}
var __decorate1 = this && this.__decorate || function(decorators, target, key, desc) {
    var c2 = arguments.length, r3 = c2 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d2;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r3 = Reflect.decorate(decorators, target, key, desc);
    else for(var i4 = decorators.length - 1; i4 >= 0; i4--)if (d2 = decorators[i4]) r3 = (c2 < 3 ? d2(r3) : c2 > 3 ? d2(target, key, r3) : d2(target, key)) || r3;
    return (c2 > 3 && r3 && Object.defineProperty(target, key, r3), r3);
};
var __metadata1 = this && this.__metadata || function(k2, v2) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k2, v2);
};
let WiredButton = class WiredButton extends WiredBase {
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
            css1`\n        :host {\n          display: inline-block;\n          font-size: 14px;\n        }\n        path {\n          transition: transform 0.05s ease;\n        }\n        button {\n          position: relative;\n          user-select: none;\n          border: none;\n          background: none;\n          font-family: inherit;\n          font-size: inherit;\n          cursor: pointer;\n          letter-spacing: 1.25px;\n          text-transform: uppercase;\n          text-align: center;\n          padding: 10px;\n          color: inherit;\n          outline: none;\n        }\n        button[disabled] {\n          opacity: 0.6 !important;\n          background: rgba(0, 0, 0, 0.07);\n          cursor: default;\n          pointer-events: none;\n        }\n        button:active path {\n          transform: scale(0.97) translate(1.5%, 1.5%);\n        }\n        button:focus path {\n          stroke-width: 1.5;\n        }\n        button::-moz-focus-inner {\n          border: 0;\n        }\n      `
        ];
    }
    render() {
        return html1`\n    <button ?disabled="${this.disabled}">\n      <slot @slotchange="${this.wiredRender}"></slot>\n      <div id="overlay">\n        <svg></svg>\n      </div>\n    </button>\n    `;
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
            const w2 = size.width + (elev - 1) * 2;
            const h3 = size.height + (elev - 1) * 2;
            return [
                w2,
                h3
            ];
        }
        return this.lastSize;
    }
    draw(svg, size) {
        const elev = Math.min(Math.max(1, this.elevation), 5);
        const s3 = {
            width: size[0] - (elev - 1) * 2,
            height: size[1] - (elev - 1) * 2
        };
        k1(svg, 0, 0, s3.width, s3.height, this.seed);
        for(let i4 = 1; i4 < elev; i4++){
            O1(svg, i4 * 2, s3.height + i4 * 2, s3.width + i4 * 2, s3.height + i4 * 2, this.seed).style.opacity = `${(75 - i4 * 10) / 100}`;
            O1(svg, s3.width + i4 * 2, s3.height + i4 * 2, s3.width + i4 * 2, i4 * 2, this.seed).style.opacity = `${(75 - i4 * 10) / 100}`;
            O1(svg, i4 * 2, s3.height + i4 * 2, s3.width + i4 * 2, s3.height + i4 * 2, this.seed).style.opacity = `${(75 - i4 * 10) / 100}`;
            O1(svg, s3.width + i4 * 2, s3.height + i4 * 2, s3.width + i4 * 2, i4 * 2, this.seed).style.opacity = `${(75 - i4 * 10) / 100}`;
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
], WiredButton.prototype, "elevation", void 0);
__decorate1([
    property({
        type: Boolean,
        reflect: true
    }),
    __metadata1("design:type", Object)
], WiredButton.prototype, "disabled", void 0);
__decorate1([
    query('button'),
    __metadata1("design:type", HTMLButtonElement)
], WiredButton.prototype, "button", void 0);
WiredButton = __decorate1([
    customElement('wired-button'),
    __metadata1("design:paramtypes", [])
], WiredButton);
var __decorate2 = this && this.__decorate || function(decorators, target, key, desc) {
    var c2 = arguments.length, r3 = c2 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d2;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r3 = Reflect.decorate(decorators, target, key, desc);
    else for(var i4 = decorators.length - 1; i4 >= 0; i4--)if (d2 = decorators[i4]) r3 = (c2 < 3 ? d2(r3) : c2 > 3 ? d2(target, key, r3) : d2(target, key)) || r3;
    return (c2 > 3 && r3 && Object.defineProperty(target, key, r3), r3);
};
var __metadata2 = this && this.__metadata || function(k2, v2) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k2, v2);
};
let WiredSlider = class WiredSlider extends WiredBase {
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
            css1`\n      :host {\n        display: inline-block;\n        position: relative;\n        width: 300px;\n        box-sizing: border-box;\n      }\n      :host([disabled]) {\n        opacity: 0.45 !important;\n        cursor: default;\n        pointer-events: none;\n        background: rgba(0, 0, 0, 0.07);\n        border-radius: 5px;\n      }\n      input[type=range] {\n        width: 100%;\n        height: 40px;\n        box-sizing: border-box;\n        margin: 0;\n        -webkit-appearance: none;\n        background: transparent;\n        outline: none;\n        position: relative;\n      }\n      input[type=range]:focus {\n        outline: none;\n      }\n      input[type=range]::-ms-track {\n        width: 100%;\n        cursor: pointer;\n        background: transparent;\n        border-color: transparent;\n        color: transparent;\n      }\n      input[type=range]::-moz-focus-outer {\n        outline: none;\n        border: 0;\n      }\n      input[type=range]::-moz-range-thumb {\n        border-radius: 50px;\n        background: none;\n        cursor: pointer;\n        border: none;\n        margin: 0;\n        height: 20px;\n        width: 20px;\n        line-height: 1;\n      }\n      input[type=range]::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        border-radius: 50px;\n        background: none;\n        cursor: pointer;\n        border: none;\n        height: 20px;\n        width: 20px;\n        margin: 0;\n        line-height: 1;\n      }\n      .knob{\n        fill: var(--wired-slider-knob-color, rgb(51, 103, 214));\n        stroke: var(--wired-slider-knob-color, rgb(51, 103, 214));\n      }\n      .bar {\n        stroke: var(--wired-slider-bar-color, rgb(0, 0, 0));\n      }\n      input:focus + div svg .knob {\n        stroke: var(--wired-slider-knob-outline-color, #000);\n        fill-opacity: 0.8;\n      }\n      `
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
        return html1`\n    <div id="container">\n      <input type="range" \n        min="${this.min}"\n        max="${this.max}"\n        step="${this.step}"\n        ?disabled="${this.disabled}"\n        @input="${this.onInput}">\n      <div id="overlay">\n        <svg></svg>\n      </div>\n    </div>\n    `;
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
        const s3 = this.getBoundingClientRect();
        return [
            s3.width,
            s3.height
        ];
    }
    draw(svg, size) {
        this.canvasWidth = size[0];
        const midY = Math.round(size[1] / 2);
        O1(svg, 0, midY, size[0], midY, this.seed).classList.add('bar');
        this.knob = $1(svg, 10, midY, 20, 20, this.seed);
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
], WiredSlider.prototype, "min", void 0);
__decorate2([
    property({
        type: Number
    }),
    __metadata2("design:type", Object)
], WiredSlider.prototype, "max", void 0);
__decorate2([
    property({
        type: Number
    }),
    __metadata2("design:type", Object)
], WiredSlider.prototype, "step", void 0);
__decorate2([
    property({
        type: Boolean,
        reflect: true
    }),
    __metadata2("design:type", Object)
], WiredSlider.prototype, "disabled", void 0);
__decorate2([
    query('input'),
    __metadata2("design:type", HTMLInputElement)
], WiredSlider.prototype, "input", void 0);
WiredSlider = __decorate2([
    customElement('wired-slider')
], WiredSlider);
export { Port1 as Port, st as rough, LitElement1 as LitElement, html1 as html, css1 as css };
