// Utils.

function jerr(msg) {
    console.log(msg);
}

function jwarn(msg) {
    console.log(msg);
}

function jvec2(_x, _y) {
    var result = {
        x: _x ? _x : 0.0,
        y: _y ? _y : 0.0,

        length: function() {
            return sqrt(this.x * this.x + this.y * this.y);
        },

        normalize: function() {
            var l = this.length();
            this.x /= l;
            this.y /= l;

            return this;
        },

        normalized: function() {
            var l = this.length();

            return jvec2(this.x / l, this.y / l);
        },

        add: function(o) {
            var v = jvec2(
                this.x + o.x,
                this.y + o.y
            );

            return v;
        },

        min: function(o) {
            var v = jvec2(
                this.x - o.x,
                this.y - o.y
            );

            return v;
        }
    };

    return result;
}

// Yet another OOP support.

var jsui = { }

jsui.nameSeed = 0;
jsui.generateName = function() {
    jsui.nameSeed++;

    return jsui.nameSeed.toString();
};

function jclass(thisType, baseType, name, extra) {
    var jthis = undefined;

    if (name == undefined)
        name = "ANONYMOUS_" + jsui.generateName();

    var _thisType = jsui[thisType];
    var _baseType = jsui[baseType];

    if (_baseType != undefined) {
        jthis = _baseType(name, extra);
    } else {
        jthis = {
            type: _thisType,
            base: _baseType,
            baseObj: undefined,

            className: thisType,

            is: function(t) {
                if (t == _thisType)
                    return true;

                return this.inheritChain[t] != undefined;
            },

            add: function(child) {
                if (this.children == undefined)
                    this.children = { };

                if (this.children[child.getName()] != undefined) {
                    jwarn("A child named " + child.getna() + " already exists.");

                    return this;
                }

                this.children[child.getName()] = child;
                child.parent = this;

                return this;
            },

            remove: function(name) {
                if (typeof(name) != "string")
                    name = name.getName();

                var c = this.at(name);
                if (c != undefined) {
                    this.children[name] = undefined;
                    c.parent = undefined;
                }

                return this;
            },

            at: function(name) {
                if (this.children == undefined)
                    return undefined;

                return this.children[name];
            },

            iterate: function(func) {
                if (func == undefined)
                    jerr("Error: undefined func.");

                if (this.children != undefined) {
                    for (c in this.children)
                        func(c, this.children[c]);
                }

                return this;
            },

            getName: function() {
                return name;
            },

            override: function(funcName, newFunc) {
                if (this[funcName] != undefined) {
                    if (this.baseObj == undefined)
                        this.baseObj = { };
                    this.baseObj[funcName] = this[funcName];
                    this[funcName] = newFunc;
                }

                return this;
            }
        }
    }

    if (jthis.inheritChain == undefined)
        jthis.inheritChain = { };
    jthis.inheritChain[_thisType] = _thisType;

    return jthis;
};

// The hub.

function jform(cvs) {
    var result = {
        canvas: cvs,
        context: cvs.getContext("2d"),

        root: undefined,

        dirty: true,

        touching: undefined,

        keyDown: undefined,
        touchDown: undefined,
        touchMove: undefined,
        touchUp: undefined,

        setCursor: function(cursorStyle) {
            if (this.canvas.style)
                this.canvas.style.cursor = cursorStyle;
        },

        point: function(x, y) {
            var bbox = result.canvas.getBoundingClientRect();

            return {
                x: x - bbox.left * (result.canvas.width / bbox.width),
                y: y - bbox.top * (result.canvas.height / bbox.height),
                toString: function() { return this.x.toString() + ", " + this.y.toString(); }
            };
        },

        render: function() {
            this.root.render(this);
        },

        clear: function() {
            var bbox = result.canvas.getBoundingClientRect();
            this.context.clearRect(0, 0, bbox.width, bbox.height);
        },

        run: function() {
            if (!this.dirty)
                return this;

            this.dirty = false;

            this.clear();

            this.render();

            return this;
        }
    };

    window.addEventListener(
        "keydown",
        function(e) {
            var keyId = e.keyCode ? e.keyCode : e.which;
            if (result.keyDown != undefined)
                result.keyDown(result, keyId);

            result.run();
        },
        true
    );

    function reg(evt, hdl, ex) {
        cvs.addEventListener(
            evt,
            function(e) {
                var p = result.point(e.pageX, e.pageY);

                var picked = result.root.pick(p.x, p.y);
                if (picked != undefined && picked.obj != undefined && picked.obj[hdl] != undefined)
                    picked.obj[hdl](result, picked.obj, picked.pos);

                if (ex != undefined) {
                    ex(result, picked);
                }

                if (result[hdl] != undefined)
                    result[hdl](result, p);

                result.run();
            },
            false
        );
    }
    reg(
        "mousedown",
        "touchDown",
        function(j, picked) {
            if (picked != undefined && picked.obj != undefined && picked.obj._touchDown != undefined)
                picked.obj._touchDown(result, picked.obj, picked.pos);
        }
    );
    reg(
        "mousemove",
        "touchMove",
        function(j, picked) {
            if (result.touching != undefined && ((picked == undefined || picked.obj == undefined) || (picked != undefined && picked.obj != undefined && result.touching != picked.obj))) {
                if (result.touching.touchOut != undefined)
                    result.touching.touchOut(result, picked.obj, picked.pos);

                if (result.touching._touchOut != undefined)
                    result.touching._touchOut(result, result.touching, picked != undefined ? picked.pos : undefined);

                result.touching = undefined;
            }
            if (result.touching == undefined && picked != undefined && picked.obj != undefined) {
                if (picked.obj.touchIn != undefined)
                    picked.obj.touchIn(result, picked.obj, picked.pos);

                if (picked != undefined && picked.obj != undefined && picked.obj._touchIn != undefined)
                    picked.obj._touchIn(result, picked.obj, picked.pos);

                result.touching = picked.obj;
            }
        }
    );
    reg(
        "mouseup",
        "touchUp",
        function(j, picked) {
            if (picked != undefined && picked.obj != undefined && picked.obj._touchUp != undefined)
                picked.obj._touchUp(result, picked.obj, picked.pos);
        }
    );

    cvs.focus();

    return result;
};

// Base for all controls.

jsui.control = function(_name, _jform) {
    var jthis = jclass("control", undefined, _name, _jform);

    jthis.jform = _jform;

    jthis.touchDown = undefined;
    jthis.touchMove = undefined;
    jthis.touchUp = undefined;
    jthis.touchIn = undefined;
    jthis.touchOut = undefined;

    jthis._touchDown = undefined;
    jthis._touchMove = undefined;
    jthis._touchUp = undefined;
    jthis._touchIn = undefined;
    jthis._touchOut = undefined;

    jthis.visible = true;

    jthis.touchEnabled = true;

    jthis.size = jvec2();

    jthis.position = jvec2();
    jthis.derivedPosition = undefined;

    jthis.color = "black";

    jthis.alpha = 1.0;

    jthis.fill = false;

    jthis.markPositionDirty = function() {
//*
        var n = jthis;
        while (n != undefined) {
            n.derivedPosition = undefined;
            n = n.parent;
        }
//*/
/*
        jthis.derivedPosition = undefined;
        for (c in jthis.children)
            n.children[c].markPositionDirty();
//*/
    }

    jthis.setVisible = function(v) {
        _jform.dirty = true;

        jthis.visible = v;

        return jthis;
    };
    jthis.getVisible = function() {
        if (!jthis.visible)
            return false;

        var n = jthis.parent;
        while (n != undefined) {
            if (!n.visible)
                return false;

            n = n.parent;
        }

        return true;
    };

    jthis.setTouchEnabled = function(e) {
        jthis.touchEnabled = e;

        return jthis;
    };

    jthis.setSize = function(w, h) {
        _jform.dirty = true;

        jthis.size = jvec2(w, h);
        if (jthis.jform.root != undefined)
            jthis.jform.root.markPositionDirty();
        if(jthis.getName() == "nnn3")
        {
            console.log(jthis.size);
        }
        return jthis;
    };

    jthis.setPosition = function(x, y) {
        _jform.dirty = true;

        jthis.position = jvec2(x, y);
        if (jthis.jform.root != undefined)
            jthis.jform.root.markPositionDirty();

        return jthis;
    };

    jthis.getDerivedPosition = function() {
        do {
            if (jthis.derivedPosition != undefined)
                break;

            if (jthis.parent == undefined)
                jthis.derivedPosition = jthis.position;
            else
                jthis.derivedPosition = jthis.position.add(jthis.parent.getDerivedPosition());
        } while (false);

        return jthis.derivedPosition;
    };

    jthis.setColor = function(c) {
        _jform.dirty = true;

        jthis.color = c;

        return jthis;
    };

    jthis.setAlpha = function(a) {
        _jform.dirty = true;

        jthis.alpha = a;

        return jthis;
    };

    jthis.setFill = function(f) {
        _jform.dirty = true;

        jthis.fill = f;

        return jthis;
    };

    jthis.preRender = function(__jform) {
        if (!jthis.visible)
            return undefined;

        if (jthis.color != undefined)
            __jform.context.fillStyle = jthis.color;

        if (__jform.context.globalAlpha != jthis.alpha)
            __jform.context.globalAlpha = jthis.alpha;

        return jthis;
    };

    jthis.render = function(__jform) {
        jthis.getDerivedPosition();

        for (c in jthis.children) {
            var o = jthis.children[c];
            o.getDerivedPosition();
            o.render(__jform);
        }

        return jthis;
    };

    jthis.containsPoint = function(x, y) {
        jthis.getDerivedPosition();

        var _l = jthis.derivedPosition.x;
        var _t = jthis.derivedPosition.y;
        var _r = jthis.derivedPosition.x + jthis.size.x;
        var _b = jthis.derivedPosition.y + jthis.size.y;
        if (_t > _b) {
            var tmp = _t;
            _t = _b;
            _b = tmp;
        }
        var c = x >= _l && x <= _r && y >= _t && y <= _b;

        if (c) {
            return jvec2(
                x - jthis.derivedPosition.x,
                y - jthis.derivedPosition.y
            );
        }

        return undefined;
    };

    jthis.pick = function(x, y) {
        if (!jthis.touchEnabled || !jthis.getVisible())
            return undefined;

        var result = undefined;
        var pos = jthis.containsPoint(x, y);
        if (pos != undefined) {
            result = {
                obj: undefined,
                pos: undefined
            };
            result.obj = jthis;
            result.pos = pos;

            for (c in jthis.children) {
                var r = jthis.children[c].pick(x, y);
                if (r != undefined)
                    result = r;
            }
        }
        
        return result;
    };
    
    return jthis;
};

// Derived control classes.

jsui.box = function(_name, _jform) {
    var jthis = jclass("box", "control", _name, _jform);

    jthis.image = new Image();

    jthis.setImage = function(name) {
        _jform.dirty = true;

        jthis.image.src = name;
        jthis.image.onload = function() {
            jthis.getDerivedPosition(_jform);
            jthis.render(_jform);
        }

        return jthis;
    }

    jthis.override("render", function(__jform) {
            jthis.getDerivedPosition();

            if (jthis.preRender(__jform) == undefined)
                return jthis;

            __jform.context.drawImage(
                jthis.image,
                jthis.derivedPosition.x, jthis.derivedPosition.y,
                jthis.size.x, jthis.size.y
            );

            return jthis.baseObj.render(__jform);
        }
    );

    return jthis;
};

jsui.line = function(_name, _jform) {
    var jthis = jclass("line", "control", _name, _jform);

    jthis.touchEnabled = false;

    jthis.endPoint = jvec2();

    jthis.setEndPoint = function(x, y) {
        jthis.endPoint = jvec2(x, y);

        return jthis;
    };

    jthis.override("render", function(__jform) {
            jthis.getDerivedPosition();

            if (jthis.preRender(__jform) == undefined)
                return jthis;

            __jform.context.moveTo(jthis.derivedPosition.x, jthis.derivedPosition.y);
            __jform.context.lineTo(
                jthis.derivedPosition.x - jthis.position.x + jthis.endPoint.x,
                jthis.derivedPosition.y - jthis.position.y + jthis.endPoint.y
            );
            __jform.context.stroke();

            return jthis.baseObj.render(__jform);
        }
    );

    return jthis;
};

jsui.circle = function(_name, _jform) {
    var jthis = jclass("circle", "control", _name, _jform);

    // TODO

    return jthis;
};

jsui.rect = function(_name, _jform) {
    var jthis = jclass("rect", "control", _name, _jform);

    jthis.override("render", function(__jform) {
            jthis.getDerivedPosition();

            if (jthis.preRender(__jform) == undefined)
                return jthis;

            if (jthis.fill) {
                __jform.context.fillRect(
                    jthis.derivedPosition.x,
                    jthis.derivedPosition.y,
                    jthis.size.x,
                    jthis.size.y
                );
            } else {
                __jform.context.strokeRect(
                    jthis.derivedPosition.x,
                    jthis.derivedPosition.y,
                    jthis.size.x,
                    jthis.size.y
                );
            }

            return jthis.baseObj.render(__jform);
        }
    );

    return jthis;
};

jsui.text = function(_name, _jform) {
    var jthis = jclass("text", "control", _name, _jform);

    jthis.text = "";

    jthis.fontSize = 20;
    jthis.fontName = "Verdana";

    jthis.wrapEnabled = true;

    jthis.setText = function(t) {
        jthis.text = t;

        var s = jthis.measure();
        jthis.setSize(s.width, jthis.fontSize);

        return jthis;
    };

    jthis.setFontSize = function(s) {
        jthis.fontSize = s;

        return jthis;
    };

    jthis.setFontName = function(n) {
        jthis.fontName = n;

        return jthis;
    };

    jthis.setWrapEnabled = function(w) {
        jthis.wrapEnabled = w;

        return jthis;
    };

    jthis.assignFont = function() {
        _jform.context.font = jthis.fontSize.toString() + "px " + jthis.fontName;
        if (jthis.prefix != undefined)
            _jform.context.font = jthis.prefix + _jform.context.font;

        return jthis;
    };

    jthis.measure = function(s) {
        jthis.assignFont();

        if (s == undefined)
            s = jthis.text;

        return _jform.context.measureText(s);
    };

    jthis.wrap = function(text, x, y, maxWidth, lineHeight) {
        var context = _jform.context;
        jthis.assignFont();
        var cars = text.split("\n");
        for (var ii = 0; ii < cars.length; ii++) {
            var line = "";
            var words = cars[ii].split(" ");

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > maxWidth) {
                    context.fillText(line, x, y);
                    line = words[n] + " ";
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y);
            y += lineHeight;
        }
    };

    jthis.override("render", function(__jform) {
            jthis.getDerivedPosition();

            if (jthis.preRender(__jform) == undefined)
                return jthis;

            if (jthis.wrapEnabled) {
                jthis.wrap(jthis.text, jthis.derivedPosition.x, jthis.derivedPosition.y, jthis.size.x, jthis.fontSize);
            } else {
                jthis.assignFont();
                __jform.context.fillText(jthis.text, jthis.derivedPosition.x, jthis.derivedPosition.y);
            }

            return jthis.baseObj.render(__jform);
        }
    );

    return jthis;
};

jsui.url = function(_name, _jform) {
    var jthis = jclass("url", "text", _name, _jform);

    jthis.url = "";

    jthis.wrapEnabled = false;

    jthis.setColor("blue");

    jthis.setUrl = function(u) {
        jthis.url = u;

        return jthis;
    };

    jthis._touchIn = function(j, c, p) {
        jthis.prefix = "italic ";
        _jform.setCursor("pointer");

        _jform.dirty = true;
    };

    jthis._touchOut = function(j, c, p) {
        jthis.prefix = undefined;
        _jform.setCursor("");

        _jform.dirty = true;
    };

    jthis._touchDown = function(j, c, p) {
        window.open(jthis.url);
    };

    return jthis;
};

jsui.list = function(_name, _jform) {
    var jthis = jclass("list", "control", _name, _jform);

    jthis.items = [ ];

    jthis.addItem = function(item) {
        jthis.add(item);
        jthis.items.push(item);

        item.setSize(jthis.size.x, jthis.size.y);

        return jthis;
    };

    jthis.at = function(idx) {
        return jthis.items[idx];
    };

    jthis.layout = function() {
        for (i = 0; i < jthis.items.length; i++) {
            var item = jthis.items[i];
            item.setPosition(0, i * jthis.size.y);
        }

        return jthis;
    };

    return jthis;
};
