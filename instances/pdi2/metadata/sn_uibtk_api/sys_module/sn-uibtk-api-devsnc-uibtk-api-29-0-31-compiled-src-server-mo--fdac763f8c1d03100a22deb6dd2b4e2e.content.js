
      "use strict";
exports.__esModule = true;
exports.RuleFetcher = void 0;
var ux_rules_engine_1 = require("@devsnc/ux-rules-engine");
var rule_fetcher_utils_js_1 = require("./rule-fetcher-utils.js");
var RuleFetcher = /** @class */ (function () {
    function RuleFetcher() {
    }
    RuleFetcher.prototype.getAsKeyedObject = function (ruleSysIds) {
        return (0, rule_fetcher_utils_js_1.convertRulesToKeyedObject)((0, rule_fetcher_utils_js_1.getRules)(ruleSysIds));
    };
    RuleFetcher.prototype.getAsArray = function (ruleSysIds) {
        return (0, rule_fetcher_utils_js_1.getRules)(ruleSysIds);
    };
    RuleFetcher.prototype.getGlideRecordRule = function (uxSysMacroponentRuleId) {
        return (0, rule_fetcher_utils_js_1.getGlideRecordRule)(uxSysMacroponentRuleId);
    };
    RuleFetcher.prototype.getSubscribedRules = function (params) {
        return (0, rule_fetcher_utils_js_1.getSubscribedRules)(params);
    };
    RuleFetcher.prototype.getFilteredRulesForUserAndContext = function (isMaint, sysIdForRuleSubscriptionCheck) {
        return (0, ux_rules_engine_1.getFilteredRuleSet)(isMaint, this.getAsKeyedObject(), ux_rules_engine_1.ASSISTANT_CORE_RULE_SET, this.getSubscribedRules({ sysId: sysIdForRuleSubscriptionCheck }), ['page_builder', 'component_builder', 'controller_builder']);
    };
    return RuleFetcher;
}());
exports.RuleFetcher = RuleFetcher;
