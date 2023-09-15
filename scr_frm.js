'use strict';
// for debuging (Global daTaypes)
[Number, String, Boolean, Symbol, Object].forEach(e => {
    //log by a after function
    e.prototype.log = function () { console.log(this, ...arguments); return this };
    // log by a Interval, 300ms
    e.prototype.logLoop = function (t = 300) { return setInterval(() => this.log(), t) };
})

//==========================
// all prototypes for Numbers
Object.assign(Number.prototype, {
    // clear Interval and Timeout
    stopInterval: function () { window.clearInterval(this) },
    stopTimeout: function () { window.clearTimeout(this) },

    // index by selector --------------------
    $: function () { return [document.all[this]] },

    // maths ---------------------
    getRandomInt: function () { return Math.randomInt(0, this) },
    getrandomFloat: function () { return Math.randomFloat(0, this) },
    clamp: function () { return Math.clamp(this, ...arguments) },
    sqrt: function () { return Math.sqrt(this) },
    getRandomBool: function () { return Math.random() < this },
    toInt: function () { return parseInt(this) },
})

//===========================
//all prototypes for Math class
Object.assign(Math, {
    randomInt: function (min, max) { return (Math.random() * (max - min) + min).toInt() },
    randomFloat: function (min, max) { return Math.random() * (max - min) + min },
    clamp: function (x, min, max) { return Math.max(min, Math.min(max, x)) },
})

//==========================
// all prototypes for String
Object.assign(String.prototype, {
    // get as qurey selector -------------------
    $: function () { return document.querySelectorAll(this) },

    // adding some of the obeject Prototype to String
    // for css and html menagement ------------------
    setCss: function (x, y) { return this.$().setCss(x, y) },
    getCss: function (x) { return this.$().getCss(x) },
    hide: function () { return this.$().hide() },
    show: function () { return this.$().show() },
    togle: function () { return this.$().togle() },
    setAttr: function (x, y) { return this.$().setAttr(x, y) },
    rmAttr: function (x) { return this.$().rmAttr(x) },
    html: function (x) { return this.$().htmlBy(x) },
    tex: function (x) { return this.$().texBy(x) },
    val: function (x) { return this.$().valBy(x) },
    id: function (x) { return this.$().idBy(x) },
    class: function (x) { return this.$().classBy(x) },
    rmClass: function (x) { return this.$().rmClass(x) },

    //http request -----------------------
    fetch: function (opt = {}) { return fetch(this, opt).then(res => res[opt['dataType'] || 'json']()) },
    getJson: function (fb) { this.fetch({ 'dataType': 'json' }).then(d => fb(d)) },
    getText: function (fb) { this.fetch({ 'dataType': 'text' }).then(d => fb(d)) },

    // for string manipulation ----------------
    isSame: function (list) { return list.some(e => this.includes(e)) },
    isEqual: function (list) { return list.every(e => this.includes(e)) },

    //math
    toInt: function () { return parseInt(this) },
    toFloat: function () { return parseFloat(this) },
    extractNumbers: function () { return this.match(/\d+(\.\d+)?/g)?.map(Number) || []; },
    extractText: function () { return this.replace(/\d+/g, '') },
})

//=============================
// all prototypes for Object and Array
Object.assign(Object.prototype, {
    // networks ----------------------
    //for ajax XMLHttp request 
    ajax: function (fb) {
        const xhr = new XMLHttpRequest()
        xhr.open(...this)
        if (fb(xhr)) xhr.send()
        return xhr
    },

    // get as qurey selector for lists(Array) -----------------
    $: function (x) {
        if (this.isHtml() || this.isNodeList()) return x ? this.querySelectorAll(x) : this;
        let out = []
        this.flattenArray().forEach(e => out = [...out, ...e.isHtml() ? [e] : e.$()])
        return out
    },

    // for DOM and css element ------------------
    // for CSS and style functions
    setCss: function (pro, val) {
        this.orderHtml(elm => {
            val ? elm.style[pro] = val :
                Object.assign(elm.style, pro);
        })
        return this
    },
    getCss: function (p) { return window.getComputedStyle(this)[p] },
    //show and hide, toggle for display propraty
    hide: function () {
        this.orderHtml(elm => {
            elm._displayProp = elm.getCss('display')
            elm.style.display = 'none'
        })
        return this
    },
    show: function () {
        this.orderHtml(elm => elm.style.display = elm._displayProp);
        return this
    },
    togle: function () {
        this.orderHtml(elm => elm.style.display
            = elm.getCss('display') != 'none'
                ? 'none' : elm._displayProp || 'block');
        return this
    },

    // for html element -------------------
    // filter all html element in a Array even if it have multiple arrays in in
    filterHtml: function () {
        const out = [], data = this.flattenArray()
        for (let i = 0; i < data.length; i++) {
            const elm = data[i];
            elm.isHtml() && out.push(elm);
        }
        return out
    },
    // chake if the element is list or single html element then simplify to a Array
    orderHtml: function (fb) {
        return ((this.isArray() || this.isNodeList())
            ? this : [this]).filterHtml().forEach(fb)
    },
    // set the object propraty from a Array or single, also retruns if i is empty
    // element.x = y
    prop: function (p, i) {
        const out = []
        this.orderHtml((elm, e) => i ? elm[p]
            = i.isArray() ? i[e] || i.last() : i
            : out.push(elm[p]));
        return i ? this : out.getSingulair()
    },
    setAttr: function (pro, val) {
        this.orderHtml(elm => {
            val ? elm.setAttribute(pro, val) :
                pro.getKeys().forEach(k => {
                    elm.setAttribute(k, pro[k]);
                });
        })
        return this
    },
    getAttr: function (p) {
        const out = []
        this.orderHtml((e, i) => out.push(e.getAttribute(p.isArray() ? p[i] || p.last() : p)))
        return out.getSingulair()
    },
    rmAttr: function (q) {
        this.orderHtml((e, i) => q.isArray()
            ? e.removeAttribute(q[i] || q.last())
            : e.removeAttribute(q));
        return this
    },
    // clone node from list
    clone: function () {
        const out = []
        this.orderHtml(e => out.push(e.cloneNode()))
        return out.getSingulair()
    },
    // delete a html element
    remove: function () {
        this.orderHtml(e => e.parentElement.removeChild(e))
        return null;
    },
    // append or prepend multiple at once
    appendTo: function (/**/) { this.append(...arguments.flattenArray()); return this },
    prependTo: function (/**/) { this.prepend(...arguments.flattenArray()); return this },
    // to directly change or get comon propratis
    htmlBy: function (i) { return this.prop('innerHTML', i) },
    valBy: function (i) { return this.prop('value', i) },
    idBy: function (i) { return this.prop('id', i) },
    texBy: function (i) { return this.prop('innerText', i) },
    //set for get class at one
    classBy: function (i) {
        if (i) {
            this.orderHtml((elm, e) => elm.classList.add(i.isArray()
                ? i[e] || i.last() : i));
            return this
        }
        let out = [];
        this.prop('classList').forEach(elm => out = out.concat(elm.flattenArray()))
        return out.getSingulair()
    },
    rmClass: function (c) { return this.orderHtml((elm) => elm.classList.remove(c)) },
    // html element events
    on: function (ev, fb) {
        function add(t, x, y) {
            return t.orderHtml(elm => { return elm.addEventListener(x, y, true) })
        }
        if (ev) return add(this, ev, fb)
        const elm = this
        // comon user events
        return {
            clc: function (fb) {
                return add(elm, 'click', fb)
            },
            dblclc: function (fb) {
                return add(elm, 'dblclick', fb)
            },
            msmove: function (fb) {
                return add(elm, 'mousemove', fb)
            },
            kpress: function (fb) {
                return add(elm, 'keypress', fb)
            },
            kup: function (fb) {
                return add(elm, 'keyup', fb)
            },
            //spacial, advance events
            hover: function (fb1, fb2) {
                return fb2 ? [add(elm, 'mouseenter', fb1), add(elm, 'mouseleave', fb2)] : add(elm, 'mouseenter', fb1)
            },
            drag: function (fb) {
                add(elm, 'drag', fb)
            }
        }
    },

    // all are for Array ---------------------
    // also for all type of list
    // for type bace cundetions
    isHtml: function () { return this instanceof HTMLElement },
    isNodeList: function () { return this instanceof NodeList },
    isArray: function () { return Array.isArray(this) },
    // besic push function but with infinite args at once
    add: function (...x) { return this.concat(x) },
    // retrun the first value if it has only one value
    getSingulair: function () { return this.length > 1 ? this : this[0] },
    last: function () { return this[this.length - 1] }, // get the last value
    // get all values at once even if it has more then 1 array in it
    // [1,2,[3,4,[5,6,...]]] = [1,2,3,4,5,6,...]
    flattenArray: function () {
        let out = []
        for (let i = 0; i < this.length; i++) {
            const elm = this[i];
            out = out.concat(elm && (elm.isArray() || elm.isNodeList()) ? elm.flattenArray() : [elm]);
        }
        return out
    },
    // like [1,2,3,[...]] = [1,2,3,[...]]
    isArrayEqual: function (tg) {
        const a1 = this.flattenArray(), a2 = tg.flattenArray()
        if (a1.length !== a2.length) return false;
        for (let i = 0; i < a1.length; i++)
            if (a1[i] && a1[i].isObject() ? !a1[i].isObjectEqual(a2[i]) : a1[i] !== a2[i]) return false;
        return true;
    },
    // like [[...],1,2,3] = [3,2,1,[...]]
    isArraySame: function (tg) { return this.flattenArray().sort().isArrayEqual(tg.flattenArray().sort()) },
    // maths and tricks
    toInt: function () { return this.map(str => str.toInt() || str) },
    toFloat: function () { return this.map(str => str.toFloat()) },
    getArrayMin: function () { return Math.min(...this) },
    // getArrayAverage: function () { return this.reduce((acc, curr) => acc + ((typeof curr === 'number' && curr === 0 ? true : !!curr) ? curr : 0), 0) / this.length },
    getArrayAverage: function () {
        let sub = 0, count = 0;
        this.forEach(e => {
            if (typeof e == "number" && (e === 0 ? true : !!e)) count += e
            else sub++
        })
        return count / (this.length - sub)
    },
    getArrayMax: function () { return Math.max(...this) },
    getArrayComon: function () { return this.filter((v, i, a) => a.indexOf(v) === i) },
    getArrayduplicate: function () { return this.filter((v, i, a) => a.indexOf(v) !== i) },
    getArrayMaxDuplicate: function () { return this.getArrayduplicate().reduce((acc, curr) => acc.length < curr.length ? curr : acc) },
    getArrayMinDuplicate: function () { return this.getArrayduplicate().reduce((acc, curr) => acc.length > curr.length ? curr : acc) },
    getRandomIndex: function () { return this.length.getRandomInt() },

    // functions that can be use for both objects and array ----------------
    isEmpty: function () { return !this.length && !this.getLength(); },
    getRandomValue: function () { return this[this.isObject() ? this.getKeys().getRandomValue() : this.length.getRandomInt()] },

    // for objects ---------------------
    getRandomKey: function () { return this.getKeys().getRandomValue() },
    toArray: function () { return Array(...this) },
    isObject: function () { return typeof this == 'object' && this.length == undefined },
    getKeys: function () { return Object.keys(this) },
    getLength: function () { return Object.keys(this).length },
    getValues: function () { return Object.values(this) },
    deepClone: function () { return Object.assign({}, this) },
    mergeObj: function (/**/) { return Object.assign(this, ...arguments) },
    clearAllValue: function () { return this.mapObj(elm => elm.isObject() ? elm.clearAllValue() : '') },
    flattenObj: function (prefix = '') {
        const flattened = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const newKey = prefix ? prefix + '_' + key : key;
                (this[key] && this[key].isObject())
                    ? Object.assign(flattened, this[key].flattenObj(newKey))
                    : flattened[newKey] = this[key];
            }
        }
        return flattened;
    },
    flattenObjKeys: function () {
        let out = []
        for (const k in this)
            if (this.hasOwnProperty(k))
                out = out.concat(this[k] && this[k].isObject() ? this[k].flattenObjKeys() : k);
        return out
    },
    flattenObjValues: function () {
        let out = []
        this.mapObj(v => {
            out = out.concat(v && v.isObject() ? v.flattenObjValues() : [v]);
        })
        return out
    },
    mapObj: function (fb) {
        for (const k in this) if (this.hasOwnProperty(k)) this[k] = fb(this[k], k) || this[k]
        return this
    },
    isObjectEqual: function (tg) {
        if (this.getLength() != tg.getLength()) return false
        return this.flattenObjKeys().isArrayEqual(tg.flattenObjKeys())
            && this.flattenObjValues().isArrayEqual(tg.flattenObjValues())
    },
    isObjectSame: function (tg) {
        if (this.getLength() != tg.getLength()) return false
        return this.flattenObjKeys().isArraySame(tg.flattenObjKeys())
            && this.flattenObjValues().isArraySame(tg.flattenObjValues())
    },
    // network
    fetch: function (fb) { return this['url'].fetch(this).then(d => fb(d)) },
})
//==========================
// all prototypes for Boolean
Object.assign(Boolean.prototype, {
    invert: function () { return !this },
    toInt: function () { return this ? 1 : 0 },
})
Object.assign(Boolean, {
    ands: function (/**/) { return arguments.toArray().every(elm => elm) },
    ors: function (/**/) { return arguments.toArray().some(elm => elm) },
})