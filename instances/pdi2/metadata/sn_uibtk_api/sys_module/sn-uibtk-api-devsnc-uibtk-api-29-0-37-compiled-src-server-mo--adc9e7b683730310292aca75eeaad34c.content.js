
      "use strict";
exports.__esModule = true;
exports.isEmpty = void 0;
var isEmpty = function (value) {
    if (value === null || value === undefined) {
        return true;
    } // null or undefined
    if (typeof value === 'boolean') {
        return false;
    }
    if (typeof value === 'number') {
        return false;
    }
    if (typeof value === 'function') {
        return false;
    }
    if (typeof value === 'string') {
        return value.length === 0;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (value instanceof Map || value instanceof Set) {
        return value.size === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return false;
};
exports.isEmpty = isEmpty;
