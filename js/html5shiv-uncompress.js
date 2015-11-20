(function (m, a) {
    var g = m.html5 || {},
        r = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
        q = /^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i,
        d, l = "_html5shiv",
        f = 0,
        j = {},
        b;
    (function () {
        try {
            var c = a.createElement("a");
            c.innerHTML = "<xyz></xyz>";
            d = "hidden" in c;
            b = c.childNodes.length == 1 || function () {
                a.createElement("a");
                var b = a.createDocumentFragment();
                return typeof b.cloneNode == "undefined" || typeof b.createDocumentFragment == "undefined" || typeof b.createElement == "undefined"
            }()
        } catch (e) {
            d = true;
            b = true
        }
    })();

    function o(a, d) {
        var c = a.createElement("p"),
            b = a.getElementsByTagName("head")[0] || a.documentElement;
        c.innerHTML = "x<style>" + d + "</style>";
        return b.insertBefore(c.lastChild, b.firstChild)
    }

    function k() {
        var a = c.elements;
        return typeof a == "string" ? a.split(" ") : a
    }

    function e(b) {
        var a = j[b[l]];
        if (!a) {
            a = {};
            f++;
            b[l] = f;
            j[f] = a
        }
        return a
    }

    function h(c, g, d) {
        if (!g) g = a;
        if (b) return g.createElement(c);
        if (!d) d = e(g);
        var f;
        if (d.cache[c]) f = d.cache[c].cloneNode();
        else if (q.test(c)) f = (d.cache[c] = d.createElem(c)).cloneNode();
        else f = d.createElem(c);
        return f.canHaveChildren && !r.test(c) ? d.frag.appendChild(f) : f
    }

    function n(c, d) {
        if (!c) c = a;
        if (b) return c.createDocumentFragment();
        d = d || e(c);
        for (var g = d.frag.cloneNode(), f = 0, h = k(), i = h.length; f < i; f++) g.createElement(h[f]);
        return g
    }

    function p(b, a) {
        if (!a.cache) {
            a.cache = {};
            a.createElem = b.createElement;
            a.createFrag = b.createDocumentFragment;
            a.frag = a.createFrag()
        }
        b.createElement = function (d) {
            return !c.shivMethods ? a.createElem(d) : h(d, b, a)
        };
        b.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + k().join().replace(/\w+/g, function (b) {
            a.createElem(b);
            a.frag.createElement(b);
            return 'c("' + b + '")'
        }) + ");return n}")(c, a.frag)
    }

    function i(f) {
        if (!f) f = a;
        var g = e(f);
        if (c.shivCSS && !d && !g.hasCSS) g.hasCSS = !!o(f, "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}");
        !b && p(f, g);
        return f
    }
    var c = {
        elements: g.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
        shivCSS: g.shivCSS !== false,
        supportsUnknownElements: b,
        shivMethods: g.shivMethods !== false,
        type: "default",
        shivDocument: i,
        createElement: h,
        createDocumentFragment: n
    };
    m.html5 = c;
    i(a)
})(this, document);
(function () {
    if (! /*@cc_on!@*/ 0) return;
    var e = "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video,figcaption".split(','),
        i = e.length;
    while (i--) {
        document.createElement(e[i])
    }
})();