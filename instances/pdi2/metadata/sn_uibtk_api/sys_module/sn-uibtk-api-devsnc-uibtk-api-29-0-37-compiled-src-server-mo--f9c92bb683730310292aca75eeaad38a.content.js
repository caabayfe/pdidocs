
      "use strict";
exports.__esModule = true;
exports.safeJSONparse = void 0;
var safeJSONparse = function (x) {
    var parsed;
    try {
        parsed = JSON.parse(x);
    }
    catch (e) {
        /* do nothing */
    }
    return parsed;
};
exports.safeJSONparse = safeJSONparse;
