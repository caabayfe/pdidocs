
      "use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.RuleChecker = void 0;
var ux_rules_engine_1 = require("@devsnc/ux-rules-engine");
var glide_1 = require("@servicenow/glide");
var rule_checker_utils_js_1 = require("./rule-checker-utils.js");
var rule_fetcher_js_1 = require("./rule-fetcher.js");
var RuleChecker = /** @class */ (function () {
    function RuleChecker() {
    }
    RuleChecker.prototype.checkAllRulesAgainstMacroponent = function (macroponentId, isMaint) {
        var rules = isMaint === 'true'
            ? new rule_fetcher_js_1.RuleFetcher().getAsArray()
            : new rule_fetcher_js_1.RuleFetcher().getAsArray(ux_rules_engine_1.ASSISTANT_CORE_RULE_SET);
        var macroponent = (0, rule_checker_utils_js_1.getMacroponent)(macroponentId);
        var fetcher = (0, rule_checker_utils_js_1.getRuleEngineFetcher)();
        var engine = new ux_rules_engine_1.RulesEngine({
            rules: rules,
            loggers: (0, rule_checker_utils_js_1.getLoggers)(),
            scriptEvaluator: (0, rule_checker_utils_js_1.getScriptEvaluator)(),
            fetcher: fetcher
        });
        return engine.run({ macroponent: macroponent });
    };
    RuleChecker.prototype.checkAllRulesAgainstAppRoutes = function (appRoutes, isMaint, appConfigIdOrExtPtId, experienceId) {
        var rules = new rule_fetcher_js_1.RuleFetcher().getFilteredRulesForUserAndContext(isMaint === 'true', appConfigIdOrExtPtId);
        var fetcher = (0, rule_checker_utils_js_1.getRuleEngineFetcher)();
        var engine = new ux_rules_engine_1.RulesEngine({
            rules: Object.values(rules),
            loggers: (0, rule_checker_utils_js_1.getLoggers)(),
            scriptEvaluator: (0, rule_checker_utils_js_1.getScriptEvaluator)(),
            fetcher: fetcher
        });
        return Object.entries(appRoutes !== null && appRoutes !== void 0 ? appRoutes : {}).reduce(function (acc, _a) {
            var k = _a[0], v = _a[1];
            acc[k] = __assign(__assign({}, v), { screens: Object.entries(v.screens).reduce(function (acc, _a) {
                    var _b;
                    var k = _a[0], v = _a[1];
                    var macroponent = v.macroponent, rest = __rest(v, ["macroponent"]);
                    // TODO: check if batch event hydrater is more performant
                    // Right now, we are pulling event and cache it as we go
                    var ruleViolations = engine.run({ macroponent: macroponent });
                    var databrokerIds = glide_1.UxFrameworkScriptables.getEligibleDataResourceIds((macroponent === null || macroponent === void 0 ? void 0 : macroponent.sysId) || '', experienceId, v.screenTestValues || {}, v.macroponentConfig || {});
                    // eslint-disable-next-line sonarjs/no-unused-collection
                    var combineViolations = __spreadArray([], ruleViolations, true);
                    (_b = macroponent === null || macroponent === void 0 ? void 0 : macroponent.data) === null || _b === void 0 ? void 0 : _b.forEach(function (dataBroker) {
                        var _a;
                        if (!databrokerIds.includes(dataBroker.elementId) &&
                            ((_a = dataBroker === null || dataBroker === void 0 ? void 0 : dataBroker.definition) === null || _a === void 0 ? void 0 : _a.type) !== 'CONTROLLER') {
                            var earlyEvalNotification = (0, rule_checker_utils_js_1.createEarlyEvalViolationNotification)(dataBroker);
                            combineViolations.push(earlyEvalNotification);
                        }
                    });
                    acc[k] = __assign(__assign(__assign(__assign({}, rest), { ruleViolations: combineViolations }), ((macroponent === null || macroponent === void 0 ? void 0 : macroponent.formFactors) && {
                        formFactors: macroponent === null || macroponent === void 0 ? void 0 : macroponent.formFactors
                    })), ((macroponent === null || macroponent === void 0 ? void 0 : macroponent.sysId) && {
                        macroponentSysId: macroponent === null || macroponent === void 0 ? void 0 : macroponent.sysId
                    }));
                    return acc;
                }, {}) });
            return acc;
        }, {});
    };
    RuleChecker.prototype.checkAllRulesAgainstExperience = function (experienceId, isMaint) {
        var appConfigId = (0, rule_checker_utils_js_1.getAdminPanelIdFromExperienceId)(experienceId);
        var appRoutes = (0, rule_checker_utils_js_1.getExperienceOrPcMacroponents)(appConfigId, 'sys_ux_app_config');
        return this.checkAllRulesAgainstAppRoutes(appRoutes, isMaint, appConfigId, experienceId);
    };
    RuleChecker.prototype.checkAllRulesAgainstPc = function (extensionPointId, isMaint) {
        var appRoutes = (0, rule_checker_utils_js_1.getExperienceOrPcMacroponents)(extensionPointId, 'sys_ux_extension_point');
        return this.checkAllRulesAgainstAppRoutes(appRoutes, isMaint, extensionPointId, extensionPointId);
    };
    return RuleChecker;
}());
exports.RuleChecker = RuleChecker;
