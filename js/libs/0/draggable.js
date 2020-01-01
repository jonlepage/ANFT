! function(t, e) {
    "object" == typeof exports ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : t.Draggable = e()
}(this, function() {
    "use strict";
    var t = {
            grid: 0,
            filterTarget: null,
            limit: {
                x: null,
                y: null
            },
            threshold: 0,
            setCursor: !1,
            setPosition: !0,
            smoothDrag: !0,
            useGPU: !0,
            onDrag: u,
            onDragStart: u,
            onDragEnd: u
        },
        e = {
            transform: function() {
                for (var t = " -o- -ms- -moz- -webkit-".split(" "), e = document.body.style, n = t.length; n--;) {
                    var o = t[n] + "transform";
                    if (o in e) return o
                }
            }()
        },
        n = {
            assign: function() {
                for (var t = arguments[0], e = arguments.length, n = 1; n < e; n++) {
                    var o = arguments[n];
                    for (var i in o) t[i] = o[i]
                }
                return t
            },
            bind: function(t, e) {
                return function() {
                    t.apply(e, arguments)
                }
            },
            on: function(t, e, o) {
                if (e && o) n.addEvent(t, e, o);
                else if (e)
                    for (var i in e) n.addEvent(t, i, e[i])
            },
            off: function(t, e, o) {
                if (e && o) n.removeEvent(t, e, o);
                else if (e)
                    for (var i in e) n.removeEvent(t, i, e[i])
            },
            limit: function(t, e) {
                return e instanceof Array ? t < (e = [+e[0], +e[1]])[0] ? t = e[0] : t > e[1] && (t = e[1]) : t = +e, t
            },
            addEvent: "attachEvent" in Element.prototype ? function(t, e, n) {
                t.attachEvent("on" + e, n)
            } : function(t, e, n) {
                t.addEventListener(e, n, !1)
            },
            removeEvent: "attachEvent" in Element.prototype ? function(t, e, n) {
                t.detachEvent("on" + e, n)
            } : function(t, e, n) {
                t.removeEventListener(e, n)
            }
        };

    function o(e, o) {
        var i = this,
            r = n.bind(i.start, i),
            s = n.bind(i.drag, i),
            u = n.bind(i.stop, i);
        if (!a(e)) throw new TypeError("Draggable expects argument 0 to be an Element");
        o = n.assign({}, t, o), n.assign(i, {
            element: e,
            handle: o.handle && a(o.handle) ? o.handle : e,
            handlers: {
                start: {
                    mousedown: r,
                    touchstart: r
                },
                move: {
                    mousemove: s,
                    mouseup: u,
                    touchmove: s,
                    touchend: u
                }
            },
            options: o
        }), i.initialize()
    }

    function i(t) {
        return parseInt(t, 10)
    }

    function r(t) {
        return "currentStyle" in t ? t.currentStyle : getComputedStyle(t)
    }

    function s(t) {
        return null != t
    }

    function a(t) {
        return t instanceof Element || "undefined" != typeof HTMLDocument && t instanceof HTMLDocument
    }

    function u() {}
    return n.assign(o.prototype, {
        setOption: function(t, e) {
            var n = this;
            return n.options[t] = e, n.initialize(), n
        },
        get: function() {
            var t = this.dragEvent;
            return {
                x: t.x,
                y: t.y
            }
        },
        set: function(t, e) {
            var n = this.dragEvent;
            return n.original = {
                x: n.x,
                y: n.y
            }, this.move(t, e), this
        },
        dragEvent: {
            started: !1,
            x: 0,
            y: 0
        },
        initialize: function() {
            var t, o = this,
                i = o.element,
                s = (o.handle, i.style),
                a = r(i),
                u = o.options,
                f = e.transform,
                l = o._dimensions = {
                    height: i.offsetHeight,
                    left: i.offsetLeft,
                    top: i.offsetTop,
                    width: i.offsetWidth
                };
            u.useGPU && f && ("none" === (t = a[f]) && (t = ""), s[f] = t + " translate3d(0,0,0)"), u.setPosition && (s.display = "block", s.left = l.left + "px", s.top = l.top + "px", s.width = l.width + "px", s.height = l.height + "px", s.bottom = s.right = "auto", s.margin = 0, s.position = "absolute"), u.setCursor && (s.cursor = "move"), o.setLimit(u.limit), n.assign(o.dragEvent, {
                x: l.left,
                y: l.top
            }), n.on(o.handle, o.handlers.start)
        },
        start: function(t) {
            var e = this,
                o = e.getCursor(t),
                i = e.element;
            e.useTarget(t.target || t.srcElement) && (t.preventDefault && !t.target.getAttribute("contenteditable") ? t.preventDefault() : t.target.getAttribute("contenteditable") || (t.returnValue = !1), e.dragEvent.oldZindex = i.style.zIndex, i.style.zIndex = 1e4, e.setCursor(o), e.setPosition(), e.setZoom(), n.on(document, e.handlers.move))
        },
        drag: function(t) {
            var e = this,
                n = e.dragEvent,
                o = e.element,
                i = e._cursor,
                r = e._dimensions,
                s = e.options,
                a = r.zoom,
                u = e.getCursor(t),
                f = s.threshold,
                l = (u.x - i.x) / a + r.left,
                d = (u.y - i.y) / a + r.top;
            !n.started && f && Math.abs(i.x - u.x) < f && Math.abs(i.y - u.y) < f || (n.original || (n.original = {
                x: l,
                y: d
            }), n.started || (s.onDragStart(o, l, d, t), n.started = !0), e.move(l, d) && s.onDrag(o, n.x, n.y, t))
        },
        move: function(t, e) {
            var n = this,
                o = n.dragEvent,
                i = n.options,
                r = i.grid,
                s = n.element.style,
                a = n.limit(t, e, o.original && o.original.x, o.original && o.original.y);
            return !i.smoothDrag && r && (a = n.round(a, r)), (a.x !== o.x || a.y !== o.y) && (o.x = a.x, o.y = a.y, s.left = a.x + "px", s.top = a.y + "px", !0)
        },
        stop: function(t) {
            var e, o = this,
                i = o.dragEvent,
                r = o.element,
                s = o.options,
                a = s.grid;
            n.off(document, o.handlers.move), r.style.zIndex = i.oldZindex, s.smoothDrag && a && (e = o.round({
                x: i.x,
                y: i.y
            }, a), o.move(e.x, e.y), n.assign(o.dragEvent, e)), o.dragEvent.started && s.onDragEnd(r, i.x, i.y, t), o.reset()
        },
        reset: function() {
            this.dragEvent.started = !1
        },
        round: function(t) {
            var e = this.options.grid;
            return {
                x: e * Math.round(t.x / e),
                y: e * Math.round(t.y / e)
            }
        },
        getCursor: function(t) {
            return {
                x: (t.targetTouches ? t.targetTouches[0] : t).clientX,
                y: (t.targetTouches ? t.targetTouches[0] : t).clientY
            }
        },
        setCursor: function(t) {
            this._cursor = t
        },
        setLimit: function(t) {
            var e = this,
                o = function(t, e) {
                    return {
                        x: t,
                        y: e
                    }
                };
            if (t instanceof Function) e.limit = t;
            else if (a(t)) {
                var i = e._dimensions,
                    r = t.scrollHeight - i.height,
                    u = t.scrollWidth - i.width;
                e.limit = function(t, e) {
                    return {
                        x: n.limit(t, [0, u]),
                        y: n.limit(e, [0, r])
                    }
                }
            } else if (t) {
                var f = s(t.x),
                    l = s(t.y);
                e.limit = f || l ? function(e, o) {
                    return {
                        x: f ? n.limit(e, t.x) : e,
                        y: l ? n.limit(o, t.y) : o
                    }
                } : o
            } else e.limit = o
        },
        setPosition: function() {
            var t = this.element,
                e = t.style;
            n.assign(this._dimensions, {
                left: i(e.left) || t.offsetLeft,
                top: i(e.top) || t.offsetTop
            })
        },
        setZoom: function() {
            for (var t = this.element, e = 1; t = t.offsetParent;) {
                var n = r(t).zoom;
                if (n && "normal" !== n) {
                    e = n;
                    break
                }
            }
            this._dimensions.zoom = e
        },
        useTarget: function(t) {
            var e = this.options.filterTarget;
            return !(e instanceof Function) || e(t)
        },
        destroy: function() {
            n.off(this.handle, this.handlers.start), n.off(document, this.handlers.move)
        }
    }), o
});