
      "use strict";
exports.__esModule = true;
exports.DatabrokerEarlyEvalChecker = void 0;
var glide_1 = require("@servicenow/glide");
var early_eval_utils_js_1 = require("./early-eval-utils.js");
var DatabrokerEarlyEvalChecker = /** @class */ (function () {
    function DatabrokerEarlyEvalChecker() {
    }
    DatabrokerEarlyEvalChecker.prototype.validateDataBrokerEarlyEval = function (macroponentSysId, pageRegistrySysId, routesAndFieldParams, macroponentConfig) {
        if (!macroponentSysId || !pageRegistrySysId || (0, early_eval_utils_js_1.isEmpty)(macroponentConfig)) {
            return [];
        }
        if (!(0, early_eval_utils_js_1.isEmpty)(macroponentConfig)) {
            return (glide_1.UxFrameworkScriptables.getEligibleDataResourceIds(macroponentSysId, pageRegistrySysId, routesAndFieldParams || {}, macroponentConfig || {}) || []);
        }
        return [];
    };
    return DatabrokerEarlyEvalChecker;
}());
exports.DatabrokerEarlyEvalChecker = DatabrokerEarlyEvalChecker;
