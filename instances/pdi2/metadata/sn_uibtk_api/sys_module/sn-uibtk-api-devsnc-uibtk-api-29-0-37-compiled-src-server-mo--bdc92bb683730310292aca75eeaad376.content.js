
      "use strict";
exports.__esModule = true;
exports.deleteDismissViolation = exports.insertDismissViolation = exports.undismissViolation = exports.dismissViolation = exports.upsertDismissRecord = void 0;
var ux_rules_engine_1 = require("@devsnc/ux-rules-engine");
var glide_1 = require("@servicenow/glide");
var rule_dismiss_fetcher_utils_js_1 = require("./rule-dismiss-fetcher-utils.js");
var ruleDismissUtils = new ux_rules_engine_1.UxDiagnosticRuleDismiss();
var upsertDismissRecord = function (payload) {
    if (!payload.target_id || !payload.table_name) {
        return {
            error: 'Invalid payload. target_id and table_name are required to upsert a dismiss record'
        };
    }
    var grDismissRecord = new glide_1.GlideRecord('sys_ux_diagnostic_rule_dismiss');
    grDismissRecord.addQuery('target_id', payload.target_id);
    grDismissRecord.query();
    if (grDismissRecord.next()) {
        grDismissRecord.setValue('dismiss_targets', JSON.stringify(payload.dismiss_targets, null, 2));
        grDismissRecord.update();
    }
    else {
        grDismissRecord.initialize();
        grDismissRecord.setValue('target_id', payload.target_id);
        grDismissRecord.setValue('table_name', payload.table_name);
        grDismissRecord.setValue('dismiss_targets', JSON.stringify(payload.dismiss_targets, null, 2));
        grDismissRecord.insert();
    }
    return grDismissRecord;
};
exports.upsertDismissRecord = upsertDismissRecord;
var dismissViolation = function (dismissPayload) {
    if (!dismissPayload.target_id ||
        !dismissPayload.rule_id ||
        !dismissPayload.element_id ||
        !dismissPayload.dismissed_by) {
        return {
            error: 'Invalid payload. One or more required field to dismiss a violation is missing'
        };
    }
    var grDismissRecord = new glide_1.GlideRecord('sys_ux_diagnostic_rule_dismiss');
    grDismissRecord.addQuery('target_id', dismissPayload.target_id);
    grDismissRecord.query();
    if (grDismissRecord.next()) {
        grDismissRecord.setValue('dismiss_targets', JSON.stringify((0, exports.insertDismissViolation)((0, rule_dismiss_fetcher_utils_js_1.convertGlideRecordRuleDismissToObject)(grDismissRecord), dismissPayload.rule_id, dismissPayload.element_id, dismissPayload.dismissed_by, dismissPayload.query_id).dismiss_targets, null, 2));
        grDismissRecord.update();
    }
    else {
        grDismissRecord.initialize();
        grDismissRecord.setValue('target_id', dismissPayload.target_id);
        grDismissRecord.setValue('table_name', dismissPayload.table_name);
        grDismissRecord.setValue('dismiss_targets', JSON.stringify((0, exports.insertDismissViolation)({
            target_id: dismissPayload.target_id,
            table_name: dismissPayload.table_name,
            dismiss_targets: {}
        }, dismissPayload.rule_id, dismissPayload.element_id, dismissPayload.dismissed_by, dismissPayload.query_id).dismiss_targets, null, 2));
        grDismissRecord.insert();
    }
    return grDismissRecord;
};
exports.dismissViolation = dismissViolation;
var undismissViolation = function (dismissPayload) {
    if (!dismissPayload.target_id ||
        !dismissPayload.rule_id ||
        !dismissPayload.element_id) {
        return {
            error: 'Invalid payload. One or more required field to undismiss a violation is missing'
        };
    }
    var grDismissRecord = new glide_1.GlideRecord('sys_ux_diagnostic_rule_dismiss');
    grDismissRecord.addQuery('target_id', dismissPayload.target_id);
    grDismissRecord.query();
    if (grDismissRecord.next()) {
        grDismissRecord.setValue('dismiss_targets', JSON.stringify((0, exports.deleteDismissViolation)((0, rule_dismiss_fetcher_utils_js_1.convertGlideRecordRuleDismissToObject)(grDismissRecord), dismissPayload.rule_id, dismissPayload.element_id, dismissPayload.query_id).dismiss_targets, null, 2));
        grDismissRecord.update();
    }
    return grDismissRecord;
};
exports.undismissViolation = undismissViolation;
var insertDismissViolation = function (dismissRecord, ruleId, elementId, dismissedBy, queryId) {
    return ruleDismissUtils.dismissByElement(dismissRecord, ruleId, elementId, dismissedBy, queryId);
};
exports.insertDismissViolation = insertDismissViolation;
var deleteDismissViolation = function (dismissRecord, ruleId, elementIdToDelete, queryId) {
    return ruleDismissUtils.undismissByElement(dismissRecord, ruleId, elementIdToDelete, queryId);
};
exports.deleteDismissViolation = deleteDismissViolation;
