
      "use strict";
exports.__esModule = true;
exports.RuleDismissFetcher = void 0;
var rule_dismiss_fetcher_utils_js_1 = require("./rule-dismiss-fetcher-utils.js");
var RuleDismissFetcher = /** @class */ (function () {
    function RuleDismissFetcher() {
    }
    RuleDismissFetcher.prototype.getGlideRecordRuleDismiss = function (mcpId) {
        return (0, rule_dismiss_fetcher_utils_js_1.getGlideRecordRuleDismiss)(mcpId);
    };
    RuleDismissFetcher.prototype.getGlideRecordRuleDismissAsKeyedObject = function (targetIds) {
        var dismissRecords = (0, rule_dismiss_fetcher_utils_js_1.getGlideRecordRuleDismiss)(targetIds);
        if ('error' in dismissRecords) {
            return dismissRecords;
        }
        return (0, rule_dismiss_fetcher_utils_js_1.convertDismissRecordsToKeyedObject)(dismissRecords);
    };
    return RuleDismissFetcher;
}());
exports.RuleDismissFetcher = RuleDismissFetcher;
