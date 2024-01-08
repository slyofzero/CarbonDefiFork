var Pv = Object.defineProperty;
var kv = (nn, Ur, zn) => Ur in nn ? Pv(nn, Ur, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: zn
}) : nn[Ur] = zn;
var Re = (nn, Ur, zn) => (kv(nn, typeof Ur != "symbol" ? Ur + "" : Ur, zn), zn);
(function() {
    var xu, _u, Mu, Nu;
    "use strict";
    const nn = {}.VITE_SDK_VERBOSITY;
    nn && +nn != 0 && (self.CARBON_DEFI_SDK_VERBOSITY = +nn);
    /**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: Apache-2.0
     */
    const Ur = Symbol("Comlink.proxy"),
        zn = Symbol("Comlink.endpoint"),
        Cc = Symbol("Comlink.releaseProxy"),
        zo = Symbol("Comlink.finalizer"),
        _s = Symbol("Comlink.thrown"),
        Bu = r => typeof r == "object" && r !== null || typeof r == "function",
        Bc = {
            canHandle: r => Bu(r) && r[Ur],
            serialize(r) {
                const {
                    port1: e,
                    port2: t
                } = new MessageChannel;
                return Go(r, e), [t, [t]]
            },
            deserialize(r) {
                return r.start(), Lc(r)
            }
        },
        Oc = {
            canHandle: r => Bu(r) && _s in r,
            serialize({
                value: r
            }) {
                let e;
                return r instanceof Error ? e = {
                    isError: !0,
                    value: {
                        message: r.message,
                        name: r.name,
                        stack: r.stack
                    }
                } : e = {
                    isError: !1,
                    value: r
                }, [e, []]
            },
            deserialize(r) {
                throw r.isError ? Object.assign(new Error(r.value.message), r.value) : r.value
            }
        },
        Ou = new Map([
            ["proxy", Bc],
            ["throw", Oc]
        ]);

    function Fc(r, e) {
        for (const t of r)
            if (e === t || t === "*" || t instanceof RegExp && t.test(e)) return !0;
        return !1
    }

    function Go(r, e = globalThis, t = ["*"]) {
        e.addEventListener("message", function n(i) {
            if (!i || !i.data) return;
            if (!Fc(t, i.origin)) {
                console.warn(`Invalid origin '${i.origin}' for comlink proxy`);
                return
            }
            const {
                id: s,
                type: o,
                path: u
            } = Object.assign({
                path: []
            }, i.data), l = (i.data.argumentList || []).map(Gn);
            let h;
            try {
                const c = u.slice(0, -1).reduce((v, N) => v[N], r),
                    y = u.reduce((v, N) => v[N], r);
                switch (o) {
                    case "GET":
                        h = y;
                        break;
                    case "SET":
                        c[u.slice(-1)[0]] = Gn(i.data.value), h = !0;
                        break;
                    case "APPLY":
                        h = y.apply(c, l);
                        break;
                    case "CONSTRUCT":
                        {
                            const v = new y(...l);h = Gc(v)
                        }
                        break;
                    case "ENDPOINT":
                        {
                            const {
                                port1: v,
                                port2: N
                            } = new MessageChannel;Go(r, N),
                            h = zc(v, [v])
                        }
                        break;
                    case "RELEASE":
                        h = void 0;
                        break;
                    default:
                        return
                }
            } catch (c) {
                h = {
                    value: c,
                    [_s]: 0
                }
            }
            Promise.resolve(h).catch(c => ({
                value: c,
                [_s]: 0
            })).then(c => {
                const [y, v] = Ps(c);
                e.postMessage(Object.assign(Object.assign({}, y), {
                    id: s
                }), v), o === "RELEASE" && (e.removeEventListener("message", n), Fu(e), zo in r && typeof r[zo] == "function" && r[zo]())
            }).catch(c => {
                const [y, v] = Ps({
                    value: new TypeError("Unserializable return value"),
                    [_s]: 0
                });
                e.postMessage(Object.assign(Object.assign({}, y), {
                    id: s
                }), v)
            })
        }), e.start && e.start()
    }

    function Dc(r) {
        return r.constructor.name === "MessagePort"
    }

    function Fu(r) {
        Dc(r) && r.close()
    }

    function Lc(r, e) {
        return Ho(r, [], e)
    }

    function Ms(r) {
        if (r) throw new Error("Proxy has been released and is not useable")
    }

    function Du(r) {
        return li(r, {
            type: "RELEASE"
        }).then(() => {
            Fu(r)
        })
    }
    const Ns = new WeakMap,
        Ts = "FinalizationRegistry" in globalThis && new FinalizationRegistry(r => {
            const e = (Ns.get(r) || 0) - 1;
            Ns.set(r, e), e === 0 && Du(r)
        });

    function Uc(r, e) {
        const t = (Ns.get(e) || 0) + 1;
        Ns.set(e, t), Ts && Ts.register(r, e, r)
    }

    function $c(r) {
        Ts && Ts.unregister(r)
    }

    function Ho(r, e = [], t = function() {}) {
        let n = !1;
        const i = new Proxy(t, {
            get(s, o) {
                if (Ms(n), o === Cc) return () => {
                    $c(i), Du(r), n = !0
                };
                if (o === "then") {
                    if (e.length === 0) return {
                        then: () => i
                    };
                    const u = li(r, {
                        type: "GET",
                        path: e.map(l => l.toString())
                    }).then(Gn);
                    return u.then.bind(u)
                }
                return Ho(r, [...e, o])
            },
            set(s, o, u) {
                Ms(n);
                const [l, h] = Ps(u);
                return li(r, {
                    type: "SET",
                    path: [...e, o].map(c => c.toString()),
                    value: l
                }, h).then(Gn)
            },
            apply(s, o, u) {
                Ms(n);
                const l = e[e.length - 1];
                if (l === zn) return li(r, {
                    type: "ENDPOINT"
                }).then(Gn);
                if (l === "bind") return Ho(r, e.slice(0, -1));
                const [h, c] = Lu(u);
                return li(r, {
                    type: "APPLY",
                    path: e.map(y => y.toString()),
                    argumentList: h
                }, c).then(Gn)
            },
            construct(s, o) {
                Ms(n);
                const [u, l] = Lu(o);
                return li(r, {
                    type: "CONSTRUCT",
                    path: e.map(h => h.toString()),
                    argumentList: u
                }, l).then(Gn)
            }
        });
        return Uc(i, r), i
    }

    function qc(r) {
        return Array.prototype.concat.apply([], r)
    }

    function Lu(r) {
        const e = r.map(Ps);
        return [e.map(t => t[0]), qc(e.map(t => t[1]))]
    }
    const Uu = new WeakMap;

    function zc(r, e) {
        return Uu.set(r, e), r
    }

    function Gc(r) {
        return Object.assign(r, {
            [Ur]: !0
        })
    }

    function Ps(r) {
        for (const [e, t] of Ou)
            if (t.canHandle(r)) {
                const [n, i] = t.serialize(r);
                return [{
                    type: "HANDLER",
                    name: e,
                    value: n
                }, i]
            }
        return [{
            type: "RAW",
            value: r
        }, Uu.get(r) || []]
    }

    function Gn(r) {
        switch (r.type) {
            case "HANDLER":
                return Ou.get(r.name).deserialize(r.value);
            case "RAW":
                return r.value
        }
    }

    function li(r, e, t) {
        return new Promise(n => {
            const i = Hc();
            r.addEventListener("message", function s(o) {
                !o.data || !o.data.id || o.data.id !== i || (r.removeEventListener("message", s), n(o.data))
            }), r.start && r.start(), r.postMessage(Object.assign({
                id: i
            }, e), t)
        })
    }

    function Hc() {
        return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-")
    }
    const jc = "logger/5.7.0";
    let $u = !1,
        qu = !1;
    const ks = {
        debug: 1,
        default: 2,
        info: 2,
        warning: 3,
        error: 4,
        off: 5
    };
    let zu = ks.default,
        jo = null;
    const Gu = function() {
        try {
            const r = [];
            if (["NFD", "NFC", "NFKD", "NFKC"].forEach(e => {
                    try {
                        if ("test".normalize(e) !== "test") throw new Error("bad normalize")
                    } catch {
                        r.push(e)
                    }
                }), r.length) throw new Error("missing " + r.join(", "));
            if (String.fromCharCode(233).normalize("NFD") !== String.fromCharCode(101, 769)) throw new Error("broken implementation")
        } catch (r) {
            return r.message
        }
        return null
    }();
    var Ko, xr;
    (function(r) {
        r.DEBUG = "DEBUG", r.INFO = "INFO", r.WARNING = "WARNING", r.ERROR = "ERROR", r.OFF = "OFF"
    })(Ko || (Ko = {})),
    function(r) {
        r.UNKNOWN_ERROR = "UNKNOWN_ERROR", r.NOT_IMPLEMENTED = "NOT_IMPLEMENTED", r.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION", r.NETWORK_ERROR = "NETWORK_ERROR", r.SERVER_ERROR = "SERVER_ERROR", r.TIMEOUT = "TIMEOUT", r.BUFFER_OVERRUN = "BUFFER_OVERRUN", r.NUMERIC_FAULT = "NUMERIC_FAULT", r.MISSING_NEW = "MISSING_NEW", r.INVALID_ARGUMENT = "INVALID_ARGUMENT", r.MISSING_ARGUMENT = "MISSING_ARGUMENT", r.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT", r.CALL_EXCEPTION = "CALL_EXCEPTION", r.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS", r.NONCE_EXPIRED = "NONCE_EXPIRED", r.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED", r.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT", r.TRANSACTION_REPLACED = "TRANSACTION_REPLACED", r.ACTION_REJECTED = "ACTION_REJECTED"
    }(xr || (xr = {}));
    const Hu = "0123456789abcdef";
    let X = class Ft {
        constructor(e) {
            Object.defineProperty(this, "version", {
                enumerable: !0,
                value: e,
                writable: !1
            })
        }
        _log(e, t) {
            const n = e.toLowerCase();
            ks[n] == null && this.throwArgumentError("invalid log level name", "logLevel", e), zu > ks[n] || console.log.apply(console, t)
        }
        debug(...e) {
            this._log(Ft.levels.DEBUG, e)
        }
        info(...e) {
            this._log(Ft.levels.INFO, e)
        }
        warn(...e) {
            this._log(Ft.levels.WARNING, e)
        }
        makeError(e, t, n) {
            if (qu) return this.makeError("censored error", t, {});
            t || (t = Ft.errors.UNKNOWN_ERROR), n || (n = {});
            const i = [];
            Object.keys(n).forEach(l => {
                const h = n[l];
                try {
                    if (h instanceof Uint8Array) {
                        let c = "";
                        for (let y = 0; y < h.length; y++) c += Hu[h[y] >> 4], c += Hu[15 & h[y]];
                        i.push(l + "=Uint8Array(0x" + c + ")")
                    } else i.push(l + "=" + JSON.stringify(h))
                } catch {
                    i.push(l + "=" + JSON.stringify(n[l].toString()))
                }
            }), i.push(`code=${t}`), i.push(`version=${this.version}`);
            const s = e;
            let o = "";
            switch (t) {
                case xr.NUMERIC_FAULT:
                    {
                        o = "NUMERIC_FAULT";
                        const l = e;
                        switch (l) {
                            case "overflow":
                            case "underflow":
                            case "division-by-zero":
                                o += "-" + l;
                                break;
                            case "negative-power":
                            case "negative-width":
                                o += "-unsupported";
                                break;
                            case "unbound-bitwise-result":
                                o += "-unbound-result"
                        }
                        break
                    }
                case xr.CALL_EXCEPTION:
                case xr.INSUFFICIENT_FUNDS:
                case xr.MISSING_NEW:
                case xr.NONCE_EXPIRED:
                case xr.REPLACEMENT_UNDERPRICED:
                case xr.TRANSACTION_REPLACED:
                case xr.UNPREDICTABLE_GAS_LIMIT:
                    o = t
            }
            o && (e += " [ See: https://links.ethers.org/v5-errors-" + o + " ]"), i.length && (e += " (" + i.join(", ") + ")");
            const u = new Error(e);
            return u.reason = s, u.code = t, Object.keys(n).forEach(function(l) {
                u[l] = n[l]
            }), u
        }
        throwError(e, t, n) {
            throw this.makeError(e, t, n)
        }
        throwArgumentError(e, t, n) {
            return this.throwError(e, Ft.errors.INVALID_ARGUMENT, {
                argument: t,
                value: n
            })
        }
        assert(e, t, n, i) {
            e || this.throwError(t, n, i)
        }
        assertArgument(e, t, n, i) {
            e || this.throwArgumentError(t, n, i)
        }
        checkNormalize(e) {
            Gu && this.throwError("platform missing String.prototype.normalize", Ft.errors.UNSUPPORTED_OPERATION, {
                operation: "String.prototype.normalize",
                form: Gu
            })
        }
        checkSafeUint53(e, t) {
            typeof e == "number" && (t == null && (t = "value not safe"), (e < 0 || e >= 9007199254740991) && this.throwError(t, Ft.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: e
            }), e % 1 && this.throwError(t, Ft.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: e
            }))
        }
        checkArgumentCount(e, t, n) {
            n = n ? ": " + n : "", e < t && this.throwError("missing argument" + n, Ft.errors.MISSING_ARGUMENT, {
                count: e,
                expectedCount: t
            }), e > t && this.throwError("too many arguments" + n, Ft.errors.UNEXPECTED_ARGUMENT, {
                count: e,
                expectedCount: t
            })
        }
        checkNew(e, t) {
            e !== Object && e != null || this.throwError("missing new", Ft.errors.MISSING_NEW, {
                name: t.name
            })
        }
        checkAbstract(e, t) {
            e === t ? this.throwError("cannot instantiate abstract class " + JSON.stringify(t.name) + " directly; use a sub-class", Ft.errors.UNSUPPORTED_OPERATION, {
                name: e.name,
                operation: "new"
            }) : e !== Object && e != null || this.throwError("missing new", Ft.errors.MISSING_NEW, {
                name: t.name
            })
        }
        static globalLogger() {
            return jo || (jo = new Ft(jc)), jo
        }
        static setCensorship(e, t) {
            if (!e && t && this.globalLogger().throwError("cannot permanently disable censorship", Ft.errors.UNSUPPORTED_OPERATION, {
                    operation: "setCensorship"
                }), $u) {
                if (!e) return;
                this.globalLogger().throwError("error censorship permanent", Ft.errors.UNSUPPORTED_OPERATION, {
                    operation: "setCensorship"
                })
            }
            qu = !!e, $u = !!t
        }
        static setLogLevel(e) {
            const t = ks[e.toLowerCase()];
            t != null ? zu = t : Ft.globalLogger().warn("invalid log level - " + e)
        }
        static from(e) {
            return new Ft(e)
        }
    };
    X.errors = xr, X.levels = Ko;
    const Kc = "units/5.7.0",
        Jc = "bytes/5.7.0",
        sn = new X(Jc);

    function ju(r) {
        return !!r.toHexString
    }

    function ji(r) {
        return r.slice || (r.slice = function() {
            const e = Array.prototype.slice.call(arguments);
            return ji(new Uint8Array(Array.prototype.slice.apply(r, e)))
        }), r
    }

    function Vc(r) {
        return Vt(r) && !(r.length % 2) || hi(r)
    }

    function Ku(r) {
        return typeof r == "number" && r == r && r % 1 == 0
    }

    function hi(r) {
        if (r == null) return !1;
        if (r.constructor === Uint8Array) return !0;
        if (typeof r == "string" || !Ku(r.length) || r.length < 0) return !1;
        for (let e = 0; e < r.length; e++) {
            const t = r[e];
            if (!Ku(t) || t < 0 || t >= 256) return !1
        }
        return !0
    }

    function Ct(r, e) {
        if (e || (e = {}), typeof r == "number") {
            sn.checkSafeUint53(r, "invalid arrayify value");
            const t = [];
            for (; r;) t.unshift(255 & r), r = parseInt(String(r / 256));
            return t.length === 0 && t.push(0), ji(new Uint8Array(t))
        }
        if (e.allowMissingPrefix && typeof r == "string" && r.substring(0, 2) !== "0x" && (r = "0x" + r), ju(r) && (r = r.toHexString()), Vt(r)) {
            let t = r.substring(2);
            t.length % 2 && (e.hexPad === "left" ? t = "0" + t : e.hexPad === "right" ? t += "0" : sn.throwArgumentError("hex data is odd-length", "value", r));
            const n = [];
            for (let i = 0; i < t.length; i += 2) n.push(parseInt(t.substring(i, i + 2), 16));
            return ji(new Uint8Array(n))
        }
        return hi(r) ? ji(new Uint8Array(r)) : sn.throwArgumentError("invalid arrayify value", "value", r)
    }

    function fi(r) {
        const e = r.map(i => Ct(i)),
            t = e.reduce((i, s) => i + s.length, 0),
            n = new Uint8Array(t);
        return e.reduce((i, s) => (n.set(s, i), i + s.length), 0), ji(n)
    }

    function Zc(r) {
        let e = Ct(r);
        if (e.length === 0) return e;
        let t = 0;
        for (; t < e.length && e[t] === 0;) t++;
        return t && (e = e.slice(t)), e
    }

    function Vt(r, e) {
        return !(typeof r != "string" || !r.match(/^0x[0-9A-Fa-f]*$/)) && (!e || r.length === 2 + 2 * e)
    }
    const Jo = "0123456789abcdef";

    function kt(r, e) {
        if (e || (e = {}), typeof r == "number") {
            sn.checkSafeUint53(r, "invalid hexlify value");
            let t = "";
            for (; r;) t = Jo[15 & r] + t, r = Math.floor(r / 16);
            return t.length ? (t.length % 2 && (t = "0" + t), "0x" + t) : "0x00"
        }
        if (typeof r == "bigint") return (r = r.toString(16)).length % 2 ? "0x0" + r : "0x" + r;
        if (e.allowMissingPrefix && typeof r == "string" && r.substring(0, 2) !== "0x" && (r = "0x" + r), ju(r)) return r.toHexString();
        if (Vt(r)) return r.length % 2 && (e.hexPad === "left" ? r = "0x0" + r.substring(2) : e.hexPad === "right" ? r += "0" : sn.throwArgumentError("hex data is odd-length", "value", r)), r.toLowerCase();
        if (hi(r)) {
            let t = "0x";
            for (let n = 0; n < r.length; n++) {
                let i = r[n];
                t += Jo[(240 & i) >> 4] + Jo[15 & i]
            }
            return t
        }
        return sn.throwArgumentError("invalid hexlify value", "value", r)
    }

    function Wc(r) {
        if (typeof r != "string") r = kt(r);
        else if (!Vt(r) || r.length % 2) return null;
        return (r.length - 2) / 2
    }

    function Ju(r, e, t) {
        return typeof r != "string" ? r = kt(r) : (!Vt(r) || r.length % 2) && sn.throwArgumentError("invalid hexData", "value", r), e = 2 + 2 * e, t != null ? "0x" + r.substring(e, 2 + 2 * t) : "0x" + r.substring(e)
    }

    function Qc(r) {
        let e = "0x";
        return r.forEach(t => {
            e += kt(t).substring(2)
        }), e
    }

    function Ss(r, e) {
        for (typeof r != "string" ? r = kt(r) : Vt(r) || sn.throwArgumentError("invalid hex string", "value", r), r.length > 2 * e + 2 && sn.throwArgumentError("value out of range", "value", arguments[1]); r.length < 2 * e + 2;) r = "0x0" + r.substring(2);
        return r
    }
    const Vu = "bignumber/5.7.0";
    var Zu = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};

    function Wu(r) {
        return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r
    }
    var Qu = {
        exports: {}
    };
    (function(r, e) {
        function t(m, w) {
            if (!m) throw new Error(w || "Assertion failed")
        }

        function n(m, w) {
            m.super_ = w;
            var M = function() {};
            M.prototype = w.prototype, m.prototype = new M, m.prototype.constructor = m
        }

        function i(m, w, M) {
            if (i.isBN(m)) return m;
            this.negative = 0, this.words = null, this.length = 0, this.red = null, m !== null && (w !== "le" && w !== "be" || (M = w, w = 10), this._init(m || 0, w || 10, M || "be"))
        }
        var s;
        typeof r == "object" ? r.exports = i : e.BN = i, i.BN = i, i.wordSize = 26;
        try {
            s = typeof window < "u" && window.Buffer !== void 0 ? window.Buffer : require("buffer").Buffer
        } catch {}

        function o(m, w) {
            var M = m.charCodeAt(w);
            return M >= 48 && M <= 57 ? M - 48 : M >= 65 && M <= 70 ? M - 55 : M >= 97 && M <= 102 ? M - 87 : void t(!1, "Invalid character in " + m)
        }

        function u(m, w, M) {
            var p = o(m, M);
            return M - 1 >= w && (p |= o(m, M - 1) << 4), p
        }

        function l(m, w, M, p) {
            for (var a = 0, d = 0, f = Math.min(m.length, M), A = w; A < f; A++) {
                var E = m.charCodeAt(A) - 48;
                a *= p, d = E >= 49 ? E - 49 + 10 : E >= 17 ? E - 17 + 10 : E, t(E >= 0 && d < p, "Invalid character"), a += d
            }
            return a
        }

        function h(m, w) {
            m.words = w.words, m.length = w.length, m.negative = w.negative, m.red = w.red
        }
        if (i.isBN = function(m) {
                return m instanceof i || m !== null && typeof m == "object" && m.constructor.wordSize === i.wordSize && Array.isArray(m.words)
            }, i.max = function(m, w) {
                return m.cmp(w) > 0 ? m : w
            }, i.min = function(m, w) {
                return m.cmp(w) < 0 ? m : w
            }, i.prototype._init = function(m, w, M) {
                if (typeof m == "number") return this._initNumber(m, w, M);
                if (typeof m == "object") return this._initArray(m, w, M);
                w === "hex" && (w = 16), t(w === (0 | w) && w >= 2 && w <= 36);
                var p = 0;
                (m = m.toString().replace(/\s+/g, ""))[0] === "-" && (p++, this.negative = 1), p < m.length && (w === 16 ? this._parseHex(m, p, M) : (this._parseBase(m, w, p), M === "le" && this._initArray(this.toArray(), w, M)))
            }, i.prototype._initNumber = function(m, w, M) {
                m < 0 && (this.negative = 1, m = -m), m < 67108864 ? (this.words = [67108863 & m], this.length = 1) : m < 4503599627370496 ? (this.words = [67108863 & m, m / 67108864 & 67108863], this.length = 2) : (t(m < 9007199254740992), this.words = [67108863 & m, m / 67108864 & 67108863, 1], this.length = 3), M === "le" && this._initArray(this.toArray(), w, M)
            }, i.prototype._initArray = function(m, w, M) {
                if (t(typeof m.length == "number"), m.length <= 0) return this.words = [0], this.length = 1, this;
                this.length = Math.ceil(m.length / 3), this.words = new Array(this.length);
                for (var p = 0; p < this.length; p++) this.words[p] = 0;
                var a, d, f = 0;
                if (M === "be")
                    for (p = m.length - 1, a = 0; p >= 0; p -= 3) d = m[p] | m[p - 1] << 8 | m[p - 2] << 16, this.words[a] |= d << f & 67108863, this.words[a + 1] = d >>> 26 - f & 67108863, (f += 24) >= 26 && (f -= 26, a++);
                else if (M === "le")
                    for (p = 0, a = 0; p < m.length; p += 3) d = m[p] | m[p + 1] << 8 | m[p + 2] << 16, this.words[a] |= d << f & 67108863, this.words[a + 1] = d >>> 26 - f & 67108863, (f += 24) >= 26 && (f -= 26, a++);
                return this._strip()
            }, i.prototype._parseHex = function(m, w, M) {
                this.length = Math.ceil((m.length - w) / 6), this.words = new Array(this.length);
                for (var p = 0; p < this.length; p++) this.words[p] = 0;
                var a, d = 0,
                    f = 0;
                if (M === "be")
                    for (p = m.length - 1; p >= w; p -= 2) a = u(m, w, p) << d, this.words[f] |= 67108863 & a, d >= 18 ? (d -= 18, f += 1, this.words[f] |= a >>> 26) : d += 8;
                else
                    for (p = (m.length - w) % 2 == 0 ? w + 1 : w; p < m.length; p += 2) a = u(m, w, p) << d, this.words[f] |= 67108863 & a, d >= 18 ? (d -= 18, f += 1, this.words[f] |= a >>> 26) : d += 8;
                this._strip()
            }, i.prototype._parseBase = function(m, w, M) {
                this.words = [0], this.length = 1;
                for (var p = 0, a = 1; a <= 67108863; a *= w) p++;
                p--, a = a / w | 0;
                for (var d = m.length - M, f = d % p, A = Math.min(d, d - f) + M, E = 0, x = M; x < A; x += p) E = l(m, x, x + p, w), this.imuln(a), this.words[0] + E < 67108864 ? this.words[0] += E : this._iaddn(E);
                if (f !== 0) {
                    var k = 1;
                    for (E = l(m, x, m.length, w), x = 0; x < f; x++) k *= w;
                    this.imuln(k), this.words[0] + E < 67108864 ? this.words[0] += E : this._iaddn(E)
                }
                this._strip()
            }, i.prototype.copy = function(m) {
                m.words = new Array(this.length);
                for (var w = 0; w < this.length; w++) m.words[w] = this.words[w];
                m.length = this.length, m.negative = this.negative, m.red = this.red
            }, i.prototype._move = function(m) {
                h(m, this)
            }, i.prototype.clone = function() {
                var m = new i(null);
                return this.copy(m), m
            }, i.prototype._expand = function(m) {
                for (; this.length < m;) this.words[this.length++] = 0;
                return this
            }, i.prototype._strip = function() {
                for (; this.length > 1 && this.words[this.length - 1] === 0;) this.length--;
                return this._normSign()
            }, i.prototype._normSign = function() {
                return this.length === 1 && this.words[0] === 0 && (this.negative = 0), this
            }, typeof Symbol < "u" && typeof Symbol.for == "function") try {
            i.prototype[Symbol.for("nodejs.util.inspect.custom")] = c
        } catch {
            i.prototype.inspect = c
        } else i.prototype.inspect = c;

        function c() {
            return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">"
        }
        var y = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"],
            v = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            N = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];

        function P(m, w, M) {
            M.negative = w.negative ^ m.negative;
            var p = m.length + w.length | 0;
            M.length = p, p = p - 1 | 0;
            var a = 0 | m.words[0],
                d = 0 | w.words[0],
                f = a * d,
                A = 67108863 & f,
                E = f / 67108864 | 0;
            M.words[0] = A;
            for (var x = 1; x < p; x++) {
                for (var k = E >>> 26, _ = 67108863 & E, g = Math.min(x, w.length - 1), T = Math.max(0, x - m.length + 1); T <= g; T++) {
                    var z = x - T | 0;
                    k += (f = (a = 0 | m.words[z]) * (d = 0 | w.words[T]) + _) / 67108864 | 0, _ = 67108863 & f
                }
                M.words[x] = 0 | _, E = 0 | k
            }
            return E !== 0 ? M.words[x] = 0 | E : M.length--, M._strip()
        }
        i.prototype.toString = function(m, w) {
            var M;
            if (w = 0 | w || 1, (m = m || 10) === 16 || m === "hex") {
                M = "";
                for (var p = 0, a = 0, d = 0; d < this.length; d++) {
                    var f = this.words[d],
                        A = (16777215 & (f << p | a)).toString(16);
                    a = f >>> 24 - p & 16777215, (p += 2) >= 26 && (p -= 26, d--), M = a !== 0 || d !== this.length - 1 ? y[6 - A.length] + A + M : A + M
                }
                for (a !== 0 && (M = a.toString(16) + M); M.length % w != 0;) M = "0" + M;
                return this.negative !== 0 && (M = "-" + M), M
            }
            if (m === (0 | m) && m >= 2 && m <= 36) {
                var E = v[m],
                    x = N[m];
                M = "";
                var k = this.clone();
                for (k.negative = 0; !k.isZero();) {
                    var _ = k.modrn(x).toString(m);
                    M = (k = k.idivn(x)).isZero() ? _ + M : y[E - _.length] + _ + M
                }
                for (this.isZero() && (M = "0" + M); M.length % w != 0;) M = "0" + M;
                return this.negative !== 0 && (M = "-" + M), M
            }
            t(!1, "Base should be between 2 and 36")
        }, i.prototype.toNumber = function() {
            var m = this.words[0];
            return this.length === 2 ? m += 67108864 * this.words[1] : this.length === 3 && this.words[2] === 1 ? m += 4503599627370496 + 67108864 * this.words[1] : this.length > 2 && t(!1, "Number can only safely store up to 53 bits"), this.negative !== 0 ? -m : m
        }, i.prototype.toJSON = function() {
            return this.toString(16, 2)
        }, s && (i.prototype.toBuffer = function(m, w) {
            return this.toArrayLike(s, m, w)
        }), i.prototype.toArray = function(m, w) {
            return this.toArrayLike(Array, m, w)
        }, i.prototype.toArrayLike = function(m, w, M) {
            this._strip();
            var p = this.byteLength(),
                a = M || Math.max(1, p);
            t(p <= a, "byte array longer than desired length"), t(a > 0, "Requested array length <= 0");
            var d = function(f, A) {
                return f.allocUnsafe ? f.allocUnsafe(A) : new f(A)
            }(m, a);
            return this["_toArrayLike" + (w === "le" ? "LE" : "BE")](d, p), d
        }, i.prototype._toArrayLikeLE = function(m, w) {
            for (var M = 0, p = 0, a = 0, d = 0; a < this.length; a++) {
                var f = this.words[a] << d | p;
                m[M++] = 255 & f, M < m.length && (m[M++] = f >> 8 & 255), M < m.length && (m[M++] = f >> 16 & 255), d === 6 ? (M < m.length && (m[M++] = f >> 24 & 255), p = 0, d = 0) : (p = f >>> 24, d += 2)
            }
            if (M < m.length)
                for (m[M++] = p; M < m.length;) m[M++] = 0
        }, i.prototype._toArrayLikeBE = function(m, w) {
            for (var M = m.length - 1, p = 0, a = 0, d = 0; a < this.length; a++) {
                var f = this.words[a] << d | p;
                m[M--] = 255 & f, M >= 0 && (m[M--] = f >> 8 & 255), M >= 0 && (m[M--] = f >> 16 & 255), d === 6 ? (M >= 0 && (m[M--] = f >> 24 & 255), p = 0, d = 0) : (p = f >>> 24, d += 2)
            }
            if (M >= 0)
                for (m[M--] = p; M >= 0;) m[M--] = 0
        }, Math.clz32 ? i.prototype._countBits = function(m) {
            return 32 - Math.clz32(m)
        } : i.prototype._countBits = function(m) {
            var w = m,
                M = 0;
            return w >= 4096 && (M += 13, w >>>= 13), w >= 64 && (M += 7, w >>>= 7), w >= 8 && (M += 4, w >>>= 4), w >= 2 && (M += 2, w >>>= 2), M + w
        }, i.prototype._zeroBits = function(m) {
            if (m === 0) return 26;
            var w = m,
                M = 0;
            return !(8191 & w) && (M += 13, w >>>= 13), !(127 & w) && (M += 7, w >>>= 7), !(15 & w) && (M += 4, w >>>= 4), !(3 & w) && (M += 2, w >>>= 2), !(1 & w) && M++, M
        }, i.prototype.bitLength = function() {
            var m = this.words[this.length - 1],
                w = this._countBits(m);
            return 26 * (this.length - 1) + w
        }, i.prototype.zeroBits = function() {
            if (this.isZero()) return 0;
            for (var m = 0, w = 0; w < this.length; w++) {
                var M = this._zeroBits(this.words[w]);
                if (m += M, M !== 26) break
            }
            return m
        }, i.prototype.byteLength = function() {
            return Math.ceil(this.bitLength() / 8)
        }, i.prototype.toTwos = function(m) {
            return this.negative !== 0 ? this.abs().inotn(m).iaddn(1) : this.clone()
        }, i.prototype.fromTwos = function(m) {
            return this.testn(m - 1) ? this.notn(m).iaddn(1).ineg() : this.clone()
        }, i.prototype.isNeg = function() {
            return this.negative !== 0
        }, i.prototype.neg = function() {
            return this.clone().ineg()
        }, i.prototype.ineg = function() {
            return this.isZero() || (this.negative ^= 1), this
        }, i.prototype.iuor = function(m) {
            for (; this.length < m.length;) this.words[this.length++] = 0;
            for (var w = 0; w < m.length; w++) this.words[w] = this.words[w] | m.words[w];
            return this._strip()
        }, i.prototype.ior = function(m) {
            return t((this.negative | m.negative) == 0), this.iuor(m)
        }, i.prototype.or = function(m) {
            return this.length > m.length ? this.clone().ior(m) : m.clone().ior(this)
        }, i.prototype.uor = function(m) {
            return this.length > m.length ? this.clone().iuor(m) : m.clone().iuor(this)
        }, i.prototype.iuand = function(m) {
            var w;
            w = this.length > m.length ? m : this;
            for (var M = 0; M < w.length; M++) this.words[M] = this.words[M] & m.words[M];
            return this.length = w.length, this._strip()
        }, i.prototype.iand = function(m) {
            return t((this.negative | m.negative) == 0), this.iuand(m)
        }, i.prototype.and = function(m) {
            return this.length > m.length ? this.clone().iand(m) : m.clone().iand(this)
        }, i.prototype.uand = function(m) {
            return this.length > m.length ? this.clone().iuand(m) : m.clone().iuand(this)
        }, i.prototype.iuxor = function(m) {
            var w, M;
            this.length > m.length ? (w = this, M = m) : (w = m, M = this);
            for (var p = 0; p < M.length; p++) this.words[p] = w.words[p] ^ M.words[p];
            if (this !== w)
                for (; p < w.length; p++) this.words[p] = w.words[p];
            return this.length = w.length, this._strip()
        }, i.prototype.ixor = function(m) {
            return t((this.negative | m.negative) == 0), this.iuxor(m)
        }, i.prototype.xor = function(m) {
            return this.length > m.length ? this.clone().ixor(m) : m.clone().ixor(this)
        }, i.prototype.uxor = function(m) {
            return this.length > m.length ? this.clone().iuxor(m) : m.clone().iuxor(this)
        }, i.prototype.inotn = function(m) {
            t(typeof m == "number" && m >= 0);
            var w = 0 | Math.ceil(m / 26),
                M = m % 26;
            this._expand(w), M > 0 && w--;
            for (var p = 0; p < w; p++) this.words[p] = 67108863 & ~this.words[p];
            return M > 0 && (this.words[p] = ~this.words[p] & 67108863 >> 26 - M), this._strip()
        }, i.prototype.notn = function(m) {
            return this.clone().inotn(m)
        }, i.prototype.setn = function(m, w) {
            t(typeof m == "number" && m >= 0);
            var M = m / 26 | 0,
                p = m % 26;
            return this._expand(M + 1), this.words[M] = w ? this.words[M] | 1 << p : this.words[M] & ~(1 << p), this._strip()
        }, i.prototype.iadd = function(m) {
            var w, M, p;
            if (this.negative !== 0 && m.negative === 0) return this.negative = 0, w = this.isub(m), this.negative ^= 1, this._normSign();
            if (this.negative === 0 && m.negative !== 0) return m.negative = 0, w = this.isub(m), m.negative = 1, w._normSign();
            this.length > m.length ? (M = this, p = m) : (M = m, p = this);
            for (var a = 0, d = 0; d < p.length; d++) w = (0 | M.words[d]) + (0 | p.words[d]) + a, this.words[d] = 67108863 & w, a = w >>> 26;
            for (; a !== 0 && d < M.length; d++) w = (0 | M.words[d]) + a, this.words[d] = 67108863 & w, a = w >>> 26;
            if (this.length = M.length, a !== 0) this.words[this.length] = a, this.length++;
            else if (M !== this)
                for (; d < M.length; d++) this.words[d] = M.words[d];
            return this
        }, i.prototype.add = function(m) {
            var w;
            return m.negative !== 0 && this.negative === 0 ? (m.negative = 0, w = this.sub(m), m.negative ^= 1, w) : m.negative === 0 && this.negative !== 0 ? (this.negative = 0, w = m.sub(this), this.negative = 1, w) : this.length > m.length ? this.clone().iadd(m) : m.clone().iadd(this)
        }, i.prototype.isub = function(m) {
            if (m.negative !== 0) {
                m.negative = 0;
                var w = this.iadd(m);
                return m.negative = 1, w._normSign()
            }
            if (this.negative !== 0) return this.negative = 0, this.iadd(m), this.negative = 1, this._normSign();
            var M, p, a = this.cmp(m);
            if (a === 0) return this.negative = 0, this.length = 1, this.words[0] = 0, this;
            a > 0 ? (M = this, p = m) : (M = m, p = this);
            for (var d = 0, f = 0; f < p.length; f++) d = (w = (0 | M.words[f]) - (0 | p.words[f]) + d) >> 26, this.words[f] = 67108863 & w;
            for (; d !== 0 && f < M.length; f++) d = (w = (0 | M.words[f]) + d) >> 26, this.words[f] = 67108863 & w;
            if (d === 0 && f < M.length && M !== this)
                for (; f < M.length; f++) this.words[f] = M.words[f];
            return this.length = Math.max(this.length, f), M !== this && (this.negative = 1), this._strip()
        }, i.prototype.sub = function(m) {
            return this.clone().isub(m)
        };
        var S = function(m, w, M) {
            var p, a, d, f = m.words,
                A = w.words,
                E = M.words,
                x = 0,
                k = 0 | f[0],
                _ = 8191 & k,
                g = k >>> 13,
                T = 0 | f[1],
                z = 8191 & T,
                b = T >>> 13,
                B = 0 | f[2],
                F = 8191 & B,
                D = B >>> 13,
                j = 0 | f[3],
                Z = 8191 & j,
                H = j >>> 13,
                V = 0 | f[4],
                Me = 8191 & V,
                K = V >>> 13,
                le = 0 | f[5],
                $e = 8191 & le,
                he = le >>> 13,
                qe = 0 | f[6],
                ze = 8191 & qe,
                fe = qe >>> 13,
                Ge = 0 | f[7],
                He = 8191 & Ge,
                ce = Ge >>> 13,
                je = 0 | f[8],
                Ke = 8191 & je,
                de = je >>> 13,
                Je = 0 | f[9],
                Ve = 8191 & Je,
                pe = Je >>> 13,
                Ze = 0 | A[0],
                We = 8191 & Ze,
                me = Ze >>> 13,
                Qe = 0 | A[1],
                Ye = 8191 & Qe,
                ge = Qe >>> 13,
                Xe = 0 | A[2],
                et = 8191 & Xe,
                ye = Xe >>> 13,
                tt = 0 | A[3],
                rt = 8191 & tt,
                ve = tt >>> 13,
                nt = 0 | A[4],
                it = 8191 & nt,
                we = nt >>> 13,
                st = 0 | A[5],
                ot = 8191 & st,
                be = st >>> 13,
                at = 0 | A[6],
                ut = 8191 & at,
                Ae = at >>> 13,
                lt = 0 | A[7],
                ht = 8191 & lt,
                Ee = lt >>> 13,
                ft = 0 | A[8],
                ct = 8191 & ft,
                xe = ft >>> 13,
                dt = 0 | A[9],
                pt = 8191 & dt,
                _e = dt >>> 13;
            M.negative = m.negative ^ w.negative, M.length = 19;
            var gt = (x + (p = Math.imul(_, We)) | 0) + ((8191 & (a = (a = Math.imul(_, me)) + Math.imul(g, We) | 0)) << 13) | 0;
            x = ((d = Math.imul(g, me)) + (a >>> 13) | 0) + (gt >>> 26) | 0, gt &= 67108863, p = Math.imul(z, We), a = (a = Math.imul(z, me)) + Math.imul(b, We) | 0, d = Math.imul(b, me);
            var Dr = (x + (p = p + Math.imul(_, Ye) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, ge) | 0) + Math.imul(g, Ye) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, ge) | 0) + (a >>> 13) | 0) + (Dr >>> 26) | 0, Dr &= 67108863, p = Math.imul(F, We), a = (a = Math.imul(F, me)) + Math.imul(D, We) | 0, d = Math.imul(D, me), p = p + Math.imul(z, Ye) | 0, a = (a = a + Math.imul(z, ge) | 0) + Math.imul(b, Ye) | 0, d = d + Math.imul(b, ge) | 0;
            var yt = (x + (p = p + Math.imul(_, et) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, ye) | 0) + Math.imul(g, et) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, ye) | 0) + (a >>> 13) | 0) + (yt >>> 26) | 0, yt &= 67108863, p = Math.imul(Z, We), a = (a = Math.imul(Z, me)) + Math.imul(H, We) | 0, d = Math.imul(H, me), p = p + Math.imul(F, Ye) | 0, a = (a = a + Math.imul(F, ge) | 0) + Math.imul(D, Ye) | 0, d = d + Math.imul(D, ge) | 0, p = p + Math.imul(z, et) | 0, a = (a = a + Math.imul(z, ye) | 0) + Math.imul(b, et) | 0, d = d + Math.imul(b, ye) | 0;
            var vt = (x + (p = p + Math.imul(_, rt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, ve) | 0) + Math.imul(g, rt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, ve) | 0) + (a >>> 13) | 0) + (vt >>> 26) | 0, vt &= 67108863, p = Math.imul(Me, We), a = (a = Math.imul(Me, me)) + Math.imul(K, We) | 0, d = Math.imul(K, me), p = p + Math.imul(Z, Ye) | 0, a = (a = a + Math.imul(Z, ge) | 0) + Math.imul(H, Ye) | 0, d = d + Math.imul(H, ge) | 0, p = p + Math.imul(F, et) | 0, a = (a = a + Math.imul(F, ye) | 0) + Math.imul(D, et) | 0, d = d + Math.imul(D, ye) | 0, p = p + Math.imul(z, rt) | 0, a = (a = a + Math.imul(z, ve) | 0) + Math.imul(b, rt) | 0, d = d + Math.imul(b, ve) | 0;
            var vr = (x + (p = p + Math.imul(_, it) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, we) | 0) + Math.imul(g, it) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, we) | 0) + (a >>> 13) | 0) + (vr >>> 26) | 0, vr &= 67108863, p = Math.imul($e, We), a = (a = Math.imul($e, me)) + Math.imul(he, We) | 0, d = Math.imul(he, me), p = p + Math.imul(Me, Ye) | 0, a = (a = a + Math.imul(Me, ge) | 0) + Math.imul(K, Ye) | 0, d = d + Math.imul(K, ge) | 0, p = p + Math.imul(Z, et) | 0, a = (a = a + Math.imul(Z, ye) | 0) + Math.imul(H, et) | 0, d = d + Math.imul(H, ye) | 0, p = p + Math.imul(F, rt) | 0, a = (a = a + Math.imul(F, ve) | 0) + Math.imul(D, rt) | 0, d = d + Math.imul(D, ve) | 0, p = p + Math.imul(z, it) | 0, a = (a = a + Math.imul(z, we) | 0) + Math.imul(b, it) | 0, d = d + Math.imul(b, we) | 0;
            var wr = (x + (p = p + Math.imul(_, ot) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, be) | 0) + Math.imul(g, ot) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, be) | 0) + (a >>> 13) | 0) + (wr >>> 26) | 0, wr &= 67108863, p = Math.imul(ze, We), a = (a = Math.imul(ze, me)) + Math.imul(fe, We) | 0, d = Math.imul(fe, me), p = p + Math.imul($e, Ye) | 0, a = (a = a + Math.imul($e, ge) | 0) + Math.imul(he, Ye) | 0, d = d + Math.imul(he, ge) | 0, p = p + Math.imul(Me, et) | 0, a = (a = a + Math.imul(Me, ye) | 0) + Math.imul(K, et) | 0, d = d + Math.imul(K, ye) | 0, p = p + Math.imul(Z, rt) | 0, a = (a = a + Math.imul(Z, ve) | 0) + Math.imul(H, rt) | 0, d = d + Math.imul(H, ve) | 0, p = p + Math.imul(F, it) | 0, a = (a = a + Math.imul(F, we) | 0) + Math.imul(D, it) | 0, d = d + Math.imul(D, we) | 0, p = p + Math.imul(z, ot) | 0, a = (a = a + Math.imul(z, be) | 0) + Math.imul(b, ot) | 0, d = d + Math.imul(b, be) | 0;
            var br = (x + (p = p + Math.imul(_, ut) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, Ae) | 0) + Math.imul(g, ut) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, Ae) | 0) + (a >>> 13) | 0) + (br >>> 26) | 0, br &= 67108863, p = Math.imul(He, We), a = (a = Math.imul(He, me)) + Math.imul(ce, We) | 0, d = Math.imul(ce, me), p = p + Math.imul(ze, Ye) | 0, a = (a = a + Math.imul(ze, ge) | 0) + Math.imul(fe, Ye) | 0, d = d + Math.imul(fe, ge) | 0, p = p + Math.imul($e, et) | 0, a = (a = a + Math.imul($e, ye) | 0) + Math.imul(he, et) | 0, d = d + Math.imul(he, ye) | 0, p = p + Math.imul(Me, rt) | 0, a = (a = a + Math.imul(Me, ve) | 0) + Math.imul(K, rt) | 0, d = d + Math.imul(K, ve) | 0, p = p + Math.imul(Z, it) | 0, a = (a = a + Math.imul(Z, we) | 0) + Math.imul(H, it) | 0, d = d + Math.imul(H, we) | 0, p = p + Math.imul(F, ot) | 0, a = (a = a + Math.imul(F, be) | 0) + Math.imul(D, ot) | 0, d = d + Math.imul(D, be) | 0, p = p + Math.imul(z, ut) | 0, a = (a = a + Math.imul(z, Ae) | 0) + Math.imul(b, ut) | 0, d = d + Math.imul(b, Ae) | 0;
            var Ar = (x + (p = p + Math.imul(_, ht) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, Ee) | 0) + Math.imul(g, ht) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, Ee) | 0) + (a >>> 13) | 0) + (Ar >>> 26) | 0, Ar &= 67108863, p = Math.imul(Ke, We), a = (a = Math.imul(Ke, me)) + Math.imul(de, We) | 0, d = Math.imul(de, me), p = p + Math.imul(He, Ye) | 0, a = (a = a + Math.imul(He, ge) | 0) + Math.imul(ce, Ye) | 0, d = d + Math.imul(ce, ge) | 0, p = p + Math.imul(ze, et) | 0, a = (a = a + Math.imul(ze, ye) | 0) + Math.imul(fe, et) | 0, d = d + Math.imul(fe, ye) | 0, p = p + Math.imul($e, rt) | 0, a = (a = a + Math.imul($e, ve) | 0) + Math.imul(he, rt) | 0, d = d + Math.imul(he, ve) | 0, p = p + Math.imul(Me, it) | 0, a = (a = a + Math.imul(Me, we) | 0) + Math.imul(K, it) | 0, d = d + Math.imul(K, we) | 0, p = p + Math.imul(Z, ot) | 0, a = (a = a + Math.imul(Z, be) | 0) + Math.imul(H, ot) | 0, d = d + Math.imul(H, be) | 0, p = p + Math.imul(F, ut) | 0, a = (a = a + Math.imul(F, Ae) | 0) + Math.imul(D, ut) | 0, d = d + Math.imul(D, Ae) | 0, p = p + Math.imul(z, ht) | 0, a = (a = a + Math.imul(z, Ee) | 0) + Math.imul(b, ht) | 0, d = d + Math.imul(b, Ee) | 0;
            var Er = (x + (p = p + Math.imul(_, ct) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, xe) | 0) + Math.imul(g, ct) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, xe) | 0) + (a >>> 13) | 0) + (Er >>> 26) | 0, Er &= 67108863, p = Math.imul(Ve, We), a = (a = Math.imul(Ve, me)) + Math.imul(pe, We) | 0, d = Math.imul(pe, me), p = p + Math.imul(Ke, Ye) | 0, a = (a = a + Math.imul(Ke, ge) | 0) + Math.imul(de, Ye) | 0, d = d + Math.imul(de, ge) | 0, p = p + Math.imul(He, et) | 0, a = (a = a + Math.imul(He, ye) | 0) + Math.imul(ce, et) | 0, d = d + Math.imul(ce, ye) | 0, p = p + Math.imul(ze, rt) | 0, a = (a = a + Math.imul(ze, ve) | 0) + Math.imul(fe, rt) | 0, d = d + Math.imul(fe, ve) | 0, p = p + Math.imul($e, it) | 0, a = (a = a + Math.imul($e, we) | 0) + Math.imul(he, it) | 0, d = d + Math.imul(he, we) | 0, p = p + Math.imul(Me, ot) | 0, a = (a = a + Math.imul(Me, be) | 0) + Math.imul(K, ot) | 0, d = d + Math.imul(K, be) | 0, p = p + Math.imul(Z, ut) | 0, a = (a = a + Math.imul(Z, Ae) | 0) + Math.imul(H, ut) | 0, d = d + Math.imul(H, Ae) | 0, p = p + Math.imul(F, ht) | 0, a = (a = a + Math.imul(F, Ee) | 0) + Math.imul(D, ht) | 0, d = d + Math.imul(D, Ee) | 0, p = p + Math.imul(z, ct) | 0, a = (a = a + Math.imul(z, xe) | 0) + Math.imul(b, ct) | 0, d = d + Math.imul(b, xe) | 0;
            var Xn = (x + (p = p + Math.imul(_, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(_, _e) | 0) + Math.imul(g, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(g, _e) | 0) + (a >>> 13) | 0) + (Xn >>> 26) | 0, Xn &= 67108863, p = Math.imul(Ve, Ye), a = (a = Math.imul(Ve, ge)) + Math.imul(pe, Ye) | 0, d = Math.imul(pe, ge), p = p + Math.imul(Ke, et) | 0, a = (a = a + Math.imul(Ke, ye) | 0) + Math.imul(de, et) | 0, d = d + Math.imul(de, ye) | 0, p = p + Math.imul(He, rt) | 0, a = (a = a + Math.imul(He, ve) | 0) + Math.imul(ce, rt) | 0, d = d + Math.imul(ce, ve) | 0, p = p + Math.imul(ze, it) | 0, a = (a = a + Math.imul(ze, we) | 0) + Math.imul(fe, it) | 0, d = d + Math.imul(fe, we) | 0, p = p + Math.imul($e, ot) | 0, a = (a = a + Math.imul($e, be) | 0) + Math.imul(he, ot) | 0, d = d + Math.imul(he, be) | 0, p = p + Math.imul(Me, ut) | 0, a = (a = a + Math.imul(Me, Ae) | 0) + Math.imul(K, ut) | 0, d = d + Math.imul(K, Ae) | 0, p = p + Math.imul(Z, ht) | 0, a = (a = a + Math.imul(Z, Ee) | 0) + Math.imul(H, ht) | 0, d = d + Math.imul(H, Ee) | 0, p = p + Math.imul(F, ct) | 0, a = (a = a + Math.imul(F, xe) | 0) + Math.imul(D, ct) | 0, d = d + Math.imul(D, xe) | 0;
            var ei = (x + (p = p + Math.imul(z, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(z, _e) | 0) + Math.imul(b, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(b, _e) | 0) + (a >>> 13) | 0) + (ei >>> 26) | 0, ei &= 67108863, p = Math.imul(Ve, et), a = (a = Math.imul(Ve, ye)) + Math.imul(pe, et) | 0, d = Math.imul(pe, ye), p = p + Math.imul(Ke, rt) | 0, a = (a = a + Math.imul(Ke, ve) | 0) + Math.imul(de, rt) | 0, d = d + Math.imul(de, ve) | 0, p = p + Math.imul(He, it) | 0, a = (a = a + Math.imul(He, we) | 0) + Math.imul(ce, it) | 0, d = d + Math.imul(ce, we) | 0, p = p + Math.imul(ze, ot) | 0, a = (a = a + Math.imul(ze, be) | 0) + Math.imul(fe, ot) | 0, d = d + Math.imul(fe, be) | 0, p = p + Math.imul($e, ut) | 0, a = (a = a + Math.imul($e, Ae) | 0) + Math.imul(he, ut) | 0, d = d + Math.imul(he, Ae) | 0, p = p + Math.imul(Me, ht) | 0, a = (a = a + Math.imul(Me, Ee) | 0) + Math.imul(K, ht) | 0, d = d + Math.imul(K, Ee) | 0, p = p + Math.imul(Z, ct) | 0, a = (a = a + Math.imul(Z, xe) | 0) + Math.imul(H, ct) | 0, d = d + Math.imul(H, xe) | 0;
            var ti = (x + (p = p + Math.imul(F, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(F, _e) | 0) + Math.imul(D, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(D, _e) | 0) + (a >>> 13) | 0) + (ti >>> 26) | 0, ti &= 67108863, p = Math.imul(Ve, rt), a = (a = Math.imul(Ve, ve)) + Math.imul(pe, rt) | 0, d = Math.imul(pe, ve), p = p + Math.imul(Ke, it) | 0, a = (a = a + Math.imul(Ke, we) | 0) + Math.imul(de, it) | 0, d = d + Math.imul(de, we) | 0, p = p + Math.imul(He, ot) | 0, a = (a = a + Math.imul(He, be) | 0) + Math.imul(ce, ot) | 0, d = d + Math.imul(ce, be) | 0, p = p + Math.imul(ze, ut) | 0, a = (a = a + Math.imul(ze, Ae) | 0) + Math.imul(fe, ut) | 0, d = d + Math.imul(fe, Ae) | 0, p = p + Math.imul($e, ht) | 0, a = (a = a + Math.imul($e, Ee) | 0) + Math.imul(he, ht) | 0, d = d + Math.imul(he, Ee) | 0, p = p + Math.imul(Me, ct) | 0, a = (a = a + Math.imul(Me, xe) | 0) + Math.imul(K, ct) | 0, d = d + Math.imul(K, xe) | 0;
            var ri = (x + (p = p + Math.imul(Z, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(Z, _e) | 0) + Math.imul(H, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(H, _e) | 0) + (a >>> 13) | 0) + (ri >>> 26) | 0, ri &= 67108863, p = Math.imul(Ve, it), a = (a = Math.imul(Ve, we)) + Math.imul(pe, it) | 0, d = Math.imul(pe, we), p = p + Math.imul(Ke, ot) | 0, a = (a = a + Math.imul(Ke, be) | 0) + Math.imul(de, ot) | 0, d = d + Math.imul(de, be) | 0, p = p + Math.imul(He, ut) | 0, a = (a = a + Math.imul(He, Ae) | 0) + Math.imul(ce, ut) | 0, d = d + Math.imul(ce, Ae) | 0, p = p + Math.imul(ze, ht) | 0, a = (a = a + Math.imul(ze, Ee) | 0) + Math.imul(fe, ht) | 0, d = d + Math.imul(fe, Ee) | 0, p = p + Math.imul($e, ct) | 0, a = (a = a + Math.imul($e, xe) | 0) + Math.imul(he, ct) | 0, d = d + Math.imul(he, xe) | 0;
            var ni = (x + (p = p + Math.imul(Me, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(Me, _e) | 0) + Math.imul(K, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(K, _e) | 0) + (a >>> 13) | 0) + (ni >>> 26) | 0, ni &= 67108863, p = Math.imul(Ve, ot), a = (a = Math.imul(Ve, be)) + Math.imul(pe, ot) | 0, d = Math.imul(pe, be), p = p + Math.imul(Ke, ut) | 0, a = (a = a + Math.imul(Ke, Ae) | 0) + Math.imul(de, ut) | 0, d = d + Math.imul(de, Ae) | 0, p = p + Math.imul(He, ht) | 0, a = (a = a + Math.imul(He, Ee) | 0) + Math.imul(ce, ht) | 0, d = d + Math.imul(ce, Ee) | 0, p = p + Math.imul(ze, ct) | 0, a = (a = a + Math.imul(ze, xe) | 0) + Math.imul(fe, ct) | 0, d = d + Math.imul(fe, xe) | 0;
            var ii = (x + (p = p + Math.imul($e, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul($e, _e) | 0) + Math.imul(he, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(he, _e) | 0) + (a >>> 13) | 0) + (ii >>> 26) | 0, ii &= 67108863, p = Math.imul(Ve, ut), a = (a = Math.imul(Ve, Ae)) + Math.imul(pe, ut) | 0, d = Math.imul(pe, Ae), p = p + Math.imul(Ke, ht) | 0, a = (a = a + Math.imul(Ke, Ee) | 0) + Math.imul(de, ht) | 0, d = d + Math.imul(de, Ee) | 0, p = p + Math.imul(He, ct) | 0, a = (a = a + Math.imul(He, xe) | 0) + Math.imul(ce, ct) | 0, d = d + Math.imul(ce, xe) | 0;
            var si = (x + (p = p + Math.imul(ze, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(ze, _e) | 0) + Math.imul(fe, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(fe, _e) | 0) + (a >>> 13) | 0) + (si >>> 26) | 0, si &= 67108863, p = Math.imul(Ve, ht), a = (a = Math.imul(Ve, Ee)) + Math.imul(pe, ht) | 0, d = Math.imul(pe, Ee), p = p + Math.imul(Ke, ct) | 0, a = (a = a + Math.imul(Ke, xe) | 0) + Math.imul(de, ct) | 0, d = d + Math.imul(de, xe) | 0;
            var oi = (x + (p = p + Math.imul(He, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(He, _e) | 0) + Math.imul(ce, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(ce, _e) | 0) + (a >>> 13) | 0) + (oi >>> 26) | 0, oi &= 67108863, p = Math.imul(Ve, ct), a = (a = Math.imul(Ve, xe)) + Math.imul(pe, ct) | 0, d = Math.imul(pe, xe);
            var ai = (x + (p = p + Math.imul(Ke, pt) | 0) | 0) + ((8191 & (a = (a = a + Math.imul(Ke, _e) | 0) + Math.imul(de, pt) | 0)) << 13) | 0;
            x = ((d = d + Math.imul(de, _e) | 0) + (a >>> 13) | 0) + (ai >>> 26) | 0, ai &= 67108863;
            var ui = (x + (p = Math.imul(Ve, pt)) | 0) + ((8191 & (a = (a = Math.imul(Ve, _e)) + Math.imul(pe, pt) | 0)) << 13) | 0;
            return x = ((d = Math.imul(pe, _e)) + (a >>> 13) | 0) + (ui >>> 26) | 0, ui &= 67108863, E[0] = gt, E[1] = Dr, E[2] = yt, E[3] = vt, E[4] = vr, E[5] = wr, E[6] = br, E[7] = Ar, E[8] = Er, E[9] = Xn, E[10] = ei, E[11] = ti, E[12] = ri, E[13] = ni, E[14] = ii, E[15] = si, E[16] = oi, E[17] = ai, E[18] = ui, x !== 0 && (E[19] = x, M.length++), M
        };

        function O(m, w, M) {
            M.negative = w.negative ^ m.negative, M.length = m.length + w.length;
            for (var p = 0, a = 0, d = 0; d < M.length - 1; d++) {
                var f = a;
                a = 0;
                for (var A = 67108863 & p, E = Math.min(d, w.length - 1), x = Math.max(0, d - m.length + 1); x <= E; x++) {
                    var k = d - x,
                        _ = (0 | m.words[k]) * (0 | w.words[x]),
                        g = 67108863 & _;
                    A = 67108863 & (g = g + A | 0), a += (f = (f = f + (_ / 67108864 | 0) | 0) + (g >>> 26) | 0) >>> 26, f &= 67108863
                }
                M.words[d] = A, p = f, f = a
            }
            return p !== 0 ? M.words[d] = p : M.length--, M._strip()
        }

        function I(m, w, M) {
            return O(m, w, M)
        }
        Math.imul || (S = P), i.prototype.mulTo = function(m, w) {
            var M = this.length + m.length;
            return this.length === 10 && m.length === 10 ? S(this, m, w) : M < 63 ? P(this, m, w) : M < 1024 ? O(this, m, w) : I(this, m, w)
        }, i.prototype.mul = function(m) {
            var w = new i(null);
            return w.words = new Array(this.length + m.length), this.mulTo(m, w)
        }, i.prototype.mulf = function(m) {
            var w = new i(null);
            return w.words = new Array(this.length + m.length), I(this, m, w)
        }, i.prototype.imul = function(m) {
            return this.clone().mulTo(m, this)
        }, i.prototype.imuln = function(m) {
            var w = m < 0;
            w && (m = -m), t(typeof m == "number"), t(m < 67108864);
            for (var M = 0, p = 0; p < this.length; p++) {
                var a = (0 | this.words[p]) * m,
                    d = (67108863 & a) + (67108863 & M);
                M >>= 26, M += a / 67108864 | 0, M += d >>> 26, this.words[p] = 67108863 & d
            }
            return M !== 0 && (this.words[p] = M, this.length++), w ? this.ineg() : this
        }, i.prototype.muln = function(m) {
            return this.clone().imuln(m)
        }, i.prototype.sqr = function() {
            return this.mul(this)
        }, i.prototype.isqr = function() {
            return this.imul(this.clone())
        }, i.prototype.pow = function(m) {
            var w = function(d) {
                for (var f = new Array(d.bitLength()), A = 0; A < f.length; A++) {
                    var E = A / 26 | 0,
                        x = A % 26;
                    f[A] = d.words[E] >>> x & 1
                }
                return f
            }(m);
            if (w.length === 0) return new i(1);
            for (var M = this, p = 0; p < w.length && w[p] === 0; p++, M = M.sqr());
            if (++p < w.length)
                for (var a = M.sqr(); p < w.length; p++, a = a.sqr()) w[p] !== 0 && (M = M.mul(a));
            return M
        }, i.prototype.iushln = function(m) {
            t(typeof m == "number" && m >= 0);
            var w, M = m % 26,
                p = (m - M) / 26,
                a = 67108863 >>> 26 - M << 26 - M;
            if (M !== 0) {
                var d = 0;
                for (w = 0; w < this.length; w++) {
                    var f = this.words[w] & a,
                        A = (0 | this.words[w]) - f << M;
                    this.words[w] = A | d, d = f >>> 26 - M
                }
                d && (this.words[w] = d, this.length++)
            }
            if (p !== 0) {
                for (w = this.length - 1; w >= 0; w--) this.words[w + p] = this.words[w];
                for (w = 0; w < p; w++) this.words[w] = 0;
                this.length += p
            }
            return this._strip()
        }, i.prototype.ishln = function(m) {
            return t(this.negative === 0), this.iushln(m)
        }, i.prototype.iushrn = function(m, w, M) {
            var p;
            t(typeof m == "number" && m >= 0), p = w ? (w - w % 26) / 26 : 0;
            var a = m % 26,
                d = Math.min((m - a) / 26, this.length),
                f = 67108863 ^ 67108863 >>> a << a,
                A = M;
            if (p -= d, p = Math.max(0, p), A) {
                for (var E = 0; E < d; E++) A.words[E] = this.words[E];
                A.length = d
            }
            if (d !== 0)
                if (this.length > d)
                    for (this.length -= d, E = 0; E < this.length; E++) this.words[E] = this.words[E + d];
                else this.words[0] = 0, this.length = 1;
            var x = 0;
            for (E = this.length - 1; E >= 0 && (x !== 0 || E >= p); E--) {
                var k = 0 | this.words[E];
                this.words[E] = x << 26 - a | k >>> a, x = k & f
            }
            return A && x !== 0 && (A.words[A.length++] = x), this.length === 0 && (this.words[0] = 0, this.length = 1), this._strip()
        }, i.prototype.ishrn = function(m, w, M) {
            return t(this.negative === 0), this.iushrn(m, w, M)
        }, i.prototype.shln = function(m) {
            return this.clone().ishln(m)
        }, i.prototype.ushln = function(m) {
            return this.clone().iushln(m)
        }, i.prototype.shrn = function(m) {
            return this.clone().ishrn(m)
        }, i.prototype.ushrn = function(m) {
            return this.clone().iushrn(m)
        }, i.prototype.testn = function(m) {
            t(typeof m == "number" && m >= 0);
            var w = m % 26,
                M = (m - w) / 26,
                p = 1 << w;
            return !(this.length <= M || !(this.words[M] & p))
        }, i.prototype.imaskn = function(m) {
            t(typeof m == "number" && m >= 0);
            var w = m % 26,
                M = (m - w) / 26;
            if (t(this.negative === 0, "imaskn works only with positive numbers"), this.length <= M) return this;
            if (w !== 0 && M++, this.length = Math.min(M, this.length), w !== 0) {
                var p = 67108863 ^ 67108863 >>> w << w;
                this.words[this.length - 1] &= p
            }
            return this._strip()
        }, i.prototype.maskn = function(m) {
            return this.clone().imaskn(m)
        }, i.prototype.iaddn = function(m) {
            return t(typeof m == "number"), t(m < 67108864), m < 0 ? this.isubn(-m) : this.negative !== 0 ? this.length === 1 && (0 | this.words[0]) <= m ? (this.words[0] = m - (0 | this.words[0]), this.negative = 0, this) : (this.negative = 0, this.isubn(m), this.negative = 1, this) : this._iaddn(m)
        }, i.prototype._iaddn = function(m) {
            this.words[0] += m;
            for (var w = 0; w < this.length && this.words[w] >= 67108864; w++) this.words[w] -= 67108864, w === this.length - 1 ? this.words[w + 1] = 1 : this.words[w + 1]++;
            return this.length = Math.max(this.length, w + 1), this
        }, i.prototype.isubn = function(m) {
            if (t(typeof m == "number"), t(m < 67108864), m < 0) return this.iaddn(-m);
            if (this.negative !== 0) return this.negative = 0, this.iaddn(m), this.negative = 1, this;
            if (this.words[0] -= m, this.length === 1 && this.words[0] < 0) this.words[0] = -this.words[0], this.negative = 1;
            else
                for (var w = 0; w < this.length && this.words[w] < 0; w++) this.words[w] += 67108864, this.words[w + 1] -= 1;
            return this._strip()
        }, i.prototype.addn = function(m) {
            return this.clone().iaddn(m)
        }, i.prototype.subn = function(m) {
            return this.clone().isubn(m)
        }, i.prototype.iabs = function() {
            return this.negative = 0, this
        }, i.prototype.abs = function() {
            return this.clone().iabs()
        }, i.prototype._ishlnsubmul = function(m, w, M) {
            var p, a, d = m.length + M;
            this._expand(d);
            var f = 0;
            for (p = 0; p < m.length; p++) {
                a = (0 | this.words[p + M]) + f;
                var A = (0 | m.words[p]) * w;
                f = ((a -= 67108863 & A) >> 26) - (A / 67108864 | 0), this.words[p + M] = 67108863 & a
            }
            for (; p < this.length - M; p++) f = (a = (0 | this.words[p + M]) + f) >> 26, this.words[p + M] = 67108863 & a;
            if (f === 0) return this._strip();
            for (t(f === -1), f = 0, p = 0; p < this.length; p++) f = (a = -(0 | this.words[p]) + f) >> 26, this.words[p] = 67108863 & a;
            return this.negative = 1, this._strip()
        }, i.prototype._wordDiv = function(m, w) {
            var M = (this.length, m.length),
                p = this.clone(),
                a = m,
                d = 0 | a.words[a.length - 1];
            (M = 26 - this._countBits(d)) != 0 && (a = a.ushln(M), p.iushln(M), d = 0 | a.words[a.length - 1]);
            var f, A = p.length - a.length;
            if (w !== "mod") {
                (f = new i(null)).length = A + 1, f.words = new Array(f.length);
                for (var E = 0; E < f.length; E++) f.words[E] = 0
            }
            var x = p.clone()._ishlnsubmul(a, 1, A);
            x.negative === 0 && (p = x, f && (f.words[A] = 1));
            for (var k = A - 1; k >= 0; k--) {
                var _ = 67108864 * (0 | p.words[a.length + k]) + (0 | p.words[a.length + k - 1]);
                for (_ = Math.min(_ / d | 0, 67108863), p._ishlnsubmul(a, _, k); p.negative !== 0;) _--, p.negative = 0, p._ishlnsubmul(a, 1, k), p.isZero() || (p.negative ^= 1);
                f && (f.words[k] = _)
            }
            return f && f._strip(), p._strip(), w !== "div" && M !== 0 && p.iushrn(M), {
                div: f || null,
                mod: p
            }
        }, i.prototype.divmod = function(m, w, M) {
            return t(!m.isZero()), this.isZero() ? {
                div: new i(0),
                mod: new i(0)
            } : this.negative !== 0 && m.negative === 0 ? (d = this.neg().divmod(m, w), w !== "mod" && (p = d.div.neg()), w !== "div" && (a = d.mod.neg(), M && a.negative !== 0 && a.iadd(m)), {
                div: p,
                mod: a
            }) : this.negative === 0 && m.negative !== 0 ? (d = this.divmod(m.neg(), w), w !== "mod" && (p = d.div.neg()), {
                div: p,
                mod: d.mod
            }) : this.negative & m.negative ? (d = this.neg().divmod(m.neg(), w), w !== "div" && (a = d.mod.neg(), M && a.negative !== 0 && a.isub(m)), {
                div: d.div,
                mod: a
            }) : m.length > this.length || this.cmp(m) < 0 ? {
                div: new i(0),
                mod: this
            } : m.length === 1 ? w === "div" ? {
                div: this.divn(m.words[0]),
                mod: null
            } : w === "mod" ? {
                div: null,
                mod: new i(this.modrn(m.words[0]))
            } : {
                div: this.divn(m.words[0]),
                mod: new i(this.modrn(m.words[0]))
            } : this._wordDiv(m, w);
            var p, a, d
        }, i.prototype.div = function(m) {
            return this.divmod(m, "div", !1).div
        }, i.prototype.mod = function(m) {
            return this.divmod(m, "mod", !1).mod
        }, i.prototype.umod = function(m) {
            return this.divmod(m, "mod", !0).mod
        }, i.prototype.divRound = function(m) {
            var w = this.divmod(m);
            if (w.mod.isZero()) return w.div;
            var M = w.div.negative !== 0 ? w.mod.isub(m) : w.mod,
                p = m.ushrn(1),
                a = m.andln(1),
                d = M.cmp(p);
            return d < 0 || a === 1 && d === 0 ? w.div : w.div.negative !== 0 ? w.div.isubn(1) : w.div.iaddn(1)
        }, i.prototype.modrn = function(m) {
            var w = m < 0;
            w && (m = -m), t(m <= 67108863);
            for (var M = (1 << 26) % m, p = 0, a = this.length - 1; a >= 0; a--) p = (M * p + (0 | this.words[a])) % m;
            return w ? -p : p
        }, i.prototype.modn = function(m) {
            return this.modrn(m)
        }, i.prototype.idivn = function(m) {
            var w = m < 0;
            w && (m = -m), t(m <= 67108863);
            for (var M = 0, p = this.length - 1; p >= 0; p--) {
                var a = (0 | this.words[p]) + 67108864 * M;
                this.words[p] = a / m | 0, M = a % m
            }
            return this._strip(), w ? this.ineg() : this
        }, i.prototype.divn = function(m) {
            return this.clone().idivn(m)
        }, i.prototype.egcd = function(m) {
            t(m.negative === 0), t(!m.isZero());
            var w = this,
                M = m.clone();
            w = w.negative !== 0 ? w.umod(m) : w.clone();
            for (var p = new i(1), a = new i(0), d = new i(0), f = new i(1), A = 0; w.isEven() && M.isEven();) w.iushrn(1), M.iushrn(1), ++A;
            for (var E = M.clone(), x = w.clone(); !w.isZero();) {
                for (var k = 0, _ = 1; !(w.words[0] & _) && k < 26; ++k, _ <<= 1);
                if (k > 0)
                    for (w.iushrn(k); k-- > 0;)(p.isOdd() || a.isOdd()) && (p.iadd(E), a.isub(x)), p.iushrn(1), a.iushrn(1);
                for (var g = 0, T = 1; !(M.words[0] & T) && g < 26; ++g, T <<= 1);
                if (g > 0)
                    for (M.iushrn(g); g-- > 0;)(d.isOdd() || f.isOdd()) && (d.iadd(E), f.isub(x)), d.iushrn(1), f.iushrn(1);
                w.cmp(M) >= 0 ? (w.isub(M), p.isub(d), a.isub(f)) : (M.isub(w), d.isub(p), f.isub(a))
            }
            return {
                a: d,
                b: f,
                gcd: M.iushln(A)
            }
        }, i.prototype._invmp = function(m) {
            t(m.negative === 0), t(!m.isZero());
            var w = this,
                M = m.clone();
            w = w.negative !== 0 ? w.umod(m) : w.clone();
            for (var p, a = new i(1), d = new i(0), f = M.clone(); w.cmpn(1) > 0 && M.cmpn(1) > 0;) {
                for (var A = 0, E = 1; !(w.words[0] & E) && A < 26; ++A, E <<= 1);
                if (A > 0)
                    for (w.iushrn(A); A-- > 0;) a.isOdd() && a.iadd(f), a.iushrn(1);
                for (var x = 0, k = 1; !(M.words[0] & k) && x < 26; ++x, k <<= 1);
                if (x > 0)
                    for (M.iushrn(x); x-- > 0;) d.isOdd() && d.iadd(f), d.iushrn(1);
                w.cmp(M) >= 0 ? (w.isub(M), a.isub(d)) : (M.isub(w), d.isub(a))
            }
            return (p = w.cmpn(1) === 0 ? a : d).cmpn(0) < 0 && p.iadd(m), p
        }, i.prototype.gcd = function(m) {
            if (this.isZero()) return m.abs();
            if (m.isZero()) return this.abs();
            var w = this.clone(),
                M = m.clone();
            w.negative = 0, M.negative = 0;
            for (var p = 0; w.isEven() && M.isEven(); p++) w.iushrn(1), M.iushrn(1);
            for (;;) {
                for (; w.isEven();) w.iushrn(1);
                for (; M.isEven();) M.iushrn(1);
                var a = w.cmp(M);
                if (a < 0) {
                    var d = w;
                    w = M, M = d
                } else if (a === 0 || M.cmpn(1) === 0) break;
                w.isub(M)
            }
            return M.iushln(p)
        }, i.prototype.invm = function(m) {
            return this.egcd(m).a.umod(m)
        }, i.prototype.isEven = function() {
            return (1 & this.words[0]) == 0
        }, i.prototype.isOdd = function() {
            return (1 & this.words[0]) == 1
        }, i.prototype.andln = function(m) {
            return this.words[0] & m
        }, i.prototype.bincn = function(m) {
            t(typeof m == "number");
            var w = m % 26,
                M = (m - w) / 26,
                p = 1 << w;
            if (this.length <= M) return this._expand(M + 1), this.words[M] |= p, this;
            for (var a = p, d = M; a !== 0 && d < this.length; d++) {
                var f = 0 | this.words[d];
                a = (f += a) >>> 26, f &= 67108863, this.words[d] = f
            }
            return a !== 0 && (this.words[d] = a, this.length++), this
        }, i.prototype.isZero = function() {
            return this.length === 1 && this.words[0] === 0
        }, i.prototype.cmpn = function(m) {
            var w, M = m < 0;
            if (this.negative !== 0 && !M) return -1;
            if (this.negative === 0 && M) return 1;
            if (this._strip(), this.length > 1) w = 1;
            else {
                M && (m = -m), t(m <= 67108863, "Number is too big");
                var p = 0 | this.words[0];
                w = p === m ? 0 : p < m ? -1 : 1
            }
            return this.negative !== 0 ? 0 | -w : w
        }, i.prototype.cmp = function(m) {
            if (this.negative !== 0 && m.negative === 0) return -1;
            if (this.negative === 0 && m.negative !== 0) return 1;
            var w = this.ucmp(m);
            return this.negative !== 0 ? 0 | -w : w
        }, i.prototype.ucmp = function(m) {
            if (this.length > m.length) return 1;
            if (this.length < m.length) return -1;
            for (var w = 0, M = this.length - 1; M >= 0; M--) {
                var p = 0 | this.words[M],
                    a = 0 | m.words[M];
                if (p !== a) {
                    p < a ? w = -1 : p > a && (w = 1);
                    break
                }
            }
            return w
        }, i.prototype.gtn = function(m) {
            return this.cmpn(m) === 1
        }, i.prototype.gt = function(m) {
            return this.cmp(m) === 1
        }, i.prototype.gten = function(m) {
            return this.cmpn(m) >= 0
        }, i.prototype.gte = function(m) {
            return this.cmp(m) >= 0
        }, i.prototype.ltn = function(m) {
            return this.cmpn(m) === -1
        }, i.prototype.lt = function(m) {
            return this.cmp(m) === -1
        }, i.prototype.lten = function(m) {
            return this.cmpn(m) <= 0
        }, i.prototype.lte = function(m) {
            return this.cmp(m) <= 0
        }, i.prototype.eqn = function(m) {
            return this.cmpn(m) === 0
        }, i.prototype.eq = function(m) {
            return this.cmp(m) === 0
        }, i.red = function(m) {
            return new W(m)
        }, i.prototype.toRed = function(m) {
            return t(!this.red, "Already a number in reduction context"), t(this.negative === 0, "red works only with positives"), m.convertTo(this)._forceRed(m)
        }, i.prototype.fromRed = function() {
            return t(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this)
        }, i.prototype._forceRed = function(m) {
            return this.red = m, this
        }, i.prototype.forceRed = function(m) {
            return t(!this.red, "Already a number in reduction context"), this._forceRed(m)
        }, i.prototype.redAdd = function(m) {
            return t(this.red, "redAdd works only with red numbers"), this.red.add(this, m)
        }, i.prototype.redIAdd = function(m) {
            return t(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, m)
        }, i.prototype.redSub = function(m) {
            return t(this.red, "redSub works only with red numbers"), this.red.sub(this, m)
        }, i.prototype.redISub = function(m) {
            return t(this.red, "redISub works only with red numbers"), this.red.isub(this, m)
        }, i.prototype.redShl = function(m) {
            return t(this.red, "redShl works only with red numbers"), this.red.shl(this, m)
        }, i.prototype.redMul = function(m) {
            return t(this.red, "redMul works only with red numbers"), this.red._verify2(this, m), this.red.mul(this, m)
        }, i.prototype.redIMul = function(m) {
            return t(this.red, "redMul works only with red numbers"), this.red._verify2(this, m), this.red.imul(this, m)
        }, i.prototype.redSqr = function() {
            return t(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this)
        }, i.prototype.redISqr = function() {
            return t(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this)
        }, i.prototype.redSqrt = function() {
            return t(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this)
        }, i.prototype.redInvm = function() {
            return t(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this)
        }, i.prototype.redNeg = function() {
            return t(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this)
        }, i.prototype.redPow = function(m) {
            return t(this.red && !m.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, m)
        };
        var C = {
            k256: null,
            p224: null,
            p192: null,
            p25519: null
        };

        function R(m, w) {
            this.name = m, this.p = new i(w, 16), this.n = this.p.bitLength(), this.k = new i(1).iushln(this.n).isub(this.p), this.tmp = this._tmp()
        }

        function G() {
            R.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f")
        }

        function q() {
            R.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001")
        }

        function J() {
            R.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff")
        }

        function ue() {
            R.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed")
        }

        function W(m) {
            if (typeof m == "string") {
                var w = i._prime(m);
                this.m = w.p, this.prime = w
            } else t(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null
        }

        function se(m) {
            W.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 != 0 && (this.shift += 26 - this.shift % 26), this.r = new i(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv)
        }
        R.prototype._tmp = function() {
            var m = new i(null);
            return m.words = new Array(Math.ceil(this.n / 13)), m
        }, R.prototype.ireduce = function(m) {
            var w, M = m;
            do this.split(M, this.tmp), w = (M = (M = this.imulK(M)).iadd(this.tmp)).bitLength(); while (w > this.n);
            var p = w < this.n ? -1 : M.ucmp(this.p);
            return p === 0 ? (M.words[0] = 0, M.length = 1) : p > 0 ? M.isub(this.p) : M.strip !== void 0 ? M.strip() : M._strip(), M
        }, R.prototype.split = function(m, w) {
            m.iushrn(this.n, 0, w)
        }, R.prototype.imulK = function(m) {
            return m.imul(this.k)
        }, n(G, R), G.prototype.split = function(m, w) {
            for (var M = 4194303, p = Math.min(m.length, 9), a = 0; a < p; a++) w.words[a] = m.words[a];
            if (w.length = p, m.length <= 9) return m.words[0] = 0, void(m.length = 1);
            var d = m.words[9];
            for (w.words[w.length++] = d & M, a = 10; a < m.length; a++) {
                var f = 0 | m.words[a];
                m.words[a - 10] = (f & M) << 4 | d >>> 22, d = f
            }
            d >>>= 22, m.words[a - 10] = d, d === 0 && m.length > 10 ? m.length -= 10 : m.length -= 9
        }, G.prototype.imulK = function(m) {
            m.words[m.length] = 0, m.words[m.length + 1] = 0, m.length += 2;
            for (var w = 0, M = 0; M < m.length; M++) {
                var p = 0 | m.words[M];
                w += 977 * p, m.words[M] = 67108863 & w, w = 64 * p + (w / 67108864 | 0)
            }
            return m.words[m.length - 1] === 0 && (m.length--, m.words[m.length - 1] === 0 && m.length--), m
        }, n(q, R), n(J, R), n(ue, R), ue.prototype.imulK = function(m) {
            for (var w = 0, M = 0; M < m.length; M++) {
                var p = 19 * (0 | m.words[M]) + w,
                    a = 67108863 & p;
                p >>>= 26, m.words[M] = a, w = p
            }
            return w !== 0 && (m.words[m.length++] = w), m
        }, i._prime = function(m) {
            if (C[m]) return C[m];
            var w;
            if (m === "k256") w = new G;
            else if (m === "p224") w = new q;
            else if (m === "p192") w = new J;
            else {
                if (m !== "p25519") throw new Error("Unknown prime " + m);
                w = new ue
            }
            return C[m] = w, w
        }, W.prototype._verify1 = function(m) {
            t(m.negative === 0, "red works only with positives"), t(m.red, "red works only with red numbers")
        }, W.prototype._verify2 = function(m, w) {
            t((m.negative | w.negative) == 0, "red works only with positives"), t(m.red && m.red === w.red, "red works only with red numbers")
        }, W.prototype.imod = function(m) {
            return this.prime ? this.prime.ireduce(m)._forceRed(this) : (h(m, m.umod(this.m)._forceRed(this)), m)
        }, W.prototype.neg = function(m) {
            return m.isZero() ? m.clone() : this.m.sub(m)._forceRed(this)
        }, W.prototype.add = function(m, w) {
            this._verify2(m, w);
            var M = m.add(w);
            return M.cmp(this.m) >= 0 && M.isub(this.m), M._forceRed(this)
        }, W.prototype.iadd = function(m, w) {
            this._verify2(m, w);
            var M = m.iadd(w);
            return M.cmp(this.m) >= 0 && M.isub(this.m), M
        }, W.prototype.sub = function(m, w) {
            this._verify2(m, w);
            var M = m.sub(w);
            return M.cmpn(0) < 0 && M.iadd(this.m), M._forceRed(this)
        }, W.prototype.isub = function(m, w) {
            this._verify2(m, w);
            var M = m.isub(w);
            return M.cmpn(0) < 0 && M.iadd(this.m), M
        }, W.prototype.shl = function(m, w) {
            return this._verify1(m), this.imod(m.ushln(w))
        }, W.prototype.imul = function(m, w) {
            return this._verify2(m, w), this.imod(m.imul(w))
        }, W.prototype.mul = function(m, w) {
            return this._verify2(m, w), this.imod(m.mul(w))
        }, W.prototype.isqr = function(m) {
            return this.imul(m, m.clone())
        }, W.prototype.sqr = function(m) {
            return this.mul(m, m)
        }, W.prototype.sqrt = function(m) {
            if (m.isZero()) return m.clone();
            var w = this.m.andln(3);
            if (t(w % 2 == 1), w === 3) {
                var M = this.m.add(new i(1)).iushrn(2);
                return this.pow(m, M)
            }
            for (var p = this.m.subn(1), a = 0; !p.isZero() && p.andln(1) === 0;) a++, p.iushrn(1);
            t(!p.isZero());
            var d = new i(1).toRed(this),
                f = d.redNeg(),
                A = this.m.subn(1).iushrn(1),
                E = this.m.bitLength();
            for (E = new i(2 * E * E).toRed(this); this.pow(E, A).cmp(f) !== 0;) E.redIAdd(f);
            for (var x = this.pow(E, p), k = this.pow(m, p.addn(1).iushrn(1)), _ = this.pow(m, p), g = a; _.cmp(d) !== 0;) {
                for (var T = _, z = 0; T.cmp(d) !== 0; z++) T = T.redSqr();
                t(z < g);
                var b = this.pow(x, new i(1).iushln(g - z - 1));
                k = k.redMul(b), x = b.redSqr(), _ = _.redMul(x), g = z
            }
            return k
        }, W.prototype.invm = function(m) {
            var w = m._invmp(this.m);
            return w.negative !== 0 ? (w.negative = 0, this.imod(w).redNeg()) : this.imod(w)
        }, W.prototype.pow = function(m, w) {
            if (w.isZero()) return new i(1).toRed(this);
            if (w.cmpn(1) === 0) return m.clone();
            var M = new Array(16);
            M[0] = new i(1).toRed(this), M[1] = m;
            for (var p = 2; p < M.length; p++) M[p] = this.mul(M[p - 1], m);
            var a = M[0],
                d = 0,
                f = 0,
                A = w.bitLength() % 26;
            for (A === 0 && (A = 26), p = w.length - 1; p >= 0; p--) {
                for (var E = w.words[p], x = A - 1; x >= 0; x--) {
                    var k = E >> x & 1;
                    a !== M[0] && (a = this.sqr(a)), k !== 0 || d !== 0 ? (d <<= 1, d |= k, (++f == 4 || p === 0 && x === 0) && (a = this.mul(a, M[d]), f = 0, d = 0)) : f = 0
                }
                A = 26
            }
            return a
        }, W.prototype.convertTo = function(m) {
            var w = m.umod(this.m);
            return w === m ? w.clone() : w
        }, W.prototype.convertFrom = function(m) {
            var w = m.clone();
            return w.red = null, w
        }, i.mont = function(m) {
            return new se(m)
        }, n(se, W), se.prototype.convertTo = function(m) {
            return this.imod(m.ushln(this.shift))
        }, se.prototype.convertFrom = function(m) {
            var w = this.imod(m.mul(this.rinv));
            return w.red = null, w
        }, se.prototype.imul = function(m, w) {
            if (m.isZero() || w.isZero()) return m.words[0] = 0, m.length = 1, m;
            var M = m.imul(w),
                p = M.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
                a = M.isub(p).iushrn(this.shift),
                d = a;
            return a.cmp(this.m) >= 0 ? d = a.isub(this.m) : a.cmpn(0) < 0 && (d = a.iadd(this.m)), d._forceRed(this)
        }, se.prototype.mul = function(m, w) {
            if (m.isZero() || w.isZero()) return new i(0)._forceRed(this);
            var M = m.mul(w),
                p = M.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
                a = M.isub(p).iushrn(this.shift),
                d = a;
            return a.cmp(this.m) >= 0 ? d = a.isub(this.m) : a.cmpn(0) < 0 && (d = a.iadd(this.m)), d._forceRed(this)
        }, se.prototype.invm = function(m) {
            return this.imod(m._invmp(this.m).mul(this.r2))._forceRed(this)
        }
    })(Qu, Zu);
    var Yc = Wu(Qu.exports),
        Rs = Yc.BN;
    const on = new X(Vu),
        Vo = {},
        Yu = 9007199254740991;

    function Xc(r) {
        return r != null && (Y.isBigNumber(r) || typeof r == "number" && r % 1 == 0 || typeof r == "string" && !!r.match(/^-?[0-9]+$/) || Vt(r) || typeof r == "bigint" || hi(r))
    }
    let Xu = !1,
        Y = class Lr {
            constructor(e, t) {
                e !== Vo && on.throwError("cannot call constructor directly; use BigNumber.from", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "new (BigNumber)"
                }), this._hex = t, this._isBigNumber = !0, Object.freeze(this)
            }
            fromTwos(e) {
                return Yt(Oe(this).fromTwos(e))
            }
            toTwos(e) {
                return Yt(Oe(this).toTwos(e))
            }
            abs() {
                return this._hex[0] === "-" ? Lr.from(this._hex.substring(1)) : this
            }
            add(e) {
                return Yt(Oe(this).add(Oe(e)))
            }
            sub(e) {
                return Yt(Oe(this).sub(Oe(e)))
            }
            div(e) {
                return Lr.from(e).isZero() && fr("division-by-zero", "div"), Yt(Oe(this).div(Oe(e)))
            }
            mul(e) {
                return Yt(Oe(this).mul(Oe(e)))
            }
            mod(e) {
                const t = Oe(e);
                return t.isNeg() && fr("division-by-zero", "mod"), Yt(Oe(this).umod(t))
            }
            pow(e) {
                const t = Oe(e);
                return t.isNeg() && fr("negative-power", "pow"), Yt(Oe(this).pow(t))
            }
            and(e) {
                const t = Oe(e);
                return (this.isNegative() || t.isNeg()) && fr("unbound-bitwise-result", "and"), Yt(Oe(this).and(t))
            }
            or(e) {
                const t = Oe(e);
                return (this.isNegative() || t.isNeg()) && fr("unbound-bitwise-result", "or"), Yt(Oe(this).or(t))
            }
            xor(e) {
                const t = Oe(e);
                return (this.isNegative() || t.isNeg()) && fr("unbound-bitwise-result", "xor"), Yt(Oe(this).xor(t))
            }
            mask(e) {
                return (this.isNegative() || e < 0) && fr("negative-width", "mask"), Yt(Oe(this).maskn(e))
            }
            shl(e) {
                return (this.isNegative() || e < 0) && fr("negative-width", "shl"), Yt(Oe(this).shln(e))
            }
            shr(e) {
                return (this.isNegative() || e < 0) && fr("negative-width", "shr"), Yt(Oe(this).shrn(e))
            }
            eq(e) {
                return Oe(this).eq(Oe(e))
            }
            lt(e) {
                return Oe(this).lt(Oe(e))
            }
            lte(e) {
                return Oe(this).lte(Oe(e))
            }
            gt(e) {
                return Oe(this).gt(Oe(e))
            }
            gte(e) {
                return Oe(this).gte(Oe(e))
            }
            isNegative() {
                return this._hex[0] === "-"
            }
            isZero() {
                return Oe(this).isZero()
            }
            toNumber() {
                try {
                    return Oe(this).toNumber()
                } catch {
                    fr("overflow", "toNumber", this.toString())
                }
                return null
            }
            toBigInt() {
                try {
                    return BigInt(this.toString())
                } catch {}
                return on.throwError("this platform does not support BigInt", X.errors.UNSUPPORTED_OPERATION, {
                    value: this.toString()
                })
            }
            toString() {
                return arguments.length > 0 && (arguments[0] === 10 ? Xu || (Xu = !0, on.warn("BigNumber.toString does not accept any parameters; base-10 is assumed")) : arguments[0] === 16 ? on.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", X.errors.UNEXPECTED_ARGUMENT, {}) : on.throwError("BigNumber.toString does not accept parameters", X.errors.UNEXPECTED_ARGUMENT, {})), Oe(this).toString(10)
            }
            toHexString() {
                return this._hex
            }
            toJSON(e) {
                return {
                    type: "BigNumber",
                    hex: this.toHexString()
                }
            }
            static from(e) {
                if (e instanceof Lr) return e;
                if (typeof e == "string") return e.match(/^-?0x[0-9a-f]+$/i) ? new Lr(Vo, Ki(e)) : e.match(/^-?[0-9]+$/) ? new Lr(Vo, Ki(new Rs(e))) : on.throwArgumentError("invalid BigNumber string", "value", e);
                if (typeof e == "number") return e % 1 && fr("underflow", "BigNumber.from", e), (e >= Yu || e <= -Yu) && fr("overflow", "BigNumber.from", e), Lr.from(String(e));
                const t = e;
                if (typeof t == "bigint") return Lr.from(t.toString());
                if (hi(t)) return Lr.from(kt(t));
                if (t)
                    if (t.toHexString) {
                        const n = t.toHexString();
                        if (typeof n == "string") return Lr.from(n)
                    } else {
                        let n = t._hex;
                        if (n == null && t.type === "BigNumber" && (n = t.hex), typeof n == "string" && (Vt(n) || n[0] === "-" && Vt(n.substring(1)))) return Lr.from(n)
                    }
                return on.throwArgumentError("invalid BigNumber value", "value", e)
            }
            static isBigNumber(e) {
                return !(!e || !e._isBigNumber)
            }
        };

    function Ki(r) {
        if (typeof r != "string") return Ki(r.toString(16));
        if (r[0] === "-") return (r = r.substring(1))[0] === "-" && on.throwArgumentError("invalid hex", "value", r), (r = Ki(r)) === "0x00" ? r : "-" + r;
        if (r.substring(0, 2) !== "0x" && (r = "0x" + r), r === "0x") return "0x00";
        for (r.length % 2 && (r = "0x0" + r.substring(2)); r.length > 4 && r.substring(0, 4) === "0x00";) r = "0x" + r.substring(4);
        return r
    }

    function Yt(r) {
        return Y.from(Ki(r))
    }

    function Oe(r) {
        const e = Y.from(r).toHexString();
        return e[0] === "-" ? new Rs("-" + e.substring(3), 16) : new Rs(e.substring(2), 16)
    }

    function fr(r, e, t) {
        const n = {
            fault: r,
            operation: e
        };
        return t != null && (n.value = t), on.throwError(r, X.errors.NUMERIC_FAULT, n)
    }

    function e0(r) {
        return new Rs(r, 36).toString(16)
    }
    const Zt = new X(Vu),
        Ji = {},
        el = Y.from(0),
        tl = Y.from(-1);

    function rl(r, e, t, n) {
        const i = {
            fault: e,
            operation: t
        };
        return n !== void 0 && (i.value = n), Zt.throwError(r, X.errors.NUMERIC_FAULT, i)
    }
    let Vi = "0";
    for (; Vi.length < 256;) Vi += Vi;

    function Zo(r) {
        if (typeof r != "number") try {
            r = Y.from(r).toNumber()
        } catch {}
        return typeof r == "number" && r >= 0 && r <= 256 && !(r % 1) ? "1" + Vi.substring(0, r) : Zt.throwArgumentError("invalid decimal size", "decimals", r)
    }

    function Is(r, e) {
        e == null && (e = 0);
        const t = Zo(e),
            n = (r = Y.from(r)).lt(el);
        n && (r = r.mul(tl));
        let i = r.mod(t).toString();
        for (; i.length < t.length - 1;) i = "0" + i;
        i = i.match(/^([0-9]*[1-9]|0)(0*)/)[1];
        const s = r.div(t).toString();
        return r = t.length === 1 ? s : s + "." + i, n && (r = "-" + r), r
    }

    function $r(r, e) {
        e == null && (e = 0);
        const t = Zo(e);
        typeof r == "string" && r.match(/^-?[0-9.]+$/) || Zt.throwArgumentError("invalid decimal value", "value", r);
        const n = r.substring(0, 1) === "-";
        n && (r = r.substring(1)), r === "." && Zt.throwArgumentError("missing value", "value", r);
        const i = r.split(".");
        i.length > 2 && Zt.throwArgumentError("too many decimal points", "value", r);
        let s = i[0],
            o = i[1];
        for (s || (s = "0"), o || (o = "0"); o[o.length - 1] === "0";) o = o.substring(0, o.length - 1);
        for (o.length > t.length - 1 && rl("fractional component exceeds decimals", "underflow", "parseFixed"), o === "" && (o = "0"); o.length < t.length - 1;) o += "0";
        const u = Y.from(s),
            l = Y.from(o);
        let h = u.mul(t).add(l);
        return n && (h = h.mul(tl)), h
    }
    let Wo = class Ru {
            constructor(e, t, n, i) {
                e !== Ji && Zt.throwError("cannot use FixedFormat constructor; use FixedFormat.from", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "new FixedFormat"
                }), this.signed = t, this.width = n, this.decimals = i, this.name = (t ? "" : "u") + "fixed" + String(n) + "x" + String(i), this._multiplier = Zo(i), Object.freeze(this)
            }
            static from(e) {
                if (e instanceof Ru) return e;
                typeof e == "number" && (e = `fixed128x${e}`);
                let t = !0,
                    n = 128,
                    i = 18;
                if (typeof e == "string") {
                    if (e !== "fixed")
                        if (e === "ufixed") t = !1;
                        else {
                            const s = e.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
                            s || Zt.throwArgumentError("invalid fixed format", "format", e), t = s[1] !== "u", n = parseInt(s[2]), i = parseInt(s[3])
                        }
                } else if (e) {
                    const s = (o, u, l) => e[o] == null ? l : (typeof e[o] !== u && Zt.throwArgumentError("invalid fixed format (" + o + " not " + u + ")", "format." + o, e[o]), e[o]);
                    t = s("signed", "boolean", t), n = s("width", "number", n), i = s("decimals", "number", i)
                }
                return n % 8 && Zt.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", n), i > 80 && Zt.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", i), new Ru(Ji, t, n, i)
            }
        },
        nl = class Qt {
            constructor(e, t, n, i) {
                e !== Ji && Zt.throwError("cannot use FixedNumber constructor; use FixedNumber.from", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "new FixedFormat"
                }), this.format = i, this._hex = t, this._value = n, this._isFixedNumber = !0, Object.freeze(this)
            }
            _checkFormat(e) {
                this.format.name !== e.format.name && Zt.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", e)
            }
            addUnsafe(e) {
                this._checkFormat(e);
                const t = $r(this._value, this.format.decimals),
                    n = $r(e._value, e.format.decimals);
                return Qt.fromValue(t.add(n), this.format.decimals, this.format)
            }
            subUnsafe(e) {
                this._checkFormat(e);
                const t = $r(this._value, this.format.decimals),
                    n = $r(e._value, e.format.decimals);
                return Qt.fromValue(t.sub(n), this.format.decimals, this.format)
            }
            mulUnsafe(e) {
                this._checkFormat(e);
                const t = $r(this._value, this.format.decimals),
                    n = $r(e._value, e.format.decimals);
                return Qt.fromValue(t.mul(n).div(this.format._multiplier), this.format.decimals, this.format)
            }
            divUnsafe(e) {
                this._checkFormat(e);
                const t = $r(this._value, this.format.decimals),
                    n = $r(e._value, e.format.decimals);
                return Qt.fromValue(t.mul(this.format._multiplier).div(n), this.format.decimals, this.format)
            }
            floor() {
                const e = this.toString().split(".");
                e.length === 1 && e.push("0");
                let t = Qt.from(e[0], this.format);
                const n = !e[1].match(/^(0*)$/);
                return this.isNegative() && n && (t = t.subUnsafe(il.toFormat(t.format))), t
            }
            ceiling() {
                const e = this.toString().split(".");
                e.length === 1 && e.push("0");
                let t = Qt.from(e[0], this.format);
                const n = !e[1].match(/^(0*)$/);
                return !this.isNegative() && n && (t = t.addUnsafe(il.toFormat(t.format))), t
            }
            round(e) {
                e == null && (e = 0);
                const t = this.toString().split(".");
                if (t.length === 1 && t.push("0"), (e < 0 || e > 80 || e % 1) && Zt.throwArgumentError("invalid decimal count", "decimals", e), t[1].length <= e) return this;
                const n = Qt.from("1" + Vi.substring(0, e), this.format),
                    i = t0.toFormat(this.format);
                return this.mulUnsafe(n).addUnsafe(i).floor().divUnsafe(n)
            }
            isZero() {
                return this._value === "0.0" || this._value === "0"
            }
            isNegative() {
                return this._value[0] === "-"
            }
            toString() {
                return this._value
            }
            toHexString(e) {
                if (e == null) return this._hex;
                e % 8 && Zt.throwArgumentError("invalid byte width", "width", e);
                const t = Y.from(this._hex).fromTwos(this.format.width).toTwos(e).toHexString();
                return Ss(t, e / 8)
            }
            toUnsafeFloat() {
                return parseFloat(this.toString())
            }
            toFormat(e) {
                return Qt.fromString(this._value, e)
            }
            static fromValue(e, t, n) {
                return n != null || t == null || Xc(t) || (n = t, t = null), t == null && (t = 0), n == null && (n = "fixed"), Qt.fromString(Is(e, t), Wo.from(n))
            }
            static fromString(e, t) {
                t == null && (t = "fixed");
                const n = Wo.from(t),
                    i = $r(e, n.decimals);
                !n.signed && i.lt(el) && rl("unsigned value cannot be negative", "overflow", "value", e);
                let s = null;
                n.signed ? s = i.toTwos(n.width).toHexString() : (s = i.toHexString(), s = Ss(s, n.width / 8));
                const o = Is(i, n.decimals);
                return new Qt(Ji, s, o, n)
            }
            static fromBytes(e, t) {
                t == null && (t = "fixed");
                const n = Wo.from(t);
                if (Ct(e).length > n.width / 8) throw new Error("overflow");
                let i = Y.from(e);
                n.signed && (i = i.fromTwos(n.width));
                const s = i.toTwos((n.signed ? 0 : 1) + n.width).toHexString(),
                    o = Is(i, n.decimals);
                return new Qt(Ji, s, o, n)
            }
            static from(e, t) {
                if (typeof e == "string") return Qt.fromString(e, t);
                if (hi(e)) return Qt.fromBytes(e, t);
                try {
                    return Qt.fromValue(e, 0, t)
                } catch (n) {
                    if (n.code !== X.errors.INVALID_ARGUMENT) throw n
                }
                return Zt.throwArgumentError("invalid FixedNumber value", "value", e)
            }
            static isFixedNumber(e) {
                return !(!e || !e._isFixedNumber)
            }
        };
    const il = nl.from(1),
        t0 = nl.from("0.5"),
        r0 = new X(Kc),
        sl = ["wei", "kwei", "mwei", "gwei", "szabo", "finney", "ether"];

    function n0(r, e) {
        if (typeof e == "string") {
            const t = sl.indexOf(e);
            t !== -1 && (e = 3 * t)
        }
        return Is(r, e ? ? 18)
    }

    function i0(r, e) {
        if (typeof r != "string" && r0.throwArgumentError("value must be a string", "value", r), typeof e == "string") {
            const t = sl.indexOf(e);
            t !== -1 && (e = 3 * t)
        }
        return $r(r, e ? ? 18)
    }
    /*!
     *  decimal.js v10.4.3
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     */
    var ol, an, ci = 9e15,
        xn = 1e9,
        Qo = "0123456789abcdef",
        Cs = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058",
        Bs = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789",
        Yo = {
            precision: 20,
            rounding: 4,
            modulo: 1,
            toExpNeg: -7,
            toExpPos: 21,
            minE: -ci,
            maxE: ci,
            crypto: !1
        },
        Ne = !0,
        Os = "[DecimalError] ",
        _n = Os + "Invalid argument: ",
        al = Os + "Precision limit exceeded",
        ul = Os + "crypto unavailable",
        ll = "[object Decimal]",
        Gt = Math.floor,
        Bt = Math.pow,
        s0 = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
        o0 = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
        a0 = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
        hl = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        _r = 1e7,
        oe = 7,
        u0 = Cs.length - 1,
        Xo = Bs.length - 1,
        U = {
            toStringTag: ll
        };

    function Lt(r) {
        var e, t, n, i = r.length - 1,
            s = "",
            o = r[0];
        if (i > 0) {
            for (s += o, e = 1; e < i; e++) n = r[e] + "", (t = oe - n.length) && (s += Mn(t)), s += n;
            o = r[e], (t = oe - (n = o + "").length) && (s += Mn(t))
        } else if (o === 0) return "0";
        for (; o % 10 == 0;) o /= 10;
        return s + o
    }

    function Xt(r, e, t) {
        if (r !== ~~r || r < e || r > t) throw Error(_n + r)
    }

    function Zi(r, e, t, n) {
        var i, s, o, u;
        for (s = r[0]; s >= 10; s /= 10) --e;
        return --e < 0 ? (e += oe, i = 0) : (i = Math.ceil((e + 1) / oe), e %= oe), s = Bt(10, oe - e), u = r[i] % s | 0, n == null ? e < 3 ? (e == 0 ? u = u / 100 | 0 : e == 1 && (u = u / 10 | 0), o = t < 4 && u == 99999 || t > 3 && u == 49999 || u == 5e4 || u == 0) : o = (t < 4 && u + 1 == s || t > 3 && u + 1 == s / 2) && (r[i + 1] / s / 100 | 0) == Bt(10, e - 2) - 1 || (u == s / 2 || u == 0) && (r[i + 1] / s / 100 | 0) == 0 : e < 4 ? (e == 0 ? u = u / 1e3 | 0 : e == 1 ? u = u / 100 | 0 : e == 2 && (u = u / 10 | 0), o = (n || t < 4) && u == 9999 || !n && t > 3 && u == 4999) : o = ((n || t < 4) && u + 1 == s || !n && t > 3 && u + 1 == s / 2) && (r[i + 1] / s / 1e3 | 0) == Bt(10, e - 3) - 1, o
    }

    function Fs(r, e, t) {
        for (var n, i, s = [0], o = 0, u = r.length; o < u;) {
            for (i = s.length; i--;) s[i] *= e;
            for (s[0] += Qo.indexOf(r.charAt(o++)), n = 0; n < s.length; n++) s[n] > t - 1 && (s[n + 1] === void 0 && (s[n + 1] = 0), s[n + 1] += s[n] / t | 0, s[n] %= t)
        }
        return s.reverse()
    }
    U.absoluteValue = U.abs = function() {
        var r = new this.constructor(this);
        return r.s < 0 && (r.s = 1), ne(r)
    }, U.ceil = function() {
        return ne(new this.constructor(this), this.e + 1, 2)
    }, U.clampedTo = U.clamp = function(r, e) {
        var t = this,
            n = t.constructor;
        if (r = new n(r), e = new n(e), !r.s || !e.s) return new n(NaN);
        if (r.gt(e)) throw Error(_n + e);
        return t.cmp(r) < 0 ? r : t.cmp(e) > 0 ? e : new n(t)
    }, U.comparedTo = U.cmp = function(r) {
        var e, t, n, i, s = this,
            o = s.d,
            u = (r = new s.constructor(r)).d,
            l = s.s,
            h = r.s;
        if (!o || !u) return l && h ? l !== h ? l : o === u ? 0 : !o ^ l < 0 ? 1 : -1 : NaN;
        if (!o[0] || !u[0]) return o[0] ? l : u[0] ? -h : 0;
        if (l !== h) return l;
        if (s.e !== r.e) return s.e > r.e ^ l < 0 ? 1 : -1;
        for (e = 0, t = (n = o.length) < (i = u.length) ? n : i; e < t; ++e)
            if (o[e] !== u[e]) return o[e] > u[e] ^ l < 0 ? 1 : -1;
        return n === i ? 0 : n > i ^ l < 0 ? 1 : -1
    }, U.cosine = U.cos = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.d ? t.d[0] ? (r = n.precision, e = n.rounding, n.precision = r + Math.max(t.e, t.sd()) + oe, n.rounding = 1, t = function(i, s) {
            var o, u, l;
            if (s.isZero()) return s;
            u = s.d.length, u < 32 ? l = (1 / Us(4, o = Math.ceil(u / 3))).toString() : (o = 16, l = "2.3283064365386962890625e-10"), i.precision += o, s = di(i, 1, s.times(l), new i(1));
            for (var h = o; h--;) {
                var c = s.times(s);
                s = c.times(c).minus(c).times(8).plus(1)
            }
            return i.precision -= o, s
        }(n, gl(n, t)), n.precision = r, n.rounding = e, ne(an == 2 || an == 3 ? t.neg() : t, r, e, !0)) : new n(1) : new n(NaN)
    }, U.cubeRoot = U.cbrt = function() {
        var r, e, t, n, i, s, o, u, l, h, c = this,
            y = c.constructor;
        if (!c.isFinite() || c.isZero()) return new y(c);
        for (Ne = !1, (s = c.s * Bt(c.s * c, 1 / 3)) && Math.abs(s) != 1 / 0 ? n = new y(s.toString()) : (t = Lt(c.d), (s = ((r = c.e) - t.length + 1) % 3) && (t += s == 1 || s == -2 ? "0" : "00"), s = Bt(t, 1 / 3), r = Gt((r + 1) / 3) - (r % 3 == (r < 0 ? -1 : 2)), (n = new y(t = s == 1 / 0 ? "5e" + r : (t = s.toExponential()).slice(0, t.indexOf("e") + 1) + r)).s = c.s), o = (r = y.precision) + 3;;)
            if (h = (l = (u = n).times(u).times(u)).plus(c), n = At(h.plus(c).times(u), h.plus(l), o + 2, 1), Lt(u.d).slice(0, o) === (t = Lt(n.d)).slice(0, o)) {
                if ((t = t.slice(o - 3, o + 1)) != "9999" && (i || t != "4999")) {
                    +t && (+t.slice(1) || t.charAt(0) != "5") || (ne(n, r + 1, 1), e = !n.times(n).times(n).eq(c));
                    break
                }
                if (!i && (ne(u, r + 1, 0), u.times(u).times(u).eq(c))) {
                    n = u;
                    break
                }
                o += 4, i = 1
            }
        return Ne = !0, ne(n, r, y.rounding, e)
    }, U.decimalPlaces = U.dp = function() {
        var r, e = this.d,
            t = NaN;
        if (e) {
            if (t = ((r = e.length - 1) - Gt(this.e / oe)) * oe, r = e[r])
                for (; r % 10 == 0; r /= 10) t--;
            t < 0 && (t = 0)
        }
        return t
    }, U.dividedBy = U.div = function(r) {
        return At(this, new this.constructor(r))
    }, U.dividedToIntegerBy = U.divToInt = function(r) {
        var e = this.constructor;
        return ne(At(this, new e(r), 0, 1, 1), e.precision, e.rounding)
    }, U.equals = U.eq = function(r) {
        return this.cmp(r) === 0
    }, U.floor = function() {
        return ne(new this.constructor(this), this.e + 1, 3)
    }, U.greaterThan = U.gt = function(r) {
        return this.cmp(r) > 0
    }, U.greaterThanOrEqualTo = U.gte = function(r) {
        var e = this.cmp(r);
        return e == 1 || e === 0
    }, U.hyperbolicCosine = U.cosh = function() {
        var r, e, t, n, i, s = this,
            o = s.constructor,
            u = new o(1);
        if (!s.isFinite()) return new o(s.s ? 1 / 0 : NaN);
        if (s.isZero()) return u;
        t = o.precision, n = o.rounding, o.precision = t + Math.max(s.e, s.sd()) + 4, o.rounding = 1, (i = s.d.length) < 32 ? e = (1 / Us(4, r = Math.ceil(i / 3))).toString() : (r = 16, e = "2.3283064365386962890625e-10"), s = di(o, 1, s.times(e), new o(1), !0);
        for (var l, h = r, c = new o(8); h--;) l = s.times(s), s = u.minus(l.times(c.minus(l.times(c))));
        return ne(s, o.precision = t, o.rounding = n, !0)
    }, U.hyperbolicSine = U.sinh = function() {
        var r, e, t, n, i = this,
            s = i.constructor;
        if (!i.isFinite() || i.isZero()) return new s(i);
        if (e = s.precision, t = s.rounding, s.precision = e + Math.max(i.e, i.sd()) + 4, s.rounding = 1, (n = i.d.length) < 3) i = di(s, 2, i, i, !0);
        else {
            r = (r = 1.4 * Math.sqrt(n)) > 16 ? 16 : 0 | r, i = di(s, 2, i = i.times(1 / Us(5, r)), i, !0);
            for (var o, u = new s(5), l = new s(16), h = new s(20); r--;) o = i.times(i), i = i.times(u.plus(o.times(l.times(o).plus(h))))
        }
        return s.precision = e, s.rounding = t, ne(i, e, t, !0)
    }, U.hyperbolicTangent = U.tanh = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 7, n.rounding = 1, At(t.sinh(), t.cosh(), n.precision = r, n.rounding = e)) : new n(t.s)
    }, U.inverseCosine = U.acos = function() {
        var r, e = this,
            t = e.constructor,
            n = e.abs().cmp(1),
            i = t.precision,
            s = t.rounding;
        return n !== -1 ? n === 0 ? e.isNeg() ? Mr(t, i, s) : new t(0) : new t(NaN) : e.isZero() ? Mr(t, i + 4, s).times(.5) : (t.precision = i + 6, t.rounding = 1, e = e.asin(), r = Mr(t, i + 4, s).times(.5), t.precision = i, t.rounding = s, r.minus(e))
    }, U.inverseHyperbolicCosine = U.acosh = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.lte(1) ? new n(t.eq(1) ? 0 : NaN) : t.isFinite() ? (r = n.precision, e = n.rounding, n.precision = r + Math.max(Math.abs(t.e), t.sd()) + 4, n.rounding = 1, Ne = !1, t = t.times(t).minus(1).sqrt().plus(t), Ne = !0, n.precision = r, n.rounding = e, t.ln()) : new n(t)
    }, U.inverseHyperbolicSine = U.asinh = function() {
        var r, e, t = this,
            n = t.constructor;
        return !t.isFinite() || t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 2 * Math.max(Math.abs(t.e), t.sd()) + 6, n.rounding = 1, Ne = !1, t = t.times(t).plus(1).sqrt().plus(t), Ne = !0, n.precision = r, n.rounding = e, t.ln())
    }, U.inverseHyperbolicTangent = U.atanh = function() {
        var r, e, t, n, i = this,
            s = i.constructor;
        return i.isFinite() ? i.e >= 0 ? new s(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (r = s.precision, e = s.rounding, n = i.sd(), Math.max(n, r) < 2 * -i.e - 1 ? ne(new s(i), r, e, !0) : (s.precision = t = n - i.e, i = At(i.plus(1), new s(1).minus(i), t + r, 1), s.precision = r + 4, s.rounding = 1, i = i.ln(), s.precision = r, s.rounding = e, i.times(.5))) : new s(NaN)
    }, U.inverseSine = U.asin = function() {
        var r, e, t, n, i = this,
            s = i.constructor;
        return i.isZero() ? new s(i) : (e = i.abs().cmp(1), t = s.precision, n = s.rounding, e !== -1 ? e === 0 ? ((r = Mr(s, t + 4, n).times(.5)).s = i.s, r) : new s(NaN) : (s.precision = t + 6, s.rounding = 1, i = i.div(new s(1).minus(i.times(i)).sqrt().plus(1)).atan(), s.precision = t, s.rounding = n, i.times(2)))
    }, U.inverseTangent = U.atan = function() {
        var r, e, t, n, i, s, o, u, l, h = this,
            c = h.constructor,
            y = c.precision,
            v = c.rounding;
        if (h.isFinite()) {
            if (h.isZero()) return new c(h);
            if (h.abs().eq(1) && y + 4 <= Xo) return (o = Mr(c, y + 4, v).times(.25)).s = h.s, o
        } else {
            if (!h.s) return new c(NaN);
            if (y + 4 <= Xo) return (o = Mr(c, y + 4, v).times(.5)).s = h.s, o
        }
        for (c.precision = u = y + 10, c.rounding = 1, r = t = Math.min(28, u / oe + 2 | 0); r; --r) h = h.div(h.times(h).plus(1).sqrt().plus(1));
        for (Ne = !1, e = Math.ceil(u / oe), n = 1, l = h.times(h), o = new c(h), i = h; r !== -1;)
            if (i = i.times(l), s = o.minus(i.div(n += 2)), i = i.times(l), (o = s.plus(i.div(n += 2))).d[e] !== void 0)
                for (r = e; o.d[r] === s.d[r] && r--;);
        return t && (o = o.times(2 << t - 1)), Ne = !0, ne(o, c.precision = y, c.rounding = v, !0)
    }, U.isFinite = function() {
        return !!this.d
    }, U.isInteger = U.isInt = function() {
        return !!this.d && Gt(this.e / oe) > this.d.length - 2
    }, U.isNaN = function() {
        return !this.s
    }, U.isNegative = U.isNeg = function() {
        return this.s < 0
    }, U.isPositive = U.isPos = function() {
        return this.s > 0
    }, U.isZero = function() {
        return !!this.d && this.d[0] === 0
    }, U.lessThan = U.lt = function(r) {
        return this.cmp(r) < 0
    }, U.lessThanOrEqualTo = U.lte = function(r) {
        return this.cmp(r) < 1
    }, U.logarithm = U.log = function(r) {
        var e, t, n, i, s, o, u, l, h = this,
            c = h.constructor,
            y = c.precision,
            v = c.rounding;
        if (r == null) r = new c(10), e = !0;
        else {
            if (t = (r = new c(r)).d, r.s < 0 || !t || !t[0] || r.eq(1)) return new c(NaN);
            e = r.eq(10)
        }
        if (t = h.d, h.s < 0 || !t || !t[0] || h.eq(1)) return new c(t && !t[0] ? -1 / 0 : h.s != 1 ? NaN : t ? 0 : 1 / 0);
        if (e)
            if (t.length > 1) s = !0;
            else {
                for (i = t[0]; i % 10 == 0;) i /= 10;
                s = i !== 1
            }
        if (Ne = !1, o = Nn(h, u = y + 5), n = e ? Ls(c, u + 10) : Nn(r, u), Zi((l = At(o, n, u, 1)).d, i = y, v))
            do
                if (o = Nn(h, u += 10), n = e ? Ls(c, u + 10) : Nn(r, u), l = At(o, n, u, 1), !s) {
                    +Lt(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = ne(l, y + 1, 0));
                    break
                }
        while (Zi(l.d, i += 10, v));
        return Ne = !0, ne(l, y, v)
    }, U.minus = U.sub = function(r) {
        var e, t, n, i, s, o, u, l, h, c, y, v, N = this,
            P = N.constructor;
        if (r = new P(r), !N.d || !r.d) return N.s && r.s ? N.d ? r.s = -r.s : r = new P(r.d || N.s !== r.s ? N : NaN) : r = new P(NaN), r;
        if (N.s != r.s) return r.s = -r.s, N.plus(r);
        if (h = N.d, v = r.d, u = P.precision, l = P.rounding, !h[0] || !v[0]) {
            if (v[0]) r.s = -r.s;
            else {
                if (!h[0]) return new P(l === 3 ? -0 : 0);
                r = new P(N)
            }
            return Ne ? ne(r, u, l) : r
        }
        if (t = Gt(r.e / oe), c = Gt(N.e / oe), h = h.slice(), s = c - t) {
            for ((y = s < 0) ? (e = h, s = -s, o = v.length) : (e = v, t = c, o = h.length), s > (n = Math.max(Math.ceil(u / oe), o) + 2) && (s = n, e.length = 1), e.reverse(), n = s; n--;) e.push(0);
            e.reverse()
        } else {
            for ((y = (n = h.length) < (o = v.length)) && (o = n), n = 0; n < o; n++)
                if (h[n] != v[n]) {
                    y = h[n] < v[n];
                    break
                }
            s = 0
        }
        for (y && (e = h, h = v, v = e, r.s = -r.s), o = h.length, n = v.length - o; n > 0; --n) h[o++] = 0;
        for (n = v.length; n > s;) {
            if (h[--n] < v[n]) {
                for (i = n; i && h[--i] === 0;) h[i] = _r - 1;
                --h[i], h[n] += _r
            }
            h[n] -= v[n]
        }
        for (; h[--o] === 0;) h.pop();
        for (; h[0] === 0; h.shift()) --t;
        return h[0] ? (r.d = h, r.e = Ds(h, t), Ne ? ne(r, u, l) : r) : new P(l === 3 ? -0 : 0)
    }, U.modulo = U.mod = function(r) {
        var e, t = this,
            n = t.constructor;
        return r = new n(r), !t.d || !r.s || r.d && !r.d[0] ? new n(NaN) : !r.d || t.d && !t.d[0] ? ne(new n(t), n.precision, n.rounding) : (Ne = !1, n.modulo == 9 ? (e = At(t, r.abs(), 0, 3, 1)).s *= r.s : e = At(t, r, 0, n.modulo, 1), e = e.times(r), Ne = !0, t.minus(e))
    }, U.naturalExponential = U.exp = function() {
        return ea(this)
    }, U.naturalLogarithm = U.ln = function() {
        return Nn(this)
    }, U.negated = U.neg = function() {
        var r = new this.constructor(this);
        return r.s = -r.s, ne(r)
    }, U.plus = U.add = function(r) {
        var e, t, n, i, s, o, u, l, h, c, y = this,
            v = y.constructor;
        if (r = new v(r), !y.d || !r.d) return y.s && r.s ? y.d || (r = new v(r.d || y.s === r.s ? y : NaN)) : r = new v(NaN), r;
        if (y.s != r.s) return r.s = -r.s, y.minus(r);
        if (h = y.d, c = r.d, u = v.precision, l = v.rounding, !h[0] || !c[0]) return c[0] || (r = new v(y)), Ne ? ne(r, u, l) : r;
        if (s = Gt(y.e / oe), n = Gt(r.e / oe), h = h.slice(), i = s - n) {
            for (i < 0 ? (t = h, i = -i, o = c.length) : (t = c, n = s, o = h.length), i > (o = (s = Math.ceil(u / oe)) > o ? s + 1 : o + 1) && (i = o, t.length = 1), t.reverse(); i--;) t.push(0);
            t.reverse()
        }
        for ((o = h.length) - (i = c.length) < 0 && (i = o, t = c, c = h, h = t), e = 0; i;) e = (h[--i] = h[i] + c[i] + e) / _r | 0, h[i] %= _r;
        for (e && (h.unshift(e), ++n), o = h.length; h[--o] == 0;) h.pop();
        return r.d = h, r.e = Ds(h, n), Ne ? ne(r, u, l) : r
    }, U.precision = U.sd = function(r) {
        var e, t = this;
        if (r !== void 0 && r !== !!r && r !== 1 && r !== 0) throw Error(_n + r);
        return t.d ? (e = fl(t.d), r && t.e + 1 > e && (e = t.e + 1)) : e = NaN, e
    }, U.round = function() {
        var r = this,
            e = r.constructor;
        return ne(new e(r), r.e + 1, e.rounding)
    }, U.sine = U.sin = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + Math.max(t.e, t.sd()) + oe, n.rounding = 1, t = function(i, s) {
            var o, u = s.d.length;
            if (u < 3) return s.isZero() ? s : di(i, 2, s, s);
            o = (o = 1.4 * Math.sqrt(u)) > 16 ? 16 : 0 | o, s = s.times(1 / Us(5, o)), s = di(i, 2, s, s);
            for (var l, h = new i(5), c = new i(16), y = new i(20); o--;) l = s.times(s), s = s.times(h.plus(l.times(c.times(l).minus(y))));
            return s
        }(n, gl(n, t)), n.precision = r, n.rounding = e, ne(an > 2 ? t.neg() : t, r, e, !0)) : new n(NaN)
    }, U.squareRoot = U.sqrt = function() {
        var r, e, t, n, i, s, o = this,
            u = o.d,
            l = o.e,
            h = o.s,
            c = o.constructor;
        if (h !== 1 || !u || !u[0]) return new c(!h || h < 0 && (!u || u[0]) ? NaN : u ? o : 1 / 0);
        for (Ne = !1, (h = Math.sqrt(+o)) == 0 || h == 1 / 0 ? (((e = Lt(u)).length + l) % 2 == 0 && (e += "0"), h = Math.sqrt(e), l = Gt((l + 1) / 2) - (l < 0 || l % 2), n = new c(e = h == 1 / 0 ? "5e" + l : (e = h.toExponential()).slice(0, e.indexOf("e") + 1) + l)) : n = new c(h.toString()), t = (l = c.precision) + 3;;)
            if (n = (s = n).plus(At(o, s, t + 2, 1)).times(.5), Lt(s.d).slice(0, t) === (e = Lt(n.d)).slice(0, t)) {
                if ((e = e.slice(t - 3, t + 1)) != "9999" && (i || e != "4999")) {
                    +e && (+e.slice(1) || e.charAt(0) != "5") || (ne(n, l + 1, 1), r = !n.times(n).eq(o));
                    break
                }
                if (!i && (ne(s, l + 1, 0), s.times(s).eq(o))) {
                    n = s;
                    break
                }
                t += 4, i = 1
            }
        return Ne = !0, ne(n, l, c.rounding, r)
    }, U.tangent = U.tan = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 10, n.rounding = 1, (t = t.sin()).s = 1, t = At(t, new n(1).minus(t.times(t)).sqrt(), r + 10, 0), n.precision = r, n.rounding = e, ne(an == 2 || an == 4 ? t.neg() : t, r, e, !0)) : new n(NaN)
    }, U.times = U.mul = function(r) {
        var e, t, n, i, s, o, u, l, h, c = this,
            y = c.constructor,
            v = c.d,
            N = (r = new y(r)).d;
        if (r.s *= c.s, !(v && v[0] && N && N[0])) return new y(!r.s || v && !v[0] && !N || N && !N[0] && !v ? NaN : v && N ? 0 * r.s : r.s / 0);
        for (t = Gt(c.e / oe) + Gt(r.e / oe), (l = v.length) < (h = N.length) && (s = v, v = N, N = s, o = l, l = h, h = o), s = [], n = o = l + h; n--;) s.push(0);
        for (n = h; --n >= 0;) {
            for (e = 0, i = l + n; i > n;) u = s[i] + N[n] * v[i - n - 1] + e, s[i--] = u % _r | 0, e = u / _r | 0;
            s[i] = (s[i] + e) % _r | 0
        }
        for (; !s[--o];) s.pop();
        return e ? ++t : s.shift(), r.d = s, r.e = Ds(s, t), Ne ? ne(r, y.precision, y.rounding) : r
    }, U.toBinary = function(r, e) {
        return ra(this, 2, r, e)
    }, U.toDecimalPlaces = U.toDP = function(r, e) {
        var t = this,
            n = t.constructor;
        return t = new n(t), r === void 0 ? t : (Xt(r, 0, xn), e === void 0 ? e = n.rounding : Xt(e, 0, 8), ne(t, r + t.e + 1, e))
    }, U.toExponential = function(r, e) {
        var t, n = this,
            i = n.constructor;
        return r === void 0 ? t = qr(n, !0) : (Xt(r, 0, xn), e === void 0 ? e = i.rounding : Xt(e, 0, 8), t = qr(n = ne(new i(n), r + 1, e), !0, r + 1)), n.isNeg() && !n.isZero() ? "-" + t : t
    }, U.toFixed = function(r, e) {
        var t, n, i = this,
            s = i.constructor;
        return r === void 0 ? t = qr(i) : (Xt(r, 0, xn), e === void 0 ? e = s.rounding : Xt(e, 0, 8), t = qr(n = ne(new s(i), r + i.e + 1, e), !1, r + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + t : t
    }, U.toFraction = function(r) {
        var e, t, n, i, s, o, u, l, h, c, y, v, N = this,
            P = N.d,
            S = N.constructor;
        if (!P) return new S(N);
        if (h = t = new S(1), n = l = new S(0), o = (s = (e = new S(n)).e = fl(P) - N.e - 1) % oe, e.d[0] = Bt(10, o < 0 ? oe + o : o), r == null) r = s > 0 ? e : h;
        else {
            if (!(u = new S(r)).isInt() || u.lt(h)) throw Error(_n + u);
            r = u.gt(e) ? s > 0 ? e : h : u
        }
        for (Ne = !1, u = new S(Lt(P)), c = S.precision, S.precision = s = P.length * oe * 2; y = At(u, e, 0, 1, 1), (i = t.plus(y.times(n))).cmp(r) != 1;) t = n, n = i, i = h, h = l.plus(y.times(i)), l = i, i = e, e = u.minus(y.times(i)), u = i;
        return i = At(r.minus(t), n, 0, 1, 1), l = l.plus(i.times(h)), t = t.plus(i.times(n)), l.s = h.s = N.s, v = At(h, n, s, 1).minus(N).abs().cmp(At(l, t, s, 1).minus(N).abs()) < 1 ? [h, n] : [l, t], S.precision = c, Ne = !0, v
    }, U.toHexadecimal = U.toHex = function(r, e) {
        return ra(this, 16, r, e)
    }, U.toNearest = function(r, e) {
        var t = this,
            n = t.constructor;
        if (t = new n(t), r == null) {
            if (!t.d) return t;
            r = new n(1), e = n.rounding
        } else {
            if (r = new n(r), e === void 0 ? e = n.rounding : Xt(e, 0, 8), !t.d) return r.s ? t : r;
            if (!r.d) return r.s && (r.s = t.s), r
        }
        return r.d[0] ? (Ne = !1, t = At(t, r, 0, e, 1).times(r), Ne = !0, ne(t)) : (r.s = t.s, t = r), t
    }, U.toNumber = function() {
        return +this
    }, U.toOctal = function(r, e) {
        return ra(this, 8, r, e)
    }, U.toPower = U.pow = function(r) {
        var e, t, n, i, s, o, u = this,
            l = u.constructor,
            h = +(r = new l(r));
        if (!(u.d && r.d && u.d[0] && r.d[0])) return new l(Bt(+u, h));
        if ((u = new l(u)).eq(1)) return u;
        if (n = l.precision, s = l.rounding, r.eq(1)) return ne(u, n, s);
        if ((e = Gt(r.e / oe)) >= r.d.length - 1 && (t = h < 0 ? -h : h) <= 9007199254740991) return i = cl(l, u, t, n), r.s < 0 ? new l(1).div(i) : ne(i, n, s);
        if ((o = u.s) < 0) {
            if (e < r.d.length - 1) return new l(NaN);
            if (!(1 & r.d[e]) && (o = 1), u.e == 0 && u.d[0] == 1 && u.d.length == 1) return u.s = o, u
        }
        return (e = (t = Bt(+u, h)) != 0 && isFinite(t) ? new l(t + "").e : Gt(h * (Math.log("0." + Lt(u.d)) / Math.LN10 + u.e + 1))) > l.maxE + 1 || e < l.minE - 1 ? new l(e > 0 ? o / 0 : 0) : (Ne = !1, l.rounding = u.s = 1, t = Math.min(12, (e + "").length), (i = ea(r.times(Nn(u, n + t)), n)).d && Zi((i = ne(i, n + 5, 1)).d, n, s) && (e = n + 10, +Lt((i = ne(ea(r.times(Nn(u, e + t)), e), e + 5, 1)).d).slice(n + 1, n + 15) + 1 == 1e14 && (i = ne(i, n + 1, 0))), i.s = o, Ne = !0, l.rounding = s, ne(i, n, s))
    }, U.toPrecision = function(r, e) {
        var t, n = this,
            i = n.constructor;
        return r === void 0 ? t = qr(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (Xt(r, 1, xn), e === void 0 ? e = i.rounding : Xt(e, 0, 8), t = qr(n = ne(new i(n), r, e), r <= n.e || n.e <= i.toExpNeg, r)), n.isNeg() && !n.isZero() ? "-" + t : t
    }, U.toSignificantDigits = U.toSD = function(r, e) {
        var t = this.constructor;
        return r === void 0 ? (r = t.precision, e = t.rounding) : (Xt(r, 1, xn), e === void 0 ? e = t.rounding : Xt(e, 0, 8)), ne(new t(this), r, e)
    }, U.toString = function() {
        var r = this,
            e = r.constructor,
            t = qr(r, r.e <= e.toExpNeg || r.e >= e.toExpPos);
        return r.isNeg() && !r.isZero() ? "-" + t : t
    }, U.truncated = U.trunc = function() {
        return ne(new this.constructor(this), this.e + 1, 1)
    }, U.valueOf = U.toJSON = function() {
        var r = this,
            e = r.constructor,
            t = qr(r, r.e <= e.toExpNeg || r.e >= e.toExpPos);
        return r.isNeg() ? "-" + t : t
    };
    var At = function() {
        function r(n, i, s) {
            var o, u = 0,
                l = n.length;
            for (n = n.slice(); l--;) o = n[l] * i + u, n[l] = o % s | 0, u = o / s | 0;
            return u && n.unshift(u), n
        }

        function e(n, i, s, o) {
            var u, l;
            if (s != o) l = s > o ? 1 : -1;
            else
                for (u = l = 0; u < s; u++)
                    if (n[u] != i[u]) {
                        l = n[u] > i[u] ? 1 : -1;
                        break
                    } return l
        }

        function t(n, i, s, o) {
            for (var u = 0; s--;) n[s] -= u, u = n[s] < i[s] ? 1 : 0, n[s] = u * o + n[s] - i[s];
            for (; !n[0] && n.length > 1;) n.shift()
        }
        return function(n, i, s, o, u, l) {
            var h, c, y, v, N, P, S, O, I, C, R, G, q, J, ue, W, se, m, w, M, p = n.constructor,
                a = n.s == i.s ? 1 : -1,
                d = n.d,
                f = i.d;
            if (!(d && d[0] && f && f[0])) return new p(n.s && i.s && (d ? !f || d[0] != f[0] : f) ? d && d[0] == 0 || !f ? 0 * a : a / 0 : NaN);
            for (l ? (N = 1, c = n.e - i.e) : (l = _r, N = oe, c = Gt(n.e / N) - Gt(i.e / N)), w = f.length, se = d.length, C = (I = new p(a)).d = [], y = 0; f[y] == (d[y] || 0); y++);
            if (f[y] > (d[y] || 0) && c--, s == null ? (J = s = p.precision, o = p.rounding) : J = u ? s + (n.e - i.e) + 1 : s, J < 0) C.push(1), P = !0;
            else {
                if (J = J / N + 2 | 0, y = 0, w == 1) {
                    for (v = 0, f = f[0], J++;
                        (y < se || v) && J--; y++) ue = v * l + (d[y] || 0), C[y] = ue / f | 0, v = ue % f | 0;
                    P = v || y < se
                } else {
                    for ((v = l / (f[0] + 1) | 0) > 1 && (f = r(f, v, l), d = r(d, v, l), w = f.length, se = d.length), W = w, G = (R = d.slice(0, w)).length; G < w;) R[G++] = 0;
                    (M = f.slice()).unshift(0), m = f[0], f[1] >= l / 2 && ++m;
                    do v = 0, (h = e(f, R, w, G)) < 0 ? (q = R[0], w != G && (q = q * l + (R[1] || 0)), (v = q / m | 0) > 1 ? (v >= l && (v = l - 1), (h = e(S = r(f, v, l), R, O = S.length, G = R.length)) == 1 && (v--, t(S, w < O ? M : f, O, l))) : (v == 0 && (h = v = 1), S = f.slice()), (O = S.length) < G && S.unshift(0), t(R, S, G, l), h == -1 && (h = e(f, R, w, G = R.length)) < 1 && (v++, t(R, w < G ? M : f, G, l)), G = R.length) : h === 0 && (v++, R = [0]), C[y++] = v, h && R[0] ? R[G++] = d[W] || 0 : (R = [d[W]], G = 1); while ((W++ < se || R[0] !== void 0) && J--);
                    P = R[0] !== void 0
                }
                C[0] || C.shift()
            }
            if (N == 1) I.e = c, ol = P;
            else {
                for (y = 1, v = C[0]; v >= 10; v /= 10) y++;
                I.e = y + c * N - 1, ne(I, u ? s + I.e + 1 : s, o, P)
            }
            return I
        }
    }();

    function ne(r, e, t, n) {
        var i, s, o, u, l, h, c, y, v, N = r.constructor;
        e: if (e != null) {
            if (!(y = r.d)) return r;
            for (i = 1, u = y[0]; u >= 10; u /= 10) i++;
            if ((s = e - i) < 0) s += oe, o = e, l = (c = y[v = 0]) / Bt(10, i - o - 1) % 10 | 0;
            else if ((v = Math.ceil((s + 1) / oe)) >= (u = y.length)) {
                if (!n) break e;
                for (; u++ <= v;) y.push(0);
                c = l = 0, i = 1, o = (s %= oe) - oe + 1
            } else {
                for (c = u = y[v], i = 1; u >= 10; u /= 10) i++;
                l = (o = (s %= oe) - oe + i) < 0 ? 0 : c / Bt(10, i - o - 1) % 10 | 0
            }
            if (n = n || e < 0 || y[v + 1] !== void 0 || (o < 0 ? c : c % Bt(10, i - o - 1)), h = t < 4 ? (l || n) && (t == 0 || t == (r.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (t == 4 || n || t == 6 && (s > 0 ? o > 0 ? c / Bt(10, i - o) : 0 : y[v - 1]) % 10 & 1 || t == (r.s < 0 ? 8 : 7)), e < 1 || !y[0]) return y.length = 0, h ? (e -= r.e + 1, y[0] = Bt(10, (oe - e % oe) % oe), r.e = -e || 0) : y[0] = r.e = 0, r;
            if (s == 0 ? (y.length = v, u = 1, v--) : (y.length = v + 1, u = Bt(10, oe - s), y[v] = o > 0 ? (c / Bt(10, i - o) % Bt(10, o) | 0) * u : 0), h)
                for (;;) {
                    if (v == 0) {
                        for (s = 1, o = y[0]; o >= 10; o /= 10) s++;
                        for (o = y[0] += u, u = 1; o >= 10; o /= 10) u++;
                        s != u && (r.e++, y[0] == _r && (y[0] = 1));
                        break
                    }
                    if (y[v] += u, y[v] != _r) break;
                    y[v--] = 0, u = 1
                }
            for (s = y.length; y[--s] === 0;) y.pop()
        }
        return Ne && (r.e > N.maxE ? (r.d = null, r.e = NaN) : r.e < N.minE && (r.e = 0, r.d = [0])), r
    }

    function qr(r, e, t) {
        if (!r.isFinite()) return ml(r);
        var n, i = r.e,
            s = Lt(r.d),
            o = s.length;
        return e ? (t && (n = t - o) > 0 ? s = s.charAt(0) + "." + s.slice(1) + Mn(n) : o > 1 && (s = s.charAt(0) + "." + s.slice(1)), s = s + (r.e < 0 ? "e" : "e+") + r.e) : i < 0 ? (s = "0." + Mn(-i - 1) + s, t && (n = t - o) > 0 && (s += Mn(n))) : i >= o ? (s += Mn(i + 1 - o), t && (n = t - i - 1) > 0 && (s = s + "." + Mn(n))) : ((n = i + 1) < o && (s = s.slice(0, n) + "." + s.slice(n)), t && (n = t - o) > 0 && (i + 1 === o && (s += "."), s += Mn(n))), s
    }

    function Ds(r, e) {
        var t = r[0];
        for (e *= oe; t >= 10; t /= 10) e++;
        return e
    }

    function Ls(r, e, t) {
        if (e > u0) throw Ne = !0, t && (r.precision = t), Error(al);
        return ne(new r(Cs), e, 1, !0)
    }

    function Mr(r, e, t) {
        if (e > Xo) throw Error(al);
        return ne(new r(Bs), e, t, !0)
    }

    function fl(r) {
        var e = r.length - 1,
            t = e * oe + 1;
        if (e = r[e]) {
            for (; e % 10 == 0; e /= 10) t--;
            for (e = r[0]; e >= 10; e /= 10) t++
        }
        return t
    }

    function Mn(r) {
        for (var e = ""; r--;) e += "0";
        return e
    }

    function cl(r, e, t, n) {
        var i, s = new r(1),
            o = Math.ceil(n / oe + 4);
        for (Ne = !1;;) {
            if (t % 2 && yl((s = s.times(e)).d, o) && (i = !0), (t = Gt(t / 2)) === 0) {
                t = s.d.length - 1, i && s.d[t] === 0 && ++s.d[t];
                break
            }
            yl((e = e.times(e)).d, o)
        }
        return Ne = !0, s
    }

    function dl(r) {
        return 1 & r.d[r.d.length - 1]
    }

    function pl(r, e, t) {
        for (var n, i = new r(e[0]), s = 0; ++s < e.length;) {
            if (!(n = new r(e[s])).s) {
                i = n;
                break
            }
            i[t](n) && (i = n)
        }
        return i
    }

    function ea(r, e) {
        var t, n, i, s, o, u, l, h = 0,
            c = 0,
            y = 0,
            v = r.constructor,
            N = v.rounding,
            P = v.precision;
        if (!r.d || !r.d[0] || r.e > 17) return new v(r.d ? r.d[0] ? r.s < 0 ? 0 : 1 / 0 : 1 : r.s ? r.s < 0 ? 0 : r : NaN);
        for (e == null ? (Ne = !1, l = P) : l = e, u = new v(.03125); r.e > -2;) r = r.times(u), y += 5;
        for (l += n = Math.log(Bt(2, y)) / Math.LN10 * 2 + 5 | 0, t = s = o = new v(1), v.precision = l;;) {
            if (s = ne(s.times(r), l, 1), t = t.times(++c), Lt((u = o.plus(At(s, t, l, 1))).d).slice(0, l) === Lt(o.d).slice(0, l)) {
                for (i = y; i--;) o = ne(o.times(o), l, 1);
                if (e != null) return v.precision = P, o;
                if (!(h < 3 && Zi(o.d, l - n, N, h))) return ne(o, v.precision = P, N, Ne = !0);
                v.precision = l += 10, t = s = u = new v(1), c = 0, h++
            }
            o = u
        }
    }

    function Nn(r, e) {
        var t, n, i, s, o, u, l, h, c, y, v, N = 1,
            P = r,
            S = P.d,
            O = P.constructor,
            I = O.rounding,
            C = O.precision;
        if (P.s < 0 || !S || !S[0] || !P.e && S[0] == 1 && S.length == 1) return new O(S && !S[0] ? -1 / 0 : P.s != 1 ? NaN : S ? 0 : P);
        if (e == null ? (Ne = !1, c = C) : c = e, O.precision = c += 10, n = (t = Lt(S)).charAt(0), !(Math.abs(s = P.e) < 15e14)) return h = Ls(O, c + 2, C).times(s + ""), P = Nn(new O(n + "." + t.slice(1)), c - 10).plus(h), O.precision = C, e == null ? ne(P, C, I, Ne = !0) : P;
        for (; n < 7 && n != 1 || n == 1 && t.charAt(1) > 3;) n = (t = Lt((P = P.times(r)).d)).charAt(0), N++;
        for (s = P.e, n > 1 ? (P = new O("0." + t), s++) : P = new O(n + "." + t.slice(1)), y = P, l = o = P = At(P.minus(1), P.plus(1), c, 1), v = ne(P.times(P), c, 1), i = 3;;) {
            if (o = ne(o.times(v), c, 1), Lt((h = l.plus(At(o, new O(i), c, 1))).d).slice(0, c) === Lt(l.d).slice(0, c)) {
                if (l = l.times(2), s !== 0 && (l = l.plus(Ls(O, c + 2, C).times(s + ""))), l = At(l, new O(N), c, 1), e != null) return O.precision = C, l;
                if (!Zi(l.d, c - 10, I, u)) return ne(l, O.precision = C, I, Ne = !0);
                O.precision = c += 10, h = o = P = At(y.minus(1), y.plus(1), c, 1), v = ne(P.times(P), c, 1), i = u = 1
            }
            l = h, i += 2
        }
    }

    function ml(r) {
        return String(r.s * r.s / 0)
    }

    function ta(r, e) {
        var t, n, i;
        for ((t = e.indexOf(".")) > -1 && (e = e.replace(".", "")), (n = e.search(/e/i)) > 0 ? (t < 0 && (t = n), t += +e.slice(n + 1), e = e.substring(0, n)) : t < 0 && (t = e.length), n = 0; e.charCodeAt(n) === 48; n++);
        for (i = e.length; e.charCodeAt(i - 1) === 48; --i);
        if (e = e.slice(n, i)) {
            if (i -= n, r.e = t = t - n - 1, r.d = [], n = (t + 1) % oe, t < 0 && (n += oe), n < i) {
                for (n && r.d.push(+e.slice(0, n)), i -= oe; n < i;) r.d.push(+e.slice(n, n += oe));
                e = e.slice(n), n = oe - e.length
            } else n -= i;
            for (; n--;) e += "0";
            r.d.push(+e), Ne && (r.e > r.constructor.maxE ? (r.d = null, r.e = NaN) : r.e < r.constructor.minE && (r.e = 0, r.d = [0]))
        } else r.e = 0, r.d = [0];
        return r
    }

    function l0(r, e) {
        var t, n, i, s, o, u, l, h, c;
        if (e.indexOf("_") > -1) {
            if (e = e.replace(/(\d)_(?=\d)/g, "$1"), hl.test(e)) return ta(r, e)
        } else if (e === "Infinity" || e === "NaN") return +e || (r.s = NaN), r.e = NaN, r.d = null, r;
        if (o0.test(e)) t = 16, e = e.toLowerCase();
        else if (s0.test(e)) t = 2;
        else {
            if (!a0.test(e)) throw Error(_n + e);
            t = 8
        }
        for ((s = e.search(/p/i)) > 0 ? (l = +e.slice(s + 1), e = e.substring(2, s)) : e = e.slice(2), o = (s = e.indexOf(".")) >= 0, n = r.constructor, o && (s = (u = (e = e.replace(".", "")).length) - s, i = cl(n, new n(t), s, 2 * s)), s = c = (h = Fs(e, t, _r)).length - 1; h[s] === 0; --s) h.pop();
        return s < 0 ? new n(0 * r.s) : (r.e = Ds(h, c), r.d = h, Ne = !1, o && (r = At(r, i, 4 * u)), l && (r = r.times(Math.abs(l) < 54 ? Bt(2, l) : Q.pow(2, l))), Ne = !0, r)
    }

    function di(r, e, t, n, i) {
        var s, o, u, l, h = r.precision,
            c = Math.ceil(h / oe);
        for (Ne = !1, l = t.times(t), u = new r(n);;) {
            if (o = At(u.times(l), new r(e++ * e++), h, 1), u = i ? n.plus(o) : n.minus(o), n = At(o.times(l), new r(e++ * e++), h, 1), (o = u.plus(n)).d[c] !== void 0) {
                for (s = c; o.d[s] === u.d[s] && s--;);
                if (s == -1) break
            }
            s = u, u = n, n = o, o = s
        }
        return Ne = !0, o.d.length = c + 1, o
    }

    function Us(r, e) {
        for (var t = r; --e;) t *= r;
        return t
    }

    function gl(r, e) {
        var t, n = e.s < 0,
            i = Mr(r, r.precision, 1),
            s = i.times(.5);
        if ((e = e.abs()).lte(s)) return an = n ? 4 : 1, e;
        if ((t = e.divToInt(i)).isZero()) an = n ? 3 : 2;
        else {
            if ((e = e.minus(t.times(i))).lte(s)) return an = dl(t) ? n ? 2 : 3 : n ? 4 : 1, e;
            an = dl(t) ? n ? 1 : 4 : n ? 3 : 2
        }
        return e.minus(i).abs()
    }

    function ra(r, e, t, n) {
        var i, s, o, u, l, h, c, y, v, N = r.constructor,
            P = t !== void 0;
        if (P ? (Xt(t, 1, xn), n === void 0 ? n = N.rounding : Xt(n, 0, 8)) : (t = N.precision, n = N.rounding), r.isFinite()) {
            for (P ? (i = 2, e == 16 ? t = 4 * t - 3 : e == 8 && (t = 3 * t - 2)) : i = e, (o = (c = qr(r)).indexOf(".")) >= 0 && (c = c.replace(".", ""), (v = new N(1)).e = c.length - o, v.d = Fs(qr(v), 10, i), v.e = v.d.length), s = l = (y = Fs(c, 10, i)).length; y[--l] == 0;) y.pop();
            if (y[0]) {
                if (o < 0 ? s-- : ((r = new N(r)).d = y, r.e = s, y = (r = At(r, v, t, n, 0, i)).d, s = r.e, h = ol), o = y[t], u = i / 2, h = h || y[t + 1] !== void 0, h = n < 4 ? (o !== void 0 || h) && (n === 0 || n === (r.s < 0 ? 3 : 2)) : o > u || o === u && (n === 4 || h || n === 6 && 1 & y[t - 1] || n === (r.s < 0 ? 8 : 7)), y.length = t, h)
                    for (; ++y[--t] > i - 1;) y[t] = 0, t || (++s, y.unshift(1));
                for (l = y.length; !y[l - 1]; --l);
                for (o = 0, c = ""; o < l; o++) c += Qo.charAt(y[o]);
                if (P) {
                    if (l > 1)
                        if (e == 16 || e == 8) {
                            for (o = e == 16 ? 4 : 3, --l; l % o; l++) c += "0";
                            for (l = (y = Fs(c, i, e)).length; !y[l - 1]; --l);
                            for (o = 1, c = "1."; o < l; o++) c += Qo.charAt(y[o])
                        } else c = c.charAt(0) + "." + c.slice(1);
                    c = c + (s < 0 ? "p" : "p+") + s
                } else if (s < 0) {
                    for (; ++s;) c = "0" + c;
                    c = "0." + c
                } else if (++s > l)
                    for (s -= l; s--;) c += "0";
                else s < l && (c = c.slice(0, s) + "." + c.slice(s))
            } else c = P ? "0p+0" : "0";
            c = (e == 16 ? "0x" : e == 2 ? "0b" : e == 8 ? "0o" : "") + c
        } else c = ml(r);
        return r.s < 0 ? "-" + c : c
    }

    function yl(r, e) {
        if (r.length > e) return r.length = e, !0
    }

    function h0(r) {
        return new this(r).abs()
    }

    function f0(r) {
        return new this(r).acos()
    }

    function c0(r) {
        return new this(r).acosh()
    }

    function d0(r, e) {
        return new this(r).plus(e)
    }

    function p0(r) {
        return new this(r).asin()
    }

    function m0(r) {
        return new this(r).asinh()
    }

    function g0(r) {
        return new this(r).atan()
    }

    function y0(r) {
        return new this(r).atanh()
    }

    function v0(r, e) {
        r = new this(r), e = new this(e);
        var t, n = this.precision,
            i = this.rounding,
            s = n + 4;
        return r.s && e.s ? r.d || e.d ? !e.d || r.isZero() ? (t = e.s < 0 ? Mr(this, n, i) : new this(0)).s = r.s : !r.d || e.isZero() ? (t = Mr(this, s, 1).times(.5)).s = r.s : e.s < 0 ? (this.precision = s, this.rounding = 1, t = this.atan(At(r, e, s, 1)), e = Mr(this, s, 1), this.precision = n, this.rounding = i, t = r.s < 0 ? t.minus(e) : t.plus(e)) : t = this.atan(At(r, e, s, 1)) : (t = Mr(this, s, 1).times(e.s > 0 ? .25 : .75)).s = r.s : t = new this(NaN), t
    }

    function w0(r) {
        return new this(r).cbrt()
    }

    function b0(r) {
        return ne(r = new this(r), r.e + 1, 2)
    }

    function A0(r, e, t) {
        return new this(r).clamp(e, t)
    }

    function E0(r) {
        if (!r || typeof r != "object") throw Error(Os + "Object expected");
        var e, t, n, i = r.defaults === !0,
            s = ["precision", 1, xn, "rounding", 0, 8, "toExpNeg", -ci, 0, "toExpPos", 0, ci, "maxE", 0, ci, "minE", -ci, 0, "modulo", 0, 9];
        for (e = 0; e < s.length; e += 3)
            if (t = s[e], i && (this[t] = Yo[t]), (n = r[t]) !== void 0) {
                if (!(Gt(n) === n && n >= s[e + 1] && n <= s[e + 2])) throw Error(_n + t + ": " + n);
                this[t] = n
            }
        if (t = "crypto", i && (this[t] = Yo[t]), (n = r[t]) !== void 0) {
            if (n !== !0 && n !== !1 && n !== 0 && n !== 1) throw Error(_n + t + ": " + n);
            if (n) {
                if (typeof crypto > "u" || !crypto || !crypto.getRandomValues && !crypto.randomBytes) throw Error(ul);
                this[t] = !0
            } else this[t] = !1
        }
        return this
    }

    function x0(r) {
        return new this(r).cos()
    }

    function _0(r) {
        return new this(r).cosh()
    }

    function M0(r, e) {
        return new this(r).div(e)
    }

    function N0(r) {
        return new this(r).exp()
    }

    function T0(r) {
        return ne(r = new this(r), r.e + 1, 3)
    }

    function P0() {
        var r, e, t = new this(0);
        for (Ne = !1, r = 0; r < arguments.length;)
            if ((e = new this(arguments[r++])).d) t.d && (t = t.plus(e.times(e)));
            else {
                if (e.s) return Ne = !0, new this(1 / 0);
                t = e
            }
        return Ne = !0, t.sqrt()
    }

    function vl(r) {
        return r instanceof Q || r && r.toStringTag === ll || !1
    }

    function k0(r) {
        return new this(r).ln()
    }

    function S0(r, e) {
        return new this(r).log(e)
    }

    function R0(r) {
        return new this(r).log(2)
    }

    function I0(r) {
        return new this(r).log(10)
    }

    function C0() {
        return pl(this, arguments, "lt")
    }

    function B0() {
        return pl(this, arguments, "gt")
    }

    function O0(r, e) {
        return new this(r).mod(e)
    }

    function F0(r, e) {
        return new this(r).mul(e)
    }

    function D0(r, e) {
        return new this(r).pow(e)
    }

    function L0(r) {
        var e, t, n, i, s = 0,
            o = new this(1),
            u = [];
        if (r === void 0 ? r = this.precision : Xt(r, 1, xn), n = Math.ceil(r / oe), this.crypto)
            if (crypto.getRandomValues)
                for (e = crypto.getRandomValues(new Uint32Array(n)); s < n;)(i = e[s]) >= 429e7 ? e[s] = crypto.getRandomValues(new Uint32Array(1))[0] : u[s++] = i % 1e7;
            else {
                if (!crypto.randomBytes) throw Error(ul);
                for (e = crypto.randomBytes(n *= 4); s < n;)(i = e[s] + (e[s + 1] << 8) + (e[s + 2] << 16) + ((127 & e[s + 3]) << 24)) >= 214e7 ? crypto.randomBytes(4).copy(e, s) : (u.push(i % 1e7), s += 4);
                s = n / 4
            }
        else
            for (; s < n;) u[s++] = 1e7 * Math.random() | 0;
        for (n = u[--s], r %= oe, n && r && (i = Bt(10, oe - r), u[s] = (n / i | 0) * i); u[s] === 0; s--) u.pop();
        if (s < 0) t = 0, u = [0];
        else {
            for (t = -1; u[0] === 0; t -= oe) u.shift();
            for (n = 1, i = u[0]; i >= 10; i /= 10) n++;
            n < oe && (t -= oe - n)
        }
        return o.e = t, o.d = u, o
    }

    function U0(r) {
        return ne(r = new this(r), r.e + 1, this.rounding)
    }

    function $0(r) {
        return (r = new this(r)).d ? r.d[0] ? r.s : 0 * r.s : r.s || NaN
    }

    function q0(r) {
        return new this(r).sin()
    }

    function z0(r) {
        return new this(r).sinh()
    }

    function G0(r) {
        return new this(r).sqrt()
    }

    function H0(r, e) {
        return new this(r).sub(e)
    }

    function j0() {
        var r = 0,
            e = arguments,
            t = new this(e[r]);
        for (Ne = !1; t.s && ++r < e.length;) t = t.plus(e[r]);
        return Ne = !0, ne(t, this.precision, this.rounding)
    }

    function K0(r) {
        return new this(r).tan()
    }

    function J0(r) {
        return new this(r).tanh()
    }

    function V0(r) {
        return ne(r = new this(r), r.e + 1, 1)
    }
    U[Symbol.for("nodejs.util.inspect.custom")] = U.toString, U[Symbol.toStringTag] = "Decimal";
    var Q = U.constructor = function r(e) {
        var t, n, i;

        function s(o) {
            var u, l, h, c = this;
            if (!(c instanceof s)) return new s(o);
            if (c.constructor = s, vl(o)) return c.s = o.s, void(Ne ? !o.d || o.e > s.maxE ? (c.e = NaN, c.d = null) : o.e < s.minE ? (c.e = 0, c.d = [0]) : (c.e = o.e, c.d = o.d.slice()) : (c.e = o.e, c.d = o.d ? o.d.slice() : o.d));
            if ((h = typeof o) == "number") {
                if (o === 0) return c.s = 1 / o < 0 ? -1 : 1, c.e = 0, void(c.d = [0]);
                if (o < 0 ? (o = -o, c.s = -1) : c.s = 1, o === ~~o && o < 1e7) {
                    for (u = 0, l = o; l >= 10; l /= 10) u++;
                    return void(Ne ? u > s.maxE ? (c.e = NaN, c.d = null) : u < s.minE ? (c.e = 0, c.d = [0]) : (c.e = u, c.d = [o]) : (c.e = u, c.d = [o]))
                }
                return 0 * o != 0 ? (o || (c.s = NaN), c.e = NaN, void(c.d = null)) : ta(c, o.toString())
            }
            if (h !== "string") throw Error(_n + o);
            return (l = o.charCodeAt(0)) === 45 ? (o = o.slice(1), c.s = -1) : (l === 43 && (o = o.slice(1)), c.s = 1), hl.test(o) ? ta(c, o) : l0(c, o)
        }
        if (s.prototype = U, s.ROUND_UP = 0, s.ROUND_DOWN = 1, s.ROUND_CEIL = 2, s.ROUND_FLOOR = 3, s.ROUND_HALF_UP = 4, s.ROUND_HALF_DOWN = 5, s.ROUND_HALF_EVEN = 6, s.ROUND_HALF_CEIL = 7, s.ROUND_HALF_FLOOR = 8, s.EUCLID = 9, s.config = s.set = E0, s.clone = r, s.isDecimal = vl, s.abs = h0, s.acos = f0, s.acosh = c0, s.add = d0, s.asin = p0, s.asinh = m0, s.atan = g0, s.atanh = y0, s.atan2 = v0, s.cbrt = w0, s.ceil = b0, s.clamp = A0, s.cos = x0, s.cosh = _0, s.div = M0, s.exp = N0, s.floor = T0, s.hypot = P0, s.ln = k0, s.log = S0, s.log10 = I0, s.log2 = R0, s.max = C0, s.min = B0, s.mod = O0, s.mul = F0, s.pow = D0, s.random = L0, s.round = U0, s.sign = $0, s.sin = q0, s.sinh = z0, s.sqrt = G0, s.sub = H0, s.sum = j0, s.tan = K0, s.tanh = J0, s.trunc = V0, e === void 0 && (e = {}), e && e.defaults !== !0)
            for (i = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], t = 0; t < i.length;) e.hasOwnProperty(n = i[t++]) || (e[n] = this[n]);
        return s.config(e), s
    }(Yo);
    Cs = new Q(Cs), Bs = new Q(Bs), Q.set({
        precision: 100,
        rounding: Q.ROUND_HALF_DOWN,
        toExpNeg: -30,
        toExpPos: 30
    });
    const Z0 = (r, e) => r.lt(e) ? r : e,
        $s = (r, e) => r.gt(e) ? r : e,
        Tn = 2 ** 48,
        W0 = new Q(10),
        na = (r, e) => {
            const t = r - e;
            return W0.pow(t)
        },
        pi = r => new Q(r.toString()),
        un = r => Y.from(r.toFixed()),
        wl = (r, e, t) => e.eq(t) ? r : r.mul(e).div(t);

    function Pn(r, e) {
        return new Q(r).toFixed(e, Q.ROUND_DOWN).replace(/(\.\d*?[1-9])0+$|\.0*$/, "$1")
    }

    function Wi(r, e) {
        const t = Pn(r, e);
        return i0(t, e)
    }

    function ir(r, e) {
        const t = n0(r, e);
        return new Q(t).toFixed()
    }
    var kn;
    (function(r) {
        r.Fast = "Fast", r.Best = "Best"
    })(kn || (kn = {}));
    let Q0 = class {
        constructor(e) {
            Re(this, "_fetcher");
            Re(this, "_cachedDecimals", new Map);
            this._fetcher = e
        }
        async fetchDecimals(e) {
            let t = this._cachedDecimals.get(e);
            if (t !== void 0) return t;
            if (t = await this._fetcher(e), t === void 0) throw new Error(`Could not fetch decimals for token ${e}`);
            return this._cachedDecimals.set(e, t), t
        }
    };

    function bl(r) {
        return r.gt(0) ? Q.log2(r.toString()).add(1).floor().toNumber() : 0
    }
    const mi = r => {
            const e = un(r.sqrt().mul(Tn).floor()),
                t = bl(e.div(Tn));
            return pi(e.shr(t).shl(t))
        },
        ia = r => r.div(Tn).pow(2),
        Al = r => {
            const e = bl(r.div(Tn)),
                t = r.shr(e);
            return Y.from(Tn).mul(e).or(t)
        },
        Sn = r => r.mod(Tn).shl(r.div(Tn).toNumber()),
        Y0 = ([r, e]) => {
            const t = new Q(r.liquidity),
                n = new Q(r.lowestRate),
                i = new Q(r.highestRate),
                s = new Q(e.liquidity),
                o = new Q(e.lowestRate),
                u = new Q(e.highestRate);
            return t.eq(0) && s.gt(0) && o.gt(0) && u.gt(0) ? [Hn(r, sa(e)), Hn(e)] : s.eq(0) && t.gt(0) && n.gt(0) && i.gt(0) ? [Hn(r), Hn(e, sa(r))] : [Hn(r), Hn(e)]
        },
        Hn = (r, e) => {
            const t = new Q(r.liquidity),
                n = new Q(r.lowestRate),
                i = new Q(r.highestRate),
                s = new Q(r.marginalRate);
            if (!(i.gte(s) && s.gt(n) || i.eq(s) && s.eq(n) || i.gt(s) && s.eq(n) && t.isZero())) throw new Error(`Either one of the following must hold:
- highestRate >= marginalRate > lowestRate
- highestRate == marginalRate == lowestRate
- (highestRate > marginalRate == lowestRate) AND liquidity == 0
(highestRate = ${i}, marginalRate = ${s}, lowestRate = ${n}), liquidity = ${t}`);
            const o = un(t),
                u = un(mi(n)),
                l = un(mi(i)),
                h = un(mi(s));
            return {
                y: o,
                z: e !== void 0 ? e : l.eq(h) || o.isZero() ? o : o.mul(l.sub(u)).div(h.sub(u)),
                A: Al(l.sub(u)),
                B: Al(u)
            }
        },
        Qi = r => {
            const e = pi(r.y),
                t = pi(r.z),
                n = pi(Sn(r.A)),
                i = pi(Sn(r.B));
            return {
                liquidity: e.toString(),
                lowestRate: ia(i).toString(),
                highestRate: ia(i.add(n)).toString(),
                marginalRate: ia(e.eq(t) ? i.add(n) : i.add(n.mul(e).div(t))).toString()
            }
        },
        El = (r, e) => {
            const t = sa(r),
                n = un(mi(new Q(e.lowestRate))),
                i = un(mi(new Q(e.highestRate))),
                s = un(mi(new Q(e.marginalRate)));
            return t.mul(s.sub(n)).div(i.sub(n)).toString()
        },
        sa = r => {
            const e = pi(Hn(r).z),
                t = new Q(r.lowestRate),
                n = new Q(r.highestRate),
                i = t.mul(n).sqrt();
            return un(e.div(i).floor())
        },
        gi = Y.from(Tn),
        xl = Y.from(2).pow(128).sub(1),
        ln = Y.from(2).pow(256).sub(1);

    function yi(r, e) {
        if (r.gte(0) && r.lte(e)) return r;
        throw null
    }
    const _l = r => yi(r, xl),
        oa = (r, e) => yi(r.add(e), ln),
        cr = (r, e) => yi(r.mul(e), ln),
        aa = (r, e, t) => yi(r.mul(e).div(t), ln),
        hn = (r, e, t) => yi(r.mul(e).add(t).sub(1).div(t), ln),
        X0 = (r, e, t, n, i) => {
            if (n.eq(0)) return hn(r, cr(gi, gi), cr(i, i));
            const s = cr(t, gi),
                o = oa(cr(e, n), cr(t, i)),
                u = (l = o, h = cr(r, n), yi(l.sub(h), ln));
            var l, h;
            const c = hn(s, s, ln),
                y = hn(o, u, ln),
                v = $s(c, y),
                N = hn(s, s, v),
                P = aa(o, u, v);
            return hn(r, N, P)
        },
        ua = (r, e) => {
            const t = r,
                n = e.y,
                i = e.z,
                s = Sn(e.A),
                o = Sn(e.B);
            try {
                return _l(((u, l, h, c, y) => {
                    if (c.eq(0)) return aa(u, cr(y, y), cr(gi, gi));
                    const v = cr(h, gi),
                        N = oa(cr(l, c), cr(h, y)),
                        P = cr(N, u),
                        S = hn(v, v, ln),
                        O = hn(P, c, ln),
                        I = $s(S, O),
                        C = hn(v, v, I),
                        R = hn(P, c, I);
                    return aa(N, P.div(I), oa(C, R))
                })(t, n, i, s, o))
            } catch {
                return Y.from(0)
            }
        },
        qs = (r, e) => {
            const t = r,
                n = e.y,
                i = e.z,
                s = Sn(e.A),
                o = Sn(e.B);
            try {
                return _l(X0(t, n, i, s, o))
            } catch {
                return xl
            }
        },
        Ml = (r, e) => {
            const t = r.output.mul(e.input),
                n = e.output.mul(r.input),
                i = t.lt(n),
                s = t.gt(n),
                o = !i && !s;
            return +(i || o && r.output.lt(e.output)) - +(s || o && r.output.gt(e.output))
        },
        ed = (r, e) => Ml(e, r),
        td = (r, e) => {
            let t = r,
                n = ua(t, e);
            if (n.gt(e.y))
                for (t = qs(e.y, e), n = ua(t, e); n.gt(e.y);) t = t.sub(1), n = ua(t, e);
            return {
                input: t,
                output: n
            }
        },
        rd = (r, e) => {
            const t = Z0(r, e.y);
            return {
                input: t,
                output: qs(t, e)
            }
        },
        Nl = r => {
            const [e, t, n, i] = [r.y, r.z, r.A, r.B];
            return [e, t, Sn(n), Sn(i)]
        },
        Tl = r => {
            const [e, t, n, i] = Nl(r);
            return t.gt(0) ? e.mul(n).add(t.mul(i)).div(t) : Y.from(0)
        },
        Pl = (r, e) => {
            const [t, n, i, s] = Nl(r);
            return i.gt(0) ? t.mul(i).add(n.mul(s.sub(e))).div(i) : t
        },
        nd = (r, e) => qs(Pl(r, e), r),
        kl = (r, e, t, n, i, s, o) => {
            const u = ((h, c, y, v) => Object.keys(c).map(N => ({
                    id: Y.from(N),
                    rate: y(h, c[N])
                })).sort((N, P) => v(N.rate, P.rate)))(r, e, i, s),
                l = {};
            return t.includes(kn.Fast) && (l[kn.Fast] = ((h, c, y, v, N) => {
                const P = [];
                for (const S of y) {
                    if (!h.gt(S.rate.input)) {
                        if (h.eq(S.rate.input)) {
                            v(S.rate) && P.push({
                                id: S.id,
                                input: S.rate.input,
                                output: S.rate.output
                            });
                            break
                        } {
                            const O = {
                                input: h,
                                output: N(h, c[S.id.toString()]).output
                            };
                            v(O) && P.push({
                                id: S.id,
                                input: O.input,
                                output: O.output
                            });
                            break
                        }
                    }
                    v(S.rate) && (P.push({
                        id: S.id,
                        input: S.rate.input,
                        output: S.rate.output
                    }), h = h.sub(S.rate.input))
                }
                return P
            })(r, e, u, n, i)), t.includes(kn.Best) && (l[kn.Best] = ((h, c, y, v, N, P) => {
                const S = {
                        y: Y.from(0),
                        z: Y.from(0),
                        A: Y.from(0),
                        B: Y.from(0)
                    },
                    O = y.map(q => c[q.id.toString()]).concat(S);
                let I = [],
                    C = Y.from(0),
                    R = Y.from(0),
                    G = Y.from(0);
                for (let q = 1; q < O.length && (C = Tl(O[q]), I = O.slice(0, q).map(J => N(P(J, C), J)), R = I.reduce((J, ue) => J.add(ue.input), Y.from(0)), G = R.sub(h), !G.eq(0)); q++)
                    if (G.gt(0)) {
                        let J = C,
                            ue = Tl(O[q - 1]);
                        for (; J.add(1).lt(ue);)
                            if (C = J.add(ue).div(2), I = O.slice(0, q).map(W => N(P(W, C), W)), R = I.reduce((W, se) => W.add(se.input), Y.from(0)), G = R.sub(h), G.gt(0)) J = C;
                            else {
                                if (!G.lt(0)) break;
                                ue = C
                            }
                        break
                    }
                if (G.gt(0))
                    for (let q = I.length - 1; q >= 0; q--) {
                        const J = N(I[q].input.sub(G), O[q]);
                        if (G = G.add(J.input.sub(I[q].input)), I[q] = J, G.lte(0)) break
                    } else if (G.lt(0))
                        for (let q = 0; q <= I.length - 1; q++) {
                            const J = N(I[q].input.sub(G), O[q]);
                            if (G = G.add(J.input.sub(I[q].input)), G.gt(0)) break;
                            I[q] = J
                        }
                return [...Array(I.length).keys()].filter(q => v(I[q])).map(q => ({
                    id: y[q].id,
                    input: I[q].input,
                    output: I[q].output
                }))
            })(r, e, u, n, i, o)), l
        },
        Sl = r => r.input.gt(0) && r.output.gt(0),
        id = (r, e, t, n = Sl) => kl(r, e, t, n, td, Ml, nd),
        sd = (r, e, t, n = Sl) => kl(r, e, t, n, rd, ed, Pl);

    function od(r) {
        return r.reduce((e, t) => Q.min(e, t.lowestRate), new Q(1 / 0))
    }

    function ad(r) {
        return r.reduce((e, t) => Q.max(e, t.marginalRate), new Q(-1 / 0))
    }

    function ud(r, e) {
        const t = r.map(n => {
            const i = new Q(n.lowestRate).sqrt(),
                s = new Q(n.marginalRate).sqrt();
            return {
                liq: new Q(n.liquidity),
                min: i,
                mid: s,
                midMinusMin: s.sub(i)
            }
        });
        return e.map(n => {
            const i = n.sqrt();
            return t.reduce((s, o) => s.add(function(u, l) {
                return l.lte(u.min) ? u.liq : l.gte(u.mid) ? new Q(0) : u.liq.sub(u.liq.mul(l.sub(u.min)).div(u.midMinusMin))
            }(o, i)), new Q(0))
        })
    }
    const Rl = (() => {
            try {
                return self
            } catch {
                try {
                    return window
                } catch {
                    return global
                }
            }
        })(),
        Il = Rl !== void 0 && Number(Rl.CARBON_DEFI_SDK_VERBOSITY) || 0,
        ld = console.log;

    function la(r) {
        return r instanceof Y ? r.toString() : Array.isArray(r) ? r.map(la) : typeof r == "object" ? Object.fromEntries(Object.entries(r).map(([e, t]) => [e, la(t)])) : r
    }
    Il >= 2 && (console.debug = (...r) => {
        const e = r.map(la);
        ld.apply(console, e)
    });
    let vi = class {
        constructor(e) {
            Re(this, "_prefix");
            this._prefix = `[SDK][${e}]:`
        }
        error(...e) {
            console.error(this._prefix, ...e)
        }
        log(...e) {
            console.log(this._prefix, ...e)
        }
        debug(...e) {
            Il >= 1 && console.debug(this._prefix, ...e)
        }
    };
    const zs = r => function e(t) {
            if (Y.isBigNumber(t)) return t.toString();
            if (typeof t == "object" && t !== null) {
                const n = Array.isArray(t) ? [] : {};
                for (const i in t) n[i] = e(t[i]);
                return n
            }
            return t
        }(r),
        hd = r => zs(r),
        Gs = r => ({
            y: Y.from(r.y),
            z: Y.from(r.z),
            A: Y.from(r.A),
            B: Y.from(r.B)
        }),
        ha = r => zs(r),
        Hs = r => ({
            id: Y.from(r.id),
            token0: r.token0,
            token1: r.token1,
            order0: Gs(r.order0),
            order1: Gs(r.order1)
        }),
        fd = r => zs(r),
        cd = r => {
            const e = {};
            for (const [t, n] of Object.entries(r)) e[t] = Gs(n);
            return e
        },
        dd = r => zs(r),
        Cl = r => ({
            strategyId: Y.from(r.strategyId),
            amount: Y.from(r.amount)
        }),
        zr = new vi("utils.ts");

    function fn(r, e, t) {
        return new Q(r.toString()).times(na(e, t)).toFixed()
    }

    function wi(r, e, t) {
        return +r.toString() == 0 ? "0" : new Q(1).div(r.toString()).times(na(t, e)).toFixed()
    }
    const Bl = r => {
            const [e, t] = Y0([r.order0, r.order1]);
            return {
                token0: r.token0,
                token1: r.token1,
                order0: e,
                order1: t
            }
        },
        fa = r => ({
            id: r.id,
            token0: r.token0,
            token1: r.token1,
            order0: Qi(r.order0),
            order1: Qi(r.order1),
            encoded: r
        });
    async function ca(r, e) {
        zr.debug("parseStrategy called", arguments);
        const {
            id: t,
            token0: n,
            token1: i,
            order0: s,
            order1: o,
            encoded: u
        } = r, l = await e.fetchDecimals(n), h = await e.fetchDecimals(i), c = fn(o.lowestRate, l, h), y = fn(o.marginalRate, l, h), v = fn(o.highestRate, l, h), N = wi(s.highestRate, h, l), P = wi(s.marginalRate, h, l), S = wi(s.lowestRate, h, l), O = ir(s.liquidity, l), I = ir(o.liquidity, h), C = t.toString(), R = ha(u);
        return zr.debug("parseStrategy info:", {
            id: C,
            token0: n,
            token1: i,
            order0: s,
            order1: o,
            decimals0: l,
            decimals1: h,
            baseToken: n,
            quoteToken: i,
            buyPriceLow: c,
            buyPriceMarginal: y,
            buyPriceHigh: v,
            buyBudget: I,
            sellPriceLow: N,
            sellPriceMarginal: P,
            sellPriceHigh: S,
            sellBudget: O,
            encoded: R
        }), {
            id: C,
            baseToken: n,
            quoteToken: i,
            buyPriceLow: c,
            buyPriceMarginal: y,
            buyPriceHigh: v,
            buyBudget: I,
            sellPriceLow: N,
            sellPriceMarginal: P,
            sellPriceHigh: S,
            sellBudget: O,
            encoded: R
        }
    }

    function Ol(r, e, t, n, i, s, o, u, l, h, c, y) {
        if (zr.debug("buildStrategyObject called", arguments), new Q(i).isNegative() || new Q(s).isNegative() || new Q(o).isNegative() || new Q(l).isNegative() || new Q(h).isNegative() || new Q(c).isNegative()) throw new Error("prices cannot be negative");
        if (new Q(i).gt(s) || new Q(i).gt(o) || new Q(s).gt(o) || new Q(l).gt(h) || new Q(l).gt(c) || new Q(h).gt(c)) throw new Error("low/marginal price must be lower than or equal to marginal/high price");
        if (new Q(u).isNegative() || new Q(y).isNegative()) throw new Error("budgets cannot be negative");
        const {
            order0: v,
            order1: N
        } = pd(t, n, i, s, o, u, l, h, c, y);
        return zr.debug("buildStrategyObject info:", {
            token0: r,
            token1: e,
            order0: v,
            order1: N
        }), {
            token0: r,
            token1: e,
            order0: v,
            order1: N
        }
    }

    function da(r, e, t, n, i, s) {
        zr.debug("createFromBuyOrder called", arguments);
        const o = Wi(s, e),
            u = fn(t, e, r),
            l = fn(n, e, r),
            h = fn(i, e, r),
            c = {
                liquidity: o.toString(),
                lowestRate: u,
                highestRate: h,
                marginalRate: l
            };
        return zr.debug("createFromBuyOrder info:", {
            order: c
        }), c
    }

    function pa(r, e, t, n, i, s) {
        zr.debug("createFromSellOrder called", arguments);
        const o = Wi(s, r),
            u = wi(i, e, r),
            l = wi(n, e, r),
            h = wi(t, e, r),
            c = {
                liquidity: o.toString(),
                lowestRate: u,
                highestRate: h,
                marginalRate: l
            };
        return zr.debug("createFromSellOrder info:", {
            order: c
        }), c
    }

    function pd(r, e, t, n, i, s, o, u, l, h) {
        zr.debug("createOrders called", arguments);
        const c = pa(r, e, o, u, l, h),
            y = da(r, e, t, n, i, s);
        return zr.debug("createOrders info:", {
            order0: c,
            order1: y
        }), {
            order0: c,
            order1: y
        }
    }
    const js = 1e6;

    function Fl(r, e) {
        return new Q(r.toString()).mul(js).div(js - e).ceil()
    }

    function Dl(r, e) {
        return new Q(r.toString()).mul(js - e).div(js).floor()
    }

    function Ll(r, e, t) {
        return t.lte(r) ? r : t.gte(e) ? e : t
    }

    function ma(r, e, t, n) {
        const i = new Q(n).div(100).plus(1),
            s = new Q(e).div(i),
            o = new Q(r).mul(i),
            u = Ll(new Q(r), s, new Q(t).div(i.sqrt())),
            l = Ll(o, new Q(e), new Q(t).mul(i.sqrt()));
        return {
            buyPriceHigh: s.toString(),
            buyPriceMarginal: u.toString(),
            sellPriceLow: o.toString(),
            sellPriceMarginal: l.toString()
        }
    }

    function md(r, e, t, n, i, s, o) {
        if (o === "0") return "0";
        const {
            buyPriceHigh: u,
            sellPriceLow: l,
            sellPriceMarginal: h,
            buyPriceMarginal: c
        } = ma(t, n, i, s);
        if (new Q(h).gte(n)) return "0";
        if (new Q(c).lte(t)) throw new Error("calculateOverlappingSellBudget called with zero buy range and non zero buy budget");
        const y = da(r, e, t, c, u, o),
            v = pa(r, e, l, h, n, "0"),
            N = El(y, v);
        return ir(N, r)
    }

    function gd(r, e, t, n, i, s, o) {
        if (o === "0") return "0";
        const {
            sellPriceLow: u,
            buyPriceHigh: l,
            sellPriceMarginal: h,
            buyPriceMarginal: c
        } = ma(t, n, i, s);
        if (new Q(c).lte(t)) return "0";
        if (new Q(h).gte(n)) throw new Error("calculateOverlappingBuyBudget called with zero sell range and non zero sell budget");
        const y = da(r, e, t, c, l, "0"),
            v = pa(r, e, u, h, n, o),
            N = El(v, y);
        return ir(N, e)
    }
    const Be = new vi("Toolkit.ts");
    var Rn;

    function Ks(r) {
        return r !== void 0 && r !== Rn.reset && r !== Rn.maintain
    }(function(r) {
        r.reset = "RESET", r.maintain = "MAINTAIN"
    })(Rn || (Rn = {}));
    let yd = class Rc {
        constructor(e, t, n) {
            Re(this, "_api");
            Re(this, "_decimals");
            Re(this, "_cache");
            Be.debug("SDK class constructor called with", arguments), this._api = e, this._cache = t, this._decimals = new Q0(async i => await (n == null ? void 0 : n(i)) ? ? await this._api.reader.getDecimalsByAddress(i))
        }
        static getMatchActions(e, t, n, i = kn.Fast, s) {
            var l;
            const o = cd(n);
            let u;
            return u = t ? sd(Y.from(e), o, [i], s) : id(Y.from(e), o, [i], s), ((l = u[i]) == null ? void 0 : l.map(dd)) ? ? []
        }
        async hasLiquidityByPair(e, t) {
            Be.debug("hasLiquidityByPair called", arguments);
            const n = await this._cache.getOrdersByPair(e, t);
            return Be.debug("hasLiquidityByPair info:", {
                orders: n
            }), Object.keys(n).length > 0
        }
        async getLiquidityByPair(e, t) {
            Be.debug("getLiquidityByPair called", arguments);
            const n = await this._cache.getOrdersByPair(e, t),
                i = Object.values(n).reduce((u, {
                    y: l
                }) => u.add(l), Y.from(0)),
                s = await this._decimals.fetchDecimals(t),
                o = ir(i, s);
            return Be.debug("getLiquidityByPair info:", {
                orders: n,
                liquidityWei: i,
                targetToken: t,
                decimals: s,
                liquidity: o
            }), o
        }
        async getMaxSourceAmountByPair(e, t) {
            Be.debug("getMaxSourceAmountByPair called", arguments);
            const n = await this._cache.getOrdersByPair(e, t),
                i = Object.values(n).reduce((u, l) => u.add(qs(l.y, l)), Y.from(0)),
                s = await this._decimals.fetchDecimals(e),
                o = ir(i, s);
            return Be.debug("getMaxSourceAmountByPair info:", {
                orders: n,
                maxSourceAmountWei: i,
                sourceToken: e,
                decimals: s,
                maxSourceAmount: o
            }), o
        }
        async getStrategiesByPair(e, t) {
            let n;
            Be.debug("getStrategiesByPair called", arguments), this._cache && (n = await this._cache.getStrategiesByPair(e, t)), n ? Be.debug("getStrategiesByPair fetched from cache") : (Be.debug("getStrategiesByPair fetching from chain"), n = await this._api.reader.strategiesByPair(e, t));
            const i = n.map(fa),
                s = await Promise.all(i.map(async o => await ca(o, this._decimals)));
            return Be.debug("getStrategiesByPair info:", {
                token0: e,
                token1: t,
                encodedStrategies: n,
                decodedStrategies: i,
                strategies: s
            }), s
        }
        async getUserStrategies(e) {
            Be.debug("getUserStrategies called", arguments);
            const t = await this._api.reader.tokensByOwner(e);
            let n = [],
                i = t;
            if (this._cache && (i = t.reduce((u, l) => {
                    const h = this._cache.getStrategyById(l);
                    return h ? n.push(h) : u.push(l), u
                }, [])), i.length > 0) {
                const u = await this._api.reader.strategies(i);
                n = [...n, ...u]
            }
            const s = n.map(fa),
                o = await Promise.all(s.map(async u => await ca(u, this._decimals)));
            return Be.debug("getUserStrategies info:", {
                ids: t,
                encodedStrategies: n,
                decodedStrategies: s,
                strategies: o
            }), o
        }
        async getMatchParams(e, t, n, i) {
            Be.debug("getMatchParams called", arguments);
            const s = this._decimals,
                o = await s.fetchDecimals(e),
                u = await s.fetchDecimals(t),
                l = await this._cache.getOrdersByPair(e, t),
                h = Wi(n, i ? u : o);
            return {
                orders: fd(l),
                amountWei: h.toString(),
                sourceDecimals: o,
                targetDecimals: u
            }
        }
        async getTradeData(e, t, n, i, s = kn.Fast, o) {
            Be.debug("getTradeData called", arguments);
            const {
                orders: u,
                amountWei: l
            } = await this.getMatchParams(e, t, n, i), h = Rc.getMatchActions(l, i, u, s, o), c = await this.getTradeDataFromActions(e, t, i, h);
            return Be.debug("getTradeData info:", {
                orders: u,
                amount: n,
                amountWei: l,
                res: c
            }), c
        }
        async getTradeDataFromActions(e, t, n, i) {
            Be.debug("getTradeDataFromActions called", arguments);
            const s = await this._cache.getTradingFeePPMByPair(e, t);
            if (s === void 0) throw new Error(`tradingFeePPM is undefined for this pair: ${e}-${t}`);
            const o = this._decimals,
                u = await o.fetchDecimals(e),
                l = await o.fetchDecimals(t),
                h = [],
                c = [];
            let y, v, N, P = Y.from(0),
                S = Y.from(0);
            if (i.forEach(O => {
                    h.push({
                        strategyId: O.id,
                        amount: O.input
                    }), n ? c.push({
                        id: O.id,
                        sourceAmount: ir(Fl(O.output, s).floor().toFixed(0), u),
                        targetAmount: ir(O.input, l)
                    }) : c.push({
                        id: O.id,
                        sourceAmount: ir(O.input, u),
                        targetAmount: ir(Dl(O.output, s).floor().toFixed(0), l)
                    }), S = S.add(O.input), P = P.add(O.output)
                }), n ? (y = Fl(P, s).floor().toFixed(0), v = S.toString()) : (y = S.toString(), v = Dl(P, s).floor().toFixed(0)), new Q(y).isZero() || new Q(v).isZero()) N = {
                tradeActions: h,
                actionsTokenRes: c,
                totalSourceAmount: "0",
                totalTargetAmount: "0",
                effectiveRate: "0",
                actionsWei: i
            };
            else {
                const O = new Q(v).div(y).times(na(u, l)).toString();
                N = {
                    tradeActions: h,
                    actionsTokenRes: c,
                    totalSourceAmount: ir(y, u),
                    totalTargetAmount: ir(v, l),
                    effectiveRate: O,
                    actionsWei: i
                }
            }
            return Be.debug("getTradeDataFromActions info:", {
                sourceDecimals: u,
                targetDecimals: l,
                actionsWei: i,
                totalInput: S,
                totalOutput: P,
                tradingFeePPM: s,
                res: N
            }), N
        }
        async composeTradeByTargetTransaction(e, t, n, i, s, o) {
            Be.debug("composeTradeByTargetTransaction called", arguments);
            const u = await this._decimals.fetchDecimals(e);
            return this._api.composer.tradeByTargetAmount(e, t, n.map(Cl), i, Wi(s, u), o)
        }
        async composeTradeBySourceTransaction(e, t, n, i, s, o) {
            Be.debug("composeTradeBySourceTransaction called", arguments);
            const u = await this._decimals.fetchDecimals(t);
            return this._api.composer.tradeBySourceAmount(e, t, n.map(Cl), i, Wi(s, u), o)
        }
        async calculateOverlappingStrategyPrices(e, t, n, i, s) {
            Be.debug("calculateOverlappingStrategyPrices called", arguments);
            const o = this._decimals,
                u = await o.fetchDecimals(e),
                l = ma(t, n, i, s),
                h = {
                    buyPriceLow: Pn(t, u),
                    buyPriceHigh: Pn(l.buyPriceHigh, u),
                    buyPriceMarginal: Pn(l.buyPriceMarginal, u),
                    sellPriceLow: Pn(l.sellPriceLow, u),
                    sellPriceHigh: Pn(n, u),
                    sellPriceMarginal: Pn(l.sellPriceMarginal, u),
                    marketPrice: Pn(i, u)
                };
            return Be.debug("calculateOverlappingStrategyPrices info:", {
                quoteDecimals: u,
                result: h
            }), h
        }
        async calculateOverlappingStrategySellBudget(e, t, n, i, s, o, u) {
            Be.debug("calculateOverlappingStrategySellBudget called", arguments);
            const l = this._decimals,
                h = await l.fetchDecimals(e),
                c = await l.fetchDecimals(t),
                y = md(h, c, n, i, s, o, u);
            return Be.debug("calculateOverlappingStrategySellBudget info:", {
                baseDecimals: h,
                budget: y
            }), y
        }
        async calculateOverlappingStrategyBuyBudget(e, t, n, i, s, o, u) {
            Be.debug("calculateOverlappingStrategyBuyBudget called", arguments);
            const l = this._decimals,
                h = await l.fetchDecimals(e),
                c = await l.fetchDecimals(t),
                y = gd(h, c, n, i, s, o, u);
            return Be.debug("calculateOverlappingStrategyBuyBudget info:", {
                quoteDecimals: c,
                budget: y
            }), y
        }
        async createBuySellStrategy(e, t, n, i, s, o, u, l, h, c, y) {
            Be.debug("createBuySellStrategy called", arguments);
            const v = this._decimals,
                N = await v.fetchDecimals(e),
                P = await v.fetchDecimals(t),
                S = Ol(e, t, N, P, n, i, s, o, u, l, h, c),
                O = Bl(S);
            return Be.debug("createBuySellStrategy info:", {
                strategy: S,
                encStrategy: O
            }), this._api.composer.createStrategy(O.token0, O.token1, O.order0, O.order1, y)
        }
        async updateStrategy(e, t, {
            buyPriceLow: n,
            buyPriceHigh: i,
            buyBudget: s,
            sellPriceLow: o,
            sellPriceHigh: u,
            sellBudget: l
        }, h, c, y) {
            Be.debug("updateStrategy called", arguments);
            const v = fa(Hs(t)),
                N = await ca(v, this._decimals),
                P = this._decimals,
                S = await P.fetchDecimals(N.baseToken),
                O = await P.fetchDecimals(N.quoteToken),
                I = Ol(N.baseToken, N.quoteToken, S, O, n ? ? N.buyPriceLow, Ks(h) ? h : i ? ? N.buyPriceHigh, i ? ? N.buyPriceHigh, s ? ? N.buyBudget, o ? ? N.sellPriceLow, Ks(c) ? c : o ? ? N.sellPriceLow, u ? ? N.sellPriceHigh, l ? ? N.sellBudget),
                C = Bl(I),
                R = Hs(t);
            return s === void 0 && (C.order1.y = R.order1.y), l === void 0 && (C.order0.y = R.order0.y), n === void 0 && i === void 0 && (C.order1.A = R.order1.A, C.order1.B = R.order1.B), o === void 0 && u === void 0 && (C.order0.A = R.order0.A, C.order0.B = R.order0.B), s !== void 0 && (Ks(h) || (h === Rn.maintain ? R.order1.y.isZero() ? C.order1.z = $s(R.order1.z, C.order1.y) : C.order1.z = wl(R.order1.z, C.order1.y, R.order1.y) : C.order1.z = C.order1.y)), l !== void 0 && (Ks(c) || (c === Rn.maintain ? R.order0.y.isZero() ? C.order0.z = $s(R.order0.z, C.order0.y) : C.order0.z = wl(R.order0.z, C.order0.y, R.order0.y) : C.order0.z = C.order0.y)), n === void 0 && i === void 0 || h !== Rn.reset && h !== void 0 || (C.order1.z = C.order1.y), o === void 0 && u === void 0 || c !== Rn.reset && c !== void 0 || (C.order0.z = C.order0.y), Be.debug("updateStrategy info:", {
                baseDecimals: S,
                quoteDecimals: O,
                decodedOriginal: v,
                originalStrategy: N,
                newStrategy: I,
                newEncodedStrategy: C
            }), this._api.composer.updateStrategy(Y.from(e), C.token0, C.token1, [R.order0, R.order1], [C.order0, C.order1], y)
        }
        async deleteStrategy(e) {
            return Be.debug("deleteStrategy called", arguments), this._api.composer.deleteStrategy(Y.from(e))
        }
        async getRateLiquidityDepthsByPair(e, t, n) {
            Be.debug("getRateLiquidityDepthByPair called", arguments);
            const i = Object.values(await this._cache.getOrdersByPair(e, t)).map(Qi),
                s = this._decimals,
                o = await s.fetchDecimals(e),
                u = await s.fetchDecimals(t),
                l = n.map(y => new Q(fn(y, u, o))),
                h = ud(i, l).map(y => y.floor().toFixed(0)),
                c = h.map(y => ir(y, u));
            return Be.debug("getRateLiquidityDepthByPair info:", {
                orders: i,
                depthsWei: h,
                targetDecimals: u,
                depthsInTargetDecimals: c
            }), c
        }
        async getMinRateByPair(e, t) {
            Be.debug("getMinRateByPair called", arguments);
            const n = Object.values(await this._cache.getOrdersByPair(e, t)).map(Qi),
                i = od(n).toString(),
                s = this._decimals,
                o = await s.fetchDecimals(e),
                u = await s.fetchDecimals(t),
                l = fn(i, o, u);
            return Be.debug("getMinRateByPair info:", {
                orders: n,
                minRate: i,
                sourceDecimals: o,
                targetDecimals: u,
                normalizedRate: l
            }), l
        }
        async getMaxRateByPair(e, t) {
            Be.debug("getMaxRateByPair called", arguments);
            const n = Object.values(await this._cache.getOrdersByPair(e, t)).map(Qi),
                i = ad(n).toString(),
                s = this._decimals,
                o = await s.fetchDecimals(e),
                u = await s.fetchDecimals(t),
                l = fn(i, o, u);
            return Be.debug("getMaxRateByPair info:", {
                orders: n,
                maxRate: i,
                sourceDecimals: o,
                targetDecimals: u,
                normalizedRate: l
            }), l
        }
    };
    var Ul = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};

    function Yi(r) {
        return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r
    }

    function vd(r) {
        if (r.__esModule) return r;
        var e = r.default;
        if (typeof e == "function") {
            var t = function n() {
                return this instanceof n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments)
            };
            t.prototype = e.prototype
        } else t = {};
        return Object.defineProperty(t, "__esModule", {
            value: !0
        }), Object.keys(r).forEach(function(n) {
            var i = Object.getOwnPropertyDescriptor(r, n);
            Object.defineProperty(t, n, i.get ? i : {
                enumerable: !0,
                get: function() {
                    return r[n]
                }
            })
        }), t
    }
    var ga = {
            exports: {}
        },
        bi = typeof Reflect == "object" ? Reflect : null,
        $l = bi && typeof bi.apply == "function" ? bi.apply : function(e, t, n) {
            return Function.prototype.apply.call(e, t, n)
        },
        Js;
    bi && typeof bi.ownKeys == "function" ? Js = bi.ownKeys : Object.getOwnPropertySymbols ? Js = function(e) {
        return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))
    } : Js = function(e) {
        return Object.getOwnPropertyNames(e)
    };

    function wd(r) {
        console && console.warn && console.warn(r)
    }
    var ql = Number.isNaN || function(e) {
        return e !== e
    };

    function wt() {
        wt.init.call(this)
    }
    ga.exports = wt, ga.exports.once = xd, wt.EventEmitter = wt, wt.prototype._events = void 0, wt.prototype._eventsCount = 0, wt.prototype._maxListeners = void 0;
    var zl = 10;

    function Vs(r) {
        if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r)
    }
    Object.defineProperty(wt, "defaultMaxListeners", {
        enumerable: !0,
        get: function() {
            return zl
        },
        set: function(r) {
            if (typeof r != "number" || r < 0 || ql(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
            zl = r
        }
    }), wt.init = function() {
        (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
    }, wt.prototype.setMaxListeners = function(e) {
        if (typeof e != "number" || e < 0 || ql(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
        return this._maxListeners = e, this
    };

    function Gl(r) {
        return r._maxListeners === void 0 ? wt.defaultMaxListeners : r._maxListeners
    }
    wt.prototype.getMaxListeners = function() {
        return Gl(this)
    }, wt.prototype.emit = function(e) {
        for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
        var i = e === "error",
            s = this._events;
        if (s !== void 0) i = i && s.error === void 0;
        else if (!i) return !1;
        if (i) {
            var o;
            if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
            var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
            throw u.context = o, u
        }
        var l = s[e];
        if (l === void 0) return !1;
        if (typeof l == "function") $l(l, this, t);
        else
            for (var h = l.length, c = Vl(l, h), n = 0; n < h; ++n) $l(c[n], this, t);
        return !0
    };

    function Hl(r, e, t, n) {
        var i, s, o;
        if (Vs(t), s = r._events, s === void 0 ? (s = r._events = Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
        else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i = Gl(r), i > 0 && o.length > i && !o.warned) {
            o.warned = !0;
            var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, wd(u)
        }
        return r
    }
    wt.prototype.addListener = function(e, t) {
        return Hl(this, e, t, !1)
    }, wt.prototype.on = wt.prototype.addListener, wt.prototype.prependListener = function(e, t) {
        return Hl(this, e, t, !0)
    };

    function bd() {
        if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
    }

    function jl(r, e, t) {
        var n = {
                fired: !1,
                wrapFn: void 0,
                target: r,
                type: e,
                listener: t
            },
            i = bd.bind(n);
        return i.listener = t, n.wrapFn = i, i
    }
    wt.prototype.once = function(e, t) {
        return Vs(t), this.on(e, jl(this, e, t)), this
    }, wt.prototype.prependOnceListener = function(e, t) {
        return Vs(t), this.prependListener(e, jl(this, e, t)), this
    }, wt.prototype.removeListener = function(e, t) {
        var n, i, s, o, u;
        if (Vs(t), i = this._events, i === void 0) return this;
        if (n = i[e], n === void 0) return this;
        if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
        else if (typeof n != "function") {
            for (s = -1, o = n.length - 1; o >= 0; o--)
                if (n[o] === t || n[o].listener === t) {
                    u = n[o].listener, s = o;
                    break
                }
            if (s < 0) return this;
            s === 0 ? n.shift() : Ad(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t)
        }
        return this
    }, wt.prototype.off = wt.prototype.removeListener, wt.prototype.removeAllListeners = function(e) {
        var t, n, i;
        if (n = this._events, n === void 0) return this;
        if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete n[e]), this;
        if (arguments.length === 0) {
            var s = Object.keys(n),
                o;
            for (i = 0; i < s.length; ++i) o = s[i], o !== "removeListener" && this.removeAllListeners(o);
            return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this
        }
        if (t = n[e], typeof t == "function") this.removeListener(e, t);
        else if (t !== void 0)
            for (i = t.length - 1; i >= 0; i--) this.removeListener(e, t[i]);
        return this
    };

    function Kl(r, e, t) {
        var n = r._events;
        if (n === void 0) return [];
        var i = n[e];
        return i === void 0 ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? Ed(i) : Vl(i, i.length)
    }
    wt.prototype.listeners = function(e) {
        return Kl(this, e, !0)
    }, wt.prototype.rawListeners = function(e) {
        return Kl(this, e, !1)
    }, wt.listenerCount = function(r, e) {
        return typeof r.listenerCount == "function" ? r.listenerCount(e) : Jl.call(r, e)
    }, wt.prototype.listenerCount = Jl;

    function Jl(r) {
        var e = this._events;
        if (e !== void 0) {
            var t = e[r];
            if (typeof t == "function") return 1;
            if (t !== void 0) return t.length
        }
        return 0
    }
    wt.prototype.eventNames = function() {
        return this._eventsCount > 0 ? Js(this._events) : []
    };

    function Vl(r, e) {
        for (var t = new Array(e), n = 0; n < e; ++n) t[n] = r[n];
        return t
    }

    function Ad(r, e) {
        for (; e + 1 < r.length; e++) r[e] = r[e + 1];
        r.pop()
    }

    function Ed(r) {
        for (var e = new Array(r.length), t = 0; t < e.length; ++t) e[t] = r[t].listener || r[t];
        return e
    }

    function xd(r, e) {
        return new Promise(function(t, n) {
            function i(o) {
                r.removeListener(e, s), n(o)
            }

            function s() {
                typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments))
            }
            Zl(r, e, s, {
                once: !0
            }), e !== "error" && _d(r, i, {
                once: !0
            })
        })
    }

    function _d(r, e, t) {
        typeof r.on == "function" && Zl(r, "error", e, t)
    }

    function Zl(r, e, t, n) {
        if (typeof r.on == "function") n.once ? r.once(e, t) : r.on(e, t);
        else if (typeof r.addEventListener == "function") r.addEventListener(e, function i(s) {
            n.once && r.removeEventListener(e, i), t(s)
        });
        else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r)
    }
    var Md = ga.exports,
        Nd = Yi(Md);
    const Td = (r, e) => r.localeCompare(e),
        Wl = "->-<-",
        Ql = r => {
            if (r.length !== 2) throw new Error(`Invalid number of tokens: expected 2, got ${r.length}`);
            if (r[0] === r[1]) throw new Error(`Cannot create key for identical tokens: ${r[0]}`);
            return r.join(Wl)
        },
        _t = (r, e) => Ql([r, e].sort(Td)),
        Xi = r => {
            const e = r.split(Wl);
            return [e[0], e[1]]
        },
        es = (r, e) => Ql([r, e]),
        Pd = (r, e) => {
            let t;
            do t = r.shift(); while (t && !e(t));
            return t
        };

    function kd(r) {
        return r.y.gt(0) && (r.A.gt(0) || r.B.gt(0))
    }
    const Gr = new vi("ChainCache.ts");
    let Yl = class Iu extends Nd {
        constructor() {
            super(...arguments);
            Re(this, "_strategiesByPair", {});
            Re(this, "_strategiesById", {});
            Re(this, "_ordersByDirectedPair", {});
            Re(this, "_latestBlockNumber", 0);
            Re(this, "_latestTradesByPair", {});
            Re(this, "_latestTradesByDirectedPair", {});
            Re(this, "_blocksMetadata", []);
            Re(this, "_tradingFeePPMByPair", {});
            Re(this, "_handleCacheMiss")
        }
        static fromSerialized(t) {
            try {
                const n = new Iu;
                return n._deserialize(t), n
            } catch (n) {
                Gr.error("Failed to deserialize cache, returning clear cache", n)
            }
            return new Iu
        }
        _deserialize(t) {
            const n = JSON.parse(t),
                {
                    schemeVersion: i
                } = n;
            i === 6 ? (this._strategiesByPair = Object.entries(n.strategiesByPair).reduce((s, [o, u]) => (s[o] = u.map(Hs), s), {}), this._strategiesById = Object.entries(n.strategiesById).reduce((s, [o, u]) => (s[o] = Hs(u), s), {}), this._ordersByDirectedPair = Object.entries(n.ordersByDirectedPair).reduce((s, [o, u]) => (s[o] = Object.entries(u).reduce((l, [h, c]) => (l[h] = Gs(c), l), {}), s), {}), this._tradingFeePPMByPair = n.tradingFeePPMByPair, this._latestBlockNumber = n.latestBlockNumber, this._latestTradesByPair = n.latestTradesByPair, this._latestTradesByDirectedPair = n.latestTradesByDirectedPair, this._blocksMetadata = n.blocksMetadata) : Gr.log("Cache version mismatch, ignoring cache. Expected", 6, "got", i, "This may be due to a breaking change in the cache format since it was last persisted.")
        }
        serialize() {
            const t = {
                schemeVersion: 6,
                strategiesByPair: Object.entries(this._strategiesByPair).reduce((n, [i, s]) => (n[i] = s.map(ha), n), {}),
                strategiesById: Object.entries(this._strategiesById).reduce((n, [i, s]) => (n[i] = ha(s), n), {}),
                ordersByDirectedPair: Object.entries(this._ordersByDirectedPair).reduce((n, [i, s]) => (n[i] = Object.entries(s).reduce((o, [u, l]) => (o[u] = hd(l), o), {}), n), {}),
                tradingFeePPMByPair: this._tradingFeePPMByPair,
                latestBlockNumber: this._latestBlockNumber,
                latestTradesByPair: this._latestTradesByPair,
                latestTradesByDirectedPair: this._latestTradesByDirectedPair,
                blocksMetadata: this._blocksMetadata
            };
            return JSON.stringify(t)
        }
        setCacheMissHandler(t) {
            this._handleCacheMiss = t
        }
        async _checkAndHandleCacheMiss(t, n) {
            this._handleCacheMiss && !this.hasCachedPair(t, n) && (Gr.debug("Cache miss for pair", t, n), await this._handleCacheMiss(t, n), Gr.debug("Cache miss for pair", t, n, "resolved"))
        }
        clear() {
            const t = Object.keys(this._strategiesByPair).map(Xi);
            this._strategiesByPair = {}, this._strategiesById = {}, this._ordersByDirectedPair = {}, this._latestBlockNumber = 0, this._latestTradesByPair = {}, this._latestTradesByDirectedPair = {}, this._blocksMetadata = [], this.emit("onPairDataChanged", t)
        }
        async getStrategiesByPair(t, n) {
            await this._checkAndHandleCacheMiss(t, n);
            const i = _t(t, n);
            return this._strategiesByPair[i]
        }
        getStrategyById(t) {
            return this._strategiesById[t.toString()]
        }
        getCachedPairs(t = !0) {
            return t ? Object.entries(this._strategiesByPair).filter(([n, i]) => i.length > 0).map(([n, i]) => Xi(n)) : Object.keys(this._strategiesByPair).map(Xi)
        }
        async getOrdersByPair(t, n, i = !1) {
            await this._checkAndHandleCacheMiss(t, n);
            const s = es(t, n),
                o = this._ordersByDirectedPair[s] || {};
            return i ? o : Object.fromEntries(Object.entries(o).filter(([u, l]) => kd(l)))
        }
        hasCachedPair(t, n) {
            const i = _t(t, n);
            return !!this._strategiesByPair[i]
        }
        async getLatestTradeByPair(t, n) {
            await this._checkAndHandleCacheMiss(t, n);
            const i = _t(t, n);
            return this._latestTradesByPair[i]
        }
        async getLatestTradeByDirectedPair(t, n) {
            await this._checkAndHandleCacheMiss(t, n);
            const i = es(t, n);
            return this._latestTradesByDirectedPair[i]
        }
        getLatestTrades() {
            return Object.values(this._latestTradesByPair)
        }
        getLatestBlockNumber() {
            return this._latestBlockNumber
        }
        async getTradingFeePPMByPair(t, n) {
            await this._checkAndHandleCacheMiss(t, n);
            const i = _t(t, n);
            return this._tradingFeePPMByPair[i]
        }
        get blocksMetadata() {
            return this._blocksMetadata
        }
        set blocksMetadata(t) {
            this._blocksMetadata = t
        }
        addPair(t, n, i, s = !1) {
            Gr.debug("Adding pair with", i.length, " strategies to cache", t, n);
            const o = _t(t, n);
            if (this._strategiesByPair[o]) throw new Error(`Pair ${o} already cached`);
            this._strategiesByPair[o] = i, i.forEach(u => {
                this._strategiesById[u.id.toString()] = u, this._addStrategyOrders(u)
            }), s || (Gr.debug("Emitting onPairAddedToCache", t, n), this.emit("onPairAddedToCache", Xi(o)))
        }
        addPairFees(t, n, i) {
            Gr.debug("Adding trading fee to pair", t, n, "fee", i);
            const s = _t(t, n);
            this._tradingFeePPMByPair[s] = i
        }
        applyBatchedUpdates(t, n, i, s, o, u) {
            Gr.debug("Applying batched updates to cache", {
                latestBlockNumber: t,
                latestFeeUpdates: n,
                latestTrades: i,
                createdStrategies: s,
                updatedStrategies: o,
                deletedStrategies: u
            });
            const l = new Set;
            i.forEach(h => {
                this._setLatestTrade(h), l.add(_t(h.sourceToken, h.targetToken))
            }), s.forEach(h => {
                this._addStrategy(h), l.add(_t(h.token0, h.token1))
            }), o.forEach(h => {
                this._updateStrategy(h), l.add(_t(h.token0, h.token1))
            }), u.forEach(h => {
                this._deleteStrategy(h), l.add(_t(h.token0, h.token1))
            }), n.forEach(([h, c, y]) => {
                this._tradingFeePPMByPair[_t(h, c)] = y
            }), this._setLatestBlockNumber(t), l.size > 0 && (Gr.debug("Emitting onPairDataChanged", l), this.emit("onPairDataChanged", Array.from(l).map(Xi)))
        }
        _setLatestBlockNumber(t) {
            this._latestBlockNumber = t
        }
        _setLatestTrade(t) {
            if (!this.hasCachedPair(t.sourceToken, t.targetToken)) throw new Error(`Pair ${_t(t.sourceToken,t.targetToken)} is not cached, cannot set latest trade`);
            const n = _t(t.sourceToken, t.targetToken);
            this._latestTradesByPair[n] = t;
            const i = es(t.sourceToken, t.targetToken);
            this._latestTradesByDirectedPair[i] = t
        }
        _addStrategyOrders(t) {
            for (const n of [
                    [t.token0, t.token1],
                    [t.token1, t.token0]
                ]) {
                const i = es(n[0], n[1]),
                    s = n[0] === t.token0 ? t.order1 : t.order0,
                    o = this._ordersByDirectedPair[i];
                o ? o[t.id.toString()] = s : this._ordersByDirectedPair[i] = {
                    [t.id.toString()]: s
                }
            }
        }
        _removeStrategyOrders(t) {
            for (const n of [
                    [t.token0, t.token1],
                    [t.token1, t.token0]
                ]) {
                const i = es(n[0], n[1]),
                    s = this._ordersByDirectedPair[i];
                s && (delete s[t.id.toString()], Object.keys(s).length === 0 && delete this._ordersByDirectedPair.key)
            }
        }
        _addStrategy(t) {
            if (!this.hasCachedPair(t.token0, t.token1)) throw new Error(`Pair ${_t(t.token0,t.token1)} is not cached, cannot add strategy`);
            const n = _t(t.token0, t.token1);
            if (this._strategiesById[t.id.toString()]) return void Gr.debug(`Strategy ${t.id} already cached, under the pair ${n} - skipping`);
            const i = this._strategiesByPair[n] || [];
            i.push(t), this._strategiesByPair[n] = i, this._strategiesById[t.id.toString()] = t, this._addStrategyOrders(t)
        }
        _updateStrategy(t) {
            if (!this.hasCachedPair(t.token0, t.token1)) throw new Error(`Pair ${_t(t.token0,t.token1)} is not cached, cannot update strategy`);
            const n = _t(t.token0, t.token1),
                i = (this._strategiesByPair[n] || []).filter(s => !s.id.eq(t.id));
            i.push(t), this._strategiesByPair[n] = i, this._strategiesById[t.id.toString()] = t, this._removeStrategyOrders(t), this._addStrategyOrders(t)
        }
        _deleteStrategy(t) {
            if (!this.hasCachedPair(t.token0, t.token1)) throw new Error(`Pair ${_t(t.token0,t.token1)} is not cached, cannot delete strategy`);
            const n = _t(t.token0, t.token1);
            delete this._strategiesById[t.id.toString()];
            const i = (this._strategiesByPair[n] || []).filter(s => !s.id.eq(t.id));
            this._strategiesByPair[n] = i, this._removeStrategyOrders(t)
        }
    };
    const bt = new vi("ChainSync.ts");
    let Sd = class {
        constructor(e, t) {
            Re(this, "_fetcher");
            Re(this, "_chainCache");
            Re(this, "_syncCalled", !1);
            Re(this, "_slowPollPairs", !1);
            Re(this, "_pairs", []);
            Re(this, "_lastFetch", Date.now());
            Re(this, "_initialSyncDone", !1);
            this._fetcher = e, this._chainCache = t
        }
        async startDataSync() {
            if (bt.debug("startDataSync called"), this._syncCalled) throw new Error("ChainSync.startDataSync() can only be called once");
            this._syncCalled = !0;
            const e = await this._fetcher.getBlockNumber();
            this._chainCache.getLatestBlockNumber() === 0 && (bt.debug("startDataSync - cache is new", arguments), this._chainCache.applyBatchedUpdates(e, [], [], [], [], [])), await this._updatePairsFromChain(), await Promise.all([this._populateFeesData(this._pairs), this._populatePairsData(), this._syncEvents()])
        }
        async _updatePairsFromChain() {
            bt.debug("_updatePairsFromChain fetches pairs"), this._pairs = [...await this._fetcher.pairs()], bt.debug("_updatePairsFromChain fetched pairs", this._pairs), this._lastFetch = Date.now(), this._pairs.length === 0 && bt.error("_updatePairsFromChain fetched no pairs - this indicates a problem")
        }
        async _populateFeesData(e, t = !1) {
            if (bt.debug("populateFeesData called"), e.length === 0) return void bt.error("populateFeesData called with no pairs - skipping");
            const n = t ? e : e.filter(s => !this._chainCache.hasCachedPair(s[0], s[1]));
            if (n.length === 0) return;
            const i = await this._fetcher.pairsTradingFeePPM(n);
            bt.debug("populateFeesData fetched fee updates", i), i.forEach(s => {
                this._chainCache.addPairFees(s[0], s[1], s[2])
            })
        }
        async _populatePairsData() {
            bt.debug("_populatePairsData called"), this._slowPollPairs = !1;
            const e = async () => {
                try {
                    if (this._pairs.length === 0) {
                        if (this._slowPollPairs && Date.now() - this._lastFetch < 6e4) return void setTimeout(e, 1e3);
                        await this._updatePairsFromChain()
                    }
                    const t = Pd(this._pairs, n => !this._chainCache.hasCachedPair(n[0], n[1]));
                    t ? (bt.debug("_populatePairsData adds pair to cache", t), await this.syncPairData(t[0], t[1], !this._initialSyncDone), setTimeout(e, 1)) : (bt.debug("_populatePairsData handled all pairs and goes to slow poll mode"), this._slowPollPairs = !0, this._initialSyncDone = !0, setTimeout(e, 1e3))
                } catch (t) {
                    bt.error("Error while syncing pairs data", t), setTimeout(e, 6e4)
                }
            };
            setTimeout(e, 1)
        }
        async syncPairData(e, t, n = !1) {
            if (!this._syncCalled) throw new Error("ChainSync.startDataSync() must be called before syncPairData()");
            const i = await this._fetcher.strategiesByPair(e, t);
            this._chainCache.hasCachedPair(e, t) || this._chainCache.addPair(e, t, i, n)
        }
        _getBlockChunks(e, t, n) {
            const i = [];
            for (let s = e; s <= t; s += n) {
                const o = s,
                    u = Math.min(s + n - 1, t);
                i.push([o, u])
            }
            return i
        }
        async _syncEvents() {
            bt.debug("_syncEvents called");
            const e = async () => {
                try {
                    const t = this._chainCache.getLatestBlockNumber(),
                        n = await this._fetcher.getBlockNumber();
                    if (n > t) {
                        if (await this._detectReorg(n)) return bt.debug("_syncEvents detected reorg - resetting"), this._chainCache.clear(), this._chainCache.applyBatchedUpdates(n, [], [], [], [], []), this._resetPairsFetching(), void setTimeout(e, 1);
                        const i = new Set(this._chainCache.getCachedPairs(!1).map(R => _t(R[0], R[1])));
                        bt.debug("_syncEvents fetches events", t + 1, n);
                        const s = this._getBlockChunks(t + 1, n, 1e3);
                        bt.debug("_syncEvents block chunks", s);
                        const o = [],
                            u = [],
                            l = [],
                            h = [],
                            c = [],
                            y = [];
                        for (const R of s) {
                            bt.debug("_syncEvents fetches events for chunk", R);
                            const G = await this._fetcher.getLatestStrategyCreatedStrategies(R[0], R[1]),
                                q = await this._fetcher.getLatestStrategyUpdatedStrategies(R[0], R[1]),
                                J = await this._fetcher.getLatestStrategyDeletedStrategies(R[0], R[1]),
                                ue = await this._fetcher.getLatestTokensTradedTrades(R[0], R[1]),
                                W = await this._fetcher.getLatestPairTradingFeeUpdates(R[0], R[1]),
                                se = await this._fetcher.getLatestTradingFeeUpdates(R[0], R[1]);
                            o.push(G), u.push(q), l.push(J), h.push(ue), c.push(W), y.push(se), bt.debug("_syncEvents fetched the following events for chunks", s, {
                                createdStrategiesChunk: G,
                                updatedStrategiesChunk: q,
                                deletedStrategiesChunk: J,
                                tradesChunk: ue,
                                feeUpdatesChunk: W,
                                defaultFeeUpdatesChunk: se
                            })
                        }
                        const v = o.flat(),
                            N = u.flat(),
                            P = l.flat(),
                            S = h.flat(),
                            O = c.flat(),
                            I = y.flat().length > 0;
                        bt.debug("_syncEvents fetched events", v, N, P, S, O, I);
                        const C = [];
                        for (const R of v) this._chainCache.hasCachedPair(R.token0, R.token1) || C.push([R.token0, R.token1]);
                        this._chainCache.applyBatchedUpdates(n, O, S.filter(R => i.has(_t(R.sourceToken, R.targetToken))), v.filter(R => i.has(_t(R.token0, R.token1))), N.filter(R => i.has(_t(R.token0, R.token1))), P.filter(R => i.has(_t(R.token0, R.token1)))), I && (bt.debug("_syncEvents noticed at least one default fee update - refetching pair fees for all pairs"), await this._populateFeesData([...await this._fetcher.pairs()], !0)), C.length > 0 && (bt.debug("_syncEvents noticed at least one new pair created - setting slow poll mode to false"), this._slowPollPairs = !1, bt.debug("_syncEvents fetching fees for the new pairs"), await this._populateFeesData(C, !0))
                    }
                } catch (t) {
                    bt.error("Error syncing events:", t)
                }
                setTimeout(e, 1e3)
            };
            setTimeout(e, 1)
        }
        _resetPairsFetching() {
            this._pairs = [], this._slowPollPairs = !1, this._initialSyncDone = !1
        }
        async _detectReorg(e) {
            bt.debug("_detectReorg called");
            const t = this._chainCache.blocksMetadata,
                n = {};
            for (const s of t) {
                const {
                    number: o,
                    hash: u
                } = s;
                if (o > e) return bt.log("reorg detected for block number", o, "larger than current block", e, "with hash", u), !0;
                const l = (await this._fetcher.getBlock(o)).hash;
                if (u !== l) return bt.log("reorg detected for block number", o, "old hash", u, "new hash", l), !0;
                n[o] = s
            }
            bt.debug("_detectReorg no reorg detected, updating blocks metadata");
            const i = [];
            for (let s = 0; s < 3; s++) n[e - s] ? i.push(n[e - s]) : i.push(await this._fetcher.getBlock(e - s));
            return this._chainCache.blocksMetadata = i, bt.debug("_detectReorg updated blocks metadata"), !1
        }
    };
    const Rd = (r, e) => {
            let t;
            e && (t = Yl.fromSerialized(e)), t || (t = new Yl);
            const n = new Sd(r, t);
            return t.setCacheMissHandler(n.syncPairData.bind(n)), {
                cache: t,
                startDataSync: n.startDataSync.bind(n)
            }
        },
        Id = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase(),
        Cd = async (r, e, t) => {
            try {
                const n = r.map(i => ({
                    target: i.contractAddress.toLocaleLowerCase(),
                    callData: i.interface.encodeFunctionData(i.methodName, i.methodParameters)
                }));
                return (await e.tryAggregate(!1, n, {
                    blockTag: t
                })).map((i, s) => i.success ? r[s].interface.decodeFunctionResult(r[s].methodName, i.returnData) : [])
            } catch {}
        },
        Ai = r => r.toLowerCase() === Id,
        Xl = (r, e, t, n, i) => {
            const s = { ...i
            };
            return Ai(r) && (s.value = t ? Y.from(n) : e.reduce((o, u) => o.add(u.amount), Y.from(0))), s
        },
        jn = new vi("Composer.ts");
    let Bd = class {
        constructor(e) {
            Re(this, "_contracts");
            this._contracts = e
        }
        tradeByTargetAmount(e, t, n, i, s, o) {
            jn.debug("tradeByTargetAmount called", arguments);
            const u = Xl(e, n, !0, s, o);
            return jn.debug("tradeByTargetAmount overrides", u), this._contracts.carbonController.populateTransaction.tradeByTargetAmount(e, t, n, i, s, u)
        }
        tradeBySourceAmount(e, t, n, i, s, o) {
            jn.debug("tradeBySourceAmount called", arguments);
            const u = Xl(e, n, !1, -1, o);
            return jn.debug("tradeBySourceAmount overrides", u), this._contracts.carbonController.populateTransaction.tradeBySourceAmount(e, t, n, i, s, u)
        }
        createStrategy(e, t, n, i, s) {
            jn.debug("createStrategy called", arguments);
            const o = { ...s
            };
            return Ai(e) ? o.value = n.y : Ai(t) && (o.value = i.y), jn.debug("createStrategy overrides", o), this._contracts.carbonController.populateTransaction.createStrategy(e, t, [n, i], o)
        }
        deleteStrategy(e) {
            return this._contracts.carbonController.populateTransaction.deleteStrategy(e)
        }
        updateStrategy(e, t, n, i, s, o) {
            const u = { ...o
            };
            return Ai(t) && s[0].y.gt(i[0].y) ? u.value = s[0].y.sub(i[0].y) : Ai(n) && s[1].y.gt(i[1].y) && (u.value = s[1].y.sub(i[1].y)), jn.debug("updateStrategy overrides", u), this._contracts.carbonController.populateTransaction.updateStrategy(e, i, s, u)
        }
    };
    var eh = {
        exports: {}
    };
    /**
     * [js-sha3]{@link https://github.com/emn178/js-sha3}
     *
     * @version 0.8.0
     * @author Chen, Yi-Cyuan [emn178@gmail.com]
     * @copyright Chen, Yi-Cyuan 2015-2018
     * @license MIT
     */
    var ya;
    ya = eh,
        function() {
            var r = "input is invalid type",
                e = typeof window == "object",
                t = e ? window : {};
            t.JS_SHA3_NO_WINDOW && (e = !1);
            var n = !e && typeof self == "object";
            !t.JS_SHA3_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node ? t = Zu : n && (t = self);
            var i = !t.JS_SHA3_NO_COMMON_JS && ya.exports,
                s = !t.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u",
                o = "0123456789abcdef".split(""),
                u = [4, 1024, 262144, 67108864],
                l = [0, 8, 16, 24],
                h = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648],
                c = [224, 256, 384, 512],
                y = [128, 256],
                v = ["hex", "buffer", "arrayBuffer", "array", "digest"],
                N = {
                    128: 168,
                    256: 136
                };
            !t.JS_SHA3_NO_NODE_JS && Array.isArray || (Array.isArray = function(f) {
                return Object.prototype.toString.call(f) === "[object Array]"
            }), !s || !t.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW && ArrayBuffer.isView || (ArrayBuffer.isView = function(f) {
                return typeof f == "object" && f.buffer && f.buffer.constructor === ArrayBuffer
            });
            for (var P = function(f, A, E) {
                    return function(x) {
                        return new p(f, A, f).update(x)[E]()
                    }
                }, S = function(f, A, E) {
                    return function(x, k) {
                        return new p(f, A, k).update(x)[E]()
                    }
                }, O = function(f, A, E) {
                    return function(x, k, _, g) {
                        return q["cshake" + f].update(x, k, _, g)[E]()
                    }
                }, I = function(f, A, E) {
                    return function(x, k, _, g) {
                        return q["kmac" + f].update(x, k, _, g)[E]()
                    }
                }, C = function(f, A, E, x) {
                    for (var k = 0; k < v.length; ++k) {
                        var _ = v[k];
                        f[_] = A(E, x, _)
                    }
                    return f
                }, R = function(f, A) {
                    var E = P(f, A, "hex");
                    return E.create = function() {
                        return new p(f, A, f)
                    }, E.update = function(x) {
                        return E.create().update(x)
                    }, C(E, P, f, A)
                }, G = [{
                    name: "keccak",
                    padding: [1, 256, 65536, 16777216],
                    bits: c,
                    createMethod: R
                }, {
                    name: "sha3",
                    padding: [6, 1536, 393216, 100663296],
                    bits: c,
                    createMethod: R
                }, {
                    name: "shake",
                    padding: [31, 7936, 2031616, 520093696],
                    bits: y,
                    createMethod: function(f, A) {
                        var E = S(f, A, "hex");
                        return E.create = function(x) {
                            return new p(f, A, x)
                        }, E.update = function(x, k) {
                            return E.create(k).update(x)
                        }, C(E, S, f, A)
                    }
                }, {
                    name: "cshake",
                    padding: u,
                    bits: y,
                    createMethod: function(f, A) {
                        var E = N[f],
                            x = O(f, 0, "hex");
                        return x.create = function(k, _, g) {
                            return _ || g ? new p(f, A, k).bytepad([_, g], E) : q["shake" + f].create(k)
                        }, x.update = function(k, _, g, T) {
                            return x.create(_, g, T).update(k)
                        }, C(x, O, f, A)
                    }
                }, {
                    name: "kmac",
                    padding: u,
                    bits: y,
                    createMethod: function(f, A) {
                        var E = N[f],
                            x = I(f, 0, "hex");
                        return x.create = function(k, _, g) {
                            return new a(f, A, _).bytepad(["KMAC", g], E).bytepad([k], E)
                        }, x.update = function(k, _, g, T) {
                            return x.create(k, g, T).update(_)
                        }, C(x, I, f, A)
                    }
                }], q = {}, J = [], ue = 0; ue < G.length; ++ue)
                for (var W = G[ue], se = W.bits, m = 0; m < se.length; ++m) {
                    var w = W.name + "_" + se[m];
                    if (J.push(w), q[w] = W.createMethod(se[m], W.padding), W.name !== "sha3") {
                        var M = W.name + se[m];
                        J.push(M), q[M] = q[w]
                    }
                }

            function p(f, A, E) {
                this.blocks = [], this.s = [], this.padding = A, this.outputBits = E, this.reset = !0, this.finalized = !1, this.block = 0, this.start = 0, this.blockCount = 1600 - (f << 1) >> 5, this.byteCount = this.blockCount << 2, this.outputBlocks = E >> 5, this.extraBytes = (31 & E) >> 3;
                for (var x = 0; x < 50; ++x) this.s[x] = 0
            }

            function a(f, A, E) {
                p.call(this, f, A, E)
            }
            p.prototype.update = function(f) {
                if (this.finalized) throw new Error("finalize already called");
                var A, E = typeof f;
                if (E !== "string") {
                    if (E !== "object") throw new Error(r);
                    if (f === null) throw new Error(r);
                    if (s && f.constructor === ArrayBuffer) f = new Uint8Array(f);
                    else if (!(Array.isArray(f) || s && ArrayBuffer.isView(f))) throw new Error(r);
                    A = !0
                }
                for (var x, k, _ = this.blocks, g = this.byteCount, T = f.length, z = this.blockCount, b = 0, B = this.s; b < T;) {
                    if (this.reset)
                        for (this.reset = !1, _[0] = this.block, x = 1; x < z + 1; ++x) _[x] = 0;
                    if (A)
                        for (x = this.start; b < T && x < g; ++b) _[x >> 2] |= f[b] << l[3 & x++];
                    else
                        for (x = this.start; b < T && x < g; ++b)(k = f.charCodeAt(b)) < 128 ? _[x >> 2] |= k << l[3 & x++] : k < 2048 ? (_[x >> 2] |= (192 | k >> 6) << l[3 & x++], _[x >> 2] |= (128 | 63 & k) << l[3 & x++]) : k < 55296 || k >= 57344 ? (_[x >> 2] |= (224 | k >> 12) << l[3 & x++], _[x >> 2] |= (128 | k >> 6 & 63) << l[3 & x++], _[x >> 2] |= (128 | 63 & k) << l[3 & x++]) : (k = 65536 + ((1023 & k) << 10 | 1023 & f.charCodeAt(++b)), _[x >> 2] |= (240 | k >> 18) << l[3 & x++], _[x >> 2] |= (128 | k >> 12 & 63) << l[3 & x++], _[x >> 2] |= (128 | k >> 6 & 63) << l[3 & x++], _[x >> 2] |= (128 | 63 & k) << l[3 & x++]);
                    if (this.lastByteIndex = x, x >= g) {
                        for (this.start = x - g, this.block = _[z], x = 0; x < z; ++x) B[x] ^= _[x];
                        d(B), this.reset = !0
                    } else this.start = x
                }
                return this
            }, p.prototype.encode = function(f, A) {
                var E = 255 & f,
                    x = 1,
                    k = [E];
                for (E = 255 & (f >>= 8); E > 0;) k.unshift(E), E = 255 & (f >>= 8), ++x;
                return A ? k.push(x) : k.unshift(x), this.update(k), k.length
            }, p.prototype.encodeString = function(f) {
                var A, E = typeof f;
                if (E !== "string") {
                    if (E !== "object") throw new Error(r);
                    if (f === null) throw new Error(r);
                    if (s && f.constructor === ArrayBuffer) f = new Uint8Array(f);
                    else if (!(Array.isArray(f) || s && ArrayBuffer.isView(f))) throw new Error(r);
                    A = !0
                }
                var x = 0,
                    k = f.length;
                if (A) x = k;
                else
                    for (var _ = 0; _ < f.length; ++_) {
                        var g = f.charCodeAt(_);
                        g < 128 ? x += 1 : g < 2048 ? x += 2 : g < 55296 || g >= 57344 ? x += 3 : (g = 65536 + ((1023 & g) << 10 | 1023 & f.charCodeAt(++_)), x += 4)
                    }
                return x += this.encode(8 * x), this.update(f), x
            }, p.prototype.bytepad = function(f, A) {
                for (var E = this.encode(A), x = 0; x < f.length; ++x) E += this.encodeString(f[x]);
                var k = A - E % A,
                    _ = [];
                return _.length = k, this.update(_), this
            }, p.prototype.finalize = function() {
                if (!this.finalized) {
                    this.finalized = !0;
                    var f = this.blocks,
                        A = this.lastByteIndex,
                        E = this.blockCount,
                        x = this.s;
                    if (f[A >> 2] |= this.padding[3 & A], this.lastByteIndex === this.byteCount)
                        for (f[0] = f[E], A = 1; A < E + 1; ++A) f[A] = 0;
                    for (f[E - 1] |= 2147483648, A = 0; A < E; ++A) x[A] ^= f[A];
                    d(x)
                }
            }, p.prototype.toString = p.prototype.hex = function() {
                this.finalize();
                for (var f, A = this.blockCount, E = this.s, x = this.outputBlocks, k = this.extraBytes, _ = 0, g = 0, T = ""; g < x;) {
                    for (_ = 0; _ < A && g < x; ++_, ++g) f = E[_], T += o[f >> 4 & 15] + o[15 & f] + o[f >> 12 & 15] + o[f >> 8 & 15] + o[f >> 20 & 15] + o[f >> 16 & 15] + o[f >> 28 & 15] + o[f >> 24 & 15];
                    g % A == 0 && (d(E), _ = 0)
                }
                return k && (f = E[_], T += o[f >> 4 & 15] + o[15 & f], k > 1 && (T += o[f >> 12 & 15] + o[f >> 8 & 15]), k > 2 && (T += o[f >> 20 & 15] + o[f >> 16 & 15])), T
            }, p.prototype.arrayBuffer = function() {
                this.finalize();
                var f, A = this.blockCount,
                    E = this.s,
                    x = this.outputBlocks,
                    k = this.extraBytes,
                    _ = 0,
                    g = 0,
                    T = this.outputBits >> 3;
                f = k ? new ArrayBuffer(x + 1 << 2) : new ArrayBuffer(T);
                for (var z = new Uint32Array(f); g < x;) {
                    for (_ = 0; _ < A && g < x; ++_, ++g) z[g] = E[_];
                    g % A == 0 && d(E)
                }
                return k && (z[_] = E[_], f = f.slice(0, T)), f
            }, p.prototype.buffer = p.prototype.arrayBuffer, p.prototype.digest = p.prototype.array = function() {
                this.finalize();
                for (var f, A, E = this.blockCount, x = this.s, k = this.outputBlocks, _ = this.extraBytes, g = 0, T = 0, z = []; T < k;) {
                    for (g = 0; g < E && T < k; ++g, ++T) f = T << 2, A = x[g], z[f] = 255 & A, z[f + 1] = A >> 8 & 255, z[f + 2] = A >> 16 & 255, z[f + 3] = A >> 24 & 255;
                    T % E == 0 && d(x)
                }
                return _ && (f = T << 2, A = x[g], z[f] = 255 & A, _ > 1 && (z[f + 1] = A >> 8 & 255), _ > 2 && (z[f + 2] = A >> 16 & 255)), z
            }, a.prototype = new p, a.prototype.finalize = function() {
                return this.encode(this.outputBits, !0), p.prototype.finalize.call(this)
            };
            var d = function(f) {
                var A, E, x, k, _, g, T, z, b, B, F, D, j, Z, H, V, Me, K, le, $e, he, qe, ze, fe, Ge, He, ce, je, Ke, de, Je, Ve, pe, Ze, We, me, Qe, Ye, ge, Xe, et, ye, tt, rt, ve, nt, it, we, st, ot, be, at, ut, Ae, lt, ht, Ee, ft, ct, xe, dt, pt, _e;
                for (x = 0; x < 48; x += 2) k = f[0] ^ f[10] ^ f[20] ^ f[30] ^ f[40], _ = f[1] ^ f[11] ^ f[21] ^ f[31] ^ f[41], g = f[2] ^ f[12] ^ f[22] ^ f[32] ^ f[42], T = f[3] ^ f[13] ^ f[23] ^ f[33] ^ f[43], z = f[4] ^ f[14] ^ f[24] ^ f[34] ^ f[44], b = f[5] ^ f[15] ^ f[25] ^ f[35] ^ f[45], B = f[6] ^ f[16] ^ f[26] ^ f[36] ^ f[46], F = f[7] ^ f[17] ^ f[27] ^ f[37] ^ f[47], A = (D = f[8] ^ f[18] ^ f[28] ^ f[38] ^ f[48]) ^ (g << 1 | T >>> 31), E = (j = f[9] ^ f[19] ^ f[29] ^ f[39] ^ f[49]) ^ (T << 1 | g >>> 31), f[0] ^= A, f[1] ^= E, f[10] ^= A, f[11] ^= E, f[20] ^= A, f[21] ^= E, f[30] ^= A, f[31] ^= E, f[40] ^= A, f[41] ^= E, A = k ^ (z << 1 | b >>> 31), E = _ ^ (b << 1 | z >>> 31), f[2] ^= A, f[3] ^= E, f[12] ^= A, f[13] ^= E, f[22] ^= A, f[23] ^= E, f[32] ^= A, f[33] ^= E, f[42] ^= A, f[43] ^= E, A = g ^ (B << 1 | F >>> 31), E = T ^ (F << 1 | B >>> 31), f[4] ^= A, f[5] ^= E, f[14] ^= A, f[15] ^= E, f[24] ^= A, f[25] ^= E, f[34] ^= A, f[35] ^= E, f[44] ^= A, f[45] ^= E, A = z ^ (D << 1 | j >>> 31), E = b ^ (j << 1 | D >>> 31), f[6] ^= A, f[7] ^= E, f[16] ^= A, f[17] ^= E, f[26] ^= A, f[27] ^= E, f[36] ^= A, f[37] ^= E, f[46] ^= A, f[47] ^= E, A = B ^ (k << 1 | _ >>> 31), E = F ^ (_ << 1 | k >>> 31), f[8] ^= A, f[9] ^= E, f[18] ^= A, f[19] ^= E, f[28] ^= A, f[29] ^= E, f[38] ^= A, f[39] ^= E, f[48] ^= A, f[49] ^= E, Z = f[0], H = f[1], nt = f[11] << 4 | f[10] >>> 28, it = f[10] << 4 | f[11] >>> 28, je = f[20] << 3 | f[21] >>> 29, Ke = f[21] << 3 | f[20] >>> 29, xe = f[31] << 9 | f[30] >>> 23, dt = f[30] << 9 | f[31] >>> 23, ye = f[40] << 18 | f[41] >>> 14, tt = f[41] << 18 | f[40] >>> 14, Ze = f[2] << 1 | f[3] >>> 31, We = f[3] << 1 | f[2] >>> 31, V = f[13] << 12 | f[12] >>> 20, Me = f[12] << 12 | f[13] >>> 20, we = f[22] << 10 | f[23] >>> 22, st = f[23] << 10 | f[22] >>> 22, de = f[33] << 13 | f[32] >>> 19, Je = f[32] << 13 | f[33] >>> 19, pt = f[42] << 2 | f[43] >>> 30, _e = f[43] << 2 | f[42] >>> 30, Ae = f[5] << 30 | f[4] >>> 2, lt = f[4] << 30 | f[5] >>> 2, me = f[14] << 6 | f[15] >>> 26, Qe = f[15] << 6 | f[14] >>> 26, K = f[25] << 11 | f[24] >>> 21, le = f[24] << 11 | f[25] >>> 21, ot = f[34] << 15 | f[35] >>> 17, be = f[35] << 15 | f[34] >>> 17, Ve = f[45] << 29 | f[44] >>> 3, pe = f[44] << 29 | f[45] >>> 3, fe = f[6] << 28 | f[7] >>> 4, Ge = f[7] << 28 | f[6] >>> 4, ht = f[17] << 23 | f[16] >>> 9, Ee = f[16] << 23 | f[17] >>> 9, Ye = f[26] << 25 | f[27] >>> 7, ge = f[27] << 25 | f[26] >>> 7, $e = f[36] << 21 | f[37] >>> 11, he = f[37] << 21 | f[36] >>> 11, at = f[47] << 24 | f[46] >>> 8, ut = f[46] << 24 | f[47] >>> 8, rt = f[8] << 27 | f[9] >>> 5, ve = f[9] << 27 | f[8] >>> 5, He = f[18] << 20 | f[19] >>> 12, ce = f[19] << 20 | f[18] >>> 12, ft = f[29] << 7 | f[28] >>> 25, ct = f[28] << 7 | f[29] >>> 25, Xe = f[38] << 8 | f[39] >>> 24, et = f[39] << 8 | f[38] >>> 24, qe = f[48] << 14 | f[49] >>> 18, ze = f[49] << 14 | f[48] >>> 18, f[0] = Z ^ ~V & K, f[1] = H ^ ~Me & le, f[10] = fe ^ ~He & je, f[11] = Ge ^ ~ce & Ke, f[20] = Ze ^ ~me & Ye, f[21] = We ^ ~Qe & ge, f[30] = rt ^ ~nt & we, f[31] = ve ^ ~it & st, f[40] = Ae ^ ~ht & ft, f[41] = lt ^ ~Ee & ct, f[2] = V ^ ~K & $e, f[3] = Me ^ ~le & he, f[12] = He ^ ~je & de, f[13] = ce ^ ~Ke & Je, f[22] = me ^ ~Ye & Xe, f[23] = Qe ^ ~ge & et, f[32] = nt ^ ~we & ot, f[33] = it ^ ~st & be, f[42] = ht ^ ~ft & xe, f[43] = Ee ^ ~ct & dt, f[4] = K ^ ~$e & qe, f[5] = le ^ ~he & ze, f[14] = je ^ ~de & Ve, f[15] = Ke ^ ~Je & pe, f[24] = Ye ^ ~Xe & ye, f[25] = ge ^ ~et & tt, f[34] = we ^ ~ot & at, f[35] = st ^ ~be & ut, f[44] = ft ^ ~xe & pt, f[45] = ct ^ ~dt & _e, f[6] = $e ^ ~qe & Z, f[7] = he ^ ~ze & H, f[16] = de ^ ~Ve & fe, f[17] = Je ^ ~pe & Ge, f[26] = Xe ^ ~ye & Ze, f[27] = et ^ ~tt & We, f[36] = ot ^ ~at & rt, f[37] = be ^ ~ut & ve, f[46] = xe ^ ~pt & Ae, f[47] = dt ^ ~_e & lt, f[8] = qe ^ ~Z & V, f[9] = ze ^ ~H & Me, f[18] = Ve ^ ~fe & He, f[19] = pe ^ ~Ge & ce, f[28] = ye ^ ~Ze & me, f[29] = tt ^ ~We & Qe, f[38] = at ^ ~rt & nt, f[39] = ut ^ ~ve & it, f[48] = pt ^ ~Ae & ht, f[49] = _e ^ ~lt & Ee, f[0] ^= h[x], f[1] ^= h[x + 1]
            };
            if (i) ya.exports = q;
            else
                for (ue = 0; ue < J.length; ++ue) t[J[ue]] = q[J[ue]]
        }();
    var Od = Wu(eh.exports);

    function ts(r) {
        return "0x" + Od.keccak_256(Ct(r))
    }
    const Fd = "rlp/5.7.0",
        Dd = new X(Fd);

    function th(r) {
        const e = [];
        for (; r;) e.unshift(255 & r), r >>= 8;
        return e
    }

    function rh(r) {
        if (Array.isArray(r)) {
            let n = [];
            if (r.forEach(function(s) {
                    n = n.concat(rh(s))
                }), n.length <= 55) return n.unshift(192 + n.length), n;
            const i = th(n.length);
            return i.unshift(247 + i.length), i.concat(n)
        }
        Vc(r) || Dd.throwArgumentError("RLP object must be BytesLike", "object", r);
        const e = Array.prototype.slice.call(Ct(r));
        if (e.length === 1 && e[0] <= 127) return e;
        if (e.length <= 55) return e.unshift(128 + e.length), e;
        const t = th(e.length);
        return t.unshift(183 + t.length), t.concat(e)
    }

    function Ld(r) {
        return kt(rh(r))
    }
    const Ud = "address/5.7.0",
        Ei = new X(Ud);

    function nh(r) {
        Vt(r, 20) || Ei.throwArgumentError("invalid address", "address", r);
        const e = (r = r.toLowerCase()).substring(2).split(""),
            t = new Uint8Array(40);
        for (let i = 0; i < 40; i++) t[i] = e[i].charCodeAt(0);
        const n = Ct(ts(t));
        for (let i = 0; i < 40; i += 2) n[i >> 1] >> 4 >= 8 && (e[i] = e[i].toUpperCase()), (15 & n[i >> 1]) >= 8 && (e[i + 1] = e[i + 1].toUpperCase());
        return "0x" + e.join("")
    }
    const va = {};
    for (let r = 0; r < 10; r++) va[String(r)] = String(r);
    for (let r = 0; r < 26; r++) va[String.fromCharCode(65 + r)] = String(10 + r);
    const ih = Math.floor((wa = 9007199254740991, Math.log10 ? Math.log10(wa) : Math.log(wa) / Math.LN10));
    var wa;

    function cn(r) {
        let e = null;
        if (typeof r != "string" && Ei.throwArgumentError("invalid address", "address", r), r.match(/^(0x)?[0-9a-fA-F]{40}$/)) r.substring(0, 2) !== "0x" && (r = "0x" + r), e = nh(r), r.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && e !== r && Ei.throwArgumentError("bad address checksum", "address", r);
        else if (r.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
            for (r.substring(2, 4) !== function(t) {
                    let n = (t = (t = t.toUpperCase()).substring(4) + t.substring(0, 2) + "00").split("").map(s => va[s]).join("");
                    for (; n.length >= ih;) {
                        let s = n.substring(0, ih);
                        n = parseInt(s, 10) % 97 + n.substring(s.length)
                    }
                    let i = String(98 - parseInt(n, 10) % 97);
                    for (; i.length < 2;) i = "0" + i;
                    return i
                }(r) && Ei.throwArgumentError("bad icap checksum", "address", r), e = e0(r.substring(4)); e.length < 40;) e = "0" + e;
            e = nh("0x" + e)
        } else Ei.throwArgumentError("invalid address", "address", r);
        return e
    }

    function $d(r) {
        let e = null;
        try {
            e = cn(r.from)
        } catch {
            Ei.throwArgumentError("missing from address", "transaction", r)
        }
        const t = Zc(Ct(Y.from(r.nonce).toHexString()));
        return cn(Ju(ts(Ld([e, t])), 12))
    }
    const qd = "strings/5.7.0",
        sh = new X(qd);
    var Zs, sr;

    function oh(r, e, t, n, i) {
        if (r === sr.BAD_PREFIX || r === sr.UNEXPECTED_CONTINUE) {
            let s = 0;
            for (let o = e + 1; o < t.length && t[o] >> 6 == 2; o++) s++;
            return s
        }
        return r === sr.OVERRUN ? t.length - e - 1 : 0
    }(function(r) {
        r.current = "", r.NFC = "NFC", r.NFD = "NFD", r.NFKC = "NFKC", r.NFKD = "NFKD"
    })(Zs || (Zs = {})),
    function(r) {
        r.UNEXPECTED_CONTINUE = "unexpected continuation byte", r.BAD_PREFIX = "bad codepoint prefix", r.OVERRUN = "string overrun", r.MISSING_CONTINUE = "missing continuation byte", r.OUT_OF_RANGE = "out of UTF-8 range", r.UTF16_SURROGATE = "UTF-16 surrogate", r.OVERLONG = "overlong representation"
    }(sr || (sr = {}));
    const zd = Object.freeze({
        error: function(r, e, t, n, i) {
            return sh.throwArgumentError(`invalid codepoint at offset ${e}; ${r}`, "bytes", t)
        },
        ignore: oh,
        replace: function(r, e, t, n, i) {
            return r === sr.OVERLONG ? (n.push(i), 0) : (n.push(65533), oh(r, e, t))
        }
    });

    function ah(r, e = Zs.current) {
        e != Zs.current && (sh.checkNormalize(), r = r.normalize(e));
        let t = [];
        for (let n = 0; n < r.length; n++) {
            const i = r.charCodeAt(n);
            if (i < 128) t.push(i);
            else if (i < 2048) t.push(i >> 6 | 192), t.push(63 & i | 128);
            else if ((64512 & i) == 55296) {
                n++;
                const s = r.charCodeAt(n);
                if (n >= r.length || (64512 & s) != 56320) throw new Error("invalid utf-8 string");
                const o = 65536 + ((1023 & i) << 10) + (1023 & s);
                t.push(o >> 18 | 240), t.push(o >> 12 & 63 | 128), t.push(o >> 6 & 63 | 128), t.push(63 & o | 128)
            } else t.push(i >> 12 | 224), t.push(i >> 6 & 63 | 128), t.push(63 & i | 128)
        }
        return Ct(t)
    }

    function Gd(r) {
        return r.map(e => e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode(55296 + (e >> 10 & 1023), 56320 + (1023 & e)))).join("")
    }

    function Hd(r, e) {
        return Gd(function(t, n) {
            n == null && (n = zd.error), t = Ct(t);
            const i = [];
            let s = 0;
            for (; s < t.length;) {
                const o = t[s++];
                if (!(o >> 7)) {
                    i.push(o);
                    continue
                }
                let u = null,
                    l = null;
                if ((224 & o) == 192) u = 1, l = 127;
                else if ((240 & o) == 224) u = 2, l = 2047;
                else {
                    if ((248 & o) != 240) {
                        s += n((192 & o) == 128 ? sr.UNEXPECTED_CONTINUE : sr.BAD_PREFIX, s - 1, t, i);
                        continue
                    }
                    u = 3, l = 65535
                }
                if (s - 1 + u >= t.length) {
                    s += n(sr.OVERRUN, s - 1, t, i);
                    continue
                }
                let h = o & (1 << 8 - u - 1) - 1;
                for (let c = 0; c < u; c++) {
                    let y = t[s];
                    if ((192 & y) != 128) {
                        s += n(sr.MISSING_CONTINUE, s, t, i), h = null;
                        break
                    }
                    h = h << 6 | 63 & y, s++
                }
                h !== null && (h > 1114111 ? s += n(sr.OUT_OF_RANGE, s - 1 - u, t, i, h) : h >= 55296 && h <= 57343 ? s += n(sr.UTF16_SURROGATE, s - 1 - u, t, i, h) : h <= l ? s += n(sr.OVERLONG, s - 1 - u, t, i, h) : i.push(h))
            }
            return i
        }(r, e))
    }

    function Ws(r) {
        return ts(ah(r))
    }
    const jd = "properties/5.7.0";
    var Kd = function(r, e, t, n) {
        return new(t || (t = Promise))(function(i, s) {
            function o(h) {
                try {
                    l(n.next(h))
                } catch (c) {
                    s(c)
                }
            }

            function u(h) {
                try {
                    l(n.throw(h))
                } catch (c) {
                    s(c)
                }
            }

            function l(h) {
                var c;
                h.done ? i(h.value) : (c = h.value, c instanceof t ? c : new t(function(y) {
                    y(c)
                })).then(o, u)
            }
            l((n = n.apply(r, e || [])).next())
        })
    };
    const uh = new X(jd);

    function te(r, e, t) {
        Object.defineProperty(r, e, {
            enumerable: !0,
            value: t,
            writable: !1
        })
    }

    function rs(r, e) {
        for (let t = 0; t < 32; t++) {
            if (r[e]) return r[e];
            if (!r.prototype || typeof r.prototype != "object") break;
            r = Object.getPrototypeOf(r.prototype).constructor
        }
        return null
    }

    function In(r) {
        return Kd(this, void 0, void 0, function*() {
            const e = Object.keys(r).map(t => {
                const n = r[t];
                return Promise.resolve(n).then(i => ({
                    key: t,
                    value: i
                }))
            });
            return (yield Promise.all(e)).reduce((t, n) => (t[n.key] = n.value, t), {})
        })
    }

    function xi(r) {
        const e = {};
        for (const t in r) e[t] = r[t];
        return e
    }
    const Jd = {
        bigint: !0,
        boolean: !0,
        function: !0,
        number: !0,
        string: !0
    };

    function lh(r) {
        if (r == null || Jd[typeof r]) return !0;
        if (Array.isArray(r) || typeof r == "object") {
            if (!Object.isFrozen(r)) return !1;
            const e = Object.keys(r);
            for (let t = 0; t < e.length; t++) {
                let n = null;
                try {
                    n = r[e[t]]
                } catch {
                    continue
                }
                if (!lh(n)) return !1
            }
            return !0
        }
        return uh.throwArgumentError("Cannot deepCopy " + typeof r, "object", r)
    }

    function Vd(r) {
        if (lh(r)) return r;
        if (Array.isArray(r)) return Object.freeze(r.map(e => ns(e)));
        if (typeof r == "object") {
            const e = {};
            for (const t in r) {
                const n = r[t];
                n !== void 0 && te(e, t, ns(n))
            }
            return e
        }
        return uh.throwArgumentError("Cannot deepCopy " + typeof r, "object", r)
    }

    function ns(r) {
        return Vd(r)
    }
    let Qs = class {
        constructor(e) {
            for (const t in e) this[t] = ns(e[t])
        }
    };
    const is = "abi/5.7.0",
        ba = new X(is);

    function Zd(r) {
        const e = [],
            t = function(n, i) {
                if (Array.isArray(i))
                    for (let s in i) {
                        const o = n.slice();
                        o.push(s);
                        try {
                            t(o, i[s])
                        } catch (u) {
                            e.push({
                                path: o,
                                error: u
                            })
                        }
                    }
            };
        return t([], r), e
    }
    let dn = class {
            constructor(e, t, n, i) {
                this.name = e, this.type = t, this.localName = n, this.dynamic = i
            }
            _throwError(e, t) {
                ba.throwArgumentError(e, this.localName, t)
            }
        },
        Aa = class {
            constructor(e) {
                te(this, "wordSize", e || 32), this._data = [], this._dataLength = 0, this._padding = new Uint8Array(e)
            }
            get data() {
                return Qc(this._data)
            }
            get length() {
                return this._dataLength
            }
            _writeData(e) {
                return this._data.push(e), this._dataLength += e.length, e.length
            }
            appendWriter(e) {
                return this._writeData(fi(e._data))
            }
            writeBytes(e) {
                let t = Ct(e);
                const n = t.length % this.wordSize;
                return n && (t = fi([t, this._padding.slice(n)])), this._writeData(t)
            }
            _getValue(e) {
                let t = Ct(Y.from(e));
                return t.length > this.wordSize && ba.throwError("value out-of-bounds", X.errors.BUFFER_OVERRUN, {
                    length: this.wordSize,
                    offset: t.length
                }), t.length % this.wordSize && (t = fi([this._padding.slice(t.length % this.wordSize), t])), t
            }
            writeValue(e) {
                return this._writeData(this._getValue(e))
            }
            writeUpdatableValue() {
                const e = this._data.length;
                return this._data.push(this._padding), this._dataLength += this.wordSize, t => {
                    this._data[e] = this._getValue(t)
                }
            }
        },
        Wd = class Cu {
            constructor(e, t, n, i) {
                te(this, "_data", Ct(e)), te(this, "wordSize", t || 32), te(this, "_coerceFunc", n), te(this, "allowLoose", i), this._offset = 0
            }
            get data() {
                return kt(this._data)
            }
            get consumed() {
                return this._offset
            }
            static coerce(e, t) {
                let n = e.match("^u?int([0-9]+)$");
                return n && parseInt(n[1]) <= 48 && (t = t.toNumber()), t
            }
            coerce(e, t) {
                return this._coerceFunc ? this._coerceFunc(e, t) : Cu.coerce(e, t)
            }
            _peekBytes(e, t, n) {
                let i = Math.ceil(t / this.wordSize) * this.wordSize;
                return this._offset + i > this._data.length && (this.allowLoose && n && this._offset + t <= this._data.length ? i = t : ba.throwError("data out-of-bounds", X.errors.BUFFER_OVERRUN, {
                    length: this._data.length,
                    offset: this._offset + i
                })), this._data.slice(this._offset, this._offset + i)
            }
            subReader(e) {
                return new Cu(this._data.slice(this._offset + e), this.wordSize, this._coerceFunc, this.allowLoose)
            }
            readBytes(e, t) {
                let n = this._peekBytes(0, e, !!t);
                return this._offset += n.length, n.slice(0, e)
            }
            readValue() {
                return Y.from(this.readBytes(this.wordSize))
            }
        },
        Qd = class extends dn {
            constructor(e) {
                super("address", "address", e, !1)
            }
            defaultValue() {
                return "0x0000000000000000000000000000000000000000"
            }
            encode(e, t) {
                try {
                    t = cn(t)
                } catch (n) {
                    this._throwError(n.message, t)
                }
                return e.writeValue(t)
            }
            decode(e) {
                return cn(Ss(e.readValue().toHexString(), 20))
            }
        },
        Yd = class extends dn {
            constructor(e) {
                super(e.name, e.type, void 0, e.dynamic), this.coder = e
            }
            defaultValue() {
                return this.coder.defaultValue()
            }
            encode(e, t) {
                return this.coder.encode(e, t)
            }
            decode(e) {
                return this.coder.decode(e)
            }
        };
    const _i = new X(is);

    function hh(r, e, t) {
        let n = null;
        if (Array.isArray(t)) n = t;
        else if (t && typeof t == "object") {
            let l = {};
            n = e.map(h => {
                const c = h.localName;
                return c || _i.throwError("cannot encode object for signature with missing names", X.errors.INVALID_ARGUMENT, {
                    argument: "values",
                    coder: h,
                    value: t
                }), l[c] && _i.throwError("cannot encode object for signature with duplicate names", X.errors.INVALID_ARGUMENT, {
                    argument: "values",
                    coder: h,
                    value: t
                }), l[c] = !0, t[c]
            })
        } else _i.throwArgumentError("invalid tuple value", "tuple", t);
        e.length !== n.length && _i.throwArgumentError("types/value length mismatch", "tuple", t);
        let i = new Aa(r.wordSize),
            s = new Aa(r.wordSize),
            o = [];
        e.forEach((l, h) => {
            let c = n[h];
            if (l.dynamic) {
                let y = s.length;
                l.encode(s, c);
                let v = i.writeUpdatableValue();
                o.push(N => {
                    v(N + y)
                })
            } else l.encode(i, c)
        }), o.forEach(l => {
            l(i.length)
        });
        let u = r.appendWriter(i);
        return u += r.appendWriter(s), u
    }

    function fh(r, e) {
        let t = [],
            n = r.subReader(0);
        e.forEach(s => {
            let o = null;
            if (s.dynamic) {
                let u = r.readValue(),
                    l = n.subReader(u.toNumber());
                try {
                    o = s.decode(l)
                } catch (h) {
                    if (h.code === X.errors.BUFFER_OVERRUN) throw h;
                    o = h, o.baseType = s.name, o.name = s.localName, o.type = s.type
                }
            } else try {
                o = s.decode(r)
            } catch (u) {
                if (u.code === X.errors.BUFFER_OVERRUN) throw u;
                o = u, o.baseType = s.name, o.name = s.localName, o.type = s.type
            }
            o != null && t.push(o)
        });
        const i = e.reduce((s, o) => {
            const u = o.localName;
            return u && (s[u] || (s[u] = 0), s[u]++), s
        }, {});
        e.forEach((s, o) => {
            let u = s.localName;
            if (!u || i[u] !== 1 || (u === "length" && (u = "_length"), t[u] != null)) return;
            const l = t[o];
            l instanceof Error ? Object.defineProperty(t, u, {
                enumerable: !0,
                get: () => {
                    throw l
                }
            }) : t[u] = l
        });
        for (let s = 0; s < t.length; s++) {
            const o = t[s];
            o instanceof Error && Object.defineProperty(t, s, {
                enumerable: !0,
                get: () => {
                    throw o
                }
            })
        }
        return Object.freeze(t)
    }
    let Xd = class extends dn {
            constructor(e, t, n) {
                super("array", e.type + "[" + (t >= 0 ? t : "") + "]", n, t === -1 || e.dynamic), this.coder = e, this.length = t
            }
            defaultValue() {
                const e = this.coder.defaultValue(),
                    t = [];
                for (let n = 0; n < this.length; n++) t.push(e);
                return t
            }
            encode(e, t) {
                Array.isArray(t) || this._throwError("expected array value", t);
                let n = this.length;
                n === -1 && (n = t.length, e.writeValue(t.length)), _i.checkArgumentCount(t.length, n, "coder array" + (this.localName ? " " + this.localName : ""));
                let i = [];
                for (let s = 0; s < t.length; s++) i.push(this.coder);
                return hh(e, i, t)
            }
            decode(e) {
                let t = this.length;
                t === -1 && (t = e.readValue().toNumber(), 32 * t > e._data.length && _i.throwError("insufficient data length", X.errors.BUFFER_OVERRUN, {
                    length: e._data.length,
                    count: t
                }));
                let n = [];
                for (let i = 0; i < t; i++) n.push(new Yd(this.coder));
                return e.coerce(this.name, fh(e, n))
            }
        },
        ep = class extends dn {
            constructor(e) {
                super("bool", "bool", e, !1)
            }
            defaultValue() {
                return !1
            }
            encode(e, t) {
                return e.writeValue(t ? 1 : 0)
            }
            decode(e) {
                return e.coerce(this.type, !e.readValue().isZero())
            }
        },
        ch = class extends dn {
            constructor(e, t) {
                super(e, e, t, !0)
            }
            defaultValue() {
                return "0x"
            }
            encode(e, t) {
                t = Ct(t);
                let n = e.writeValue(t.length);
                return n += e.writeBytes(t), n
            }
            decode(e) {
                return e.readBytes(e.readValue().toNumber(), !0)
            }
        },
        tp = class extends ch {
            constructor(e) {
                super("bytes", e)
            }
            decode(e) {
                return e.coerce(this.name, kt(super.decode(e)))
            }
        },
        rp = class extends dn {
            constructor(e, t) {
                let n = "bytes" + String(e);
                super(n, n, t, !1), this.size = e
            }
            defaultValue() {
                return "0x0000000000000000000000000000000000000000000000000000000000000000".substring(0, 2 + 2 * this.size)
            }
            encode(e, t) {
                let n = Ct(t);
                return n.length !== this.size && this._throwError("incorrect data length", t), e.writeBytes(n)
            }
            decode(e) {
                return e.coerce(this.name, kt(e.readBytes(this.size)))
            }
        },
        np = class extends dn {
            constructor(e) {
                super("null", "", e, !1)
            }
            defaultValue() {
                return null
            }
            encode(e, t) {
                return t != null && this._throwError("not null", t), e.writeBytes([])
            }
            decode(e) {
                return e.readBytes(0), e.coerce(this.name, null)
            }
        };
    const ip = Y.from(-1),
        sp = Y.from(0),
        op = Y.from(1),
        ap = Y.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    let up = class extends dn {
            constructor(e, t, n) {
                const i = (t ? "int" : "uint") + 8 * e;
                super(i, i, n, !1), this.size = e, this.signed = t
            }
            defaultValue() {
                return 0
            }
            encode(e, t) {
                let n = Y.from(t),
                    i = ap.mask(8 * e.wordSize);
                if (this.signed) {
                    let s = i.mask(8 * this.size - 1);
                    (n.gt(s) || n.lt(s.add(op).mul(ip))) && this._throwError("value out-of-bounds", t)
                } else(n.lt(sp) || n.gt(i.mask(8 * this.size))) && this._throwError("value out-of-bounds", t);
                return n = n.toTwos(8 * this.size).mask(8 * this.size), this.signed && (n = n.fromTwos(8 * this.size).toTwos(8 * e.wordSize)), e.writeValue(n)
            }
            decode(e) {
                let t = e.readValue().mask(8 * this.size);
                return this.signed && (t = t.fromTwos(8 * this.size)), e.coerce(this.name, t)
            }
        },
        lp = class extends ch {
            constructor(e) {
                super("string", e)
            }
            defaultValue() {
                return ""
            }
            encode(e, t) {
                return super.encode(e, ah(t))
            }
            decode(e) {
                return Hd(super.decode(e))
            }
        },
        Ys = class extends dn {
            constructor(e, t) {
                let n = !1;
                const i = [];
                e.forEach(s => {
                    s.dynamic && (n = !0), i.push(s.type)
                }), super("tuple", "tuple(" + i.join(",") + ")", t, n), this.coders = e
            }
            defaultValue() {
                const e = [];
                this.coders.forEach(n => {
                    e.push(n.defaultValue())
                });
                const t = this.coders.reduce((n, i) => {
                    const s = i.localName;
                    return s && (n[s] || (n[s] = 0), n[s]++), n
                }, {});
                return this.coders.forEach((n, i) => {
                    let s = n.localName;
                    s && t[s] === 1 && (s === "length" && (s = "_length"), e[s] == null && (e[s] = e[i]))
                }), Object.freeze(e)
            }
            encode(e, t) {
                return hh(e, this.coders, t)
            }
            decode(e) {
                return e.coerce(this.name, fh(e, this.coders))
            }
        };
    const Le = new X(is),
        Kn = {};
    let dh = {
            calldata: !0,
            memory: !0,
            storage: !0
        },
        hp = {
            calldata: !0,
            memory: !0
        };

    function Xs(r, e) {
        if (r === "bytes" || r === "string") {
            if (dh[e]) return !0
        } else if (r === "address") {
            if (e === "payable") return !0
        } else if ((r.indexOf("[") >= 0 || r === "tuple") && hp[e]) return !0;
        return (dh[e] || e === "payable") && Le.throwArgumentError("invalid modifier", "name", e), !1
    }

    function Ea(r, e) {
        for (let t in e) te(r, t, e[t])
    }
    const mt = Object.freeze({
            sighash: "sighash",
            minimal: "minimal",
            full: "full",
            json: "json"
        }),
        fp = new RegExp(/^(.*)\[([0-9]*)\]$/);
    let Hr = class qn {
        constructor(e, t) {
            e !== Kn && Le.throwError("use fromString", X.errors.UNSUPPORTED_OPERATION, {
                operation: "new ParamType()"
            }), Ea(this, t);
            let n = this.type.match(fp);
            Ea(this, n ? {
                arrayLength: parseInt(n[2] || "-1"),
                arrayChildren: qn.fromObject({
                    type: n[1],
                    components: this.components
                }),
                baseType: "array"
            } : {
                arrayLength: null,
                arrayChildren: null,
                baseType: this.components != null ? "tuple" : this.type
            }), this._isParamType = !0, Object.freeze(this)
        }
        format(e) {
            if (e || (e = mt.sighash), mt[e] || Le.throwArgumentError("invalid format type", "format", e), e === mt.json) {
                let n = {
                    type: this.baseType === "tuple" ? "tuple" : this.type,
                    name: this.name || void 0
                };
                return typeof this.indexed == "boolean" && (n.indexed = this.indexed), this.components && (n.components = this.components.map(i => JSON.parse(i.format(e)))), JSON.stringify(n)
            }
            let t = "";
            return this.baseType === "array" ? (t += this.arrayChildren.format(e), t += "[" + (this.arrayLength < 0 ? "" : String(this.arrayLength)) + "]") : this.baseType === "tuple" ? (e !== mt.sighash && (t += this.type), t += "(" + this.components.map(n => n.format(e)).join(e === mt.full ? ", " : ",") + ")") : t += this.type, e !== mt.sighash && (this.indexed === !0 && (t += " indexed"), e === mt.full && this.name && (t += " " + this.name)), t
        }
        static from(e, t) {
            return typeof e == "string" ? qn.fromString(e, t) : qn.fromObject(e)
        }
        static fromObject(e) {
            return qn.isParamType(e) ? e : new qn(Kn, {
                name: e.name || null,
                type: Mi(e.type),
                indexed: e.indexed == null ? null : !!e.indexed,
                components: e.components ? e.components.map(qn.fromObject) : null
            })
        }
        static fromString(e, t) {
            return n = function(i, s) {
                let o = i;

                function u(y) {
                    Le.throwArgumentError(`unexpected character at position ${y}`, "param", i)
                }

                function l(y) {
                    let v = {
                        type: "",
                        name: "",
                        parent: y,
                        state: {
                            allowType: !0
                        }
                    };
                    return s && (v.indexed = !1), v
                }
                i = i.replace(/\s/g, " ");
                let h = {
                        type: "",
                        name: "",
                        state: {
                            allowType: !0
                        }
                    },
                    c = h;
                for (let y = 0; y < i.length; y++) {
                    let v = i[y];
                    switch (v) {
                        case "(":
                            c.state.allowType && c.type === "" ? c.type = "tuple" : c.state.allowParams || u(y), c.state.allowType = !1, c.type = Mi(c.type), c.components = [l(c)], c = c.components[0];
                            break;
                        case ")":
                            delete c.state, c.name === "indexed" && (s || u(y), c.indexed = !0, c.name = ""), Xs(c.type, c.name) && (c.name = ""), c.type = Mi(c.type);
                            let N = c;
                            c = c.parent, c || u(y), delete N.parent, c.state.allowParams = !1, c.state.allowName = !0, c.state.allowArray = !0;
                            break;
                        case ",":
                            delete c.state, c.name === "indexed" && (s || u(y), c.indexed = !0, c.name = ""), Xs(c.type, c.name) && (c.name = ""), c.type = Mi(c.type);
                            let P = l(c.parent);
                            c.parent.components.push(P), delete c.parent, c = P;
                            break;
                        case " ":
                            c.state.allowType && c.type !== "" && (c.type = Mi(c.type), delete c.state.allowType, c.state.allowName = !0, c.state.allowParams = !0), c.state.allowName && c.name !== "" && (c.name === "indexed" ? (s || u(y), c.indexed && u(y), c.indexed = !0, c.name = "") : Xs(c.type, c.name) ? c.name = "" : c.state.allowName = !1);
                            break;
                        case "[":
                            c.state.allowArray || u(y), c.type += v, c.state.allowArray = !1, c.state.allowName = !1, c.state.readArray = !0;
                            break;
                        case "]":
                            c.state.readArray || u(y), c.type += v, c.state.readArray = !1, c.state.allowArray = !0, c.state.allowName = !0;
                            break;
                        default:
                            c.state.allowType ? (c.type += v, c.state.allowParams = !0, c.state.allowArray = !0) : c.state.allowName ? (c.name += v, delete c.state.allowArray) : c.state.readArray ? c.type += v : u(y)
                    }
                }
                return c.parent && Le.throwArgumentError("unexpected eof", "param", i), delete h.state, c.name === "indexed" ? (s || u(o.length - 7), c.indexed && u(o.length - 7), c.indexed = !0, c.name = "") : Xs(c.type, c.name) && (c.name = ""), h.type = Mi(h.type), h
            }(e, !!t), qn.fromObject({
                name: n.name,
                type: n.type,
                indexed: n.indexed,
                components: n.components
            });
            var n
        }
        static isParamType(e) {
            return !(e == null || !e._isParamType)
        }
    };

    function ss(r, e) {
        return function(t) {
            t = t.trim();
            let n = [],
                i = "",
                s = 0;
            for (let o = 0; o < t.length; o++) {
                let u = t[o];
                u === "," && s === 0 ? (n.push(i), i = "") : (i += u, u === "(" ? s++ : u === ")" && (s--, s === -1 && Le.throwArgumentError("unbalanced parenthesis", "value", t)))
            }
            return i && n.push(i), n
        }(r).map(t => Hr.fromString(t, e))
    }
    class pn {
        constructor(e, t) {
            e !== Kn && Le.throwError("use a static from method", X.errors.UNSUPPORTED_OPERATION, {
                operation: "new Fragment()"
            }), Ea(this, t), this._isFragment = !0, Object.freeze(this)
        }
        static from(e) {
            return pn.isFragment(e) ? e : typeof e == "string" ? pn.fromString(e) : pn.fromObject(e)
        }
        static fromObject(e) {
            if (pn.isFragment(e)) return e;
            switch (e.type) {
                case "function":
                    return jr.fromObject(e);
                case "event":
                    return xa.fromObject(e);
                case "constructor":
                    return eo.fromObject(e);
                case "error":
                    return vh.fromObject(e);
                case "fallback":
                case "receive":
                    return null
            }
            return Le.throwArgumentError("invalid fragment object", "value", e)
        }
        static fromString(e) {
            return (e = (e = (e = e.replace(/\s/g, " ")).replace(/\(/g, " (").replace(/\)/g, ") ").replace(/\s+/g, " ")).trim()).split(" ")[0] === "event" ? xa.fromString(e.substring(5).trim()) : e.split(" ")[0] === "function" ? jr.fromString(e.substring(8).trim()) : e.split("(")[0].trim() === "constructor" ? eo.fromString(e.trim()) : e.split(" ")[0] === "error" ? vh.fromString(e.substring(5).trim()) : Le.throwArgumentError("unsupported fragment", "value", e)
        }
        static isFragment(e) {
            return !(!e || !e._isFragment)
        }
    }
    let xa = class zi extends pn {
        format(e) {
            if (e || (e = mt.sighash), mt[e] || Le.throwArgumentError("invalid format type", "format", e), e === mt.json) return JSON.stringify({
                type: "event",
                anonymous: this.anonymous,
                name: this.name,
                inputs: this.inputs.map(n => JSON.parse(n.format(e)))
            });
            let t = "";
            return e !== mt.sighash && (t += "event "), t += this.name + "(" + this.inputs.map(n => n.format(e)).join(e === mt.full ? ", " : ",") + ") ", e !== mt.sighash && this.anonymous && (t += "anonymous "), t.trim()
        }
        static from(e) {
            return typeof e == "string" ? zi.fromString(e) : zi.fromObject(e)
        }
        static fromObject(e) {
            if (zi.isEventFragment(e)) return e;
            e.type !== "event" && Le.throwArgumentError("invalid event object", "value", e);
            const t = {
                name: os(e.name),
                anonymous: e.anonymous,
                inputs: e.inputs ? e.inputs.map(Hr.fromObject) : [],
                type: "event"
            };
            return new zi(Kn, t)
        }
        static fromString(e) {
            let t = e.match(as);
            t || Le.throwArgumentError("invalid event string", "value", e);
            let n = !1;
            return t[3].split(" ").forEach(i => {
                switch (i.trim()) {
                    case "anonymous":
                        n = !0;
                        break;
                    case "":
                        break;
                    default:
                        Le.warn("unknown modifier: " + i)
                }
            }), zi.fromObject({
                name: t[1].trim(),
                anonymous: n,
                inputs: ss(t[2], !0),
                type: "event"
            })
        }
        static isEventFragment(e) {
            return e && e._isFragment && e.type === "event"
        }
    };

    function ph(r, e) {
        e.gas = null;
        let t = r.split("@");
        return t.length !== 1 ? (t.length > 2 && Le.throwArgumentError("invalid human-readable ABI signature", "value", r), t[1].match(/^[0-9]+$/) || Le.throwArgumentError("invalid human-readable ABI signature gas", "value", r), e.gas = Y.from(t[1]), t[0]) : r
    }

    function mh(r, e) {
        e.constant = !1, e.payable = !1, e.stateMutability = "nonpayable", r.split(" ").forEach(t => {
            switch (t.trim()) {
                case "constant":
                    e.constant = !0;
                    break;
                case "payable":
                    e.payable = !0, e.stateMutability = "payable";
                    break;
                case "nonpayable":
                    e.payable = !1, e.stateMutability = "nonpayable";
                    break;
                case "pure":
                    e.constant = !0, e.stateMutability = "pure";
                    break;
                case "view":
                    e.constant = !0, e.stateMutability = "view";
                    break;
                case "external":
                case "public":
                case "":
                    break;
                default:
                    console.log("unknown modifier: " + t)
            }
        })
    }

    function gh(r) {
        let e = {
            constant: !1,
            payable: !0,
            stateMutability: "payable"
        };
        return r.stateMutability != null ? (e.stateMutability = r.stateMutability, e.constant = e.stateMutability === "view" || e.stateMutability === "pure", r.constant != null && !!r.constant !== e.constant && Le.throwArgumentError("cannot have constant function with mutability " + e.stateMutability, "value", r), e.payable = e.stateMutability === "payable", r.payable != null && !!r.payable !== e.payable && Le.throwArgumentError("cannot have payable function with mutability " + e.stateMutability, "value", r)) : r.payable != null ? (e.payable = !!r.payable, r.constant != null || e.payable || r.type === "constructor" || Le.throwArgumentError("unable to determine stateMutability", "value", r), e.constant = !!r.constant, e.constant ? e.stateMutability = "view" : e.stateMutability = e.payable ? "payable" : "nonpayable", e.payable && e.constant && Le.throwArgumentError("cannot have constant payable function", "value", r)) : r.constant != null ? (e.constant = !!r.constant, e.payable = !e.constant, e.stateMutability = e.constant ? "view" : "payable") : r.type !== "constructor" && Le.throwArgumentError("unable to determine stateMutability", "value", r), e
    }
    let eo = class Gi extends pn {
        format(e) {
            if (e || (e = mt.sighash), mt[e] || Le.throwArgumentError("invalid format type", "format", e), e === mt.json) return JSON.stringify({
                type: "constructor",
                stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : void 0,
                payable: this.payable,
                gas: this.gas ? this.gas.toNumber() : void 0,
                inputs: this.inputs.map(n => JSON.parse(n.format(e)))
            });
            e === mt.sighash && Le.throwError("cannot format a constructor for sighash", X.errors.UNSUPPORTED_OPERATION, {
                operation: "format(sighash)"
            });
            let t = "constructor(" + this.inputs.map(n => n.format(e)).join(e === mt.full ? ", " : ",") + ") ";
            return this.stateMutability && this.stateMutability !== "nonpayable" && (t += this.stateMutability + " "), t.trim()
        }
        static from(e) {
            return typeof e == "string" ? Gi.fromString(e) : Gi.fromObject(e)
        }
        static fromObject(e) {
            if (Gi.isConstructorFragment(e)) return e;
            e.type !== "constructor" && Le.throwArgumentError("invalid constructor object", "value", e);
            let t = gh(e);
            t.constant && Le.throwArgumentError("constructor cannot be constant", "value", e);
            const n = {
                name: null,
                type: e.type,
                inputs: e.inputs ? e.inputs.map(Hr.fromObject) : [],
                payable: t.payable,
                stateMutability: t.stateMutability,
                gas: e.gas ? Y.from(e.gas) : null
            };
            return new Gi(Kn, n)
        }
        static fromString(e) {
            let t = {
                    type: "constructor"
                },
                n = (e = ph(e, t)).match(as);
            return n && n[1].trim() === "constructor" || Le.throwArgumentError("invalid constructor string", "value", e), t.inputs = ss(n[2].trim(), !1), mh(n[3].trim(), t), Gi.fromObject(t)
        }
        static isConstructorFragment(e) {
            return e && e._isFragment && e.type === "constructor"
        }
    };
    class jr extends eo {
        format(e) {
            if (e || (e = mt.sighash), mt[e] || Le.throwArgumentError("invalid format type", "format", e), e === mt.json) return JSON.stringify({
                type: "function",
                name: this.name,
                constant: this.constant,
                stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : void 0,
                payable: this.payable,
                gas: this.gas ? this.gas.toNumber() : void 0,
                inputs: this.inputs.map(n => JSON.parse(n.format(e))),
                outputs: this.outputs.map(n => JSON.parse(n.format(e)))
            });
            let t = "";
            return e !== mt.sighash && (t += "function "), t += this.name + "(" + this.inputs.map(n => n.format(e)).join(e === mt.full ? ", " : ",") + ") ", e !== mt.sighash && (this.stateMutability ? this.stateMutability !== "nonpayable" && (t += this.stateMutability + " ") : this.constant && (t += "view "), this.outputs && this.outputs.length && (t += "returns (" + this.outputs.map(n => n.format(e)).join(", ") + ") "), this.gas != null && (t += "@" + this.gas.toString() + " ")), t.trim()
        }
        static from(e) {
            return typeof e == "string" ? jr.fromString(e) : jr.fromObject(e)
        }
        static fromObject(e) {
            if (jr.isFunctionFragment(e)) return e;
            e.type !== "function" && Le.throwArgumentError("invalid function object", "value", e);
            let t = gh(e);
            const n = {
                type: e.type,
                name: os(e.name),
                constant: t.constant,
                inputs: e.inputs ? e.inputs.map(Hr.fromObject) : [],
                outputs: e.outputs ? e.outputs.map(Hr.fromObject) : [],
                payable: t.payable,
                stateMutability: t.stateMutability,
                gas: e.gas ? Y.from(e.gas) : null
            };
            return new jr(Kn, n)
        }
        static fromString(e) {
            let t = {
                    type: "function"
                },
                n = (e = ph(e, t)).split(" returns ");
            n.length > 2 && Le.throwArgumentError("invalid function string", "value", e);
            let i = n[0].match(as);
            if (i || Le.throwArgumentError("invalid function signature", "value", e), t.name = i[1].trim(), t.name && os(t.name), t.inputs = ss(i[2], !1), mh(i[3].trim(), t), n.length > 1) {
                let s = n[1].match(as);
                s[1].trim() == "" && s[3].trim() == "" || Le.throwArgumentError("unexpected tokens", "value", e), t.outputs = ss(s[2], !1)
            } else t.outputs = [];
            return jr.fromObject(t)
        }
        static isFunctionFragment(e) {
            return e && e._isFragment && e.type === "function"
        }
    }

    function yh(r) {
        const e = r.format();
        return e !== "Error(string)" && e !== "Panic(uint256)" || Le.throwArgumentError(`cannot specify user defined ${e} error`, "fragment", r), r
    }
    let vh = class Hi extends pn {
        format(e) {
            if (e || (e = mt.sighash), mt[e] || Le.throwArgumentError("invalid format type", "format", e), e === mt.json) return JSON.stringify({
                type: "error",
                name: this.name,
                inputs: this.inputs.map(n => JSON.parse(n.format(e)))
            });
            let t = "";
            return e !== mt.sighash && (t += "error "), t += this.name + "(" + this.inputs.map(n => n.format(e)).join(e === mt.full ? ", " : ",") + ") ", t.trim()
        }
        static from(e) {
            return typeof e == "string" ? Hi.fromString(e) : Hi.fromObject(e)
        }
        static fromObject(e) {
            if (Hi.isErrorFragment(e)) return e;
            e.type !== "error" && Le.throwArgumentError("invalid error object", "value", e);
            const t = {
                type: e.type,
                name: os(e.name),
                inputs: e.inputs ? e.inputs.map(Hr.fromObject) : []
            };
            return yh(new Hi(Kn, t))
        }
        static fromString(e) {
            let t = {
                    type: "error"
                },
                n = e.match(as);
            return n || Le.throwArgumentError("invalid error signature", "value", e), t.name = n[1].trim(), t.name && os(t.name), t.inputs = ss(n[2], !1), yh(Hi.fromObject(t))
        }
        static isErrorFragment(e) {
            return e && e._isFragment && e.type === "error"
        }
    };

    function Mi(r) {
        return r.match(/^uint($|[^1-9])/) ? r = "uint256" + r.substring(4) : r.match(/^int($|[^1-9])/) && (r = "int256" + r.substring(3)), r
    }
    const cp = new RegExp("^[a-zA-Z$_][a-zA-Z0-9$_]*$");

    function os(r) {
        return r && r.match(cp) || Le.throwArgumentError(`invalid identifier "${r}"`, "value", r), r
    }
    const as = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$"),
        to = new X(is),
        dp = new RegExp(/^bytes([0-9]*)$/),
        pp = new RegExp(/^(u?int)([0-9]*)$/);
    let mp = class {
        constructor(e) {
            te(this, "coerceFunc", e || null)
        }
        _getCoder(e) {
            switch (e.baseType) {
                case "address":
                    return new Qd(e.name);
                case "bool":
                    return new ep(e.name);
                case "string":
                    return new lp(e.name);
                case "bytes":
                    return new tp(e.name);
                case "array":
                    return new Xd(this._getCoder(e.arrayChildren), e.arrayLength, e.name);
                case "tuple":
                    return new Ys((e.components || []).map(n => this._getCoder(n)), e.name);
                case "":
                    return new np(e.name)
            }
            let t = e.type.match(pp);
            if (t) {
                let n = parseInt(t[2] || "256");
                return (n === 0 || n > 256 || n % 8 != 0) && to.throwArgumentError("invalid " + t[1] + " bit length", "param", e), new up(n / 8, t[1] === "int", e.name)
            }
            if (t = e.type.match(dp), t) {
                let n = parseInt(t[1]);
                return (n === 0 || n > 32) && to.throwArgumentError("invalid bytes length", "param", e), new rp(n, e.name)
            }
            return to.throwArgumentError("invalid type", "type", e.type)
        }
        _getWordSize() {
            return 32
        }
        _getReader(e, t) {
            return new Wd(e, this._getWordSize(), this.coerceFunc, t)
        }
        _getWriter() {
            return new Aa(this._getWordSize())
        }
        getDefaultValue(e) {
            const t = e.map(n => this._getCoder(Hr.from(n)));
            return new Ys(t, "_").defaultValue()
        }
        encode(e, t) {
            e.length !== t.length && to.throwError("types/values length mismatch", X.errors.INVALID_ARGUMENT, {
                count: {
                    types: e.length,
                    values: t.length
                },
                value: {
                    types: e,
                    values: t
                }
            });
            const n = e.map(o => this._getCoder(Hr.from(o))),
                i = new Ys(n, "_"),
                s = this._getWriter();
            return i.encode(s, t), s.data
        }
        decode(e, t, n) {
            const i = e.map(s => this._getCoder(Hr.from(s)));
            return new Ys(i, "_").decode(this._getReader(Ct(t), n))
        }
    };
    const gp = new mp,
        Mt = new X(is);
    let yp = class extends Qs {},
        vp = class extends Qs {};
    class wp extends Qs {}
    let _a = class extends Qs {
        static isIndexed(e) {
            return !(!e || !e._isIndexed)
        }
    };
    const bp = {
        "0x08c379a0": {
            signature: "Error(string)",
            name: "Error",
            inputs: ["string"],
            reason: !0
        },
        "0x4e487b71": {
            signature: "Panic(uint256)",
            name: "Panic",
            inputs: ["uint256"]
        }
    };

    function wh(r, e) {
        const t = new Error(`deferred error during ABI decoding triggered accessing ${r}`);
        return t.error = e, t
    }
    let Ni = class {
        constructor(e) {
            let t = [];
            t = typeof e == "string" ? JSON.parse(e) : e, te(this, "fragments", t.map(n => pn.from(n)).filter(n => n != null)), te(this, "_abiCoder", rs(new.target, "getAbiCoder")()), te(this, "functions", {}), te(this, "errors", {}), te(this, "events", {}), te(this, "structs", {}), this.fragments.forEach(n => {
                let i = null;
                switch (n.type) {
                    case "constructor":
                        return this.deploy ? void Mt.warn("duplicate definition - constructor") : void te(this, "deploy", n);
                    case "function":
                        i = this.functions;
                        break;
                    case "event":
                        i = this.events;
                        break;
                    case "error":
                        i = this.errors;
                        break;
                    default:
                        return
                }
                let s = n.format();
                i[s] ? Mt.warn("duplicate definition - " + s) : i[s] = n
            }), this.deploy || te(this, "deploy", eo.from({
                payable: !1,
                type: "constructor"
            })), te(this, "_isInterface", !0)
        }
        format(e) {
            e || (e = mt.full), e === mt.sighash && Mt.throwArgumentError("interface does not support formatting sighash", "format", e);
            const t = this.fragments.map(n => n.format(e));
            return e === mt.json ? JSON.stringify(t.map(n => JSON.parse(n))) : t
        }
        static getAbiCoder() {
            return gp
        }
        static getAddress(e) {
            return cn(e)
        }
        static getSighash(e) {
            return Ju(Ws(e.format()), 0, 4)
        }
        static getEventTopic(e) {
            return Ws(e.format())
        }
        getFunction(e) {
            if (Vt(e)) {
                for (const n in this.functions)
                    if (e === this.getSighash(n)) return this.functions[n];
                Mt.throwArgumentError("no matching function", "sighash", e)
            }
            if (e.indexOf("(") === -1) {
                const n = e.trim(),
                    i = Object.keys(this.functions).filter(s => s.split("(")[0] === n);
                return i.length === 0 ? Mt.throwArgumentError("no matching function", "name", n) : i.length > 1 && Mt.throwArgumentError("multiple matching functions", "name", n), this.functions[i[0]]
            }
            const t = this.functions[jr.fromString(e).format()];
            return t || Mt.throwArgumentError("no matching function", "signature", e), t
        }
        getEvent(e) {
            if (Vt(e)) {
                const n = e.toLowerCase();
                for (const i in this.events)
                    if (n === this.getEventTopic(i)) return this.events[i];
                Mt.throwArgumentError("no matching event", "topichash", n)
            }
            if (e.indexOf("(") === -1) {
                const n = e.trim(),
                    i = Object.keys(this.events).filter(s => s.split("(")[0] === n);
                return i.length === 0 ? Mt.throwArgumentError("no matching event", "name", n) : i.length > 1 && Mt.throwArgumentError("multiple matching events", "name", n), this.events[i[0]]
            }
            const t = this.events[xa.fromString(e).format()];
            return t || Mt.throwArgumentError("no matching event", "signature", e), t
        }
        getError(e) {
            if (Vt(e)) {
                const n = rs(this.constructor, "getSighash");
                for (const i in this.errors)
                    if (e === n(this.errors[i])) return this.errors[i];
                Mt.throwArgumentError("no matching error", "sighash", e)
            }
            if (e.indexOf("(") === -1) {
                const n = e.trim(),
                    i = Object.keys(this.errors).filter(s => s.split("(")[0] === n);
                return i.length === 0 ? Mt.throwArgumentError("no matching error", "name", n) : i.length > 1 && Mt.throwArgumentError("multiple matching errors", "name", n), this.errors[i[0]]
            }
            const t = this.errors[jr.fromString(e).format()];
            return t || Mt.throwArgumentError("no matching error", "signature", e), t
        }
        getSighash(e) {
            if (typeof e == "string") try {
                e = this.getFunction(e)
            } catch (t) {
                try {
                    e = this.getError(e)
                } catch {
                    throw t
                }
            }
            return rs(this.constructor, "getSighash")(e)
        }
        getEventTopic(e) {
            return typeof e == "string" && (e = this.getEvent(e)), rs(this.constructor, "getEventTopic")(e)
        }
        _decodeParams(e, t) {
            return this._abiCoder.decode(e, t)
        }
        _encodeParams(e, t) {
            return this._abiCoder.encode(e, t)
        }
        encodeDeploy(e) {
            return this._encodeParams(this.deploy.inputs, e || [])
        }
        decodeErrorResult(e, t) {
            typeof e == "string" && (e = this.getError(e));
            const n = Ct(t);
            return kt(n.slice(0, 4)) !== this.getSighash(e) && Mt.throwArgumentError(`data signature does not match error ${e.name}.`, "data", kt(n)), this._decodeParams(e.inputs, n.slice(4))
        }
        encodeErrorResult(e, t) {
            return typeof e == "string" && (e = this.getError(e)), kt(fi([this.getSighash(e), this._encodeParams(e.inputs, t || [])]))
        }
        decodeFunctionData(e, t) {
            typeof e == "string" && (e = this.getFunction(e));
            const n = Ct(t);
            return kt(n.slice(0, 4)) !== this.getSighash(e) && Mt.throwArgumentError(`data signature does not match function ${e.name}.`, "data", kt(n)), this._decodeParams(e.inputs, n.slice(4))
        }
        encodeFunctionData(e, t) {
            return typeof e == "string" && (e = this.getFunction(e)), kt(fi([this.getSighash(e), this._encodeParams(e.inputs, t || [])]))
        }
        decodeFunctionResult(e, t) {
            typeof e == "string" && (e = this.getFunction(e));
            let n = Ct(t),
                i = null,
                s = "",
                o = null,
                u = null,
                l = null;
            switch (n.length % this._abiCoder._getWordSize()) {
                case 0:
                    try {
                        return this._abiCoder.decode(e.outputs, n)
                    } catch {}
                    break;
                case 4:
                    {
                        const h = kt(n.slice(0, 4)),
                            c = bp[h];
                        if (c) o = this._abiCoder.decode(c.inputs, n.slice(4)),
                        u = c.name,
                        l = c.signature,
                        c.reason && (i = o[0]),
                        u === "Error" ? s = `; VM Exception while processing transaction: reverted with reason string ${JSON.stringify(o[0])}` : u === "Panic" && (s = `; VM Exception while processing transaction: reverted with panic code ${o[0]}`);
                        else try {
                            const y = this.getError(h);
                            o = this._abiCoder.decode(y.inputs, n.slice(4)), u = y.name, l = y.format()
                        } catch {}
                        break
                    }
            }
            return Mt.throwError("call revert exception" + s, X.errors.CALL_EXCEPTION, {
                method: e.format(),
                data: kt(t),
                errorArgs: o,
                errorName: u,
                errorSignature: l,
                reason: i
            })
        }
        encodeFunctionResult(e, t) {
            return typeof e == "string" && (e = this.getFunction(e)), kt(this._abiCoder.encode(e.outputs, t || []))
        }
        encodeFilterTopics(e, t) {
            typeof e == "string" && (e = this.getEvent(e)), t.length > e.inputs.length && Mt.throwError("too many arguments for " + e.format(), X.errors.UNEXPECTED_ARGUMENT, {
                argument: "values",
                value: t
            });
            let n = [];
            e.anonymous || n.push(this.getEventTopic(e));
            const i = (s, o) => s.type === "string" ? Ws(o) : s.type === "bytes" ? ts(kt(o)) : (s.type === "bool" && typeof o == "boolean" && (o = o ? "0x01" : "0x00"), s.type.match(/^u?int/) && (o = Y.from(o).toHexString()), s.type === "address" && this._abiCoder.encode(["address"], [o]), Ss(kt(o), 32));
            for (t.forEach((s, o) => {
                    let u = e.inputs[o];
                    u.indexed ? s == null ? n.push(null) : u.baseType === "array" || u.baseType === "tuple" ? Mt.throwArgumentError("filtering with tuples or arrays not supported", "contract." + u.name, s) : Array.isArray(s) ? n.push(s.map(l => i(u, l))) : n.push(i(u, s)) : s != null && Mt.throwArgumentError("cannot filter non-indexed parameters; must be null", "contract." + u.name, s)
                }); n.length && n[n.length - 1] === null;) n.pop();
            return n
        }
        encodeEventLog(e, t) {
            typeof e == "string" && (e = this.getEvent(e));
            const n = [],
                i = [],
                s = [];
            return e.anonymous || n.push(this.getEventTopic(e)), t.length !== e.inputs.length && Mt.throwArgumentError("event arguments/values mismatch", "values", t), e.inputs.forEach((o, u) => {
                const l = t[u];
                if (o.indexed)
                    if (o.type === "string") n.push(Ws(l));
                    else if (o.type === "bytes") n.push(ts(l));
                else {
                    if (o.baseType === "tuple" || o.baseType === "array") throw new Error("not implemented");
                    n.push(this._abiCoder.encode([o.type], [l]))
                } else i.push(o), s.push(l)
            }), {
                data: this._abiCoder.encode(i, s),
                topics: n
            }
        }
        decodeEventLog(e, t, n) {
            if (typeof e == "string" && (e = this.getEvent(e)), n != null && !e.anonymous) {
                let v = this.getEventTopic(e);
                Vt(n[0], 32) && n[0].toLowerCase() === v || Mt.throwError("fragment/topic mismatch", X.errors.INVALID_ARGUMENT, {
                    argument: "topics[0]",
                    expected: v,
                    value: n[0]
                }), n = n.slice(1)
            }
            let i = [],
                s = [],
                o = [];
            e.inputs.forEach((v, N) => {
                v.indexed ? v.type === "string" || v.type === "bytes" || v.baseType === "tuple" || v.baseType === "array" ? (i.push(Hr.fromObject({
                    type: "bytes32",
                    name: v.name
                })), o.push(!0)) : (i.push(v), o.push(!1)) : (s.push(v), o.push(!1))
            });
            let u = n != null ? this._abiCoder.decode(i, fi(n)) : null,
                l = this._abiCoder.decode(s, t, !0),
                h = [],
                c = 0,
                y = 0;
            e.inputs.forEach((v, N) => {
                if (v.indexed)
                    if (u == null) h[N] = new _a({
                        _isIndexed: !0,
                        hash: null
                    });
                    else if (o[N]) h[N] = new _a({
                    _isIndexed: !0,
                    hash: u[y++]
                });
                else try {
                    h[N] = u[y++]
                } catch (P) {
                    h[N] = P
                } else try {
                    h[N] = l[c++]
                } catch (P) {
                    h[N] = P
                }
                if (v.name && h[v.name] == null) {
                    const P = h[N];
                    P instanceof Error ? Object.defineProperty(h, v.name, {
                        enumerable: !0,
                        get: () => {
                            throw wh(`property ${JSON.stringify(v.name)}`, P)
                        }
                    }) : h[v.name] = P
                }
            });
            for (let v = 0; v < h.length; v++) {
                const N = h[v];
                N instanceof Error && Object.defineProperty(h, v, {
                    enumerable: !0,
                    get: () => {
                        throw wh(`index ${v}`, N)
                    }
                })
            }
            return Object.freeze(h)
        }
        parseTransaction(e) {
            let t = this.getFunction(e.data.substring(0, 10).toLowerCase());
            return t ? new vp({
                args: this._abiCoder.decode(t.inputs, "0x" + e.data.substring(10)),
                functionFragment: t,
                name: t.name,
                signature: t.format(),
                sighash: this.getSighash(t),
                value: Y.from(e.value || "0")
            }) : null
        }
        parseLog(e) {
            let t = this.getEvent(e.topics[0]);
            return !t || t.anonymous ? null : new yp({
                eventFragment: t,
                name: t.name,
                signature: t.format(),
                topic: this.getEventTopic(t),
                args: this.decodeEventLog(t, e.data, e.topics)
            })
        }
        parseError(e) {
            const t = kt(e);
            let n = this.getError(t.substring(0, 10).toLowerCase());
            return n ? new wp({
                args: this._abiCoder.decode(n.inputs, "0x" + t.substring(10)),
                errorFragment: n,
                name: n.name,
                signature: n.format(),
                sighash: this.getSighash(n)
            }) : null
        }
        static isInterface(e) {
            return !(!e || !e._isInterface)
        }
    };
    const Ap = "abstract-provider/5.7.0";
    var Ep = function(r, e, t, n) {
        return new(t || (t = Promise))(function(i, s) {
            function o(h) {
                try {
                    l(n.next(h))
                } catch (c) {
                    s(c)
                }
            }

            function u(h) {
                try {
                    l(n.throw(h))
                } catch (c) {
                    s(c)
                }
            }

            function l(h) {
                var c;
                h.done ? i(h.value) : (c = h.value, c instanceof t ? c : new t(function(y) {
                    y(c)
                })).then(o, u)
            }
            l((n = n.apply(r, e || [])).next())
        })
    };
    const xp = new X(Ap);
    let _p = class Ic {
        constructor() {
            xp.checkAbstract(new.target, Ic), te(this, "_isProvider", !0)
        }
        getFeeData() {
            return Ep(this, void 0, void 0, function*() {
                const {
                    block: e,
                    gasPrice: t
                } = yield In({
                    block: this.getBlock("latest"),
                    gasPrice: this.getGasPrice().catch(o => null)
                });
                let n = null,
                    i = null,
                    s = null;
                return e && e.baseFeePerGas && (n = e.baseFeePerGas, s = Y.from("1500000000"), i = e.baseFeePerGas.mul(2).add(s)), {
                    lastBaseFeePerGas: n,
                    maxFeePerGas: i,
                    maxPriorityFeePerGas: s,
                    gasPrice: t
                }
            })
        }
        addListener(e, t) {
            return this.on(e, t)
        }
        removeListener(e, t) {
            return this.off(e, t)
        }
        static isProvider(e) {
            return !(!e || !e._isProvider)
        }
    };
    const Mp = "abstract-signer/5.7.0";
    var Nr = function(r, e, t, n) {
        return new(t || (t = Promise))(function(i, s) {
            function o(h) {
                try {
                    l(n.next(h))
                } catch (c) {
                    s(c)
                }
            }

            function u(h) {
                try {
                    l(n.throw(h))
                } catch (c) {
                    s(c)
                }
            }

            function l(h) {
                var c;
                h.done ? i(h.value) : (c = h.value, c instanceof t ? c : new t(function(y) {
                    y(c)
                })).then(o, u)
            }
            l((n = n.apply(r, e || [])).next())
        })
    };
    const dr = new X(Mp),
        Np = ["accessList", "ccipReadEnabled", "chainId", "customData", "data", "from", "gasLimit", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas", "nonce", "to", "type", "value"],
        Tp = [X.errors.INSUFFICIENT_FUNDS, X.errors.NONCE_EXPIRED, X.errors.REPLACEMENT_UNDERPRICED];
    class ro {
        constructor() {
            dr.checkAbstract(new.target, ro), te(this, "_isSigner", !0)
        }
        getBalance(e) {
            return Nr(this, void 0, void 0, function*() {
                return this._checkProvider("getBalance"), yield this.provider.getBalance(this.getAddress(), e)
            })
        }
        getTransactionCount(e) {
            return Nr(this, void 0, void 0, function*() {
                return this._checkProvider("getTransactionCount"), yield this.provider.getTransactionCount(this.getAddress(), e)
            })
        }
        estimateGas(e) {
            return Nr(this, void 0, void 0, function*() {
                this._checkProvider("estimateGas");
                const t = yield In(this.checkTransaction(e));
                return yield this.provider.estimateGas(t)
            })
        }
        call(e, t) {
            return Nr(this, void 0, void 0, function*() {
                this._checkProvider("call");
                const n = yield In(this.checkTransaction(e));
                return yield this.provider.call(n, t)
            })
        }
        sendTransaction(e) {
            return Nr(this, void 0, void 0, function*() {
                this._checkProvider("sendTransaction");
                const t = yield this.populateTransaction(e), n = yield this.signTransaction(t);
                return yield this.provider.sendTransaction(n)
            })
        }
        getChainId() {
            return Nr(this, void 0, void 0, function*() {
                return this._checkProvider("getChainId"), (yield this.provider.getNetwork()).chainId
            })
        }
        getGasPrice() {
            return Nr(this, void 0, void 0, function*() {
                return this._checkProvider("getGasPrice"), yield this.provider.getGasPrice()
            })
        }
        getFeeData() {
            return Nr(this, void 0, void 0, function*() {
                return this._checkProvider("getFeeData"), yield this.provider.getFeeData()
            })
        }
        resolveName(e) {
            return Nr(this, void 0, void 0, function*() {
                return this._checkProvider("resolveName"), yield this.provider.resolveName(e)
            })
        }
        checkTransaction(e) {
            for (const n in e) Np.indexOf(n) === -1 && dr.throwArgumentError("invalid transaction key: " + n, "transaction", e);
            const t = xi(e);
            return t.from == null ? t.from = this.getAddress() : t.from = Promise.all([Promise.resolve(t.from), this.getAddress()]).then(n => (n[0].toLowerCase() !== n[1].toLowerCase() && dr.throwArgumentError("from address mismatch", "transaction", e), n[0])), t
        }
        populateTransaction(e) {
            return Nr(this, void 0, void 0, function*() {
                const t = yield In(this.checkTransaction(e));
                t.to != null && (t.to = Promise.resolve(t.to).then(i => Nr(this, void 0, void 0, function*() {
                    if (i == null) return null;
                    const s = yield this.resolveName(i);
                    return s == null && dr.throwArgumentError("provided ENS name resolves to null", "tx.to", i), s
                })), t.to.catch(i => {}));
                const n = t.maxFeePerGas != null || t.maxPriorityFeePerGas != null;
                if (t.gasPrice == null || t.type !== 2 && !n ? t.type !== 0 && t.type !== 1 || !n || dr.throwArgumentError("pre-eip-1559 transaction do not support maxFeePerGas/maxPriorityFeePerGas", "transaction", e) : dr.throwArgumentError("eip-1559 transaction do not support gasPrice", "transaction", e), t.type !== 2 && t.type != null || t.maxFeePerGas == null || t.maxPriorityFeePerGas == null)
                    if (t.type === 0 || t.type === 1) t.gasPrice == null && (t.gasPrice = this.getGasPrice());
                    else {
                        const i = yield this.getFeeData();
                        if (t.type == null)
                            if (i.maxFeePerGas != null && i.maxPriorityFeePerGas != null)
                                if (t.type = 2, t.gasPrice != null) {
                                    const s = t.gasPrice;
                                    delete t.gasPrice, t.maxFeePerGas = s, t.maxPriorityFeePerGas = s
                                } else t.maxFeePerGas == null && (t.maxFeePerGas = i.maxFeePerGas), t.maxPriorityFeePerGas == null && (t.maxPriorityFeePerGas = i.maxPriorityFeePerGas);
                        else i.gasPrice != null ? (n && dr.throwError("network does not support EIP-1559", X.errors.UNSUPPORTED_OPERATION, {
                            operation: "populateTransaction"
                        }), t.gasPrice == null && (t.gasPrice = i.gasPrice), t.type = 0) : dr.throwError("failed to get consistent fee data", X.errors.UNSUPPORTED_OPERATION, {
                            operation: "signer.getFeeData"
                        });
                        else t.type === 2 && (t.maxFeePerGas == null && (t.maxFeePerGas = i.maxFeePerGas), t.maxPriorityFeePerGas == null && (t.maxPriorityFeePerGas = i.maxPriorityFeePerGas))
                    }
                else t.type = 2;
                return t.nonce == null && (t.nonce = this.getTransactionCount("pending")), t.gasLimit == null && (t.gasLimit = this.estimateGas(t).catch(i => {
                    if (Tp.indexOf(i.code) >= 0) throw i;
                    return dr.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", X.errors.UNPREDICTABLE_GAS_LIMIT, {
                        error: i,
                        tx: t
                    })
                })), t.chainId == null ? t.chainId = this.getChainId() : t.chainId = Promise.all([Promise.resolve(t.chainId), this.getChainId()]).then(i => (i[1] !== 0 && i[0] !== i[1] && dr.throwArgumentError("chainId address mismatch", "transaction", e), i[0])), yield In(t)
            })
        }
        _checkProvider(e) {
            this.provider || dr.throwError("missing provider", X.errors.UNSUPPORTED_OPERATION, {
                operation: e || "_checkProvider"
            })
        }
        static isSigner(e) {
            return !(!e || !e._isSigner)
        }
    }
    class Ma extends ro {
        constructor(e, t) {
            super(), te(this, "address", e), te(this, "provider", t || null)
        }
        getAddress() {
            return Promise.resolve(this.address)
        }
        _fail(e, t) {
            return Promise.resolve().then(() => {
                dr.throwError(e, X.errors.UNSUPPORTED_OPERATION, {
                    operation: t
                })
            })
        }
        signMessage(e) {
            return this._fail("VoidSigner cannot sign messages", "signMessage")
        }
        signTransaction(e) {
            return this._fail("VoidSigner cannot sign transactions", "signTransaction")
        }
        _signTypedData(e, t, n) {
            return this._fail("VoidSigner cannot sign typed data", "signTypedData")
        }
        connect(e) {
            return new Ma(this.address, e)
        }
    }
    const Pp = "transactions/5.7.0",
        bh = new X(Pp);
    var Ah;

    function Na(r, e) {
        return {
            address: cn(r),
            storageKeys: (e || []).map((t, n) => (Wc(t) !== 32 && bh.throwArgumentError("invalid access list storageKey", `accessList[${r}:${n}]`, t), t.toLowerCase()))
        }
    }

    function kp(r) {
        if (Array.isArray(r)) return r.map((t, n) => Array.isArray(t) ? (t.length > 2 && bh.throwArgumentError("access list expected to be [ address, storageKeys[] ]", `value[${n}]`, t), Na(t[0], t[1])) : Na(t.address, t.storageKeys));
        const e = Object.keys(r).map(t => {
            const n = r[t].reduce((i, s) => (i[s] = !0, i), {});
            return Na(t, Object.keys(n).sort())
        });
        return e.sort((t, n) => t.address.localeCompare(n.address)), e
    }(function(r) {
        r[r.legacy = 0] = "legacy", r[r.eip2930 = 1] = "eip2930", r[r.eip1559 = 2] = "eip1559"
    })(Ah || (Ah = {}));
    const Sp = "contracts/5.7.0";
    var Jn = function(r, e, t, n) {
        return new(t || (t = Promise))(function(i, s) {
            function o(h) {
                try {
                    l(n.next(h))
                } catch (c) {
                    s(c)
                }
            }

            function u(h) {
                try {
                    l(n.throw(h))
                } catch (c) {
                    s(c)
                }
            }

            function l(h) {
                var c;
                h.done ? i(h.value) : (c = h.value, c instanceof t ? c : new t(function(y) {
                    y(c)
                })).then(o, u)
            }
            l((n = n.apply(r, e || [])).next())
        })
    };
    const St = new X(Sp);

    function no(r, e) {
        return Jn(this, void 0, void 0, function*() {
            const t = yield e;
            typeof t != "string" && St.throwArgumentError("invalid address or ENS name", "name", t);
            try {
                return cn(t)
            } catch {}
            r || St.throwError("a provider or signer is needed to resolve ENS names", X.errors.UNSUPPORTED_OPERATION, {
                operation: "resolveName"
            });
            const n = yield r.resolveName(t);
            return n == null && St.throwArgumentError("resolver or addr is not configured for ENS name", "name", t), n
        })
    }

    function io(r, e, t) {
        return Jn(this, void 0, void 0, function*() {
            return Array.isArray(t) ? yield Promise.all(t.map((n, i) => io(r, Array.isArray(e) ? e[i] : e[n.name], n))): t.type === "address" ? yield no(r, e): t.type === "tuple" ? yield io(r, e, t.components): t.baseType === "array" ? Array.isArray(e) ? yield Promise.all(e.map(n => io(r, n, t.arrayChildren))): Promise.reject(St.makeError("invalid value for array", X.errors.INVALID_ARGUMENT, {
                argument: "value",
                value: e
            })): e
        })
    }

    function so(r, e, t) {
        return Jn(this, void 0, void 0, function*() {
            let n = {};
            t.length === e.inputs.length + 1 && typeof t[t.length - 1] == "object" && (n = xi(t.pop())), St.checkArgumentCount(t.length, e.inputs.length, "passed to contract"), r.signer ? n.from ? n.from = In({
                override: no(r.signer, n.from),
                signer: r.signer.getAddress()
            }).then(h => Jn(this, void 0, void 0, function*() {
                return cn(h.signer) !== h.override && St.throwError("Contract with a Signer cannot override from", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "overrides.from"
                }), h.override
            })) : n.from = r.signer.getAddress() : n.from && (n.from = no(r.provider, n.from));
            const i = yield In({
                args: io(r.signer || r.provider, t, e.inputs),
                address: r.resolvedAddress,
                overrides: In(n) || {}
            }), s = r.interface.encodeFunctionData(e, i.args), o = {
                data: s,
                to: i.address
            }, u = i.overrides;
            if (u.nonce != null && (o.nonce = Y.from(u.nonce).toNumber()), u.gasLimit != null && (o.gasLimit = Y.from(u.gasLimit)), u.gasPrice != null && (o.gasPrice = Y.from(u.gasPrice)), u.maxFeePerGas != null && (o.maxFeePerGas = Y.from(u.maxFeePerGas)), u.maxPriorityFeePerGas != null && (o.maxPriorityFeePerGas = Y.from(u.maxPriorityFeePerGas)), u.from != null && (o.from = u.from), u.type != null && (o.type = u.type), u.accessList != null && (o.accessList = kp(u.accessList)), o.gasLimit == null && e.gas != null) {
                let h = 21e3;
                const c = Ct(s);
                for (let y = 0; y < c.length; y++) h += 4, c[y] && (h += 64);
                o.gasLimit = Y.from(e.gas).add(h)
            }
            if (u.value) {
                const h = Y.from(u.value);
                h.isZero() || e.payable || St.throwError("non-payable method cannot override value", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "overrides.value",
                    value: n.value
                }), o.value = h
            }
            u.customData && (o.customData = xi(u.customData)), u.ccipReadEnabled && (o.ccipReadEnabled = !!u.ccipReadEnabled), delete n.nonce, delete n.gasLimit, delete n.gasPrice, delete n.from, delete n.value, delete n.type, delete n.accessList, delete n.maxFeePerGas, delete n.maxPriorityFeePerGas, delete n.customData, delete n.ccipReadEnabled;
            const l = Object.keys(n).filter(h => n[h] != null);
            return l.length && St.throwError(`cannot override ${l.map(h=>JSON.stringify(h)).join(",")}`, X.errors.UNSUPPORTED_OPERATION, {
                operation: "overrides",
                overrides: l
            }), o
        })
    }

    function Eh(r, e, t) {
        const n = r.signer || r.provider;
        return function(...i) {
            return Jn(this, void 0, void 0, function*() {
                let s;
                if (i.length === e.inputs.length + 1 && typeof i[i.length - 1] == "object") {
                    const l = xi(i.pop());
                    l.blockTag != null && (s = yield l.blockTag), delete l.blockTag, i.push(l)
                }
                r.deployTransaction != null && (yield r._deployed(s));
                const o = yield so(r, e, i), u = yield n.call(o, s);
                try {
                    let l = r.interface.decodeFunctionResult(e, u);
                    return t && e.outputs.length === 1 && (l = l[0]), l
                } catch (l) {
                    throw l.code === X.errors.CALL_EXCEPTION && (l.address = r.address, l.args = i, l.transaction = o), l
                }
            })
        }
    }

    function Rp(r, e) {
        return function(...t) {
            return Jn(this, void 0, void 0, function*() {
                r.signer || St.throwError("sending a transaction requires a signer", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "sendTransaction"
                }), r.deployTransaction != null && (yield r._deployed());
                const n = yield so(r, e, t), i = yield r.signer.sendTransaction(n);
                return function(s, o) {
                    const u = o.wait.bind(o);
                    o.wait = l => u(l).then(h => (h.events = h.logs.map(c => {
                        let y = ns(c),
                            v = null;
                        try {
                            v = s.interface.parseLog(c)
                        } catch {}
                        return v && (y.args = v.args, y.decode = (N, P) => s.interface.decodeEventLog(v.eventFragment, N, P), y.event = v.name, y.eventSignature = v.signature), y.removeListener = () => s.provider, y.getBlock = () => s.provider.getBlock(h.blockHash), y.getTransaction = () => s.provider.getTransaction(h.transactionHash), y.getTransactionReceipt = () => Promise.resolve(h), y
                    }), h))
                }(r, i), i
            })
        }
    }

    function xh(r, e, t) {
        return e.constant ? Eh(r, e, t) : Rp(r, e)
    }

    function _h(r) {
        return !r.address || r.topics != null && r.topics.length !== 0 ? (r.address || "*") + "@" + (r.topics ? r.topics.map(e => Array.isArray(e) ? e.join("|") : e).join(":") : "") : "*"
    }
    let us = class {
        constructor(e, t) {
            te(this, "tag", e), te(this, "filter", t), this._listeners = []
        }
        addListener(e, t) {
            this._listeners.push({
                listener: e,
                once: t
            })
        }
        removeListener(e) {
            let t = !1;
            this._listeners = this._listeners.filter(n => !(!t && n.listener === e) || (t = !0, !1))
        }
        removeAllListeners() {
            this._listeners = []
        }
        listeners() {
            return this._listeners.map(e => e.listener)
        }
        listenerCount() {
            return this._listeners.length
        }
        run(e) {
            const t = this.listenerCount();
            return this._listeners = this._listeners.filter(n => {
                const i = e.slice();
                return setTimeout(() => {
                    n.listener.apply(this, i)
                }, 0), !n.once
            }), t
        }
        prepareEvent(e) {}
        getEmit(e) {
            return [e]
        }
    };
    class Ip extends us {
        constructor() {
            super("error", null)
        }
    }
    class Mh extends us {
        constructor(e, t, n, i) {
            const s = {
                address: e
            };
            let o = t.getEventTopic(n);
            i ? (o !== i[0] && St.throwArgumentError("topic mismatch", "topics", i), s.topics = i.slice()) : s.topics = [o], super(_h(s), s), te(this, "address", e), te(this, "interface", t), te(this, "fragment", n)
        }
        prepareEvent(e) {
            super.prepareEvent(e), e.event = this.fragment.name, e.eventSignature = this.fragment.format(), e.decode = (t, n) => this.interface.decodeEventLog(this.fragment, t, n);
            try {
                e.args = this.interface.decodeEventLog(this.fragment, e.data, e.topics)
            } catch (t) {
                e.args = null, e.decodeError = t
            }
        }
        getEmit(e) {
            const t = Zd(e.args);
            if (t.length) throw t[0].error;
            const n = (e.args || []).slice();
            return n.push(e), n
        }
    }
    class Nh extends us {
        constructor(e, t) {
            super("*", {
                address: e
            }), te(this, "address", e), te(this, "interface", t)
        }
        prepareEvent(e) {
            super.prepareEvent(e);
            try {
                const t = this.interface.parseLog(e);
                e.event = t.name, e.eventSignature = t.signature, e.decode = (n, i) => this.interface.decodeEventLog(t.eventFragment, n, i), e.args = t.args
            } catch {}
        }
    }
    class Cp {
        constructor(e, t, n) {
            te(this, "interface", rs(new.target, "getInterface")(t)), n == null ? (te(this, "provider", null), te(this, "signer", null)) : ro.isSigner(n) ? (te(this, "provider", n.provider || null), te(this, "signer", n)) : _p.isProvider(n) ? (te(this, "provider", n), te(this, "signer", null)) : St.throwArgumentError("invalid signer or provider", "signerOrProvider", n), te(this, "callStatic", {}), te(this, "estimateGas", {}), te(this, "functions", {}), te(this, "populateTransaction", {}), te(this, "filters", {}); {
                const o = {};
                Object.keys(this.interface.events).forEach(u => {
                    const l = this.interface.events[u];
                    te(this.filters, u, (...h) => ({
                        address: this.address,
                        topics: this.interface.encodeFilterTopics(l, h)
                    })), o[l.name] || (o[l.name] = []), o[l.name].push(u)
                }), Object.keys(o).forEach(u => {
                    const l = o[u];
                    l.length === 1 ? te(this.filters, u, this.filters[l[0]]) : St.warn(`Duplicate definition of ${u} (${l.join(", ")})`)
                })
            }
            if (te(this, "_runningEvents", {}), te(this, "_wrappedEmits", {}), e == null && St.throwArgumentError("invalid contract address or ENS name", "addressOrName", e), te(this, "address", e), this.provider) te(this, "resolvedAddress", no(this.provider, e));
            else try {
                te(this, "resolvedAddress", Promise.resolve(cn(e)))
            } catch {
                St.throwError("provider is required to use ENS name as contract address", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "new Contract"
                })
            }
            this.resolvedAddress.catch(o => {});
            const i = {},
                s = {};
            Object.keys(this.interface.functions).forEach(o => {
                const u = this.interface.functions[o];
                if (s[o]) St.warn(`Duplicate ABI entry for ${JSON.stringify(o)}`);
                else {
                    s[o] = !0; {
                        const l = u.name;
                        i[`%${l}`] || (i[`%${l}`] = []), i[`%${l}`].push(o)
                    }
                    this[o] == null && te(this, o, xh(this, u, !0)), this.functions[o] == null && te(this.functions, o, xh(this, u, !1)), this.callStatic[o] == null && te(this.callStatic, o, Eh(this, u, !0)), this.populateTransaction[o] == null && te(this.populateTransaction, o, function(l, h) {
                        return function(...c) {
                            return so(l, h, c)
                        }
                    }(this, u)), this.estimateGas[o] == null && te(this.estimateGas, o, function(l, h) {
                        const c = l.signer || l.provider;
                        return function(...y) {
                            return Jn(this, void 0, void 0, function*() {
                                c || St.throwError("estimate require a provider or signer", X.errors.UNSUPPORTED_OPERATION, {
                                    operation: "estimateGas"
                                });
                                const v = yield so(l, h, y);
                                return yield c.estimateGas(v)
                            })
                        }
                    }(this, u))
                }
            }), Object.keys(i).forEach(o => {
                const u = i[o];
                if (u.length > 1) return;
                o = o.substring(1);
                const l = u[0];
                try {
                    this[o] == null && te(this, o, this[l])
                } catch {}
                this.functions[o] == null && te(this.functions, o, this.functions[l]), this.callStatic[o] == null && te(this.callStatic, o, this.callStatic[l]), this.populateTransaction[o] == null && te(this.populateTransaction, o, this.populateTransaction[l]), this.estimateGas[o] == null && te(this.estimateGas, o, this.estimateGas[l])
            })
        }
        static getContractAddress(e) {
            return $d(e)
        }
        static getInterface(e) {
            return Ni.isInterface(e) ? e : new Ni(e)
        }
        deployed() {
            return this._deployed()
        }
        _deployed(e) {
            return this._deployedPromise || (this.deployTransaction ? this._deployedPromise = this.deployTransaction.wait().then(() => this) : this._deployedPromise = this.provider.getCode(this.address, e).then(t => (t === "0x" && St.throwError("contract not deployed", X.errors.UNSUPPORTED_OPERATION, {
                contractAddress: this.address,
                operation: "getDeployed"
            }), this))), this._deployedPromise
        }
        fallback(e) {
            this.signer || St.throwError("sending a transactions require a signer", X.errors.UNSUPPORTED_OPERATION, {
                operation: "sendTransaction(fallback)"
            });
            const t = xi(e || {});
            return ["from", "to"].forEach(function(n) {
                t[n] != null && St.throwError("cannot override " + n, X.errors.UNSUPPORTED_OPERATION, {
                    operation: n
                })
            }), t.to = this.resolvedAddress, this.deployed().then(() => this.signer.sendTransaction(t))
        }
        connect(e) {
            typeof e == "string" && (e = new Ma(e, this.provider));
            const t = new this.constructor(this.address, this.interface, e);
            return this.deployTransaction && te(t, "deployTransaction", this.deployTransaction), t
        }
        attach(e) {
            return new this.constructor(e, this.interface, this.signer || this.provider)
        }
        static isIndexed(e) {
            return _a.isIndexed(e)
        }
        _normalizeRunningEvent(e) {
            return this._runningEvents[e.tag] ? this._runningEvents[e.tag] : e
        }
        _getRunningEvent(e) {
            if (typeof e == "string") {
                if (e === "error") return this._normalizeRunningEvent(new Ip);
                if (e === "event") return this._normalizeRunningEvent(new us("event", null));
                if (e === "*") return this._normalizeRunningEvent(new Nh(this.address, this.interface));
                const t = this.interface.getEvent(e);
                return this._normalizeRunningEvent(new Mh(this.address, this.interface, t))
            }
            if (e.topics && e.topics.length > 0) {
                try {
                    const n = e.topics[0];
                    if (typeof n != "string") throw new Error("invalid topic");
                    const i = this.interface.getEvent(n);
                    return this._normalizeRunningEvent(new Mh(this.address, this.interface, i, e.topics))
                } catch {}
                const t = {
                    address: this.address,
                    topics: e.topics
                };
                return this._normalizeRunningEvent(new us(_h(t), t))
            }
            return this._normalizeRunningEvent(new Nh(this.address, this.interface))
        }
        _checkRunningEvents(e) {
            if (e.listenerCount() === 0) {
                delete this._runningEvents[e.tag];
                const t = this._wrappedEmits[e.tag];
                t && e.filter && (this.provider.off(e.filter, t), delete this._wrappedEmits[e.tag])
            }
        }
        _wrapEvent(e, t, n) {
            const i = ns(t);
            return i.removeListener = () => {
                n && (e.removeListener(n), this._checkRunningEvents(e))
            }, i.getBlock = () => this.provider.getBlock(t.blockHash), i.getTransaction = () => this.provider.getTransaction(t.transactionHash), i.getTransactionReceipt = () => this.provider.getTransactionReceipt(t.transactionHash), e.prepareEvent(i), i
        }
        _addEventListener(e, t, n) {
            if (this.provider || St.throwError("events require a provider or a signer with a provider", X.errors.UNSUPPORTED_OPERATION, {
                    operation: "once"
                }), e.addListener(t, n), this._runningEvents[e.tag] = e, !this._wrappedEmits[e.tag]) {
                const i = s => {
                    let o = this._wrapEvent(e, s, t);
                    if (o.decodeError == null) try {
                        const u = e.getEmit(o);
                        this.emit(e.filter, ...u)
                    } catch (u) {
                        o.decodeError = u.error
                    }
                    e.filter != null && this.emit("event", o), o.decodeError != null && this.emit("error", o.decodeError, o)
                };
                this._wrappedEmits[e.tag] = i, e.filter != null && this.provider.on(e.filter, i)
            }
        }
        queryFilter(e, t, n) {
            const i = this._getRunningEvent(e),
                s = xi(i.filter);
            return typeof t == "string" && Vt(t, 32) ? (n != null && St.throwArgumentError("cannot specify toBlock with blockhash", "toBlock", n), s.blockHash = t) : (s.fromBlock = t ? ? 0, s.toBlock = n ? ? "latest"), this.provider.getLogs(s).then(o => o.map(u => this._wrapEvent(i, u, null)))
        }
        on(e, t) {
            return this._addEventListener(this._getRunningEvent(e), t, !1), this
        }
        once(e, t) {
            return this._addEventListener(this._getRunningEvent(e), t, !0), this
        }
        emit(e, ...t) {
            if (!this.provider) return !1;
            const n = this._getRunningEvent(e),
                i = n.run(t) > 0;
            return this._checkRunningEvents(n), i
        }
        listenerCount(e) {
            return this.provider ? e == null ? Object.keys(this._runningEvents).reduce((t, n) => t + this._runningEvents[n].listenerCount(), 0) : this._getRunningEvent(e).listenerCount() : 0
        }
        listeners(e) {
            if (!this.provider) return [];
            if (e == null) {
                const t = [];
                for (let n in this._runningEvents) this._runningEvents[n].listeners().forEach(i => {
                    t.push(i)
                });
                return t
            }
            return this._getRunningEvent(e).listeners()
        }
        removeAllListeners(e) {
            if (!this.provider) return this;
            if (e == null) {
                for (const n in this._runningEvents) {
                    const i = this._runningEvents[n];
                    i.removeAllListeners(), this._checkRunningEvents(i)
                }
                return this
            }
            const t = this._getRunningEvent(e);
            return t.removeAllListeners(), this._checkRunningEvents(t), this
        }
        off(e, t) {
            if (!this.provider) return this;
            const n = this._getRunningEvent(e);
            return n.removeListener(t), this._checkRunningEvents(n), this
        }
        removeListener(e, t) {
            return this.off(e, t)
        }
    }
    class oo extends Cp {}
    const Ta = [{
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "address",
            name: "previousAdmin",
            type: "address"
        }, {
            indexed: !1,
            internalType: "address",
            name: "newAdmin",
            type: "address"
        }],
        name: "AdminChanged",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "beacon",
            type: "address"
        }],
        name: "BeaconUpgraded",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "implementation",
            type: "address"
        }],
        name: "Upgraded",
        type: "event"
    }, {
        stateMutability: "payable",
        type: "fallback"
    }, {
        inputs: [],
        name: "admin",
        outputs: [{
            internalType: "address",
            name: "admin_",
            type: "address"
        }],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "implementation",
        outputs: [{
            internalType: "address",
            name: "implementation_",
            type: "address"
        }],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newImplementation",
            type: "address"
        }],
        name: "upgradeTo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newImplementation",
            type: "address"
        }, {
            internalType: "bytes",
            name: "data",
            type: "bytes"
        }],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }, {
        stateMutability: "payable",
        type: "receive"
    }, {
        inputs: [],
        name: "AccessDenied",
        type: "error"
    }, {
        inputs: [],
        name: "AlreadyInitialized",
        type: "error"
    }, {
        inputs: [],
        name: "BalanceMismatch",
        type: "error"
    }, {
        inputs: [],
        name: "DeadlineExpired",
        type: "error"
    }, {
        inputs: [],
        name: "GreaterThanMaxInput",
        type: "error"
    }, {
        inputs: [],
        name: "IdenticalAddresses",
        type: "error"
    }, {
        inputs: [],
        name: "InsufficientCapacity",
        type: "error"
    }, {
        inputs: [],
        name: "InsufficientLiquidity",
        type: "error"
    }, {
        inputs: [],
        name: "InsufficientNativeTokenReceived",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidAddress",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidFee",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidIndices",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidRate",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidTradeActionAmount",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidTradeActionStrategyId",
        type: "error"
    }, {
        inputs: [],
        name: "LowerThanMinReturn",
        type: "error"
    }, {
        inputs: [],
        name: "NativeAmountMismatch",
        type: "error"
    }, {
        inputs: [],
        name: "OrderDisabled",
        type: "error"
    }, {
        inputs: [],
        name: "OutDated",
        type: "error"
    }, {
        inputs: [],
        name: "Overflow",
        type: "error"
    }, {
        inputs: [],
        name: "PairAlreadyExists",
        type: "error"
    }, {
        inputs: [],
        name: "PairDoesNotExist",
        type: "error"
    }, {
        inputs: [],
        name: "UnknownDelegator",
        type: "error"
    }, {
        inputs: [],
        name: "UnnecessaryNativeTokenReceived",
        type: "error"
    }, {
        inputs: [],
        name: "ZeroValue",
        type: "error"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "Token",
            name: "token",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "recipient",
            type: "address"
        }, {
            indexed: !0,
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }, {
            indexed: !1,
            internalType: "address",
            name: "sender",
            type: "address"
        }],
        name: "FeesWithdrawn",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "uint8",
            name: "version",
            type: "uint8"
        }],
        name: "Initialized",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "uint128",
            name: "pairId",
            type: "uint128"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token1",
            type: "address"
        }],
        name: "PairCreated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            indexed: !1,
            internalType: "uint32",
            name: "prevFeePPM",
            type: "uint32"
        }, {
            indexed: !1,
            internalType: "uint32",
            name: "newFeePPM",
            type: "uint32"
        }],
        name: "PairTradingFeePPMUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "Paused",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "bytes32",
            name: "previousAdminRole",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "bytes32",
            name: "newAdminRole",
            type: "bytes32"
        }],
        name: "RoleAdminChanged",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "address",
            name: "account",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "sender",
            type: "address"
        }],
        name: "RoleGranted",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "address",
            name: "account",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "sender",
            type: "address"
        }],
        name: "RoleRevoked",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "uint256",
            name: "id",
            type: "uint256"
        }, {
            indexed: !0,
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            indexed: !1,
            internalType: "struct Order",
            name: "order0",
            type: "tuple"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            indexed: !1,
            internalType: "struct Order",
            name: "order1",
            type: "tuple"
        }],
        name: "StrategyCreated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "uint256",
            name: "id",
            type: "uint256"
        }, {
            indexed: !0,
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            indexed: !1,
            internalType: "struct Order",
            name: "order0",
            type: "tuple"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            indexed: !1,
            internalType: "struct Order",
            name: "order1",
            type: "tuple"
        }],
        name: "StrategyDeleted",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "uint256",
            name: "id",
            type: "uint256"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            indexed: !1,
            internalType: "struct Order",
            name: "order0",
            type: "tuple"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            indexed: !1,
            internalType: "struct Order",
            name: "order1",
            type: "tuple"
        }, {
            indexed: !1,
            internalType: "uint8",
            name: "reason",
            type: "uint8"
        }],
        name: "StrategyUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "trader",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "sourceToken",
            type: "address"
        }, {
            indexed: !0,
            internalType: "Token",
            name: "targetToken",
            type: "address"
        }, {
            indexed: !1,
            internalType: "uint256",
            name: "sourceAmount",
            type: "uint256"
        }, {
            indexed: !1,
            internalType: "uint256",
            name: "targetAmount",
            type: "uint256"
        }, {
            indexed: !1,
            internalType: "uint128",
            name: "tradingFeeAmount",
            type: "uint128"
        }, {
            indexed: !1,
            internalType: "bool",
            name: "byTargetAmount",
            type: "bool"
        }],
        name: "TokensTraded",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "uint32",
            name: "prevFeePPM",
            type: "uint32"
        }, {
            indexed: !1,
            internalType: "uint32",
            name: "newFeePPM",
            type: "uint32"
        }],
        name: "TradingFeePPMUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "Unpaused",
        type: "event"
    }, {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token",
            type: "address"
        }],
        name: "accumulatedFees",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "sourceToken",
            type: "address"
        }, {
            internalType: "Token",
            name: "targetToken",
            type: "address"
        }, {
            components: [{
                internalType: "uint256",
                name: "strategyId",
                type: "uint256"
            }, {
                internalType: "uint128",
                name: "amount",
                type: "uint128"
            }],
            internalType: "struct TradeAction[]",
            name: "tradeActions",
            type: "tuple[]"
        }],
        name: "calculateTradeSourceAmount",
        outputs: [{
            internalType: "uint128",
            name: "",
            type: "uint128"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "sourceToken",
            type: "address"
        }, {
            internalType: "Token",
            name: "targetToken",
            type: "address"
        }, {
            components: [{
                internalType: "uint256",
                name: "strategyId",
                type: "uint256"
            }, {
                internalType: "uint128",
                name: "amount",
                type: "uint128"
            }],
            internalType: "struct TradeAction[]",
            name: "tradeActions",
            type: "tuple[]"
        }],
        name: "calculateTradeTargetAmount",
        outputs: [{
            internalType: "uint128",
            name: "",
            type: "uint128"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "controllerType",
        outputs: [{
            internalType: "uint16",
            name: "",
            type: "uint16"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }],
        name: "createPair",
        outputs: [{
            components: [{
                internalType: "uint128",
                name: "id",
                type: "uint128"
            }, {
                internalType: "Token[2]",
                name: "tokens",
                type: "address[2]"
            }],
            internalType: "struct Pair",
            name: "",
            type: "tuple"
        }],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            internalType: "struct Order[2]",
            name: "orders",
            type: "tuple[2]"
        }],
        name: "createStrategy",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "payable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "strategyId",
            type: "uint256"
        }],
        name: "deleteStrategy",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }],
        name: "getRoleAdmin",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "uint256",
            name: "index",
            type: "uint256"
        }],
        name: "getRoleMember",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }],
        name: "getRoleMemberCount",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "hasRole",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }],
        name: "pair",
        outputs: [{
            components: [{
                internalType: "uint128",
                name: "id",
                type: "uint128"
            }, {
                internalType: "Token[2]",
                name: "tokens",
                type: "address[2]"
            }],
            internalType: "struct Pair",
            name: "",
            type: "tuple"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }],
        name: "pairTradingFeePPM",
        outputs: [{
            internalType: "uint32",
            name: "",
            type: "uint32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "pairs",
        outputs: [{
            internalType: "Token[2][]",
            name: "",
            type: "address[2][]"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "paused",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes",
            name: "data",
            type: "bytes"
        }],
        name: "postUpgrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "roleAdmin",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [],
        name: "roleEmergencyStopper",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [],
        name: "roleFeesManager",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            internalType: "uint32",
            name: "newPairTradingFeePPM",
            type: "uint32"
        }],
        name: "setPairTradingFeePPM",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint32",
            name: "newTradingFeePPM",
            type: "uint32"
        }],
        name: "setTradingFeePPM",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }, {
            internalType: "uint256",
            name: "startIndex",
            type: "uint256"
        }, {
            internalType: "uint256",
            name: "endIndex",
            type: "uint256"
        }],
        name: "strategiesByPair",
        outputs: [{
            components: [{
                internalType: "uint256",
                name: "id",
                type: "uint256"
            }, {
                internalType: "address",
                name: "owner",
                type: "address"
            }, {
                internalType: "Token[2]",
                name: "tokens",
                type: "address[2]"
            }, {
                components: [{
                    internalType: "uint128",
                    name: "y",
                    type: "uint128"
                }, {
                    internalType: "uint128",
                    name: "z",
                    type: "uint128"
                }, {
                    internalType: "uint64",
                    name: "A",
                    type: "uint64"
                }, {
                    internalType: "uint64",
                    name: "B",
                    type: "uint64"
                }],
                internalType: "struct Order[2]",
                name: "orders",
                type: "tuple[2]"
            }],
            internalType: "struct Strategy[]",
            name: "",
            type: "tuple[]"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token0",
            type: "address"
        }, {
            internalType: "Token",
            name: "token1",
            type: "address"
        }],
        name: "strategiesByPairCount",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "id",
            type: "uint256"
        }],
        name: "strategy",
        outputs: [{
            components: [{
                internalType: "uint256",
                name: "id",
                type: "uint256"
            }, {
                internalType: "address",
                name: "owner",
                type: "address"
            }, {
                internalType: "Token[2]",
                name: "tokens",
                type: "address[2]"
            }, {
                components: [{
                    internalType: "uint128",
                    name: "y",
                    type: "uint128"
                }, {
                    internalType: "uint128",
                    name: "z",
                    type: "uint128"
                }, {
                    internalType: "uint64",
                    name: "A",
                    type: "uint64"
                }, {
                    internalType: "uint64",
                    name: "B",
                    type: "uint64"
                }],
                internalType: "struct Order[2]",
                name: "orders",
                type: "tuple[2]"
            }],
            internalType: "struct Strategy",
            name: "",
            type: "tuple"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4"
        }],
        name: "supportsInterface",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "sourceToken",
            type: "address"
        }, {
            internalType: "Token",
            name: "targetToken",
            type: "address"
        }, {
            components: [{
                internalType: "uint256",
                name: "strategyId",
                type: "uint256"
            }, {
                internalType: "uint128",
                name: "amount",
                type: "uint128"
            }],
            internalType: "struct TradeAction[]",
            name: "tradeActions",
            type: "tuple[]"
        }, {
            internalType: "uint256",
            name: "deadline",
            type: "uint256"
        }, {
            internalType: "uint128",
            name: "minReturn",
            type: "uint128"
        }],
        name: "tradeBySourceAmount",
        outputs: [{
            internalType: "uint128",
            name: "",
            type: "uint128"
        }],
        stateMutability: "payable",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "sourceToken",
            type: "address"
        }, {
            internalType: "Token",
            name: "targetToken",
            type: "address"
        }, {
            components: [{
                internalType: "uint256",
                name: "strategyId",
                type: "uint256"
            }, {
                internalType: "uint128",
                name: "amount",
                type: "uint128"
            }],
            internalType: "struct TradeAction[]",
            name: "tradeActions",
            type: "tuple[]"
        }, {
            internalType: "uint256",
            name: "deadline",
            type: "uint256"
        }, {
            internalType: "uint128",
            name: "maxInput",
            type: "uint128"
        }],
        name: "tradeByTargetAmount",
        outputs: [{
            internalType: "uint128",
            name: "",
            type: "uint128"
        }],
        stateMutability: "payable",
        type: "function"
    }, {
        inputs: [],
        name: "tradingFeePPM",
        outputs: [{
            internalType: "uint32",
            name: "",
            type: "uint32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "strategyId",
            type: "uint256"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            internalType: "struct Order[2]",
            name: "currentOrders",
            type: "tuple[2]"
        }, {
            components: [{
                internalType: "uint128",
                name: "y",
                type: "uint128"
            }, {
                internalType: "uint128",
                name: "z",
                type: "uint128"
            }, {
                internalType: "uint64",
                name: "A",
                type: "uint64"
            }, {
                internalType: "uint64",
                name: "B",
                type: "uint64"
            }],
            internalType: "struct Order[2]",
            name: "newOrders",
            type: "tuple[2]"
        }],
        name: "updateStrategy",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }, {
        inputs: [],
        name: "version",
        outputs: [{
            internalType: "uint16",
            name: "",
            type: "uint16"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [{
            internalType: "Token",
            name: "token",
            type: "address"
        }, {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }, {
            internalType: "address",
            name: "recipient",
            type: "address"
        }],
        name: "withdrawFees",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "_logic",
            type: "address"
        }, {
            internalType: "address",
            name: "admin_",
            type: "address"
        }, {
            internalType: "bytes",
            name: "_data",
            type: "bytes"
        }],
        stateMutability: "payable",
        type: "constructor"
    }];
    let Bp = (xu = class {
        static createInterface() {
            return new Ni(Ta)
        }
        static connect(e, t) {
            return new oo(e, Ta, t)
        }
    }, Re(xu, "abi", Ta), xu);
    const Pa = [{
        inputs: [{
            components: [{
                internalType: "address",
                name: "target",
                type: "address"
            }, {
                internalType: "bytes",
                name: "callData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Call[]",
            name: "calls",
            type: "tuple[]"
        }],
        name: "aggregate",
        outputs: [{
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
        }, {
            internalType: "bytes[]",
            name: "returnData",
            type: "bytes[]"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            components: [{
                internalType: "address",
                name: "target",
                type: "address"
            }, {
                internalType: "bytes",
                name: "callData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Call[]",
            name: "calls",
            type: "tuple[]"
        }],
        name: "blockAndAggregate",
        outputs: [{
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
        }, {
            internalType: "bytes32",
            name: "blockHash",
            type: "bytes32"
        }, {
            components: [{
                internalType: "bool",
                name: "success",
                type: "bool"
            }, {
                internalType: "bytes",
                name: "returnData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Result[]",
            name: "returnData",
            type: "tuple[]"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
        }],
        name: "getBlockHash",
        outputs: [{
            internalType: "bytes32",
            name: "blockHash",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "getBlockNumber",
        outputs: [{
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "getCurrentBlockCoinbase",
        outputs: [{
            internalType: "address",
            name: "coinbase",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "getCurrentBlockDifficulty",
        outputs: [{
            internalType: "uint256",
            name: "difficulty",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "getCurrentBlockGasLimit",
        outputs: [{
            internalType: "uint256",
            name: "gaslimit",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "getCurrentBlockTimestamp",
        outputs: [{
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "addr",
            type: "address"
        }],
        name: "getEthBalance",
        outputs: [{
            internalType: "uint256",
            name: "balance",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "getLastBlockHash",
        outputs: [{
            internalType: "bytes32",
            name: "blockHash",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bool",
            name: "requireSuccess",
            type: "bool"
        }, {
            components: [{
                internalType: "address",
                name: "target",
                type: "address"
            }, {
                internalType: "bytes",
                name: "callData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Call[]",
            name: "calls",
            type: "tuple[]"
        }],
        name: "tryAggregate",
        outputs: [{
            components: [{
                internalType: "bool",
                name: "success",
                type: "bool"
            }, {
                internalType: "bytes",
                name: "returnData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Result[]",
            name: "returnData",
            type: "tuple[]"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bool",
            name: "requireSuccess",
            type: "bool"
        }, {
            components: [{
                internalType: "address",
                name: "target",
                type: "address"
            }, {
                internalType: "bytes",
                name: "callData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Call[]",
            name: "calls",
            type: "tuple[]"
        }],
        name: "tryBlockAndAggregate",
        outputs: [{
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
        }, {
            internalType: "bytes32",
            name: "blockHash",
            type: "bytes32"
        }, {
            components: [{
                internalType: "bool",
                name: "success",
                type: "bool"
            }, {
                internalType: "bytes",
                name: "returnData",
                type: "bytes"
            }],
            internalType: "struct Multicall2.Result[]",
            name: "returnData",
            type: "tuple[]"
        }],
        stateMutability: "view",
        type: "function"
    }];
    let Op = (_u = class {
        static createInterface() {
            return new Ni(Pa)
        }
        static connect(e, t) {
            return new oo(e, Pa, t)
        }
    }, Re(_u, "abi", Pa), _u);
    const ka = [{
        constant: !0,
        inputs: [],
        name: "name",
        outputs: [{
            name: "",
            type: "string"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_spender",
            type: "address"
        }, {
            name: "_value",
            type: "uint256"
        }],
        name: "approve",
        outputs: [{
            name: "success",
            type: "bool"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_disable",
            type: "bool"
        }],
        name: "disableTransfers",
        outputs: [],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "totalSupply",
        outputs: [{
            name: "",
            type: "uint256"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_from",
            type: "address"
        }, {
            name: "_to",
            type: "address"
        }, {
            name: "_value",
            type: "uint256"
        }],
        name: "transferFrom",
        outputs: [{
            name: "success",
            type: "bool"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "decimals",
        outputs: [{
            name: "",
            type: "uint8"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "version",
        outputs: [{
            name: "",
            type: "string"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "standard",
        outputs: [{
            name: "",
            type: "string"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_token",
            type: "address"
        }, {
            name: "_to",
            type: "address"
        }, {
            name: "_amount",
            type: "uint256"
        }],
        name: "withdrawTokens",
        outputs: [],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [{
            name: "",
            type: "address"
        }],
        name: "balanceOf",
        outputs: [{
            name: "",
            type: "uint256"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_to",
            type: "address"
        }, {
            name: "_amount",
            type: "uint256"
        }],
        name: "issue",
        outputs: [],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "owner",
        outputs: [{
            name: "",
            type: "address"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "symbol",
        outputs: [{
            name: "",
            type: "string"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_from",
            type: "address"
        }, {
            name: "_amount",
            type: "uint256"
        }],
        name: "destroy",
        outputs: [],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_to",
            type: "address"
        }, {
            name: "_value",
            type: "uint256"
        }],
        name: "transfer",
        outputs: [{
            name: "success",
            type: "bool"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "transfersEnabled",
        outputs: [{
            name: "",
            type: "bool"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [],
        name: "newOwner",
        outputs: [{
            name: "",
            type: "address"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !0,
        inputs: [{
            name: "",
            type: "address"
        }, {
            name: "",
            type: "address"
        }],
        name: "allowance",
        outputs: [{
            name: "",
            type: "uint256"
        }],
        payable: !1,
        type: "function"
    }, {
        constant: !1,
        inputs: [{
            name: "_newOwner",
            type: "address"
        }],
        name: "transferOwnership",
        outputs: [],
        payable: !1,
        type: "function"
    }, {
        inputs: [{
            name: "_name",
            type: "string"
        }, {
            name: "_symbol",
            type: "string"
        }, {
            name: "_decimals",
            type: "uint8"
        }],
        payable: !1,
        type: "constructor"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            name: "_token",
            type: "address"
        }],
        name: "NewSmartToken",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            name: "_amount",
            type: "uint256"
        }],
        name: "Issuance",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            name: "_amount",
            type: "uint256"
        }],
        name: "Destruction",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            name: "_prevOwner",
            type: "address"
        }, {
            indexed: !1,
            name: "_newOwner",
            type: "address"
        }],
        name: "OwnerUpdate",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            name: "_from",
            type: "address"
        }, {
            indexed: !0,
            name: "_to",
            type: "address"
        }, {
            indexed: !1,
            name: "_value",
            type: "uint256"
        }],
        name: "Transfer",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            name: "_owner",
            type: "address"
        }, {
            indexed: !0,
            name: "_spender",
            type: "address"
        }, {
            indexed: !1,
            name: "_value",
            type: "uint256"
        }],
        name: "Approval",
        type: "event"
    }];
    let Fp = (Mu = class {
        static createInterface() {
            return new Ni(ka)
        }
        static connect(e, t) {
            return new oo(e, ka, t)
        }
    }, Re(Mu, "abi", ka), Mu);
    const Sa = [{
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "address",
            name: "previousAdmin",
            type: "address"
        }, {
            indexed: !1,
            internalType: "address",
            name: "newAdmin",
            type: "address"
        }],
        name: "AdminChanged",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "beacon",
            type: "address"
        }],
        name: "BeaconUpgraded",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "implementation",
            type: "address"
        }],
        name: "Upgraded",
        type: "event"
    }, {
        stateMutability: "payable",
        type: "fallback"
    }, {
        inputs: [],
        name: "admin",
        outputs: [{
            internalType: "address",
            name: "admin_",
            type: "address"
        }],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "implementation",
        outputs: [{
            internalType: "address",
            name: "implementation_",
            type: "address"
        }],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newImplementation",
            type: "address"
        }],
        name: "upgradeTo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newImplementation",
            type: "address"
        }, {
            internalType: "bytes",
            name: "data",
            type: "bytes"
        }],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    }, {
        stateMutability: "payable",
        type: "receive"
    }, {
        inputs: [],
        name: "AccessDenied",
        type: "error"
    }, {
        inputs: [],
        name: "AlreadyInitialized",
        type: "error"
    }, {
        inputs: [],
        name: "BatchNotSupported",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidAddress",
        type: "error"
    }, {
        inputs: [],
        name: "InvalidIndices",
        type: "error"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "approved",
            type: "address"
        }, {
            indexed: !0,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "Approval",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "operator",
            type: "address"
        }, {
            indexed: !1,
            internalType: "bool",
            name: "approved",
            type: "bool"
        }],
        name: "ApprovalForAll",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "string",
            name: "newBaseExtension",
            type: "string"
        }],
        name: "BaseExtensionUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "string",
            name: "newBaseURI",
            type: "string"
        }],
        name: "BaseURIUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "uint8",
            name: "version",
            type: "uint8"
        }],
        name: "Initialized",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "bytes32",
            name: "previousAdminRole",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "bytes32",
            name: "newAdminRole",
            type: "bytes32"
        }],
        name: "RoleAdminChanged",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "address",
            name: "account",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "sender",
            type: "address"
        }],
        name: "RoleGranted",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            indexed: !0,
            internalType: "address",
            name: "account",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "sender",
            type: "address"
        }],
        name: "RoleRevoked",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "from",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "to",
            type: "address"
        }, {
            indexed: !0,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "Transfer",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "bool",
            name: "newUseGlobalURI",
            type: "bool"
        }],
        name: "UseGlobalURIUpdated",
        type: "event"
    }, {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "to",
            type: "address"
        }, {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "owner",
            type: "address"
        }],
        name: "balanceOf",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "getApproved",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }],
        name: "getRoleAdmin",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "uint256",
            name: "index",
            type: "uint256"
        }],
        name: "getRoleMember",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }],
        name: "getRoleMemberCount",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "hasRole",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bool",
            name: "newUseGlobalURI",
            type: "bool"
        }, {
            internalType: "string",
            name: "newBaseURI",
            type: "string"
        }, {
            internalType: "string",
            name: "newBaseExtension",
            type: "string"
        }],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            internalType: "address",
            name: "operator",
            type: "address"
        }],
        name: "isApprovedForAll",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "name",
        outputs: [{
            internalType: "string",
            name: "",
            type: "string"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "ownerOf",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes",
            name: "data",
            type: "bytes"
        }],
        name: "postUpgrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "role",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "account",
            type: "address"
        }],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "roleAdmin",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [],
        name: "roleMinter",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "from",
            type: "address"
        }, {
            internalType: "address",
            name: "to",
            type: "address"
        }, {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "from",
            type: "address"
        }, {
            internalType: "address",
            name: "to",
            type: "address"
        }, {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }, {
            internalType: "bytes",
            name: "data",
            type: "bytes"
        }],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "operator",
            type: "address"
        }, {
            internalType: "bool",
            name: "approved",
            type: "bool"
        }],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "string",
            name: "newBaseExtension",
            type: "string"
        }],
        name: "setBaseExtension",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "string",
            name: "newBaseURI",
            type: "string"
        }],
        name: "setBaseURI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4"
        }],
        name: "supportsInterface",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "symbol",
        outputs: [{
            internalType: "string",
            name: "",
            type: "string"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "tokenURI",
        outputs: [{
            internalType: "string",
            name: "",
            type: "string"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "owner",
            type: "address"
        }, {
            internalType: "uint256",
            name: "startIndex",
            type: "uint256"
        }, {
            internalType: "uint256",
            name: "endIndex",
            type: "uint256"
        }],
        name: "tokensByOwner",
        outputs: [{
            internalType: "uint256[]",
            name: "",
            type: "uint256[]"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "from",
            type: "address"
        }, {
            internalType: "address",
            name: "to",
            type: "address"
        }, {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
        }],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bool",
            name: "newUseGlobalURI",
            type: "bool"
        }],
        name: "useGlobalURI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "version",
        outputs: [{
            internalType: "uint16",
            name: "",
            type: "uint16"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "_logic",
            type: "address"
        }, {
            internalType: "address",
            name: "admin_",
            type: "address"
        }, {
            internalType: "bytes",
            name: "_data",
            type: "bytes"
        }],
        stateMutability: "payable",
        type: "constructor"
    }];
    let Dp = (Nu = class {
        static createInterface() {
            return new Ni(Sa)
        }
        static connect(e, t) {
            return new oo(e, Sa, t)
        }
    }, Re(Nu, "abi", Sa), Nu);
    const ao = {
        carbonControllerAddress: "0xC537e898CD774e2dCBa3B14Ea6f34C93d5eA45e1",
        multiCallAddress: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
        voucherAddress: "0x3660F04B79751e31128f6378eAC70807e38f554E"
    };
    class Lp {
        constructor(e, t) {
            Re(this, "_provider");
            Re(this, "_carbonController");
            Re(this, "_multiCall");
            Re(this, "_voucher");
            Re(this, "_config", ao);
            this._provider = e, this._config.carbonControllerAddress = (t == null ? void 0 : t.carbonControllerAddress) || ao.carbonControllerAddress, this._config.multiCallAddress = (t == null ? void 0 : t.multiCallAddress) || ao.multiCallAddress, this._config.voucherAddress = (t == null ? void 0 : t.voucherAddress) || ao.voucherAddress
        }
        get carbonController() {
            return this._carbonController || (this._carbonController = Bp.connect(this._config.carbonControllerAddress, this._provider)), this._carbonController
        }
        get multicall() {
            return this._multiCall || (this._multiCall = Op.connect(this._config.multiCallAddress, this._provider)), this._multiCall
        }
        get voucher() {
            return this._voucher || (this._voucher = Dp.connect(this._config.voucherAddress, this._provider)), this._voucher
        }
        token(e) {
            return Fp.connect(e, this._provider)
        }
        get provider() {
            return this._provider
        }
    }
    const Th = new vi("Reader.ts");

    function Ra(r) {
        return {
            id: r[0],
            token0: r[2][0],
            token1: r[2][1],
            order0: {
                y: r[3][0][0],
                z: r[3][0][1],
                A: r[3][0][2],
                B: r[3][0][3]
            },
            order1: {
                y: r[3][1][0],
                z: r[3][1][1],
                A: r[3][1][2],
                B: r[3][1][3]
            }
        }
    }
    class Up {
        constructor(e) {
            Re(this, "_contracts");
            Re(this, "getDecimalsByAddress", async e => Ai(e) ? 18 : this._contracts.token(e).decimals());
            Re(this, "_getFilteredStrategies", async (e, t, n) => {
                const i = this._contracts.carbonController.filters[e](null, null, null, null, null),
                    s = await this._contracts.carbonController.queryFilter(i, t, n);
                return s.length === 0 ? [] : s.map(o => {
                    const u = o.args;
                    return {
                        id: u.id,
                        token0: u.token0,
                        token1: u.token1,
                        order0: {
                            y: u.order0.y,
                            z: u.order0.z,
                            A: u.order0.A,
                            B: u.order0.B
                        },
                        order1: {
                            y: u.order1.y,
                            z: u.order1.z,
                            A: u.order1.A,
                            B: u.order1.B
                        }
                    }
                })
            });
            Re(this, "getLatestTokensTradedTrades", async (e, t) => {
                const n = this._contracts.carbonController.filters.TokensTraded(null, null, null, null, null, null, null),
                    i = await this._contracts.carbonController.queryFilter(n, e, t);
                return i.length === 0 ? [] : i.map(s => {
                    const o = s.args;
                    return {
                        sourceToken: o.sourceToken,
                        targetToken: o.targetToken,
                        sourceAmount: o.sourceAmount.toString(),
                        targetAmount: o.targetAmount.toString(),
                        trader: o.trader,
                        tradingFeeAmount: o.tradingFeeAmount.toString(),
                        byTargetAmount: o.byTargetAmount
                    }
                })
            });
            Re(this, "getBlockNumber", async () => this._contracts.provider.getBlockNumber());
            Re(this, "getBlock", async e => this._contracts.provider.getBlock(e));
            this._contracts = e
        }
        _multicall(e, t) {
            return Cd(e, this._contracts.multicall, t)
        }
        async strategy(e) {
            return Ra(await this._contracts.carbonController.strategy(e))
        }
        async strategies(e) {
            const t = await this._multicall(e.map(n => ({
                contractAddress: this._contracts.carbonController.address,
                interface: this._contracts.carbonController.interface,
                methodName: "strategy",
                methodParameters: [n]
            })));
            return t && t.length !== 0 ? t.map(n => Ra(n[0])) : []
        }
        pairs() {
            return this._contracts.carbonController.pairs()
        }
        async strategiesByPair(e, t) {
            return (await this._contracts.carbonController.strategiesByPair(e, t, 0, 0)).map(n => Ra(n))
        }
        async tokensByOwner(e) {
            return e ? this._contracts.voucher.tokensByOwner(e, 0, 0) : []
        }
        tradingFeePPM() {
            return this._contracts.carbonController.tradingFeePPM()
        }
        onTradingFeePPMUpdated(e) {
            return this._contracts.carbonController.on("TradingFeePPMUpdated", function(t, n) {
                Th.debug("TradingFeePPMUpdated fired with", arguments), e(t, n)
            })
        }
        pairTradingFeePPM(e, t) {
            return this._contracts.carbonController.pairTradingFeePPM(e, t)
        }
        async pairsTradingFeePPM(e) {
            const t = await this._multicall(e.map(n => ({
                contractAddress: this._contracts.carbonController.address,
                interface: this._contracts.carbonController.interface,
                methodName: "pairTradingFeePPM",
                methodParameters: [n[0], n[1]]
            })));
            return t && t.length !== 0 ? t.map((n, i) => [e[i][0], e[i][1], n[0]]) : []
        }
        onPairTradingFeePPMUpdated(e) {
            return this._contracts.carbonController.on("PairTradingFeePPMUpdated", function(t, n, i, s) {
                Th.debug("PairTradingFeePPMUpdated fired with", arguments), e(t, n, i, s)
            })
        }
        async getLatestStrategyCreatedStrategies(e, t) {
            return this._getFilteredStrategies("StrategyCreated", e, t)
        }
        async getLatestStrategyUpdatedStrategies(e, t) {
            return this._getFilteredStrategies("StrategyUpdated", e, t)
        }
        async getLatestStrategyDeletedStrategies(e, t) {
            return this._getFilteredStrategies("StrategyDeleted", e, t)
        }
        async getLatestTradingFeeUpdates(e, t) {
            const n = this._contracts.carbonController.filters.TradingFeePPMUpdated(null, null),
                i = await this._contracts.carbonController.queryFilter(n, e, t);
            return i.length === 0 ? [] : i.map(s => s.args.newFeePPM)
        }
        async getLatestPairTradingFeeUpdates(e, t) {
            const n = this._contracts.carbonController.filters.PairTradingFeePPMUpdated(null, null, null, null),
                i = await this._contracts.carbonController.queryFilter(n, e, t);
            return i.length === 0 ? [] : i.map(s => {
                const o = s.args;
                return [o.token0, o.token1, o.newFeePPM]
            })
        }
    }
    let $p = class {
        constructor(e, t) {
            Re(this, "_reader");
            Re(this, "_composer");
            const n = new Lp(e, t);
            this._reader = new Up(n), this._composer = new Bd(n)
        }
        get reader() {
            return this._reader
        }
        get composer() {
            return this._composer
        }
    };
    /*!
     *  decimal.js v10.4.3
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     */
    var Ti = 9e15,
        Cn = 1e9,
        Ia = "0123456789abcdef",
        uo = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058",
        lo = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789",
        Ca = {
            precision: 20,
            rounding: 4,
            modulo: 1,
            toExpNeg: -7,
            toExpPos: 21,
            minE: -Ti,
            maxE: Ti,
            crypto: !1
        },
        Ph, mn, Te = !0,
        ho = "[DecimalError] ",
        Bn = ho + "Invalid argument: ",
        kh = ho + "Precision limit exceeded",
        Sh = ho + "crypto unavailable",
        Rh = "[object Decimal]",
        Ht = Math.floor,
        Ot = Math.pow,
        qp = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
        zp = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
        Gp = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
        Ih = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Tr = 1e7,
        ae = 7,
        Hp = 9007199254740991,
        jp = uo.length - 1,
        Ba = lo.length - 1,
        $ = {
            toStringTag: Rh
        };
    $.absoluteValue = $.abs = function() {
        var r = new this.constructor(this);
        return r.s < 0 && (r.s = 1), ie(r)
    }, $.ceil = function() {
        return ie(new this.constructor(this), this.e + 1, 2)
    }, $.clampedTo = $.clamp = function(r, e) {
        var t, n = this,
            i = n.constructor;
        if (r = new i(r), e = new i(e), !r.s || !e.s) return new i(NaN);
        if (r.gt(e)) throw Error(Bn + e);
        return t = n.cmp(r), t < 0 ? r : n.cmp(e) > 0 ? e : new i(n)
    }, $.comparedTo = $.cmp = function(r) {
        var e, t, n, i, s = this,
            o = s.d,
            u = (r = new s.constructor(r)).d,
            l = s.s,
            h = r.s;
        if (!o || !u) return !l || !h ? NaN : l !== h ? l : o === u ? 0 : !o ^ l < 0 ? 1 : -1;
        if (!o[0] || !u[0]) return o[0] ? l : u[0] ? -h : 0;
        if (l !== h) return l;
        if (s.e !== r.e) return s.e > r.e ^ l < 0 ? 1 : -1;
        for (n = o.length, i = u.length, e = 0, t = n < i ? n : i; e < t; ++e)
            if (o[e] !== u[e]) return o[e] > u[e] ^ l < 0 ? 1 : -1;
        return n === i ? 0 : n > i ^ l < 0 ? 1 : -1
    }, $.cosine = $.cos = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.d ? t.d[0] ? (r = n.precision, e = n.rounding, n.precision = r + Math.max(t.e, t.sd()) + ae, n.rounding = 1, t = Kp(n, Lh(n, t)), n.precision = r, n.rounding = e, ie(mn == 2 || mn == 3 ? t.neg() : t, r, e, !0)) : new n(1) : new n(NaN)
    }, $.cubeRoot = $.cbrt = function() {
        var r, e, t, n, i, s, o, u, l, h, c = this,
            y = c.constructor;
        if (!c.isFinite() || c.isZero()) return new y(c);
        for (Te = !1, s = c.s * Ot(c.s * c, 1 / 3), !s || Math.abs(s) == 1 / 0 ? (t = Ut(c.d), r = c.e, (s = (r - t.length + 1) % 3) && (t += s == 1 || s == -2 ? "0" : "00"), s = Ot(t, 1 / 3), r = Ht((r + 1) / 3) - (r % 3 == (r < 0 ? -1 : 2)), s == 1 / 0 ? t = "5e" + r : (t = s.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + r), n = new y(t), n.s = c.s) : n = new y(s.toString()), o = (r = y.precision) + 3;;)
            if (u = n, l = u.times(u).times(u), h = l.plus(c), n = Et(h.plus(c).times(u), h.plus(l), o + 2, 1), Ut(u.d).slice(0, o) === (t = Ut(n.d)).slice(0, o))
                if (t = t.slice(o - 3, o + 1), t == "9999" || !i && t == "4999") {
                    if (!i && (ie(u, r + 1, 0), u.times(u).times(u).eq(c))) {
                        n = u;
                        break
                    }
                    o += 4, i = 1
                } else {
                    (!+t || !+t.slice(1) && t.charAt(0) == "5") && (ie(n, r + 1, 1), e = !n.times(n).times(n).eq(c));
                    break
                }
        return Te = !0, ie(n, r, y.rounding, e)
    }, $.decimalPlaces = $.dp = function() {
        var r, e = this.d,
            t = NaN;
        if (e) {
            if (r = e.length - 1, t = (r - Ht(this.e / ae)) * ae, r = e[r], r)
                for (; r % 10 == 0; r /= 10) t--;
            t < 0 && (t = 0)
        }
        return t
    }, $.dividedBy = $.div = function(r) {
        return Et(this, new this.constructor(r))
    }, $.dividedToIntegerBy = $.divToInt = function(r) {
        var e = this,
            t = e.constructor;
        return ie(Et(e, new t(r), 0, 1, 1), t.precision, t.rounding)
    }, $.equals = $.eq = function(r) {
        return this.cmp(r) === 0
    }, $.floor = function() {
        return ie(new this.constructor(this), this.e + 1, 3)
    }, $.greaterThan = $.gt = function(r) {
        return this.cmp(r) > 0
    }, $.greaterThanOrEqualTo = $.gte = function(r) {
        var e = this.cmp(r);
        return e == 1 || e === 0
    }, $.hyperbolicCosine = $.cosh = function() {
        var r, e, t, n, i, s = this,
            o = s.constructor,
            u = new o(1);
        if (!s.isFinite()) return new o(s.s ? 1 / 0 : NaN);
        if (s.isZero()) return u;
        t = o.precision, n = o.rounding, o.precision = t + Math.max(s.e, s.sd()) + 4, o.rounding = 1, i = s.d.length, i < 32 ? (r = Math.ceil(i / 3), e = (1 / mo(4, r)).toString()) : (r = 16, e = "2.3283064365386962890625e-10"), s = Pi(o, 1, s.times(e), new o(1), !0);
        for (var l, h = r, c = new o(8); h--;) l = s.times(s), s = u.minus(l.times(c.minus(l.times(c))));
        return ie(s, o.precision = t, o.rounding = n, !0)
    }, $.hyperbolicSine = $.sinh = function() {
        var r, e, t, n, i = this,
            s = i.constructor;
        if (!i.isFinite() || i.isZero()) return new s(i);
        if (e = s.precision, t = s.rounding, s.precision = e + Math.max(i.e, i.sd()) + 4, s.rounding = 1, n = i.d.length, n < 3) i = Pi(s, 2, i, i, !0);
        else {
            r = 1.4 * Math.sqrt(n), r = r > 16 ? 16 : r | 0, i = i.times(1 / mo(5, r)), i = Pi(s, 2, i, i, !0);
            for (var o, u = new s(5), l = new s(16), h = new s(20); r--;) o = i.times(i), i = i.times(u.plus(o.times(l.times(o).plus(h))))
        }
        return s.precision = e, s.rounding = t, ie(i, e, t, !0)
    }, $.hyperbolicTangent = $.tanh = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 7, n.rounding = 1, Et(t.sinh(), t.cosh(), n.precision = r, n.rounding = e)) : new n(t.s)
    }, $.inverseCosine = $.acos = function() {
        var r, e = this,
            t = e.constructor,
            n = e.abs().cmp(1),
            i = t.precision,
            s = t.rounding;
        return n !== -1 ? n === 0 ? e.isNeg() ? Pr(t, i, s) : new t(0) : new t(NaN) : e.isZero() ? Pr(t, i + 4, s).times(.5) : (t.precision = i + 6, t.rounding = 1, e = e.asin(), r = Pr(t, i + 4, s).times(.5), t.precision = i, t.rounding = s, r.minus(e))
    }, $.inverseHyperbolicCosine = $.acosh = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.lte(1) ? new n(t.eq(1) ? 0 : NaN) : t.isFinite() ? (r = n.precision, e = n.rounding, n.precision = r + Math.max(Math.abs(t.e), t.sd()) + 4, n.rounding = 1, Te = !1, t = t.times(t).minus(1).sqrt().plus(t), Te = !0, n.precision = r, n.rounding = e, t.ln()) : new n(t)
    }, $.inverseHyperbolicSine = $.asinh = function() {
        var r, e, t = this,
            n = t.constructor;
        return !t.isFinite() || t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 2 * Math.max(Math.abs(t.e), t.sd()) + 6, n.rounding = 1, Te = !1, t = t.times(t).plus(1).sqrt().plus(t), Te = !0, n.precision = r, n.rounding = e, t.ln())
    }, $.inverseHyperbolicTangent = $.atanh = function() {
        var r, e, t, n, i = this,
            s = i.constructor;
        return i.isFinite() ? i.e >= 0 ? new s(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (r = s.precision, e = s.rounding, n = i.sd(), Math.max(n, r) < 2 * -i.e - 1 ? ie(new s(i), r, e, !0) : (s.precision = t = n - i.e, i = Et(i.plus(1), new s(1).minus(i), t + r, 1), s.precision = r + 4, s.rounding = 1, i = i.ln(), s.precision = r, s.rounding = e, i.times(.5))) : new s(NaN)
    }, $.inverseSine = $.asin = function() {
        var r, e, t, n, i = this,
            s = i.constructor;
        return i.isZero() ? new s(i) : (e = i.abs().cmp(1), t = s.precision, n = s.rounding, e !== -1 ? e === 0 ? (r = Pr(s, t + 4, n).times(.5), r.s = i.s, r) : new s(NaN) : (s.precision = t + 6, s.rounding = 1, i = i.div(new s(1).minus(i.times(i)).sqrt().plus(1)).atan(), s.precision = t, s.rounding = n, i.times(2)))
    }, $.inverseTangent = $.atan = function() {
        var r, e, t, n, i, s, o, u, l, h = this,
            c = h.constructor,
            y = c.precision,
            v = c.rounding;
        if (h.isFinite()) {
            if (h.isZero()) return new c(h);
            if (h.abs().eq(1) && y + 4 <= Ba) return o = Pr(c, y + 4, v).times(.25), o.s = h.s, o
        } else {
            if (!h.s) return new c(NaN);
            if (y + 4 <= Ba) return o = Pr(c, y + 4, v).times(.5), o.s = h.s, o
        }
        for (c.precision = u = y + 10, c.rounding = 1, t = Math.min(28, u / ae + 2 | 0), r = t; r; --r) h = h.div(h.times(h).plus(1).sqrt().plus(1));
        for (Te = !1, e = Math.ceil(u / ae), n = 1, l = h.times(h), o = new c(h), i = h; r !== -1;)
            if (i = i.times(l), s = o.minus(i.div(n += 2)), i = i.times(l), o = s.plus(i.div(n += 2)), o.d[e] !== void 0)
                for (r = e; o.d[r] === s.d[r] && r--;);
        return t && (o = o.times(2 << t - 1)), Te = !0, ie(o, c.precision = y, c.rounding = v, !0)
    }, $.isFinite = function() {
        return !!this.d
    }, $.isInteger = $.isInt = function() {
        return !!this.d && Ht(this.e / ae) > this.d.length - 2
    }, $.isNaN = function() {
        return !this.s
    }, $.isNegative = $.isNeg = function() {
        return this.s < 0
    }, $.isPositive = $.isPos = function() {
        return this.s > 0
    }, $.isZero = function() {
        return !!this.d && this.d[0] === 0
    }, $.lessThan = $.lt = function(r) {
        return this.cmp(r) < 0
    }, $.lessThanOrEqualTo = $.lte = function(r) {
        return this.cmp(r) < 1
    }, $.logarithm = $.log = function(r) {
        var e, t, n, i, s, o, u, l, h = this,
            c = h.constructor,
            y = c.precision,
            v = c.rounding,
            N = 5;
        if (r == null) r = new c(10), e = !0;
        else {
            if (r = new c(r), t = r.d, r.s < 0 || !t || !t[0] || r.eq(1)) return new c(NaN);
            e = r.eq(10)
        }
        if (t = h.d, h.s < 0 || !t || !t[0] || h.eq(1)) return new c(t && !t[0] ? -1 / 0 : h.s != 1 ? NaN : t ? 0 : 1 / 0);
        if (e)
            if (t.length > 1) s = !0;
            else {
                for (i = t[0]; i % 10 === 0;) i /= 10;
                s = i !== 1
            }
        if (Te = !1, u = y + N, o = Fn(h, u), n = e ? po(c, u + 10) : Fn(r, u), l = Et(o, n, u, 1), ls(l.d, i = y, v))
            do
                if (u += 10, o = Fn(h, u), n = e ? po(c, u + 10) : Fn(r, u), l = Et(o, n, u, 1), !s) {
                    +Ut(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = ie(l, y + 1, 0));
                    break
                }
        while (ls(l.d, i += 10, v));
        return Te = !0, ie(l, y, v)
    }, $.minus = $.sub = function(r) {
        var e, t, n, i, s, o, u, l, h, c, y, v, N = this,
            P = N.constructor;
        if (r = new P(r), !N.d || !r.d) return !N.s || !r.s ? r = new P(NaN) : N.d ? r.s = -r.s : r = new P(r.d || N.s !== r.s ? N : NaN), r;
        if (N.s != r.s) return r.s = -r.s, N.plus(r);
        if (h = N.d, v = r.d, u = P.precision, l = P.rounding, !h[0] || !v[0]) {
            if (v[0]) r.s = -r.s;
            else if (h[0]) r = new P(N);
            else return new P(l === 3 ? -0 : 0);
            return Te ? ie(r, u, l) : r
        }
        if (t = Ht(r.e / ae), c = Ht(N.e / ae), h = h.slice(), s = c - t, s) {
            for (y = s < 0, y ? (e = h, s = -s, o = v.length) : (e = v, t = c, o = h.length), n = Math.max(Math.ceil(u / ae), o) + 2, s > n && (s = n, e.length = 1), e.reverse(), n = s; n--;) e.push(0);
            e.reverse()
        } else {
            for (n = h.length, o = v.length, y = n < o, y && (o = n), n = 0; n < o; n++)
                if (h[n] != v[n]) {
                    y = h[n] < v[n];
                    break
                }
            s = 0
        }
        for (y && (e = h, h = v, v = e, r.s = -r.s), o = h.length, n = v.length - o; n > 0; --n) h[o++] = 0;
        for (n = v.length; n > s;) {
            if (h[--n] < v[n]) {
                for (i = n; i && h[--i] === 0;) h[i] = Tr - 1;
                --h[i], h[n] += Tr
            }
            h[n] -= v[n]
        }
        for (; h[--o] === 0;) h.pop();
        for (; h[0] === 0; h.shift()) --t;
        return h[0] ? (r.d = h, r.e = co(h, t), Te ? ie(r, u, l) : r) : new P(l === 3 ? -0 : 0)
    }, $.modulo = $.mod = function(r) {
        var e, t = this,
            n = t.constructor;
        return r = new n(r), !t.d || !r.s || r.d && !r.d[0] ? new n(NaN) : !r.d || t.d && !t.d[0] ? ie(new n(t), n.precision, n.rounding) : (Te = !1, n.modulo == 9 ? (e = Et(t, r.abs(), 0, 3, 1), e.s *= r.s) : e = Et(t, r, 0, n.modulo, 1), e = e.times(r), Te = !0, t.minus(e))
    }, $.naturalExponential = $.exp = function() {
        return Oa(this)
    }, $.naturalLogarithm = $.ln = function() {
        return Fn(this)
    }, $.negated = $.neg = function() {
        var r = new this.constructor(this);
        return r.s = -r.s, ie(r)
    }, $.plus = $.add = function(r) {
        var e, t, n, i, s, o, u, l, h, c, y = this,
            v = y.constructor;
        if (r = new v(r), !y.d || !r.d) return !y.s || !r.s ? r = new v(NaN) : y.d || (r = new v(r.d || y.s === r.s ? y : NaN)), r;
        if (y.s != r.s) return r.s = -r.s, y.minus(r);
        if (h = y.d, c = r.d, u = v.precision, l = v.rounding, !h[0] || !c[0]) return c[0] || (r = new v(y)), Te ? ie(r, u, l) : r;
        if (s = Ht(y.e / ae), n = Ht(r.e / ae), h = h.slice(), i = s - n, i) {
            for (i < 0 ? (t = h, i = -i, o = c.length) : (t = c, n = s, o = h.length), s = Math.ceil(u / ae), o = s > o ? s + 1 : o + 1, i > o && (i = o, t.length = 1), t.reverse(); i--;) t.push(0);
            t.reverse()
        }
        for (o = h.length, i = c.length, o - i < 0 && (i = o, t = c, c = h, h = t), e = 0; i;) e = (h[--i] = h[i] + c[i] + e) / Tr | 0, h[i] %= Tr;
        for (e && (h.unshift(e), ++n), o = h.length; h[--o] == 0;) h.pop();
        return r.d = h, r.e = co(h, n), Te ? ie(r, u, l) : r
    }, $.precision = $.sd = function(r) {
        var e, t = this;
        if (r !== void 0 && r !== !!r && r !== 1 && r !== 0) throw Error(Bn + r);
        return t.d ? (e = Ch(t.d), r && t.e + 1 > e && (e = t.e + 1)) : e = NaN, e
    }, $.round = function() {
        var r = this,
            e = r.constructor;
        return ie(new e(r), r.e + 1, e.rounding)
    }, $.sine = $.sin = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + Math.max(t.e, t.sd()) + ae, n.rounding = 1, t = Vp(n, Lh(n, t)), n.precision = r, n.rounding = e, ie(mn > 2 ? t.neg() : t, r, e, !0)) : new n(NaN)
    }, $.squareRoot = $.sqrt = function() {
        var r, e, t, n, i, s, o = this,
            u = o.d,
            l = o.e,
            h = o.s,
            c = o.constructor;
        if (h !== 1 || !u || !u[0]) return new c(!h || h < 0 && (!u || u[0]) ? NaN : u ? o : 1 / 0);
        for (Te = !1, h = Math.sqrt(+o), h == 0 || h == 1 / 0 ? (e = Ut(u), (e.length + l) % 2 == 0 && (e += "0"), h = Math.sqrt(e), l = Ht((l + 1) / 2) - (l < 0 || l % 2), h == 1 / 0 ? e = "5e" + l : (e = h.toExponential(), e = e.slice(0, e.indexOf("e") + 1) + l), n = new c(e)) : n = new c(h.toString()), t = (l = c.precision) + 3;;)
            if (s = n, n = s.plus(Et(o, s, t + 2, 1)).times(.5), Ut(s.d).slice(0, t) === (e = Ut(n.d)).slice(0, t))
                if (e = e.slice(t - 3, t + 1), e == "9999" || !i && e == "4999") {
                    if (!i && (ie(s, l + 1, 0), s.times(s).eq(o))) {
                        n = s;
                        break
                    }
                    t += 4, i = 1
                } else {
                    (!+e || !+e.slice(1) && e.charAt(0) == "5") && (ie(n, l + 1, 1), r = !n.times(n).eq(o));
                    break
                }
        return Te = !0, ie(n, l, c.rounding, r)
    }, $.tangent = $.tan = function() {
        var r, e, t = this,
            n = t.constructor;
        return t.isFinite() ? t.isZero() ? new n(t) : (r = n.precision, e = n.rounding, n.precision = r + 10, n.rounding = 1, t = t.sin(), t.s = 1, t = Et(t, new n(1).minus(t.times(t)).sqrt(), r + 10, 0), n.precision = r, n.rounding = e, ie(mn == 2 || mn == 4 ? t.neg() : t, r, e, !0)) : new n(NaN)
    }, $.times = $.mul = function(r) {
        var e, t, n, i, s, o, u, l, h, c = this,
            y = c.constructor,
            v = c.d,
            N = (r = new y(r)).d;
        if (r.s *= c.s, !v || !v[0] || !N || !N[0]) return new y(!r.s || v && !v[0] && !N || N && !N[0] && !v ? NaN : !v || !N ? r.s / 0 : r.s * 0);
        for (t = Ht(c.e / ae) + Ht(r.e / ae), l = v.length, h = N.length, l < h && (s = v, v = N, N = s, o = l, l = h, h = o), s = [], o = l + h, n = o; n--;) s.push(0);
        for (n = h; --n >= 0;) {
            for (e = 0, i = l + n; i > n;) u = s[i] + N[n] * v[i - n - 1] + e, s[i--] = u % Tr | 0, e = u / Tr | 0;
            s[i] = (s[i] + e) % Tr | 0
        }
        for (; !s[--o];) s.pop();
        return e ? ++t : s.shift(), r.d = s, r.e = co(s, t), Te ? ie(r, y.precision, y.rounding) : r
    }, $.toBinary = function(r, e) {
        return Da(this, 2, r, e)
    }, $.toDecimalPlaces = $.toDP = function(r, e) {
        var t = this,
            n = t.constructor;
        return t = new n(t), r === void 0 ? t : (er(r, 0, Cn), e === void 0 ? e = n.rounding : er(e, 0, 8), ie(t, r + t.e + 1, e))
    }, $.toExponential = function(r, e) {
        var t, n = this,
            i = n.constructor;
        return r === void 0 ? t = Kr(n, !0) : (er(r, 0, Cn), e === void 0 ? e = i.rounding : er(e, 0, 8), n = ie(new i(n), r + 1, e), t = Kr(n, !0, r + 1)), n.isNeg() && !n.isZero() ? "-" + t : t
    }, $.toFixed = function(r, e) {
        var t, n, i = this,
            s = i.constructor;
        return r === void 0 ? t = Kr(i) : (er(r, 0, Cn), e === void 0 ? e = s.rounding : er(e, 0, 8), n = ie(new s(i), r + i.e + 1, e), t = Kr(n, !1, r + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + t : t
    }, $.toFraction = function(r) {
        var e, t, n, i, s, o, u, l, h, c, y, v, N = this,
            P = N.d,
            S = N.constructor;
        if (!P) return new S(N);
        if (h = t = new S(1), n = l = new S(0), e = new S(n), s = e.e = Ch(P) - N.e - 1, o = s % ae, e.d[0] = Ot(10, o < 0 ? ae + o : o), r == null) r = s > 0 ? e : h;
        else {
            if (u = new S(r), !u.isInt() || u.lt(h)) throw Error(Bn + u);
            r = u.gt(e) ? s > 0 ? e : h : u
        }
        for (Te = !1, u = new S(Ut(P)), c = S.precision, S.precision = s = P.length * ae * 2; y = Et(u, e, 0, 1, 1), i = t.plus(y.times(n)), i.cmp(r) != 1;) t = n, n = i, i = h, h = l.plus(y.times(i)), l = i, i = e, e = u.minus(y.times(i)), u = i;
        return i = Et(r.minus(t), n, 0, 1, 1), l = l.plus(i.times(h)), t = t.plus(i.times(n)), l.s = h.s = N.s, v = Et(h, n, s, 1).minus(N).abs().cmp(Et(l, t, s, 1).minus(N).abs()) < 1 ? [h, n] : [l, t], S.precision = c, Te = !0, v
    }, $.toHexadecimal = $.toHex = function(r, e) {
        return Da(this, 16, r, e)
    }, $.toNearest = function(r, e) {
        var t = this,
            n = t.constructor;
        if (t = new n(t), r == null) {
            if (!t.d) return t;
            r = new n(1), e = n.rounding
        } else {
            if (r = new n(r), e === void 0 ? e = n.rounding : er(e, 0, 8), !t.d) return r.s ? t : r;
            if (!r.d) return r.s && (r.s = t.s), r
        }
        return r.d[0] ? (Te = !1, t = Et(t, r, 0, e, 1).times(r), Te = !0, ie(t)) : (r.s = t.s, t = r), t
    }, $.toNumber = function() {
        return +this
    }, $.toOctal = function(r, e) {
        return Da(this, 8, r, e)
    }, $.toPower = $.pow = function(r) {
        var e, t, n, i, s, o, u = this,
            l = u.constructor,
            h = +(r = new l(r));
        if (!u.d || !r.d || !u.d[0] || !r.d[0]) return new l(Ot(+u, h));
        if (u = new l(u), u.eq(1)) return u;
        if (n = l.precision, s = l.rounding, r.eq(1)) return ie(u, n, s);
        if (e = Ht(r.e / ae), e >= r.d.length - 1 && (t = h < 0 ? -h : h) <= Hp) return i = Bh(l, u, t, n), r.s < 0 ? new l(1).div(i) : ie(i, n, s);
        if (o = u.s, o < 0) {
            if (e < r.d.length - 1) return new l(NaN);
            if (r.d[e] & 1 || (o = 1), u.e == 0 && u.d[0] == 1 && u.d.length == 1) return u.s = o, u
        }
        return t = Ot(+u, h), e = t == 0 || !isFinite(t) ? Ht(h * (Math.log("0." + Ut(u.d)) / Math.LN10 + u.e + 1)) : new l(t + "").e, e > l.maxE + 1 || e < l.minE - 1 ? new l(e > 0 ? o / 0 : 0) : (Te = !1, l.rounding = u.s = 1, t = Math.min(12, (e + "").length), i = Oa(r.times(Fn(u, n + t)), n), i.d && (i = ie(i, n + 5, 1), ls(i.d, n, s) && (e = n + 10, i = ie(Oa(r.times(Fn(u, e + t)), e), e + 5, 1), +Ut(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = ie(i, n + 1, 0)))), i.s = o, Te = !0, l.rounding = s, ie(i, n, s))
    }, $.toPrecision = function(r, e) {
        var t, n = this,
            i = n.constructor;
        return r === void 0 ? t = Kr(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (er(r, 1, Cn), e === void 0 ? e = i.rounding : er(e, 0, 8), n = ie(new i(n), r, e), t = Kr(n, r <= n.e || n.e <= i.toExpNeg, r)), n.isNeg() && !n.isZero() ? "-" + t : t
    }, $.toSignificantDigits = $.toSD = function(r, e) {
        var t = this,
            n = t.constructor;
        return r === void 0 ? (r = n.precision, e = n.rounding) : (er(r, 1, Cn), e === void 0 ? e = n.rounding : er(e, 0, 8)), ie(new n(t), r, e)
    }, $.toString = function() {
        var r = this,
            e = r.constructor,
            t = Kr(r, r.e <= e.toExpNeg || r.e >= e.toExpPos);
        return r.isNeg() && !r.isZero() ? "-" + t : t
    }, $.truncated = $.trunc = function() {
        return ie(new this.constructor(this), this.e + 1, 1)
    }, $.valueOf = $.toJSON = function() {
        var r = this,
            e = r.constructor,
            t = Kr(r, r.e <= e.toExpNeg || r.e >= e.toExpPos);
        return r.isNeg() ? "-" + t : t
    };

    function Ut(r) {
        var e, t, n, i = r.length - 1,
            s = "",
            o = r[0];
        if (i > 0) {
            for (s += o, e = 1; e < i; e++) n = r[e] + "", t = ae - n.length, t && (s += On(t)), s += n;
            o = r[e], n = o + "", t = ae - n.length, t && (s += On(t))
        } else if (o === 0) return "0";
        for (; o % 10 === 0;) o /= 10;
        return s + o
    }

    function er(r, e, t) {
        if (r !== ~~r || r < e || r > t) throw Error(Bn + r)
    }

    function ls(r, e, t, n) {
        var i, s, o, u;
        for (s = r[0]; s >= 10; s /= 10) --e;
        return --e < 0 ? (e += ae, i = 0) : (i = Math.ceil((e + 1) / ae), e %= ae), s = Ot(10, ae - e), u = r[i] % s | 0, n == null ? e < 3 ? (e == 0 ? u = u / 100 | 0 : e == 1 && (u = u / 10 | 0), o = t < 4 && u == 99999 || t > 3 && u == 49999 || u == 5e4 || u == 0) : o = (t < 4 && u + 1 == s || t > 3 && u + 1 == s / 2) && (r[i + 1] / s / 100 | 0) == Ot(10, e - 2) - 1 || (u == s / 2 || u == 0) && (r[i + 1] / s / 100 | 0) == 0 : e < 4 ? (e == 0 ? u = u / 1e3 | 0 : e == 1 ? u = u / 100 | 0 : e == 2 && (u = u / 10 | 0), o = (n || t < 4) && u == 9999 || !n && t > 3 && u == 4999) : o = ((n || t < 4) && u + 1 == s || !n && t > 3 && u + 1 == s / 2) && (r[i + 1] / s / 1e3 | 0) == Ot(10, e - 3) - 1, o
    }

    function fo(r, e, t) {
        for (var n, i = [0], s, o = 0, u = r.length; o < u;) {
            for (s = i.length; s--;) i[s] *= e;
            for (i[0] += Ia.indexOf(r.charAt(o++)), n = 0; n < i.length; n++) i[n] > t - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / t | 0, i[n] %= t)
        }
        return i.reverse()
    }

    function Kp(r, e) {
        var t, n, i;
        if (e.isZero()) return e;
        n = e.d.length, n < 32 ? (t = Math.ceil(n / 3), i = (1 / mo(4, t)).toString()) : (t = 16, i = "2.3283064365386962890625e-10"), r.precision += t, e = Pi(r, 1, e.times(i), new r(1));
        for (var s = t; s--;) {
            var o = e.times(e);
            e = o.times(o).minus(o).times(8).plus(1)
        }
        return r.precision -= t, e
    }
    var Et = function() {
        function r(n, i, s) {
            var o, u = 0,
                l = n.length;
            for (n = n.slice(); l--;) o = n[l] * i + u, n[l] = o % s | 0, u = o / s | 0;
            return u && n.unshift(u), n
        }

        function e(n, i, s, o) {
            var u, l;
            if (s != o) l = s > o ? 1 : -1;
            else
                for (u = l = 0; u < s; u++)
                    if (n[u] != i[u]) {
                        l = n[u] > i[u] ? 1 : -1;
                        break
                    } return l
        }

        function t(n, i, s, o) {
            for (var u = 0; s--;) n[s] -= u, u = n[s] < i[s] ? 1 : 0, n[s] = u * o + n[s] - i[s];
            for (; !n[0] && n.length > 1;) n.shift()
        }
        return function(n, i, s, o, u, l) {
            var h, c, y, v, N, P, S, O, I, C, R, G, q, J, ue, W, se, m, w, M, p = n.constructor,
                a = n.s == i.s ? 1 : -1,
                d = n.d,
                f = i.d;
            if (!d || !d[0] || !f || !f[0]) return new p(!n.s || !i.s || (d ? f && d[0] == f[0] : !f) ? NaN : d && d[0] == 0 || !f ? a * 0 : a / 0);
            for (l ? (N = 1, c = n.e - i.e) : (l = Tr, N = ae, c = Ht(n.e / N) - Ht(i.e / N)), w = f.length, se = d.length, I = new p(a), C = I.d = [], y = 0; f[y] == (d[y] || 0); y++);
            if (f[y] > (d[y] || 0) && c--, s == null ? (J = s = p.precision, o = p.rounding) : u ? J = s + (n.e - i.e) + 1 : J = s, J < 0) C.push(1), P = !0;
            else {
                if (J = J / N + 2 | 0, y = 0, w == 1) {
                    for (v = 0, f = f[0], J++;
                        (y < se || v) && J--; y++) ue = v * l + (d[y] || 0), C[y] = ue / f | 0, v = ue % f | 0;
                    P = v || y < se
                } else {
                    for (v = l / (f[0] + 1) | 0, v > 1 && (f = r(f, v, l), d = r(d, v, l), w = f.length, se = d.length), W = w, R = d.slice(0, w), G = R.length; G < w;) R[G++] = 0;
                    M = f.slice(), M.unshift(0), m = f[0], f[1] >= l / 2 && ++m;
                    do v = 0, h = e(f, R, w, G), h < 0 ? (q = R[0], w != G && (q = q * l + (R[1] || 0)), v = q / m | 0, v > 1 ? (v >= l && (v = l - 1), S = r(f, v, l), O = S.length, G = R.length, h = e(S, R, O, G), h == 1 && (v--, t(S, w < O ? M : f, O, l))) : (v == 0 && (h = v = 1), S = f.slice()), O = S.length, O < G && S.unshift(0), t(R, S, G, l), h == -1 && (G = R.length, h = e(f, R, w, G), h < 1 && (v++, t(R, w < G ? M : f, G, l))), G = R.length) : h === 0 && (v++, R = [0]), C[y++] = v, h && R[0] ? R[G++] = d[W] || 0 : (R = [d[W]], G = 1); while ((W++ < se || R[0] !== void 0) && J--);
                    P = R[0] !== void 0
                }
                C[0] || C.shift()
            }
            if (N == 1) I.e = c, Ph = P;
            else {
                for (y = 1, v = C[0]; v >= 10; v /= 10) y++;
                I.e = y + c * N - 1, ie(I, u ? s + I.e + 1 : s, o, P)
            }
            return I
        }
    }();

    function ie(r, e, t, n) {
        var i, s, o, u, l, h, c, y, v, N = r.constructor;
        e: if (e != null) {
            if (y = r.d, !y) return r;
            for (i = 1, u = y[0]; u >= 10; u /= 10) i++;
            if (s = e - i, s < 0) s += ae, o = e, c = y[v = 0], l = c / Ot(10, i - o - 1) % 10 | 0;
            else if (v = Math.ceil((s + 1) / ae), u = y.length, v >= u)
                if (n) {
                    for (; u++ <= v;) y.push(0);
                    c = l = 0, i = 1, s %= ae, o = s - ae + 1
                } else break e;
            else {
                for (c = u = y[v], i = 1; u >= 10; u /= 10) i++;
                s %= ae, o = s - ae + i, l = o < 0 ? 0 : c / Ot(10, i - o - 1) % 10 | 0
            }
            if (n = n || e < 0 || y[v + 1] !== void 0 || (o < 0 ? c : c % Ot(10, i - o - 1)), h = t < 4 ? (l || n) && (t == 0 || t == (r.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (t == 4 || n || t == 6 && (s > 0 ? o > 0 ? c / Ot(10, i - o) : 0 : y[v - 1]) % 10 & 1 || t == (r.s < 0 ? 8 : 7)), e < 1 || !y[0]) return y.length = 0, h ? (e -= r.e + 1, y[0] = Ot(10, (ae - e % ae) % ae), r.e = -e || 0) : y[0] = r.e = 0, r;
            if (s == 0 ? (y.length = v, u = 1, v--) : (y.length = v + 1, u = Ot(10, ae - s), y[v] = o > 0 ? (c / Ot(10, i - o) % Ot(10, o) | 0) * u : 0), h)
                for (;;)
                    if (v == 0) {
                        for (s = 1, o = y[0]; o >= 10; o /= 10) s++;
                        for (o = y[0] += u, u = 1; o >= 10; o /= 10) u++;
                        s != u && (r.e++, y[0] == Tr && (y[0] = 1));
                        break
                    } else {
                        if (y[v] += u, y[v] != Tr) break;
                        y[v--] = 0, u = 1
                    }
            for (s = y.length; y[--s] === 0;) y.pop()
        }
        return Te && (r.e > N.maxE ? (r.d = null, r.e = NaN) : r.e < N.minE && (r.e = 0, r.d = [0])), r
    }

    function Kr(r, e, t) {
        if (!r.isFinite()) return Dh(r);
        var n, i = r.e,
            s = Ut(r.d),
            o = s.length;
        return e ? (t && (n = t - o) > 0 ? s = s.charAt(0) + "." + s.slice(1) + On(n) : o > 1 && (s = s.charAt(0) + "." + s.slice(1)), s = s + (r.e < 0 ? "e" : "e+") + r.e) : i < 0 ? (s = "0." + On(-i - 1) + s, t && (n = t - o) > 0 && (s += On(n))) : i >= o ? (s += On(i + 1 - o), t && (n = t - i - 1) > 0 && (s = s + "." + On(n))) : ((n = i + 1) < o && (s = s.slice(0, n) + "." + s.slice(n)), t && (n = t - o) > 0 && (i + 1 === o && (s += "."), s += On(n))), s
    }

    function co(r, e) {
        var t = r[0];
        for (e *= ae; t >= 10; t /= 10) e++;
        return e
    }

    function po(r, e, t) {
        if (e > jp) throw Te = !0, t && (r.precision = t), Error(kh);
        return ie(new r(uo), e, 1, !0)
    }

    function Pr(r, e, t) {
        if (e > Ba) throw Error(kh);
        return ie(new r(lo), e, t, !0)
    }

    function Ch(r) {
        var e = r.length - 1,
            t = e * ae + 1;
        if (e = r[e], e) {
            for (; e % 10 == 0; e /= 10) t--;
            for (e = r[0]; e >= 10; e /= 10) t++
        }
        return t
    }

    function On(r) {
        for (var e = ""; r--;) e += "0";
        return e
    }

    function Bh(r, e, t, n) {
        var i, s = new r(1),
            o = Math.ceil(n / ae + 4);
        for (Te = !1;;) {
            if (t % 2 && (s = s.times(e), Uh(s.d, o) && (i = !0)), t = Ht(t / 2), t === 0) {
                t = s.d.length - 1, i && s.d[t] === 0 && ++s.d[t];
                break
            }
            e = e.times(e), Uh(e.d, o)
        }
        return Te = !0, s
    }

    function Oh(r) {
        return r.d[r.d.length - 1] & 1
    }

    function Fh(r, e, t) {
        for (var n, i = new r(e[0]), s = 0; ++s < e.length;)
            if (n = new r(e[s]), n.s) i[t](n) && (i = n);
            else {
                i = n;
                break
            }
        return i
    }

    function Oa(r, e) {
        var t, n, i, s, o, u, l, h = 0,
            c = 0,
            y = 0,
            v = r.constructor,
            N = v.rounding,
            P = v.precision;
        if (!r.d || !r.d[0] || r.e > 17) return new v(r.d ? r.d[0] ? r.s < 0 ? 0 : 1 / 0 : 1 : r.s ? r.s < 0 ? 0 : r : 0 / 0);
        for (e == null ? (Te = !1, l = P) : l = e, u = new v(.03125); r.e > -2;) r = r.times(u), y += 5;
        for (n = Math.log(Ot(2, y)) / Math.LN10 * 2 + 5 | 0, l += n, t = s = o = new v(1), v.precision = l;;) {
            if (s = ie(s.times(r), l, 1), t = t.times(++c), u = o.plus(Et(s, t, l, 1)), Ut(u.d).slice(0, l) === Ut(o.d).slice(0, l)) {
                for (i = y; i--;) o = ie(o.times(o), l, 1);
                if (e == null)
                    if (h < 3 && ls(o.d, l - n, N, h)) v.precision = l += 10, t = s = u = new v(1), c = 0, h++;
                    else return ie(o, v.precision = P, N, Te = !0);
                else return v.precision = P, o
            }
            o = u
        }
    }

    function Fn(r, e) {
        var t, n, i, s, o, u, l, h, c, y, v, N = 1,
            P = 10,
            S = r,
            O = S.d,
            I = S.constructor,
            C = I.rounding,
            R = I.precision;
        if (S.s < 0 || !O || !O[0] || !S.e && O[0] == 1 && O.length == 1) return new I(O && !O[0] ? -1 / 0 : S.s != 1 ? NaN : O ? 0 : S);
        if (e == null ? (Te = !1, c = R) : c = e, I.precision = c += P, t = Ut(O), n = t.charAt(0), Math.abs(s = S.e) < 15e14) {
            for (; n < 7 && n != 1 || n == 1 && t.charAt(1) > 3;) S = S.times(r), t = Ut(S.d), n = t.charAt(0), N++;
            s = S.e, n > 1 ? (S = new I("0." + t), s++) : S = new I(n + "." + t.slice(1))
        } else return h = po(I, c + 2, R).times(s + ""), S = Fn(new I(n + "." + t.slice(1)), c - P).plus(h), I.precision = R, e == null ? ie(S, R, C, Te = !0) : S;
        for (y = S, l = o = S = Et(S.minus(1), S.plus(1), c, 1), v = ie(S.times(S), c, 1), i = 3;;) {
            if (o = ie(o.times(v), c, 1), h = l.plus(Et(o, new I(i), c, 1)), Ut(h.d).slice(0, c) === Ut(l.d).slice(0, c))
                if (l = l.times(2), s !== 0 && (l = l.plus(po(I, c + 2, R).times(s + ""))), l = Et(l, new I(N), c, 1), e == null)
                    if (ls(l.d, c - P, C, u)) I.precision = c += P, h = o = S = Et(y.minus(1), y.plus(1), c, 1), v = ie(S.times(S), c, 1), i = u = 1;
                    else return ie(l, I.precision = R, C, Te = !0);
            else return I.precision = R, l;
            l = h, i += 2
        }
    }

    function Dh(r) {
        return String(r.s * r.s / 0)
    }

    function Fa(r, e) {
        var t, n, i;
        for ((t = e.indexOf(".")) > -1 && (e = e.replace(".", "")), (n = e.search(/e/i)) > 0 ? (t < 0 && (t = n), t += +e.slice(n + 1), e = e.substring(0, n)) : t < 0 && (t = e.length), n = 0; e.charCodeAt(n) === 48; n++);
        for (i = e.length; e.charCodeAt(i - 1) === 48; --i);
        if (e = e.slice(n, i), e) {
            if (i -= n, r.e = t = t - n - 1, r.d = [], n = (t + 1) % ae, t < 0 && (n += ae), n < i) {
                for (n && r.d.push(+e.slice(0, n)), i -= ae; n < i;) r.d.push(+e.slice(n, n += ae));
                e = e.slice(n), n = ae - e.length
            } else n -= i;
            for (; n--;) e += "0";
            r.d.push(+e), Te && (r.e > r.constructor.maxE ? (r.d = null, r.e = NaN) : r.e < r.constructor.minE && (r.e = 0, r.d = [0]))
        } else r.e = 0, r.d = [0];
        return r
    }

    function Jp(r, e) {
        var t, n, i, s, o, u, l, h, c;
        if (e.indexOf("_") > -1) {
            if (e = e.replace(/(\d)_(?=\d)/g, "$1"), Ih.test(e)) return Fa(r, e)
        } else if (e === "Infinity" || e === "NaN") return +e || (r.s = NaN), r.e = NaN, r.d = null, r;
        if (zp.test(e)) t = 16, e = e.toLowerCase();
        else if (qp.test(e)) t = 2;
        else if (Gp.test(e)) t = 8;
        else throw Error(Bn + e);
        for (s = e.search(/p/i), s > 0 ? (l = +e.slice(s + 1), e = e.substring(2, s)) : e = e.slice(2), s = e.indexOf("."), o = s >= 0, n = r.constructor, o && (e = e.replace(".", ""), u = e.length, s = u - s, i = Bh(n, new n(t), s, s * 2)), h = fo(e, t, Tr), c = h.length - 1, s = c; h[s] === 0; --s) h.pop();
        return s < 0 ? new n(r.s * 0) : (r.e = co(h, c), r.d = h, Te = !1, o && (r = Et(r, i, u * 4)), l && (r = r.times(Math.abs(l) < 54 ? Ot(2, l) : jt.pow(2, l))), Te = !0, r)
    }

    function Vp(r, e) {
        var t, n = e.d.length;
        if (n < 3) return e.isZero() ? e : Pi(r, 2, e, e);
        t = 1.4 * Math.sqrt(n), t = t > 16 ? 16 : t | 0, e = e.times(1 / mo(5, t)), e = Pi(r, 2, e, e);
        for (var i, s = new r(5), o = new r(16), u = new r(20); t--;) i = e.times(e), e = e.times(s.plus(i.times(o.times(i).minus(u))));
        return e
    }

    function Pi(r, e, t, n, i) {
        var s, o, u, l, h = r.precision,
            c = Math.ceil(h / ae);
        for (Te = !1, l = t.times(t), u = new r(n);;) {
            if (o = Et(u.times(l), new r(e++ * e++), h, 1), u = i ? n.plus(o) : n.minus(o), n = Et(o.times(l), new r(e++ * e++), h, 1), o = u.plus(n), o.d[c] !== void 0) {
                for (s = c; o.d[s] === u.d[s] && s--;);
                if (s == -1) break
            }
            s = u, u = n, n = o, o = s
        }
        return Te = !0, o.d.length = c + 1, o
    }

    function mo(r, e) {
        for (var t = r; --e;) t *= r;
        return t
    }

    function Lh(r, e) {
        var t, n = e.s < 0,
            i = Pr(r, r.precision, 1),
            s = i.times(.5);
        if (e = e.abs(), e.lte(s)) return mn = n ? 4 : 1, e;
        if (t = e.divToInt(i), t.isZero()) mn = n ? 3 : 2;
        else {
            if (e = e.minus(t.times(i)), e.lte(s)) return mn = Oh(t) ? n ? 2 : 3 : n ? 4 : 1, e;
            mn = Oh(t) ? n ? 1 : 4 : n ? 3 : 2
        }
        return e.minus(i).abs()
    }

    function Da(r, e, t, n) {
        var i, s, o, u, l, h, c, y, v, N = r.constructor,
            P = t !== void 0;
        if (P ? (er(t, 1, Cn), n === void 0 ? n = N.rounding : er(n, 0, 8)) : (t = N.precision, n = N.rounding), !r.isFinite()) c = Dh(r);
        else {
            for (c = Kr(r), o = c.indexOf("."), P ? (i = 2, e == 16 ? t = t * 4 - 3 : e == 8 && (t = t * 3 - 2)) : i = e, o >= 0 && (c = c.replace(".", ""), v = new N(1), v.e = c.length - o, v.d = fo(Kr(v), 10, i), v.e = v.d.length), y = fo(c, 10, i), s = l = y.length; y[--l] == 0;) y.pop();
            if (!y[0]) c = P ? "0p+0" : "0";
            else {
                if (o < 0 ? s-- : (r = new N(r), r.d = y, r.e = s, r = Et(r, v, t, n, 0, i), y = r.d, s = r.e, h = Ph), o = y[t], u = i / 2, h = h || y[t + 1] !== void 0, h = n < 4 ? (o !== void 0 || h) && (n === 0 || n === (r.s < 0 ? 3 : 2)) : o > u || o === u && (n === 4 || h || n === 6 && y[t - 1] & 1 || n === (r.s < 0 ? 8 : 7)), y.length = t, h)
                    for (; ++y[--t] > i - 1;) y[t] = 0, t || (++s, y.unshift(1));
                for (l = y.length; !y[l - 1]; --l);
                for (o = 0, c = ""; o < l; o++) c += Ia.charAt(y[o]);
                if (P) {
                    if (l > 1)
                        if (e == 16 || e == 8) {
                            for (o = e == 16 ? 4 : 3, --l; l % o; l++) c += "0";
                            for (y = fo(c, i, e), l = y.length; !y[l - 1]; --l);
                            for (o = 1, c = "1."; o < l; o++) c += Ia.charAt(y[o])
                        } else c = c.charAt(0) + "." + c.slice(1);
                    c = c + (s < 0 ? "p" : "p+") + s
                } else if (s < 0) {
                    for (; ++s;) c = "0" + c;
                    c = "0." + c
                } else if (++s > l)
                    for (s -= l; s--;) c += "0";
                else s < l && (c = c.slice(0, s) + "." + c.slice(s))
            }
            c = (e == 16 ? "0x" : e == 2 ? "0b" : e == 8 ? "0o" : "") + c
        }
        return r.s < 0 ? "-" + c : c
    }

    function Uh(r, e) {
        if (r.length > e) return r.length = e, !0
    }

    function Zp(r) {
        return new this(r).abs()
    }

    function Wp(r) {
        return new this(r).acos()
    }

    function Qp(r) {
        return new this(r).acosh()
    }

    function Yp(r, e) {
        return new this(r).plus(e)
    }

    function Xp(r) {
        return new this(r).asin()
    }

    function em(r) {
        return new this(r).asinh()
    }

    function tm(r) {
        return new this(r).atan()
    }

    function rm(r) {
        return new this(r).atanh()
    }

    function nm(r, e) {
        r = new this(r), e = new this(e);
        var t, n = this.precision,
            i = this.rounding,
            s = n + 4;
        return !r.s || !e.s ? t = new this(NaN) : !r.d && !e.d ? (t = Pr(this, s, 1).times(e.s > 0 ? .25 : .75), t.s = r.s) : !e.d || r.isZero() ? (t = e.s < 0 ? Pr(this, n, i) : new this(0), t.s = r.s) : !r.d || e.isZero() ? (t = Pr(this, s, 1).times(.5), t.s = r.s) : e.s < 0 ? (this.precision = s, this.rounding = 1, t = this.atan(Et(r, e, s, 1)), e = Pr(this, s, 1), this.precision = n, this.rounding = i, t = r.s < 0 ? t.minus(e) : t.plus(e)) : t = this.atan(Et(r, e, s, 1)), t
    }

    function im(r) {
        return new this(r).cbrt()
    }

    function sm(r) {
        return ie(r = new this(r), r.e + 1, 2)
    }

    function om(r, e, t) {
        return new this(r).clamp(e, t)
    }

    function am(r) {
        if (!r || typeof r != "object") throw Error(ho + "Object expected");
        var e, t, n, i = r.defaults === !0,
            s = ["precision", 1, Cn, "rounding", 0, 8, "toExpNeg", -Ti, 0, "toExpPos", 0, Ti, "maxE", 0, Ti, "minE", -Ti, 0, "modulo", 0, 9];
        for (e = 0; e < s.length; e += 3)
            if (t = s[e], i && (this[t] = Ca[t]), (n = r[t]) !== void 0)
                if (Ht(n) === n && n >= s[e + 1] && n <= s[e + 2]) this[t] = n;
                else throw Error(Bn + t + ": " + n);
        if (t = "crypto", i && (this[t] = Ca[t]), (n = r[t]) !== void 0)
            if (n === !0 || n === !1 || n === 0 || n === 1)
                if (n)
                    if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[t] = !0;
                    else throw Error(Sh);
        else this[t] = !1;
        else throw Error(Bn + t + ": " + n);
        return this
    }

    function um(r) {
        return new this(r).cos()
    }

    function lm(r) {
        return new this(r).cosh()
    }

    function $h(r) {
        var e, t, n;

        function i(s) {
            var o, u, l, h = this;
            if (!(h instanceof i)) return new i(s);
            if (h.constructor = i, qh(s)) {
                h.s = s.s, Te ? !s.d || s.e > i.maxE ? (h.e = NaN, h.d = null) : s.e < i.minE ? (h.e = 0, h.d = [0]) : (h.e = s.e, h.d = s.d.slice()) : (h.e = s.e, h.d = s.d ? s.d.slice() : s.d);
                return
            }
            if (l = typeof s, l === "number") {
                if (s === 0) {
                    h.s = 1 / s < 0 ? -1 : 1, h.e = 0, h.d = [0];
                    return
                }
                if (s < 0 ? (s = -s, h.s = -1) : h.s = 1, s === ~~s && s < 1e7) {
                    for (o = 0, u = s; u >= 10; u /= 10) o++;
                    Te ? o > i.maxE ? (h.e = NaN, h.d = null) : o < i.minE ? (h.e = 0, h.d = [0]) : (h.e = o, h.d = [s]) : (h.e = o, h.d = [s]);
                    return
                } else if (s * 0 !== 0) {
                    s || (h.s = NaN), h.e = NaN, h.d = null;
                    return
                }
                return Fa(h, s.toString())
            } else if (l !== "string") throw Error(Bn + s);
            return (u = s.charCodeAt(0)) === 45 ? (s = s.slice(1), h.s = -1) : (u === 43 && (s = s.slice(1)), h.s = 1), Ih.test(s) ? Fa(h, s) : Jp(h, s)
        }
        if (i.prototype = $, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = am, i.clone = $h, i.isDecimal = qh, i.abs = Zp, i.acos = Wp, i.acosh = Qp, i.add = Yp, i.asin = Xp, i.asinh = em, i.atan = tm, i.atanh = rm, i.atan2 = nm, i.cbrt = im, i.ceil = sm, i.clamp = om, i.cos = um, i.cosh = lm, i.div = hm, i.exp = fm, i.floor = cm, i.hypot = dm, i.ln = pm, i.log = mm, i.log10 = ym, i.log2 = gm, i.max = vm, i.min = wm, i.mod = bm, i.mul = Am, i.pow = Em, i.random = xm, i.round = _m, i.sign = Mm, i.sin = Nm, i.sinh = Tm, i.sqrt = Pm, i.sub = km, i.sum = Sm, i.tan = Rm, i.tanh = Im, i.trunc = Cm, r === void 0 && (r = {}), r && r.defaults !== !0)
            for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], e = 0; e < n.length;) r.hasOwnProperty(t = n[e++]) || (r[t] = this[t]);
        return i.config(r), i
    }

    function hm(r, e) {
        return new this(r).div(e)
    }

    function fm(r) {
        return new this(r).exp()
    }

    function cm(r) {
        return ie(r = new this(r), r.e + 1, 3)
    }

    function dm() {
        var r, e, t = new this(0);
        for (Te = !1, r = 0; r < arguments.length;)
            if (e = new this(arguments[r++]), e.d) t.d && (t = t.plus(e.times(e)));
            else {
                if (e.s) return Te = !0, new this(1 / 0);
                t = e
            }
        return Te = !0, t.sqrt()
    }

    function qh(r) {
        return r instanceof jt || r && r.toStringTag === Rh || !1
    }

    function pm(r) {
        return new this(r).ln()
    }

    function mm(r, e) {
        return new this(r).log(e)
    }

    function gm(r) {
        return new this(r).log(2)
    }

    function ym(r) {
        return new this(r).log(10)
    }

    function vm() {
        return Fh(this, arguments, "lt")
    }

    function wm() {
        return Fh(this, arguments, "gt")
    }

    function bm(r, e) {
        return new this(r).mod(e)
    }

    function Am(r, e) {
        return new this(r).mul(e)
    }

    function Em(r, e) {
        return new this(r).pow(e)
    }

    function xm(r) {
        var e, t, n, i, s = 0,
            o = new this(1),
            u = [];
        if (r === void 0 ? r = this.precision : er(r, 1, Cn), n = Math.ceil(r / ae), this.crypto)
            if (crypto.getRandomValues)
                for (e = crypto.getRandomValues(new Uint32Array(n)); s < n;) i = e[s], i >= 429e7 ? e[s] = crypto.getRandomValues(new Uint32Array(1))[0] : u[s++] = i % 1e7;
            else if (crypto.randomBytes) {
            for (e = crypto.randomBytes(n *= 4); s < n;) i = e[s] + (e[s + 1] << 8) + (e[s + 2] << 16) + ((e[s + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(e, s) : (u.push(i % 1e7), s += 4);
            s = n / 4
        } else throw Error(Sh);
        else
            for (; s < n;) u[s++] = Math.random() * 1e7 | 0;
        for (n = u[--s], r %= ae, n && r && (i = Ot(10, ae - r), u[s] = (n / i | 0) * i); u[s] === 0; s--) u.pop();
        if (s < 0) t = 0, u = [0];
        else {
            for (t = -1; u[0] === 0; t -= ae) u.shift();
            for (n = 1, i = u[0]; i >= 10; i /= 10) n++;
            n < ae && (t -= ae - n)
        }
        return o.e = t, o.d = u, o
    }

    function _m(r) {
        return ie(r = new this(r), r.e + 1, this.rounding)
    }

    function Mm(r) {
        return r = new this(r), r.d ? r.d[0] ? r.s : 0 * r.s : r.s || NaN
    }

    function Nm(r) {
        return new this(r).sin()
    }

    function Tm(r) {
        return new this(r).sinh()
    }

    function Pm(r) {
        return new this(r).sqrt()
    }

    function km(r, e) {
        return new this(r).sub(e)
    }

    function Sm() {
        var r = 0,
            e = arguments,
            t = new this(e[r]);
        for (Te = !1; t.s && ++r < e.length;) t = t.plus(e[r]);
        return Te = !0, ie(t, this.precision, this.rounding)
    }

    function Rm(r) {
        return new this(r).tan()
    }

    function Im(r) {
        return new this(r).tanh()
    }

    function Cm(r) {
        return ie(r = new this(r), r.e + 1, 1)
    }
    $[Symbol.for("nodejs.util.inspect.custom")] = $.toString, $[Symbol.toStringTag] = "Decimal";
    var jt = $.constructor = $h(Ca);
    uo = new jt(uo), lo = new jt(lo);
    var La = {
            exports: {}
        },
        Bm = {},
        Om = Object.freeze({
            __proto__: null,
            default: Bm
        }),
        Fm = vd(Om);
    La.exports,
        function(r) {
            (function(e, t) {
                function n(p, a) {
                    if (!p) throw new Error(a || "Assertion failed")
                }

                function i(p, a) {
                    p.super_ = a;
                    var d = function() {};
                    d.prototype = a.prototype, p.prototype = new d, p.prototype.constructor = p
                }

                function s(p, a, d) {
                    if (s.isBN(p)) return p;
                    this.negative = 0, this.words = null, this.length = 0, this.red = null, p !== null && ((a === "le" || a === "be") && (d = a, a = 10), this._init(p || 0, a || 10, d || "be"))
                }
                typeof e == "object" ? e.exports = s : t.BN = s, s.BN = s, s.wordSize = 26;
                var o;
                try {
                    typeof window < "u" && typeof window.Buffer < "u" ? o = window.Buffer : o = Fm.Buffer
                } catch {}
                s.isBN = function(a) {
                    return a instanceof s ? !0 : a !== null && typeof a == "object" && a.constructor.wordSize === s.wordSize && Array.isArray(a.words)
                }, s.max = function(a, d) {
                    return a.cmp(d) > 0 ? a : d
                }, s.min = function(a, d) {
                    return a.cmp(d) < 0 ? a : d
                }, s.prototype._init = function(a, d, f) {
                    if (typeof a == "number") return this._initNumber(a, d, f);
                    if (typeof a == "object") return this._initArray(a, d, f);
                    d === "hex" && (d = 16), n(d === (d | 0) && d >= 2 && d <= 36), a = a.toString().replace(/\s+/g, "");
                    var A = 0;
                    a[0] === "-" && (A++, this.negative = 1), A < a.length && (d === 16 ? this._parseHex(a, A, f) : (this._parseBase(a, d, A), f === "le" && this._initArray(this.toArray(), d, f)))
                }, s.prototype._initNumber = function(a, d, f) {
                    a < 0 && (this.negative = 1, a = -a), a < 67108864 ? (this.words = [a & 67108863], this.length = 1) : a < 4503599627370496 ? (this.words = [a & 67108863, a / 67108864 & 67108863], this.length = 2) : (n(a < 9007199254740992), this.words = [a & 67108863, a / 67108864 & 67108863, 1], this.length = 3), f === "le" && this._initArray(this.toArray(), d, f)
                }, s.prototype._initArray = function(a, d, f) {
                    if (n(typeof a.length == "number"), a.length <= 0) return this.words = [0], this.length = 1, this;
                    this.length = Math.ceil(a.length / 3), this.words = new Array(this.length);
                    for (var A = 0; A < this.length; A++) this.words[A] = 0;
                    var E, x, k = 0;
                    if (f === "be")
                        for (A = a.length - 1, E = 0; A >= 0; A -= 3) x = a[A] | a[A - 1] << 8 | a[A - 2] << 16, this.words[E] |= x << k & 67108863, this.words[E + 1] = x >>> 26 - k & 67108863, k += 24, k >= 26 && (k -= 26, E++);
                    else if (f === "le")
                        for (A = 0, E = 0; A < a.length; A += 3) x = a[A] | a[A + 1] << 8 | a[A + 2] << 16, this.words[E] |= x << k & 67108863, this.words[E + 1] = x >>> 26 - k & 67108863, k += 24, k >= 26 && (k -= 26, E++);
                    return this._strip()
                };

                function u(p, a) {
                    var d = p.charCodeAt(a);
                    if (d >= 48 && d <= 57) return d - 48;
                    if (d >= 65 && d <= 70) return d - 55;
                    if (d >= 97 && d <= 102) return d - 87;
                    n(!1, "Invalid character in " + p)
                }

                function l(p, a, d) {
                    var f = u(p, d);
                    return d - 1 >= a && (f |= u(p, d - 1) << 4), f
                }
                s.prototype._parseHex = function(a, d, f) {
                    this.length = Math.ceil((a.length - d) / 6), this.words = new Array(this.length);
                    for (var A = 0; A < this.length; A++) this.words[A] = 0;
                    var E = 0,
                        x = 0,
                        k;
                    if (f === "be")
                        for (A = a.length - 1; A >= d; A -= 2) k = l(a, d, A) << E, this.words[x] |= k & 67108863, E >= 18 ? (E -= 18, x += 1, this.words[x] |= k >>> 26) : E += 8;
                    else {
                        var _ = a.length - d;
                        for (A = _ % 2 === 0 ? d + 1 : d; A < a.length; A += 2) k = l(a, d, A) << E, this.words[x] |= k & 67108863, E >= 18 ? (E -= 18, x += 1, this.words[x] |= k >>> 26) : E += 8
                    }
                    this._strip()
                };

                function h(p, a, d, f) {
                    for (var A = 0, E = 0, x = Math.min(p.length, d), k = a; k < x; k++) {
                        var _ = p.charCodeAt(k) - 48;
                        A *= f, _ >= 49 ? E = _ - 49 + 10 : _ >= 17 ? E = _ - 17 + 10 : E = _, n(_ >= 0 && E < f, "Invalid character"), A += E
                    }
                    return A
                }
                s.prototype._parseBase = function(a, d, f) {
                    this.words = [0], this.length = 1;
                    for (var A = 0, E = 1; E <= 67108863; E *= d) A++;
                    A--, E = E / d | 0;
                    for (var x = a.length - f, k = x % A, _ = Math.min(x, x - k) + f, g = 0, T = f; T < _; T += A) g = h(a, T, T + A, d), this.imuln(E), this.words[0] + g < 67108864 ? this.words[0] += g : this._iaddn(g);
                    if (k !== 0) {
                        var z = 1;
                        for (g = h(a, T, a.length, d), T = 0; T < k; T++) z *= d;
                        this.imuln(z), this.words[0] + g < 67108864 ? this.words[0] += g : this._iaddn(g)
                    }
                    this._strip()
                }, s.prototype.copy = function(a) {
                    a.words = new Array(this.length);
                    for (var d = 0; d < this.length; d++) a.words[d] = this.words[d];
                    a.length = this.length, a.negative = this.negative, a.red = this.red
                };

                function c(p, a) {
                    p.words = a.words, p.length = a.length, p.negative = a.negative, p.red = a.red
                }
                if (s.prototype._move = function(a) {
                        c(a, this)
                    }, s.prototype.clone = function() {
                        var a = new s(null);
                        return this.copy(a), a
                    }, s.prototype._expand = function(a) {
                        for (; this.length < a;) this.words[this.length++] = 0;
                        return this
                    }, s.prototype._strip = function() {
                        for (; this.length > 1 && this.words[this.length - 1] === 0;) this.length--;
                        return this._normSign()
                    }, s.prototype._normSign = function() {
                        return this.length === 1 && this.words[0] === 0 && (this.negative = 0), this
                    }, typeof Symbol < "u" && typeof Symbol.for == "function") try {
                    s.prototype[Symbol.for("nodejs.util.inspect.custom")] = y
                } catch {
                    s.prototype.inspect = y
                } else s.prototype.inspect = y;

                function y() {
                    return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">"
                }
                var v = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"],
                    N = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                    P = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
                s.prototype.toString = function(a, d) {
                    a = a || 10, d = d | 0 || 1;
                    var f;
                    if (a === 16 || a === "hex") {
                        f = "";
                        for (var A = 0, E = 0, x = 0; x < this.length; x++) {
                            var k = this.words[x],
                                _ = ((k << A | E) & 16777215).toString(16);
                            E = k >>> 24 - A & 16777215, A += 2, A >= 26 && (A -= 26, x--), E !== 0 || x !== this.length - 1 ? f = v[6 - _.length] + _ + f : f = _ + f
                        }
                        for (E !== 0 && (f = E.toString(16) + f); f.length % d !== 0;) f = "0" + f;
                        return this.negative !== 0 && (f = "-" + f), f
                    }
                    if (a === (a | 0) && a >= 2 && a <= 36) {
                        var g = N[a],
                            T = P[a];
                        f = "";
                        var z = this.clone();
                        for (z.negative = 0; !z.isZero();) {
                            var b = z.modrn(T).toString(a);
                            z = z.idivn(T), z.isZero() ? f = b + f : f = v[g - b.length] + b + f
                        }
                        for (this.isZero() && (f = "0" + f); f.length % d !== 0;) f = "0" + f;
                        return this.negative !== 0 && (f = "-" + f), f
                    }
                    n(!1, "Base should be between 2 and 36")
                }, s.prototype.toNumber = function() {
                    var a = this.words[0];
                    return this.length === 2 ? a += this.words[1] * 67108864 : this.length === 3 && this.words[2] === 1 ? a += 4503599627370496 + this.words[1] * 67108864 : this.length > 2 && n(!1, "Number can only safely store up to 53 bits"), this.negative !== 0 ? -a : a
                }, s.prototype.toJSON = function() {
                    return this.toString(16, 2)
                }, o && (s.prototype.toBuffer = function(a, d) {
                    return this.toArrayLike(o, a, d)
                }), s.prototype.toArray = function(a, d) {
                    return this.toArrayLike(Array, a, d)
                };
                var S = function(a, d) {
                    return a.allocUnsafe ? a.allocUnsafe(d) : new a(d)
                };
                s.prototype.toArrayLike = function(a, d, f) {
                    this._strip();
                    var A = this.byteLength(),
                        E = f || Math.max(1, A);
                    n(A <= E, "byte array longer than desired length"), n(E > 0, "Requested array length <= 0");
                    var x = S(a, E),
                        k = d === "le" ? "LE" : "BE";
                    return this["_toArrayLike" + k](x, A), x
                }, s.prototype._toArrayLikeLE = function(a, d) {
                    for (var f = 0, A = 0, E = 0, x = 0; E < this.length; E++) {
                        var k = this.words[E] << x | A;
                        a[f++] = k & 255, f < a.length && (a[f++] = k >> 8 & 255), f < a.length && (a[f++] = k >> 16 & 255), x === 6 ? (f < a.length && (a[f++] = k >> 24 & 255), A = 0, x = 0) : (A = k >>> 24, x += 2)
                    }
                    if (f < a.length)
                        for (a[f++] = A; f < a.length;) a[f++] = 0
                }, s.prototype._toArrayLikeBE = function(a, d) {
                    for (var f = a.length - 1, A = 0, E = 0, x = 0; E < this.length; E++) {
                        var k = this.words[E] << x | A;
                        a[f--] = k & 255, f >= 0 && (a[f--] = k >> 8 & 255), f >= 0 && (a[f--] = k >> 16 & 255), x === 6 ? (f >= 0 && (a[f--] = k >> 24 & 255), A = 0, x = 0) : (A = k >>> 24, x += 2)
                    }
                    if (f >= 0)
                        for (a[f--] = A; f >= 0;) a[f--] = 0
                }, Math.clz32 ? s.prototype._countBits = function(a) {
                    return 32 - Math.clz32(a)
                } : s.prototype._countBits = function(a) {
                    var d = a,
                        f = 0;
                    return d >= 4096 && (f += 13, d >>>= 13), d >= 64 && (f += 7, d >>>= 7), d >= 8 && (f += 4, d >>>= 4), d >= 2 && (f += 2, d >>>= 2), f + d
                }, s.prototype._zeroBits = function(a) {
                    if (a === 0) return 26;
                    var d = a,
                        f = 0;
                    return d & 8191 || (f += 13, d >>>= 13), d & 127 || (f += 7, d >>>= 7), d & 15 || (f += 4, d >>>= 4), d & 3 || (f += 2, d >>>= 2), d & 1 || f++, f
                }, s.prototype.bitLength = function() {
                    var a = this.words[this.length - 1],
                        d = this._countBits(a);
                    return (this.length - 1) * 26 + d
                };

                function O(p) {
                    for (var a = new Array(p.bitLength()), d = 0; d < a.length; d++) {
                        var f = d / 26 | 0,
                            A = d % 26;
                        a[d] = p.words[f] >>> A & 1
                    }
                    return a
                }
                s.prototype.zeroBits = function() {
                    if (this.isZero()) return 0;
                    for (var a = 0, d = 0; d < this.length; d++) {
                        var f = this._zeroBits(this.words[d]);
                        if (a += f, f !== 26) break
                    }
                    return a
                }, s.prototype.byteLength = function() {
                    return Math.ceil(this.bitLength() / 8)
                }, s.prototype.toTwos = function(a) {
                    return this.negative !== 0 ? this.abs().inotn(a).iaddn(1) : this.clone()
                }, s.prototype.fromTwos = function(a) {
                    return this.testn(a - 1) ? this.notn(a).iaddn(1).ineg() : this.clone()
                }, s.prototype.isNeg = function() {
                    return this.negative !== 0
                }, s.prototype.neg = function() {
                    return this.clone().ineg()
                }, s.prototype.ineg = function() {
                    return this.isZero() || (this.negative ^= 1), this
                }, s.prototype.iuor = function(a) {
                    for (; this.length < a.length;) this.words[this.length++] = 0;
                    for (var d = 0; d < a.length; d++) this.words[d] = this.words[d] | a.words[d];
                    return this._strip()
                }, s.prototype.ior = function(a) {
                    return n((this.negative | a.negative) === 0), this.iuor(a)
                }, s.prototype.or = function(a) {
                    return this.length > a.length ? this.clone().ior(a) : a.clone().ior(this)
                }, s.prototype.uor = function(a) {
                    return this.length > a.length ? this.clone().iuor(a) : a.clone().iuor(this)
                }, s.prototype.iuand = function(a) {
                    var d;
                    this.length > a.length ? d = a : d = this;
                    for (var f = 0; f < d.length; f++) this.words[f] = this.words[f] & a.words[f];
                    return this.length = d.length, this._strip()
                }, s.prototype.iand = function(a) {
                    return n((this.negative | a.negative) === 0), this.iuand(a)
                }, s.prototype.and = function(a) {
                    return this.length > a.length ? this.clone().iand(a) : a.clone().iand(this)
                }, s.prototype.uand = function(a) {
                    return this.length > a.length ? this.clone().iuand(a) : a.clone().iuand(this)
                }, s.prototype.iuxor = function(a) {
                    var d, f;
                    this.length > a.length ? (d = this, f = a) : (d = a, f = this);
                    for (var A = 0; A < f.length; A++) this.words[A] = d.words[A] ^ f.words[A];
                    if (this !== d)
                        for (; A < d.length; A++) this.words[A] = d.words[A];
                    return this.length = d.length, this._strip()
                }, s.prototype.ixor = function(a) {
                    return n((this.negative | a.negative) === 0), this.iuxor(a)
                }, s.prototype.xor = function(a) {
                    return this.length > a.length ? this.clone().ixor(a) : a.clone().ixor(this)
                }, s.prototype.uxor = function(a) {
                    return this.length > a.length ? this.clone().iuxor(a) : a.clone().iuxor(this)
                }, s.prototype.inotn = function(a) {
                    n(typeof a == "number" && a >= 0);
                    var d = Math.ceil(a / 26) | 0,
                        f = a % 26;
                    this._expand(d), f > 0 && d--;
                    for (var A = 0; A < d; A++) this.words[A] = ~this.words[A] & 67108863;
                    return f > 0 && (this.words[A] = ~this.words[A] & 67108863 >> 26 - f), this._strip()
                }, s.prototype.notn = function(a) {
                    return this.clone().inotn(a)
                }, s.prototype.setn = function(a, d) {
                    n(typeof a == "number" && a >= 0);
                    var f = a / 26 | 0,
                        A = a % 26;
                    return this._expand(f + 1), d ? this.words[f] = this.words[f] | 1 << A : this.words[f] = this.words[f] & ~(1 << A), this._strip()
                }, s.prototype.iadd = function(a) {
                    var d;
                    if (this.negative !== 0 && a.negative === 0) return this.negative = 0, d = this.isub(a), this.negative ^= 1, this._normSign();
                    if (this.negative === 0 && a.negative !== 0) return a.negative = 0, d = this.isub(a), a.negative = 1, d._normSign();
                    var f, A;
                    this.length > a.length ? (f = this, A = a) : (f = a, A = this);
                    for (var E = 0, x = 0; x < A.length; x++) d = (f.words[x] | 0) + (A.words[x] | 0) + E, this.words[x] = d & 67108863, E = d >>> 26;
                    for (; E !== 0 && x < f.length; x++) d = (f.words[x] | 0) + E, this.words[x] = d & 67108863, E = d >>> 26;
                    if (this.length = f.length, E !== 0) this.words[this.length] = E, this.length++;
                    else if (f !== this)
                        for (; x < f.length; x++) this.words[x] = f.words[x];
                    return this
                }, s.prototype.add = function(a) {
                    var d;
                    return a.negative !== 0 && this.negative === 0 ? (a.negative = 0, d = this.sub(a), a.negative ^= 1, d) : a.negative === 0 && this.negative !== 0 ? (this.negative = 0, d = a.sub(this), this.negative = 1, d) : this.length > a.length ? this.clone().iadd(a) : a.clone().iadd(this)
                }, s.prototype.isub = function(a) {
                    if (a.negative !== 0) {
                        a.negative = 0;
                        var d = this.iadd(a);
                        return a.negative = 1, d._normSign()
                    } else if (this.negative !== 0) return this.negative = 0, this.iadd(a), this.negative = 1, this._normSign();
                    var f = this.cmp(a);
                    if (f === 0) return this.negative = 0, this.length = 1, this.words[0] = 0, this;
                    var A, E;
                    f > 0 ? (A = this, E = a) : (A = a, E = this);
                    for (var x = 0, k = 0; k < E.length; k++) d = (A.words[k] | 0) - (E.words[k] | 0) + x, x = d >> 26, this.words[k] = d & 67108863;
                    for (; x !== 0 && k < A.length; k++) d = (A.words[k] | 0) + x, x = d >> 26, this.words[k] = d & 67108863;
                    if (x === 0 && k < A.length && A !== this)
                        for (; k < A.length; k++) this.words[k] = A.words[k];
                    return this.length = Math.max(this.length, k), A !== this && (this.negative = 1), this._strip()
                }, s.prototype.sub = function(a) {
                    return this.clone().isub(a)
                };

                function I(p, a, d) {
                    d.negative = a.negative ^ p.negative;
                    var f = p.length + a.length | 0;
                    d.length = f, f = f - 1 | 0;
                    var A = p.words[0] | 0,
                        E = a.words[0] | 0,
                        x = A * E,
                        k = x & 67108863,
                        _ = x / 67108864 | 0;
                    d.words[0] = k;
                    for (var g = 1; g < f; g++) {
                        for (var T = _ >>> 26, z = _ & 67108863, b = Math.min(g, a.length - 1), B = Math.max(0, g - p.length + 1); B <= b; B++) {
                            var F = g - B | 0;
                            A = p.words[F] | 0, E = a.words[B] | 0, x = A * E + z, T += x / 67108864 | 0, z = x & 67108863
                        }
                        d.words[g] = z | 0, _ = T | 0
                    }
                    return _ !== 0 ? d.words[g] = _ | 0 : d.length--, d._strip()
                }
                var C = function(a, d, f) {
                    var A = a.words,
                        E = d.words,
                        x = f.words,
                        k = 0,
                        _, g, T, z = A[0] | 0,
                        b = z & 8191,
                        B = z >>> 13,
                        F = A[1] | 0,
                        D = F & 8191,
                        j = F >>> 13,
                        Z = A[2] | 0,
                        H = Z & 8191,
                        V = Z >>> 13,
                        Me = A[3] | 0,
                        K = Me & 8191,
                        le = Me >>> 13,
                        $e = A[4] | 0,
                        he = $e & 8191,
                        qe = $e >>> 13,
                        ze = A[5] | 0,
                        fe = ze & 8191,
                        Ge = ze >>> 13,
                        He = A[6] | 0,
                        ce = He & 8191,
                        je = He >>> 13,
                        Ke = A[7] | 0,
                        de = Ke & 8191,
                        Je = Ke >>> 13,
                        Ve = A[8] | 0,
                        pe = Ve & 8191,
                        Ze = Ve >>> 13,
                        We = A[9] | 0,
                        me = We & 8191,
                        Qe = We >>> 13,
                        Ye = E[0] | 0,
                        ge = Ye & 8191,
                        Xe = Ye >>> 13,
                        et = E[1] | 0,
                        ye = et & 8191,
                        tt = et >>> 13,
                        rt = E[2] | 0,
                        ve = rt & 8191,
                        nt = rt >>> 13,
                        it = E[3] | 0,
                        we = it & 8191,
                        st = it >>> 13,
                        ot = E[4] | 0,
                        be = ot & 8191,
                        at = ot >>> 13,
                        ut = E[5] | 0,
                        Ae = ut & 8191,
                        lt = ut >>> 13,
                        ht = E[6] | 0,
                        Ee = ht & 8191,
                        ft = ht >>> 13,
                        ct = E[7] | 0,
                        xe = ct & 8191,
                        dt = ct >>> 13,
                        pt = E[8] | 0,
                        _e = pt & 8191,
                        gt = pt >>> 13,
                        Dr = E[9] | 0,
                        yt = Dr & 8191,
                        vt = Dr >>> 13;
                    f.negative = a.negative ^ d.negative, f.length = 19, _ = Math.imul(b, ge), g = Math.imul(b, Xe), g = g + Math.imul(B, ge) | 0, T = Math.imul(B, Xe);
                    var vr = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (vr >>> 26) | 0, vr &= 67108863, _ = Math.imul(D, ge), g = Math.imul(D, Xe), g = g + Math.imul(j, ge) | 0, T = Math.imul(j, Xe), _ = _ + Math.imul(b, ye) | 0, g = g + Math.imul(b, tt) | 0, g = g + Math.imul(B, ye) | 0, T = T + Math.imul(B, tt) | 0;
                    var wr = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (wr >>> 26) | 0, wr &= 67108863, _ = Math.imul(H, ge), g = Math.imul(H, Xe), g = g + Math.imul(V, ge) | 0, T = Math.imul(V, Xe), _ = _ + Math.imul(D, ye) | 0, g = g + Math.imul(D, tt) | 0, g = g + Math.imul(j, ye) | 0, T = T + Math.imul(j, tt) | 0, _ = _ + Math.imul(b, ve) | 0, g = g + Math.imul(b, nt) | 0, g = g + Math.imul(B, ve) | 0, T = T + Math.imul(B, nt) | 0;
                    var br = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (br >>> 26) | 0, br &= 67108863, _ = Math.imul(K, ge), g = Math.imul(K, Xe), g = g + Math.imul(le, ge) | 0, T = Math.imul(le, Xe), _ = _ + Math.imul(H, ye) | 0, g = g + Math.imul(H, tt) | 0, g = g + Math.imul(V, ye) | 0, T = T + Math.imul(V, tt) | 0, _ = _ + Math.imul(D, ve) | 0, g = g + Math.imul(D, nt) | 0, g = g + Math.imul(j, ve) | 0, T = T + Math.imul(j, nt) | 0, _ = _ + Math.imul(b, we) | 0, g = g + Math.imul(b, st) | 0, g = g + Math.imul(B, we) | 0, T = T + Math.imul(B, st) | 0;
                    var Ar = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (Ar >>> 26) | 0, Ar &= 67108863, _ = Math.imul(he, ge), g = Math.imul(he, Xe), g = g + Math.imul(qe, ge) | 0, T = Math.imul(qe, Xe), _ = _ + Math.imul(K, ye) | 0, g = g + Math.imul(K, tt) | 0, g = g + Math.imul(le, ye) | 0, T = T + Math.imul(le, tt) | 0, _ = _ + Math.imul(H, ve) | 0, g = g + Math.imul(H, nt) | 0, g = g + Math.imul(V, ve) | 0, T = T + Math.imul(V, nt) | 0, _ = _ + Math.imul(D, we) | 0, g = g + Math.imul(D, st) | 0, g = g + Math.imul(j, we) | 0, T = T + Math.imul(j, st) | 0, _ = _ + Math.imul(b, be) | 0, g = g + Math.imul(b, at) | 0, g = g + Math.imul(B, be) | 0, T = T + Math.imul(B, at) | 0;
                    var Er = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (Er >>> 26) | 0, Er &= 67108863, _ = Math.imul(fe, ge), g = Math.imul(fe, Xe), g = g + Math.imul(Ge, ge) | 0, T = Math.imul(Ge, Xe), _ = _ + Math.imul(he, ye) | 0, g = g + Math.imul(he, tt) | 0, g = g + Math.imul(qe, ye) | 0, T = T + Math.imul(qe, tt) | 0, _ = _ + Math.imul(K, ve) | 0, g = g + Math.imul(K, nt) | 0, g = g + Math.imul(le, ve) | 0, T = T + Math.imul(le, nt) | 0, _ = _ + Math.imul(H, we) | 0, g = g + Math.imul(H, st) | 0, g = g + Math.imul(V, we) | 0, T = T + Math.imul(V, st) | 0, _ = _ + Math.imul(D, be) | 0, g = g + Math.imul(D, at) | 0, g = g + Math.imul(j, be) | 0, T = T + Math.imul(j, at) | 0, _ = _ + Math.imul(b, Ae) | 0, g = g + Math.imul(b, lt) | 0, g = g + Math.imul(B, Ae) | 0, T = T + Math.imul(B, lt) | 0;
                    var Xn = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (Xn >>> 26) | 0, Xn &= 67108863, _ = Math.imul(ce, ge), g = Math.imul(ce, Xe), g = g + Math.imul(je, ge) | 0, T = Math.imul(je, Xe), _ = _ + Math.imul(fe, ye) | 0, g = g + Math.imul(fe, tt) | 0, g = g + Math.imul(Ge, ye) | 0, T = T + Math.imul(Ge, tt) | 0, _ = _ + Math.imul(he, ve) | 0, g = g + Math.imul(he, nt) | 0, g = g + Math.imul(qe, ve) | 0, T = T + Math.imul(qe, nt) | 0, _ = _ + Math.imul(K, we) | 0, g = g + Math.imul(K, st) | 0, g = g + Math.imul(le, we) | 0, T = T + Math.imul(le, st) | 0, _ = _ + Math.imul(H, be) | 0, g = g + Math.imul(H, at) | 0, g = g + Math.imul(V, be) | 0, T = T + Math.imul(V, at) | 0, _ = _ + Math.imul(D, Ae) | 0, g = g + Math.imul(D, lt) | 0, g = g + Math.imul(j, Ae) | 0, T = T + Math.imul(j, lt) | 0, _ = _ + Math.imul(b, Ee) | 0, g = g + Math.imul(b, ft) | 0, g = g + Math.imul(B, Ee) | 0, T = T + Math.imul(B, ft) | 0;
                    var ei = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ei >>> 26) | 0, ei &= 67108863, _ = Math.imul(de, ge), g = Math.imul(de, Xe), g = g + Math.imul(Je, ge) | 0, T = Math.imul(Je, Xe), _ = _ + Math.imul(ce, ye) | 0, g = g + Math.imul(ce, tt) | 0, g = g + Math.imul(je, ye) | 0, T = T + Math.imul(je, tt) | 0, _ = _ + Math.imul(fe, ve) | 0, g = g + Math.imul(fe, nt) | 0, g = g + Math.imul(Ge, ve) | 0, T = T + Math.imul(Ge, nt) | 0, _ = _ + Math.imul(he, we) | 0, g = g + Math.imul(he, st) | 0, g = g + Math.imul(qe, we) | 0, T = T + Math.imul(qe, st) | 0, _ = _ + Math.imul(K, be) | 0, g = g + Math.imul(K, at) | 0, g = g + Math.imul(le, be) | 0, T = T + Math.imul(le, at) | 0, _ = _ + Math.imul(H, Ae) | 0, g = g + Math.imul(H, lt) | 0, g = g + Math.imul(V, Ae) | 0, T = T + Math.imul(V, lt) | 0, _ = _ + Math.imul(D, Ee) | 0, g = g + Math.imul(D, ft) | 0, g = g + Math.imul(j, Ee) | 0, T = T + Math.imul(j, ft) | 0, _ = _ + Math.imul(b, xe) | 0, g = g + Math.imul(b, dt) | 0, g = g + Math.imul(B, xe) | 0, T = T + Math.imul(B, dt) | 0;
                    var ti = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ti >>> 26) | 0, ti &= 67108863, _ = Math.imul(pe, ge), g = Math.imul(pe, Xe), g = g + Math.imul(Ze, ge) | 0, T = Math.imul(Ze, Xe), _ = _ + Math.imul(de, ye) | 0, g = g + Math.imul(de, tt) | 0, g = g + Math.imul(Je, ye) | 0, T = T + Math.imul(Je, tt) | 0, _ = _ + Math.imul(ce, ve) | 0, g = g + Math.imul(ce, nt) | 0, g = g + Math.imul(je, ve) | 0, T = T + Math.imul(je, nt) | 0, _ = _ + Math.imul(fe, we) | 0, g = g + Math.imul(fe, st) | 0, g = g + Math.imul(Ge, we) | 0, T = T + Math.imul(Ge, st) | 0, _ = _ + Math.imul(he, be) | 0, g = g + Math.imul(he, at) | 0, g = g + Math.imul(qe, be) | 0, T = T + Math.imul(qe, at) | 0, _ = _ + Math.imul(K, Ae) | 0, g = g + Math.imul(K, lt) | 0, g = g + Math.imul(le, Ae) | 0, T = T + Math.imul(le, lt) | 0, _ = _ + Math.imul(H, Ee) | 0, g = g + Math.imul(H, ft) | 0, g = g + Math.imul(V, Ee) | 0, T = T + Math.imul(V, ft) | 0, _ = _ + Math.imul(D, xe) | 0, g = g + Math.imul(D, dt) | 0, g = g + Math.imul(j, xe) | 0, T = T + Math.imul(j, dt) | 0, _ = _ + Math.imul(b, _e) | 0, g = g + Math.imul(b, gt) | 0, g = g + Math.imul(B, _e) | 0, T = T + Math.imul(B, gt) | 0;
                    var ri = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ri >>> 26) | 0, ri &= 67108863, _ = Math.imul(me, ge), g = Math.imul(me, Xe), g = g + Math.imul(Qe, ge) | 0, T = Math.imul(Qe, Xe), _ = _ + Math.imul(pe, ye) | 0, g = g + Math.imul(pe, tt) | 0, g = g + Math.imul(Ze, ye) | 0, T = T + Math.imul(Ze, tt) | 0, _ = _ + Math.imul(de, ve) | 0, g = g + Math.imul(de, nt) | 0, g = g + Math.imul(Je, ve) | 0, T = T + Math.imul(Je, nt) | 0, _ = _ + Math.imul(ce, we) | 0, g = g + Math.imul(ce, st) | 0, g = g + Math.imul(je, we) | 0, T = T + Math.imul(je, st) | 0, _ = _ + Math.imul(fe, be) | 0, g = g + Math.imul(fe, at) | 0, g = g + Math.imul(Ge, be) | 0, T = T + Math.imul(Ge, at) | 0, _ = _ + Math.imul(he, Ae) | 0, g = g + Math.imul(he, lt) | 0, g = g + Math.imul(qe, Ae) | 0, T = T + Math.imul(qe, lt) | 0, _ = _ + Math.imul(K, Ee) | 0, g = g + Math.imul(K, ft) | 0, g = g + Math.imul(le, Ee) | 0, T = T + Math.imul(le, ft) | 0, _ = _ + Math.imul(H, xe) | 0, g = g + Math.imul(H, dt) | 0, g = g + Math.imul(V, xe) | 0, T = T + Math.imul(V, dt) | 0, _ = _ + Math.imul(D, _e) | 0, g = g + Math.imul(D, gt) | 0, g = g + Math.imul(j, _e) | 0, T = T + Math.imul(j, gt) | 0, _ = _ + Math.imul(b, yt) | 0, g = g + Math.imul(b, vt) | 0, g = g + Math.imul(B, yt) | 0, T = T + Math.imul(B, vt) | 0;
                    var ni = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ni >>> 26) | 0, ni &= 67108863, _ = Math.imul(me, ye), g = Math.imul(me, tt), g = g + Math.imul(Qe, ye) | 0, T = Math.imul(Qe, tt), _ = _ + Math.imul(pe, ve) | 0, g = g + Math.imul(pe, nt) | 0, g = g + Math.imul(Ze, ve) | 0, T = T + Math.imul(Ze, nt) | 0, _ = _ + Math.imul(de, we) | 0, g = g + Math.imul(de, st) | 0, g = g + Math.imul(Je, we) | 0, T = T + Math.imul(Je, st) | 0, _ = _ + Math.imul(ce, be) | 0, g = g + Math.imul(ce, at) | 0, g = g + Math.imul(je, be) | 0, T = T + Math.imul(je, at) | 0, _ = _ + Math.imul(fe, Ae) | 0, g = g + Math.imul(fe, lt) | 0, g = g + Math.imul(Ge, Ae) | 0, T = T + Math.imul(Ge, lt) | 0, _ = _ + Math.imul(he, Ee) | 0, g = g + Math.imul(he, ft) | 0, g = g + Math.imul(qe, Ee) | 0, T = T + Math.imul(qe, ft) | 0, _ = _ + Math.imul(K, xe) | 0, g = g + Math.imul(K, dt) | 0, g = g + Math.imul(le, xe) | 0, T = T + Math.imul(le, dt) | 0, _ = _ + Math.imul(H, _e) | 0, g = g + Math.imul(H, gt) | 0, g = g + Math.imul(V, _e) | 0, T = T + Math.imul(V, gt) | 0, _ = _ + Math.imul(D, yt) | 0, g = g + Math.imul(D, vt) | 0, g = g + Math.imul(j, yt) | 0, T = T + Math.imul(j, vt) | 0;
                    var ii = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ii >>> 26) | 0, ii &= 67108863, _ = Math.imul(me, ve), g = Math.imul(me, nt), g = g + Math.imul(Qe, ve) | 0, T = Math.imul(Qe, nt), _ = _ + Math.imul(pe, we) | 0, g = g + Math.imul(pe, st) | 0, g = g + Math.imul(Ze, we) | 0, T = T + Math.imul(Ze, st) | 0, _ = _ + Math.imul(de, be) | 0, g = g + Math.imul(de, at) | 0, g = g + Math.imul(Je, be) | 0, T = T + Math.imul(Je, at) | 0, _ = _ + Math.imul(ce, Ae) | 0, g = g + Math.imul(ce, lt) | 0, g = g + Math.imul(je, Ae) | 0, T = T + Math.imul(je, lt) | 0, _ = _ + Math.imul(fe, Ee) | 0, g = g + Math.imul(fe, ft) | 0, g = g + Math.imul(Ge, Ee) | 0, T = T + Math.imul(Ge, ft) | 0, _ = _ + Math.imul(he, xe) | 0, g = g + Math.imul(he, dt) | 0, g = g + Math.imul(qe, xe) | 0, T = T + Math.imul(qe, dt) | 0, _ = _ + Math.imul(K, _e) | 0, g = g + Math.imul(K, gt) | 0, g = g + Math.imul(le, _e) | 0, T = T + Math.imul(le, gt) | 0, _ = _ + Math.imul(H, yt) | 0, g = g + Math.imul(H, vt) | 0, g = g + Math.imul(V, yt) | 0, T = T + Math.imul(V, vt) | 0;
                    var si = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (si >>> 26) | 0, si &= 67108863, _ = Math.imul(me, we), g = Math.imul(me, st), g = g + Math.imul(Qe, we) | 0, T = Math.imul(Qe, st), _ = _ + Math.imul(pe, be) | 0, g = g + Math.imul(pe, at) | 0, g = g + Math.imul(Ze, be) | 0, T = T + Math.imul(Ze, at) | 0, _ = _ + Math.imul(de, Ae) | 0, g = g + Math.imul(de, lt) | 0, g = g + Math.imul(Je, Ae) | 0, T = T + Math.imul(Je, lt) | 0, _ = _ + Math.imul(ce, Ee) | 0, g = g + Math.imul(ce, ft) | 0, g = g + Math.imul(je, Ee) | 0, T = T + Math.imul(je, ft) | 0, _ = _ + Math.imul(fe, xe) | 0, g = g + Math.imul(fe, dt) | 0, g = g + Math.imul(Ge, xe) | 0, T = T + Math.imul(Ge, dt) | 0, _ = _ + Math.imul(he, _e) | 0, g = g + Math.imul(he, gt) | 0, g = g + Math.imul(qe, _e) | 0, T = T + Math.imul(qe, gt) | 0, _ = _ + Math.imul(K, yt) | 0, g = g + Math.imul(K, vt) | 0, g = g + Math.imul(le, yt) | 0, T = T + Math.imul(le, vt) | 0;
                    var oi = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (oi >>> 26) | 0, oi &= 67108863, _ = Math.imul(me, be), g = Math.imul(me, at), g = g + Math.imul(Qe, be) | 0, T = Math.imul(Qe, at), _ = _ + Math.imul(pe, Ae) | 0, g = g + Math.imul(pe, lt) | 0, g = g + Math.imul(Ze, Ae) | 0, T = T + Math.imul(Ze, lt) | 0, _ = _ + Math.imul(de, Ee) | 0, g = g + Math.imul(de, ft) | 0, g = g + Math.imul(Je, Ee) | 0, T = T + Math.imul(Je, ft) | 0, _ = _ + Math.imul(ce, xe) | 0, g = g + Math.imul(ce, dt) | 0, g = g + Math.imul(je, xe) | 0, T = T + Math.imul(je, dt) | 0, _ = _ + Math.imul(fe, _e) | 0, g = g + Math.imul(fe, gt) | 0, g = g + Math.imul(Ge, _e) | 0, T = T + Math.imul(Ge, gt) | 0, _ = _ + Math.imul(he, yt) | 0, g = g + Math.imul(he, vt) | 0, g = g + Math.imul(qe, yt) | 0, T = T + Math.imul(qe, vt) | 0;
                    var ai = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ai >>> 26) | 0, ai &= 67108863, _ = Math.imul(me, Ae), g = Math.imul(me, lt), g = g + Math.imul(Qe, Ae) | 0, T = Math.imul(Qe, lt), _ = _ + Math.imul(pe, Ee) | 0, g = g + Math.imul(pe, ft) | 0, g = g + Math.imul(Ze, Ee) | 0, T = T + Math.imul(Ze, ft) | 0, _ = _ + Math.imul(de, xe) | 0, g = g + Math.imul(de, dt) | 0, g = g + Math.imul(Je, xe) | 0, T = T + Math.imul(Je, dt) | 0, _ = _ + Math.imul(ce, _e) | 0, g = g + Math.imul(ce, gt) | 0, g = g + Math.imul(je, _e) | 0, T = T + Math.imul(je, gt) | 0, _ = _ + Math.imul(fe, yt) | 0, g = g + Math.imul(fe, vt) | 0, g = g + Math.imul(Ge, yt) | 0, T = T + Math.imul(Ge, vt) | 0;
                    var ui = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ui >>> 26) | 0, ui &= 67108863, _ = Math.imul(me, Ee), g = Math.imul(me, ft), g = g + Math.imul(Qe, Ee) | 0, T = Math.imul(Qe, ft), _ = _ + Math.imul(pe, xe) | 0, g = g + Math.imul(pe, dt) | 0, g = g + Math.imul(Ze, xe) | 0, T = T + Math.imul(Ze, dt) | 0, _ = _ + Math.imul(de, _e) | 0, g = g + Math.imul(de, gt) | 0, g = g + Math.imul(Je, _e) | 0, T = T + Math.imul(Je, gt) | 0, _ = _ + Math.imul(ce, yt) | 0, g = g + Math.imul(ce, vt) | 0, g = g + Math.imul(je, yt) | 0, T = T + Math.imul(je, vt) | 0;
                    var Tu = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (Tu >>> 26) | 0, Tu &= 67108863, _ = Math.imul(me, xe), g = Math.imul(me, dt), g = g + Math.imul(Qe, xe) | 0, T = Math.imul(Qe, dt), _ = _ + Math.imul(pe, _e) | 0, g = g + Math.imul(pe, gt) | 0, g = g + Math.imul(Ze, _e) | 0, T = T + Math.imul(Ze, gt) | 0, _ = _ + Math.imul(de, yt) | 0, g = g + Math.imul(de, vt) | 0, g = g + Math.imul(Je, yt) | 0, T = T + Math.imul(Je, vt) | 0;
                    var Pu = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (Pu >>> 26) | 0, Pu &= 67108863, _ = Math.imul(me, _e), g = Math.imul(me, gt), g = g + Math.imul(Qe, _e) | 0, T = Math.imul(Qe, gt), _ = _ + Math.imul(pe, yt) | 0, g = g + Math.imul(pe, vt) | 0, g = g + Math.imul(Ze, yt) | 0, T = T + Math.imul(Ze, vt) | 0;
                    var ku = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    k = (T + (g >>> 13) | 0) + (ku >>> 26) | 0, ku &= 67108863, _ = Math.imul(me, yt), g = Math.imul(me, vt), g = g + Math.imul(Qe, yt) | 0, T = Math.imul(Qe, vt);
                    var Su = (k + _ | 0) + ((g & 8191) << 13) | 0;
                    return k = (T + (g >>> 13) | 0) + (Su >>> 26) | 0, Su &= 67108863, x[0] = vr, x[1] = wr, x[2] = br, x[3] = Ar, x[4] = Er, x[5] = Xn, x[6] = ei, x[7] = ti, x[8] = ri, x[9] = ni, x[10] = ii, x[11] = si, x[12] = oi, x[13] = ai, x[14] = ui, x[15] = Tu, x[16] = Pu, x[17] = ku, x[18] = Su, k !== 0 && (x[19] = k, f.length++), f
                };
                Math.imul || (C = I);

                function R(p, a, d) {
                    d.negative = a.negative ^ p.negative, d.length = p.length + a.length;
                    for (var f = 0, A = 0, E = 0; E < d.length - 1; E++) {
                        var x = A;
                        A = 0;
                        for (var k = f & 67108863, _ = Math.min(E, a.length - 1), g = Math.max(0, E - p.length + 1); g <= _; g++) {
                            var T = E - g,
                                z = p.words[T] | 0,
                                b = a.words[g] | 0,
                                B = z * b,
                                F = B & 67108863;
                            x = x + (B / 67108864 | 0) | 0, F = F + k | 0, k = F & 67108863, x = x + (F >>> 26) | 0, A += x >>> 26, x &= 67108863
                        }
                        d.words[E] = k, f = x, x = A
                    }
                    return f !== 0 ? d.words[E] = f : d.length--, d._strip()
                }

                function G(p, a, d) {
                    return R(p, a, d)
                }
                s.prototype.mulTo = function(a, d) {
                    var f, A = this.length + a.length;
                    return this.length === 10 && a.length === 10 ? f = C(this, a, d) : A < 63 ? f = I(this, a, d) : A < 1024 ? f = R(this, a, d) : f = G(this, a, d), f
                }, s.prototype.mul = function(a) {
                    var d = new s(null);
                    return d.words = new Array(this.length + a.length), this.mulTo(a, d)
                }, s.prototype.mulf = function(a) {
                    var d = new s(null);
                    return d.words = new Array(this.length + a.length), G(this, a, d)
                }, s.prototype.imul = function(a) {
                    return this.clone().mulTo(a, this)
                }, s.prototype.imuln = function(a) {
                    var d = a < 0;
                    d && (a = -a), n(typeof a == "number"), n(a < 67108864);
                    for (var f = 0, A = 0; A < this.length; A++) {
                        var E = (this.words[A] | 0) * a,
                            x = (E & 67108863) + (f & 67108863);
                        f >>= 26, f += E / 67108864 | 0, f += x >>> 26, this.words[A] = x & 67108863
                    }
                    return f !== 0 && (this.words[A] = f, this.length++), d ? this.ineg() : this
                }, s.prototype.muln = function(a) {
                    return this.clone().imuln(a)
                }, s.prototype.sqr = function() {
                    return this.mul(this)
                }, s.prototype.isqr = function() {
                    return this.imul(this.clone())
                }, s.prototype.pow = function(a) {
                    var d = O(a);
                    if (d.length === 0) return new s(1);
                    for (var f = this, A = 0; A < d.length && d[A] === 0; A++, f = f.sqr());
                    if (++A < d.length)
                        for (var E = f.sqr(); A < d.length; A++, E = E.sqr()) d[A] !== 0 && (f = f.mul(E));
                    return f
                }, s.prototype.iushln = function(a) {
                    n(typeof a == "number" && a >= 0);
                    var d = a % 26,
                        f = (a - d) / 26,
                        A = 67108863 >>> 26 - d << 26 - d,
                        E;
                    if (d !== 0) {
                        var x = 0;
                        for (E = 0; E < this.length; E++) {
                            var k = this.words[E] & A,
                                _ = (this.words[E] | 0) - k << d;
                            this.words[E] = _ | x, x = k >>> 26 - d
                        }
                        x && (this.words[E] = x, this.length++)
                    }
                    if (f !== 0) {
                        for (E = this.length - 1; E >= 0; E--) this.words[E + f] = this.words[E];
                        for (E = 0; E < f; E++) this.words[E] = 0;
                        this.length += f
                    }
                    return this._strip()
                }, s.prototype.ishln = function(a) {
                    return n(this.negative === 0), this.iushln(a)
                }, s.prototype.iushrn = function(a, d, f) {
                    n(typeof a == "number" && a >= 0);
                    var A;
                    d ? A = (d - d % 26) / 26 : A = 0;
                    var E = a % 26,
                        x = Math.min((a - E) / 26, this.length),
                        k = 67108863 ^ 67108863 >>> E << E,
                        _ = f;
                    if (A -= x, A = Math.max(0, A), _) {
                        for (var g = 0; g < x; g++) _.words[g] = this.words[g];
                        _.length = x
                    }
                    if (x !== 0)
                        if (this.length > x)
                            for (this.length -= x, g = 0; g < this.length; g++) this.words[g] = this.words[g + x];
                        else this.words[0] = 0, this.length = 1;
                    var T = 0;
                    for (g = this.length - 1; g >= 0 && (T !== 0 || g >= A); g--) {
                        var z = this.words[g] | 0;
                        this.words[g] = T << 26 - E | z >>> E, T = z & k
                    }
                    return _ && T !== 0 && (_.words[_.length++] = T), this.length === 0 && (this.words[0] = 0, this.length = 1), this._strip()
                }, s.prototype.ishrn = function(a, d, f) {
                    return n(this.negative === 0), this.iushrn(a, d, f)
                }, s.prototype.shln = function(a) {
                    return this.clone().ishln(a)
                }, s.prototype.ushln = function(a) {
                    return this.clone().iushln(a)
                }, s.prototype.shrn = function(a) {
                    return this.clone().ishrn(a)
                }, s.prototype.ushrn = function(a) {
                    return this.clone().iushrn(a)
                }, s.prototype.testn = function(a) {
                    n(typeof a == "number" && a >= 0);
                    var d = a % 26,
                        f = (a - d) / 26,
                        A = 1 << d;
                    if (this.length <= f) return !1;
                    var E = this.words[f];
                    return !!(E & A)
                }, s.prototype.imaskn = function(a) {
                    n(typeof a == "number" && a >= 0);
                    var d = a % 26,
                        f = (a - d) / 26;
                    if (n(this.negative === 0, "imaskn works only with positive numbers"), this.length <= f) return this;
                    if (d !== 0 && f++, this.length = Math.min(f, this.length), d !== 0) {
                        var A = 67108863 ^ 67108863 >>> d << d;
                        this.words[this.length - 1] &= A
                    }
                    return this._strip()
                }, s.prototype.maskn = function(a) {
                    return this.clone().imaskn(a)
                }, s.prototype.iaddn = function(a) {
                    return n(typeof a == "number"), n(a < 67108864), a < 0 ? this.isubn(-a) : this.negative !== 0 ? this.length === 1 && (this.words[0] | 0) <= a ? (this.words[0] = a - (this.words[0] | 0), this.negative = 0, this) : (this.negative = 0, this.isubn(a), this.negative = 1, this) : this._iaddn(a)
                }, s.prototype._iaddn = function(a) {
                    this.words[0] += a;
                    for (var d = 0; d < this.length && this.words[d] >= 67108864; d++) this.words[d] -= 67108864, d === this.length - 1 ? this.words[d + 1] = 1 : this.words[d + 1]++;
                    return this.length = Math.max(this.length, d + 1), this
                }, s.prototype.isubn = function(a) {
                    if (n(typeof a == "number"), n(a < 67108864), a < 0) return this.iaddn(-a);
                    if (this.negative !== 0) return this.negative = 0, this.iaddn(a), this.negative = 1, this;
                    if (this.words[0] -= a, this.length === 1 && this.words[0] < 0) this.words[0] = -this.words[0], this.negative = 1;
                    else
                        for (var d = 0; d < this.length && this.words[d] < 0; d++) this.words[d] += 67108864, this.words[d + 1] -= 1;
                    return this._strip()
                }, s.prototype.addn = function(a) {
                    return this.clone().iaddn(a)
                }, s.prototype.subn = function(a) {
                    return this.clone().isubn(a)
                }, s.prototype.iabs = function() {
                    return this.negative = 0, this
                }, s.prototype.abs = function() {
                    return this.clone().iabs()
                }, s.prototype._ishlnsubmul = function(a, d, f) {
                    var A = a.length + f,
                        E;
                    this._expand(A);
                    var x, k = 0;
                    for (E = 0; E < a.length; E++) {
                        x = (this.words[E + f] | 0) + k;
                        var _ = (a.words[E] | 0) * d;
                        x -= _ & 67108863, k = (x >> 26) - (_ / 67108864 | 0), this.words[E + f] = x & 67108863
                    }
                    for (; E < this.length - f; E++) x = (this.words[E + f] | 0) + k, k = x >> 26, this.words[E + f] = x & 67108863;
                    if (k === 0) return this._strip();
                    for (n(k === -1), k = 0, E = 0; E < this.length; E++) x = -(this.words[E] | 0) + k, k = x >> 26, this.words[E] = x & 67108863;
                    return this.negative = 1, this._strip()
                }, s.prototype._wordDiv = function(a, d) {
                    var f = this.length - a.length,
                        A = this.clone(),
                        E = a,
                        x = E.words[E.length - 1] | 0,
                        k = this._countBits(x);
                    f = 26 - k, f !== 0 && (E = E.ushln(f), A.iushln(f), x = E.words[E.length - 1] | 0);
                    var _ = A.length - E.length,
                        g;
                    if (d !== "mod") {
                        g = new s(null), g.length = _ + 1, g.words = new Array(g.length);
                        for (var T = 0; T < g.length; T++) g.words[T] = 0
                    }
                    var z = A.clone()._ishlnsubmul(E, 1, _);
                    z.negative === 0 && (A = z, g && (g.words[_] = 1));
                    for (var b = _ - 1; b >= 0; b--) {
                        var B = (A.words[E.length + b] | 0) * 67108864 + (A.words[E.length + b - 1] | 0);
                        for (B = Math.min(B / x | 0, 67108863), A._ishlnsubmul(E, B, b); A.negative !== 0;) B--, A.negative = 0, A._ishlnsubmul(E, 1, b), A.isZero() || (A.negative ^= 1);
                        g && (g.words[b] = B)
                    }
                    return g && g._strip(), A._strip(), d !== "div" && f !== 0 && A.iushrn(f), {
                        div: g || null,
                        mod: A
                    }
                }, s.prototype.divmod = function(a, d, f) {
                    if (n(!a.isZero()), this.isZero()) return {
                        div: new s(0),
                        mod: new s(0)
                    };
                    var A, E, x;
                    return this.negative !== 0 && a.negative === 0 ? (x = this.neg().divmod(a, d), d !== "mod" && (A = x.div.neg()), d !== "div" && (E = x.mod.neg(), f && E.negative !== 0 && E.iadd(a)), {
                        div: A,
                        mod: E
                    }) : this.negative === 0 && a.negative !== 0 ? (x = this.divmod(a.neg(), d), d !== "mod" && (A = x.div.neg()), {
                        div: A,
                        mod: x.mod
                    }) : this.negative & a.negative ? (x = this.neg().divmod(a.neg(), d), d !== "div" && (E = x.mod.neg(), f && E.negative !== 0 && E.isub(a)), {
                        div: x.div,
                        mod: E
                    }) : a.length > this.length || this.cmp(a) < 0 ? {
                        div: new s(0),
                        mod: this
                    } : a.length === 1 ? d === "div" ? {
                        div: this.divn(a.words[0]),
                        mod: null
                    } : d === "mod" ? {
                        div: null,
                        mod: new s(this.modrn(a.words[0]))
                    } : {
                        div: this.divn(a.words[0]),
                        mod: new s(this.modrn(a.words[0]))
                    } : this._wordDiv(a, d)
                }, s.prototype.div = function(a) {
                    return this.divmod(a, "div", !1).div
                }, s.prototype.mod = function(a) {
                    return this.divmod(a, "mod", !1).mod
                }, s.prototype.umod = function(a) {
                    return this.divmod(a, "mod", !0).mod
                }, s.prototype.divRound = function(a) {
                    var d = this.divmod(a);
                    if (d.mod.isZero()) return d.div;
                    var f = d.div.negative !== 0 ? d.mod.isub(a) : d.mod,
                        A = a.ushrn(1),
                        E = a.andln(1),
                        x = f.cmp(A);
                    return x < 0 || E === 1 && x === 0 ? d.div : d.div.negative !== 0 ? d.div.isubn(1) : d.div.iaddn(1)
                }, s.prototype.modrn = function(a) {
                    var d = a < 0;
                    d && (a = -a), n(a <= 67108863);
                    for (var f = (1 << 26) % a, A = 0, E = this.length - 1; E >= 0; E--) A = (f * A + (this.words[E] | 0)) % a;
                    return d ? -A : A
                }, s.prototype.modn = function(a) {
                    return this.modrn(a)
                }, s.prototype.idivn = function(a) {
                    var d = a < 0;
                    d && (a = -a), n(a <= 67108863);
                    for (var f = 0, A = this.length - 1; A >= 0; A--) {
                        var E = (this.words[A] | 0) + f * 67108864;
                        this.words[A] = E / a | 0, f = E % a
                    }
                    return this._strip(), d ? this.ineg() : this
                }, s.prototype.divn = function(a) {
                    return this.clone().idivn(a)
                }, s.prototype.egcd = function(a) {
                    n(a.negative === 0), n(!a.isZero());
                    var d = this,
                        f = a.clone();
                    d.negative !== 0 ? d = d.umod(a) : d = d.clone();
                    for (var A = new s(1), E = new s(0), x = new s(0), k = new s(1), _ = 0; d.isEven() && f.isEven();) d.iushrn(1), f.iushrn(1), ++_;
                    for (var g = f.clone(), T = d.clone(); !d.isZero();) {
                        for (var z = 0, b = 1; !(d.words[0] & b) && z < 26; ++z, b <<= 1);
                        if (z > 0)
                            for (d.iushrn(z); z-- > 0;)(A.isOdd() || E.isOdd()) && (A.iadd(g), E.isub(T)), A.iushrn(1), E.iushrn(1);
                        for (var B = 0, F = 1; !(f.words[0] & F) && B < 26; ++B, F <<= 1);
                        if (B > 0)
                            for (f.iushrn(B); B-- > 0;)(x.isOdd() || k.isOdd()) && (x.iadd(g), k.isub(T)), x.iushrn(1), k.iushrn(1);
                        d.cmp(f) >= 0 ? (d.isub(f), A.isub(x), E.isub(k)) : (f.isub(d), x.isub(A), k.isub(E))
                    }
                    return {
                        a: x,
                        b: k,
                        gcd: f.iushln(_)
                    }
                }, s.prototype._invmp = function(a) {
                    n(a.negative === 0), n(!a.isZero());
                    var d = this,
                        f = a.clone();
                    d.negative !== 0 ? d = d.umod(a) : d = d.clone();
                    for (var A = new s(1), E = new s(0), x = f.clone(); d.cmpn(1) > 0 && f.cmpn(1) > 0;) {
                        for (var k = 0, _ = 1; !(d.words[0] & _) && k < 26; ++k, _ <<= 1);
                        if (k > 0)
                            for (d.iushrn(k); k-- > 0;) A.isOdd() && A.iadd(x), A.iushrn(1);
                        for (var g = 0, T = 1; !(f.words[0] & T) && g < 26; ++g, T <<= 1);
                        if (g > 0)
                            for (f.iushrn(g); g-- > 0;) E.isOdd() && E.iadd(x), E.iushrn(1);
                        d.cmp(f) >= 0 ? (d.isub(f), A.isub(E)) : (f.isub(d), E.isub(A))
                    }
                    var z;
                    return d.cmpn(1) === 0 ? z = A : z = E, z.cmpn(0) < 0 && z.iadd(a), z
                }, s.prototype.gcd = function(a) {
                    if (this.isZero()) return a.abs();
                    if (a.isZero()) return this.abs();
                    var d = this.clone(),
                        f = a.clone();
                    d.negative = 0, f.negative = 0;
                    for (var A = 0; d.isEven() && f.isEven(); A++) d.iushrn(1), f.iushrn(1);
                    do {
                        for (; d.isEven();) d.iushrn(1);
                        for (; f.isEven();) f.iushrn(1);
                        var E = d.cmp(f);
                        if (E < 0) {
                            var x = d;
                            d = f, f = x
                        } else if (E === 0 || f.cmpn(1) === 0) break;
                        d.isub(f)
                    } while (!0);
                    return f.iushln(A)
                }, s.prototype.invm = function(a) {
                    return this.egcd(a).a.umod(a)
                }, s.prototype.isEven = function() {
                    return (this.words[0] & 1) === 0
                }, s.prototype.isOdd = function() {
                    return (this.words[0] & 1) === 1
                }, s.prototype.andln = function(a) {
                    return this.words[0] & a
                }, s.prototype.bincn = function(a) {
                    n(typeof a == "number");
                    var d = a % 26,
                        f = (a - d) / 26,
                        A = 1 << d;
                    if (this.length <= f) return this._expand(f + 1), this.words[f] |= A, this;
                    for (var E = A, x = f; E !== 0 && x < this.length; x++) {
                        var k = this.words[x] | 0;
                        k += E, E = k >>> 26, k &= 67108863, this.words[x] = k
                    }
                    return E !== 0 && (this.words[x] = E, this.length++), this
                }, s.prototype.isZero = function() {
                    return this.length === 1 && this.words[0] === 0
                }, s.prototype.cmpn = function(a) {
                    var d = a < 0;
                    if (this.negative !== 0 && !d) return -1;
                    if (this.negative === 0 && d) return 1;
                    this._strip();
                    var f;
                    if (this.length > 1) f = 1;
                    else {
                        d && (a = -a), n(a <= 67108863, "Number is too big");
                        var A = this.words[0] | 0;
                        f = A === a ? 0 : A < a ? -1 : 1
                    }
                    return this.negative !== 0 ? -f | 0 : f
                }, s.prototype.cmp = function(a) {
                    if (this.negative !== 0 && a.negative === 0) return -1;
                    if (this.negative === 0 && a.negative !== 0) return 1;
                    var d = this.ucmp(a);
                    return this.negative !== 0 ? -d | 0 : d
                }, s.prototype.ucmp = function(a) {
                    if (this.length > a.length) return 1;
                    if (this.length < a.length) return -1;
                    for (var d = 0, f = this.length - 1; f >= 0; f--) {
                        var A = this.words[f] | 0,
                            E = a.words[f] | 0;
                        if (A !== E) {
                            A < E ? d = -1 : A > E && (d = 1);
                            break
                        }
                    }
                    return d
                }, s.prototype.gtn = function(a) {
                    return this.cmpn(a) === 1
                }, s.prototype.gt = function(a) {
                    return this.cmp(a) === 1
                }, s.prototype.gten = function(a) {
                    return this.cmpn(a) >= 0
                }, s.prototype.gte = function(a) {
                    return this.cmp(a) >= 0
                }, s.prototype.ltn = function(a) {
                    return this.cmpn(a) === -1
                }, s.prototype.lt = function(a) {
                    return this.cmp(a) === -1
                }, s.prototype.lten = function(a) {
                    return this.cmpn(a) <= 0
                }, s.prototype.lte = function(a) {
                    return this.cmp(a) <= 0
                }, s.prototype.eqn = function(a) {
                    return this.cmpn(a) === 0
                }, s.prototype.eq = function(a) {
                    return this.cmp(a) === 0
                }, s.red = function(a) {
                    return new w(a)
                }, s.prototype.toRed = function(a) {
                    return n(!this.red, "Already a number in reduction context"), n(this.negative === 0, "red works only with positives"), a.convertTo(this)._forceRed(a)
                }, s.prototype.fromRed = function() {
                    return n(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this)
                }, s.prototype._forceRed = function(a) {
                    return this.red = a, this
                }, s.prototype.forceRed = function(a) {
                    return n(!this.red, "Already a number in reduction context"), this._forceRed(a)
                }, s.prototype.redAdd = function(a) {
                    return n(this.red, "redAdd works only with red numbers"), this.red.add(this, a)
                }, s.prototype.redIAdd = function(a) {
                    return n(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, a)
                }, s.prototype.redSub = function(a) {
                    return n(this.red, "redSub works only with red numbers"), this.red.sub(this, a)
                }, s.prototype.redISub = function(a) {
                    return n(this.red, "redISub works only with red numbers"), this.red.isub(this, a)
                }, s.prototype.redShl = function(a) {
                    return n(this.red, "redShl works only with red numbers"), this.red.shl(this, a)
                }, s.prototype.redMul = function(a) {
                    return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, a), this.red.mul(this, a)
                }, s.prototype.redIMul = function(a) {
                    return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, a), this.red.imul(this, a)
                }, s.prototype.redSqr = function() {
                    return n(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this)
                }, s.prototype.redISqr = function() {
                    return n(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this)
                }, s.prototype.redSqrt = function() {
                    return n(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this)
                }, s.prototype.redInvm = function() {
                    return n(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this)
                }, s.prototype.redNeg = function() {
                    return n(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this)
                }, s.prototype.redPow = function(a) {
                    return n(this.red && !a.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, a)
                };
                var q = {
                    k256: null,
                    p224: null,
                    p192: null,
                    p25519: null
                };

                function J(p, a) {
                    this.name = p, this.p = new s(a, 16), this.n = this.p.bitLength(), this.k = new s(1).iushln(this.n).isub(this.p), this.tmp = this._tmp()
                }
                J.prototype._tmp = function() {
                    var a = new s(null);
                    return a.words = new Array(Math.ceil(this.n / 13)), a
                }, J.prototype.ireduce = function(a) {
                    var d = a,
                        f;
                    do this.split(d, this.tmp), d = this.imulK(d), d = d.iadd(this.tmp), f = d.bitLength(); while (f > this.n);
                    var A = f < this.n ? -1 : d.ucmp(this.p);
                    return A === 0 ? (d.words[0] = 0, d.length = 1) : A > 0 ? d.isub(this.p) : d.strip !== void 0 ? d.strip() : d._strip(), d
                }, J.prototype.split = function(a, d) {
                    a.iushrn(this.n, 0, d)
                }, J.prototype.imulK = function(a) {
                    return a.imul(this.k)
                };

                function ue() {
                    J.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f")
                }
                i(ue, J), ue.prototype.split = function(a, d) {
                    for (var f = 4194303, A = Math.min(a.length, 9), E = 0; E < A; E++) d.words[E] = a.words[E];
                    if (d.length = A, a.length <= 9) {
                        a.words[0] = 0, a.length = 1;
                        return
                    }
                    var x = a.words[9];
                    for (d.words[d.length++] = x & f, E = 10; E < a.length; E++) {
                        var k = a.words[E] | 0;
                        a.words[E - 10] = (k & f) << 4 | x >>> 22, x = k
                    }
                    x >>>= 22, a.words[E - 10] = x, x === 0 && a.length > 10 ? a.length -= 10 : a.length -= 9
                }, ue.prototype.imulK = function(a) {
                    a.words[a.length] = 0, a.words[a.length + 1] = 0, a.length += 2;
                    for (var d = 0, f = 0; f < a.length; f++) {
                        var A = a.words[f] | 0;
                        d += A * 977, a.words[f] = d & 67108863, d = A * 64 + (d / 67108864 | 0)
                    }
                    return a.words[a.length - 1] === 0 && (a.length--, a.words[a.length - 1] === 0 && a.length--), a
                };

                function W() {
                    J.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001")
                }
                i(W, J);

                function se() {
                    J.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff")
                }
                i(se, J);

                function m() {
                    J.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed")
                }
                i(m, J), m.prototype.imulK = function(a) {
                    for (var d = 0, f = 0; f < a.length; f++) {
                        var A = (a.words[f] | 0) * 19 + d,
                            E = A & 67108863;
                        A >>>= 26, a.words[f] = E, d = A
                    }
                    return d !== 0 && (a.words[a.length++] = d), a
                }, s._prime = function(a) {
                    if (q[a]) return q[a];
                    var d;
                    if (a === "k256") d = new ue;
                    else if (a === "p224") d = new W;
                    else if (a === "p192") d = new se;
                    else if (a === "p25519") d = new m;
                    else throw new Error("Unknown prime " + a);
                    return q[a] = d, d
                };

                function w(p) {
                    if (typeof p == "string") {
                        var a = s._prime(p);
                        this.m = a.p, this.prime = a
                    } else n(p.gtn(1), "modulus must be greater than 1"), this.m = p, this.prime = null
                }
                w.prototype._verify1 = function(a) {
                    n(a.negative === 0, "red works only with positives"), n(a.red, "red works only with red numbers")
                }, w.prototype._verify2 = function(a, d) {
                    n((a.negative | d.negative) === 0, "red works only with positives"), n(a.red && a.red === d.red, "red works only with red numbers")
                }, w.prototype.imod = function(a) {
                    return this.prime ? this.prime.ireduce(a)._forceRed(this) : (c(a, a.umod(this.m)._forceRed(this)), a)
                }, w.prototype.neg = function(a) {
                    return a.isZero() ? a.clone() : this.m.sub(a)._forceRed(this)
                }, w.prototype.add = function(a, d) {
                    this._verify2(a, d);
                    var f = a.add(d);
                    return f.cmp(this.m) >= 0 && f.isub(this.m), f._forceRed(this)
                }, w.prototype.iadd = function(a, d) {
                    this._verify2(a, d);
                    var f = a.iadd(d);
                    return f.cmp(this.m) >= 0 && f.isub(this.m), f
                }, w.prototype.sub = function(a, d) {
                    this._verify2(a, d);
                    var f = a.sub(d);
                    return f.cmpn(0) < 0 && f.iadd(this.m), f._forceRed(this)
                }, w.prototype.isub = function(a, d) {
                    this._verify2(a, d);
                    var f = a.isub(d);
                    return f.cmpn(0) < 0 && f.iadd(this.m), f
                }, w.prototype.shl = function(a, d) {
                    return this._verify1(a), this.imod(a.ushln(d))
                }, w.prototype.imul = function(a, d) {
                    return this._verify2(a, d), this.imod(a.imul(d))
                }, w.prototype.mul = function(a, d) {
                    return this._verify2(a, d), this.imod(a.mul(d))
                }, w.prototype.isqr = function(a) {
                    return this.imul(a, a.clone())
                }, w.prototype.sqr = function(a) {
                    return this.mul(a, a)
                }, w.prototype.sqrt = function(a) {
                    if (a.isZero()) return a.clone();
                    var d = this.m.andln(3);
                    if (n(d % 2 === 1), d === 3) {
                        var f = this.m.add(new s(1)).iushrn(2);
                        return this.pow(a, f)
                    }
                    for (var A = this.m.subn(1), E = 0; !A.isZero() && A.andln(1) === 0;) E++, A.iushrn(1);
                    n(!A.isZero());
                    var x = new s(1).toRed(this),
                        k = x.redNeg(),
                        _ = this.m.subn(1).iushrn(1),
                        g = this.m.bitLength();
                    for (g = new s(2 * g * g).toRed(this); this.pow(g, _).cmp(k) !== 0;) g.redIAdd(k);
                    for (var T = this.pow(g, A), z = this.pow(a, A.addn(1).iushrn(1)), b = this.pow(a, A), B = E; b.cmp(x) !== 0;) {
                        for (var F = b, D = 0; F.cmp(x) !== 0; D++) F = F.redSqr();
                        n(D < B);
                        var j = this.pow(T, new s(1).iushln(B - D - 1));
                        z = z.redMul(j), T = j.redSqr(), b = b.redMul(T), B = D
                    }
                    return z
                }, w.prototype.invm = function(a) {
                    var d = a._invmp(this.m);
                    return d.negative !== 0 ? (d.negative = 0, this.imod(d).redNeg()) : this.imod(d)
                }, w.prototype.pow = function(a, d) {
                    if (d.isZero()) return new s(1).toRed(this);
                    if (d.cmpn(1) === 0) return a.clone();
                    var f = 4,
                        A = new Array(1 << f);
                    A[0] = new s(1).toRed(this), A[1] = a;
                    for (var E = 2; E < A.length; E++) A[E] = this.mul(A[E - 1], a);
                    var x = A[0],
                        k = 0,
                        _ = 0,
                        g = d.bitLength() % 26;
                    for (g === 0 && (g = 26), E = d.length - 1; E >= 0; E--) {
                        for (var T = d.words[E], z = g - 1; z >= 0; z--) {
                            var b = T >> z & 1;
                            if (x !== A[0] && (x = this.sqr(x)), b === 0 && k === 0) {
                                _ = 0;
                                continue
                            }
                            k <<= 1, k |= b, _++, !(_ !== f && (E !== 0 || z !== 0)) && (x = this.mul(x, A[k]), _ = 0, k = 0)
                        }
                        g = 26
                    }
                    return x
                }, w.prototype.convertTo = function(a) {
                    var d = a.umod(this.m);
                    return d === a ? d.clone() : d
                }, w.prototype.convertFrom = function(a) {
                    var d = a.clone();
                    return d.red = null, d
                }, s.mont = function(a) {
                    return new M(a)
                };

                function M(p) {
                    w.call(this, p), this.shift = this.m.bitLength(), this.shift % 26 !== 0 && (this.shift += 26 - this.shift % 26), this.r = new s(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv)
                }
                i(M, w), M.prototype.convertTo = function(a) {
                    return this.imod(a.ushln(this.shift))
                }, M.prototype.convertFrom = function(a) {
                    var d = this.imod(a.mul(this.rinv));
                    return d.red = null, d
                }, M.prototype.imul = function(a, d) {
                    if (a.isZero() || d.isZero()) return a.words[0] = 0, a.length = 1, a;
                    var f = a.imul(d),
                        A = f.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
                        E = f.isub(A).iushrn(this.shift),
                        x = E;
                    return E.cmp(this.m) >= 0 ? x = E.isub(this.m) : E.cmpn(0) < 0 && (x = E.iadd(this.m)), x._forceRed(this)
                }, M.prototype.mul = function(a, d) {
                    if (a.isZero() || d.isZero()) return new s(0)._forceRed(this);
                    var f = a.mul(d),
                        A = f.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
                        E = f.isub(A).iushrn(this.shift),
                        x = E;
                    return E.cmp(this.m) >= 0 ? x = E.isub(this.m) : E.cmpn(0) < 0 && (x = E.iadd(this.m)), x._forceRed(this)
                }, M.prototype.invm = function(a) {
                    var d = this.imod(a._invmp(this.m).mul(this.r2));
                    return d._forceRed(this)
                }
            })(r, Ul)
        }(La);
    var Dm = La.exports,
        ke = Yi(Dm);
    const Lm = "logger/5.7.0";
    let zh = !1,
        Gh = !1;
    const go = {
        debug: 1,
        default: 2,
        info: 2,
        warning: 3,
        error: 4,
        off: 5
    };
    let Hh = go.default,
        Ua = null;

    function Um() {
        try {
            const r = [];
            if (["NFD", "NFC", "NFKD", "NFKC"].forEach(e => {
                    try {
                        if ("test".normalize(e) !== "test") throw new Error("bad normalize")
                    } catch {
                        r.push(e)
                    }
                }), r.length) throw new Error("missing " + r.join(", "));
            if (String.fromCharCode(233).normalize("NFD") !== String.fromCharCode(101, 769)) throw new Error("broken implementation")
        } catch (r) {
            return r.message
        }
        return null
    }
    const jh = Um();
    var $a;
    (function(r) {
        r.DEBUG = "DEBUG", r.INFO = "INFO", r.WARNING = "WARNING", r.ERROR = "ERROR", r.OFF = "OFF"
    })($a || ($a = {}));
    var kr;
    (function(r) {
        r.UNKNOWN_ERROR = "UNKNOWN_ERROR", r.NOT_IMPLEMENTED = "NOT_IMPLEMENTED", r.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION", r.NETWORK_ERROR = "NETWORK_ERROR", r.SERVER_ERROR = "SERVER_ERROR", r.TIMEOUT = "TIMEOUT", r.BUFFER_OVERRUN = "BUFFER_OVERRUN", r.NUMERIC_FAULT = "NUMERIC_FAULT", r.MISSING_NEW = "MISSING_NEW", r.INVALID_ARGUMENT = "INVALID_ARGUMENT", r.MISSING_ARGUMENT = "MISSING_ARGUMENT", r.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT", r.CALL_EXCEPTION = "CALL_EXCEPTION", r.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS", r.NONCE_EXPIRED = "NONCE_EXPIRED", r.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED", r.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT", r.TRANSACTION_REPLACED = "TRANSACTION_REPLACED", r.ACTION_REJECTED = "ACTION_REJECTED"
    })(kr || (kr = {}));
    const Kh = "0123456789abcdef";
    class L {
        constructor(e) {
            Object.defineProperty(this, "version", {
                enumerable: !0,
                value: e,
                writable: !1
            })
        }
        _log(e, t) {
            const n = e.toLowerCase();
            go[n] == null && this.throwArgumentError("invalid log level name", "logLevel", e), !(Hh > go[n]) && console.log.apply(console, t)
        }
        debug(...e) {
            this._log(L.levels.DEBUG, e)
        }
        info(...e) {
            this._log(L.levels.INFO, e)
        }
        warn(...e) {
            this._log(L.levels.WARNING, e)
        }
        makeError(e, t, n) {
            if (Gh) return this.makeError("censored error", t, {});
            t || (t = L.errors.UNKNOWN_ERROR), n || (n = {});
            const i = [];
            Object.keys(n).forEach(l => {
                const h = n[l];
                try {
                    if (h instanceof Uint8Array) {
                        let c = "";
                        for (let y = 0; y < h.length; y++) c += Kh[h[y] >> 4], c += Kh[h[y] & 15];
                        i.push(l + "=Uint8Array(0x" + c + ")")
                    } else i.push(l + "=" + JSON.stringify(h))
                } catch {
                    i.push(l + "=" + JSON.stringify(n[l].toString()))
                }
            }), i.push(`code=${t}`), i.push(`version=${this.version}`);
            const s = e;
            let o = "";
            switch (t) {
                case kr.NUMERIC_FAULT:
                    {
                        o = "NUMERIC_FAULT";
                        const l = e;
                        switch (l) {
                            case "overflow":
                            case "underflow":
                            case "division-by-zero":
                                o += "-" + l;
                                break;
                            case "negative-power":
                            case "negative-width":
                                o += "-unsupported";
                                break;
                            case "unbound-bitwise-result":
                                o += "-unbound-result";
                                break
                        }
                        break
                    }
                case kr.CALL_EXCEPTION:
                case kr.INSUFFICIENT_FUNDS:
                case kr.MISSING_NEW:
                case kr.NONCE_EXPIRED:
                case kr.REPLACEMENT_UNDERPRICED:
                case kr.TRANSACTION_REPLACED:
                case kr.UNPREDICTABLE_GAS_LIMIT:
                    o = t;
                    break
            }
            o && (e += " [ See: https://links.ethers.org/v5-errors-" + o + " ]"), i.length && (e += " (" + i.join(", ") + ")");
            const u = new Error(e);
            return u.reason = s, u.code = t, Object.keys(n).forEach(function(l) {
                u[l] = n[l]
            }), u
        }
        throwError(e, t, n) {
            throw this.makeError(e, t, n)
        }
        throwArgumentError(e, t, n) {
            return this.throwError(e, L.errors.INVALID_ARGUMENT, {
                argument: t,
                value: n
            })
        }
        assert(e, t, n, i) {
            e || this.throwError(t, n, i)
        }
        assertArgument(e, t, n, i) {
            e || this.throwArgumentError(t, n, i)
        }
        checkNormalize(e) {
            jh && this.throwError("platform missing String.prototype.normalize", L.errors.UNSUPPORTED_OPERATION, {
                operation: "String.prototype.normalize",
                form: jh
            })
        }
        checkSafeUint53(e, t) {
            typeof e == "number" && (t == null && (t = "value not safe"), (e < 0 || e >= 9007199254740991) && this.throwError(t, L.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: e
            }), e % 1 && this.throwError(t, L.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: e
            }))
        }
        checkArgumentCount(e, t, n) {
            n ? n = ": " + n : n = "", e < t && this.throwError("missing argument" + n, L.errors.MISSING_ARGUMENT, {
                count: e,
                expectedCount: t
            }), e > t && this.throwError("too many arguments" + n, L.errors.UNEXPECTED_ARGUMENT, {
                count: e,
                expectedCount: t
            })
        }
        checkNew(e, t) {
            (e === Object || e == null) && this.throwError("missing new", L.errors.MISSING_NEW, {
                name: t.name
            })
        }
        checkAbstract(e, t) {
            e === t ? this.throwError("cannot instantiate abstract class " + JSON.stringify(t.name) + " directly; use a sub-class", L.errors.UNSUPPORTED_OPERATION, {
                name: e.name,
                operation: "new"
            }) : (e === Object || e == null) && this.throwError("missing new", L.errors.MISSING_NEW, {
                name: t.name
            })
        }
        static globalLogger() {
            return Ua || (Ua = new L(Lm)), Ua
        }
        static setCensorship(e, t) {
            if (!e && t && this.globalLogger().throwError("cannot permanently disable censorship", L.errors.UNSUPPORTED_OPERATION, {
                    operation: "setCensorship"
                }), zh) {
                if (!e) return;
                this.globalLogger().throwError("error censorship permanent", L.errors.UNSUPPORTED_OPERATION, {
                    operation: "setCensorship"
                })
            }
            Gh = !!e, zh = !!t
        }
        static setLogLevel(e) {
            const t = go[e.toLowerCase()];
            if (t == null) {
                L.globalLogger().warn("invalid log level - " + e);
                return
            }
            Hh = t
        }
        static from(e) {
            return new L(e)
        }
    }
    L.errors = kr, L.levels = $a;
    const $m = "bytes/5.7.0",
        Pt = new L($m);

    function Jh(r) {
        return !!r.toHexString
    }

    function ki(r) {
        return r.slice || (r.slice = function() {
            const e = Array.prototype.slice.call(arguments);
            return ki(new Uint8Array(Array.prototype.slice.apply(r, e)))
        }), r
    }

    function qa(r) {
        return xt(r) && !(r.length % 2) || yo(r)
    }

    function Vh(r) {
        return typeof r == "number" && r == r && r % 1 === 0
    }

    function yo(r) {
        if (r == null) return !1;
        if (r.constructor === Uint8Array) return !0;
        if (typeof r == "string" || !Vh(r.length) || r.length < 0) return !1;
        for (let e = 0; e < r.length; e++) {
            const t = r[e];
            if (!Vh(t) || t < 0 || t >= 256) return !1
        }
        return !0
    }

    function Ie(r, e) {
        if (e || (e = {}), typeof r == "number") {
            Pt.checkSafeUint53(r, "invalid arrayify value");
            const t = [];
            for (; r;) t.unshift(r & 255), r = parseInt(String(r / 256));
            return t.length === 0 && t.push(0), ki(new Uint8Array(t))
        }
        if (e.allowMissingPrefix && typeof r == "string" && r.substring(0, 2) !== "0x" && (r = "0x" + r), Jh(r) && (r = r.toHexString()), xt(r)) {
            let t = r.substring(2);
            t.length % 2 && (e.hexPad === "left" ? t = "0" + t : e.hexPad === "right" ? t += "0" : Pt.throwArgumentError("hex data is odd-length", "value", r));
            const n = [];
            for (let i = 0; i < t.length; i += 2) n.push(parseInt(t.substring(i, i + 2), 16));
            return ki(new Uint8Array(n))
        }
        return yo(r) ? ki(new Uint8Array(r)) : Pt.throwArgumentError("invalid arrayify value", "value", r)
    }

    function Vn(r) {
        const e = r.map(i => Ie(i)),
            t = e.reduce((i, s) => i + s.length, 0),
            n = new Uint8Array(t);
        return e.reduce((i, s) => (n.set(s, i), i + s.length), 0), ki(n)
    }

    function Si(r) {
        let e = Ie(r);
        if (e.length === 0) return e;
        let t = 0;
        for (; t < e.length && e[t] === 0;) t++;
        return t && (e = e.slice(t)), e
    }

    function qm(r, e) {
        r = Ie(r), r.length > e && Pt.throwArgumentError("value out of range", "value", arguments[0]);
        const t = new Uint8Array(e);
        return t.set(r, e - r.length), ki(t)
    }

    function xt(r, e) {
        return !(typeof r != "string" || !r.match(/^0x[0-9A-Fa-f]*$/) || e && r.length !== 2 + 2 * e)
    }
    const za = "0123456789abcdef";

    function Se(r, e) {
        if (e || (e = {}), typeof r == "number") {
            Pt.checkSafeUint53(r, "invalid hexlify value");
            let t = "";
            for (; r;) t = za[r & 15] + t, r = Math.floor(r / 16);
            return t.length ? (t.length % 2 && (t = "0" + t), "0x" + t) : "0x00"
        }
        if (typeof r == "bigint") return r = r.toString(16), r.length % 2 ? "0x0" + r : "0x" + r;
        if (e.allowMissingPrefix && typeof r == "string" && r.substring(0, 2) !== "0x" && (r = "0x" + r), Jh(r)) return r.toHexString();
        if (xt(r)) return r.length % 2 && (e.hexPad === "left" ? r = "0x0" + r.substring(2) : e.hexPad === "right" ? r += "0" : Pt.throwArgumentError("hex data is odd-length", "value", r)), r.toLowerCase();
        if (yo(r)) {
            let t = "0x";
            for (let n = 0; n < r.length; n++) {
                let i = r[n];
                t += za[(i & 240) >> 4] + za[i & 15]
            }
            return t
        }
        return Pt.throwArgumentError("invalid hexlify value", "value", r)
    }

    function Zn(r) {
        if (typeof r != "string") r = Se(r);
        else if (!xt(r) || r.length % 2) return null;
        return (r.length - 2) / 2
    }

    function Wt(r, e, t) {
        return typeof r != "string" ? r = Se(r) : (!xt(r) || r.length % 2) && Pt.throwArgumentError("invalid hexData", "value", r), e = 2 + 2 * e, t != null ? "0x" + r.substring(e, 2 + 2 * t) : "0x" + r.substring(e)
    }

    function or(r) {
        let e = "0x";
        return r.forEach(t => {
            e += Se(t).substring(2)
        }), e
    }

    function Ga(r) {
        const e = zm(Se(r, {
            hexPad: "left"
        }));
        return e === "0x" ? "0x0" : e
    }

    function zm(r) {
        typeof r != "string" && (r = Se(r)), xt(r) || Pt.throwArgumentError("invalid hex string", "value", r), r = r.substring(2);
        let e = 0;
        for (; e < r.length && r[e] === "0";) e++;
        return "0x" + r.substring(e)
    }

    function Rt(r, e) {
        for (typeof r != "string" ? r = Se(r) : xt(r) || Pt.throwArgumentError("invalid hex string", "value", r), r.length > 2 * e + 2 && Pt.throwArgumentError("value out of range", "value", arguments[1]); r.length < 2 * e + 2;) r = "0x0" + r.substring(2);
        return r
    }

    function vo(r) {
        const e = {
            r: "0x",
            s: "0x",
            _vs: "0x",
            recoveryParam: 0,
            v: 0,
            yParityAndS: "0x",
            compact: "0x"
        };
        if (qa(r)) {
            let t = Ie(r);
            t.length === 64 ? (e.v = 27 + (t[32] >> 7), t[32] &= 127, e.r = Se(t.slice(0, 32)), e.s = Se(t.slice(32, 64))) : t.length === 65 ? (e.r = Se(t.slice(0, 32)), e.s = Se(t.slice(32, 64)), e.v = t[64]) : Pt.throwArgumentError("invalid signature string", "signature", r), e.v < 27 && (e.v === 0 || e.v === 1 ? e.v += 27 : Pt.throwArgumentError("signature invalid v byte", "signature", r)), e.recoveryParam = 1 - e.v % 2, e.recoveryParam && (t[32] |= 128), e._vs = Se(t.slice(32, 64))
        } else {
            if (e.r = r.r, e.s = r.s, e.v = r.v, e.recoveryParam = r.recoveryParam, e._vs = r._vs, e._vs != null) {
                const i = qm(Ie(e._vs), 32);
                e._vs = Se(i);
                const s = i[0] >= 128 ? 1 : 0;
                e.recoveryParam == null ? e.recoveryParam = s : e.recoveryParam !== s && Pt.throwArgumentError("signature recoveryParam mismatch _vs", "signature", r), i[0] &= 127;
                const o = Se(i);
                e.s == null ? e.s = o : e.s !== o && Pt.throwArgumentError("signature v mismatch _vs", "signature", r)
            }
            if (e.recoveryParam == null) e.v == null ? Pt.throwArgumentError("signature missing v and recoveryParam", "signature", r) : e.v === 0 || e.v === 1 ? e.recoveryParam = e.v : e.recoveryParam = 1 - e.v % 2;
            else if (e.v == null) e.v = 27 + e.recoveryParam;
            else {
                const i = e.v === 0 || e.v === 1 ? e.v : 1 - e.v % 2;
                e.recoveryParam !== i && Pt.throwArgumentError("signature recoveryParam mismatch v", "signature", r)
            }
            e.r == null || !xt(e.r) ? Pt.throwArgumentError("signature missing or invalid r", "signature", r) : e.r = Rt(e.r, 32), e.s == null || !xt(e.s) ? Pt.throwArgumentError("signature missing or invalid s", "signature", r) : e.s = Rt(e.s, 32);
            const t = Ie(e.s);
            t[0] >= 128 && Pt.throwArgumentError("signature s out of range", "signature", r), e.recoveryParam && (t[0] |= 128);
            const n = Se(t);
            e._vs && (xt(e._vs) || Pt.throwArgumentError("signature invalid _vs", "signature", r), e._vs = Rt(e._vs, 32)), e._vs == null ? e._vs = n : e._vs !== n && Pt.throwArgumentError("signature _vs mismatch v and s", "signature", r)
        }
        return e.yParityAndS = e._vs, e.compact = e.r + e.yParityAndS.substring(2), e
    }
    const Gm = "bignumber/5.7.0";
    var wo = ke.BN;
    const gn = new L(Gm),
        Ha = {},
        Zh = 9007199254740991;
    let Wh = !1;
    class re {
        constructor(e, t) {
            e !== Ha && gn.throwError("cannot call constructor directly; use BigNumber.from", L.errors.UNSUPPORTED_OPERATION, {
                operation: "new (BigNumber)"
            }), this._hex = t, this._isBigNumber = !0, Object.freeze(this)
        }
        fromTwos(e) {
            return tr(Fe(this).fromTwos(e))
        }
        toTwos(e) {
            return tr(Fe(this).toTwos(e))
        }
        abs() {
            return this._hex[0] === "-" ? re.from(this._hex.substring(1)) : this
        }
        add(e) {
            return tr(Fe(this).add(Fe(e)))
        }
        sub(e) {
            return tr(Fe(this).sub(Fe(e)))
        }
        div(e) {
            return re.from(e).isZero() && pr("division-by-zero", "div"), tr(Fe(this).div(Fe(e)))
        }
        mul(e) {
            return tr(Fe(this).mul(Fe(e)))
        }
        mod(e) {
            const t = Fe(e);
            return t.isNeg() && pr("division-by-zero", "mod"), tr(Fe(this).umod(t))
        }
        pow(e) {
            const t = Fe(e);
            return t.isNeg() && pr("negative-power", "pow"), tr(Fe(this).pow(t))
        }
        and(e) {
            const t = Fe(e);
            return (this.isNegative() || t.isNeg()) && pr("unbound-bitwise-result", "and"), tr(Fe(this).and(t))
        }
        or(e) {
            const t = Fe(e);
            return (this.isNegative() || t.isNeg()) && pr("unbound-bitwise-result", "or"), tr(Fe(this).or(t))
        }
        xor(e) {
            const t = Fe(e);
            return (this.isNegative() || t.isNeg()) && pr("unbound-bitwise-result", "xor"), tr(Fe(this).xor(t))
        }
        mask(e) {
            return (this.isNegative() || e < 0) && pr("negative-width", "mask"), tr(Fe(this).maskn(e))
        }
        shl(e) {
            return (this.isNegative() || e < 0) && pr("negative-width", "shl"), tr(Fe(this).shln(e))
        }
        shr(e) {
            return (this.isNegative() || e < 0) && pr("negative-width", "shr"), tr(Fe(this).shrn(e))
        }
        eq(e) {
            return Fe(this).eq(Fe(e))
        }
        lt(e) {
            return Fe(this).lt(Fe(e))
        }
        lte(e) {
            return Fe(this).lte(Fe(e))
        }
        gt(e) {
            return Fe(this).gt(Fe(e))
        }
        gte(e) {
            return Fe(this).gte(Fe(e))
        }
        isNegative() {
            return this._hex[0] === "-"
        }
        isZero() {
            return Fe(this).isZero()
        }
        toNumber() {
            try {
                return Fe(this).toNumber()
            } catch {
                pr("overflow", "toNumber", this.toString())
            }
            return null
        }
        toBigInt() {
            try {
                return BigInt(this.toString())
            } catch {}
            return gn.throwError("this platform does not support BigInt", L.errors.UNSUPPORTED_OPERATION, {
                value: this.toString()
            })
        }
        toString() {
            return arguments.length > 0 && (arguments[0] === 10 ? Wh || (Wh = !0, gn.warn("BigNumber.toString does not accept any parameters; base-10 is assumed")) : arguments[0] === 16 ? gn.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", L.errors.UNEXPECTED_ARGUMENT, {}) : gn.throwError("BigNumber.toString does not accept parameters", L.errors.UNEXPECTED_ARGUMENT, {})), Fe(this).toString(10)
        }
        toHexString() {
            return this._hex
        }
        toJSON(e) {
            return {
                type: "BigNumber",
                hex: this.toHexString()
            }
        }
        static from(e) {
            if (e instanceof re) return e;
            if (typeof e == "string") return e.match(/^-?0x[0-9a-f]+$/i) ? new re(Ha, hs(e)) : e.match(/^-?[0-9]+$/) ? new re(Ha, hs(new wo(e))) : gn.throwArgumentError("invalid BigNumber string", "value", e);
            if (typeof e == "number") return e % 1 && pr("underflow", "BigNumber.from", e), (e >= Zh || e <= -Zh) && pr("overflow", "BigNumber.from", e), re.from(String(e));
            const t = e;
            if (typeof t == "bigint") return re.from(t.toString());
            if (yo(t)) return re.from(Se(t));
            if (t)
                if (t.toHexString) {
                    const n = t.toHexString();
                    if (typeof n == "string") return re.from(n)
                } else {
                    let n = t._hex;
                    if (n == null && t.type === "BigNumber" && (n = t.hex), typeof n == "string" && (xt(n) || n[0] === "-" && xt(n.substring(1)))) return re.from(n)
                }
            return gn.throwArgumentError("invalid BigNumber value", "value", e)
        }
        static isBigNumber(e) {
            return !!(e && e._isBigNumber)
        }
    }

    function hs(r) {
        if (typeof r != "string") return hs(r.toString(16));
        if (r[0] === "-") return r = r.substring(1), r[0] === "-" && gn.throwArgumentError("invalid hex", "value", r), r = hs(r), r === "0x00" ? r : "-" + r;
        if (r.substring(0, 2) !== "0x" && (r = "0x" + r), r === "0x") return "0x00";
        for (r.length % 2 && (r = "0x0" + r.substring(2)); r.length > 4 && r.substring(0, 4) === "0x00";) r = "0x" + r.substring(4);
        return r
    }

    function tr(r) {
        return re.from(hs(r))
    }

    function Fe(r) {
        const e = re.from(r).toHexString();
        return e[0] === "-" ? new wo("-" + e.substring(3), 16) : new wo(e.substring(2), 16)
    }

    function pr(r, e, t) {
        const n = {
            fault: r,
            operation: e
        };
        return t != null && (n.value = t), gn.throwError(r, L.errors.NUMERIC_FAULT, n)
    }

    function Hm(r) {
        return new wo(r, 36).toString(16)
    }
    const jm = "properties/5.7.0";
    var Km = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const bo = new L(jm);

    function Ue(r, e, t) {
        Object.defineProperty(r, e, {
            enumerable: !0,
            value: t,
            writable: !1
        })
    }

    function fs(r, e) {
        for (let t = 0; t < 32; t++) {
            if (r[e]) return r[e];
            if (!r.prototype || typeof r.prototype != "object") break;
            r = Object.getPrototypeOf(r.prototype).constructor
        }
        return null
    }

    function $t(r) {
        return Km(this, void 0, void 0, function*() {
            const e = Object.keys(r).map(n => {
                const i = r[n];
                return Promise.resolve(i).then(s => ({
                    key: n,
                    value: s
                }))
            });
            return (yield Promise.all(e)).reduce((n, i) => (n[i.key] = i.value, n), {})
        })
    }

    function Jm(r, e) {
        (!r || typeof r != "object") && bo.throwArgumentError("invalid object", "object", r), Object.keys(r).forEach(t => {
            e[t] || bo.throwArgumentError("invalid object key - " + t, "transaction:" + t, r)
        })
    }

    function rr(r) {
        const e = {};
        for (const t in r) e[t] = r[t];
        return e
    }
    const Vm = {
        bigint: !0,
        boolean: !0,
        function: !0,
        number: !0,
        string: !0
    };

    function Qh(r) {
        if (r == null || Vm[typeof r]) return !0;
        if (Array.isArray(r) || typeof r == "object") {
            if (!Object.isFrozen(r)) return !1;
            const e = Object.keys(r);
            for (let t = 0; t < e.length; t++) {
                let n = null;
                try {
                    n = r[e[t]]
                } catch {
                    continue
                }
                if (!Qh(n)) return !1
            }
            return !0
        }
        return bo.throwArgumentError(`Cannot deepCopy ${typeof r}`, "object", r)
    }

    function Zm(r) {
        if (Qh(r)) return r;
        if (Array.isArray(r)) return Object.freeze(r.map(e => cs(e)));
        if (typeof r == "object") {
            const e = {};
            for (const t in r) {
                const n = r[t];
                n !== void 0 && Ue(e, t, cs(n))
            }
            return e
        }
        return bo.throwArgumentError(`Cannot deepCopy ${typeof r}`, "object", r)
    }

    function cs(r) {
        return Zm(r)
    }
    class Wm {
        constructor(e) {
            for (const t in e) this[t] = cs(e[t])
        }
    }
    const Qm = "abstract-provider/5.7.0";
    var Ym = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const Xm = new L(Qm);
    class eg extends Wm {
        static isForkEvent(e) {
            return !!(e && e._isForkEvent)
        }
    }
    class ja {
        constructor() {
            Xm.checkAbstract(new.target, ja), Ue(this, "_isProvider", !0)
        }
        getFeeData() {
            return Ym(this, void 0, void 0, function*() {
                const {
                    block: e,
                    gasPrice: t
                } = yield $t({
                    block: this.getBlock("latest"),
                    gasPrice: this.getGasPrice().catch(o => null)
                });
                let n = null,
                    i = null,
                    s = null;
                return e && e.baseFeePerGas && (n = e.baseFeePerGas, s = re.from("1500000000"), i = e.baseFeePerGas.mul(2).add(s)), {
                    lastBaseFeePerGas: n,
                    maxFeePerGas: i,
                    maxPriorityFeePerGas: s,
                    gasPrice: t
                }
            })
        }
        addListener(e, t) {
            return this.on(e, t)
        }
        removeListener(e, t) {
            return this.off(e, t)
        }
        static isProvider(e) {
            return !!(e && e._isProvider)
        }
    }
    const tg = "networks/5.7.1",
        Yh = new L(tg);

    function rg(r) {
        return r && typeof r.renetwork == "function"
    }

    function yn(r) {
        const e = function(t, n) {
            n == null && (n = {});
            const i = [];
            if (t.InfuraProvider && n.infura !== "-") try {
                i.push(new t.InfuraProvider(r, n.infura))
            } catch {}
            if (t.EtherscanProvider && n.etherscan !== "-") try {
                i.push(new t.EtherscanProvider(r, n.etherscan))
            } catch {}
            if (t.AlchemyProvider && n.alchemy !== "-") try {
                i.push(new t.AlchemyProvider(r, n.alchemy))
            } catch {}
            if (t.PocketProvider && n.pocket !== "-") {
                const s = ["goerli", "ropsten", "rinkeby", "sepolia"];
                try {
                    const o = new t.PocketProvider(r, n.pocket);
                    o.network && s.indexOf(o.network.name) === -1 && i.push(o)
                } catch {}
            }
            if (t.CloudflareProvider && n.cloudflare !== "-") try {
                i.push(new t.CloudflareProvider(r))
            } catch {}
            if (t.AnkrProvider && n.ankr !== "-") try {
                const s = ["ropsten"],
                    o = new t.AnkrProvider(r, n.ankr);
                o.network && s.indexOf(o.network.name) === -1 && i.push(o)
            } catch {}
            if (i.length === 0) return null;
            if (t.FallbackProvider) {
                let s = 1;
                return n.quorum != null ? s = n.quorum : r === "homestead" && (s = 2), new t.FallbackProvider(i, s)
            }
            return i[0]
        };
        return e.renetwork = function(t) {
            return yn(t)
        }, e
    }

    function Ao(r, e) {
        const t = function(n, i) {
            return n.JsonRpcProvider ? new n.JsonRpcProvider(r, e) : null
        };
        return t.renetwork = function(n) {
            return Ao(r, n)
        }, t
    }
    const Xh = {
            chainId: 1,
            ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
            name: "homestead",
            _defaultProvider: yn("homestead")
        },
        ef = {
            chainId: 3,
            ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
            name: "ropsten",
            _defaultProvider: yn("ropsten")
        },
        tf = {
            chainId: 63,
            name: "classicMordor",
            _defaultProvider: Ao("https://www.ethercluster.com/mordor", "classicMordor")
        },
        Eo = {
            unspecified: {
                chainId: 0,
                name: "unspecified"
            },
            homestead: Xh,
            mainnet: Xh,
            morden: {
                chainId: 2,
                name: "morden"
            },
            ropsten: ef,
            testnet: ef,
            rinkeby: {
                chainId: 4,
                ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
                name: "rinkeby",
                _defaultProvider: yn("rinkeby")
            },
            kovan: {
                chainId: 42,
                name: "kovan",
                _defaultProvider: yn("kovan")
            },
            goerli: {
                chainId: 5,
                ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
                name: "goerli",
                _defaultProvider: yn("goerli")
            },
            kintsugi: {
                chainId: 1337702,
                name: "kintsugi"
            },
            sepolia: {
                chainId: 11155111,
                name: "sepolia",
                _defaultProvider: yn("sepolia")
            },
            classic: {
                chainId: 61,
                name: "classic",
                _defaultProvider: Ao("https://www.ethercluster.com/etc", "classic")
            },
            classicMorden: {
                chainId: 62,
                name: "classicMorden"
            },
            classicMordor: tf,
            classicTestnet: tf,
            classicKotti: {
                chainId: 6,
                name: "classicKotti",
                _defaultProvider: Ao("https://www.ethercluster.com/kotti", "classicKotti")
            },
            xdai: {
                chainId: 100,
                name: "xdai"
            },
            matic: {
                chainId: 137,
                name: "matic",
                _defaultProvider: yn("matic")
            },
            maticmum: {
                chainId: 80001,
                name: "maticmum"
            },
            optimism: {
                chainId: 10,
                name: "optimism",
                _defaultProvider: yn("optimism")
            },
            "optimism-kovan": {
                chainId: 69,
                name: "optimism-kovan"
            },
            "optimism-goerli": {
                chainId: 420,
                name: "optimism-goerli"
            },
            arbitrum: {
                chainId: 42161,
                name: "arbitrum"
            },
            "arbitrum-rinkeby": {
                chainId: 421611,
                name: "arbitrum-rinkeby"
            },
            "arbitrum-goerli": {
                chainId: 421613,
                name: "arbitrum-goerli"
            },
            bnb: {
                chainId: 56,
                name: "bnb"
            },
            bnbt: {
                chainId: 97,
                name: "bnbt"
            }
        };

    function ng(r) {
        if (r == null) return null;
        if (typeof r == "number") {
            for (const n in Eo) {
                const i = Eo[n];
                if (i.chainId === r) return {
                    name: i.name,
                    chainId: i.chainId,
                    ensAddress: i.ensAddress || null,
                    _defaultProvider: i._defaultProvider || null
                }
            }
            return {
                chainId: r,
                name: "unknown"
            }
        }
        if (typeof r == "string") {
            const n = Eo[r];
            return n == null ? null : {
                name: n.name,
                chainId: n.chainId,
                ensAddress: n.ensAddress,
                _defaultProvider: n._defaultProvider || null
            }
        }
        const e = Eo[r.name];
        if (!e) return typeof r.chainId != "number" && Yh.throwArgumentError("invalid network chainId", "network", r), r;
        r.chainId !== 0 && r.chainId !== e.chainId && Yh.throwArgumentError("network chainId mismatch", "network", r);
        let t = r._defaultProvider || null;
        return t == null && e._defaultProvider && (rg(e._defaultProvider) ? t = e._defaultProvider.renetwork(r) : t = e._defaultProvider), {
            name: r.name,
            chainId: e.chainId,
            ensAddress: r.ensAddress || e.ensAddress || null,
            _defaultProvider: t
        }
    }

    function rf(r) {
        r = atob(r);
        const e = [];
        for (let t = 0; t < r.length; t++) e.push(r.charCodeAt(t));
        return Ie(e)
    }

    function nf(r) {
        r = Ie(r);
        let e = "";
        for (let t = 0; t < r.length; t++) e += String.fromCharCode(r[t]);
        return btoa(e)
    }
    class sf {
        constructor(e) {
            Ue(this, "alphabet", e), Ue(this, "base", e.length), Ue(this, "_alphabetMap", {}), Ue(this, "_leader", e.charAt(0));
            for (let t = 0; t < e.length; t++) this._alphabetMap[e.charAt(t)] = t
        }
        encode(e) {
            let t = Ie(e);
            if (t.length === 0) return "";
            let n = [0];
            for (let s = 0; s < t.length; ++s) {
                let o = t[s];
                for (let u = 0; u < n.length; ++u) o += n[u] << 8, n[u] = o % this.base, o = o / this.base | 0;
                for (; o > 0;) n.push(o % this.base), o = o / this.base | 0
            }
            let i = "";
            for (let s = 0; t[s] === 0 && s < t.length - 1; ++s) i += this._leader;
            for (let s = n.length - 1; s >= 0; --s) i += this.alphabet[n[s]];
            return i
        }
        decode(e) {
            if (typeof e != "string") throw new TypeError("Expected String");
            let t = [];
            if (e.length === 0) return new Uint8Array(t);
            t.push(0);
            for (let n = 0; n < e.length; n++) {
                let i = this._alphabetMap[e[n]];
                if (i === void 0) throw new Error("Non-base" + this.base + " character");
                let s = i;
                for (let o = 0; o < t.length; ++o) s += t[o] * this.base, t[o] = s & 255, s >>= 8;
                for (; s > 0;) t.push(s & 255), s >>= 8
            }
            for (let n = 0; e[n] === this._leader && n < e.length - 1; ++n) t.push(0);
            return Ie(new Uint8Array(t.reverse()))
        }
    }
    new sf("abcdefghijklmnopqrstuvwxyz234567");
    const Ka = new sf("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"),
        ig = "0x0000000000000000000000000000000000000000",
        sg = re.from(0),
        og = "0x0000000000000000000000000000000000000000000000000000000000000000";
    var of = {
        exports: {}
    };
    /**
     * [js-sha3]{@link https://github.com/emn178/js-sha3}
     *
     * @version 0.8.0
     * @author Chen, Yi-Cyuan [emn178@gmail.com]
     * @copyright Chen, Yi-Cyuan 2015-2018
     * @license MIT
     */
    (function(r) {
        (function() {
            var e = "input is invalid type",
                t = "finalize already called",
                n = typeof window == "object",
                i = n ? window : {};
            i.JS_SHA3_NO_WINDOW && (n = !1);
            var s = !n && typeof self == "object",
                o = !i.JS_SHA3_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node;
            o ? i = Ul : s && (i = self);
            var u = !i.JS_SHA3_NO_COMMON_JS && !0 && r.exports,
                l = !i.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u",
                h = "0123456789abcdef".split(""),
                c = [31, 7936, 2031616, 520093696],
                y = [4, 1024, 262144, 67108864],
                v = [1, 256, 65536, 16777216],
                N = [6, 1536, 393216, 100663296],
                P = [0, 8, 16, 24],
                S = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648],
                O = [224, 256, 384, 512],
                I = [128, 256],
                C = ["hex", "buffer", "arrayBuffer", "array", "digest"],
                R = {
                    128: 168,
                    256: 136
                };
            (i.JS_SHA3_NO_NODE_JS || !Array.isArray) && (Array.isArray = function(b) {
                return Object.prototype.toString.call(b) === "[object Array]"
            }), l && (i.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) && (ArrayBuffer.isView = function(b) {
                return typeof b == "object" && b.buffer && b.buffer.constructor === ArrayBuffer
            });
            for (var G = function(b, B, F) {
                    return function(D) {
                        return new g(b, B, b).update(D)[F]()
                    }
                }, q = function(b, B, F) {
                    return function(D, j) {
                        return new g(b, B, j).update(D)[F]()
                    }
                }, J = function(b, B, F) {
                    return function(D, j, Z, H) {
                        return a["cshake" + b].update(D, j, Z, H)[F]()
                    }
                }, ue = function(b, B, F) {
                    return function(D, j, Z, H) {
                        return a["kmac" + b].update(D, j, Z, H)[F]()
                    }
                }, W = function(b, B, F, D) {
                    for (var j = 0; j < C.length; ++j) {
                        var Z = C[j];
                        b[Z] = B(F, D, Z)
                    }
                    return b
                }, se = function(b, B) {
                    var F = G(b, B, "hex");
                    return F.create = function() {
                        return new g(b, B, b)
                    }, F.update = function(D) {
                        return F.create().update(D)
                    }, W(F, G, b, B)
                }, m = function(b, B) {
                    var F = q(b, B, "hex");
                    return F.create = function(D) {
                        return new g(b, B, D)
                    }, F.update = function(D, j) {
                        return F.create(j).update(D)
                    }, W(F, q, b, B)
                }, w = function(b, B) {
                    var F = R[b],
                        D = J(b, B, "hex");
                    return D.create = function(j, Z, H) {
                        return !Z && !H ? a["shake" + b].create(j) : new g(b, B, j).bytepad([Z, H], F)
                    }, D.update = function(j, Z, H, V) {
                        return D.create(Z, H, V).update(j)
                    }, W(D, J, b, B)
                }, M = function(b, B) {
                    var F = R[b],
                        D = ue(b, B, "hex");
                    return D.create = function(j, Z, H) {
                        return new T(b, B, Z).bytepad(["KMAC", H], F).bytepad([j], F)
                    }, D.update = function(j, Z, H, V) {
                        return D.create(j, H, V).update(Z)
                    }, W(D, ue, b, B)
                }, p = [{
                    name: "keccak",
                    padding: v,
                    bits: O,
                    createMethod: se
                }, {
                    name: "sha3",
                    padding: N,
                    bits: O,
                    createMethod: se
                }, {
                    name: "shake",
                    padding: c,
                    bits: I,
                    createMethod: m
                }, {
                    name: "cshake",
                    padding: y,
                    bits: I,
                    createMethod: w
                }, {
                    name: "kmac",
                    padding: y,
                    bits: I,
                    createMethod: M
                }], a = {}, d = [], f = 0; f < p.length; ++f)
                for (var A = p[f], E = A.bits, x = 0; x < E.length; ++x) {
                    var k = A.name + "_" + E[x];
                    if (d.push(k), a[k] = A.createMethod(E[x], A.padding), A.name !== "sha3") {
                        var _ = A.name + E[x];
                        d.push(_), a[_] = a[k]
                    }
                }

            function g(b, B, F) {
                this.blocks = [], this.s = [], this.padding = B, this.outputBits = F, this.reset = !0, this.finalized = !1, this.block = 0, this.start = 0, this.blockCount = 1600 - (b << 1) >> 5, this.byteCount = this.blockCount << 2, this.outputBlocks = F >> 5, this.extraBytes = (F & 31) >> 3;
                for (var D = 0; D < 50; ++D) this.s[D] = 0
            }
            g.prototype.update = function(b) {
                if (this.finalized) throw new Error(t);
                var B, F = typeof b;
                if (F !== "string") {
                    if (F === "object") {
                        if (b === null) throw new Error(e);
                        if (l && b.constructor === ArrayBuffer) b = new Uint8Array(b);
                        else if (!Array.isArray(b) && (!l || !ArrayBuffer.isView(b))) throw new Error(e)
                    } else throw new Error(e);
                    B = !0
                }
                for (var D = this.blocks, j = this.byteCount, Z = b.length, H = this.blockCount, V = 0, Me = this.s, K, le; V < Z;) {
                    if (this.reset)
                        for (this.reset = !1, D[0] = this.block, K = 1; K < H + 1; ++K) D[K] = 0;
                    if (B)
                        for (K = this.start; V < Z && K < j; ++V) D[K >> 2] |= b[V] << P[K++ & 3];
                    else
                        for (K = this.start; V < Z && K < j; ++V) le = b.charCodeAt(V), le < 128 ? D[K >> 2] |= le << P[K++ & 3] : le < 2048 ? (D[K >> 2] |= (192 | le >> 6) << P[K++ & 3], D[K >> 2] |= (128 | le & 63) << P[K++ & 3]) : le < 55296 || le >= 57344 ? (D[K >> 2] |= (224 | le >> 12) << P[K++ & 3], D[K >> 2] |= (128 | le >> 6 & 63) << P[K++ & 3], D[K >> 2] |= (128 | le & 63) << P[K++ & 3]) : (le = 65536 + ((le & 1023) << 10 | b.charCodeAt(++V) & 1023), D[K >> 2] |= (240 | le >> 18) << P[K++ & 3], D[K >> 2] |= (128 | le >> 12 & 63) << P[K++ & 3], D[K >> 2] |= (128 | le >> 6 & 63) << P[K++ & 3], D[K >> 2] |= (128 | le & 63) << P[K++ & 3]);
                    if (this.lastByteIndex = K, K >= j) {
                        for (this.start = K - j, this.block = D[H], K = 0; K < H; ++K) Me[K] ^= D[K];
                        z(Me), this.reset = !0
                    } else this.start = K
                }
                return this
            }, g.prototype.encode = function(b, B) {
                var F = b & 255,
                    D = 1,
                    j = [F];
                for (b = b >> 8, F = b & 255; F > 0;) j.unshift(F), b = b >> 8, F = b & 255, ++D;
                return B ? j.push(D) : j.unshift(D), this.update(j), j.length
            }, g.prototype.encodeString = function(b) {
                var B, F = typeof b;
                if (F !== "string") {
                    if (F === "object") {
                        if (b === null) throw new Error(e);
                        if (l && b.constructor === ArrayBuffer) b = new Uint8Array(b);
                        else if (!Array.isArray(b) && (!l || !ArrayBuffer.isView(b))) throw new Error(e)
                    } else throw new Error(e);
                    B = !0
                }
                var D = 0,
                    j = b.length;
                if (B) D = j;
                else
                    for (var Z = 0; Z < b.length; ++Z) {
                        var H = b.charCodeAt(Z);
                        H < 128 ? D += 1 : H < 2048 ? D += 2 : H < 55296 || H >= 57344 ? D += 3 : (H = 65536 + ((H & 1023) << 10 | b.charCodeAt(++Z) & 1023), D += 4)
                    }
                return D += this.encode(D * 8), this.update(b), D
            }, g.prototype.bytepad = function(b, B) {
                for (var F = this.encode(B), D = 0; D < b.length; ++D) F += this.encodeString(b[D]);
                var j = B - F % B,
                    Z = [];
                return Z.length = j, this.update(Z), this
            }, g.prototype.finalize = function() {
                if (!this.finalized) {
                    this.finalized = !0;
                    var b = this.blocks,
                        B = this.lastByteIndex,
                        F = this.blockCount,
                        D = this.s;
                    if (b[B >> 2] |= this.padding[B & 3], this.lastByteIndex === this.byteCount)
                        for (b[0] = b[F], B = 1; B < F + 1; ++B) b[B] = 0;
                    for (b[F - 1] |= 2147483648, B = 0; B < F; ++B) D[B] ^= b[B];
                    z(D)
                }
            }, g.prototype.toString = g.prototype.hex = function() {
                this.finalize();
                for (var b = this.blockCount, B = this.s, F = this.outputBlocks, D = this.extraBytes, j = 0, Z = 0, H = "", V; Z < F;) {
                    for (j = 0; j < b && Z < F; ++j, ++Z) V = B[j], H += h[V >> 4 & 15] + h[V & 15] + h[V >> 12 & 15] + h[V >> 8 & 15] + h[V >> 20 & 15] + h[V >> 16 & 15] + h[V >> 28 & 15] + h[V >> 24 & 15];
                    Z % b === 0 && (z(B), j = 0)
                }
                return D && (V = B[j], H += h[V >> 4 & 15] + h[V & 15], D > 1 && (H += h[V >> 12 & 15] + h[V >> 8 & 15]), D > 2 && (H += h[V >> 20 & 15] + h[V >> 16 & 15])), H
            }, g.prototype.arrayBuffer = function() {
                this.finalize();
                var b = this.blockCount,
                    B = this.s,
                    F = this.outputBlocks,
                    D = this.extraBytes,
                    j = 0,
                    Z = 0,
                    H = this.outputBits >> 3,
                    V;
                D ? V = new ArrayBuffer(F + 1 << 2) : V = new ArrayBuffer(H);
                for (var Me = new Uint32Array(V); Z < F;) {
                    for (j = 0; j < b && Z < F; ++j, ++Z) Me[Z] = B[j];
                    Z % b === 0 && z(B)
                }
                return D && (Me[j] = B[j], V = V.slice(0, H)), V
            }, g.prototype.buffer = g.prototype.arrayBuffer, g.prototype.digest = g.prototype.array = function() {
                this.finalize();
                for (var b = this.blockCount, B = this.s, F = this.outputBlocks, D = this.extraBytes, j = 0, Z = 0, H = [], V, Me; Z < F;) {
                    for (j = 0; j < b && Z < F; ++j, ++Z) V = Z << 2, Me = B[j], H[V] = Me & 255, H[V + 1] = Me >> 8 & 255, H[V + 2] = Me >> 16 & 255, H[V + 3] = Me >> 24 & 255;
                    Z % b === 0 && z(B)
                }
                return D && (V = Z << 2, Me = B[j], H[V] = Me & 255, D > 1 && (H[V + 1] = Me >> 8 & 255), D > 2 && (H[V + 2] = Me >> 16 & 255)), H
            };

            function T(b, B, F) {
                g.call(this, b, B, F)
            }
            T.prototype = new g, T.prototype.finalize = function() {
                return this.encode(this.outputBits, !0), g.prototype.finalize.call(this)
            };
            var z = function(b) {
                var B, F, D, j, Z, H, V, Me, K, le, $e, he, qe, ze, fe, Ge, He, ce, je, Ke, de, Je, Ve, pe, Ze, We, me, Qe, Ye, ge, Xe, et, ye, tt, rt, ve, nt, it, we, st, ot, be, at, ut, Ae, lt, ht, Ee, ft, ct, xe, dt, pt, _e, gt, Dr, yt, vt, vr, wr, br, Ar, Er;
                for (D = 0; D < 48; D += 2) j = b[0] ^ b[10] ^ b[20] ^ b[30] ^ b[40], Z = b[1] ^ b[11] ^ b[21] ^ b[31] ^ b[41], H = b[2] ^ b[12] ^ b[22] ^ b[32] ^ b[42], V = b[3] ^ b[13] ^ b[23] ^ b[33] ^ b[43], Me = b[4] ^ b[14] ^ b[24] ^ b[34] ^ b[44], K = b[5] ^ b[15] ^ b[25] ^ b[35] ^ b[45], le = b[6] ^ b[16] ^ b[26] ^ b[36] ^ b[46], $e = b[7] ^ b[17] ^ b[27] ^ b[37] ^ b[47], he = b[8] ^ b[18] ^ b[28] ^ b[38] ^ b[48], qe = b[9] ^ b[19] ^ b[29] ^ b[39] ^ b[49], B = he ^ (H << 1 | V >>> 31), F = qe ^ (V << 1 | H >>> 31), b[0] ^= B, b[1] ^= F, b[10] ^= B, b[11] ^= F, b[20] ^= B, b[21] ^= F, b[30] ^= B, b[31] ^= F, b[40] ^= B, b[41] ^= F, B = j ^ (Me << 1 | K >>> 31), F = Z ^ (K << 1 | Me >>> 31), b[2] ^= B, b[3] ^= F, b[12] ^= B, b[13] ^= F, b[22] ^= B, b[23] ^= F, b[32] ^= B, b[33] ^= F, b[42] ^= B, b[43] ^= F, B = H ^ (le << 1 | $e >>> 31), F = V ^ ($e << 1 | le >>> 31), b[4] ^= B, b[5] ^= F, b[14] ^= B, b[15] ^= F, b[24] ^= B, b[25] ^= F, b[34] ^= B, b[35] ^= F, b[44] ^= B, b[45] ^= F, B = Me ^ (he << 1 | qe >>> 31), F = K ^ (qe << 1 | he >>> 31), b[6] ^= B, b[7] ^= F, b[16] ^= B, b[17] ^= F, b[26] ^= B, b[27] ^= F, b[36] ^= B, b[37] ^= F, b[46] ^= B, b[47] ^= F, B = le ^ (j << 1 | Z >>> 31), F = $e ^ (Z << 1 | j >>> 31), b[8] ^= B, b[9] ^= F, b[18] ^= B, b[19] ^= F, b[28] ^= B, b[29] ^= F, b[38] ^= B, b[39] ^= F, b[48] ^= B, b[49] ^= F, ze = b[0], fe = b[1], lt = b[11] << 4 | b[10] >>> 28, ht = b[10] << 4 | b[11] >>> 28, Qe = b[20] << 3 | b[21] >>> 29, Ye = b[21] << 3 | b[20] >>> 29, wr = b[31] << 9 | b[30] >>> 23, br = b[30] << 9 | b[31] >>> 23, be = b[40] << 18 | b[41] >>> 14, at = b[41] << 18 | b[40] >>> 14, tt = b[2] << 1 | b[3] >>> 31, rt = b[3] << 1 | b[2] >>> 31, Ge = b[13] << 12 | b[12] >>> 20, He = b[12] << 12 | b[13] >>> 20, Ee = b[22] << 10 | b[23] >>> 22, ft = b[23] << 10 | b[22] >>> 22, ge = b[33] << 13 | b[32] >>> 19, Xe = b[32] << 13 | b[33] >>> 19, Ar = b[42] << 2 | b[43] >>> 30, Er = b[43] << 2 | b[42] >>> 30, _e = b[5] << 30 | b[4] >>> 2, gt = b[4] << 30 | b[5] >>> 2, ve = b[14] << 6 | b[15] >>> 26, nt = b[15] << 6 | b[14] >>> 26, ce = b[25] << 11 | b[24] >>> 21, je = b[24] << 11 | b[25] >>> 21, ct = b[34] << 15 | b[35] >>> 17, xe = b[35] << 15 | b[34] >>> 17, et = b[45] << 29 | b[44] >>> 3, ye = b[44] << 29 | b[45] >>> 3, pe = b[6] << 28 | b[7] >>> 4, Ze = b[7] << 28 | b[6] >>> 4, Dr = b[17] << 23 | b[16] >>> 9, yt = b[16] << 23 | b[17] >>> 9, it = b[26] << 25 | b[27] >>> 7, we = b[27] << 25 | b[26] >>> 7, Ke = b[36] << 21 | b[37] >>> 11, de = b[37] << 21 | b[36] >>> 11, dt = b[47] << 24 | b[46] >>> 8, pt = b[46] << 24 | b[47] >>> 8, ut = b[8] << 27 | b[9] >>> 5, Ae = b[9] << 27 | b[8] >>> 5, We = b[18] << 20 | b[19] >>> 12, me = b[19] << 20 | b[18] >>> 12, vt = b[29] << 7 | b[28] >>> 25, vr = b[28] << 7 | b[29] >>> 25, st = b[38] << 8 | b[39] >>> 24, ot = b[39] << 8 | b[38] >>> 24, Je = b[48] << 14 | b[49] >>> 18, Ve = b[49] << 14 | b[48] >>> 18, b[0] = ze ^ ~Ge & ce, b[1] = fe ^ ~He & je, b[10] = pe ^ ~We & Qe, b[11] = Ze ^ ~me & Ye, b[20] = tt ^ ~ve & it, b[21] = rt ^ ~nt & we, b[30] = ut ^ ~lt & Ee, b[31] = Ae ^ ~ht & ft, b[40] = _e ^ ~Dr & vt, b[41] = gt ^ ~yt & vr, b[2] = Ge ^ ~ce & Ke, b[3] = He ^ ~je & de, b[12] = We ^ ~Qe & ge, b[13] = me ^ ~Ye & Xe, b[22] = ve ^ ~it & st, b[23] = nt ^ ~we & ot, b[32] = lt ^ ~Ee & ct, b[33] = ht ^ ~ft & xe, b[42] = Dr ^ ~vt & wr, b[43] = yt ^ ~vr & br, b[4] = ce ^ ~Ke & Je, b[5] = je ^ ~de & Ve, b[14] = Qe ^ ~ge & et, b[15] = Ye ^ ~Xe & ye, b[24] = it ^ ~st & be, b[25] = we ^ ~ot & at, b[34] = Ee ^ ~ct & dt, b[35] = ft ^ ~xe & pt, b[44] = vt ^ ~wr & Ar, b[45] = vr ^ ~br & Er, b[6] = Ke ^ ~Je & ze, b[7] = de ^ ~Ve & fe, b[16] = ge ^ ~et & pe, b[17] = Xe ^ ~ye & Ze, b[26] = st ^ ~be & tt, b[27] = ot ^ ~at & rt, b[36] = ct ^ ~dt & ut, b[37] = xe ^ ~pt & Ae, b[46] = wr ^ ~Ar & _e, b[47] = br ^ ~Er & gt, b[8] = Je ^ ~ze & Ge, b[9] = Ve ^ ~fe & He, b[18] = et ^ ~pe & We, b[19] = ye ^ ~Ze & me, b[28] = be ^ ~tt & ve, b[29] = at ^ ~rt & nt, b[38] = dt ^ ~ut & lt, b[39] = pt ^ ~Ae & ht, b[48] = Ar ^ ~_e & Dr, b[49] = Er ^ ~gt & yt, b[0] ^= S[D], b[1] ^= S[D + 1]
            };
            if (u) r.exports = a;
            else
                for (f = 0; f < d.length; ++f) i[d[f]] = a[d[f]]
        })()
    })( of );
    var ag = of .exports,
        ug = Yi(ag);

    function qt(r) {
        return "0x" + ug.keccak_256(Ie(r))
    }
    const lg = "strings/5.7.0",
        af = new L(lg);
    var ds;
    (function(r) {
        r.current = "", r.NFC = "NFC", r.NFD = "NFD", r.NFKC = "NFKC", r.NFKD = "NFKD"
    })(ds || (ds = {}));
    var ar;
    (function(r) {
        r.UNEXPECTED_CONTINUE = "unexpected continuation byte", r.BAD_PREFIX = "bad codepoint prefix", r.OVERRUN = "string overrun", r.MISSING_CONTINUE = "missing continuation byte", r.OUT_OF_RANGE = "out of UTF-8 range", r.UTF16_SURROGATE = "UTF-16 surrogate", r.OVERLONG = "overlong representation"
    })(ar || (ar = {}));

    function hg(r, e, t, n, i) {
        return af.throwArgumentError(`invalid codepoint at offset ${e}; ${r}`, "bytes", t)
    }

    function uf(r, e, t, n, i) {
        if (r === ar.BAD_PREFIX || r === ar.UNEXPECTED_CONTINUE) {
            let s = 0;
            for (let o = e + 1; o < t.length && t[o] >> 6 === 2; o++) s++;
            return s
        }
        return r === ar.OVERRUN ? t.length - e - 1 : 0
    }

    function fg(r, e, t, n, i) {
        return r === ar.OVERLONG ? (n.push(i), 0) : (n.push(65533), uf(r, e, t))
    }
    const cg = Object.freeze({
        error: hg,
        ignore: uf,
        replace: fg
    });

    function lf(r, e) {
        e == null && (e = cg.error), r = Ie(r);
        const t = [];
        let n = 0;
        for (; n < r.length;) {
            const i = r[n++];
            if (!(i >> 7)) {
                t.push(i);
                continue
            }
            let s = null,
                o = null;
            if ((i & 224) === 192) s = 1, o = 127;
            else if ((i & 240) === 224) s = 2, o = 2047;
            else if ((i & 248) === 240) s = 3, o = 65535;
            else {
                (i & 192) === 128 ? n += e(ar.UNEXPECTED_CONTINUE, n - 1, r, t) : n += e(ar.BAD_PREFIX, n - 1, r, t);
                continue
            }
            if (n - 1 + s >= r.length) {
                n += e(ar.OVERRUN, n - 1, r, t);
                continue
            }
            let u = i & (1 << 8 - s - 1) - 1;
            for (let l = 0; l < s; l++) {
                let h = r[n];
                if ((h & 192) != 128) {
                    n += e(ar.MISSING_CONTINUE, n, r, t), u = null;
                    break
                }
                u = u << 6 | h & 63, n++
            }
            if (u !== null) {
                if (u > 1114111) {
                    n += e(ar.OUT_OF_RANGE, n - 1 - s, r, t, u);
                    continue
                }
                if (u >= 55296 && u <= 57343) {
                    n += e(ar.UTF16_SURROGATE, n - 1 - s, r, t, u);
                    continue
                }
                if (u <= o) {
                    n += e(ar.OVERLONG, n - 1 - s, r, t, u);
                    continue
                }
                t.push(u)
            }
        }
        return t
    }

    function vn(r, e = ds.current) {
        e != ds.current && (af.checkNormalize(), r = r.normalize(e));
        let t = [];
        for (let n = 0; n < r.length; n++) {
            const i = r.charCodeAt(n);
            if (i < 128) t.push(i);
            else if (i < 2048) t.push(i >> 6 | 192), t.push(i & 63 | 128);
            else if ((i & 64512) == 55296) {
                n++;
                const s = r.charCodeAt(n);
                if (n >= r.length || (s & 64512) !== 56320) throw new Error("invalid utf-8 string");
                const o = 65536 + ((i & 1023) << 10) + (s & 1023);
                t.push(o >> 18 | 240), t.push(o >> 12 & 63 | 128), t.push(o >> 6 & 63 | 128), t.push(o & 63 | 128)
            } else t.push(i >> 12 | 224), t.push(i >> 6 & 63 | 128), t.push(i & 63 | 128)
        }
        return Ie(t)
    }

    function dg(r) {
        return r.map(e => e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode((e >> 10 & 1023) + 55296, (e & 1023) + 56320))).join("")
    }

    function xo(r, e) {
        return dg(lf(r, e))
    }

    function pg(r, e = ds.current) {
        return lf(vn(r, e))
    }

    function hf(r) {
        return qt(vn(r))
    }
    const ff = "hash/5.7.0";

    function cf(r, e) {
        e == null && (e = 1);
        const t = [],
            n = t.forEach,
            i = function(s, o) {
                n.call(s, function(u) {
                    o > 0 && Array.isArray(u) ? i(u, o - 1) : t.push(u)
                })
            };
        return i(r, e), t
    }

    function mg(r) {
        const e = {};
        for (let t = 0; t < r.length; t++) {
            const n = r[t];
            e[n[0]] = n[1]
        }
        return e
    }

    function gg(r) {
        let e = 0;

        function t() {
            return r[e++] << 8 | r[e++]
        }
        let n = t(),
            i = 1,
            s = [0, 1];
        for (let q = 1; q < n; q++) s.push(i += t());
        let o = t(),
            u = e;
        e += o;
        let l = 0,
            h = 0;

        function c() {
            return l == 0 && (h = h << 8 | r[e++], l = 8), h >> --l & 1
        }
        const y = 31,
            v = Math.pow(2, y),
            N = v >>> 1,
            P = N >> 1,
            S = v - 1;
        let O = 0;
        for (let q = 0; q < y; q++) O = O << 1 | c();
        let I = [],
            C = 0,
            R = v;
        for (;;) {
            let q = Math.floor(((O - C + 1) * i - 1) / R),
                J = 0,
                ue = n;
            for (; ue - J > 1;) {
                let m = J + ue >>> 1;
                q < s[m] ? ue = m : J = m
            }
            if (J == 0) break;
            I.push(J);
            let W = C + Math.floor(R * s[J] / i),
                se = C + Math.floor(R * s[J + 1] / i) - 1;
            for (; !((W ^ se) & N);) O = O << 1 & S | c(), W = W << 1 & S, se = se << 1 & S | 1;
            for (; W & ~se & P;) O = O & N | O << 1 & S >>> 1 | c(), W = W << 1 ^ N, se = (se ^ N) << 1 | N | 1;
            C = W, R = 1 + se - W
        }
        let G = n - 4;
        return I.map(q => {
            switch (q - G) {
                case 3:
                    return G + 65792 + (r[u++] << 16 | r[u++] << 8 | r[u++]);
                case 2:
                    return G + 256 + (r[u++] << 8 | r[u++]);
                case 1:
                    return G + r[u++];
                default:
                    return q - 1
            }
        })
    }

    function yg(r) {
        let e = 0;
        return () => r[e++]
    }

    function vg(r) {
        return yg(gg(r))
    }

    function wg(r) {
        return r & 1 ? ~r >> 1 : r >> 1
    }

    function bg(r, e) {
        let t = Array(r);
        for (let n = 0; n < r; n++) t[n] = 1 + e();
        return t
    }

    function df(r, e) {
        let t = Array(r);
        for (let n = 0, i = -1; n < r; n++) t[n] = i += 1 + e();
        return t
    }

    function Ag(r, e) {
        let t = Array(r);
        for (let n = 0, i = 0; n < r; n++) t[n] = i += wg(e());
        return t
    }

    function _o(r, e) {
        let t = df(r(), r),
            n = r(),
            i = df(n, r),
            s = bg(n, r);
        for (let o = 0; o < n; o++)
            for (let u = 0; u < s[o]; u++) t.push(i[o] + u);
        return e ? t.map(o => e[o]) : t
    }

    function Eg(r) {
        let e = [];
        for (;;) {
            let t = r();
            if (t == 0) break;
            e.push(_g(t, r))
        }
        for (;;) {
            let t = r() - 1;
            if (t < 0) break;
            e.push(Mg(t, r))
        }
        return mg(cf(e))
    }

    function xg(r) {
        let e = [];
        for (;;) {
            let t = r();
            if (t == 0) break;
            e.push(t)
        }
        return e
    }

    function pf(r, e, t) {
        let n = Array(r).fill(void 0).map(() => []);
        for (let i = 0; i < e; i++) Ag(r, t).forEach((s, o) => n[o].push(s));
        return n
    }

    function _g(r, e) {
        let t = 1 + e(),
            n = e(),
            i = xg(e),
            s = pf(i.length, 1 + r, e);
        return cf(s.map((o, u) => {
            const l = o[0],
                h = o.slice(1);
            return Array(i[u]).fill(void 0).map((c, y) => {
                let v = y * n;
                return [l + y * t, h.map(N => N + v)]
            })
        }))
    }

    function Mg(r, e) {
        let t = 1 + e();
        return pf(t, 1 + r, e).map(i => [i[0], i.slice(1)])
    }

    function Ng(r) {
        let e = _o(r).sort((n, i) => n - i);
        return t();

        function t() {
            let n = [];
            for (;;) {
                let h = _o(r, e);
                if (h.length == 0) break;
                n.push({
                    set: new Set(h),
                    node: t()
                })
            }
            n.sort((h, c) => c.set.size - h.set.size);
            let i = r(),
                s = i % 3;
            i = i / 3 | 0;
            let o = !!(i & 1);
            i >>= 1;
            let u = i == 1,
                l = i == 2;
            return {
                branches: n,
                valid: s,
                fe0f: o,
                save: u,
                check: l
            }
        }
    }

    function Tg() {
        return vg(rf("AEQF2AO2DEsA2wIrAGsBRABxAN8AZwCcAEwAqgA0AGwAUgByADcATAAVAFYAIQAyACEAKAAYAFgAGwAjABQAMAAmADIAFAAfABQAKwATACoADgAbAA8AHQAYABoAGQAxADgALAAoADwAEwA9ABMAGgARAA4ADwAWABMAFgAIAA8AHgQXBYMA5BHJAS8JtAYoAe4AExozi0UAH21tAaMnBT8CrnIyhrMDhRgDygIBUAEHcoFHUPe8AXBjAewCjgDQR8IICIcEcQLwATXCDgzvHwBmBoHNAqsBdBcUAykgDhAMShskMgo8AY8jqAQfAUAfHw8BDw87MioGlCIPBwZCa4ELatMAAMspJVgsDl8AIhckSg8XAHdvTwBcIQEiDT4OPhUqbyECAEoAS34Aej8Ybx83JgT/Xw8gHxZ/7w8RICxPHA9vBw+Pfw8PHwAPFv+fAsAvCc8vEr8ivwD/EQ8Bol8OEBa/A78hrwAPCU8vESNvvwWfHwNfAVoDHr+ZAAED34YaAdJPAK7PLwSEgDLHAGo1Pz8Pvx9fUwMrpb8O/58VTzAPIBoXIyQJNF8hpwIVAT8YGAUADDNBaX3RAMomJCg9EhUeA29MABsZBTMNJipjOhc19gcIDR8bBwQHEggCWi6DIgLuAQYA+BAFCha3A5XiAEsqM7UFFgFLhAMjFTMYE1Klnw74nRVBG/ASCm0BYRN/BrsU3VoWy+S0vV8LQx+vN8gF2AC2AK5EAWwApgYDKmAAroQ0NDQ0AT+OCg7wAAIHRAbpNgVcBV0APTA5BfbPFgMLzcYL/QqqA82eBALKCjQCjqYCht0/k2+OAsXQAoP3ASTKDgDw6ACKAUYCMpIKJpRaAE4A5womABzZvs0REEKiACIQAd5QdAECAj4Ywg/wGqY2AVgAYADYvAoCGAEubA0gvAY2ALAAbpbvqpyEAGAEpgQAJgAG7gAgAEACmghUFwCqAMpAINQIwC4DthRAAPcycKgApoIdABwBfCisABoATwBqASIAvhnSBP8aH/ECeAKXAq40NjgDBTwFYQU6AXs3oABgAD4XNgmcCY1eCl5tIFZeUqGgyoNHABgAEQAaABNwWQAmABMATPMa3T34ADldyprmM1M2XociUQgLzvwAXT3xABgAEQAaABNwIGFAnADD8AAgAD4BBJWzaCcIAIEBFMAWwKoAAdq9BWAF5wLQpALEtQAKUSGkahR4GnJM+gsAwCgeFAiUAECQ0BQuL8AAIAAAADKeIheclvFqQAAETr4iAMxIARMgAMIoHhQIAn0E0pDQFC4HhznoAAAAIAI2C0/4lvFqQAAETgBJJwYCAy4ABgYAFAA8MBKYEH4eRhTkAjYeFcgACAYAeABsOqyQ5gRwDayqugEgaIIAtgoACgDmEABmBAWGme5OBJJA2m4cDeoAmITWAXwrMgOgAGwBCh6CBXYF1Tzg1wKAAFdiuABRAFwAXQBsAG8AdgBrAHYAbwCEAHEwfxQBVE5TEQADVFhTBwBDANILAqcCzgLTApQCrQL6vAAMAL8APLhNBKkE6glGKTAU4Dr4N2EYEwBCkABKk8rHAbYBmwIoAiU4Ajf/Aq4CowCAANIChzgaNBsCsTgeODcFXrgClQKdAqQBiQGYAqsCsjTsNHsfNPA0ixsAWTWiOAMFPDQSNCk2BDZHNow2TTZUNhk28Jk9VzI3QkEoAoICoQKwAqcAQAAxBV4FXbS9BW47YkIXP1ciUqs05DS/FwABUwJW11e6nHuYZmSh/RAYA8oMKvZ8KASoUAJYWAJ6ILAsAZSoqjpgA0ocBIhmDgDWAAawRDQoAAcuAj5iAHABZiR2AIgiHgCaAU68ACxuHAG0ygM8MiZIAlgBdF4GagJqAPZOHAMuBgoATkYAsABiAHgAMLoGDPj0HpKEBAAOJgAuALggTAHWAeAMEDbd20Uege0ADwAWADkAQgA9OHd+2MUQZBBhBgNNDkxxPxUQArEPqwvqERoM1irQ090ANK4H8ANYB/ADWANYB/AH8ANYB/ADWANYA1gDWBwP8B/YxRBkD00EcgWTBZAE2wiIJk4RhgctCNdUEnQjHEwDSgEBIypJITuYMxAlR0wRTQgIATZHbKx9PQNMMbBU+pCnA9AyVDlxBgMedhKlAC8PeCE1uk6DekxxpQpQT7NX9wBFBgASqwAS5gBJDSgAUCwGPQBI4zTYABNGAE2bAE3KAExdGABKaAbgAFBXAFCOAFBJABI2SWdObALDOq0//QomCZhvwHdTBkIQHCemEPgMNAG2ATwN7kvZBPIGPATKH34ZGg/OlZ0Ipi3eDO4m5C6igFsj9iqEBe5L9TzeC05RaQ9aC2YJ5DpkgU8DIgEOIowK3g06CG4Q9ArKbA3mEUYHOgPWSZsApgcCCxIdNhW2JhFirQsKOXgG/Br3C5AmsBMqev0F1BoiBk4BKhsAANAu6IWxWjJcHU9gBgQLJiPIFKlQIQ0mQLh4SRocBxYlqgKSQ3FKiFE3HpQh9zw+DWcuFFF9B/Y8BhlQC4I8n0asRQ8R0z6OPUkiSkwtBDaALDAnjAnQD4YMunxzAVoJIgmyDHITMhEYN8YIOgcaLpclJxYIIkaWYJsE+KAD9BPSAwwFQAlCBxQDthwuEy8VKgUOgSXYAvQ21i60ApBWgQEYBcwPJh/gEFFH4Q7qCJwCZgOEJewALhUiABginAhEZABgj9lTBi7MCMhqbSN1A2gU6GIRdAeSDlgHqBw0FcAc4nDJXgyGCSiksAlcAXYJmgFgBOQICjVcjKEgQmdUi1kYnCBiQUBd/QIyDGYVoES+h3kCjA9sEhwBNgF0BzoNAgJ4Ee4RbBCWCOyGBTW2M/k6JgRQIYQgEgooA1BszwsoJvoM+WoBpBJjAw00PnfvZ6xgtyUX/gcaMsZBYSHyC5NPzgydGsIYQ1QvGeUHwAP0GvQn60FYBgADpAQUOk4z7wS+C2oIjAlAAEoOpBgH2BhrCnKM0QEyjAG4mgNYkoQCcJAGOAcMAGgMiAV65gAeAqgIpAAGANADWAA6Aq4HngAaAIZCAT4DKDABIuYCkAOUCDLMAZYwAfQqBBzEDBYA+DhuSwLDsgKAa2ajBd5ZAo8CSjYBTiYEBk9IUgOwcuIA3ABMBhTgSAEWrEvMG+REAeBwLADIAPwABjYHBkIBzgH0bgC4AWALMgmjtLYBTuoqAIQAFmwB2AKKAN4ANgCA8gFUAE4FWvoF1AJQSgESMhksWGIBvAMgATQBDgB6BsyOpsoIIARuB9QCEBwV4gLvLwe2AgMi4BPOQsYCvd9WADIXUu5eZwqoCqdeaAC0YTQHMnM9UQAPH6k+yAdy/BZIiQImSwBQ5gBQQzSaNTFWSTYBpwGqKQK38AFtqwBI/wK37gK3rQK3sAK6280C0gK33AK3zxAAUEIAUD9SklKDArekArw5AEQAzAHCO147WTteO1k7XjtZO147WTteO1kDmChYI03AVU0oJqkKbV9GYewMpw3VRMk6ShPcYFJgMxPJLbgUwhXPJVcZPhq9JwYl5VUKDwUt1GYxCC00dhe9AEApaYNCY4ceMQpMHOhTklT5LRwAskujM7ANrRsWREEFSHXuYisWDwojAmSCAmJDXE6wXDchAqH4AmiZAmYKAp+FOBwMAmY8AmYnBG8EgAN/FAN+kzkHOXgYOYM6JCQCbB4CMjc4CwJtyAJtr/CLADRoRiwBaADfAOIASwYHmQyOAP8MwwAOtgJ3MAJ2o0ACeUxEAni7Hl3cRa9G9AJ8QAJ6yQJ9CgJ88UgBSH5kJQAsFklZSlwWGErNAtECAtDNSygDiFADh+dExpEzAvKiXQQDA69Lz0wuJgTQTU1NsAKLQAKK2cIcCB5EaAa4Ao44Ao5dQZiCAo7aAo5deVG1UzYLUtVUhgKT/AKTDQDqAB1VH1WwVdEHLBwplocy4nhnRTw6ApegAu+zWCKpAFomApaQApZ9nQCqWa1aCoJOADwClrYClk9cRVzSApnMApllXMtdCBoCnJw5wzqeApwXAp+cAp65iwAeEDIrEAKd8gKekwC2PmE1YfACntQCoG8BqgKeoCACnk+mY8lkKCYsAiewAiZ/AqD8AqBN2AKmMAKlzwKoAAB+AqfzaH1osgAESmodatICrOQCrK8CrWgCrQMCVx4CVd0CseLYAx9PbJgCsr4OArLpGGzhbWRtSWADJc4Ctl08QG6RAylGArhfArlIFgK5K3hwN3DiAr0aAy2zAzISAr6JcgMDM3ICvhtzI3NQAsPMAsMFc4N0TDZGdOEDPKgDPJsDPcACxX0CxkgCxhGKAshqUgLIRQLJUALJLwJkngLd03h6YniveSZL0QMYpGcDAmH1GfSVJXsMXpNevBICz2wCz20wTFTT9BSgAMeuAs90ASrrA04TfkwGAtwoAtuLAtJQA1JdA1NgAQIDVY2AikABzBfuYUZ2AILPg44C2sgC2d+EEYRKpz0DhqYAMANkD4ZyWvoAVgLfZgLeuXR4AuIw7RUB8zEoAfScAfLTiALr9ALpcXoAAur6AurlAPpIAboC7ooC652Wq5cEAu5AA4XhmHpw4XGiAvMEAGoDjheZlAL3FAORbwOSiAL3mQL52gL4Z5odmqy8OJsfA52EAv77ARwAOp8dn7QDBY4DpmsDptoA0sYDBmuhiaIGCgMMSgFgASACtgNGAJwEgLpoBgC8BGzAEowcggCEDC6kdjoAJAM0C5IKRoABZCgiAIzw3AYBLACkfng9ogigkgNmWAN6AEQCvrkEVqTGAwCsBRbAA+4iQkMCHR072jI2PTbUNsk2RjY5NvA23TZKNiU3EDcZN5I+RTxDRTBCJkK5VBYKFhZfwQCWygU3AJBRHpu+OytgNxa61A40GMsYjsn7BVwFXQVcBV0FaAVdBVwFXQVcBV0FXAVdBVwFXUsaCNyKAK4AAQUHBwKU7oICoW1e7jAEzgPxA+YDwgCkBFDAwADABKzAAOxFLhitA1UFTDeyPkM+bj51QkRCuwTQWWQ8X+0AWBYzsACNA8xwzAGm7EZ/QisoCTAbLDs6fnLfb8H2GccsbgFw13M1HAVkBW/Jxsm9CNRO8E8FDD0FBQw9FkcClOYCoMFegpDfADgcMiA2AJQACB8AsigKAIzIEAJKeBIApY5yPZQIAKQiHb4fvj5BKSRPQrZCOz0oXyxgOywfKAnGbgMClQaCAkILXgdeCD9IIGUgQj5fPoY+dT52Ao5CM0dAX9BTVG9SDzFwWTQAbxBzJF/lOEIQQglCCkKJIAls5AcClQICoKPMODEFxhi6KSAbiyfIRrMjtCgdWCAkPlFBIitCsEJRzAbMAV/OEyQzDg0OAQQEJ36i328/Mk9AybDJsQlq3tDRApUKAkFzXf1d/j9uALYP6hCoFgCTGD8kPsFKQiobrm0+zj0KSD8kPnVCRBwMDyJRTHFgMTJa5rwXQiQ2YfI/JD7BMEJEHGINTw4TOFlIRzwJO0icMQpyPyQ+wzJCRBv6DVgnKB01NgUKj2bwYzMqCoBkznBgEF+zYDIocwRIX+NgHj4HICNfh2C4CwdwFWpTG/lgUhYGAwRfv2Ts8mAaXzVgml/XYIJfuWC4HI1gUF9pYJZgMR6ilQHMAOwLAlDRefC0in4AXAEJA6PjCwc0IamOANMMCAECRQDFNRTZBgd+CwQlRA+r6+gLBDEFBnwUBXgKATIArwAGRAAHA3cDdAN2A3kDdwN9A3oDdQN7A30DfAN4A3oDfQAYEAAlAtYASwMAUAFsAHcKAHcAmgB3AHUAdQB2AHVu8UgAygDAAHcAdQB1AHYAdQALCgB3AAsAmgB3AAsCOwB3AAtu8UgAygDAAHgKAJoAdwB3AHUAdQB2AHUAeAB1AHUAdgB1bvFIAMoAwAALCgCaAHcACwB3AAsCOwB3AAtu8UgAygDAAH4ACwGgALcBpwC6AahdAu0COwLtbvFIAMoAwAALCgCaAu0ACwLtAAsCOwLtAAtu8UgAygDAA24ACwNvAAu0VsQAAzsAABCkjUIpAAsAUIusOggWcgMeBxVsGwL67U/2HlzmWOEeOgALASvuAAseAfpKUpnpGgYJDCIZM6YyARUE9ThqAD5iXQgnAJYJPnOzw0ZAEZxEKsIAkA4DhAHnTAIDxxUDK0lxCQlPYgIvIQVYJQBVqE1GakUAKGYiDToSBA1EtAYAXQJYAIF8GgMHRyAAIAjOe9YncekRAA0KACUrjwE7Ayc6AAYWAqaiKG4McEcqANoN3+Mg9TwCBhIkuCny+JwUQ29L008JluRxu3K+oAdqiHOqFH0AG5SUIfUJ5SxCGfxdipRzqTmT4V5Zb+r1Uo4Vm+NqSSEl2mNvR2JhIa8SpYO6ntdwFXHCWTCK8f2+Hxo7uiG3drDycAuKIMP5bhi06ACnqArH1rz4Rqg//lm6SgJGEVbF9xJHISaR6HxqxSnkw6shDnelHKNEfGUXSJRJ1GcsmtJw25xrZMDK9gXSm1/YMkdX4/6NKYOdtk/NQ3/NnDASjTc3fPjIjW/5sVfVObX2oTDWkr1dF9f3kxBsD3/3aQO8hPfRz+e0uEiJqt1161griu7gz8hDDwtpy+F+BWtefnKHZPAxcZoWbnznhJpy0e842j36bcNzGnIEusgGX0a8ZxsnjcSsPDZ09yZ36fCQbriHeQ72JRMILNl6ePPf2HWoVwgWAm1fb3V2sAY0+B6rAXqSwPBgseVmoqsBTSrm91+XasMYYySI8eeRxH3ZvHkMz3BQ5aJ3iUVbYPNM3/7emRtjlsMgv/9VyTsyt/mK+8fgWeT6SoFaclXqn42dAIsvAarF5vNNWHzKSkKQ/8Hfk5ZWK7r9yliOsooyBjRhfkHP4Q2DkWXQi6FG/9r/IwbmkV5T7JSopHKn1pJwm9tb5Ot0oyN1Z2mPpKXHTxx2nlK08fKk1hEYA8WgVVWL5lgx0iTv+KdojJeU23ZDjmiubXOxVXJKKi2Wjuh2HLZOFLiSC7Tls5SMh4f+Pj6xUSrNjFqLGehRNB8lC0QSLNmkJJx/wSG3MnjE9T1CkPwJI0wH2lfzwETIiVqUxg0dfu5q39Gt+hwdcxkhhNvQ4TyrBceof3Mhs/IxFci1HmHr4FMZgXEEczPiGCx0HRwzAqDq2j9AVm1kwN0mRVLWLylgtoPNapF5cY4Y1wJh/e0BBwZj44YgZrDNqvD/9Hv7GFYdUQeDJuQ3EWI4HaKqavU1XjC/n41kT4L79kqGq0kLhdTZvgP3TA3fS0ozVz+5piZsoOtIvBUFoMKbNcmBL6YxxaUAusHB38XrS8dQMnQwJfUUkpRoGr5AUeWicvBTzyK9g77+yCkf5PAysL7r/JjcZgrbvRpMW9iyaxZvKO6ceZN2EwIxKwVFPuvFuiEPGCoagbMo+SpydLrXqBzNCDGFCrO/rkcwa2xhokQZ5CdZ0AsU3JfSqJ6n5I14YA+P/uAgfhPU84Tlw7cEFfp7AEE8ey4sP12PTt4Cods1GRgDOB5xvyiR5m+Bx8O5nBCNctU8BevfV5A08x6RHd5jcwPTMDSZJOedIZ1cGQ704lxbAzqZOP05ZxaOghzSdvFBHYqomATARyAADK4elP8Ly3IrUZKfWh23Xy20uBUmLS4Pfagu9+oyVa2iPgqRP3F2CTUsvJ7+RYnN8fFZbU/HVvxvcFFDKkiTqV5UBZ3Gz54JAKByi9hkKMZJvuGgcSYXFmw08UyoQyVdfTD1/dMkCHXcTGAKeROgArsvmRrQTLUOXioOHGK2QkjHuoYFgXciZoTJd6Fs5q1QX1G+p/e26hYsEf7QZD1nnIyl/SFkNtYYmmBhpBrxl9WbY0YpHWRuw2Ll/tj9mD8P4snVzJl4F9J+1arVeTb9E5r2ILH04qStjxQNwn3m4YNqxmaNbLAqW2TN6LidwuJRqS+NXbtqxoeDXpxeGWmxzSkWxjkyCkX4NQRme6q5SAcC+M7+9ETfA/EwrzQajKakCwYyeunP6ZFlxU2oMEn1Pz31zeStW74G406ZJFCl1wAXIoUKkWotYEpOuXB1uVNxJ63dpJEqfxBeptwIHNrPz8BllZoIcBoXwgfJ+8VAUnVPvRvexnw0Ma/WiGYuJO5y8QTvEYBigFmhUxY5RqzE8OcywN/8m4UYrlaniJO75XQ6KSo9+tWHlu+hMi0UVdiKQp7NelnoZUzNaIyBPVeOwK6GNp+FfHuPOoyhaWuNvTYFkvxscMQWDh+zeFCFkgwbXftiV23ywJ4+uwRqmg9k3KzwIQpzppt8DBBOMbrqwQM5Gb05sEwdKzMiAqOloaA/lr0KA+1pr0/+HiWoiIjHA/wir2nIuS3PeU/ji3O6ZwoxcR1SZ9FhtLC5S0FIzFhbBWcGVP/KpxOPSiUoAdWUpqKH++6Scz507iCcxYI6rdMBICPJZea7OcmeFw5mObJSiqpjg2UoWNIs+cFhyDSt6geV5qgi3FunmwwDoGSMgerFOZGX1m0dMCYo5XOruxO063dwENK9DbnVM9wYFREzh4vyU1WYYJ/LRRp6oxgjqP/X5a8/4Af6p6NWkQferzBmXme0zY/4nwMJm/wd1tIqSwGz+E3xPEAOoZlJit3XddD7/BT1pllzOx+8bmQtANQ/S6fZexc6qi3W+Q2xcmXTUhuS5mpHQRvcxZUN0S5+PL9lXWUAaRZhEH8hTdAcuNMMCuVNKTEGtSUKNi3O6KhSaTzck8csZ2vWRZ+d7mW8c4IKwXIYd25S/zIftPkwPzufjEvOHWVD1m+FjpDVUTV0DGDuHj6QnaEwLu/dEgdLQOg9E1Sro9XHJ8ykLAwtPu+pxqKDuFexqON1sKQm7rwbE1E68UCfA/erovrTCG+DBSNg0l4goDQvZN6uNlbyLpcZAwj2UclycvLpIZMgv4yRlpb3YuMftozorbcGVHt/VeDV3+Fdf1TP0iuaCsPi2G4XeGhsyF1ubVDxkoJhmniQ0/jSg/eYML9KLfnCFgISWkp91eauR3IQvED0nAPXK+6hPCYs+n3+hCZbiskmVMG2da+0EsZPonUeIY8EbfusQXjsK/eFDaosbPjEfQS0RKG7yj5GG69M7MeO1HmiUYocgygJHL6M1qzUDDwUSmr99V7Sdr2F3JjQAJY+F0yH33Iv3+C9M38eML7gTgmNu/r2bUMiPvpYbZ6v1/IaESirBHNa7mPKn4dEmYg7v/+HQgPN1G79jBQ1+soydfDC2r+h2Bl/KIc5KjMK7OH6nb1jLsNf0EHVe2KBiE51ox636uyG6Lho0t3J34L5QY/ilE3mikaF4HKXG1mG1rCevT1Vv6GavltxoQe/bMrpZvRggnBxSEPEeEzkEdOxTnPXHVjUYdw8JYvjB/o7Eegc3Ma+NUxLLnsK0kJlinPmUHzHGtrk5+CAbVzFOBqpyy3QVUnzTDfC/0XD94/okH+OB+i7g9lolhWIjSnfIb+Eq43ZXOWmwvjyV/qqD+t0e+7mTEM74qP/Ozt8nmC7mRpyu63OB4KnUzFc074SqoyPUAgM+/TJGFo6T44EHnQU4X4z6qannVqgw/U7zCpwcmXV1AubIrvOmkKHazJAR55ePjp5tLBsN8vAqs3NAHdcEHOR2xQ0lsNAFzSUuxFQCFYvXLZJdOj9p4fNq6p0HBGUik2YzaI4xySy91KzhQ0+q1hjxvImRwPRf76tChlRkhRCi74NXZ9qUNeIwP+s5p+3m5nwPdNOHgSLD79n7O9m1n1uDHiMntq4nkYwV5OZ1ENbXxFd4PgrlvavZsyUO4MqYlqqn1O8W/I1dEZq5dXhrbETLaZIbC2Kj/Aa/QM+fqUOHdf0tXAQ1huZ3cmWECWSXy/43j35+Mvq9xws7JKseriZ1pEWKc8qlzNrGPUGcVgOa9cPJYIJsGnJTAUsEcDOEVULO5x0rXBijc1lgXEzQQKhROf8zIV82w8eswc78YX11KYLWQRcgHNJElBxfXr72lS2RBSl07qTKorO2uUDZr3sFhYsvnhLZn0A94KRzJ/7DEGIAhW5ZWFpL8gEwu1aLA9MuWZzNwl8Oze9Y+bX+v9gywRVnoB5I/8kXTXU3141yRLYrIOOz6SOnyHNy4SieqzkBXharjfjqq1q6tklaEbA8Qfm2DaIPs7OTq/nvJBjKfO2H9bH2cCMh1+5gspfycu8f/cuuRmtDjyqZ7uCIMyjdV3a+p3fqmXsRx4C8lujezIFHnQiVTXLXuI1XrwN3+siYYj2HHTvESUx8DlOTXpak9qFRK+L3mgJ1WsD7F4cu1aJoFoYQnu+wGDMOjJM3kiBQWHCcvhJ/HRdxodOQp45YZaOTA22Nb4XKCVxqkbwMYFhzYQYIAnCW8FW14uf98jhUG2zrKhQQ0q0CEq0t5nXyvUyvR8DvD69LU+g3i+HFWQMQ8PqZuHD+sNKAV0+M6EJC0szq7rEr7B5bQ8BcNHzvDMc9eqB5ZCQdTf80Obn4uzjwpYU7SISdtV0QGa9D3Wrh2BDQtpBKxaNFV+/Cy2P/Sv+8s7Ud0Fd74X4+o/TNztWgETUapy+majNQ68Lq3ee0ZO48VEbTZYiH1Co4OlfWef82RWeyUXo7woM03PyapGfikTnQinoNq5z5veLpeMV3HCAMTaZmA1oGLAn7XS3XYsz+XK7VMQsc4XKrmDXOLU/pSXVNUq8dIqTba///3x6LiLS6xs1xuCAYSfcQ3+rQgmu7uvf3THKt5Ooo97TqcbRqxx7EASizaQCBQllG/rYxVapMLgtLbZS64w1MDBMXX+PQpBKNwqUKOf2DDRDUXQf9EhOS0Qj4nTmlA8dzSLz/G1d+Ud8MTy/6ghhdiLpeerGY/UlDOfiuqFsMUU5/UYlP+BAmgRLuNpvrUaLlVkrqDievNVEAwF+4CoM1MZTmjxjJMsKJq+u8Zd7tNCUFy6LiyYXRJQ4VyvEQFFaCGKsxIwQkk7EzZ6LTJq2hUuPhvAW+gQnSG6J+MszC+7QCRHcnqDdyNRJ6T9xyS87A6MDutbzKGvGktpbXqtzWtXb9HsfK2cBMomjN9a4y+TaJLnXxAeX/HWzmf4cR4vALt/P4w4qgKY04ml4ZdLOinFYS6cup3G/1ie4+t1eOnpBNlqGqs75ilzkT4+DsZQxNvaSKJ//6zIbbk/M7LOhFmRc/1R+kBtz7JFGdZm/COotIdvQoXpTqP/1uqEUmCb/QWoGLMwO5ANcHzxdY48IGP5+J+zKOTBFZ4Pid+GTM+Wq12MV/H86xEJptBa6T+p3kgpwLedManBHC2GgNrFpoN2xnrMz9WFWX/8/ygSBkavq2Uv7FdCsLEYLu9LLIvAU0bNRDtzYl+/vXmjpIvuJFYjmI0im6QEYqnIeMsNjXG4vIutIGHijeAG/9EDBozKV5cldkHbLxHh25vT+ZEzbhXlqvpzKJwcEgfNwLAKFeo0/pvEE10XDB+EXRTXtSzJozQKFFAJhMxYkVaCW+E9AL7tMeU8acxidHqzb6lX4691UsDpy/LLRmT+epgW56+5Cw8tB4kMUv6s9lh3eRKbyGs+H/4mQMaYzPTf2OOdokEn+zzgvoD3FqNKk8QqGAXVsqcGdXrT62fSPkR2vROFi68A6se86UxRUk4cajfPyCC4G5wDhD+zNq4jodQ4u4n/m37Lr36n4LIAAsVr02dFi9AiwA81MYs2rm4eDlDNmdMRvEKRHfBwW5DdMNp0jPFZMeARqF/wL4XBfd+EMLBfMzpH5GH6NaW+1vrvMdg+VxDzatk3MXgO3ro3P/DpcC6+Mo4MySJhKJhSR01SGGGp5hPWmrrUgrv3lDnP+HhcI3nt3YqBoVAVTBAQT5iuhTg8nvPtd8ZeYj6w1x6RqGUBrSku7+N1+BaasZvjTk64RoIDlL8brpEcJx3OmY7jLoZsswdtmhfC/G21llXhITOwmvRDDeTTPbyASOa16cF5/A1fZAidJpqju3wYAy9avPR1ya6eNp9K8XYrrtuxlqi+bDKwlfrYdR0RRiKRVTLOH85+ZY7XSmzRpfZBJjaTa81VDcJHpZnZnSQLASGYW9l51ZV/h7eVzTi3Hv6hUsgc/51AqJRTkpbFVLXXszoBL8nBX0u/0jBLT8nH+fJePbrwURT58OY+UieRjd1vs04w0VG5VN2U6MoGZkQzKN/ptz0Q366dxoTGmj7i1NQGHi9GgnquXFYdrCfZBmeb7s0T6yrdlZH5cZuwHFyIJ/kAtGsTg0xH5taAAq44BAk1CPk9KVVbqQzrCUiFdF/6gtlPQ8bHHc1G1W92MXGZ5HEHftyLYs8mbD/9xYRUWkHmlM0zC2ilJlnNgV4bfALpQghxOUoZL7VTqtCHIaQSXm+YUMnpkXybnV+A6xlm2CVy8fn0Xlm2XRa0+zzOa21JWWmixfiPMSCZ7qA4rS93VN3pkpF1s5TonQjisHf7iU9ZGvUPOAKZcR1pbeVf/Ul7OhepGCaId9wOtqo7pJ7yLcBZ0pFkOF28y4zEI/kcUNmutBHaQpBdNM8vjCS6HZRokkeo88TBAjGyG7SR+6vUgTcyK9Imalj0kuxz0wmK+byQU11AiJFk/ya5dNduRClcnU64yGu/ieWSeOos1t3ep+RPIWQ2pyTYVbZltTbsb7NiwSi3AV+8KLWk7LxCnfZUetEM8ThnsSoGH38/nyAwFguJp8FjvlHtcWZuU4hPva0rHfr0UhOOJ/F6vS62FW7KzkmRll2HEc7oUq4fyi5T70Vl7YVIfsPHUCdHesf9Lk7WNVWO75JDkYbMI8TOW8JKVtLY9d6UJRITO8oKo0xS+o99Yy04iniGHAaGj88kEWgwv0OrHdY/nr76DOGNS59hXCGXzTKUvDl9iKpLSWYN1lxIeyywdNpTkhay74w2jFT6NS8qkjo5CxA1yfSYwp6AJIZNKIeEK5PJAW7ORgWgwp0VgzYpqovMrWxbu+DGZ6Lhie1RAqpzm8VUzKJOH3mCzWuTOLsN3VT/dv2eeYe9UjbR8YTBsLz7q60VN1sU51k+um1f8JxD5pPhbhSC8rRaB454tmh6YUWrJI3+GWY0qeWioj/tbkYITOkJaeuGt4JrJvHA+l0Gu7kY7XOaa05alMnRWVCXqFgLIwSY4uF59Ue5SU4QKuc/HamDxbr0x6csCetXGoP7Qn1Bk/J9DsynO/UD6iZ1Hyrz+jit0hDCwi/E9OjgKTbB3ZQKQ/0ZOvevfNHG0NK4Aj3Cp7NpRk07RT1i/S0EL93Ag8GRgKI9CfpajKyK6+Jj/PI1KO5/85VAwz2AwzP8FTBb075IxCXv6T9RVvWT2tUaqxDS92zrGUbWzUYk9mSs82pECH+fkqsDt93VW++4YsR/dHCYcQSYTO/KaBMDj9LSD/J/+z20Kq8XvZUAIHtm9hRPP3ItbuAu2Hm5lkPs92pd7kCxgRs0xOVBnZ13ccdA0aunrwv9SdqElJRC3g+oCu+nXyCgmXUs9yMjTMAIHfxZV+aPKcZeUBWt057Xo85Ks1Ir5gzEHCWqZEhrLZMuF11ziGtFQUds/EESajhagzcKsxamcSZxGth4UII+adPhQkUnx2WyN+4YWR+r3f8MnkyGFuR4zjzxJS8WsQYR5PTyRaD9ixa6Mh741nBHbzfjXHskGDq179xaRNrCIB1z1xRfWfjqw2pHc1zk9xlPpL8sQWAIuETZZhbnmL54rceXVNRvUiKrrqIkeogsl0XXb17ylNb0f4GA9Wd44vffEG8FSZGHEL2fbaTGRcSiCeA8PmA/f6Hz8HCS76fXUHwgwkzSwlI71ekZ7Fapmlk/KC+Hs8hUcw3N2LN5LhkVYyizYFl/uPeVP5lsoJHhhfWvvSWruCUW1ZcJOeuTbrDgywJ/qG07gZJplnTvLcYdNaH0KMYOYMGX+rB4NGPFmQsNaIwlWrfCezxre8zXBrsMT+edVLbLqN1BqB76JH4BvZTqUIMfGwPGEn+EnmTV86fPBaYbFL3DFEhjB45CewkXEAtJxk4/Ms2pPXnaRqdky0HOYdcUcE2zcXq4vaIvW2/v0nHFJH2XXe22ueDmq/18XGtELSq85j9X8q0tcNSSKJIX8FTuJF/Pf8j5PhqG2u+osvsLxYrvvfeVJL+4tkcXcr9JV7v0ERmj/X6fM3NC4j6dS1+9Umr2oPavqiAydTZPLMNRGY23LO9zAVDly7jD+70G5TPPLdhRIl4WxcYjLnM+SNcJ26FOrkrISUtPObIz5Zb3AG612krnpy15RMW+1cQjlnWFI6538qky9axd2oJmHIHP08KyP0ubGO+TQNOYuv2uh17yCIvR8VcStw7o1g0NM60sk+8Tq7YfIBJrtp53GkvzXH7OA0p8/n/u1satf/VJhtR1l8Wa6Gmaug7haSpaCaYQax6ta0mkutlb+eAOSG1aobM81D9A4iS1RRlzBBoVX6tU1S6WE2N9ORY6DfeLRC4l9Rvr5h95XDWB2mR1d4WFudpsgVYwiTwT31ljskD8ZyDOlm5DkGh9N/UB/0AI5Xvb8ZBmai2hQ4BWMqFwYnzxwB26YHSOv9WgY3JXnvoN+2R4rqGVh/LLDMtpFP+SpMGJNWvbIl5SOodbCczW2RKleksPoUeGEzrjtKHVdtZA+kfqO+rVx/iclCqwoopepvJpSTDjT+b9GWylGRF8EDbGlw6eUzmJM95Ovoz+kwLX3c2fTjFeYEsE7vUZm3mqdGJuKh2w9/QGSaqRHs99aScGOdDqkFcACoqdbBoQqqjamhH6Q9ng39JCg3lrGJwd50Qk9ovnqBTr8MME7Ps2wiVfygUmPoUBJJfJWX5Nda0nuncbFkA=="))
    }
    const Mo = Tg(),
        Pg = new Set(_o(Mo)),
        kg = new Set(_o(Mo)),
        Sg = Eg(Mo),
        Rg = Ng(Mo),
        mf = 45,
        gf = 95;

    function yf(r) {
        return pg(r)
    }

    function Ig(r) {
        return r.filter(e => e != 65039)
    }

    function vf(r) {
        for (let e of r.split(".")) {
            let t = yf(e);
            try {
                for (let n = t.lastIndexOf(gf) - 1; n >= 0; n--)
                    if (t[n] !== gf) throw new Error("underscore only allowed at start");
                if (t.length >= 4 && t.every(n => n < 128) && t[2] === mf && t[3] === mf) throw new Error("invalid label extension")
            } catch (n) {
                throw new Error(`Invalid label "${e}": ${n.message}`)
            }
        }
        return r
    }

    function Cg(r) {
        return vf(Bg(r, Ig))
    }

    function Bg(r, e) {
        let t = yf(r).reverse(),
            n = [];
        for (; t.length;) {
            let i = Fg(t);
            if (i) {
                n.push(...e(i));
                continue
            }
            let s = t.pop();
            if (Pg.has(s)) {
                n.push(s);
                continue
            }
            if (kg.has(s)) continue;
            let o = Sg[s];
            if (o) {
                n.push(...o);
                continue
            }
            throw new Error(`Disallowed codepoint: 0x${s.toString(16).toUpperCase()}`)
        }
        return vf(Og(String.fromCodePoint(...n)))
    }

    function Og(r) {
        return r.normalize("NFC")
    }

    function Fg(r, e) {
        var t;
        let n = Rg,
            i, s, o = [],
            u = r.length;
        for (e && (e.length = 0); u;) {
            let l = r[--u];
            if (n = (t = n.branches.find(h => h.set.has(l))) === null || t === void 0 ? void 0 : t.node, !n) break;
            if (n.save) s = l;
            else if (n.check && l === s) break;
            o.push(l), n.fe0f && (o.push(65039), u > 0 && r[u - 1] == 65039 && u--), n.valid && (i = o.slice(), n.valid == 2 && i.splice(1, 1), e && e.push(...r.slice(u).reverse()), r.length = u)
        }
        return i
    }
    const Dg = new L(ff),
        wf = new Uint8Array(32);
    wf.fill(0);

    function bf(r) {
        if (r.length === 0) throw new Error("invalid ENS name; empty component");
        return r
    }

    function Af(r) {
        const e = vn(Cg(r)),
            t = [];
        if (r.length === 0) return t;
        let n = 0;
        for (let i = 0; i < e.length; i++) e[i] === 46 && (t.push(bf(e.slice(n, i))), n = i + 1);
        if (n >= e.length) throw new Error("invalid ENS name; empty component");
        return t.push(bf(e.slice(n))), t
    }

    function No(r) {
        typeof r != "string" && Dg.throwArgumentError("invalid ENS name; not a string", "name", r);
        let e = wf;
        const t = Af(r);
        for (; t.length;) e = qt(Vn([e, qt(t.pop())]));
        return Se(e)
    }

    function Lg(r) {
        return Se(Vn(Af(r).map(e => {
            if (e.length > 63) throw new Error("invalid DNS encoded entry; length exceeds 63 bytes");
            const t = new Uint8Array(e.length + 1);
            return t.set(e, 1), t[0] = t.length - 1, t
        }))) + "00"
    }
    const Ug = "rlp/5.7.0",
        Jr = new L(Ug);

    function Ef(r) {
        const e = [];
        for (; r;) e.unshift(r & 255), r >>= 8;
        return e
    }

    function xf(r, e, t) {
        let n = 0;
        for (let i = 0; i < t; i++) n = n * 256 + r[e + i];
        return n
    }

    function _f(r) {
        if (Array.isArray(r)) {
            let n = [];
            if (r.forEach(function(s) {
                    n = n.concat(_f(s))
                }), n.length <= 55) return n.unshift(192 + n.length), n;
            const i = Ef(n.length);
            return i.unshift(247 + i.length), i.concat(n)
        }
        qa(r) || Jr.throwArgumentError("RLP object must be BytesLike", "object", r);
        const e = Array.prototype.slice.call(Ie(r));
        if (e.length === 1 && e[0] <= 127) return e;
        if (e.length <= 55) return e.unshift(128 + e.length), e;
        const t = Ef(e.length);
        return t.unshift(183 + t.length), t.concat(e)
    }

    function To(r) {
        return Se(_f(r))
    }

    function Mf(r, e, t, n) {
        const i = [];
        for (; t < e + 1 + n;) {
            const s = Nf(r, t);
            i.push(s.result), t += s.consumed, t > e + 1 + n && Jr.throwError("child data too short", L.errors.BUFFER_OVERRUN, {})
        }
        return {
            consumed: 1 + n,
            result: i
        }
    }

    function Nf(r, e) {
        if (r.length === 0 && Jr.throwError("data too short", L.errors.BUFFER_OVERRUN, {}), r[e] >= 248) {
            const t = r[e] - 247;
            e + 1 + t > r.length && Jr.throwError("data short segment too short", L.errors.BUFFER_OVERRUN, {});
            const n = xf(r, e + 1, t);
            return e + 1 + t + n > r.length && Jr.throwError("data long segment too short", L.errors.BUFFER_OVERRUN, {}), Mf(r, e, e + 1 + t, t + n)
        } else if (r[e] >= 192) {
            const t = r[e] - 192;
            return e + 1 + t > r.length && Jr.throwError("data array too short", L.errors.BUFFER_OVERRUN, {}), Mf(r, e, e + 1, t)
        } else if (r[e] >= 184) {
            const t = r[e] - 183;
            e + 1 + t > r.length && Jr.throwError("data array too short", L.errors.BUFFER_OVERRUN, {});
            const n = xf(r, e + 1, t);
            e + 1 + t + n > r.length && Jr.throwError("data array too short", L.errors.BUFFER_OVERRUN, {});
            const i = Se(r.slice(e + 1 + t, e + 1 + t + n));
            return {
                consumed: 1 + t + n,
                result: i
            }
        } else if (r[e] >= 128) {
            const t = r[e] - 128;
            e + 1 + t > r.length && Jr.throwError("data too short", L.errors.BUFFER_OVERRUN, {});
            const n = Se(r.slice(e + 1, e + 1 + t));
            return {
                consumed: 1 + t,
                result: n
            }
        }
        return {
            consumed: 1,
            result: Se(r[e])
        }
    }

    function Ja(r) {
        const e = Ie(r),
            t = Nf(e, 0);
        return t.consumed !== e.length && Jr.throwArgumentError("invalid rlp data", "data", r), t.result
    }
    const $g = "address/5.7.0",
        Ri = new L($g);

    function Tf(r) {
        xt(r, 20) || Ri.throwArgumentError("invalid address", "address", r), r = r.toLowerCase();
        const e = r.substring(2).split(""),
            t = new Uint8Array(40);
        for (let i = 0; i < 40; i++) t[i] = e[i].charCodeAt(0);
        const n = Ie(qt(t));
        for (let i = 0; i < 40; i += 2) n[i >> 1] >> 4 >= 8 && (e[i] = e[i].toUpperCase()), (n[i >> 1] & 15) >= 8 && (e[i + 1] = e[i + 1].toUpperCase());
        return "0x" + e.join("")
    }
    const qg = 9007199254740991;

    function zg(r) {
        return Math.log10 ? Math.log10(r) : Math.log(r) / Math.LN10
    }
    const Va = {};
    for (let r = 0; r < 10; r++) Va[String(r)] = String(r);
    for (let r = 0; r < 26; r++) Va[String.fromCharCode(65 + r)] = String(10 + r);
    const Pf = Math.floor(zg(qg));

    function Gg(r) {
        r = r.toUpperCase(), r = r.substring(4) + r.substring(0, 2) + "00";
        let e = r.split("").map(n => Va[n]).join("");
        for (; e.length >= Pf;) {
            let n = e.substring(0, Pf);
            e = parseInt(n, 10) % 97 + e.substring(n.length)
        }
        let t = String(98 - parseInt(e, 10) % 97);
        for (; t.length < 2;) t = "0" + t;
        return t
    }

    function Sr(r) {
        let e = null;
        if (typeof r != "string" && Ri.throwArgumentError("invalid address", "address", r), r.match(/^(0x)?[0-9a-fA-F]{40}$/)) r.substring(0, 2) !== "0x" && (r = "0x" + r), e = Tf(r), r.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && e !== r && Ri.throwArgumentError("bad address checksum", "address", r);
        else if (r.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
            for (r.substring(2, 4) !== Gg(r) && Ri.throwArgumentError("bad icap checksum", "address", r), e = Hm(r.substring(4)); e.length < 40;) e = "0" + e;
            e = Tf("0x" + e)
        } else Ri.throwArgumentError("invalid address", "address", r);
        return e
    }

    function Hg(r) {
        let e = null;
        try {
            e = Sr(r.from)
        } catch {
            Ri.throwArgumentError("missing from address", "transaction", r)
        }
        const t = Si(Ie(re.from(r.nonce).toHexString()));
        return Sr(Wt(qt(To([e, t])), 12))
    }
    var jg = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const Nt = new L(ff),
        kf = new Uint8Array(32);
    kf.fill(0);
    const Kg = re.from(-1),
        Sf = re.from(0),
        Rf = re.from(1),
        Jg = re.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

    function Vg(r) {
        const e = Ie(r),
            t = e.length % 32;
        return t ? or([e, kf.slice(t)]) : Se(e)
    }
    const Zg = Rt(Rf.toHexString(), 32),
        Wg = Rt(Sf.toHexString(), 32),
        If = {
            name: "string",
            version: "string",
            chainId: "uint256",
            verifyingContract: "address",
            salt: "bytes32"
        },
        Za = ["name", "version", "chainId", "verifyingContract", "salt"];

    function Cf(r) {
        return function(e) {
            return typeof e != "string" && Nt.throwArgumentError(`invalid domain value for ${JSON.stringify(r)}`, `domain.${r}`, e), e
        }
    }
    const Qg = {
        name: Cf("name"),
        version: Cf("version"),
        chainId: function(r) {
            try {
                return re.from(r).toString()
            } catch {}
            return Nt.throwArgumentError('invalid domain value for "chainId"', "domain.chainId", r)
        },
        verifyingContract: function(r) {
            try {
                return Sr(r).toLowerCase()
            } catch {}
            return Nt.throwArgumentError('invalid domain value "verifyingContract"', "domain.verifyingContract", r)
        },
        salt: function(r) {
            try {
                const e = Ie(r);
                if (e.length !== 32) throw new Error("bad length");
                return Se(e)
            } catch {}
            return Nt.throwArgumentError('invalid domain value "salt"', "domain.salt", r)
        }
    };

    function Wa(r) {
        {
            const e = r.match(/^(u?)int(\d*)$/);
            if (e) {
                const t = e[1] === "",
                    n = parseInt(e[2] || "256");
                (n % 8 !== 0 || n > 256 || e[2] && e[2] !== String(n)) && Nt.throwArgumentError("invalid numeric width", "type", r);
                const i = Jg.mask(t ? n - 1 : n),
                    s = t ? i.add(Rf).mul(Kg) : Sf;
                return function(o) {
                    const u = re.from(o);
                    return (u.lt(s) || u.gt(i)) && Nt.throwArgumentError(`value out-of-bounds for ${r}`, "value", o), Rt(u.toTwos(256).toHexString(), 32)
                }
            }
        } {
            const e = r.match(/^bytes(\d+)$/);
            if (e) {
                const t = parseInt(e[1]);
                return (t === 0 || t > 32 || e[1] !== String(t)) && Nt.throwArgumentError("invalid bytes width", "type", r),
                    function(n) {
                        return Ie(n).length !== t && Nt.throwArgumentError(`invalid length for ${r}`, "value", n), Vg(n)
                    }
            }
        }
        switch (r) {
            case "address":
                return function(e) {
                    return Rt(Sr(e), 32)
                };
            case "bool":
                return function(e) {
                    return e ? Zg : Wg
                };
            case "bytes":
                return function(e) {
                    return qt(e)
                };
            case "string":
                return function(e) {
                    return hf(e)
                }
        }
        return null
    }

    function Bf(r, e) {
        return `${r}(${e.map(({name:t,type:n})=>n+" "+t).join(",")})`
    }
    class ur {
        constructor(e) {
            Ue(this, "types", Object.freeze(cs(e))), Ue(this, "_encoderCache", {}), Ue(this, "_types", {});
            const t = {},
                n = {},
                i = {};
            Object.keys(e).forEach(u => {
                t[u] = {}, n[u] = [], i[u] = {}
            });
            for (const u in e) {
                const l = {};
                e[u].forEach(h => {
                    l[h.name] && Nt.throwArgumentError(`duplicate variable name ${JSON.stringify(h.name)} in ${JSON.stringify(u)}`, "types", e), l[h.name] = !0;
                    const c = h.type.match(/^([^\x5b]*)(\x5b|$)/)[1];
                    c === u && Nt.throwArgumentError(`circular type reference to ${JSON.stringify(c)}`, "types", e), !Wa(c) && (n[c] || Nt.throwArgumentError(`unknown type ${JSON.stringify(c)}`, "types", e), n[c].push(u), t[u][c] = !0)
                })
            }
            const s = Object.keys(n).filter(u => n[u].length === 0);
            s.length === 0 ? Nt.throwArgumentError("missing primary type", "types", e) : s.length > 1 && Nt.throwArgumentError(`ambiguous primary types or unused types: ${s.map(u=>JSON.stringify(u)).join(", ")}`, "types", e), Ue(this, "primaryType", s[0]);

            function o(u, l) {
                l[u] && Nt.throwArgumentError(`circular type reference to ${JSON.stringify(u)}`, "types", e), l[u] = !0, Object.keys(t[u]).forEach(h => {
                    n[h] && (o(h, l), Object.keys(l).forEach(c => {
                        i[c][h] = !0
                    }))
                }), delete l[u]
            }
            o(this.primaryType, {});
            for (const u in i) {
                const l = Object.keys(i[u]);
                l.sort(), this._types[u] = Bf(u, e[u]) + l.map(h => Bf(h, e[h])).join("")
            }
        }
        getEncoder(e) {
            let t = this._encoderCache[e];
            return t || (t = this._encoderCache[e] = this._getEncoder(e)), t
        }
        _getEncoder(e) {
            {
                const i = Wa(e);
                if (i) return i
            }
            const t = e.match(/^(.*)(\x5b(\d*)\x5d)$/);
            if (t) {
                const i = t[1],
                    s = this.getEncoder(i),
                    o = parseInt(t[3]);
                return u => {
                    o >= 0 && u.length !== o && Nt.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", u);
                    let l = u.map(s);
                    return this._types[i] && (l = l.map(qt)), qt(or(l))
                }
            }
            const n = this.types[e];
            if (n) {
                const i = hf(this._types[e]);
                return s => {
                    const o = n.map(({
                        name: u,
                        type: l
                    }) => {
                        const h = this.getEncoder(l)(s[u]);
                        return this._types[l] ? qt(h) : h
                    });
                    return o.unshift(i), or(o)
                }
            }
            return Nt.throwArgumentError(`unknown type: ${e}`, "type", e)
        }
        encodeType(e) {
            const t = this._types[e];
            return t || Nt.throwArgumentError(`unknown type: ${JSON.stringify(e)}`, "name", e), t
        }
        encodeData(e, t) {
            return this.getEncoder(e)(t)
        }
        hashStruct(e, t) {
            return qt(this.encodeData(e, t))
        }
        encode(e) {
            return this.encodeData(this.primaryType, e)
        }
        hash(e) {
            return this.hashStruct(this.primaryType, e)
        }
        _visit(e, t, n) {
            if (Wa(e)) return n(e, t);
            const i = e.match(/^(.*)(\x5b(\d*)\x5d)$/);
            if (i) {
                const o = i[1],
                    u = parseInt(i[3]);
                return u >= 0 && t.length !== u && Nt.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", t), t.map(l => this._visit(o, l, n))
            }
            const s = this.types[e];
            return s ? s.reduce((o, {
                name: u,
                type: l
            }) => (o[u] = this._visit(l, t[u], n), o), {}) : Nt.throwArgumentError(`unknown type: ${e}`, "type", e)
        }
        visit(e, t) {
            return this._visit(this.primaryType, e, t)
        }
        static from(e) {
            return new ur(e)
        }
        static getPrimaryType(e) {
            return ur.from(e).primaryType
        }
        static hashStruct(e, t, n) {
            return ur.from(t).hashStruct(e, n)
        }
        static hashDomain(e) {
            const t = [];
            for (const n in e) {
                const i = If[n];
                i || Nt.throwArgumentError(`invalid typed-data domain key: ${JSON.stringify(n)}`, "domain", e), t.push({
                    name: n,
                    type: i
                })
            }
            return t.sort((n, i) => Za.indexOf(n.name) - Za.indexOf(i.name)), ur.hashStruct("EIP712Domain", {
                EIP712Domain: t
            }, e)
        }
        static encode(e, t, n) {
            return or(["0x1901", ur.hashDomain(e), ur.from(t).hash(n)])
        }
        static hash(e, t, n) {
            return qt(ur.encode(e, t, n))
        }
        static resolveNames(e, t, n, i) {
            return jg(this, void 0, void 0, function*() {
                e = rr(e);
                const s = {};
                e.verifyingContract && !xt(e.verifyingContract, 20) && (s[e.verifyingContract] = "0x");
                const o = ur.from(t);
                o.visit(n, (u, l) => (u === "address" && !xt(l, 20) && (s[l] = "0x"), l));
                for (const u in s) s[u] = yield i(u);
                return e.verifyingContract && s[e.verifyingContract] && (e.verifyingContract = s[e.verifyingContract]), n = o.visit(n, (u, l) => u === "address" && s[l] ? s[l] : l), {
                    domain: e,
                    value: n
                }
            })
        }
        static getPayload(e, t, n) {
            ur.hashDomain(e);
            const i = {},
                s = [];
            Za.forEach(l => {
                const h = e[l];
                h != null && (i[l] = Qg[l](h), s.push({
                    name: l,
                    type: If[l]
                }))
            });
            const o = ur.from(t),
                u = rr(t);
            return u.EIP712Domain ? Nt.throwArgumentError("types must not contain EIP712Domain type", "types.EIP712Domain", t) : u.EIP712Domain = s, o.encode(n), {
                types: u,
                domain: i,
                primaryType: o.primaryType,
                message: o.visit(n, (l, h) => {
                    if (l.match(/^bytes(\d*)/)) return Se(Ie(h));
                    if (l.match(/^u?int/)) return re.from(h).toString();
                    switch (l) {
                        case "address":
                            return h.toLowerCase();
                        case "bool":
                            return !!h;
                        case "string":
                            return typeof h != "string" && Nt.throwArgumentError("invalid string", "value", h), h
                    }
                    return Nt.throwArgumentError("unsupported type", "type", l)
                })
            }
        }
    }
    var Of = {},
        De = {},
        ps = Ff;

    function Ff(r, e) {
        if (!r) throw new Error(e || "Assertion failed")
    }
    Ff.equal = function(e, t, n) {
        if (e != t) throw new Error(n || "Assertion failed: " + e + " != " + t)
    };
    var Qa = {
        exports: {}
    };
    typeof Object.create == "function" ? Qa.exports = function(e, t) {
        t && (e.super_ = t, e.prototype = Object.create(t.prototype, {
            constructor: {
                value: e,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }))
    } : Qa.exports = function(e, t) {
        if (t) {
            e.super_ = t;
            var n = function() {};
            n.prototype = t.prototype, e.prototype = new n, e.prototype.constructor = e
        }
    };
    var Yg = Qa.exports,
        Xg = ps,
        e1 = Yg;
    De.inherits = e1;

    function t1(r, e) {
        return (r.charCodeAt(e) & 64512) !== 55296 || e < 0 || e + 1 >= r.length ? !1 : (r.charCodeAt(e + 1) & 64512) === 56320
    }

    function r1(r, e) {
        if (Array.isArray(r)) return r.slice();
        if (!r) return [];
        var t = [];
        if (typeof r == "string")
            if (e) {
                if (e === "hex")
                    for (r = r.replace(/[^a-z0-9]+/ig, ""), r.length % 2 !== 0 && (r = "0" + r), i = 0; i < r.length; i += 2) t.push(parseInt(r[i] + r[i + 1], 16))
            } else
                for (var n = 0, i = 0; i < r.length; i++) {
                    var s = r.charCodeAt(i);
                    s < 128 ? t[n++] = s : s < 2048 ? (t[n++] = s >> 6 | 192, t[n++] = s & 63 | 128) : t1(r, i) ? (s = 65536 + ((s & 1023) << 10) + (r.charCodeAt(++i) & 1023), t[n++] = s >> 18 | 240, t[n++] = s >> 12 & 63 | 128, t[n++] = s >> 6 & 63 | 128, t[n++] = s & 63 | 128) : (t[n++] = s >> 12 | 224, t[n++] = s >> 6 & 63 | 128, t[n++] = s & 63 | 128)
                } else
                    for (i = 0; i < r.length; i++) t[i] = r[i] | 0;
        return t
    }
    De.toArray = r1;

    function n1(r) {
        for (var e = "", t = 0; t < r.length; t++) e += Lf(r[t].toString(16));
        return e
    }
    De.toHex = n1;

    function Df(r) {
        var e = r >>> 24 | r >>> 8 & 65280 | r << 8 & 16711680 | (r & 255) << 24;
        return e >>> 0
    }
    De.htonl = Df;

    function i1(r, e) {
        for (var t = "", n = 0; n < r.length; n++) {
            var i = r[n];
            e === "little" && (i = Df(i)), t += Uf(i.toString(16))
        }
        return t
    }
    De.toHex32 = i1;

    function Lf(r) {
        return r.length === 1 ? "0" + r : r
    }
    De.zero2 = Lf;

    function Uf(r) {
        return r.length === 7 ? "0" + r : r.length === 6 ? "00" + r : r.length === 5 ? "000" + r : r.length === 4 ? "0000" + r : r.length === 3 ? "00000" + r : r.length === 2 ? "000000" + r : r.length === 1 ? "0000000" + r : r
    }
    De.zero8 = Uf;

    function s1(r, e, t, n) {
        var i = t - e;
        Xg(i % 4 === 0);
        for (var s = new Array(i / 4), o = 0, u = e; o < s.length; o++, u += 4) {
            var l;
            n === "big" ? l = r[u] << 24 | r[u + 1] << 16 | r[u + 2] << 8 | r[u + 3] : l = r[u + 3] << 24 | r[u + 2] << 16 | r[u + 1] << 8 | r[u], s[o] = l >>> 0
        }
        return s
    }
    De.join32 = s1;

    function o1(r, e) {
        for (var t = new Array(r.length * 4), n = 0, i = 0; n < r.length; n++, i += 4) {
            var s = r[n];
            e === "big" ? (t[i] = s >>> 24, t[i + 1] = s >>> 16 & 255, t[i + 2] = s >>> 8 & 255, t[i + 3] = s & 255) : (t[i + 3] = s >>> 24, t[i + 2] = s >>> 16 & 255, t[i + 1] = s >>> 8 & 255, t[i] = s & 255)
        }
        return t
    }
    De.split32 = o1;

    function a1(r, e) {
        return r >>> e | r << 32 - e
    }
    De.rotr32 = a1;

    function u1(r, e) {
        return r << e | r >>> 32 - e
    }
    De.rotl32 = u1;

    function l1(r, e) {
        return r + e >>> 0
    }
    De.sum32 = l1;

    function h1(r, e, t) {
        return r + e + t >>> 0
    }
    De.sum32_3 = h1;

    function f1(r, e, t, n) {
        return r + e + t + n >>> 0
    }
    De.sum32_4 = f1;

    function c1(r, e, t, n, i) {
        return r + e + t + n + i >>> 0
    }
    De.sum32_5 = c1;

    function d1(r, e, t, n) {
        var i = r[e],
            s = r[e + 1],
            o = n + s >>> 0,
            u = (o < n ? 1 : 0) + t + i;
        r[e] = u >>> 0, r[e + 1] = o
    }
    De.sum64 = d1;

    function p1(r, e, t, n) {
        var i = e + n >>> 0,
            s = (i < e ? 1 : 0) + r + t;
        return s >>> 0
    }
    De.sum64_hi = p1;

    function m1(r, e, t, n) {
        var i = e + n;
        return i >>> 0
    }
    De.sum64_lo = m1;

    function g1(r, e, t, n, i, s, o, u) {
        var l = 0,
            h = e;
        h = h + n >>> 0, l += h < e ? 1 : 0, h = h + s >>> 0, l += h < s ? 1 : 0, h = h + u >>> 0, l += h < u ? 1 : 0;
        var c = r + t + i + o + l;
        return c >>> 0
    }
    De.sum64_4_hi = g1;

    function y1(r, e, t, n, i, s, o, u) {
        var l = e + n + s + u;
        return l >>> 0
    }
    De.sum64_4_lo = y1;

    function v1(r, e, t, n, i, s, o, u, l, h) {
        var c = 0,
            y = e;
        y = y + n >>> 0, c += y < e ? 1 : 0, y = y + s >>> 0, c += y < s ? 1 : 0, y = y + u >>> 0, c += y < u ? 1 : 0, y = y + h >>> 0, c += y < h ? 1 : 0;
        var v = r + t + i + o + l + c;
        return v >>> 0
    }
    De.sum64_5_hi = v1;

    function w1(r, e, t, n, i, s, o, u, l, h) {
        var c = e + n + s + u + h;
        return c >>> 0
    }
    De.sum64_5_lo = w1;

    function b1(r, e, t) {
        var n = e << 32 - t | r >>> t;
        return n >>> 0
    }
    De.rotr64_hi = b1;

    function A1(r, e, t) {
        var n = r << 32 - t | e >>> t;
        return n >>> 0
    }
    De.rotr64_lo = A1;

    function E1(r, e, t) {
        return r >>> t
    }
    De.shr64_hi = E1;

    function x1(r, e, t) {
        var n = r << 32 - t | e >>> t;
        return n >>> 0
    }
    De.shr64_lo = x1;
    var Ii = {},
        $f = De,
        _1 = ps;

    function Po() {
        this.pending = null, this.pendingTotal = 0, this.blockSize = this.constructor.blockSize, this.outSize = this.constructor.outSize, this.hmacStrength = this.constructor.hmacStrength, this.padLength = this.constructor.padLength / 8, this.endian = "big", this._delta8 = this.blockSize / 8, this._delta32 = this.blockSize / 32
    }
    Ii.BlockHash = Po, Po.prototype.update = function(e, t) {
        if (e = $f.toArray(e, t), this.pending ? this.pending = this.pending.concat(e) : this.pending = e, this.pendingTotal += e.length, this.pending.length >= this._delta8) {
            e = this.pending;
            var n = e.length % this._delta8;
            this.pending = e.slice(e.length - n, e.length), this.pending.length === 0 && (this.pending = null), e = $f.join32(e, 0, e.length - n, this.endian);
            for (var i = 0; i < e.length; i += this._delta32) this._update(e, i, i + this._delta32)
        }
        return this
    }, Po.prototype.digest = function(e) {
        return this.update(this._pad()), _1(this.pending === null), this._digest(e)
    }, Po.prototype._pad = function() {
        var e = this.pendingTotal,
            t = this._delta8,
            n = t - (e + this.padLength) % t,
            i = new Array(n + this.padLength);
        i[0] = 128;
        for (var s = 1; s < n; s++) i[s] = 0;
        if (e <<= 3, this.endian === "big") {
            for (var o = 8; o < this.padLength; o++) i[s++] = 0;
            i[s++] = 0, i[s++] = 0, i[s++] = 0, i[s++] = 0, i[s++] = e >>> 24 & 255, i[s++] = e >>> 16 & 255, i[s++] = e >>> 8 & 255, i[s++] = e & 255
        } else
            for (i[s++] = e & 255, i[s++] = e >>> 8 & 255, i[s++] = e >>> 16 & 255, i[s++] = e >>> 24 & 255, i[s++] = 0, i[s++] = 0, i[s++] = 0, i[s++] = 0, o = 8; o < this.padLength; o++) i[s++] = 0;
        return i
    };
    var Ci = {},
        Vr = {},
        M1 = De,
        Zr = M1.rotr32;

    function N1(r, e, t, n) {
        if (r === 0) return qf(e, t, n);
        if (r === 1 || r === 3) return Gf(e, t, n);
        if (r === 2) return zf(e, t, n)
    }
    Vr.ft_1 = N1;

    function qf(r, e, t) {
        return r & e ^ ~r & t
    }
    Vr.ch32 = qf;

    function zf(r, e, t) {
        return r & e ^ r & t ^ e & t
    }
    Vr.maj32 = zf;

    function Gf(r, e, t) {
        return r ^ e ^ t
    }
    Vr.p32 = Gf;

    function T1(r) {
        return Zr(r, 2) ^ Zr(r, 13) ^ Zr(r, 22)
    }
    Vr.s0_256 = T1;

    function P1(r) {
        return Zr(r, 6) ^ Zr(r, 11) ^ Zr(r, 25)
    }
    Vr.s1_256 = P1;

    function k1(r) {
        return Zr(r, 7) ^ Zr(r, 18) ^ r >>> 3
    }
    Vr.g0_256 = k1;

    function S1(r) {
        return Zr(r, 17) ^ Zr(r, 19) ^ r >>> 10
    }
    Vr.g1_256 = S1;
    var Bi = De,
        R1 = Ii,
        I1 = Vr,
        Ya = Bi.rotl32,
        ms = Bi.sum32,
        C1 = Bi.sum32_5,
        B1 = I1.ft_1,
        Hf = R1.BlockHash,
        O1 = [1518500249, 1859775393, 2400959708, 3395469782];

    function Wr() {
        if (!(this instanceof Wr)) return new Wr;
        Hf.call(this), this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520], this.W = new Array(80)
    }
    Bi.inherits(Wr, Hf);
    var F1 = Wr;
    Wr.blockSize = 512, Wr.outSize = 160, Wr.hmacStrength = 80, Wr.padLength = 64, Wr.prototype._update = function(e, t) {
        for (var n = this.W, i = 0; i < 16; i++) n[i] = e[t + i];
        for (; i < n.length; i++) n[i] = Ya(n[i - 3] ^ n[i - 8] ^ n[i - 14] ^ n[i - 16], 1);
        var s = this.h[0],
            o = this.h[1],
            u = this.h[2],
            l = this.h[3],
            h = this.h[4];
        for (i = 0; i < n.length; i++) {
            var c = ~~(i / 20),
                y = C1(Ya(s, 5), B1(c, o, u, l), h, n[i], O1[c]);
            h = l, l = u, u = Ya(o, 30), o = s, s = y
        }
        this.h[0] = ms(this.h[0], s), this.h[1] = ms(this.h[1], o), this.h[2] = ms(this.h[2], u), this.h[3] = ms(this.h[3], l), this.h[4] = ms(this.h[4], h)
    }, Wr.prototype._digest = function(e) {
        return e === "hex" ? Bi.toHex32(this.h, "big") : Bi.split32(this.h, "big")
    };
    var Oi = De,
        D1 = Ii,
        Fi = Vr,
        L1 = ps,
        Rr = Oi.sum32,
        U1 = Oi.sum32_4,
        $1 = Oi.sum32_5,
        q1 = Fi.ch32,
        z1 = Fi.maj32,
        G1 = Fi.s0_256,
        H1 = Fi.s1_256,
        j1 = Fi.g0_256,
        K1 = Fi.g1_256,
        jf = D1.BlockHash,
        J1 = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];

    function Qr() {
        if (!(this instanceof Qr)) return new Qr;
        jf.call(this), this.h = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], this.k = J1, this.W = new Array(64)
    }
    Oi.inherits(Qr, jf);
    var Kf = Qr;
    Qr.blockSize = 512, Qr.outSize = 256, Qr.hmacStrength = 192, Qr.padLength = 64, Qr.prototype._update = function(e, t) {
        for (var n = this.W, i = 0; i < 16; i++) n[i] = e[t + i];
        for (; i < n.length; i++) n[i] = U1(K1(n[i - 2]), n[i - 7], j1(n[i - 15]), n[i - 16]);
        var s = this.h[0],
            o = this.h[1],
            u = this.h[2],
            l = this.h[3],
            h = this.h[4],
            c = this.h[5],
            y = this.h[6],
            v = this.h[7];
        for (L1(this.k.length === n.length), i = 0; i < n.length; i++) {
            var N = $1(v, H1(h), q1(h, c, y), this.k[i], n[i]),
                P = Rr(G1(s), z1(s, o, u));
            v = y, y = c, c = h, h = Rr(l, N), l = u, u = o, o = s, s = Rr(N, P)
        }
        this.h[0] = Rr(this.h[0], s), this.h[1] = Rr(this.h[1], o), this.h[2] = Rr(this.h[2], u), this.h[3] = Rr(this.h[3], l), this.h[4] = Rr(this.h[4], h), this.h[5] = Rr(this.h[5], c), this.h[6] = Rr(this.h[6], y), this.h[7] = Rr(this.h[7], v)
    }, Qr.prototype._digest = function(e) {
        return e === "hex" ? Oi.toHex32(this.h, "big") : Oi.split32(this.h, "big")
    };
    var Xa = De,
        Jf = Kf;

    function wn() {
        if (!(this instanceof wn)) return new wn;
        Jf.call(this), this.h = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]
    }
    Xa.inherits(wn, Jf);
    var V1 = wn;
    wn.blockSize = 512, wn.outSize = 224, wn.hmacStrength = 192, wn.padLength = 64, wn.prototype._digest = function(e) {
        return e === "hex" ? Xa.toHex32(this.h.slice(0, 7), "big") : Xa.split32(this.h.slice(0, 7), "big")
    };
    var nr = De,
        Z1 = Ii,
        W1 = ps,
        Yr = nr.rotr64_hi,
        Xr = nr.rotr64_lo,
        Vf = nr.shr64_hi,
        Zf = nr.shr64_lo,
        Dn = nr.sum64,
        eu = nr.sum64_hi,
        tu = nr.sum64_lo,
        Q1 = nr.sum64_4_hi,
        Y1 = nr.sum64_4_lo,
        X1 = nr.sum64_5_hi,
        ey = nr.sum64_5_lo,
        Wf = Z1.BlockHash,
        ty = [1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008, 3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591];

    function Ir() {
        if (!(this instanceof Ir)) return new Ir;
        Wf.call(this), this.h = [1779033703, 4089235720, 3144134277, 2227873595, 1013904242, 4271175723, 2773480762, 1595750129, 1359893119, 2917565137, 2600822924, 725511199, 528734635, 4215389547, 1541459225, 327033209], this.k = ty, this.W = new Array(160)
    }
    nr.inherits(Ir, Wf);
    var Qf = Ir;
    Ir.blockSize = 1024, Ir.outSize = 512, Ir.hmacStrength = 192, Ir.padLength = 128, Ir.prototype._prepareBlock = function(e, t) {
        for (var n = this.W, i = 0; i < 32; i++) n[i] = e[t + i];
        for (; i < n.length; i += 2) {
            var s = cy(n[i - 4], n[i - 3]),
                o = dy(n[i - 4], n[i - 3]),
                u = n[i - 14],
                l = n[i - 13],
                h = hy(n[i - 30], n[i - 29]),
                c = fy(n[i - 30], n[i - 29]),
                y = n[i - 32],
                v = n[i - 31];
            n[i] = Q1(s, o, u, l, h, c, y, v), n[i + 1] = Y1(s, o, u, l, h, c, y, v)
        }
    }, Ir.prototype._update = function(e, t) {
        this._prepareBlock(e, t);
        var n = this.W,
            i = this.h[0],
            s = this.h[1],
            o = this.h[2],
            u = this.h[3],
            l = this.h[4],
            h = this.h[5],
            c = this.h[6],
            y = this.h[7],
            v = this.h[8],
            N = this.h[9],
            P = this.h[10],
            S = this.h[11],
            O = this.h[12],
            I = this.h[13],
            C = this.h[14],
            R = this.h[15];
        W1(this.k.length === n.length);
        for (var G = 0; G < n.length; G += 2) {
            var q = C,
                J = R,
                ue = uy(v, N),
                W = ly(v, N),
                se = ry(v, N, P, S, O),
                m = ny(v, N, P, S, O, I),
                w = this.k[G],
                M = this.k[G + 1],
                p = n[G],
                a = n[G + 1],
                d = X1(q, J, ue, W, se, m, w, M, p, a),
                f = ey(q, J, ue, W, se, m, w, M, p, a);
            q = oy(i, s), J = ay(i, s), ue = iy(i, s, o, u, l), W = sy(i, s, o, u, l, h);
            var A = eu(q, J, ue, W),
                E = tu(q, J, ue, W);
            C = O, R = I, O = P, I = S, P = v, S = N, v = eu(c, y, d, f), N = tu(y, y, d, f), c = l, y = h, l = o, h = u, o = i, u = s, i = eu(d, f, A, E), s = tu(d, f, A, E)
        }
        Dn(this.h, 0, i, s), Dn(this.h, 2, o, u), Dn(this.h, 4, l, h), Dn(this.h, 6, c, y), Dn(this.h, 8, v, N), Dn(this.h, 10, P, S), Dn(this.h, 12, O, I), Dn(this.h, 14, C, R)
    }, Ir.prototype._digest = function(e) {
        return e === "hex" ? nr.toHex32(this.h, "big") : nr.split32(this.h, "big")
    };

    function ry(r, e, t, n, i) {
        var s = r & t ^ ~r & i;
        return s < 0 && (s += 4294967296), s
    }

    function ny(r, e, t, n, i, s) {
        var o = e & n ^ ~e & s;
        return o < 0 && (o += 4294967296), o
    }

    function iy(r, e, t, n, i) {
        var s = r & t ^ r & i ^ t & i;
        return s < 0 && (s += 4294967296), s
    }

    function sy(r, e, t, n, i, s) {
        var o = e & n ^ e & s ^ n & s;
        return o < 0 && (o += 4294967296), o
    }

    function oy(r, e) {
        var t = Yr(r, e, 28),
            n = Yr(e, r, 2),
            i = Yr(e, r, 7),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function ay(r, e) {
        var t = Xr(r, e, 28),
            n = Xr(e, r, 2),
            i = Xr(e, r, 7),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function uy(r, e) {
        var t = Yr(r, e, 14),
            n = Yr(r, e, 18),
            i = Yr(e, r, 9),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function ly(r, e) {
        var t = Xr(r, e, 14),
            n = Xr(r, e, 18),
            i = Xr(e, r, 9),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function hy(r, e) {
        var t = Yr(r, e, 1),
            n = Yr(r, e, 8),
            i = Vf(r, e, 7),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function fy(r, e) {
        var t = Xr(r, e, 1),
            n = Xr(r, e, 8),
            i = Zf(r, e, 7),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function cy(r, e) {
        var t = Yr(r, e, 19),
            n = Yr(e, r, 29),
            i = Vf(r, e, 6),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }

    function dy(r, e) {
        var t = Xr(r, e, 19),
            n = Xr(e, r, 29),
            i = Zf(r, e, 6),
            s = t ^ n ^ i;
        return s < 0 && (s += 4294967296), s
    }
    var ru = De,
        Yf = Qf;

    function bn() {
        if (!(this instanceof bn)) return new bn;
        Yf.call(this), this.h = [3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697, 1731405415, 4290775857, 2394180231, 1750603025, 3675008525, 1694076839, 1203062813, 3204075428]
    }
    ru.inherits(bn, Yf);
    var py = bn;
    bn.blockSize = 1024, bn.outSize = 384, bn.hmacStrength = 192, bn.padLength = 128, bn.prototype._digest = function(e) {
        return e === "hex" ? ru.toHex32(this.h.slice(0, 12), "big") : ru.split32(this.h.slice(0, 12), "big")
    }, Ci.sha1 = F1, Ci.sha224 = V1, Ci.sha256 = Kf, Ci.sha384 = py, Ci.sha512 = Qf;
    var Xf = {},
        Wn = De,
        my = Ii,
        ko = Wn.rotl32,
        ec = Wn.sum32,
        gs = Wn.sum32_3,
        tc = Wn.sum32_4,
        rc = my.BlockHash;

    function en() {
        if (!(this instanceof en)) return new en;
        rc.call(this), this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520], this.endian = "little"
    }
    Wn.inherits(en, rc), Xf.ripemd160 = en, en.blockSize = 512, en.outSize = 160, en.hmacStrength = 192, en.padLength = 64, en.prototype._update = function(e, t) {
        for (var n = this.h[0], i = this.h[1], s = this.h[2], o = this.h[3], u = this.h[4], l = n, h = i, c = s, y = o, v = u, N = 0; N < 80; N++) {
            var P = ec(ko(tc(n, nc(N, i, s, o), e[vy[N] + t], gy(N)), by[N]), u);
            n = u, u = o, o = ko(s, 10), s = i, i = P, P = ec(ko(tc(l, nc(79 - N, h, c, y), e[wy[N] + t], yy(N)), Ay[N]), v), l = v, v = y, y = ko(c, 10), c = h, h = P
        }
        P = gs(this.h[1], s, y), this.h[1] = gs(this.h[2], o, v), this.h[2] = gs(this.h[3], u, l), this.h[3] = gs(this.h[4], n, h), this.h[4] = gs(this.h[0], i, c), this.h[0] = P
    }, en.prototype._digest = function(e) {
        return e === "hex" ? Wn.toHex32(this.h, "little") : Wn.split32(this.h, "little")
    };

    function nc(r, e, t, n) {
        return r <= 15 ? e ^ t ^ n : r <= 31 ? e & t | ~e & n : r <= 47 ? (e | ~t) ^ n : r <= 63 ? e & n | t & ~n : e ^ (t | ~n)
    }

    function gy(r) {
        return r <= 15 ? 0 : r <= 31 ? 1518500249 : r <= 47 ? 1859775393 : r <= 63 ? 2400959708 : 2840853838
    }

    function yy(r) {
        return r <= 15 ? 1352829926 : r <= 31 ? 1548603684 : r <= 47 ? 1836072691 : r <= 63 ? 2053994217 : 0
    }
    var vy = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13],
        wy = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11],
        by = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6],
        Ay = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11],
        Ey = De,
        xy = ps;

    function Di(r, e, t) {
        if (!(this instanceof Di)) return new Di(r, e, t);
        this.Hash = r, this.blockSize = r.blockSize / 8, this.outSize = r.outSize / 8, this.inner = null, this.outer = null, this._init(Ey.toArray(e, t))
    }
    var _y = Di;
    Di.prototype._init = function(e) {
            e.length > this.blockSize && (e = new this.Hash().update(e).digest()), xy(e.length <= this.blockSize);
            for (var t = e.length; t < this.blockSize; t++) e.push(0);
            for (t = 0; t < e.length; t++) e[t] ^= 54;
            for (this.inner = new this.Hash().update(e), t = 0; t < e.length; t++) e[t] ^= 106;
            this.outer = new this.Hash().update(e)
        }, Di.prototype.update = function(e, t) {
            return this.inner.update(e, t), this
        }, Di.prototype.digest = function(e) {
            return this.outer.update(this.inner.digest()), this.outer.digest(e)
        },
        function(r) {
            var e = r;
            e.utils = De, e.common = Ii, e.sha = Ci, e.ripemd = Xf, e.hmac = _y, e.sha1 = e.sha.sha1, e.sha256 = e.sha.sha256, e.sha224 = e.sha.sha224, e.sha384 = e.sha.sha384, e.sha512 = e.sha.sha512, e.ripemd160 = e.ripemd.ripemd160
        }(Of);
    var tn = Yi(Of);

    function ic(r) {
        return "0x" + tn.sha256().update(Ie(r)).digest("hex")
    }
    const My = "web/5.7.1";
    var Ny = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };

    function Ty(r, e) {
        return Ny(this, void 0, void 0, function*() {
            e == null && (e = {});
            const t = {
                method: e.method || "GET",
                headers: e.headers || {},
                body: e.body || void 0
            };
            if (e.skipFetchSetup !== !0 && (t.mode = "cors", t.cache = "no-cache", t.credentials = "same-origin", t.redirect = "follow", t.referrer = "client"), e.fetchOptions != null) {
                const o = e.fetchOptions;
                o.mode && (t.mode = o.mode), o.cache && (t.cache = o.cache), o.credentials && (t.credentials = o.credentials), o.redirect && (t.redirect = o.redirect), o.referrer && (t.referrer = o.referrer)
            }
            const n = yield fetch(r, t), i = yield n.arrayBuffer(), s = {};
            return n.headers.forEach ? n.headers.forEach((o, u) => {
                s[u.toLowerCase()] = o
            }) : n.headers.keys().forEach(o => {
                s[o.toLowerCase()] = n.headers.get(o)
            }), {
                headers: s,
                statusCode: n.status,
                statusMessage: n.statusText,
                body: Ie(new Uint8Array(i))
            }
        })
    }
    var Py = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const Cr = new L(My);

    function sc(r) {
        return new Promise(e => {
            setTimeout(e, r)
        })
    }

    function Ln(r, e) {
        if (r == null) return null;
        if (typeof r == "string") return r;
        if (qa(r)) {
            if (e && (e.split("/")[0] === "text" || e.split(";")[0].trim() === "application/json")) try {
                return xo(r)
            } catch {}
            return Se(r)
        }
        return r
    }

    function ky(r) {
        return vn(r.replace(/%([0-9a-f][0-9a-f])/gi, (e, t) => String.fromCharCode(parseInt(t, 16))))
    }

    function Sy(r, e, t) {
        const n = typeof r == "object" && r.throttleLimit != null ? r.throttleLimit : 12;
        Cr.assertArgument(n > 0 && n % 1 === 0, "invalid connection throttle limit", "connection.throttleLimit", n);
        const i = typeof r == "object" ? r.throttleCallback : null,
            s = typeof r == "object" && typeof r.throttleSlotInterval == "number" ? r.throttleSlotInterval : 100;
        Cr.assertArgument(s > 0 && s % 1 === 0, "invalid connection throttle slot interval", "connection.throttleSlotInterval", s);
        const o = typeof r == "object" ? !!r.errorPassThrough : !1,
            u = {};
        let l = null;
        const h = {
            method: "GET"
        };
        let c = !1,
            y = 2 * 60 * 1e3;
        if (typeof r == "string") l = r;
        else if (typeof r == "object") {
            if ((r == null || r.url == null) && Cr.throwArgumentError("missing URL", "connection.url", r), l = r.url, typeof r.timeout == "number" && r.timeout > 0 && (y = r.timeout), r.headers)
                for (const I in r.headers) u[I.toLowerCase()] = {
                    key: I,
                    value: String(r.headers[I])
                }, ["if-none-match", "if-modified-since"].indexOf(I.toLowerCase()) >= 0 && (c = !0);
            if (h.allowGzip = !!r.allowGzip, r.user != null && r.password != null) {
                l.substring(0, 6) !== "https:" && r.allowInsecureAuthentication !== !0 && Cr.throwError("basic authentication requires a secure https url", L.errors.INVALID_ARGUMENT, {
                    argument: "url",
                    url: l,
                    user: r.user,
                    password: "[REDACTED]"
                });
                const I = r.user + ":" + r.password;
                u.authorization = {
                    key: "Authorization",
                    value: "Basic " + nf(vn(I))
                }
            }
            r.skipFetchSetup != null && (h.skipFetchSetup = !!r.skipFetchSetup), r.fetchOptions != null && (h.fetchOptions = rr(r.fetchOptions))
        }
        const v = new RegExp("^data:([^;:]*)?(;base64)?,(.*)$", "i"),
            N = l ? l.match(v) : null;
        if (N) try {
            const I = {
                statusCode: 200,
                statusMessage: "OK",
                headers: {
                    "content-type": N[1] || "text/plain"
                },
                body: N[2] ? rf(N[3]) : ky(N[3])
            };
            let C = I.body;
            return t && (C = t(I.body, I)), Promise.resolve(C)
        } catch (I) {
            Cr.throwError("processing response error", L.errors.SERVER_ERROR, {
                body: Ln(N[1], N[2]),
                error: I,
                requestBody: null,
                requestMethod: "GET",
                url: l
            })
        }
        e && (h.method = "POST", h.body = e, u["content-type"] == null && (u["content-type"] = {
            key: "Content-Type",
            value: "application/octet-stream"
        }), u["content-length"] == null && (u["content-length"] = {
            key: "Content-Length",
            value: String(e.length)
        }));
        const P = {};
        Object.keys(u).forEach(I => {
            const C = u[I];
            P[C.key] = C.value
        }), h.headers = P;
        const S = function() {
                let I = null;
                return {
                    promise: new Promise(function(G, q) {
                        y && (I = setTimeout(() => {
                            I != null && (I = null, q(Cr.makeError("timeout", L.errors.TIMEOUT, {
                                requestBody: Ln(h.body, P["content-type"]),
                                requestMethod: h.method,
                                timeout: y,
                                url: l
                            })))
                        }, y))
                    }),
                    cancel: function() {
                        I != null && (clearTimeout(I), I = null)
                    }
                }
            }(),
            O = function() {
                return Py(this, void 0, void 0, function*() {
                    for (let I = 0; I < n; I++) {
                        let C = null;
                        try {
                            if (C = yield Ty(l, h), I < n) {
                                if (C.statusCode === 301 || C.statusCode === 302) {
                                    const G = C.headers.location || "";
                                    if (h.method === "GET" && G.match(/^https:/)) {
                                        l = C.headers.location;
                                        continue
                                    }
                                } else if (C.statusCode === 429) {
                                    let G = !0;
                                    if (i && (G = yield i(I, l)), G) {
                                        let q = 0;
                                        const J = C.headers["retry-after"];
                                        typeof J == "string" && J.match(/^[1-9][0-9]*$/) ? q = parseInt(J) * 1e3 : q = s * parseInt(String(Math.random() * Math.pow(2, I))), yield sc(q);
                                        continue
                                    }
                                }
                            }
                        } catch (G) {
                            C = G.response, C == null && (S.cancel(), Cr.throwError("missing response", L.errors.SERVER_ERROR, {
                                requestBody: Ln(h.body, P["content-type"]),
                                requestMethod: h.method,
                                serverError: G,
                                url: l
                            }))
                        }
                        let R = C.body;
                        if (c && C.statusCode === 304 ? R = null : !o && (C.statusCode < 200 || C.statusCode >= 300) && (S.cancel(), Cr.throwError("bad response", L.errors.SERVER_ERROR, {
                                status: C.statusCode,
                                headers: C.headers,
                                body: Ln(R, C.headers ? C.headers["content-type"] : null),
                                requestBody: Ln(h.body, P["content-type"]),
                                requestMethod: h.method,
                                url: l
                            })), t) try {
                            const G = yield t(R, C);
                            return S.cancel(), G
                        } catch (G) {
                            if (G.throttleRetry && I < n) {
                                let q = !0;
                                if (i && (q = yield i(I, l)), q) {
                                    const J = s * parseInt(String(Math.random() * Math.pow(2, I)));
                                    yield sc(J);
                                    continue
                                }
                            }
                            S.cancel(), Cr.throwError("processing response error", L.errors.SERVER_ERROR, {
                                body: Ln(R, C.headers ? C.headers["content-type"] : null),
                                error: G,
                                requestBody: Ln(h.body, P["content-type"]),
                                requestMethod: h.method,
                                url: l
                            })
                        }
                        return S.cancel(), R
                    }
                    return Cr.throwError("failed response", L.errors.SERVER_ERROR, {
                        requestBody: Ln(h.body, P["content-type"]),
                        requestMethod: h.method,
                        url: l
                    })
                })
            }();
        return Promise.race([S.promise, O])
    }

    function nu(r, e, t) {
        let n = (s, o) => {
                let u = null;
                if (s != null) try {
                    u = JSON.parse(xo(s))
                } catch (l) {
                    Cr.throwError("invalid JSON", L.errors.SERVER_ERROR, {
                        body: s,
                        error: l
                    })
                }
                return t && (u = t(u, o)), u
            },
            i = null;
        if (e != null) {
            i = vn(e);
            const s = typeof r == "string" ? {
                url: r
            } : rr(r);
            s.headers ? Object.keys(s.headers).filter(u => u.toLowerCase() === "content-type").length !== 0 || (s.headers = rr(s.headers), s.headers["content-type"] = "application/json") : s.headers = {
                "content-type": "application/json"
            }, r = s
        }
        return Sy(r, i, n)
    }

    function ys(r, e) {
        return e || (e = {}), e = rr(e), e.floor == null && (e.floor = 0), e.ceiling == null && (e.ceiling = 1e4), e.interval == null && (e.interval = 250), new Promise(function(t, n) {
            let i = null,
                s = !1;
            const o = () => s ? !1 : (s = !0, i && clearTimeout(i), !0);
            e.timeout && (i = setTimeout(() => {
                o() && n(new Error("timeout"))
            }, e.timeout));
            const u = e.retryLimit;
            let l = 0;

            function h() {
                return r().then(function(c) {
                    if (c !== void 0) o() && t(c);
                    else if (e.oncePoll) e.oncePoll.once("poll", h);
                    else if (e.onceBlock) e.onceBlock.once("block", h);
                    else if (!s) {
                        if (l++, l > u) {
                            o() && n(new Error("retry limit reached"));
                            return
                        }
                        let y = e.interval * parseInt(String(Math.random() * Math.pow(2, l)));
                        y < e.floor && (y = e.floor), y > e.ceiling && (y = e.ceiling), setTimeout(h, y)
                    }
                    return null
                }, function(c) {
                    o() && n(c)
                })
            }
            h()
        })
    }
    for (var So = "qpzry9x8gf2tvdw0s3jn54khce6mua7l", iu = {}, Ro = 0; Ro < So.length; Ro++) {
        var su = So.charAt(Ro);
        if (iu[su] !== void 0) throw new TypeError(su + " is ambiguous");
        iu[su] = Ro
    }

    function Li(r) {
        var e = r >> 25;
        return (r & 33554431) << 5 ^ -(e >> 0 & 1) & 996825010 ^ -(e >> 1 & 1) & 642813549 ^ -(e >> 2 & 1) & 513874426 ^ -(e >> 3 & 1) & 1027748829 ^ -(e >> 4 & 1) & 705979059
    }

    function oc(r) {
        for (var e = 1, t = 0; t < r.length; ++t) {
            var n = r.charCodeAt(t);
            if (n < 33 || n > 126) return "Invalid prefix (" + r + ")";
            e = Li(e) ^ n >> 5
        }
        for (e = Li(e), t = 0; t < r.length; ++t) {
            var i = r.charCodeAt(t);
            e = Li(e) ^ i & 31
        }
        return e
    }

    function Ry(r, e, t) {
        if (t = t || 90, r.length + 7 + e.length > t) throw new TypeError("Exceeds length limit");
        r = r.toLowerCase();
        var n = oc(r);
        if (typeof n == "string") throw new Error(n);
        for (var i = r + "1", s = 0; s < e.length; ++s) {
            var o = e[s];
            if (o >> 5) throw new Error("Non 5-bit word");
            n = Li(n) ^ o, i += So.charAt(o)
        }
        for (s = 0; s < 6; ++s) n = Li(n);
        for (n ^= 1, s = 0; s < 6; ++s) {
            var u = n >> (5 - s) * 5 & 31;
            i += So.charAt(u)
        }
        return i
    }

    function ac(r, e) {
        if (e = e || 90, r.length < 8) return r + " too short";
        if (r.length > e) return "Exceeds length limit";
        var t = r.toLowerCase(),
            n = r.toUpperCase();
        if (r !== t && r !== n) return "Mixed-case string " + r;
        r = t;
        var i = r.lastIndexOf("1");
        if (i === -1) return "No separator character for " + r;
        if (i === 0) return "Missing prefix for " + r;
        var s = r.slice(0, i),
            o = r.slice(i + 1);
        if (o.length < 6) return "Data too short";
        var u = oc(s);
        if (typeof u == "string") return u;
        for (var l = [], h = 0; h < o.length; ++h) {
            var c = o.charAt(h),
                y = iu[c];
            if (y === void 0) return "Unknown character " + c;
            u = Li(u) ^ y, !(h + 6 >= o.length) && l.push(y)
        }
        return u !== 1 ? "Invalid checksum for " + r : {
            prefix: s,
            words: l
        }
    }

    function Iy() {
        var r = ac.apply(null, arguments);
        if (typeof r == "object") return r
    }

    function Cy(r) {
        var e = ac.apply(null, arguments);
        if (typeof e == "object") return e;
        throw new Error(e)
    }

    function Io(r, e, t, n) {
        for (var i = 0, s = 0, o = (1 << t) - 1, u = [], l = 0; l < r.length; ++l)
            for (i = i << e | r[l], s += e; s >= t;) s -= t, u.push(i >> s & o);
        if (n) s > 0 && u.push(i << t - s & o);
        else {
            if (s >= e) return "Excess padding";
            if (i << t - s & o) return "Non-zero padding"
        }
        return u
    }

    function By(r) {
        var e = Io(r, 8, 5, !0);
        if (Array.isArray(e)) return e
    }

    function Oy(r) {
        var e = Io(r, 8, 5, !0);
        if (Array.isArray(e)) return e;
        throw new Error(e)
    }

    function Fy(r) {
        var e = Io(r, 5, 8, !1);
        if (Array.isArray(e)) return e
    }

    function Dy(r) {
        var e = Io(r, 5, 8, !1);
        if (Array.isArray(e)) return e;
        throw new Error(e)
    }
    var Ly = {
            decodeUnsafe: Iy,
            decode: Cy,
            encode: Ry,
            toWordsUnsafe: By,
            toWords: Oy,
            fromWordsUnsafe: Fy,
            fromWords: Dy
        },
        uc = Yi(Ly);
    const Co = "providers/5.7.2";

    function Ui(r, e, t) {
        return t = {
            path: e,
            exports: {},
            require: function(n, i) {
                return Uy(n, i ? ? t.path)
            }
        }, r(t, t.exports), t.exports
    }

    function Uy() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")
    }
    var ou = lc;

    function lc(r, e) {
        if (!r) throw new Error(e || "Assertion failed")
    }
    lc.equal = function(e, t, n) {
        if (e != t) throw new Error(n || "Assertion failed: " + e + " != " + t)
    };
    var Br = Ui(function(r, e) {
            var t = e;

            function n(o, u) {
                if (Array.isArray(o)) return o.slice();
                if (!o) return [];
                var l = [];
                if (typeof o != "string") {
                    for (var h = 0; h < o.length; h++) l[h] = o[h] | 0;
                    return l
                }
                if (u === "hex") {
                    o = o.replace(/[^a-z0-9]+/ig, ""), o.length % 2 !== 0 && (o = "0" + o);
                    for (var h = 0; h < o.length; h += 2) l.push(parseInt(o[h] + o[h + 1], 16))
                } else
                    for (var h = 0; h < o.length; h++) {
                        var c = o.charCodeAt(h),
                            y = c >> 8,
                            v = c & 255;
                        y ? l.push(y, v) : l.push(v)
                    }
                return l
            }
            t.toArray = n;

            function i(o) {
                return o.length === 1 ? "0" + o : o
            }
            t.zero2 = i;

            function s(o) {
                for (var u = "", l = 0; l < o.length; l++) u += i(o[l].toString(16));
                return u
            }
            t.toHex = s, t.encode = function(u, l) {
                return l === "hex" ? s(u) : u
            }
        }),
        lr = Ui(function(r, e) {
            var t = e;
            t.assert = ou, t.toArray = Br.toArray, t.zero2 = Br.zero2, t.toHex = Br.toHex, t.encode = Br.encode;

            function n(l, h, c) {
                var y = new Array(Math.max(l.bitLength(), c) + 1);
                y.fill(0);
                for (var v = 1 << h + 1, N = l.clone(), P = 0; P < y.length; P++) {
                    var S, O = N.andln(v - 1);
                    N.isOdd() ? (O > (v >> 1) - 1 ? S = (v >> 1) - O : S = O, N.isubn(S)) : S = 0, y[P] = S, N.iushrn(1)
                }
                return y
            }
            t.getNAF = n;

            function i(l, h) {
                var c = [
                    [],
                    []
                ];
                l = l.clone(), h = h.clone();
                for (var y = 0, v = 0, N; l.cmpn(-y) > 0 || h.cmpn(-v) > 0;) {
                    var P = l.andln(3) + y & 3,
                        S = h.andln(3) + v & 3;
                    P === 3 && (P = -1), S === 3 && (S = -1);
                    var O;
                    P & 1 ? (N = l.andln(7) + y & 7, (N === 3 || N === 5) && S === 2 ? O = -P : O = P) : O = 0, c[0].push(O);
                    var I;
                    S & 1 ? (N = h.andln(7) + v & 7, (N === 3 || N === 5) && P === 2 ? I = -S : I = S) : I = 0, c[1].push(I), 2 * y === O + 1 && (y = 1 - y), 2 * v === I + 1 && (v = 1 - v), l.iushrn(1), h.iushrn(1)
                }
                return c
            }
            t.getJSF = i;

            function s(l, h, c) {
                var y = "_" + h;
                l.prototype[h] = function() {
                    return this[y] !== void 0 ? this[y] : this[y] = c.call(this)
                }
            }
            t.cachedProperty = s;

            function o(l) {
                return typeof l == "string" ? t.toArray(l, "hex") : l
            }
            t.parseBytes = o;

            function u(l) {
                return new ke(l, "hex", "le")
            }
            t.intFromLE = u
        }),
        Bo = lr.getNAF,
        $y = lr.getJSF,
        Oo = lr.assert;

    function Un(r, e) {
        this.type = r, this.p = new ke(e.p, 16), this.red = e.prime ? ke.red(e.prime) : ke.mont(this.p), this.zero = new ke(0).toRed(this.red), this.one = new ke(1).toRed(this.red), this.two = new ke(2).toRed(this.red), this.n = e.n && new ke(e.n, 16), this.g = e.g && this.pointFromJSON(e.g, e.gRed), this._wnafT1 = new Array(4), this._wnafT2 = new Array(4), this._wnafT3 = new Array(4), this._wnafT4 = new Array(4), this._bitLength = this.n ? this.n.bitLength() : 0;
        var t = this.n && this.p.div(this.n);
        !t || t.cmpn(100) > 0 ? this.redN = null : (this._maxwellTrick = !0, this.redN = this.n.toRed(this.red))
    }
    var Qn = Un;
    Un.prototype.point = function() {
        throw new Error("Not implemented")
    }, Un.prototype.validate = function() {
        throw new Error("Not implemented")
    }, Un.prototype._fixedNafMul = function(e, t) {
        Oo(e.precomputed);
        var n = e._getDoubles(),
            i = Bo(t, 1, this._bitLength),
            s = (1 << n.step + 1) - (n.step % 2 === 0 ? 2 : 1);
        s /= 3;
        var o = [],
            u, l;
        for (u = 0; u < i.length; u += n.step) {
            l = 0;
            for (var h = u + n.step - 1; h >= u; h--) l = (l << 1) + i[h];
            o.push(l)
        }
        for (var c = this.jpoint(null, null, null), y = this.jpoint(null, null, null), v = s; v > 0; v--) {
            for (u = 0; u < o.length; u++) l = o[u], l === v ? y = y.mixedAdd(n.points[u]) : l === -v && (y = y.mixedAdd(n.points[u].neg()));
            c = c.add(y)
        }
        return c.toP()
    }, Un.prototype._wnafMul = function(e, t) {
        var n = 4,
            i = e._getNAFPoints(n);
        n = i.wnd;
        for (var s = i.points, o = Bo(t, n, this._bitLength), u = this.jpoint(null, null, null), l = o.length - 1; l >= 0; l--) {
            for (var h = 0; l >= 0 && o[l] === 0; l--) h++;
            if (l >= 0 && h++, u = u.dblp(h), l < 0) break;
            var c = o[l];
            Oo(c !== 0), e.type === "affine" ? c > 0 ? u = u.mixedAdd(s[c - 1 >> 1]) : u = u.mixedAdd(s[-c - 1 >> 1].neg()) : c > 0 ? u = u.add(s[c - 1 >> 1]) : u = u.add(s[-c - 1 >> 1].neg())
        }
        return e.type === "affine" ? u.toP() : u
    }, Un.prototype._wnafMulAdd = function(e, t, n, i, s) {
        var o = this._wnafT1,
            u = this._wnafT2,
            l = this._wnafT3,
            h = 0,
            c, y, v;
        for (c = 0; c < i; c++) {
            v = t[c];
            var N = v._getNAFPoints(e);
            o[c] = N.wnd, u[c] = N.points
        }
        for (c = i - 1; c >= 1; c -= 2) {
            var P = c - 1,
                S = c;
            if (o[P] !== 1 || o[S] !== 1) {
                l[P] = Bo(n[P], o[P], this._bitLength), l[S] = Bo(n[S], o[S], this._bitLength), h = Math.max(l[P].length, h), h = Math.max(l[S].length, h);
                continue
            }
            var O = [t[P], null, null, t[S]];
            t[P].y.cmp(t[S].y) === 0 ? (O[1] = t[P].add(t[S]), O[2] = t[P].toJ().mixedAdd(t[S].neg())) : t[P].y.cmp(t[S].y.redNeg()) === 0 ? (O[1] = t[P].toJ().mixedAdd(t[S]), O[2] = t[P].add(t[S].neg())) : (O[1] = t[P].toJ().mixedAdd(t[S]), O[2] = t[P].toJ().mixedAdd(t[S].neg()));
            var I = [-3, -1, -5, -7, 0, 7, 5, 1, 3],
                C = $y(n[P], n[S]);
            for (h = Math.max(C[0].length, h), l[P] = new Array(h), l[S] = new Array(h), y = 0; y < h; y++) {
                var R = C[0][y] | 0,
                    G = C[1][y] | 0;
                l[P][y] = I[(R + 1) * 3 + (G + 1)], l[S][y] = 0, u[P] = O
            }
        }
        var q = this.jpoint(null, null, null),
            J = this._wnafT4;
        for (c = h; c >= 0; c--) {
            for (var ue = 0; c >= 0;) {
                var W = !0;
                for (y = 0; y < i; y++) J[y] = l[y][c] | 0, J[y] !== 0 && (W = !1);
                if (!W) break;
                ue++, c--
            }
            if (c >= 0 && ue++, q = q.dblp(ue), c < 0) break;
            for (y = 0; y < i; y++) {
                var se = J[y];
                se !== 0 && (se > 0 ? v = u[y][se - 1 >> 1] : se < 0 && (v = u[y][-se - 1 >> 1].neg()), v.type === "affine" ? q = q.mixedAdd(v) : q = q.add(v))
            }
        }
        for (c = 0; c < i; c++) u[c] = null;
        return s ? q : q.toP()
    };

    function mr(r, e) {
        this.curve = r, this.type = e, this.precomputed = null
    }
    Un.BasePoint = mr, mr.prototype.eq = function() {
        throw new Error("Not implemented")
    }, mr.prototype.validate = function() {
        return this.curve.validate(this)
    }, Un.prototype.decodePoint = function(e, t) {
        e = lr.toArray(e, t);
        var n = this.p.byteLength();
        if ((e[0] === 4 || e[0] === 6 || e[0] === 7) && e.length - 1 === 2 * n) {
            e[0] === 6 ? Oo(e[e.length - 1] % 2 === 0) : e[0] === 7 && Oo(e[e.length - 1] % 2 === 1);
            var i = this.point(e.slice(1, 1 + n), e.slice(1 + n, 1 + 2 * n));
            return i
        } else if ((e[0] === 2 || e[0] === 3) && e.length - 1 === n) return this.pointFromX(e.slice(1, 1 + n), e[0] === 3);
        throw new Error("Unknown point format")
    }, mr.prototype.encodeCompressed = function(e) {
        return this.encode(e, !0)
    }, mr.prototype._encode = function(e) {
        var t = this.curve.p.byteLength(),
            n = this.getX().toArray("be", t);
        return e ? [this.getY().isEven() ? 2 : 3].concat(n) : [4].concat(n, this.getY().toArray("be", t))
    }, mr.prototype.encode = function(e, t) {
        return lr.encode(this._encode(t), e)
    }, mr.prototype.precompute = function(e) {
        if (this.precomputed) return this;
        var t = {
            doubles: null,
            naf: null,
            beta: null
        };
        return t.naf = this._getNAFPoints(8), t.doubles = this._getDoubles(4, e), t.beta = this._getBeta(), this.precomputed = t, this
    }, mr.prototype._hasDoubles = function(e) {
        if (!this.precomputed) return !1;
        var t = this.precomputed.doubles;
        return t ? t.points.length >= Math.ceil((e.bitLength() + 1) / t.step) : !1
    }, mr.prototype._getDoubles = function(e, t) {
        if (this.precomputed && this.precomputed.doubles) return this.precomputed.doubles;
        for (var n = [this], i = this, s = 0; s < t; s += e) {
            for (var o = 0; o < e; o++) i = i.dbl();
            n.push(i)
        }
        return {
            step: e,
            points: n
        }
    }, mr.prototype._getNAFPoints = function(e) {
        if (this.precomputed && this.precomputed.naf) return this.precomputed.naf;
        for (var t = [this], n = (1 << e) - 1, i = n === 1 ? null : this.dbl(), s = 1; s < n; s++) t[s] = t[s - 1].add(i);
        return {
            wnd: e,
            points: t
        }
    }, mr.prototype._getBeta = function() {
        return null
    }, mr.prototype.dblp = function(e) {
        for (var t = this, n = 0; n < e; n++) t = t.dbl();
        return t
    };
    var au = Ui(function(r) {
            typeof Object.create == "function" ? r.exports = function(t, n) {
                n && (t.super_ = n, t.prototype = Object.create(n.prototype, {
                    constructor: {
                        value: t,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }))
            } : r.exports = function(t, n) {
                if (n) {
                    t.super_ = n;
                    var i = function() {};
                    i.prototype = n.prototype, t.prototype = new i, t.prototype.constructor = t
                }
            }
        }),
        qy = lr.assert;

    function gr(r) {
        Qn.call(this, "short", r), this.a = new ke(r.a, 16).toRed(this.red), this.b = new ke(r.b, 16).toRed(this.red), this.tinv = this.two.redInvm(), this.zeroA = this.a.fromRed().cmpn(0) === 0, this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0, this.endo = this._getEndomorphism(r), this._endoWnafT1 = new Array(4), this._endoWnafT2 = new Array(4)
    }
    au(gr, Qn);
    var zy = gr;
    gr.prototype._getEndomorphism = function(e) {
        if (!(!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)) {
            var t, n;
            if (e.beta) t = new ke(e.beta, 16).toRed(this.red);
            else {
                var i = this._getEndoRoots(this.p);
                t = i[0].cmp(i[1]) < 0 ? i[0] : i[1], t = t.toRed(this.red)
            }
            if (e.lambda) n = new ke(e.lambda, 16);
            else {
                var s = this._getEndoRoots(this.n);
                this.g.mul(s[0]).x.cmp(this.g.x.redMul(t)) === 0 ? n = s[0] : (n = s[1], qy(this.g.mul(n).x.cmp(this.g.x.redMul(t)) === 0))
            }
            var o;
            return e.basis ? o = e.basis.map(function(u) {
                return {
                    a: new ke(u.a, 16),
                    b: new ke(u.b, 16)
                }
            }) : o = this._getEndoBasis(n), {
                beta: t,
                lambda: n,
                basis: o
            }
        }
    }, gr.prototype._getEndoRoots = function(e) {
        var t = e === this.p ? this.red : ke.mont(e),
            n = new ke(2).toRed(t).redInvm(),
            i = n.redNeg(),
            s = new ke(3).toRed(t).redNeg().redSqrt().redMul(n),
            o = i.redAdd(s).fromRed(),
            u = i.redSub(s).fromRed();
        return [o, u]
    }, gr.prototype._getEndoBasis = function(e) {
        for (var t = this.n.ushrn(Math.floor(this.n.bitLength() / 2)), n = e, i = this.n.clone(), s = new ke(1), o = new ke(0), u = new ke(0), l = new ke(1), h, c, y, v, N, P, S, O = 0, I, C; n.cmpn(0) !== 0;) {
            var R = i.div(n);
            I = i.sub(R.mul(n)), C = u.sub(R.mul(s));
            var G = l.sub(R.mul(o));
            if (!y && I.cmp(t) < 0) h = S.neg(), c = s, y = I.neg(), v = C;
            else if (y && ++O === 2) break;
            S = I, i = n, n = I, u = s, s = C, l = o, o = G
        }
        N = I.neg(), P = C;
        var q = y.sqr().add(v.sqr()),
            J = N.sqr().add(P.sqr());
        return J.cmp(q) >= 0 && (N = h, P = c), y.negative && (y = y.neg(), v = v.neg()), N.negative && (N = N.neg(), P = P.neg()), [{
            a: y,
            b: v
        }, {
            a: N,
            b: P
        }]
    }, gr.prototype._endoSplit = function(e) {
        var t = this.endo.basis,
            n = t[0],
            i = t[1],
            s = i.b.mul(e).divRound(this.n),
            o = n.b.neg().mul(e).divRound(this.n),
            u = s.mul(n.a),
            l = o.mul(i.a),
            h = s.mul(n.b),
            c = o.mul(i.b),
            y = e.sub(u).sub(l),
            v = h.add(c).neg();
        return {
            k1: y,
            k2: v
        }
    }, gr.prototype.pointFromX = function(e, t) {
        e = new ke(e, 16), e.red || (e = e.toRed(this.red));
        var n = e.redSqr().redMul(e).redIAdd(e.redMul(this.a)).redIAdd(this.b),
            i = n.redSqrt();
        if (i.redSqr().redSub(n).cmp(this.zero) !== 0) throw new Error("invalid point");
        var s = i.fromRed().isOdd();
        return (t && !s || !t && s) && (i = i.redNeg()), this.point(e, i)
    }, gr.prototype.validate = function(e) {
        if (e.inf) return !0;
        var t = e.x,
            n = e.y,
            i = this.a.redMul(t),
            s = t.redSqr().redMul(t).redIAdd(i).redIAdd(this.b);
        return n.redSqr().redISub(s).cmpn(0) === 0
    }, gr.prototype._endoWnafMulAdd = function(e, t, n) {
        for (var i = this._endoWnafT1, s = this._endoWnafT2, o = 0; o < e.length; o++) {
            var u = this._endoSplit(t[o]),
                l = e[o],
                h = l._getBeta();
            u.k1.negative && (u.k1.ineg(), l = l.neg(!0)), u.k2.negative && (u.k2.ineg(), h = h.neg(!0)), i[o * 2] = l, i[o * 2 + 1] = h, s[o * 2] = u.k1, s[o * 2 + 1] = u.k2
        }
        for (var c = this._wnafMulAdd(1, i, s, o * 2, n), y = 0; y < o * 2; y++) i[y] = null, s[y] = null;
        return c
    };

    function Dt(r, e, t, n) {
        Qn.BasePoint.call(this, r, "affine"), e === null && t === null ? (this.x = null, this.y = null, this.inf = !0) : (this.x = new ke(e, 16), this.y = new ke(t, 16), n && (this.x.forceRed(this.curve.red), this.y.forceRed(this.curve.red)), this.x.red || (this.x = this.x.toRed(this.curve.red)), this.y.red || (this.y = this.y.toRed(this.curve.red)), this.inf = !1)
    }
    au(Dt, Qn.BasePoint), gr.prototype.point = function(e, t, n) {
        return new Dt(this, e, t, n)
    }, gr.prototype.pointFromJSON = function(e, t) {
        return Dt.fromJSON(this, e, t)
    }, Dt.prototype._getBeta = function() {
        if (this.curve.endo) {
            var e = this.precomputed;
            if (e && e.beta) return e.beta;
            var t = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
            if (e) {
                var n = this.curve,
                    i = function(s) {
                        return n.point(s.x.redMul(n.endo.beta), s.y)
                    };
                e.beta = t, t.precomputed = {
                    beta: null,
                    naf: e.naf && {
                        wnd: e.naf.wnd,
                        points: e.naf.points.map(i)
                    },
                    doubles: e.doubles && {
                        step: e.doubles.step,
                        points: e.doubles.points.map(i)
                    }
                }
            }
            return t
        }
    }, Dt.prototype.toJSON = function() {
        return this.precomputed ? [this.x, this.y, this.precomputed && {
            doubles: this.precomputed.doubles && {
                step: this.precomputed.doubles.step,
                points: this.precomputed.doubles.points.slice(1)
            },
            naf: this.precomputed.naf && {
                wnd: this.precomputed.naf.wnd,
                points: this.precomputed.naf.points.slice(1)
            }
        }] : [this.x, this.y]
    }, Dt.fromJSON = function(e, t, n) {
        typeof t == "string" && (t = JSON.parse(t));
        var i = e.point(t[0], t[1], n);
        if (!t[2]) return i;

        function s(u) {
            return e.point(u[0], u[1], n)
        }
        var o = t[2];
        return i.precomputed = {
            beta: null,
            doubles: o.doubles && {
                step: o.doubles.step,
                points: [i].concat(o.doubles.points.map(s))
            },
            naf: o.naf && {
                wnd: o.naf.wnd,
                points: [i].concat(o.naf.points.map(s))
            }
        }, i
    }, Dt.prototype.inspect = function() {
        return this.isInfinity() ? "<EC Point Infinity>" : "<EC Point x: " + this.x.fromRed().toString(16, 2) + " y: " + this.y.fromRed().toString(16, 2) + ">"
    }, Dt.prototype.isInfinity = function() {
        return this.inf
    }, Dt.prototype.add = function(e) {
        if (this.inf) return e;
        if (e.inf) return this;
        if (this.eq(e)) return this.dbl();
        if (this.neg().eq(e)) return this.curve.point(null, null);
        if (this.x.cmp(e.x) === 0) return this.curve.point(null, null);
        var t = this.y.redSub(e.y);
        t.cmpn(0) !== 0 && (t = t.redMul(this.x.redSub(e.x).redInvm()));
        var n = t.redSqr().redISub(this.x).redISub(e.x),
            i = t.redMul(this.x.redSub(n)).redISub(this.y);
        return this.curve.point(n, i)
    }, Dt.prototype.dbl = function() {
        if (this.inf) return this;
        var e = this.y.redAdd(this.y);
        if (e.cmpn(0) === 0) return this.curve.point(null, null);
        var t = this.curve.a,
            n = this.x.redSqr(),
            i = e.redInvm(),
            s = n.redAdd(n).redIAdd(n).redIAdd(t).redMul(i),
            o = s.redSqr().redISub(this.x.redAdd(this.x)),
            u = s.redMul(this.x.redSub(o)).redISub(this.y);
        return this.curve.point(o, u)
    }, Dt.prototype.getX = function() {
        return this.x.fromRed()
    }, Dt.prototype.getY = function() {
        return this.y.fromRed()
    }, Dt.prototype.mul = function(e) {
        return e = new ke(e, 16), this.isInfinity() ? this : this._hasDoubles(e) ? this.curve._fixedNafMul(this, e) : this.curve.endo ? this.curve._endoWnafMulAdd([this], [e]) : this.curve._wnafMul(this, e)
    }, Dt.prototype.mulAdd = function(e, t, n) {
        var i = [this, t],
            s = [e, n];
        return this.curve.endo ? this.curve._endoWnafMulAdd(i, s) : this.curve._wnafMulAdd(1, i, s, 2)
    }, Dt.prototype.jmulAdd = function(e, t, n) {
        var i = [this, t],
            s = [e, n];
        return this.curve.endo ? this.curve._endoWnafMulAdd(i, s, !0) : this.curve._wnafMulAdd(1, i, s, 2, !0)
    }, Dt.prototype.eq = function(e) {
        return this === e || this.inf === e.inf && (this.inf || this.x.cmp(e.x) === 0 && this.y.cmp(e.y) === 0)
    }, Dt.prototype.neg = function(e) {
        if (this.inf) return this;
        var t = this.curve.point(this.x, this.y.redNeg());
        if (e && this.precomputed) {
            var n = this.precomputed,
                i = function(s) {
                    return s.neg()
                };
            t.precomputed = {
                naf: n.naf && {
                    wnd: n.naf.wnd,
                    points: n.naf.points.map(i)
                },
                doubles: n.doubles && {
                    step: n.doubles.step,
                    points: n.doubles.points.map(i)
                }
            }
        }
        return t
    }, Dt.prototype.toJ = function() {
        if (this.inf) return this.curve.jpoint(null, null, null);
        var e = this.curve.jpoint(this.x, this.y, this.curve.one);
        return e
    };

    function zt(r, e, t, n) {
        Qn.BasePoint.call(this, r, "jacobian"), e === null && t === null && n === null ? (this.x = this.curve.one, this.y = this.curve.one, this.z = new ke(0)) : (this.x = new ke(e, 16), this.y = new ke(t, 16), this.z = new ke(n, 16)), this.x.red || (this.x = this.x.toRed(this.curve.red)), this.y.red || (this.y = this.y.toRed(this.curve.red)), this.z.red || (this.z = this.z.toRed(this.curve.red)), this.zOne = this.z === this.curve.one
    }
    au(zt, Qn.BasePoint), gr.prototype.jpoint = function(e, t, n) {
        return new zt(this, e, t, n)
    }, zt.prototype.toP = function() {
        if (this.isInfinity()) return this.curve.point(null, null);
        var e = this.z.redInvm(),
            t = e.redSqr(),
            n = this.x.redMul(t),
            i = this.y.redMul(t).redMul(e);
        return this.curve.point(n, i)
    }, zt.prototype.neg = function() {
        return this.curve.jpoint(this.x, this.y.redNeg(), this.z)
    }, zt.prototype.add = function(e) {
        if (this.isInfinity()) return e;
        if (e.isInfinity()) return this;
        var t = e.z.redSqr(),
            n = this.z.redSqr(),
            i = this.x.redMul(t),
            s = e.x.redMul(n),
            o = this.y.redMul(t.redMul(e.z)),
            u = e.y.redMul(n.redMul(this.z)),
            l = i.redSub(s),
            h = o.redSub(u);
        if (l.cmpn(0) === 0) return h.cmpn(0) !== 0 ? this.curve.jpoint(null, null, null) : this.dbl();
        var c = l.redSqr(),
            y = c.redMul(l),
            v = i.redMul(c),
            N = h.redSqr().redIAdd(y).redISub(v).redISub(v),
            P = h.redMul(v.redISub(N)).redISub(o.redMul(y)),
            S = this.z.redMul(e.z).redMul(l);
        return this.curve.jpoint(N, P, S)
    }, zt.prototype.mixedAdd = function(e) {
        if (this.isInfinity()) return e.toJ();
        if (e.isInfinity()) return this;
        var t = this.z.redSqr(),
            n = this.x,
            i = e.x.redMul(t),
            s = this.y,
            o = e.y.redMul(t).redMul(this.z),
            u = n.redSub(i),
            l = s.redSub(o);
        if (u.cmpn(0) === 0) return l.cmpn(0) !== 0 ? this.curve.jpoint(null, null, null) : this.dbl();
        var h = u.redSqr(),
            c = h.redMul(u),
            y = n.redMul(h),
            v = l.redSqr().redIAdd(c).redISub(y).redISub(y),
            N = l.redMul(y.redISub(v)).redISub(s.redMul(c)),
            P = this.z.redMul(u);
        return this.curve.jpoint(v, N, P)
    }, zt.prototype.dblp = function(e) {
        if (e === 0) return this;
        if (this.isInfinity()) return this;
        if (!e) return this.dbl();
        var t;
        if (this.curve.zeroA || this.curve.threeA) {
            var n = this;
            for (t = 0; t < e; t++) n = n.dbl();
            return n
        }
        var i = this.curve.a,
            s = this.curve.tinv,
            o = this.x,
            u = this.y,
            l = this.z,
            h = l.redSqr().redSqr(),
            c = u.redAdd(u);
        for (t = 0; t < e; t++) {
            var y = o.redSqr(),
                v = c.redSqr(),
                N = v.redSqr(),
                P = y.redAdd(y).redIAdd(y).redIAdd(i.redMul(h)),
                S = o.redMul(v),
                O = P.redSqr().redISub(S.redAdd(S)),
                I = S.redISub(O),
                C = P.redMul(I);
            C = C.redIAdd(C).redISub(N);
            var R = c.redMul(l);
            t + 1 < e && (h = h.redMul(N)), o = O, l = R, c = C
        }
        return this.curve.jpoint(o, c.redMul(s), l)
    }, zt.prototype.dbl = function() {
        return this.isInfinity() ? this : this.curve.zeroA ? this._zeroDbl() : this.curve.threeA ? this._threeDbl() : this._dbl()
    }, zt.prototype._zeroDbl = function() {
        var e, t, n;
        if (this.zOne) {
            var i = this.x.redSqr(),
                s = this.y.redSqr(),
                o = s.redSqr(),
                u = this.x.redAdd(s).redSqr().redISub(i).redISub(o);
            u = u.redIAdd(u);
            var l = i.redAdd(i).redIAdd(i),
                h = l.redSqr().redISub(u).redISub(u),
                c = o.redIAdd(o);
            c = c.redIAdd(c), c = c.redIAdd(c), e = h, t = l.redMul(u.redISub(h)).redISub(c), n = this.y.redAdd(this.y)
        } else {
            var y = this.x.redSqr(),
                v = this.y.redSqr(),
                N = v.redSqr(),
                P = this.x.redAdd(v).redSqr().redISub(y).redISub(N);
            P = P.redIAdd(P);
            var S = y.redAdd(y).redIAdd(y),
                O = S.redSqr(),
                I = N.redIAdd(N);
            I = I.redIAdd(I), I = I.redIAdd(I), e = O.redISub(P).redISub(P), t = S.redMul(P.redISub(e)).redISub(I), n = this.y.redMul(this.z), n = n.redIAdd(n)
        }
        return this.curve.jpoint(e, t, n)
    }, zt.prototype._threeDbl = function() {
        var e, t, n;
        if (this.zOne) {
            var i = this.x.redSqr(),
                s = this.y.redSqr(),
                o = s.redSqr(),
                u = this.x.redAdd(s).redSqr().redISub(i).redISub(o);
            u = u.redIAdd(u);
            var l = i.redAdd(i).redIAdd(i).redIAdd(this.curve.a),
                h = l.redSqr().redISub(u).redISub(u);
            e = h;
            var c = o.redIAdd(o);
            c = c.redIAdd(c), c = c.redIAdd(c), t = l.redMul(u.redISub(h)).redISub(c), n = this.y.redAdd(this.y)
        } else {
            var y = this.z.redSqr(),
                v = this.y.redSqr(),
                N = this.x.redMul(v),
                P = this.x.redSub(y).redMul(this.x.redAdd(y));
            P = P.redAdd(P).redIAdd(P);
            var S = N.redIAdd(N);
            S = S.redIAdd(S);
            var O = S.redAdd(S);
            e = P.redSqr().redISub(O), n = this.y.redAdd(this.z).redSqr().redISub(v).redISub(y);
            var I = v.redSqr();
            I = I.redIAdd(I), I = I.redIAdd(I), I = I.redIAdd(I), t = P.redMul(S.redISub(e)).redISub(I)
        }
        return this.curve.jpoint(e, t, n)
    }, zt.prototype._dbl = function() {
        var e = this.curve.a,
            t = this.x,
            n = this.y,
            i = this.z,
            s = i.redSqr().redSqr(),
            o = t.redSqr(),
            u = n.redSqr(),
            l = o.redAdd(o).redIAdd(o).redIAdd(e.redMul(s)),
            h = t.redAdd(t);
        h = h.redIAdd(h);
        var c = h.redMul(u),
            y = l.redSqr().redISub(c.redAdd(c)),
            v = c.redISub(y),
            N = u.redSqr();
        N = N.redIAdd(N), N = N.redIAdd(N), N = N.redIAdd(N);
        var P = l.redMul(v).redISub(N),
            S = n.redAdd(n).redMul(i);
        return this.curve.jpoint(y, P, S)
    }, zt.prototype.trpl = function() {
        if (!this.curve.zeroA) return this.dbl().add(this);
        var e = this.x.redSqr(),
            t = this.y.redSqr(),
            n = this.z.redSqr(),
            i = t.redSqr(),
            s = e.redAdd(e).redIAdd(e),
            o = s.redSqr(),
            u = this.x.redAdd(t).redSqr().redISub(e).redISub(i);
        u = u.redIAdd(u), u = u.redAdd(u).redIAdd(u), u = u.redISub(o);
        var l = u.redSqr(),
            h = i.redIAdd(i);
        h = h.redIAdd(h), h = h.redIAdd(h), h = h.redIAdd(h);
        var c = s.redIAdd(u).redSqr().redISub(o).redISub(l).redISub(h),
            y = t.redMul(c);
        y = y.redIAdd(y), y = y.redIAdd(y);
        var v = this.x.redMul(l).redISub(y);
        v = v.redIAdd(v), v = v.redIAdd(v);
        var N = this.y.redMul(c.redMul(h.redISub(c)).redISub(u.redMul(l)));
        N = N.redIAdd(N), N = N.redIAdd(N), N = N.redIAdd(N);
        var P = this.z.redAdd(u).redSqr().redISub(n).redISub(l);
        return this.curve.jpoint(v, N, P)
    }, zt.prototype.mul = function(e, t) {
        return e = new ke(e, t), this.curve._wnafMul(this, e)
    }, zt.prototype.eq = function(e) {
        if (e.type === "affine") return this.eq(e.toJ());
        if (this === e) return !0;
        var t = this.z.redSqr(),
            n = e.z.redSqr();
        if (this.x.redMul(n).redISub(e.x.redMul(t)).cmpn(0) !== 0) return !1;
        var i = t.redMul(this.z),
            s = n.redMul(e.z);
        return this.y.redMul(s).redISub(e.y.redMul(i)).cmpn(0) === 0
    }, zt.prototype.eqXToP = function(e) {
        var t = this.z.redSqr(),
            n = e.toRed(this.curve.red).redMul(t);
        if (this.x.cmp(n) === 0) return !0;
        for (var i = e.clone(), s = this.curve.redN.redMul(t);;) {
            if (i.iadd(this.curve.n), i.cmp(this.curve.p) >= 0) return !1;
            if (n.redIAdd(s), this.x.cmp(n) === 0) return !0
        }
    }, zt.prototype.inspect = function() {
        return this.isInfinity() ? "<EC JPoint Infinity>" : "<EC JPoint x: " + this.x.toString(16, 2) + " y: " + this.y.toString(16, 2) + " z: " + this.z.toString(16, 2) + ">"
    }, zt.prototype.isInfinity = function() {
        return this.z.cmpn(0) === 0
    };
    var Fo = Ui(function(r, e) {
            var t = e;
            t.base = Qn, t.short = zy, t.mont = null, t.edwards = null
        }),
        Do = Ui(function(r, e) {
            var t = e,
                n = lr.assert;

            function i(u) {
                u.type === "short" ? this.curve = new Fo.short(u) : u.type === "edwards" ? this.curve = new Fo.edwards(u) : this.curve = new Fo.mont(u), this.g = this.curve.g, this.n = this.curve.n, this.hash = u.hash, n(this.g.validate(), "Invalid curve"), n(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O")
            }
            t.PresetCurve = i;

            function s(u, l) {
                Object.defineProperty(t, u, {
                    configurable: !0,
                    enumerable: !0,
                    get: function() {
                        var h = new i(l);
                        return Object.defineProperty(t, u, {
                            configurable: !0,
                            enumerable: !0,
                            value: h
                        }), h
                    }
                })
            }
            s("p192", {
                type: "short",
                prime: "p192",
                p: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",
                a: "ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",
                b: "64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",
                n: "ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",
                hash: tn.sha256,
                gRed: !1,
                g: ["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012", "07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"]
            }), s("p224", {
                type: "short",
                prime: "p224",
                p: "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",
                a: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",
                b: "b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",
                n: "ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",
                hash: tn.sha256,
                gRed: !1,
                g: ["b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21", "bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"]
            }), s("p256", {
                type: "short",
                prime: null,
                p: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",
                a: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",
                b: "5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",
                n: "ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",
                hash: tn.sha256,
                gRed: !1,
                g: ["6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296", "4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"]
            }), s("p384", {
                type: "short",
                prime: null,
                p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",
                a: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",
                b: "b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",
                n: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",
                hash: tn.sha384,
                gRed: !1,
                g: ["aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7", "3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"]
            }), s("p521", {
                type: "short",
                prime: null,
                p: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",
                a: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",
                b: "00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",
                n: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",
                hash: tn.sha512,
                gRed: !1,
                g: ["000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66", "00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"]
            }), s("curve25519", {
                type: "mont",
                prime: "p25519",
                p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
                a: "76d06",
                b: "1",
                n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
                hash: tn.sha256,
                gRed: !1,
                g: ["9"]
            }), s("ed25519", {
                type: "edwards",
                prime: "p25519",
                p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
                a: "-1",
                c: "1",
                d: "52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",
                n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
                hash: tn.sha256,
                gRed: !1,
                g: ["216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a", "6666666666666666666666666666666666666666666666666666666666666658"]
            });
            var o;
            try {
                o = null.crash()
            } catch {
                o = void 0
            }
            s("secp256k1", {
                type: "short",
                prime: "k256",
                p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
                a: "0",
                b: "7",
                n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
                h: "1",
                hash: tn.sha256,
                beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
                lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
                basis: [{
                    a: "3086d221a7d46bcde86c90e49284eb15",
                    b: "-e4437ed6010e88286f547fa90abfe4c3"
                }, {
                    a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
                    b: "3086d221a7d46bcde86c90e49284eb15"
                }],
                gRed: !1,
                g: ["79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", o]
            })
        });

    function $n(r) {
        if (!(this instanceof $n)) return new $n(r);
        this.hash = r.hash, this.predResist = !!r.predResist, this.outLen = this.hash.outSize, this.minEntropy = r.minEntropy || this.hash.hmacStrength, this._reseed = null, this.reseedInterval = null, this.K = null, this.V = null;
        var e = Br.toArray(r.entropy, r.entropyEnc || "hex"),
            t = Br.toArray(r.nonce, r.nonceEnc || "hex"),
            n = Br.toArray(r.pers, r.persEnc || "hex");
        ou(e.length >= this.minEntropy / 8, "Not enough entropy. Minimum is: " + this.minEntropy + " bits"), this._init(e, t, n)
    }
    var hc = $n;
    $n.prototype._init = function(e, t, n) {
        var i = e.concat(t).concat(n);
        this.K = new Array(this.outLen / 8), this.V = new Array(this.outLen / 8);
        for (var s = 0; s < this.V.length; s++) this.K[s] = 0, this.V[s] = 1;
        this._update(i), this._reseed = 1, this.reseedInterval = 281474976710656
    }, $n.prototype._hmac = function() {
        return new tn.hmac(this.hash, this.K)
    }, $n.prototype._update = function(e) {
        var t = this._hmac().update(this.V).update([0]);
        e && (t = t.update(e)), this.K = t.digest(), this.V = this._hmac().update(this.V).digest(), e && (this.K = this._hmac().update(this.V).update([1]).update(e).digest(), this.V = this._hmac().update(this.V).digest())
    }, $n.prototype.reseed = function(e, t, n, i) {
        typeof t != "string" && (i = n, n = t, t = null), e = Br.toArray(e, t), n = Br.toArray(n, i), ou(e.length >= this.minEntropy / 8, "Not enough entropy. Minimum is: " + this.minEntropy + " bits"), this._update(e.concat(n || [])), this._reseed = 1
    }, $n.prototype.generate = function(e, t, n, i) {
        if (this._reseed > this.reseedInterval) throw new Error("Reseed is required");
        typeof t != "string" && (i = n, n = t, t = null), n && (n = Br.toArray(n, i || "hex"), this._update(n));
        for (var s = []; s.length < e;) this.V = this._hmac().update(this.V).digest(), s = s.concat(this.V);
        var o = s.slice(0, e);
        return this._update(n), this._reseed++, Br.encode(o, t)
    };
    var uu = lr.assert;

    function Kt(r, e) {
        this.ec = r, this.priv = null, this.pub = null, e.priv && this._importPrivate(e.priv, e.privEnc), e.pub && this._importPublic(e.pub, e.pubEnc)
    }
    var lu = Kt;
    Kt.fromPublic = function(e, t, n) {
        return t instanceof Kt ? t : new Kt(e, {
            pub: t,
            pubEnc: n
        })
    }, Kt.fromPrivate = function(e, t, n) {
        return t instanceof Kt ? t : new Kt(e, {
            priv: t,
            privEnc: n
        })
    }, Kt.prototype.validate = function() {
        var e = this.getPublic();
        return e.isInfinity() ? {
            result: !1,
            reason: "Invalid public key"
        } : e.validate() ? e.mul(this.ec.curve.n).isInfinity() ? {
            result: !0,
            reason: null
        } : {
            result: !1,
            reason: "Public key * N != O"
        } : {
            result: !1,
            reason: "Public key is not a point"
        }
    }, Kt.prototype.getPublic = function(e, t) {
        return typeof e == "string" && (t = e, e = null), this.pub || (this.pub = this.ec.g.mul(this.priv)), t ? this.pub.encode(t, e) : this.pub
    }, Kt.prototype.getPrivate = function(e) {
        return e === "hex" ? this.priv.toString(16, 2) : this.priv
    }, Kt.prototype._importPrivate = function(e, t) {
        this.priv = new ke(e, t || 16), this.priv = this.priv.umod(this.ec.curve.n)
    }, Kt.prototype._importPublic = function(e, t) {
        if (e.x || e.y) {
            this.ec.curve.type === "mont" ? uu(e.x, "Need x coordinate") : (this.ec.curve.type === "short" || this.ec.curve.type === "edwards") && uu(e.x && e.y, "Need both x and y coordinate"), this.pub = this.ec.curve.point(e.x, e.y);
            return
        }
        this.pub = this.ec.curve.decodePoint(e, t)
    }, Kt.prototype.derive = function(e) {
        return e.validate() || uu(e.validate(), "public point not validated"), e.mul(this.priv).getX()
    }, Kt.prototype.sign = function(e, t, n) {
        return this.ec.sign(e, this, t, n)
    }, Kt.prototype.verify = function(e, t) {
        return this.ec.verify(e, t, this)
    }, Kt.prototype.inspect = function() {
        return "<Key priv: " + (this.priv && this.priv.toString(16, 2)) + " pub: " + (this.pub && this.pub.inspect()) + " >"
    };
    var Gy = lr.assert;

    function Lo(r, e) {
        if (r instanceof Lo) return r;
        this._importDER(r, e) || (Gy(r.r && r.s, "Signature without r or s"), this.r = new ke(r.r, 16), this.s = new ke(r.s, 16), r.recoveryParam === void 0 ? this.recoveryParam = null : this.recoveryParam = r.recoveryParam)
    }
    var Uo = Lo;

    function Hy() {
        this.place = 0
    }

    function hu(r, e) {
        var t = r[e.place++];
        if (!(t & 128)) return t;
        var n = t & 15;
        if (n === 0 || n > 4) return !1;
        for (var i = 0, s = 0, o = e.place; s < n; s++, o++) i <<= 8, i |= r[o], i >>>= 0;
        return i <= 127 ? !1 : (e.place = o, i)
    }

    function fc(r) {
        for (var e = 0, t = r.length - 1; !r[e] && !(r[e + 1] & 128) && e < t;) e++;
        return e === 0 ? r : r.slice(e)
    }
    Lo.prototype._importDER = function(e, t) {
        e = lr.toArray(e, t);
        var n = new Hy;
        if (e[n.place++] !== 48) return !1;
        var i = hu(e, n);
        if (i === !1 || i + n.place !== e.length || e[n.place++] !== 2) return !1;
        var s = hu(e, n);
        if (s === !1) return !1;
        var o = e.slice(n.place, s + n.place);
        if (n.place += s, e[n.place++] !== 2) return !1;
        var u = hu(e, n);
        if (u === !1 || e.length !== u + n.place) return !1;
        var l = e.slice(n.place, u + n.place);
        if (o[0] === 0)
            if (o[1] & 128) o = o.slice(1);
            else return !1;
        if (l[0] === 0)
            if (l[1] & 128) l = l.slice(1);
            else return !1;
        return this.r = new ke(o), this.s = new ke(l), this.recoveryParam = null, !0
    };

    function fu(r, e) {
        if (e < 128) {
            r.push(e);
            return
        }
        var t = 1 + (Math.log(e) / Math.LN2 >>> 3);
        for (r.push(t | 128); --t;) r.push(e >>> (t << 3) & 255);
        r.push(e)
    }
    Lo.prototype.toDER = function(e) {
        var t = this.r.toArray(),
            n = this.s.toArray();
        for (t[0] & 128 && (t = [0].concat(t)), n[0] & 128 && (n = [0].concat(n)), t = fc(t), n = fc(n); !n[0] && !(n[1] & 128);) n = n.slice(1);
        var i = [2];
        fu(i, t.length), i = i.concat(t), i.push(2), fu(i, n.length);
        var s = i.concat(n),
            o = [48];
        return fu(o, s.length), o = o.concat(s), lr.encode(o, e)
    };
    var jy = function() {
            throw new Error("unsupported")
        },
        cc = lr.assert;

    function yr(r) {
        if (!(this instanceof yr)) return new yr(r);
        typeof r == "string" && (cc(Object.prototype.hasOwnProperty.call(Do, r), "Unknown curve " + r), r = Do[r]), r instanceof Do.PresetCurve && (r = {
            curve: r
        }), this.curve = r.curve.curve, this.n = this.curve.n, this.nh = this.n.ushrn(1), this.g = this.curve.g, this.g = r.curve.g, this.g.precompute(r.curve.n.bitLength() + 1), this.hash = r.hash || r.curve.hash
    }
    var Ky = yr;
    yr.prototype.keyPair = function(e) {
        return new lu(this, e)
    }, yr.prototype.keyFromPrivate = function(e, t) {
        return lu.fromPrivate(this, e, t)
    }, yr.prototype.keyFromPublic = function(e, t) {
        return lu.fromPublic(this, e, t)
    }, yr.prototype.genKeyPair = function(e) {
        e || (e = {});
        for (var t = new hc({
                hash: this.hash,
                pers: e.pers,
                persEnc: e.persEnc || "utf8",
                entropy: e.entropy || jy(this.hash.hmacStrength),
                entropyEnc: e.entropy && e.entropyEnc || "utf8",
                nonce: this.n.toArray()
            }), n = this.n.byteLength(), i = this.n.sub(new ke(2));;) {
            var s = new ke(t.generate(n));
            if (!(s.cmp(i) > 0)) return s.iaddn(1), this.keyFromPrivate(s)
        }
    }, yr.prototype._truncateToN = function(e, t) {
        var n = e.byteLength() * 8 - this.n.bitLength();
        return n > 0 && (e = e.ushrn(n)), !t && e.cmp(this.n) >= 0 ? e.sub(this.n) : e
    }, yr.prototype.sign = function(e, t, n, i) {
        typeof n == "object" && (i = n, n = null), i || (i = {}), t = this.keyFromPrivate(t, n), e = this._truncateToN(new ke(e, 16));
        for (var s = this.n.byteLength(), o = t.getPrivate().toArray("be", s), u = e.toArray("be", s), l = new hc({
                hash: this.hash,
                entropy: o,
                nonce: u,
                pers: i.pers,
                persEnc: i.persEnc || "utf8"
            }), h = this.n.sub(new ke(1)), c = 0;; c++) {
            var y = i.k ? i.k(c) : new ke(l.generate(this.n.byteLength()));
            if (y = this._truncateToN(y, !0), !(y.cmpn(1) <= 0 || y.cmp(h) >= 0)) {
                var v = this.g.mul(y);
                if (!v.isInfinity()) {
                    var N = v.getX(),
                        P = N.umod(this.n);
                    if (P.cmpn(0) !== 0) {
                        var S = y.invm(this.n).mul(P.mul(t.getPrivate()).iadd(e));
                        if (S = S.umod(this.n), S.cmpn(0) !== 0) {
                            var O = (v.getY().isOdd() ? 1 : 0) | (N.cmp(P) !== 0 ? 2 : 0);
                            return i.canonical && S.cmp(this.nh) > 0 && (S = this.n.sub(S), O ^= 1), new Uo({
                                r: P,
                                s: S,
                                recoveryParam: O
                            })
                        }
                    }
                }
            }
        }
    }, yr.prototype.verify = function(e, t, n, i) {
        e = this._truncateToN(new ke(e, 16)), n = this.keyFromPublic(n, i), t = new Uo(t, "hex");
        var s = t.r,
            o = t.s;
        if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0 || o.cmpn(1) < 0 || o.cmp(this.n) >= 0) return !1;
        var u = o.invm(this.n),
            l = u.mul(e).umod(this.n),
            h = u.mul(s).umod(this.n),
            c;
        return this.curve._maxwellTrick ? (c = this.g.jmulAdd(l, n.getPublic(), h), c.isInfinity() ? !1 : c.eqXToP(s)) : (c = this.g.mulAdd(l, n.getPublic(), h), c.isInfinity() ? !1 : c.getX().umod(this.n).cmp(s) === 0)
    }, yr.prototype.recoverPubKey = function(r, e, t, n) {
        cc((3 & t) === t, "The recovery param is more than two bits"), e = new Uo(e, n);
        var i = this.n,
            s = new ke(r),
            o = e.r,
            u = e.s,
            l = t & 1,
            h = t >> 1;
        if (o.cmp(this.curve.p.umod(this.curve.n)) >= 0 && h) throw new Error("Unable to find sencond key candinate");
        h ? o = this.curve.pointFromX(o.add(this.curve.n), l) : o = this.curve.pointFromX(o, l);
        var c = e.r.invm(i),
            y = i.sub(s).mul(c).umod(i),
            v = u.mul(c).umod(i);
        return this.g.mulAdd(y, o, v)
    }, yr.prototype.getKeyRecoveryParam = function(r, e, t, n) {
        if (e = new Uo(e, n), e.recoveryParam !== null) return e.recoveryParam;
        for (var i = 0; i < 4; i++) {
            var s;
            try {
                s = this.recoverPubKey(r, e, i)
            } catch {
                continue
            }
            if (s.eq(t)) return i
        }
        throw new Error("Unable to find valid recovery factor")
    };
    var Jy = Ui(function(r, e) {
            var t = e;
            t.version = "6.5.4", t.utils = lr, t.rand = function() {
                throw new Error("unsupported")
            }, t.curve = Fo, t.curves = Do, t.ec = Ky, t.eddsa = null
        }),
        Vy = Jy.ec;
    const Zy = "signing-key/5.7.0",
        cu = new L(Zy);
    let du = null;

    function rn() {
        return du || (du = new Vy("secp256k1")), du
    }
    class Wy {
        constructor(e) {
            Ue(this, "curve", "secp256k1"), Ue(this, "privateKey", Se(e)), Zn(this.privateKey) !== 32 && cu.throwArgumentError("invalid private key", "privateKey", "[[ REDACTED ]]");
            const t = rn().keyFromPrivate(Ie(this.privateKey));
            Ue(this, "publicKey", "0x" + t.getPublic(!1, "hex")), Ue(this, "compressedPublicKey", "0x" + t.getPublic(!0, "hex")), Ue(this, "_isSigningKey", !0)
        }
        _addPoint(e) {
            const t = rn().keyFromPublic(Ie(this.publicKey)),
                n = rn().keyFromPublic(Ie(e));
            return "0x" + t.pub.add(n.pub).encodeCompressed("hex")
        }
        signDigest(e) {
            const t = rn().keyFromPrivate(Ie(this.privateKey)),
                n = Ie(e);
            n.length !== 32 && cu.throwArgumentError("bad digest length", "digest", e);
            const i = t.sign(n, {
                canonical: !0
            });
            return vo({
                recoveryParam: i.recoveryParam,
                r: Rt("0x" + i.r.toString(16), 32),
                s: Rt("0x" + i.s.toString(16), 32)
            })
        }
        computeSharedSecret(e) {
            const t = rn().keyFromPrivate(Ie(this.privateKey)),
                n = rn().keyFromPublic(Ie(dc(e)));
            return Rt("0x" + t.derive(n.getPublic()).toString(16), 32)
        }
        static isSigningKey(e) {
            return !!(e && e._isSigningKey)
        }
    }

    function Qy(r, e) {
        const t = vo(e),
            n = {
                r: Ie(t.r),
                s: Ie(t.s)
            };
        return "0x" + rn().recoverPubKey(Ie(r), n, t.recoveryParam).encode("hex", !1)
    }

    function dc(r, e) {
        const t = Ie(r);
        if (t.length === 32) {
            const n = new Wy(t);
            return e ? "0x" + rn().keyFromPrivate(t).getPublic(!0, "hex") : n.publicKey
        } else {
            if (t.length === 33) return e ? Se(t) : "0x" + rn().keyFromPublic(t).getPublic(!1, "hex");
            if (t.length === 65) return e ? "0x" + rn().keyFromPublic(t).getPublic(!0, "hex") : Se(t)
        }
        return cu.throwArgumentError("invalid public or private key", "key", "[REDACTED]")
    }
    const Yy = "transactions/5.7.0",
        An = new L(Yy);
    var pc;
    (function(r) {
        r[r.legacy = 0] = "legacy", r[r.eip2930 = 1] = "eip2930", r[r.eip1559 = 2] = "eip1559"
    })(pc || (pc = {}));

    function pu(r) {
        return r === "0x" ? null : Sr(r)
    }

    function Jt(r) {
        return r === "0x" ? sg : re.from(r)
    }

    function Xy(r) {
        const e = dc(r);
        return Sr(Wt(qt(Wt(e, 1)), 12))
    }

    function mc(r, e) {
        return Xy(Qy(Ie(r), e))
    }

    function hr(r, e) {
        const t = Si(re.from(r).toHexString());
        return t.length > 32 && An.throwArgumentError("invalid length for " + e, "transaction:" + e, r), t
    }

    function mu(r, e) {
        return {
            address: Sr(r),
            storageKeys: (e || []).map((t, n) => (Zn(t) !== 32 && An.throwArgumentError("invalid access list storageKey", `accessList[${r}:${n}]`, t), t.toLowerCase()))
        }
    }

    function vs(r) {
        if (Array.isArray(r)) return r.map((t, n) => Array.isArray(t) ? (t.length > 2 && An.throwArgumentError("access list expected to be [ address, storageKeys[] ]", `value[${n}]`, t), mu(t[0], t[1])) : mu(t.address, t.storageKeys));
        const e = Object.keys(r).map(t => {
            const n = r[t].reduce((i, s) => (i[s] = !0, i), {});
            return mu(t, Object.keys(n).sort())
        });
        return e.sort((t, n) => t.address.localeCompare(n.address)), e
    }

    function gc(r) {
        return vs(r).map(e => [e.address, e.storageKeys])
    }

    function ev(r, e) {
        if (r.gasPrice != null) {
            const n = re.from(r.gasPrice),
                i = re.from(r.maxFeePerGas || 0);
            n.eq(i) || An.throwArgumentError("mismatch EIP-1559 gasPrice != maxFeePerGas", "tx", {
                gasPrice: n,
                maxFeePerGas: i
            })
        }
        const t = [hr(r.chainId || 0, "chainId"), hr(r.nonce || 0, "nonce"), hr(r.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"), hr(r.maxFeePerGas || 0, "maxFeePerGas"), hr(r.gasLimit || 0, "gasLimit"), r.to != null ? Sr(r.to) : "0x", hr(r.value || 0, "value"), r.data || "0x", gc(r.accessList || [])];
        if (e) {
            const n = vo(e);
            t.push(hr(n.recoveryParam, "recoveryParam")), t.push(Si(n.r)), t.push(Si(n.s))
        }
        return or(["0x02", To(t)])
    }

    function tv(r, e) {
        const t = [hr(r.chainId || 0, "chainId"), hr(r.nonce || 0, "nonce"), hr(r.gasPrice || 0, "gasPrice"), hr(r.gasLimit || 0, "gasLimit"), r.to != null ? Sr(r.to) : "0x", hr(r.value || 0, "value"), r.data || "0x", gc(r.accessList || [])];
        if (e) {
            const n = vo(e);
            t.push(hr(n.recoveryParam, "recoveryParam")), t.push(Si(n.r)), t.push(Si(n.s))
        }
        return or(["0x01", To(t)])
    }

    function yc(r, e, t) {
        try {
            const n = Jt(e[0]).toNumber();
            if (n !== 0 && n !== 1) throw new Error("bad recid");
            r.v = n
        } catch {
            An.throwArgumentError("invalid v for transaction type: 1", "v", e[0])
        }
        r.r = Rt(e[1], 32), r.s = Rt(e[2], 32);
        try {
            const n = qt(t(r));
            r.from = mc(n, {
                r: r.r,
                s: r.s,
                recoveryParam: r.v
            })
        } catch {}
    }

    function rv(r) {
        const e = Ja(r.slice(1));
        e.length !== 9 && e.length !== 12 && An.throwArgumentError("invalid component count for transaction type: 2", "payload", Se(r));
        const t = Jt(e[2]),
            n = Jt(e[3]),
            i = {
                type: 2,
                chainId: Jt(e[0]).toNumber(),
                nonce: Jt(e[1]).toNumber(),
                maxPriorityFeePerGas: t,
                maxFeePerGas: n,
                gasPrice: null,
                gasLimit: Jt(e[4]),
                to: pu(e[5]),
                value: Jt(e[6]),
                data: e[7],
                accessList: vs(e[8])
            };
        return e.length === 9 || (i.hash = qt(r), yc(i, e.slice(9), ev)), i
    }

    function nv(r) {
        const e = Ja(r.slice(1));
        e.length !== 8 && e.length !== 11 && An.throwArgumentError("invalid component count for transaction type: 1", "payload", Se(r));
        const t = {
            type: 1,
            chainId: Jt(e[0]).toNumber(),
            nonce: Jt(e[1]).toNumber(),
            gasPrice: Jt(e[2]),
            gasLimit: Jt(e[3]),
            to: pu(e[4]),
            value: Jt(e[5]),
            data: e[6],
            accessList: vs(e[7])
        };
        return e.length === 8 || (t.hash = qt(r), yc(t, e.slice(8), tv)), t
    }

    function iv(r) {
        const e = Ja(r);
        e.length !== 9 && e.length !== 6 && An.throwArgumentError("invalid raw transaction", "rawTransaction", r);
        const t = {
            nonce: Jt(e[0]).toNumber(),
            gasPrice: Jt(e[1]),
            gasLimit: Jt(e[2]),
            to: pu(e[3]),
            value: Jt(e[4]),
            data: e[5],
            chainId: 0
        };
        if (e.length === 6) return t;
        try {
            t.v = re.from(e[6]).toNumber()
        } catch {
            return t
        }
        if (t.r = Rt(e[7], 32), t.s = Rt(e[8], 32), re.from(t.r).isZero() && re.from(t.s).isZero()) t.chainId = t.v, t.v = 0;
        else {
            t.chainId = Math.floor((t.v - 35) / 2), t.chainId < 0 && (t.chainId = 0);
            let n = t.v - 27;
            const i = e.slice(0, 6);
            t.chainId !== 0 && (i.push(Se(t.chainId)), i.push("0x"), i.push("0x"), n -= t.chainId * 2 + 8);
            const s = qt(To(i));
            try {
                t.from = mc(s, {
                    r: Se(t.r),
                    s: Se(t.s),
                    recoveryParam: n
                })
            } catch {}
            t.hash = qt(r)
        }
        return t.type = null, t
    }

    function sv(r) {
        const e = Ie(r);
        if (e[0] > 127) return iv(e);
        switch (e[0]) {
            case 1:
                return nv(e);
            case 2:
                return rv(e)
        }
        return An.throwError(`unsupported transaction type: ${e[0]}`, L.errors.UNSUPPORTED_OPERATION, {
            operation: "parseTransaction",
            transactionType: e[0]
        })
    }
    const ws = new L(Co);
    class ee {
        constructor() {
            this.formats = this.getDefaultFormats()
        }
        getDefaultFormats() {
            const e = {},
                t = this.address.bind(this),
                n = this.bigNumber.bind(this),
                i = this.blockTag.bind(this),
                s = this.data.bind(this),
                o = this.hash.bind(this),
                u = this.hex.bind(this),
                l = this.number.bind(this),
                h = this.type.bind(this),
                c = y => this.data(y, !0);
            return e.transaction = {
                hash: o,
                type: h,
                accessList: ee.allowNull(this.accessList.bind(this), null),
                blockHash: ee.allowNull(o, null),
                blockNumber: ee.allowNull(l, null),
                transactionIndex: ee.allowNull(l, null),
                confirmations: ee.allowNull(l, null),
                from: t,
                gasPrice: ee.allowNull(n),
                maxPriorityFeePerGas: ee.allowNull(n),
                maxFeePerGas: ee.allowNull(n),
                gasLimit: n,
                to: ee.allowNull(t, null),
                value: n,
                nonce: l,
                data: s,
                r: ee.allowNull(this.uint256),
                s: ee.allowNull(this.uint256),
                v: ee.allowNull(l),
                creates: ee.allowNull(t, null),
                raw: ee.allowNull(s)
            }, e.transactionRequest = {
                from: ee.allowNull(t),
                nonce: ee.allowNull(l),
                gasLimit: ee.allowNull(n),
                gasPrice: ee.allowNull(n),
                maxPriorityFeePerGas: ee.allowNull(n),
                maxFeePerGas: ee.allowNull(n),
                to: ee.allowNull(t),
                value: ee.allowNull(n),
                data: ee.allowNull(c),
                type: ee.allowNull(l),
                accessList: ee.allowNull(this.accessList.bind(this), null)
            }, e.receiptLog = {
                transactionIndex: l,
                blockNumber: l,
                transactionHash: o,
                address: t,
                topics: ee.arrayOf(o),
                data: s,
                logIndex: l,
                blockHash: o
            }, e.receipt = {
                to: ee.allowNull(this.address, null),
                from: ee.allowNull(this.address, null),
                contractAddress: ee.allowNull(t, null),
                transactionIndex: l,
                root: ee.allowNull(u),
                gasUsed: n,
                logsBloom: ee.allowNull(s),
                blockHash: o,
                transactionHash: o,
                logs: ee.arrayOf(this.receiptLog.bind(this)),
                blockNumber: l,
                confirmations: ee.allowNull(l, null),
                cumulativeGasUsed: n,
                effectiveGasPrice: ee.allowNull(n),
                status: ee.allowNull(l),
                type: h
            }, e.block = {
                hash: ee.allowNull(o),
                parentHash: o,
                number: l,
                timestamp: l,
                nonce: ee.allowNull(u),
                difficulty: this.difficulty.bind(this),
                gasLimit: n,
                gasUsed: n,
                miner: ee.allowNull(t),
                extraData: s,
                transactions: ee.allowNull(ee.arrayOf(o)),
                baseFeePerGas: ee.allowNull(n)
            }, e.blockWithTransactions = rr(e.block), e.blockWithTransactions.transactions = ee.allowNull(ee.arrayOf(this.transactionResponse.bind(this))), e.filter = {
                fromBlock: ee.allowNull(i, void 0),
                toBlock: ee.allowNull(i, void 0),
                blockHash: ee.allowNull(o, void 0),
                address: ee.allowNull(t, void 0),
                topics: ee.allowNull(this.topics.bind(this), void 0)
            }, e.filterLog = {
                blockNumber: ee.allowNull(l),
                blockHash: ee.allowNull(o),
                transactionIndex: l,
                removed: ee.allowNull(this.boolean.bind(this)),
                address: t,
                data: ee.allowFalsish(s, "0x"),
                topics: ee.arrayOf(o),
                transactionHash: o,
                logIndex: l
            }, e
        }
        accessList(e) {
            return vs(e || [])
        }
        number(e) {
            return e === "0x" ? 0 : re.from(e).toNumber()
        }
        type(e) {
            return e === "0x" || e == null ? 0 : re.from(e).toNumber()
        }
        bigNumber(e) {
            return re.from(e)
        }
        boolean(e) {
            if (typeof e == "boolean") return e;
            if (typeof e == "string") {
                if (e = e.toLowerCase(), e === "true") return !0;
                if (e === "false") return !1
            }
            throw new Error("invalid boolean - " + e)
        }
        hex(e, t) {
            return typeof e == "string" && (!t && e.substring(0, 2) !== "0x" && (e = "0x" + e), xt(e)) ? e.toLowerCase() : ws.throwArgumentError("invalid hash", "value", e)
        }
        data(e, t) {
            const n = this.hex(e, t);
            if (n.length % 2 !== 0) throw new Error("invalid data; odd-length - " + e);
            return n
        }
        address(e) {
            return Sr(e)
        }
        callAddress(e) {
            if (!xt(e, 32)) return null;
            const t = Sr(Wt(e, 12));
            return t === ig ? null : t
        }
        contractAddress(e) {
            return Hg(e)
        }
        blockTag(e) {
            if (e == null) return "latest";
            if (e === "earliest") return "0x0";
            switch (e) {
                case "earliest":
                    return "0x0";
                case "latest":
                case "pending":
                case "safe":
                case "finalized":
                    return e
            }
            if (typeof e == "number" || xt(e)) return Ga(e);
            throw new Error("invalid blockTag")
        }
        hash(e, t) {
            const n = this.hex(e, t);
            return Zn(n) !== 32 ? ws.throwArgumentError("invalid hash", "value", e) : n
        }
        difficulty(e) {
            if (e == null) return null;
            const t = re.from(e);
            try {
                return t.toNumber()
            } catch {}
            return null
        }
        uint256(e) {
            if (!xt(e)) throw new Error("invalid uint256");
            return Rt(e, 32)
        }
        _block(e, t) {
            e.author != null && e.miner == null && (e.miner = e.author);
            const n = e._difficulty != null ? e._difficulty : e.difficulty,
                i = ee.check(t, e);
            return i._difficulty = n == null ? null : re.from(n), i
        }
        block(e) {
            return this._block(e, this.formats.block)
        }
        blockWithTransactions(e) {
            return this._block(e, this.formats.blockWithTransactions)
        }
        transactionRequest(e) {
            return ee.check(this.formats.transactionRequest, e)
        }
        transactionResponse(e) {
            e.gas != null && e.gasLimit == null && (e.gasLimit = e.gas), e.to && re.from(e.to).isZero() && (e.to = "0x0000000000000000000000000000000000000000"), e.input != null && e.data == null && (e.data = e.input), e.to == null && e.creates == null && (e.creates = this.contractAddress(e)), (e.type === 1 || e.type === 2) && e.accessList == null && (e.accessList = []);
            const t = ee.check(this.formats.transaction, e);
            if (e.chainId != null) {
                let n = e.chainId;
                xt(n) && (n = re.from(n).toNumber()), t.chainId = n
            } else {
                let n = e.networkId;
                n == null && t.v == null && (n = e.chainId), xt(n) && (n = re.from(n).toNumber()), typeof n != "number" && t.v != null && (n = (t.v - 35) / 2, n < 0 && (n = 0), n = parseInt(n)), typeof n != "number" && (n = 0), t.chainId = n
            }
            return t.blockHash && t.blockHash.replace(/0/g, "") === "x" && (t.blockHash = null), t
        }
        transaction(e) {
            return sv(e)
        }
        receiptLog(e) {
            return ee.check(this.formats.receiptLog, e)
        }
        receipt(e) {
            const t = ee.check(this.formats.receipt, e);
            if (t.root != null)
                if (t.root.length <= 4) {
                    const n = re.from(t.root).toNumber();
                    n === 0 || n === 1 ? (t.status != null && t.status !== n && ws.throwArgumentError("alt-root-status/status mismatch", "value", {
                        root: t.root,
                        status: t.status
                    }), t.status = n, delete t.root) : ws.throwArgumentError("invalid alt-root-status", "value.root", t.root)
                } else t.root.length !== 66 && ws.throwArgumentError("invalid root hash", "value.root", t.root);
            return t.status != null && (t.byzantium = !0), t
        }
        topics(e) {
            return Array.isArray(e) ? e.map(t => this.topics(t)) : e != null ? this.hash(e, !0) : null
        }
        filter(e) {
            return ee.check(this.formats.filter, e)
        }
        filterLog(e) {
            return ee.check(this.formats.filterLog, e)
        }
        static check(e, t) {
            const n = {};
            for (const i in e) try {
                const s = e[i](t[i]);
                s !== void 0 && (n[i] = s)
            } catch (s) {
                throw s.checkKey = i, s.checkValue = t[i], s
            }
            return n
        }
        static allowNull(e, t) {
            return function(n) {
                return n == null ? t : e(n)
            }
        }
        static allowFalsish(e, t) {
            return function(n) {
                return n ? e(n) : t
            }
        }
        static arrayOf(e) {
            return function(t) {
                if (!Array.isArray(t)) throw new Error("not an array");
                const n = [];
                return t.forEach(function(i) {
                    n.push(e(i))
                }), n
            }
        }
    }
    var Pe = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const Ce = new L(Co),
        ov = 10;

    function vc(r) {
        return r == null ? "null" : (Zn(r) !== 32 && Ce.throwArgumentError("invalid topic", "topic", r), r.toLowerCase())
    }

    function wc(r) {
        for (r = r.slice(); r.length > 0 && r[r.length - 1] == null;) r.pop();
        return r.map(e => {
            if (Array.isArray(e)) {
                const t = {};
                e.forEach(i => {
                    t[vc(i)] = !0
                });
                const n = Object.keys(t);
                return n.sort(), n.join("|")
            } else return vc(e)
        }).join("&")
    }

    function av(r) {
        return r === "" ? [] : r.split(/&/g).map(e => {
            if (e === "") return [];
            const t = e.split("|").map(n => n === "null" ? null : n);
            return t.length === 1 ? t[0] : t
        })
    }

    function $i(r) {
        if (typeof r == "string") {
            if (r = r.toLowerCase(), Zn(r) === 32) return "tx:" + r;
            if (r.indexOf(":") === -1) return r
        } else {
            if (Array.isArray(r)) return "filter:*:" + wc(r);
            if (eg.isForkEvent(r)) throw Ce.warn("not implemented"), new Error("not implemented");
            if (r && typeof r == "object") return "filter:" + (r.address || "*") + ":" + wc(r.topics || [])
        }
        throw new Error("invalid event - " + r)
    }

    function bs() {
        return new Date().getTime()
    }

    function bc(r) {
        return new Promise(e => {
            setTimeout(e, r)
        })
    }
    const uv = ["block", "network", "pending", "poll"];
    class lv {
        constructor(e, t, n) {
            Ue(this, "tag", e), Ue(this, "listener", t), Ue(this, "once", n), this._lastBlockNumber = -2, this._inflight = !1
        }
        get event() {
            switch (this.type) {
                case "tx":
                    return this.hash;
                case "filter":
                    return this.filter
            }
            return this.tag
        }
        get type() {
            return this.tag.split(":")[0]
        }
        get hash() {
            const e = this.tag.split(":");
            return e[0] !== "tx" ? null : e[1]
        }
        get filter() {
            const e = this.tag.split(":");
            if (e[0] !== "filter") return null;
            const t = e[1],
                n = av(e[2]),
                i = {};
            return n.length > 0 && (i.topics = n), t && t !== "*" && (i.address = t), i
        }
        pollable() {
            return this.tag.indexOf(":") >= 0 || uv.indexOf(this.tag) >= 0
        }
    }
    const hv = {
        0: {
            symbol: "btc",
            p2pkh: 0,
            p2sh: 5,
            prefix: "bc"
        },
        2: {
            symbol: "ltc",
            p2pkh: 48,
            p2sh: 50,
            prefix: "ltc"
        },
        3: {
            symbol: "doge",
            p2pkh: 30,
            p2sh: 22
        },
        60: {
            symbol: "eth",
            ilk: "eth"
        },
        61: {
            symbol: "etc",
            ilk: "eth"
        },
        700: {
            symbol: "xdai",
            ilk: "eth"
        }
    };

    function gu(r) {
        return Rt(re.from(r).toHexString(), 32)
    }

    function Ac(r) {
        return Ka.encode(Vn([r, Wt(ic(ic(r)), 0, 4)]))
    }
    const Ec = new RegExp("^(ipfs)://(.*)$", "i"),
        xc = [new RegExp("^(https)://(.*)$", "i"), new RegExp("^(data):(.*)$", "i"), Ec, new RegExp("^eip155:[0-9]+/(erc[0-9]+):(.*)$", "i")];

    function $o(r, e) {
        try {
            return xo(As(r, e))
        } catch {}
        return null
    }

    function As(r, e) {
        if (r === "0x") return null;
        const t = re.from(Wt(r, e, e + 32)).toNumber(),
            n = re.from(Wt(r, t, t + 32)).toNumber();
        return Wt(r, t + 32, t + 32 + n)
    }

    function yu(r) {
        return r.match(/^ipfs:\/\/ipfs\//i) ? r = r.substring(12) : r.match(/^ipfs:\/\//i) ? r = r.substring(7) : Ce.throwArgumentError("unsupported IPFS format", "link", r), `https://gateway.ipfs.io/ipfs/${r}`
    }

    function _c(r) {
        const e = Ie(r);
        if (e.length > 32) throw new Error("internal; should not happen");
        const t = new Uint8Array(32);
        return t.set(e, 32 - e.length), t
    }

    function fv(r) {
        if (r.length % 32 === 0) return r;
        const e = new Uint8Array(Math.ceil(r.length / 32) * 32);
        return e.set(r), e
    }

    function Mc(r) {
        const e = [];
        let t = 0;
        for (let n = 0; n < r.length; n++) e.push(null), t += 32;
        for (let n = 0; n < r.length; n++) {
            const i = Ie(r[n]);
            e[n] = _c(t), e.push(_c(i.length)), e.push(fv(i)), t += 32 + Math.ceil(i.length / 32) * 32
        }
        return or(e)
    }
    class Nc {
        constructor(e, t, n, i) {
            Ue(this, "provider", e), Ue(this, "name", n), Ue(this, "address", e.formatter.address(t)), Ue(this, "_resolvedAddress", i)
        }
        supportsWildcard() {
            return this._supportsEip2544 || (this._supportsEip2544 = this.provider.call({
                to: this.address,
                data: "0x01ffc9a79061b92300000000000000000000000000000000000000000000000000000000"
            }).then(e => re.from(e).eq(1)).catch(e => {
                if (e.code === L.errors.CALL_EXCEPTION) return !1;
                throw this._supportsEip2544 = null, e
            })), this._supportsEip2544
        }
        _fetch(e, t) {
            return Pe(this, void 0, void 0, function*() {
                const n = {
                    to: this.address,
                    ccipReadEnabled: !0,
                    data: or([e, No(this.name), t || "0x"])
                };
                let i = !1;
                (yield this.supportsWildcard()) && (i = !0, n.data = or(["0x9061b923", Mc([Lg(this.name), n.data])]));
                try {
                    let s = yield this.provider.call(n);
                    return Ie(s).length % 32 === 4 && Ce.throwError("resolver threw error", L.errors.CALL_EXCEPTION, {
                        transaction: n,
                        data: s
                    }), i && (s = As(s, 0)), s
                } catch (s) {
                    if (s.code === L.errors.CALL_EXCEPTION) return null;
                    throw s
                }
            })
        }
        _fetchBytes(e, t) {
            return Pe(this, void 0, void 0, function*() {
                const n = yield this._fetch(e, t);
                return n != null ? As(n, 0) : null
            })
        }
        _getAddress(e, t) {
            const n = hv[String(e)];
            if (n == null && Ce.throwError(`unsupported coin type: ${e}`, L.errors.UNSUPPORTED_OPERATION, {
                    operation: `getAddress(${e})`
                }), n.ilk === "eth") return this.provider.formatter.address(t);
            const i = Ie(t);
            if (n.p2pkh != null) {
                const s = t.match(/^0x76a9([0-9a-f][0-9a-f])([0-9a-f]*)88ac$/);
                if (s) {
                    const o = parseInt(s[1], 16);
                    if (s[2].length === o * 2 && o >= 1 && o <= 75) return Ac(Vn([
                        [n.p2pkh], "0x" + s[2]
                    ]))
                }
            }
            if (n.p2sh != null) {
                const s = t.match(/^0xa9([0-9a-f][0-9a-f])([0-9a-f]*)87$/);
                if (s) {
                    const o = parseInt(s[1], 16);
                    if (s[2].length === o * 2 && o >= 1 && o <= 75) return Ac(Vn([
                        [n.p2sh], "0x" + s[2]
                    ]))
                }
            }
            if (n.prefix != null) {
                const s = i[1];
                let o = i[0];
                if (o === 0 ? s !== 20 && s !== 32 && (o = -1) : o = -1, o >= 0 && i.length === 2 + s && s >= 1 && s <= 75) {
                    const u = uc.toWords(i.slice(2));
                    return u.unshift(o), uc.encode(n.prefix, u)
                }
            }
            return null
        }
        getAddress(e) {
            return Pe(this, void 0, void 0, function*() {
                if (e == null && (e = 60), e === 60) try {
                    const i = yield this._fetch("0x3b3b57de");
                    return i === "0x" || i === og ? null : this.provider.formatter.callAddress(i)
                } catch (i) {
                    if (i.code === L.errors.CALL_EXCEPTION) return null;
                    throw i
                }
                const t = yield this._fetchBytes("0xf1cb7e06", gu(e));
                if (t == null || t === "0x") return null;
                const n = this._getAddress(e, t);
                return n == null && Ce.throwError("invalid or unsupported coin data", L.errors.UNSUPPORTED_OPERATION, {
                    operation: `getAddress(${e})`,
                    coinType: e,
                    data: t
                }), n
            })
        }
        getAvatar() {
            return Pe(this, void 0, void 0, function*() {
                const e = [{
                    type: "name",
                    content: this.name
                }];
                try {
                    const t = yield this.getText("avatar");
                    if (t == null) return null;
                    for (let n = 0; n < xc.length; n++) {
                        const i = t.match(xc[n]);
                        if (i == null) continue;
                        const s = i[1].toLowerCase();
                        switch (s) {
                            case "https":
                                return e.push({
                                    type: "url",
                                    content: t
                                }), {
                                    linkage: e,
                                    url: t
                                };
                            case "data":
                                return e.push({
                                    type: "data",
                                    content: t
                                }), {
                                    linkage: e,
                                    url: t
                                };
                            case "ipfs":
                                return e.push({
                                    type: "ipfs",
                                    content: t
                                }), {
                                    linkage: e,
                                    url: yu(t)
                                };
                            case "erc721":
                            case "erc1155":
                                {
                                    const o = s === "erc721" ? "0xc87b56dd" : "0x0e89341c";e.push({
                                        type: s,
                                        content: t
                                    });
                                    const u = this._resolvedAddress || (yield this.getAddress()),
                                        l = (i[2] || "").split("/");
                                    if (l.length !== 2) return null;
                                    const h = yield this.provider.formatter.address(l[0]), c = Rt(re.from(l[1]).toHexString(), 32);
                                    if (s === "erc721") {
                                        const S = this.provider.formatter.callAddress(yield this.provider.call({
                                            to: h,
                                            data: or(["0x6352211e", c])
                                        }));
                                        if (u !== S) return null;
                                        e.push({
                                            type: "owner",
                                            content: S
                                        })
                                    } else if (s === "erc1155") {
                                        const S = re.from(yield this.provider.call({
                                            to: h,
                                            data: or(["0x00fdd58e", Rt(u, 32), c])
                                        }));
                                        if (S.isZero()) return null;
                                        e.push({
                                            type: "balance",
                                            content: S.toString()
                                        })
                                    }
                                    const y = {
                                        to: this.provider.formatter.address(l[0]),
                                        data: or([o, c])
                                    };
                                    let v = $o(yield this.provider.call(y), 0);
                                    if (v == null) return null;e.push({
                                        type: "metadata-url-base",
                                        content: v
                                    }),
                                    s === "erc1155" && (v = v.replace("{id}", c.substring(2)), e.push({
                                        type: "metadata-url-expanded",
                                        content: v
                                    })),
                                    v.match(/^ipfs:/i) && (v = yu(v)),
                                    e.push({
                                        type: "metadata-url",
                                        content: v
                                    });
                                    const N = yield nu(v);
                                    if (!N) return null;e.push({
                                        type: "metadata",
                                        content: JSON.stringify(N)
                                    });
                                    let P = N.image;
                                    if (typeof P != "string") return null;
                                    if (!P.match(/^(https:\/\/|data:)/i)) {
                                        if (P.match(Ec) == null) return null;
                                        e.push({
                                            type: "url-ipfs",
                                            content: P
                                        }), P = yu(P)
                                    }
                                    return e.push({
                                        type: "url",
                                        content: P
                                    }),
                                    {
                                        linkage: e,
                                        url: P
                                    }
                                }
                        }
                    }
                } catch {}
                return null
            })
        }
        getContentHash() {
            return Pe(this, void 0, void 0, function*() {
                const e = yield this._fetchBytes("0xbc1c58d1");
                if (e == null || e === "0x") return null;
                const t = e.match(/^0xe3010170(([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f]*))$/);
                if (t) {
                    const o = parseInt(t[3], 16);
                    if (t[4].length === o * 2) return "ipfs://" + Ka.encode("0x" + t[1])
                }
                const n = e.match(/^0xe5010172(([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f]*))$/);
                if (n) {
                    const o = parseInt(n[3], 16);
                    if (n[4].length === o * 2) return "ipns://" + Ka.encode("0x" + n[1])
                }
                const i = e.match(/^0xe40101fa011b20([0-9a-f]*)$/);
                if (i && i[1].length === 32 * 2) return "bzz://" + i[1];
                const s = e.match(/^0x90b2c605([0-9a-f]*)$/);
                if (s && s[1].length === 34 * 2) {
                    const o = {
                        "=": "",
                        "+": "-",
                        "/": "_"
                    };
                    return "sia://" + nf("0x" + s[1]).replace(/[=+\/]/g, l => o[l])
                }
                return Ce.throwError("invalid or unsupported content hash data", L.errors.UNSUPPORTED_OPERATION, {
                    operation: "getContentHash()",
                    data: e
                })
            })
        }
        getText(e) {
            return Pe(this, void 0, void 0, function*() {
                let t = vn(e);
                t = Vn([gu(64), gu(t.length), t]), t.length % 32 !== 0 && (t = Vn([t, Rt("0x", 32 - e.length % 32)]));
                const n = yield this._fetchBytes("0x59d1d43c", Se(t));
                return n == null || n === "0x" ? null : xo(n)
            })
        }
    }
    let vu = null,
        cv = 1;
    class dv extends ja {
        constructor(e) {
            if (super(), this._events = [], this._emitted = {
                    block: -2
                }, this.disableCcipRead = !1, this.formatter = new.target.getFormatter(), Ue(this, "anyNetwork", e === "any"), this.anyNetwork && (e = this.detectNetwork()), e instanceof Promise) this._networkPromise = e, e.catch(t => {}), this._ready().catch(t => {});
            else {
                const t = fs(new.target, "getNetwork")(e);
                t ? (Ue(this, "_network", t), this.emit("network", t, null)) : Ce.throwArgumentError("invalid network", "network", e)
            }
            this._maxInternalBlockNumber = -1024, this._lastBlockNumber = -2, this._maxFilterBlockRange = 10, this._pollingInterval = 4e3, this._fastQueryDate = 0
        }
        _ready() {
            return Pe(this, void 0, void 0, function*() {
                if (this._network == null) {
                    let e = null;
                    if (this._networkPromise) try {
                        e = yield this._networkPromise
                    } catch {}
                    e == null && (e = yield this.detectNetwork()), e || Ce.throwError("no network detected", L.errors.UNKNOWN_ERROR, {}), this._network == null && (this.anyNetwork ? this._network = e : Ue(this, "_network", e), this.emit("network", e, null))
                }
                return this._network
            })
        }
        get ready() {
            return ys(() => this._ready().then(e => e, e => {
                if (!(e.code === L.errors.NETWORK_ERROR && e.event === "noNetwork")) throw e
            }))
        }
        static getFormatter() {
            return vu == null && (vu = new ee), vu
        }
        static getNetwork(e) {
            return ng(e ? ? "homestead")
        }
        ccipReadFetch(e, t, n) {
            return Pe(this, void 0, void 0, function*() {
                if (this.disableCcipRead || n.length === 0) return null;
                const i = e.to.toLowerCase(),
                    s = t.toLowerCase(),
                    o = [];
                for (let u = 0; u < n.length; u++) {
                    const l = n[u],
                        h = l.replace("{sender}", i).replace("{data}", s),
                        c = l.indexOf("{data}") >= 0 ? null : JSON.stringify({
                            data: s,
                            sender: i
                        }),
                        y = yield nu({
                            url: h,
                            errorPassThrough: !0
                        }, c, (N, P) => (N.status = P.statusCode, N));
                    if (y.data) return y.data;
                    const v = y.message || "unknown error";
                    if (y.status >= 400 && y.status < 500) return Ce.throwError(`response not found during CCIP fetch: ${v}`, L.errors.SERVER_ERROR, {
                        url: l,
                        errorMessage: v
                    });
                    o.push(v)
                }
                return Ce.throwError(`error encountered during CCIP fetch: ${o.map(u=>JSON.stringify(u)).join(", ")}`, L.errors.SERVER_ERROR, {
                    urls: n,
                    errorMessages: o
                })
            })
        }
        _getInternalBlockNumber(e) {
            return Pe(this, void 0, void 0, function*() {
                if (yield this._ready(), e > 0)
                    for (; this._internalBlockNumber;) {
                        const i = this._internalBlockNumber;
                        try {
                            const s = yield i;
                            if (bs() - s.respTime <= e) return s.blockNumber;
                            break
                        } catch {
                            if (this._internalBlockNumber === i) break
                        }
                    }
                const t = bs(),
                    n = $t({
                        blockNumber: this.perform("getBlockNumber", {}),
                        networkError: this.getNetwork().then(i => null, i => i)
                    }).then(({
                        blockNumber: i,
                        networkError: s
                    }) => {
                        if (s) throw this._internalBlockNumber === n && (this._internalBlockNumber = null), s;
                        const o = bs();
                        return i = re.from(i).toNumber(), i < this._maxInternalBlockNumber && (i = this._maxInternalBlockNumber), this._maxInternalBlockNumber = i, this._setFastBlockNumber(i), {
                            blockNumber: i,
                            reqTime: t,
                            respTime: o
                        }
                    });
                return this._internalBlockNumber = n, n.catch(i => {
                    this._internalBlockNumber === n && (this._internalBlockNumber = null)
                }), (yield n).blockNumber
            })
        }
        poll() {
            return Pe(this, void 0, void 0, function*() {
                const e = cv++,
                    t = [];
                let n = null;
                try {
                    n = yield this._getInternalBlockNumber(100 + this.pollingInterval / 2)
                } catch (i) {
                    this.emit("error", i);
                    return
                }
                if (this._setFastBlockNumber(n), this.emit("poll", e, n), n === this._lastBlockNumber) {
                    this.emit("didPoll", e);
                    return
                }
                if (this._emitted.block === -2 && (this._emitted.block = n - 1), Math.abs(this._emitted.block - n) > 1e3) Ce.warn(`network block skew detected; skipping block events (emitted=${this._emitted.block} blockNumber${n})`), this.emit("error", Ce.makeError("network block skew detected", L.errors.NETWORK_ERROR, {
                    blockNumber: n,
                    event: "blockSkew",
                    previousBlockNumber: this._emitted.block
                })), this.emit("block", n);
                else
                    for (let i = this._emitted.block + 1; i <= n; i++) this.emit("block", i);
                this._emitted.block !== n && (this._emitted.block = n, Object.keys(this._emitted).forEach(i => {
                    if (i === "block") return;
                    const s = this._emitted[i];
                    s !== "pending" && n - s > 12 && delete this._emitted[i]
                })), this._lastBlockNumber === -2 && (this._lastBlockNumber = n - 1), this._events.forEach(i => {
                    switch (i.type) {
                        case "tx":
                            {
                                const s = i.hash;
                                let o = this.getTransactionReceipt(s).then(u => (!u || u.blockNumber == null || (this._emitted["t:" + s] = u.blockNumber, this.emit(s, u)), null)).catch(u => {
                                    this.emit("error", u)
                                });t.push(o);
                                break
                            }
                        case "filter":
                            {
                                if (!i._inflight) {
                                    i._inflight = !0, i._lastBlockNumber === -2 && (i._lastBlockNumber = n - 1);
                                    const s = i.filter;
                                    s.fromBlock = i._lastBlockNumber + 1, s.toBlock = n;
                                    const o = s.toBlock - this._maxFilterBlockRange;
                                    o > s.fromBlock && (s.fromBlock = o), s.fromBlock < 0 && (s.fromBlock = 0);
                                    const u = this.getLogs(s).then(l => {
                                        i._inflight = !1, l.length !== 0 && l.forEach(h => {
                                            h.blockNumber > i._lastBlockNumber && (i._lastBlockNumber = h.blockNumber), this._emitted["b:" + h.blockHash] = h.blockNumber, this._emitted["t:" + h.transactionHash] = h.blockNumber, this.emit(s, h)
                                        })
                                    }).catch(l => {
                                        this.emit("error", l), i._inflight = !1
                                    });
                                    t.push(u)
                                }
                                break
                            }
                    }
                }), this._lastBlockNumber = n, Promise.all(t).then(() => {
                    this.emit("didPoll", e)
                }).catch(i => {
                    this.emit("error", i)
                })
            })
        }
        resetEventsBlock(e) {
            this._lastBlockNumber = e - 1, this.polling && this.poll()
        }
        get network() {
            return this._network
        }
        detectNetwork() {
            return Pe(this, void 0, void 0, function*() {
                return Ce.throwError("provider does not support network detection", L.errors.UNSUPPORTED_OPERATION, {
                    operation: "provider.detectNetwork"
                })
            })
        }
        getNetwork() {
            return Pe(this, void 0, void 0, function*() {
                const e = yield this._ready(), t = yield this.detectNetwork();
                if (e.chainId !== t.chainId) {
                    if (this.anyNetwork) return this._network = t, this._lastBlockNumber = -2, this._fastBlockNumber = null, this._fastBlockNumberPromise = null, this._fastQueryDate = 0, this._emitted.block = -2, this._maxInternalBlockNumber = -1024, this._internalBlockNumber = null, this.emit("network", t, e), yield bc(0), this._network;
                    const n = Ce.makeError("underlying network changed", L.errors.NETWORK_ERROR, {
                        event: "changed",
                        network: e,
                        detectedNetwork: t
                    });
                    throw this.emit("error", n), n
                }
                return e
            })
        }
        get blockNumber() {
            return this._getInternalBlockNumber(100 + this.pollingInterval / 2).then(e => {
                this._setFastBlockNumber(e)
            }, e => {}), this._fastBlockNumber != null ? this._fastBlockNumber : -1
        }
        get polling() {
            return this._poller != null
        }
        set polling(e) {
            e && !this._poller ? (this._poller = setInterval(() => {
                this.poll()
            }, this.pollingInterval), this._bootstrapPoll || (this._bootstrapPoll = setTimeout(() => {
                this.poll(), this._bootstrapPoll = setTimeout(() => {
                    this._poller || this.poll(), this._bootstrapPoll = null
                }, this.pollingInterval)
            }, 0))) : !e && this._poller && (clearInterval(this._poller), this._poller = null)
        }
        get pollingInterval() {
            return this._pollingInterval
        }
        set pollingInterval(e) {
            if (typeof e != "number" || e <= 0 || parseInt(String(e)) != e) throw new Error("invalid polling interval");
            this._pollingInterval = e, this._poller && (clearInterval(this._poller), this._poller = setInterval(() => {
                this.poll()
            }, this._pollingInterval))
        }
        _getFastBlockNumber() {
            const e = bs();
            return e - this._fastQueryDate > 2 * this._pollingInterval && (this._fastQueryDate = e, this._fastBlockNumberPromise = this.getBlockNumber().then(t => ((this._fastBlockNumber == null || t > this._fastBlockNumber) && (this._fastBlockNumber = t), this._fastBlockNumber))), this._fastBlockNumberPromise
        }
        _setFastBlockNumber(e) {
            this._fastBlockNumber != null && e < this._fastBlockNumber || (this._fastQueryDate = bs(), (this._fastBlockNumber == null || e > this._fastBlockNumber) && (this._fastBlockNumber = e, this._fastBlockNumberPromise = Promise.resolve(e)))
        }
        waitForTransaction(e, t, n) {
            return Pe(this, void 0, void 0, function*() {
                return this._waitForTransaction(e, t ? ? 1, n || 0, null)
            })
        }
        _waitForTransaction(e, t, n, i) {
            return Pe(this, void 0, void 0, function*() {
                const s = yield this.getTransactionReceipt(e);
                return (s ? s.confirmations : 0) >= t ? s : new Promise((o, u) => {
                    const l = [];
                    let h = !1;
                    const c = function() {
                            return h ? !0 : (h = !0, l.forEach(v => {
                                v()
                            }), !1)
                        },
                        y = v => {
                            v.confirmations < t || c() || o(v)
                        };
                    if (this.on(e, y), l.push(() => {
                            this.removeListener(e, y)
                        }), i) {
                        let v = i.startBlock,
                            N = null;
                        const P = S => Pe(this, void 0, void 0, function*() {
                            h || (yield bc(1e3), this.getTransactionCount(i.from).then(O => Pe(this, void 0, void 0, function*() {
                                if (!h) {
                                    if (O <= i.nonce) v = S;
                                    else {
                                        {
                                            const I = yield this.getTransaction(e);
                                            if (I && I.blockNumber != null) return
                                        }
                                        for (N == null && (N = v - 3, N < i.startBlock && (N = i.startBlock)); N <= S;) {
                                            if (h) return;
                                            const I = yield this.getBlockWithTransactions(N);
                                            for (let C = 0; C < I.transactions.length; C++) {
                                                const R = I.transactions[C];
                                                if (R.hash === e) return;
                                                if (R.from === i.from && R.nonce === i.nonce) {
                                                    if (h) return;
                                                    const G = yield this.waitForTransaction(R.hash, t);
                                                    if (c()) return;
                                                    let q = "replaced";
                                                    R.data === i.data && R.to === i.to && R.value.eq(i.value) ? q = "repriced" : R.data === "0x" && R.from === R.to && R.value.isZero() && (q = "cancelled"), u(Ce.makeError("transaction was replaced", L.errors.TRANSACTION_REPLACED, {
                                                        cancelled: q === "replaced" || q === "cancelled",
                                                        reason: q,
                                                        replacement: this._wrapTransaction(R),
                                                        hash: e,
                                                        receipt: G
                                                    }));
                                                    return
                                                }
                                            }
                                            N++
                                        }
                                    }
                                    h || this.once("block", P)
                                }
                            }), O => {
                                h || this.once("block", P)
                            }))
                        });
                        if (h) return;
                        this.once("block", P), l.push(() => {
                            this.removeListener("block", P)
                        })
                    }
                    if (typeof n == "number" && n > 0) {
                        const v = setTimeout(() => {
                            c() || u(Ce.makeError("timeout exceeded", L.errors.TIMEOUT, {
                                timeout: n
                            }))
                        }, n);
                        v.unref && v.unref(), l.push(() => {
                            clearTimeout(v)
                        })
                    }
                })
            })
        }
        getBlockNumber() {
            return Pe(this, void 0, void 0, function*() {
                return this._getInternalBlockNumber(0)
            })
        }
        getGasPrice() {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const e = yield this.perform("getGasPrice", {});
                try {
                    return re.from(e)
                } catch (t) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "getGasPrice",
                        result: e,
                        error: t
                    })
                }
            })
        }
        getBalance(e, t) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const n = yield $t({
                    address: this._getAddress(e),
                    blockTag: this._getBlockTag(t)
                }), i = yield this.perform("getBalance", n);
                try {
                    return re.from(i)
                } catch (s) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "getBalance",
                        params: n,
                        result: i,
                        error: s
                    })
                }
            })
        }
        getTransactionCount(e, t) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const n = yield $t({
                    address: this._getAddress(e),
                    blockTag: this._getBlockTag(t)
                }), i = yield this.perform("getTransactionCount", n);
                try {
                    return re.from(i).toNumber()
                } catch (s) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "getTransactionCount",
                        params: n,
                        result: i,
                        error: s
                    })
                }
            })
        }
        getCode(e, t) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const n = yield $t({
                    address: this._getAddress(e),
                    blockTag: this._getBlockTag(t)
                }), i = yield this.perform("getCode", n);
                try {
                    return Se(i)
                } catch (s) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "getCode",
                        params: n,
                        result: i,
                        error: s
                    })
                }
            })
        }
        getStorageAt(e, t, n) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const i = yield $t({
                    address: this._getAddress(e),
                    blockTag: this._getBlockTag(n),
                    position: Promise.resolve(t).then(o => Ga(o))
                }), s = yield this.perform("getStorageAt", i);
                try {
                    return Se(s)
                } catch (o) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "getStorageAt",
                        params: i,
                        result: s,
                        error: o
                    })
                }
            })
        }
        _wrapTransaction(e, t, n) {
            if (t != null && Zn(t) !== 32) throw new Error("invalid response - sendTransaction");
            const i = e;
            return t != null && e.hash !== t && Ce.throwError("Transaction hash mismatch from Provider.sendTransaction.", L.errors.UNKNOWN_ERROR, {
                expectedHash: e.hash,
                returnedHash: t
            }), i.wait = (s, o) => Pe(this, void 0, void 0, function*() {
                s == null && (s = 1), o == null && (o = 0);
                let u;
                s !== 0 && n != null && (u = {
                    data: e.data,
                    from: e.from,
                    nonce: e.nonce,
                    to: e.to,
                    value: e.value,
                    startBlock: n
                });
                const l = yield this._waitForTransaction(e.hash, s, o, u);
                return l == null && s === 0 ? null : (this._emitted["t:" + e.hash] = l.blockNumber, l.status === 0 && Ce.throwError("transaction failed", L.errors.CALL_EXCEPTION, {
                    transactionHash: e.hash,
                    transaction: e,
                    receipt: l
                }), l)
            }), i
        }
        sendTransaction(e) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const t = yield Promise.resolve(e).then(s => Se(s)), n = this.formatter.transaction(e);
                n.confirmations == null && (n.confirmations = 0);
                const i = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                try {
                    const s = yield this.perform("sendTransaction", {
                        signedTransaction: t
                    });
                    return this._wrapTransaction(n, s, i)
                } catch (s) {
                    throw s.transaction = n, s.transactionHash = n.hash, s
                }
            })
        }
        _getTransactionRequest(e) {
            return Pe(this, void 0, void 0, function*() {
                const t = yield e, n = {};
                return ["from", "to"].forEach(i => {
                    t[i] != null && (n[i] = Promise.resolve(t[i]).then(s => s ? this._getAddress(s) : null))
                }), ["gasLimit", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas", "value"].forEach(i => {
                    t[i] != null && (n[i] = Promise.resolve(t[i]).then(s => s ? re.from(s) : null))
                }), ["type"].forEach(i => {
                    t[i] != null && (n[i] = Promise.resolve(t[i]).then(s => s ? ? null))
                }), t.accessList && (n.accessList = this.formatter.accessList(t.accessList)), ["data"].forEach(i => {
                    t[i] != null && (n[i] = Promise.resolve(t[i]).then(s => s ? Se(s) : null))
                }), this.formatter.transactionRequest(yield $t(n))
            })
        }
        _getFilter(e) {
            return Pe(this, void 0, void 0, function*() {
                e = yield e;
                const t = {};
                return e.address != null && (t.address = this._getAddress(e.address)), ["blockHash", "topics"].forEach(n => {
                    e[n] != null && (t[n] = e[n])
                }), ["fromBlock", "toBlock"].forEach(n => {
                    e[n] != null && (t[n] = this._getBlockTag(e[n]))
                }), this.formatter.filter(yield $t(t))
            })
        }
        _call(e, t, n) {
            return Pe(this, void 0, void 0, function*() {
                n >= ov && Ce.throwError("CCIP read exceeded maximum redirections", L.errors.SERVER_ERROR, {
                    redirects: n,
                    transaction: e
                });
                const i = e.to,
                    s = yield this.perform("call", {
                        transaction: e,
                        blockTag: t
                    });
                if (n >= 0 && t === "latest" && i != null && s.substring(0, 10) === "0x556f1830" && Zn(s) % 32 === 4) try {
                    const o = Wt(s, 4),
                        u = Wt(o, 0, 32);
                    re.from(u).eq(i) || Ce.throwError("CCIP Read sender did not match", L.errors.CALL_EXCEPTION, {
                        name: "OffchainLookup",
                        signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                        transaction: e,
                        data: s
                    });
                    const l = [],
                        h = re.from(Wt(o, 32, 64)).toNumber(),
                        c = re.from(Wt(o, h, h + 32)).toNumber(),
                        y = Wt(o, h + 32);
                    for (let I = 0; I < c; I++) {
                        const C = $o(y, I * 32);
                        C == null && Ce.throwError("CCIP Read contained corrupt URL string", L.errors.CALL_EXCEPTION, {
                            name: "OffchainLookup",
                            signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                            transaction: e,
                            data: s
                        }), l.push(C)
                    }
                    const v = As(o, 64);
                    re.from(Wt(o, 100, 128)).isZero() || Ce.throwError("CCIP Read callback selector included junk", L.errors.CALL_EXCEPTION, {
                        name: "OffchainLookup",
                        signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                        transaction: e,
                        data: s
                    });
                    const N = Wt(o, 96, 100),
                        P = As(o, 128),
                        S = yield this.ccipReadFetch(e, v, l);
                    S == null && Ce.throwError("CCIP Read disabled or provided no URLs", L.errors.CALL_EXCEPTION, {
                        name: "OffchainLookup",
                        signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                        transaction: e,
                        data: s
                    });
                    const O = {
                        to: i,
                        data: or([N, Mc([S, P])])
                    };
                    return this._call(O, t, n + 1)
                } catch (o) {
                    if (o.code === L.errors.SERVER_ERROR) throw o
                }
                try {
                    return Se(s)
                } catch (o) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "call",
                        params: {
                            transaction: e,
                            blockTag: t
                        },
                        result: s,
                        error: o
                    })
                }
            })
        }
        call(e, t) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const n = yield $t({
                    transaction: this._getTransactionRequest(e),
                    blockTag: this._getBlockTag(t),
                    ccipReadEnabled: Promise.resolve(e.ccipReadEnabled)
                });
                return this._call(n.transaction, n.blockTag, n.ccipReadEnabled ? 0 : -1)
            })
        }
        estimateGas(e) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const t = yield $t({
                    transaction: this._getTransactionRequest(e)
                }), n = yield this.perform("estimateGas", t);
                try {
                    return re.from(n)
                } catch (i) {
                    return Ce.throwError("bad result from backend", L.errors.SERVER_ERROR, {
                        method: "estimateGas",
                        params: t,
                        result: n,
                        error: i
                    })
                }
            })
        }
        _getAddress(e) {
            return Pe(this, void 0, void 0, function*() {
                e = yield e, typeof e != "string" && Ce.throwArgumentError("invalid address or ENS name", "name", e);
                const t = yield this.resolveName(e);
                return t == null && Ce.throwError("ENS name not configured", L.errors.UNSUPPORTED_OPERATION, {
                    operation: `resolveName(${JSON.stringify(e)})`
                }), t
            })
        }
        _getBlock(e, t) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork(), e = yield e;
                let n = -128;
                const i = {
                    includeTransactions: !!t
                };
                if (xt(e, 32)) i.blockHash = e;
                else try {
                    i.blockTag = yield this._getBlockTag(e), xt(i.blockTag) && (n = parseInt(i.blockTag.substring(2), 16))
                } catch {
                    Ce.throwArgumentError("invalid block hash or block tag", "blockHashOrBlockTag", e)
                }
                return ys(() => Pe(this, void 0, void 0, function*() {
                    const s = yield this.perform("getBlock", i);
                    if (s == null) return i.blockHash != null && this._emitted["b:" + i.blockHash] == null || i.blockTag != null && n > this._emitted.block ? null : void 0;
                    if (t) {
                        let o = null;
                        for (let l = 0; l < s.transactions.length; l++) {
                            const h = s.transactions[l];
                            if (h.blockNumber == null) h.confirmations = 0;
                            else if (h.confirmations == null) {
                                o == null && (o = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval));
                                let c = o - h.blockNumber + 1;
                                c <= 0 && (c = 1), h.confirmations = c
                            }
                        }
                        const u = this.formatter.blockWithTransactions(s);
                        return u.transactions = u.transactions.map(l => this._wrapTransaction(l)), u
                    }
                    return this.formatter.block(s)
                }), {
                    oncePoll: this
                })
            })
        }
        getBlock(e) {
            return this._getBlock(e, !1)
        }
        getBlockWithTransactions(e) {
            return this._getBlock(e, !0)
        }
        getTransaction(e) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork(), e = yield e;
                const t = {
                    transactionHash: this.formatter.hash(e, !0)
                };
                return ys(() => Pe(this, void 0, void 0, function*() {
                    const n = yield this.perform("getTransaction", t);
                    if (n == null) return this._emitted["t:" + e] == null ? null : void 0;
                    const i = this.formatter.transactionResponse(n);
                    if (i.blockNumber == null) i.confirmations = 0;
                    else if (i.confirmations == null) {
                        let o = (yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval)) - i.blockNumber + 1;
                        o <= 0 && (o = 1), i.confirmations = o
                    }
                    return this._wrapTransaction(i)
                }), {
                    oncePoll: this
                })
            })
        }
        getTransactionReceipt(e) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork(), e = yield e;
                const t = {
                    transactionHash: this.formatter.hash(e, !0)
                };
                return ys(() => Pe(this, void 0, void 0, function*() {
                    const n = yield this.perform("getTransactionReceipt", t);
                    if (n == null) return this._emitted["t:" + e] == null ? null : void 0;
                    if (n.blockHash == null) return;
                    const i = this.formatter.receipt(n);
                    if (i.blockNumber == null) i.confirmations = 0;
                    else if (i.confirmations == null) {
                        let o = (yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval)) - i.blockNumber + 1;
                        o <= 0 && (o = 1), i.confirmations = o
                    }
                    return i
                }), {
                    oncePoll: this
                })
            })
        }
        getLogs(e) {
            return Pe(this, void 0, void 0, function*() {
                yield this.getNetwork();
                const t = yield $t({
                    filter: this._getFilter(e)
                }), n = yield this.perform("getLogs", t);
                return n.forEach(i => {
                    i.removed == null && (i.removed = !1)
                }), ee.arrayOf(this.formatter.filterLog.bind(this.formatter))(n)
            })
        }
        getEtherPrice() {
            return Pe(this, void 0, void 0, function*() {
                return yield this.getNetwork(), this.perform("getEtherPrice", {})
            })
        }
        _getBlockTag(e) {
            return Pe(this, void 0, void 0, function*() {
                if (e = yield e, typeof e == "number" && e < 0) {
                    e % 1 && Ce.throwArgumentError("invalid BlockTag", "blockTag", e);
                    let t = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                    return t += e, t < 0 && (t = 0), this.formatter.blockTag(t)
                }
                return this.formatter.blockTag(e)
            })
        }
        getResolver(e) {
            return Pe(this, void 0, void 0, function*() {
                let t = e;
                for (;;) {
                    if (t === "" || t === "." || e !== "eth" && t === "eth") return null;
                    const n = yield this._getResolver(t, "getResolver");
                    if (n != null) {
                        const i = new Nc(this, n, e);
                        return t !== e && !(yield i.supportsWildcard()) ? null : i
                    }
                    t = t.split(".").slice(1).join(".")
                }
            })
        }
        _getResolver(e, t) {
            return Pe(this, void 0, void 0, function*() {
                t == null && (t = "ENS");
                const n = yield this.getNetwork();
                n.ensAddress || Ce.throwError("network does not support ENS", L.errors.UNSUPPORTED_OPERATION, {
                    operation: t,
                    network: n.name
                });
                try {
                    const i = yield this.call({
                        to: n.ensAddress,
                        data: "0x0178b8bf" + No(e).substring(2)
                    });
                    return this.formatter.callAddress(i)
                } catch {}
                return null
            })
        }
        resolveName(e) {
            return Pe(this, void 0, void 0, function*() {
                e = yield e;
                try {
                    return Promise.resolve(this.formatter.address(e))
                } catch (n) {
                    if (xt(e)) throw n
                }
                typeof e != "string" && Ce.throwArgumentError("invalid ENS name", "name", e);
                const t = yield this.getResolver(e);
                return t ? yield t.getAddress(): null
            })
        }
        lookupAddress(e) {
            return Pe(this, void 0, void 0, function*() {
                e = yield e, e = this.formatter.address(e);
                const t = e.substring(2).toLowerCase() + ".addr.reverse",
                    n = yield this._getResolver(t, "lookupAddress");
                if (n == null) return null;
                const i = $o(yield this.call({
                    to: n,
                    data: "0x691f3431" + No(t).substring(2)
                }), 0);
                return (yield this.resolveName(i)) != e ? null : i
            })
        }
        getAvatar(e) {
            return Pe(this, void 0, void 0, function*() {
                let t = null;
                if (xt(e)) {
                    const s = this.formatter.address(e).substring(2).toLowerCase() + ".addr.reverse",
                        o = yield this._getResolver(s, "getAvatar");
                    if (!o) return null;
                    t = new Nc(this, o, s);
                    try {
                        const u = yield t.getAvatar();
                        if (u) return u.url
                    } catch (u) {
                        if (u.code !== L.errors.CALL_EXCEPTION) throw u
                    }
                    try {
                        const u = $o(yield this.call({
                            to: o,
                            data: "0x691f3431" + No(s).substring(2)
                        }), 0);
                        t = yield this.getResolver(u)
                    } catch (u) {
                        if (u.code !== L.errors.CALL_EXCEPTION) throw u;
                        return null
                    }
                } else if (t = yield this.getResolver(e), !t) return null;
                const n = yield t.getAvatar();
                return n == null ? null : n.url
            })
        }
        perform(e, t) {
            return Ce.throwError(e + " not implemented", L.errors.NOT_IMPLEMENTED, {
                operation: e
            })
        }
        _startEvent(e) {
            this.polling = this._events.filter(t => t.pollable()).length > 0
        }
        _stopEvent(e) {
            this.polling = this._events.filter(t => t.pollable()).length > 0
        }
        _addEventListener(e, t, n) {
            const i = new lv($i(e), t, n);
            return this._events.push(i), this._startEvent(i), this
        }
        on(e, t) {
            return this._addEventListener(e, t, !1)
        }
        once(e, t) {
            return this._addEventListener(e, t, !0)
        }
        emit(e, ...t) {
            let n = !1,
                i = [],
                s = $i(e);
            return this._events = this._events.filter(o => o.tag !== s ? !0 : (setTimeout(() => {
                o.listener.apply(this, t)
            }, 0), n = !0, o.once ? (i.push(o), !1) : !0)), i.forEach(o => {
                this._stopEvent(o)
            }), n
        }
        listenerCount(e) {
            if (!e) return this._events.length;
            let t = $i(e);
            return this._events.filter(n => n.tag === t).length
        }
        listeners(e) {
            if (e == null) return this._events.map(n => n.listener);
            let t = $i(e);
            return this._events.filter(n => n.tag === t).map(n => n.listener)
        }
        off(e, t) {
            if (t == null) return this.removeAllListeners(e);
            const n = [];
            let i = !1,
                s = $i(e);
            return this._events = this._events.filter(o => o.tag !== s || o.listener != t || i ? !0 : (i = !0, n.push(o), !1)), n.forEach(o => {
                this._stopEvent(o)
            }), this
        }
        removeAllListeners(e) {
            let t = [];
            if (e == null) t = this._events, this._events = [];
            else {
                const n = $i(e);
                this._events = this._events.filter(i => i.tag !== n ? !0 : (t.push(i), !1))
            }
            return t.forEach(n => {
                this._stopEvent(n)
            }), this
        }
    }
    const pv = "abstract-signer/5.7.0";
    var Or = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const Fr = new L(pv),
        mv = ["accessList", "ccipReadEnabled", "chainId", "customData", "data", "from", "gasLimit", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas", "nonce", "to", "type", "value"],
        gv = [L.errors.INSUFFICIENT_FUNDS, L.errors.NONCE_EXPIRED, L.errors.REPLACEMENT_UNDERPRICED];
    class wu {
        constructor() {
            Fr.checkAbstract(new.target, wu), Ue(this, "_isSigner", !0)
        }
        getBalance(e) {
            return Or(this, void 0, void 0, function*() {
                return this._checkProvider("getBalance"), yield this.provider.getBalance(this.getAddress(), e)
            })
        }
        getTransactionCount(e) {
            return Or(this, void 0, void 0, function*() {
                return this._checkProvider("getTransactionCount"), yield this.provider.getTransactionCount(this.getAddress(), e)
            })
        }
        estimateGas(e) {
            return Or(this, void 0, void 0, function*() {
                this._checkProvider("estimateGas");
                const t = yield $t(this.checkTransaction(e));
                return yield this.provider.estimateGas(t)
            })
        }
        call(e, t) {
            return Or(this, void 0, void 0, function*() {
                this._checkProvider("call");
                const n = yield $t(this.checkTransaction(e));
                return yield this.provider.call(n, t)
            })
        }
        sendTransaction(e) {
            return Or(this, void 0, void 0, function*() {
                this._checkProvider("sendTransaction");
                const t = yield this.populateTransaction(e), n = yield this.signTransaction(t);
                return yield this.provider.sendTransaction(n)
            })
        }
        getChainId() {
            return Or(this, void 0, void 0, function*() {
                return this._checkProvider("getChainId"), (yield this.provider.getNetwork()).chainId
            })
        }
        getGasPrice() {
            return Or(this, void 0, void 0, function*() {
                return this._checkProvider("getGasPrice"), yield this.provider.getGasPrice()
            })
        }
        getFeeData() {
            return Or(this, void 0, void 0, function*() {
                return this._checkProvider("getFeeData"), yield this.provider.getFeeData()
            })
        }
        resolveName(e) {
            return Or(this, void 0, void 0, function*() {
                return this._checkProvider("resolveName"), yield this.provider.resolveName(e)
            })
        }
        checkTransaction(e) {
            for (const n in e) mv.indexOf(n) === -1 && Fr.throwArgumentError("invalid transaction key: " + n, "transaction", e);
            const t = rr(e);
            return t.from == null ? t.from = this.getAddress() : t.from = Promise.all([Promise.resolve(t.from), this.getAddress()]).then(n => (n[0].toLowerCase() !== n[1].toLowerCase() && Fr.throwArgumentError("from address mismatch", "transaction", e), n[0])), t
        }
        populateTransaction(e) {
            return Or(this, void 0, void 0, function*() {
                const t = yield $t(this.checkTransaction(e));
                t.to != null && (t.to = Promise.resolve(t.to).then(i => Or(this, void 0, void 0, function*() {
                    if (i == null) return null;
                    const s = yield this.resolveName(i);
                    return s == null && Fr.throwArgumentError("provided ENS name resolves to null", "tx.to", i), s
                })), t.to.catch(i => {}));
                const n = t.maxFeePerGas != null || t.maxPriorityFeePerGas != null;
                if (t.gasPrice != null && (t.type === 2 || n) ? Fr.throwArgumentError("eip-1559 transaction do not support gasPrice", "transaction", e) : (t.type === 0 || t.type === 1) && n && Fr.throwArgumentError("pre-eip-1559 transaction do not support maxFeePerGas/maxPriorityFeePerGas", "transaction", e), (t.type === 2 || t.type == null) && t.maxFeePerGas != null && t.maxPriorityFeePerGas != null) t.type = 2;
                else if (t.type === 0 || t.type === 1) t.gasPrice == null && (t.gasPrice = this.getGasPrice());
                else {
                    const i = yield this.getFeeData();
                    if (t.type == null)
                        if (i.maxFeePerGas != null && i.maxPriorityFeePerGas != null)
                            if (t.type = 2, t.gasPrice != null) {
                                const s = t.gasPrice;
                                delete t.gasPrice, t.maxFeePerGas = s, t.maxPriorityFeePerGas = s
                            } else t.maxFeePerGas == null && (t.maxFeePerGas = i.maxFeePerGas), t.maxPriorityFeePerGas == null && (t.maxPriorityFeePerGas = i.maxPriorityFeePerGas);
                    else i.gasPrice != null ? (n && Fr.throwError("network does not support EIP-1559", L.errors.UNSUPPORTED_OPERATION, {
                        operation: "populateTransaction"
                    }), t.gasPrice == null && (t.gasPrice = i.gasPrice), t.type = 0) : Fr.throwError("failed to get consistent fee data", L.errors.UNSUPPORTED_OPERATION, {
                        operation: "signer.getFeeData"
                    });
                    else t.type === 2 && (t.maxFeePerGas == null && (t.maxFeePerGas = i.maxFeePerGas), t.maxPriorityFeePerGas == null && (t.maxPriorityFeePerGas = i.maxPriorityFeePerGas))
                }
                return t.nonce == null && (t.nonce = this.getTransactionCount("pending")), t.gasLimit == null && (t.gasLimit = this.estimateGas(t).catch(i => {
                    if (gv.indexOf(i.code) >= 0) throw i;
                    return Fr.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", L.errors.UNPREDICTABLE_GAS_LIMIT, {
                        error: i,
                        tx: t
                    })
                })), t.chainId == null ? t.chainId = this.getChainId() : t.chainId = Promise.all([Promise.resolve(t.chainId), this.getChainId()]).then(i => (i[1] !== 0 && i[0] !== i[1] && Fr.throwArgumentError("chainId address mismatch", "transaction", e), i[0])), yield $t(t)
            })
        }
        _checkProvider(e) {
            this.provider || Fr.throwError("missing provider", L.errors.UNSUPPORTED_OPERATION, {
                operation: e || "_checkProvider"
            })
        }
        static isSigner(e) {
            return !!(e && e._isSigner)
        }
    }
    var En = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const It = new L(Co),
        yv = ["call", "estimateGas"];

    function Es(r, e) {
        if (r == null) return null;
        if (typeof r.message == "string" && r.message.match("reverted")) {
            const t = xt(r.data) ? r.data : null;
            if (!e || t) return {
                message: r.message,
                data: t
            }
        }
        if (typeof r == "object") {
            for (const t in r) {
                const n = Es(r[t], e);
                if (n) return n
            }
            return null
        }
        if (typeof r == "string") try {
            return Es(JSON.parse(r), e)
        } catch {}
        return null
    }

    function Tc(r, e, t) {
        const n = t.transaction || t.signedTransaction;
        if (r === "call") {
            const s = Es(e, !0);
            if (s) return s.data;
            It.throwError("missing revert data in call exception; Transaction reverted without a reason string", L.errors.CALL_EXCEPTION, {
                data: "0x",
                transaction: n,
                error: e
            })
        }
        if (r === "estimateGas") {
            let s = Es(e.body, !1);
            s == null && (s = Es(e, !1)), s && It.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", L.errors.UNPREDICTABLE_GAS_LIMIT, {
                reason: s.message,
                method: r,
                transaction: n,
                error: e
            })
        }
        let i = e.message;
        throw e.code === L.errors.SERVER_ERROR && e.error && typeof e.error.message == "string" ? i = e.error.message : typeof e.body == "string" ? i = e.body : typeof e.responseText == "string" && (i = e.responseText), i = (i || "").toLowerCase(), i.match(/insufficient funds|base fee exceeds gas limit|InsufficientFunds/i) && It.throwError("insufficient funds for intrinsic transaction cost", L.errors.INSUFFICIENT_FUNDS, {
            error: e,
            method: r,
            transaction: n
        }), i.match(/nonce (is )?too low/i) && It.throwError("nonce has already been used", L.errors.NONCE_EXPIRED, {
            error: e,
            method: r,
            transaction: n
        }), i.match(/replacement transaction underpriced|transaction gas price.*too low/i) && It.throwError("replacement fee too low", L.errors.REPLACEMENT_UNDERPRICED, {
            error: e,
            method: r,
            transaction: n
        }), i.match(/only replay-protected/i) && It.throwError("legacy pre-eip-155 transactions not supported", L.errors.UNSUPPORTED_OPERATION, {
            error: e,
            method: r,
            transaction: n
        }), yv.indexOf(r) >= 0 && i.match(/gas required exceeds allowance|always failing transaction|execution reverted|revert/) && It.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", L.errors.UNPREDICTABLE_GAS_LIMIT, {
            error: e,
            method: r,
            transaction: n
        }), e
    }

    function Pc(r) {
        return new Promise(function(e) {
            setTimeout(e, r)
        })
    }

    function vv(r) {
        if (r.error) {
            const e = new Error(r.error.message);
            throw e.code = r.error.code, e.data = r.error.data, e
        }
        return r.result
    }

    function xs(r) {
        return r && r.toLowerCase()
    }
    const bu = {};
    class kc extends wu {
        constructor(e, t, n) {
            if (super(), e !== bu) throw new Error("do not call the JsonRpcSigner constructor directly; use provider.getSigner");
            Ue(this, "provider", t), n == null && (n = 0), typeof n == "string" ? (Ue(this, "_address", this.provider.formatter.address(n)), Ue(this, "_index", null)) : typeof n == "number" ? (Ue(this, "_index", n), Ue(this, "_address", null)) : It.throwArgumentError("invalid address or index", "addressOrIndex", n)
        }
        connect(e) {
            return It.throwError("cannot alter JSON-RPC Signer connection", L.errors.UNSUPPORTED_OPERATION, {
                operation: "connect"
            })
        }
        connectUnchecked() {
            return new wv(bu, this.provider, this._address || this._index)
        }
        getAddress() {
            return this._address ? Promise.resolve(this._address) : this.provider.send("eth_accounts", []).then(e => (e.length <= this._index && It.throwError("unknown account #" + this._index, L.errors.UNSUPPORTED_OPERATION, {
                operation: "getAddress"
            }), this.provider.formatter.address(e[this._index])))
        }
        sendUncheckedTransaction(e) {
            e = rr(e);
            const t = this.getAddress().then(n => (n && (n = n.toLowerCase()), n));
            if (e.gasLimit == null) {
                const n = rr(e);
                n.from = t, e.gasLimit = this.provider.estimateGas(n)
            }
            return e.to != null && (e.to = Promise.resolve(e.to).then(n => En(this, void 0, void 0, function*() {
                if (n == null) return null;
                const i = yield this.provider.resolveName(n);
                return i == null && It.throwArgumentError("provided ENS name resolves to null", "tx.to", n), i
            }))), $t({
                tx: $t(e),
                sender: t
            }).then(({
                tx: n,
                sender: i
            }) => {
                n.from != null ? n.from.toLowerCase() !== i && It.throwArgumentError("from address mismatch", "transaction", e) : n.from = i;
                const s = this.provider.constructor.hexlifyTransaction(n, {
                    from: !0
                });
                return this.provider.send("eth_sendTransaction", [s]).then(o => o, o => (typeof o.message == "string" && o.message.match(/user denied/i) && It.throwError("user rejected transaction", L.errors.ACTION_REJECTED, {
                    action: "sendTransaction",
                    transaction: n
                }), Tc("sendTransaction", o, s)))
            })
        }
        signTransaction(e) {
            return It.throwError("signing transactions is unsupported", L.errors.UNSUPPORTED_OPERATION, {
                operation: "signTransaction"
            })
        }
        sendTransaction(e) {
            return En(this, void 0, void 0, function*() {
                const t = yield this.provider._getInternalBlockNumber(100 + 2 * this.provider.pollingInterval), n = yield this.sendUncheckedTransaction(e);
                try {
                    return yield ys(() => En(this, void 0, void 0, function*() {
                        const i = yield this.provider.getTransaction(n);
                        if (i !== null) return this.provider._wrapTransaction(i, n, t)
                    }), {
                        oncePoll: this.provider
                    })
                } catch (i) {
                    throw i.transactionHash = n, i
                }
            })
        }
        signMessage(e) {
            return En(this, void 0, void 0, function*() {
                const t = typeof e == "string" ? vn(e) : e,
                    n = yield this.getAddress();
                try {
                    return yield this.provider.send("personal_sign", [Se(t), n.toLowerCase()])
                } catch (i) {
                    throw typeof i.message == "string" && i.message.match(/user denied/i) && It.throwError("user rejected signing", L.errors.ACTION_REJECTED, {
                        action: "signMessage",
                        from: n,
                        messageData: e
                    }), i
                }
            })
        }
        _legacySignMessage(e) {
            return En(this, void 0, void 0, function*() {
                const t = typeof e == "string" ? vn(e) : e,
                    n = yield this.getAddress();
                try {
                    return yield this.provider.send("eth_sign", [n.toLowerCase(), Se(t)])
                } catch (i) {
                    throw typeof i.message == "string" && i.message.match(/user denied/i) && It.throwError("user rejected signing", L.errors.ACTION_REJECTED, {
                        action: "_legacySignMessage",
                        from: n,
                        messageData: e
                    }), i
                }
            })
        }
        _signTypedData(e, t, n) {
            return En(this, void 0, void 0, function*() {
                const i = yield ur.resolveNames(e, t, n, o => this.provider.resolveName(o)), s = yield this.getAddress();
                try {
                    return yield this.provider.send("eth_signTypedData_v4", [s.toLowerCase(), JSON.stringify(ur.getPayload(i.domain, t, i.value))])
                } catch (o) {
                    throw typeof o.message == "string" && o.message.match(/user denied/i) && It.throwError("user rejected signing", L.errors.ACTION_REJECTED, {
                        action: "_signTypedData",
                        from: s,
                        messageData: {
                            domain: i.domain,
                            types: t,
                            value: i.value
                        }
                    }), o
                }
            })
        }
        unlock(e) {
            return En(this, void 0, void 0, function*() {
                const t = this.provider,
                    n = yield this.getAddress();
                return t.send("personal_unlockAccount", [n.toLowerCase(), e, null])
            })
        }
    }
    class wv extends kc {
        sendTransaction(e) {
            return this.sendUncheckedTransaction(e).then(t => ({
                hash: t,
                nonce: null,
                gasLimit: null,
                gasPrice: null,
                data: null,
                value: null,
                chainId: null,
                confirmations: 0,
                from: null,
                wait: n => this.provider.waitForTransaction(t, n)
            }))
        }
    }
    const bv = {
        chainId: !0,
        data: !0,
        gasLimit: !0,
        gasPrice: !0,
        nonce: !0,
        to: !0,
        value: !0,
        type: !0,
        accessList: !0,
        maxFeePerGas: !0,
        maxPriorityFeePerGas: !0
    };
    class Av extends dv {
        constructor(e, t) {
            let n = t;
            n == null && (n = new Promise((i, s) => {
                setTimeout(() => {
                    this.detectNetwork().then(o => {
                        i(o)
                    }, o => {
                        s(o)
                    })
                }, 0)
            })), super(n), e || (e = fs(this.constructor, "defaultUrl")()), typeof e == "string" ? Ue(this, "connection", Object.freeze({
                url: e
            })) : Ue(this, "connection", Object.freeze(rr(e))), this._nextId = 42
        }
        get _cache() {
            return this._eventLoopCache == null && (this._eventLoopCache = {}), this._eventLoopCache
        }
        static defaultUrl() {
            return "http://localhost:8545"
        }
        detectNetwork() {
            return this._cache.detectNetwork || (this._cache.detectNetwork = this._uncachedDetectNetwork(), setTimeout(() => {
                this._cache.detectNetwork = null
            }, 0)), this._cache.detectNetwork
        }
        _uncachedDetectNetwork() {
            return En(this, void 0, void 0, function*() {
                yield Pc(0);
                let e = null;
                try {
                    e = yield this.send("eth_chainId", [])
                } catch {
                    try {
                        e = yield this.send("net_version", [])
                    } catch {}
                }
                if (e != null) {
                    const t = fs(this.constructor, "getNetwork");
                    try {
                        return t(re.from(e).toNumber())
                    } catch (n) {
                        return It.throwError("could not detect network", L.errors.NETWORK_ERROR, {
                            chainId: e,
                            event: "invalidNetwork",
                            serverError: n
                        })
                    }
                }
                return It.throwError("could not detect network", L.errors.NETWORK_ERROR, {
                    event: "noNetwork"
                })
            })
        }
        getSigner(e) {
            return new kc(bu, this, e)
        }
        getUncheckedSigner(e) {
            return this.getSigner(e).connectUnchecked()
        }
        listAccounts() {
            return this.send("eth_accounts", []).then(e => e.map(t => this.formatter.address(t)))
        }
        send(e, t) {
            const n = {
                method: e,
                params: t,
                id: this._nextId++,
                jsonrpc: "2.0"
            };
            this.emit("debug", {
                action: "request",
                request: cs(n),
                provider: this
            });
            const i = ["eth_chainId", "eth_blockNumber"].indexOf(e) >= 0;
            if (i && this._cache[e]) return this._cache[e];
            const s = nu(this.connection, JSON.stringify(n), vv).then(o => (this.emit("debug", {
                action: "response",
                request: n,
                response: o,
                provider: this
            }), o), o => {
                throw this.emit("debug", {
                    action: "response",
                    error: o,
                    request: n,
                    provider: this
                }), o
            });
            return i && (this._cache[e] = s, setTimeout(() => {
                this._cache[e] = null
            }, 0)), s
        }
        prepareRequest(e, t) {
            switch (e) {
                case "getBlockNumber":
                    return ["eth_blockNumber", []];
                case "getGasPrice":
                    return ["eth_gasPrice", []];
                case "getBalance":
                    return ["eth_getBalance", [xs(t.address), t.blockTag]];
                case "getTransactionCount":
                    return ["eth_getTransactionCount", [xs(t.address), t.blockTag]];
                case "getCode":
                    return ["eth_getCode", [xs(t.address), t.blockTag]];
                case "getStorageAt":
                    return ["eth_getStorageAt", [xs(t.address), Rt(t.position, 32), t.blockTag]];
                case "sendTransaction":
                    return ["eth_sendRawTransaction", [t.signedTransaction]];
                case "getBlock":
                    return t.blockTag ? ["eth_getBlockByNumber", [t.blockTag, !!t.includeTransactions]] : t.blockHash ? ["eth_getBlockByHash", [t.blockHash, !!t.includeTransactions]] : null;
                case "getTransaction":
                    return ["eth_getTransactionByHash", [t.transactionHash]];
                case "getTransactionReceipt":
                    return ["eth_getTransactionReceipt", [t.transactionHash]];
                case "call":
                    return ["eth_call", [fs(this.constructor, "hexlifyTransaction")(t.transaction, {
                        from: !0
                    }), t.blockTag]];
                case "estimateGas":
                    return ["eth_estimateGas", [fs(this.constructor, "hexlifyTransaction")(t.transaction, {
                        from: !0
                    })]];
                case "getLogs":
                    return t.filter && t.filter.address != null && (t.filter.address = xs(t.filter.address)), ["eth_getLogs", [t.filter]]
            }
            return null
        }
        perform(e, t) {
            return En(this, void 0, void 0, function*() {
                if (e === "call" || e === "estimateGas") {
                    const i = t.transaction;
                    if (i && i.type != null && re.from(i.type).isZero() && i.maxFeePerGas == null && i.maxPriorityFeePerGas == null) {
                        const s = yield this.getFeeData();
                        s.maxFeePerGas == null && s.maxPriorityFeePerGas == null && (t = rr(t), t.transaction = rr(i), delete t.transaction.type)
                    }
                }
                const n = this.prepareRequest(e, t);
                n == null && It.throwError(e + " not implemented", L.errors.NOT_IMPLEMENTED, {
                    operation: e
                });
                try {
                    return yield this.send(n[0], n[1])
                } catch (i) {
                    return Tc(e, i, t)
                }
            })
        }
        _startEvent(e) {
            e.tag === "pending" && this._startPending(), super._startEvent(e)
        }
        _startPending() {
            if (this._pendingFilter != null) return;
            const e = this,
                t = this.send("eth_newPendingTransactionFilter", []);
            this._pendingFilter = t, t.then(function(n) {
                function i() {
                    e.send("eth_getFilterChanges", [n]).then(function(s) {
                        if (e._pendingFilter != t) return null;
                        let o = Promise.resolve();
                        return s.forEach(function(u) {
                            e._emitted["t:" + u.toLowerCase()] = "pending", o = o.then(function() {
                                return e.getTransaction(u).then(function(l) {
                                    return e.emit("pending", l), null
                                })
                            })
                        }), o.then(function() {
                            return Pc(1e3)
                        })
                    }).then(function() {
                        if (e._pendingFilter != t) {
                            e.send("eth_uninstallFilter", [n]);
                            return
                        }
                        return setTimeout(function() {
                            i()
                        }, 0), null
                    }).catch(s => {})
                }
                return i(), n
            }).catch(n => {})
        }
        _stopEvent(e) {
            e.tag === "pending" && this.listenerCount("pending") === 0 && (this._pendingFilter = null), super._stopEvent(e)
        }
        static hexlifyTransaction(e, t) {
            const n = rr(bv);
            if (t)
                for (const s in t) t[s] && (n[s] = !0);
            Jm(e, n);
            const i = {};
            return ["chainId", "gasLimit", "gasPrice", "type", "maxFeePerGas", "maxPriorityFeePerGas", "nonce", "value"].forEach(function(s) {
                if (e[s] == null) return;
                const o = Ga(re.from(e[s]));
                s === "gasLimit" && (s = "gas"), i[s] = o
            }), ["from", "to", "data"].forEach(function(s) {
                e[s] != null && (i[s] = Se(e[s]))
            }), e.accessList && (i.accessList = vs(e.accessList)), i
        }
    }
    var Ev = function(r, e, t, n) {
        function i(s) {
            return s instanceof t ? s : new t(function(o) {
                o(s)
            })
        }
        return new(t || (t = Promise))(function(s, o) {
            function u(c) {
                try {
                    h(n.next(c))
                } catch (y) {
                    o(y)
                }
            }

            function l(c) {
                try {
                    h(n.throw(c))
                } catch (y) {
                    o(y)
                }
            }

            function h(c) {
                c.done ? s(c.value) : i(c.value).then(u, l)
            }
            h((n = n.apply(r, e || [])).next())
        })
    };
    const xv = new L(Co);
    class _v extends Av {
        detectNetwork() {
            const e = Object.create(null, {
                detectNetwork: {
                    get: () => super.detectNetwork
                }
            });
            return Ev(this, void 0, void 0, function*() {
                let t = this.network;
                return t == null && (t = yield e.detectNetwork.call(this), t || xv.throwError("no network detected", L.errors.UNKNOWN_ERROR, {}), this._network == null && (Ue(this, "_network", t), this.emit("network", t, null))), t
            })
        }
    }
    jt.set({
        precision: 100,
        rounding: jt.ROUND_HALF_DOWN,
        toExpNeg: -30,
        toExpPos: 30
    });
    const Yn = new jt(1);
    let qo, qi, Tt, Au = !1,
        Eu = !1;
    const Mv = async (r, e, t, n) => {
            if (Au || Eu) return;
            Eu = !0;
            const i = new _v({
                url: r,
                skipFetchSetup: !0
            }, 1);
            qo = new $p(i, e);
            const {
                cache: s,
                startDataSync: o
            } = Rd(qo.reader, n);
            qi = s, Tt = new yd(qo, qi, t ? u => t.get(u.toLowerCase()) : void 0), await o(), Au = !0, Eu = !1
        },
        Sc = async (r, e, t, n, i, s, o, u) => {
            const l = [],
                h = [];
            for (let y = 0; y <= u + 1; y++) {
                const v = i.times(y);
                let N = n[r ? "minus" : "plus"](v);
                N = r ? N : Yn.div(N), N.gt(0) && h.push(N.toString())
            }
            return (await Tt.getRateLiquidityDepthsByPair(e, t, h)).forEach((y, v) => {
                const N = l.length;
                let P = h[v],
                    S = new jt(y),
                    O = S;
                if (S.eq(0)) {
                    console.warn("order book getRateLiquidityDepthsByPair returns 0");
                    return
                }
                if (r)
                    if (N === 0) S = S.div(P);
                    else if (S.eq(l[N - 1].originalTotal || "0")) S = new jt(l[N - 1].amount);
                else {
                    const I = new jt(l[0].rate),
                        C = new jt(l[0].originalTotal || "0"),
                        R = S.minus(C);
                    S = C.div(I).plus(R.div(P))
                } else P = Yn.div(P).toString(), O = O.times(P);
                l.push({
                    rate: P,
                    total: O.toString(),
                    amount: S.toString(),
                    originalTotal: y
                })
            }), l
        },
        Nv = (r, e, t, n, i, s, o) => r.isFinite() && r.gt(0) ? e.isFinite() && e.gt(0) ? r.lte(e) ? r : e : r : e.isFinite() && e.gt(0) ? e : t.gt(0) && t.eq(n) ? t.div(i + 2) : s.gt(0) && s.eq(o) ? s.div(i + 2) : Yn.div(1e4),
        Tv = (r, e) => r.isFinite() && r.gt(0) && e.isFinite() && e.gt(0) ? r.plus(Yn.div(e)).div(2) : r.isFinite() && r.gt(0) ? r : e.isFinite() && e.gt(0) ? Yn.div(e) : new jt(0);
    Go({
        init: Mv,
        isInitialized: () => Au,
        getAllPairs: () => qo.reader.pairs(),
        setOnChangeHandlers: (r, e) => {
            qi.on("onPairDataChanged", t => r(t)), qi.on("onPairAddedToCache", t => e(t))
        },
        hasLiquidityByPair: (r, e) => Tt.hasLiquidityByPair(r, e),
        getUserStrategies: r => Tt.getUserStrategies(r),
        getStrategiesByPair: (r, e) => Tt.getStrategiesByPair(r, e),
        createBuySellStrategy: (r, e, t, n, i, s, o, u, l, h, c) => Tt.createBuySellStrategy(r, e, t, n, i, s, o, u, l, h, c),
        updateStrategy: (r, e, t, n, i, s) => Tt.updateStrategy(r, e, t, n, i, s),
        deleteStrategy: r => Tt.deleteStrategy(r),
        getTradeData: (r, e, t, n) => Tt.getTradeData(r, e, t, n),
        getTradeDataFromActions: (r, e, t, n) => Tt.getTradeDataFromActions(r, e, t, n),
        getLiquidityByPair: (r, e) => Tt.getLiquidityByPair(r, e),
        composeTradeBySourceTransaction: (r, e, t, n, i, s) => Tt.composeTradeBySourceTransaction(r, e, t, n, i, s),
        composeTradeByTargetTransaction: (r, e, t, n, i, s) => Tt.composeTradeByTargetTransaction(r, e, t, n, i, s),
        getOrderBook: async (r, e, t) => {
            const n = await Tt.hasLiquidityByPair(r, e),
                i = await Tt.hasLiquidityByPair(e, r),
                s = new jt(n ? await Tt.getMinRateByPair(r, e) : 0),
                o = new jt(n ? await Tt.getMaxRateByPair(r, e) : 0),
                u = new jt(i ? await Tt.getMinRateByPair(e, r) : 0),
                l = new jt(i ? await Tt.getMaxRateByPair(e, r) : 0),
                h = Yn.div(l),
                c = Yn.div(u),
                y = o.minus(s),
                v = c.minus(h),
                N = y.div(t),
                P = v.div(t),
                S = Nv(N, P, s, o, t, u, l),
                O = Tv(o, l),
                I = o.gt(h),
                C = I ? O : o,
                R = I ? O : h,
                G = n ? await Sc(!0, r, e, C, S, s, o, t) : [],
                q = i ? await Sc(!1, e, r, R, S, u, l, t) : [];
            return {
                buy: G,
                sell: q,
                middleRate: O.toString(),
                step: S.toString()
            }
        },
        getCacheDump: () => qi.serialize(),
        getLastTradeByPair: (r, e) => qi.getLatestTradeByPair(r, e),
        getMaxSourceAmountByPair: (r, e) => Tt.getMaxSourceAmountByPair(r, e),
        calculateOverlappingStrategyPrices: (...r) => Tt.calculateOverlappingStrategyPrices(...r),
        calculateOverlappingStrategyBuyBudget: (...r) => Tt.calculateOverlappingStrategyBuyBudget(...r),
        calculateOverlappingStrategySellBudget: (...r) => Tt.calculateOverlappingStrategySellBudget(...r)
    })
})();
//# sourceMappingURL=sdk-a934a7a5.js.map