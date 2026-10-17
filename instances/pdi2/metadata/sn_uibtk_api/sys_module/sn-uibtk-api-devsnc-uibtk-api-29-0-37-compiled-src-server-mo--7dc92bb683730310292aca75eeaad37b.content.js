
      "use strict";
exports.__esModule = true;
exports.convertGlideRecordRuleToObject = exports.getSubscribedRules = exports.convertRulesToKeyedObject = exports.getGlideRecordRule = exports.getRules = void 0;
var glide_1 = require("@servicenow/glide");
// "ruleSysIds" param is being temporarily added just to solve
// the non-MAINT usage during X. Once we release all rules to customers,
// we can probably remove this since I dont see a reason why we'd need it.
var getRules = function (ruleSysIds) {
    var grUxMcpRule = new glide_1.GlideRecord('sys_ux_macroponent_rule');
    grUxMcpRule.addQuery('active', true);
    if (ruleSysIds) {
        grUxMcpRule.addQuery('sys_id', 'IN', ruleSysIds.join(','));
    }
    grUxMcpRule.query();
    var rules = [];
    while (grUxMcpRule.next()) {
        var rule = (0, exports.convertGlideRecordRuleToObject)(grUxMcpRule);
        rules.push(rule);
    }
    return rules;
};
exports.getRules = getRules;
var getGlideRecordRule = function (ruleId) {
    var grUxMcpRule = new glide_1.GlideRecord('sys_ux_macroponent_rule');
    if (grUxMcpRule.get(ruleId)) {
        return grUxMcpRule;
    }
    else {
        return null;
    }
};
exports.getGlideRecordRule = getGlideRecordRule;
var convertRulesToKeyedObject = function (rules) {
    return (rules !== null && rules !== void 0 ? rules : []).reduce(function (arr, rule) {
        arr[rule.sys_id] = rule;
        return arr;
    }, {});
};
exports.convertRulesToKeyedObject = convertRulesToKeyedObject;
var getSubscribedRules = function (params) {
    var grUxRuleSubscription = new glide_1.GlideRecord('sys_ux_diagnostic_rule_m2m_document');
    grUxRuleSubscription.addQuery('subscribed_id', params.sysId);
    grUxRuleSubscription.query();
    var ruleSysIds = [];
    while (grUxRuleSubscription.next()) {
        ruleSysIds.push(grUxRuleSubscription.getValue('diagnostic_rule'));
    }
    return ruleSysIds;
};
exports.getSubscribedRules = getSubscribedRules;
var convertGlideRecordRuleToObject = function (grUxMcpRule) {
    return {
        sys_id: grUxMcpRule.getUniqueValue(),
        name: grUxMcpRule.getValue('name'),
        description: grUxMcpRule.getValue('description'),
        notification_text: grUxMcpRule.getDisplayValue('notification_text'),
        target_type: grUxMcpRule.getValue('target_type'),
        target_id: grUxMcpRule.getValue('target_id'),
        tests: grUxMcpRule.getValue('tests'),
        test_script: grUxMcpRule.getValue('test_script'),
        run_once: grUxMcpRule.getValue('run_once') === '1',
        severity: grUxMcpRule.getValue('severity'),
        active: grUxMcpRule.getValue('active') !== '0',
        builder_context: grUxMcpRule.getValue('builder_context'),
        category: grUxMcpRule.getValue('category')
    };
};
exports.convertGlideRecordRuleToObject = convertGlideRecordRuleToObject;
