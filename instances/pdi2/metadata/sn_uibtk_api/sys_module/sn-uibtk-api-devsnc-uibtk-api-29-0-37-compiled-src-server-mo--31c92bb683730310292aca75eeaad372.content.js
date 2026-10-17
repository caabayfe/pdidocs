
      "use strict";
exports.__esModule = true;
exports.convertDismissRecordsToKeyedObject = exports.convertGlideRecordRuleDismissToObject = exports.getGlideRecordRuleDismiss = void 0;
var glide_1 = require("@servicenow/glide");
var safe_json_parse_js_1 = require("../utils/safe-json-parse.js");
var getGlideRecordRuleDismiss = function (targetIds) {
    if (targetIds.length === 0) {
        return {
            error: 'Invalid payload. one macroponentId or more is required to fetch dismiss records'
        };
    }
    var grUxMcpRuleDismiss = new glide_1.GlideRecord('sys_ux_diagnostic_rule_dismiss');
    grUxMcpRuleDismiss.addQuery('target_id', 'IN', targetIds.join(','));
    grUxMcpRuleDismiss.query();
    var dismissRecords = [];
    while (grUxMcpRuleDismiss.next()) {
        dismissRecords.push((0, exports.convertGlideRecordRuleDismissToObject)(grUxMcpRuleDismiss));
    }
    return dismissRecords;
};
exports.getGlideRecordRuleDismiss = getGlideRecordRuleDismiss;
var convertGlideRecordRuleDismissToObject = function (grUxDismiss) {
    var _a;
    if (grUxDismiss !== undefined) {
        return {
            target_id: grUxDismiss.getValue('target_id'),
            table_name: grUxDismiss.getValue('table_name'),
            dismiss_targets: (_a = (0, safe_json_parse_js_1.safeJSONparse)(grUxDismiss.getValue('dismiss_targets'))) !== null && _a !== void 0 ? _a : {}
        };
    }
    return {
        target_id: '',
        table_name: '',
        dismiss_targets: {}
    };
};
exports.convertGlideRecordRuleDismissToObject = convertGlideRecordRuleDismissToObject;
var convertDismissRecordsToKeyedObject = function (dismissRecords) {
    return (dismissRecords !== null && dismissRecords !== void 0 ? dismissRecords : []).reduce(function (arr, dr) {
        arr[dr.target_id] = dr;
        return arr;
    }, {});
};
exports.convertDismissRecordsToKeyedObject = convertDismissRecordsToKeyedObject;
