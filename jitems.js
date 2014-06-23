// Item.

jsui.resumeItem = function(_name, _jform, _icon, _desc, _txt0, _link0, _txt1, _link1) {
    var jthis = jclass("resumeItem", "control", _name, _jform);

    jthis.panel = jsui.rect(undefined, _jform)
        .setPosition(0, 0)
    ;
    jthis.add(jthis.panel);

    jthis.icon = jsui.rect(undefined, _jform)
        .setPosition(0, 0)
        .setSize(64, 64)
        .add(
             jsui.box(undefined, _jform)
                 .setPosition(1, 1)
                 .setSize(62, 62)
                 .setImage(_icon)
         )
    ;
    jthis.panel.add(jthis.icon);

    jthis.desc = jsui.text(undefined, j)
        .setPosition(72, 14)
        .setSize(30, 100)
        .setText(_desc)
        .setFontSize(12)
    ;
    jthis.panel.add(jthis.desc);

    jthis.link0 = jsui.url(undefined, j)
        .setText(_txt0)
        .setUrl(_link0)
    ;
    jthis.panel.add(jthis.link0);

    if (_txt1 != undefined) {
        jthis.link1 = jsui.url(undefined, j)
            .setText(_txt1)
            .setUrl(_link1)
        ;
        jthis.panel.add(jthis.link1);
    }

    jthis.override("setSize", function(w, h) {
            jthis.baseObj.setSize(w, h);
            jthis.panel.setSize(w, h);

            jthis.link0.setPosition(w - 60, 40);
            var s = jthis.link0.measure();
            jthis.link0.setSize(s.width, -jthis.link0.fontSize);

            if (_txt1 != undefined) {
                jthis.link1.setPosition(w - 120, 40);
                var _s = jthis.link1.measure();
                jthis.link1.setSize(_s.width, -jthis.link1.fontSize);
            }

            return jthis;
        }
    );

    return jthis;
}
