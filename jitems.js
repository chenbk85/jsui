// Item.

jsui.resumeItem = function(_name, _jform, _icon, _desc, _txt, _link) {
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

    jthis.link = jsui.url(undefined, j)
        .setText(_txt)
        .setUrl(_link)
    ;
    jthis.panel.add(jthis.link);

    jthis.override("setSize", function(w, h) {
            jthis.baseObj.setSize(w, h);
            jthis.panel.setSize(w, h);
            jthis.link.setPosition(w - 40, 40);
            var s = jthis.link.measure();
            jthis.link.setSize(s.width, jthis.link.fontSize);

            return jthis;
        }
    );

    return jthis;
}
