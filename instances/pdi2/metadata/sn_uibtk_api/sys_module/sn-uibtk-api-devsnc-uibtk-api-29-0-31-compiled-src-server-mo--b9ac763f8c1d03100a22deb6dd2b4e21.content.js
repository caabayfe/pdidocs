
      "use strict";
exports.__esModule = true;
exports.RuleDismiss = void 0;
var rule_dismiss_fetcher_utils_js_1 = require("./rule-dismiss-fetcher-utils.js");
var rule_dismiss_utils_js_1 = require("./rule-dismiss-utils.js");
var RuleDismiss = /** @class */ (function () {
    function RuleDismiss() {
    }
    RuleDismiss.prototype.dismissViolation = function (target_id, table_name, rule_id, element_id, dismissed_by, query_id) {
        var updatedDismissRecord = (0, rule_dismiss_utils_js_1.dismissViolation)({
            target_id: target_id,
            table_name: table_name,
            rule_id: rule_id,
            element_id: element_id,
            dismissed_by: dismissed_by,
            query_id: query_id
        });
        if ('error' in updatedDismissRecord) {
            return updatedDismissRecord;
        }
        return (0, rule_dismiss_fetcher_utils_js_1.convertGlideRecordRuleDismissToObject)(updatedDismissRecord);
    };
    RuleDismiss.prototype.undismissViolation = function (target_id, table_name, rule_id, element_id, query_id) {
        var updatedDismissRecord = (0, rule_dismiss_utils_js_1.undismissViolation)({
            target_id: target_id,
            table_name: table_name,
            rule_id: rule_id,
            element_id: element_id,
            query_id: query_id
        });
        if ('error' in updatedDismissRecord) {
            return updatedDismissRecord;
        }
        return (0, rule_dismiss_fetcher_utils_js_1.convertGlideRecordRuleDismissToObject)(updatedDismissRecord);
    };
    RuleDismiss.prototype.patchDismissTarget = function (target_id, table_name, dismiss_targets) {
        var updatedDismissRecord = (0, rule_dismiss_utils_js_1.upsertDismissRecord)({
            target_id: target_id,
            table_name: table_name,
            dismiss_targets: JSON.parse(dismiss_targets)
        });
        if ('error' in updatedDismissRecord) {
            return updatedDismissRecord;
        }
        return (0, rule_dismiss_fetcher_utils_js_1.convertGlideRecordRuleDismissToObject)(updatedDismissRecord);
    };
    return RuleDismiss;
}());
exports.RuleDismiss = RuleDismiss;
