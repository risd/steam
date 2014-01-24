var clone = function clone (obj) {
    // Thanks to stackoverflow:
    // http://stackoverflow.com/questions/
    // 728360/most-elegant-way-to-clone-a-javascript-object

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = clone(obj[attr]);
            }
        }
        return copy;
    }
};

if (typeof module !== 'undefined') {
    exports = module.exports = clone;
} else {
    window.clone = clone;
}