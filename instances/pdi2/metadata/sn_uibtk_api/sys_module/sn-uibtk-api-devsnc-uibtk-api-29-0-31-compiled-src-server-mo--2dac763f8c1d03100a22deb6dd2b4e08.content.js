
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
exports.createEarlyEvalViolationNotification = exports.getRuleEngineFetcher = exports.getLoggers = exports.getScriptEvaluator = exports.getExperienceOrPcMacroponents = exports.filterAppRoutesForSubpage = exports.buildMacroponentMap = exports.hydrateAppRouteAndScreenFromMacroponent = exports.buildChildScreens = exports.hydrateViolationDismissRecords = exports.getMacroponent = exports.getAdminPanelIdFromExperienceId = void 0;
var glide_1 = require("@servicenow/glide");
var client_script_fetcher_js_1 = require("../clientScripts/client-script-fetcher.js");
var event_fetcher_js_1 = require("../events/event-fetcher.js");
var component_preset_fetcher_js_1 = require("../presets/component-preset-fetcher.js");
var controller_preset_fetcher_js_1 = require("../presets/controller-preset-fetcher.js");
var safe_json_parse_js_1 = require("../utils/safe-json-parse.js");
var constants_js_1 = require("./constants.js");
var rule_dismiss_fetcher_utils_js_1 = require("./rule-dismiss-fetcher-utils.js");
var rule_fetcher_js_1 = require("./rule-fetcher.js");
var appConfigTable = 'sys_ux_app_config';
var pcTable = 'sys_ux_extension_point';
var getAdminPanelIdFromExperienceId = function (experienceId) {
    var grUxPageReg = new glide_1.GlideRecord('sys_ux_page_registry');
    if (grUxPageReg.get(experienceId)) {
        return grUxPageReg.getValue('admin_panel');
    }
    else {
        glide_1.gs.error("RuleChecker -> getAdminPanelIdFromExperienceId() provided experienceId that does not exist");
        return '';
    }
};
exports.getAdminPanelIdFromExperienceId = getAdminPanelIdFromExperienceId;
var getMacroponent = function (macroponentId) {
    var grUxMcp = new glide_1.GlideRecord('sys_ux_macroponent');
    if (grUxMcp.get(macroponentId)) {
        return convertMacroponentGlideRecordToObject(grUxMcp);
    }
    else {
        glide_1.gs.error("RuleChecker -> getMacroponent() fetched invalid macroponent id, ".concat(macroponentId));
        return undefined;
    }
};
exports.getMacroponent = getMacroponent;
var buildAppRoutesBase = function (appRoutes, screenTypeIdToAppRouteIds, _a) {
    var sysId = _a.sysId, table = _a.table;
    var appRouteQueryId = sysId;
    var appRouteQueryField = table === appConfigTable ? 'app_config' : 'extension_point';
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: Fetching sys_ux_app_route w/ ".concat(appRouteQueryField, " id ").concat(appRouteQueryId));
    var grUxAppRoute = new glide_1.GlideRecord('sys_ux_app_route');
    grUxAppRoute.addQuery(appRouteQueryField, '=', appRouteQueryId);
    grUxAppRoute.query();
    while (grUxAppRoute.next()) {
        var appRouteId = grUxAppRoute.getUniqueValue();
        var screenTypeId = grUxAppRoute.getValue('screen_type');
        if (appRouteId && screenTypeId) {
            screenTypeIdToAppRouteIds[screenTypeId] = Array.isArray(screenTypeIdToAppRouteIds[screenTypeId])
                ? __spreadArray(__spreadArray([], screenTypeIdToAppRouteIds[screenTypeId], true), [appRouteId], false) : [appRouteId];
            appRoutes[appRouteId] = {
                appRouteName: grUxAppRoute.getValue('name'),
                screenTypeId: screenTypeId,
                screens: {},
                parentMCP: grUxAppRoute.getValue('parent_macroponent'),
                parentMCPelement: grUxAppRoute.getValue('parent_macroponent_composition_element_id'),
                isChildRoute: !!grUxAppRoute.getValue('parent_macroponent_composition_element_id'),
                routeType: grUxAppRoute.getValue('route_type')
            };
        }
    }
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: appRoutes object after app_route fetch ".concat(JSON.stringify(appRoutes, null, 4)));
};
var hydrateScreenTypeNames = function (appRoutes, screenTypeIdToAppRouteIds) {
    var _a;
    var sysUxScreenTypeIds = Object.keys(screenTypeIdToAppRouteIds).join(',');
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: Fetching sys_ux_screen_type ids ".concat(sysUxScreenTypeIds));
    var grUxScreenType = new glide_1.GlideRecord('sys_ux_screen_type');
    grUxScreenType.addQuery('sys_id', 'IN', sysUxScreenTypeIds);
    grUxScreenType.query();
    while (grUxScreenType.next()) {
        ((_a = screenTypeIdToAppRouteIds[grUxScreenType.getUniqueValue()]) !== null && _a !== void 0 ? _a : []).forEach(function (appRouteId) {
            appRoutes[appRouteId] = __assign(__assign({}, appRoutes[appRouteId]), { screenTypeName: grUxScreenType.getValue('name') });
        });
    }
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: appRoutes object after sys_ux_screen_type fetch ".concat(JSON.stringify(appRoutes, null, 4)));
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: Fetching sys_ux_screen with screen_type ids ".concat(sysUxScreenTypeIds));
};
var hydrateScreenNames = function (appRoutes, screenTypeIdToAppRouteIds, macroponentMapper) {
    var _a;
    var sysUxScreenTypeIds = Object.keys(screenTypeIdToAppRouteIds).join(',');
    var grUxScreen = new glide_1.GlideRecord('sys_ux_screen');
    grUxScreen.addQuery('screen_type', 'IN', sysUxScreenTypeIds);
    grUxScreen.query();
    var _loop_1 = function () {
        var sysUxScreenId = grUxScreen.getUniqueValue();
        var sysUxScreenTypeId = grUxScreen.getValue('screen_type');
        var macroponentId = grUxScreen.getValue('macroponent');
        var macroponentConfig = (0, safe_json_parse_js_1.safeJSONparse)(grUxScreen.getValue('macroponent_config'));
        var screenTestValues = {};
        var grUxScreenTestValues = new glide_1.GlideRecord('sys_uib_screen_test_values');
        if (grUxScreenTestValues.get('screen', sysUxScreenId)) {
            screenTestValues = (0, safe_json_parse_js_1.safeJSONparse)(grUxScreenTestValues.getValue('macroponent_config'));
        }
        if (!macroponentMapper[macroponentId]) {
            macroponentMapper[macroponentId] = [];
        }
        ((_a = screenTypeIdToAppRouteIds[sysUxScreenTypeId]) !== null && _a !== void 0 ? _a : []).forEach(function (sysUxAppRouteId) {
            // eslint-disable-next-line @servicenow/seismic/no-dotwalk-on-objects
            macroponentMapper[macroponentId].push({
                sysUxScreenId: sysUxScreenId,
                sysUxAppRouteId: sysUxAppRouteId
            });
            // eslint-disable-next-line @servicenow/seismic/no-dotwalk-on-objects
            appRoutes[sysUxAppRouteId].screens[sysUxScreenId] = {
                name: grUxScreen.getValue('name'),
                macroponentConfig: macroponentConfig,
                screenTestValues: screenTestValues
            };
        });
    };
    while (grUxScreen.next()) {
        _loop_1();
    }
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: appRoutes object after sys_ux_screen fetch ".concat(JSON.stringify(appRoutes, null, 4)));
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: macroponentMapper object after sys_ux_screen fetch ".concat(JSON.stringify(macroponentMapper, null, 4)));
};
var hydrateScreenMcpAndParentScreen = function (appRoutes, macroponentMapper) {
    var _a;
    var macroponentIds = Object.keys(macroponentMapper).join(',');
    glide_1.gs.debug("RuleChecker->hydrateScreenMcpAndParentScreen: Fetching sys_ux_macroponent ids ".concat(macroponentIds));
    var grUxMcp = new glide_1.GlideRecord('sys_ux_macroponent');
    grUxMcp.addQuery('sys_id', 'IN', macroponentIds);
    grUxMcp.query();
    while (grUxMcp.next()) {
        var mapping = (_a = macroponentMapper[grUxMcp.getUniqueValue()]) !== null && _a !== void 0 ? _a : [];
        mapping.forEach(function (m) {
            var sysUxScreenId = m.sysUxScreenId, sysUxAppRouteId = m.sysUxAppRouteId;
            var macroponent = convertMacroponentGlideRecordToObject(grUxMcp);
            // eslint-disable-next-line @servicenow/seismic/no-dotwalk-on-objects
            appRoutes[sysUxAppRouteId].screens[sysUxScreenId].macroponent = macroponent;
            Object.entries(appRoutes).forEach(function (_a) {
                var appRouteSysId = _a[0], appRoute = _a[1];
                if (appRoute.parentMCP === macroponent.sysId) {
                    appRoutes[appRouteSysId].parentScreen = sysUxScreenId;
                }
            });
        });
    }
    Object.entries(appRoutes).forEach(function (_a) {
        var appRouteSysId = _a[0], appRoute = _a[1];
        if (appRoute.isChildRoute &&
            appRoute.parentMCP &&
            appRoute.parentMCPelement &&
            !appRoute.parentScreen) {
            // delete incomplete child routes due to orphaning/bad data
            delete appRoutes[appRouteSysId];
        }
    });
    glide_1.gs.debug("RuleChecker->getExperienceMacroponents: appRoutes object successfully built");
};
var hydrateViolationDismissRecords = function (appRoutes, macroponentMapper) {
    var _a;
    var macroponentIds = Object.keys(macroponentMapper).join(',');
    glide_1.gs.debug("RuleChecker->hydrateViolationDismissRecords: Fetching sys_ux_macroponent ids ".concat(macroponentIds));
    var grUxDismiss = new glide_1.GlideRecord('sys_ux_diagnostic_rule_dismiss');
    grUxDismiss.addQuery('target_id', 'IN', macroponentIds);
    grUxDismiss.query();
    while (grUxDismiss.next()) {
        var mapping = (_a = macroponentMapper[grUxDismiss.getValue('target_id')]) !== null && _a !== void 0 ? _a : [];
        mapping.forEach(function (m) {
            var sysUxScreenId = m.sysUxScreenId, sysUxAppRouteId = m.sysUxAppRouteId;
            var ruleDismiss = (0, rule_dismiss_fetcher_utils_js_1.convertGlideRecordRuleDismissToObject)(grUxDismiss);
            // eslint-disable-next-line @servicenow/seismic/no-dotwalk-on-objects
            appRoutes[sysUxAppRouteId].screens[sysUxScreenId].ruleDismiss = ruleDismiss;
        });
    }
};
exports.hydrateViolationDismissRecords = hydrateViolationDismissRecords;
var buildChildScreens = function (appRoutes, macroponentMapper, childMacroponentMapper, searchedMcps) {
    Object.keys(macroponentMapper).forEach(function (mcpSysId) {
        var _a, _b;
        var _c, _d, _e, _f;
        if (!(searchedMcps !== null && searchedMcps !== void 0 ? searchedMcps : []).includes(mcpSysId)) {
            var grUxScreen = new glide_1.GlideRecord('sys_ux_screen');
            grUxScreen.addQuery('parent_macroponent', '=', mcpSysId);
            grUxScreen.query();
            while (grUxScreen.next()) {
                var screenSysId = grUxScreen.getUniqueValue();
                var screenName = grUxScreen.getValue('name');
                var screenType = grUxScreen.getValue('screen_type');
                var pageDef = grUxScreen.getValue('macroponent');
                var macroponentConfig = (0, safe_json_parse_js_1.safeJSONparse)(grUxScreen.getValue('macroponent_config'));
                var grUxScreenType = new glide_1.GlideRecord('sys_ux_screen_type');
                if (grUxScreenType.get(screenType)) {
                    var screenTypeName = grUxScreenType.getValue('name');
                    var screenTypeId = grUxScreenType.getUniqueValue();
                    var grUxAppRoute = new glide_1.GlideRecord('sys_ux_app_route');
                    grUxAppRoute.addQuery('parent_macroponent', '=', mcpSysId);
                    grUxAppRoute.addQuery('screen_type', '=', screenType);
                    grUxAppRoute.query();
                    while (grUxAppRoute.next()) {
                        var appRouteSysId = grUxAppRoute.getUniqueValue();
                        var appRouteName = grUxAppRoute.getValue('name');
                        var appRouteType = grUxAppRoute.getValue('route_type');
                        var parentMCP = grUxAppRoute.getValue('parent_macroponent');
                        var parentMCPelement = grUxAppRoute.getValue('parent_macroponent_composition_element_id');
                        var grUxParentScreen = new glide_1.GlideRecord('sys_ux_screen');
                        grUxParentScreen.addQuery('macroponent', '=', parentMCP);
                        grUxParentScreen.query();
                        while (grUxParentScreen.next()) {
                            var parentScreenSysId = grUxParentScreen.getUniqueValue();
                            var grUxMcp = new glide_1.GlideRecord('sys_ux_macroponent');
                            if (grUxMcp.get(pageDef)) {
                                appRoutes[appRouteSysId] = __assign(__assign({}, ((_c = appRoutes[appRouteSysId]) !== null && _c !== void 0 ? _c : {})), { screens: __assign(__assign({}, ((_f = (_e = ((_d = appRoutes[appRouteSysId]) !== null && _d !== void 0 ? _d : {})) === null || _e === void 0 ? void 0 : _e.screens) !== null && _f !== void 0 ? _f : [])), (_a = {}, _a[screenSysId] = {
                                        name: screenName,
                                        macroponent: convertMacroponentGlideRecordToObject(grUxMcp),
                                        macroponentConfig: macroponentConfig
                                    }, _a)), parentMCP: parentMCP, parentMCPelement: parentMCPelement, screenTypeName: screenTypeName, screenTypeId: screenTypeId, appRouteName: appRouteName, parentScreen: parentScreenSysId, isChildRoute: true, routeType: appRouteType });
                                var updatedSearchedMcps = __spreadArray(__spreadArray([], (searchedMcps !== null && searchedMcps !== void 0 ? searchedMcps : []), true), [mcpSysId], false);
                                var newMcpMapEntry = {
                                    sysUxScreenId: screenSysId,
                                    sysUxAppRouteId: appRouteSysId
                                };
                                if (pageDef in childMacroponentMapper) {
                                    childMacroponentMapper[pageDef] = __spreadArray(__spreadArray([], childMacroponentMapper[pageDef], true), [
                                        newMcpMapEntry
                                    ], false);
                                }
                                else {
                                    childMacroponentMapper[pageDef] = [newMcpMapEntry];
                                }
                                (0, exports.buildChildScreens)(appRoutes, (_b = {},
                                    _b[pageDef] = [newMcpMapEntry],
                                    _b), childMacroponentMapper, updatedSearchedMcps);
                            }
                        }
                    }
                }
            }
        }
    });
};
exports.buildChildScreens = buildChildScreens;
var hydrateAppRouteAndScreenFromMacroponent = function (macroponentSysId) {
    var _a, _b, _c;
    var grUxAppRoute = new glide_1.GlideRecord('sys_ux_app_route');
    grUxAppRoute.addQuery('parent_macroponent', '=', macroponentSysId);
    grUxAppRoute.query();
    var appRouteInfo = {
        sysId: '',
        appRouteName: '',
        parentMCP: '',
        parentMCPelement: '',
        screenType: ''
    };
    if (grUxAppRoute.get('parent_macroponent', macroponentSysId)) {
        appRouteInfo.sysId = grUxAppRoute.getUniqueValue();
        appRouteInfo.appRouteName = grUxAppRoute.getValue('name');
        appRouteInfo.parentMCP = grUxAppRoute.getValue('parent_macroponent');
        appRouteInfo.parentMCPelement = grUxAppRoute.getValue('parent_macroponent_composition_element_id');
        appRouteInfo.screenType = grUxAppRoute.getValue('screen_type');
    }
    var grUxScreen = new glide_1.GlideRecord('sys_ux_screen');
    grUxScreen.addQuery('macroponent', '=', macroponentSysId);
    grUxScreen.query();
    var screenInfo = {
        sysId: '',
        name: ''
    };
    if (grUxScreen.get('macroponent', macroponentSysId)) {
        screenInfo.sysId = grUxAppRoute.getUniqueValue();
        screenInfo.name = grUxAppRoute.getValue('name');
    }
    var grUxScreenType = new glide_1.GlideRecord('sys_ux_screen_type');
    grUxScreenType.addQuery('sys_id', '=', appRouteInfo.screenType);
    grUxScreenType.query();
    var screenTypeInfo = {
        name: ''
    };
    if (grUxScreenType.get(appRouteInfo.screenType)) {
        screenTypeInfo.name = grUxScreenType.getValue('name');
    }
    var grUxParentScreen = new glide_1.GlideRecord('sys_ux_screen');
    grUxParentScreen.addQuery('macroponent', '=', appRouteInfo.parentMCP);
    grUxParentScreen.query();
    var parentScreen = '';
    if (grUxParentScreen.get('macroponent', appRouteInfo.parentMCP)) {
        parentScreen = grUxParentScreen.getUniqueValue();
    }
    var grUxMcp = new glide_1.GlideRecord('sys_ux_macroponent');
    grUxMcp.addQuery('sys_id', '=', macroponentSysId);
    grUxMcp.query();
    if (grUxMcp.get(macroponentSysId)) {
        var appRoute = (_a = {},
            _a[appRouteInfo.sysId] = {
                screens: (_b = {},
                    _b[screenInfo.sysId] = {
                        name: screenInfo.name,
                        macroponent: convertMacroponentGlideRecordToObject(grUxMcp)
                    },
                    _b),
                parentMCP: appRouteInfo.parentMCP,
                parentMCPelement: appRouteInfo.parentMCPelement,
                screenTypeName: screenTypeInfo.name,
                screenTypeId: appRouteInfo.screenType,
                appRouteName: appRouteInfo.appRouteName,
                parentScreen: parentScreen
            },
            _a);
        return {
            appRoute: appRoute,
            macroponentMap: (_c = {},
                _c[macroponentSysId] = [
                    {
                        sysUxScreenId: screenInfo.sysId,
                        sysUxAppRouteId: appRouteInfo.sysId
                    }
                ],
                _c)
        };
    }
    return {
        appRoute: {},
        macroponentMap: {}
    };
};
exports.hydrateAppRouteAndScreenFromMacroponent = hydrateAppRouteAndScreenFromMacroponent;
var buildMacroponentMap = function (appRoutes) {
    return Object.entries(appRoutes !== null && appRoutes !== void 0 ? appRoutes : {}).reduce(function (_map, _a) {
        var routeSysId = _a[0], appRoute = _a[1];
        Object.entries(appRoute === null || appRoute === void 0 ? void 0 : appRoute.screens).forEach(function (_a) {
            var _b;
            var _c;
            var screenSysId = _a[0], screen = _a[1];
            if ((_c = screen === null || screen === void 0 ? void 0 : screen.macroponent) === null || _c === void 0 ? void 0 : _c.sysId) {
                Object.assign(_map, (_b = {},
                    _b[screen.macroponent.sysId] = [
                        { sysUxScreenId: screenSysId, sysUxAppRouteId: routeSysId }
                    ],
                    _b));
            }
        });
        return _map;
    }, {});
};
exports.buildMacroponentMap = buildMacroponentMap;
var filterAppRoutesForSubpage = function (approutes, parentScreenId, parentElementId) {
    return Object.entries(approutes !== null && approutes !== void 0 ? approutes : {}).reduce(function (_directSpRoutes, _a) {
        var _b;
        var routeSysId = _a[0], appRoute = _a[1];
        if ((appRoute === null || appRoute === void 0 ? void 0 : appRoute.parentScreen) === parentScreenId &&
            appRoute.parentMCPelement === parentElementId) {
            Object.assign(_directSpRoutes, (_b = {},
                _b[routeSysId] = __assign(__assign({}, appRoute), { isChildRoute: false }),
                _b));
        }
        return _directSpRoutes;
    }, {});
};
exports.filterAppRoutesForSubpage = filterAppRoutesForSubpage;
var getExperienceOrPcMacroponents = function (sysId, table) {
    glide_1.gs.debug("RuleChecker->getExperienceOrPcMacroponents: Fetching ".concat(table, " id ").concat(sysId));
    var appRoutes = {};
    var screenTypeIdToAppRouteIds = {};
    buildAppRoutesBase(appRoutes, screenTypeIdToAppRouteIds, {
        sysId: sysId,
        table: table
    });
    hydrateScreenTypeNames(appRoutes, screenTypeIdToAppRouteIds);
    var macroponentMapper = {};
    hydrateScreenNames(appRoutes, screenTypeIdToAppRouteIds, macroponentMapper);
    hydrateScreenMcpAndParentScreen(appRoutes, macroponentMapper);
    var childMacroponentMapper = {};
    if (table === 'sys_ux_extension_point') {
        (0, exports.buildChildScreens)(appRoutes, macroponentMapper, childMacroponentMapper);
    }
    var totalMcpMapper = __assign(__assign({}, macroponentMapper), childMacroponentMapper);
    (0, exports.hydrateViolationDismissRecords)(appRoutes, totalMcpMapper);
    return appRoutes;
};
exports.getExperienceOrPcMacroponents = getExperienceOrPcMacroponents;
// Takes in the iife script, an API, and returns null on success, or an error if it happened.
var getScriptEvaluator = function () { return function (script, api) {
    var sys_id = api.rule.sys_id;
    var fetcher = new rule_fetcher_js_1.RuleFetcher();
    var grUxMcpRule = fetcher.getGlideRecordRule(sys_id);
    if (grUxMcpRule) {
        // Adding in error catching because GlideScopeEvaluator seems
        // to swallow errors and continue.
        var wrappedIifeScript = "".concat('' + 'try {' + '(').concat(script, ")(api);") +
            "} catch(e) {" +
            "caughtError = e;" +
            "}";
        grUxMcpRule.setValue('test_script', wrappedIifeScript);
        var evaluator = new glide_1.GlideScopedEvaluator();
        evaluator.putVariable('api', api);
        evaluator.putVariable('caughtError', null);
        evaluator.putVariable('gs', null);
        evaluator.evaluateScript(grUxMcpRule, 'test_script');
        return evaluator.getVariable('caughtError');
    }
    else {
        glide_1.gs.error("RuleChecker -> getScriptEvaluator() tried to fetch a rule for execution, that unexpectedly did not return, id: ".concat(sys_id, ". Skipping rule."));
        return null;
    }
}; };
exports.getScriptEvaluator = getScriptEvaluator;
var getLoggers = function () { return ({
    info: function (x) { return glide_1.gs.info(x); },
    debug: function (x) { return glide_1.gs.debug(x); },
    warn: function (x) { return glide_1.gs.warn(x); },
    error: function (x) { return glide_1.gs.error(x); }
}); };
exports.getLoggers = getLoggers;
var convertMacroponentGlideRecordToObject = function (grUxMcp) {
    var composition = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('composition'));
    var layout = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('layout'));
    var data = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('data'));
    var props = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('props'));
    var internalEventMappings = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('internal_event_mappings'));
    var stateProperties = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('state_properties'));
    var root_component = grUxMcp.getValue('root_component');
    var root_component_definition = grUxMcp.getValue('root_component_definition');
    var root_component_config = grUxMcp.getValue('root_component_config');
    var sys_id = grUxMcp.getUniqueValue();
    var name = grUxMcp.getValue('name');
    var grExtends = grUxMcp.getValue('extends');
    var category = grUxMcp.getValue('category');
    var associated_types = grUxMcp.getValue('associated_types');
    var dispatched_events = grUxMcp.getValue('dispatched_events');
    var handled_events = grUxMcp.getValue('handled_events');
    var formFactors = (0, safe_json_parse_js_1.safeJSONparse)(grUxMcp.getValue('form_factors'));
    return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ rootComponent: root_component !== null && root_component !== void 0 ? root_component : null, rootComponentDefinition: root_component_definition !== null && root_component_definition !== void 0 ? root_component_definition : null, rootComponentConfig: root_component_config !== null && root_component_config !== void 0 ? root_component_config : null, sysId: sys_id, name: name, category: category }, (layout ? { layout: layout } : {})), (data ? { data: data } : {})), (props ? { props: props } : {})), (composition ? { composition: composition } : {})), (internalEventMappings ? { internalEventMappings: internalEventMappings } : {})), (stateProperties ? { stateProperties: stateProperties } : {})), (grExtends ? { "extends": grExtends } : {})), (associated_types ? { associated_types: associated_types } : {})), (dispatched_events ? { dispatchedEvents: dispatched_events } : {})), (handled_events ? { handledEvents: handled_events } : {})), (formFactors ? { formFactors: formFactors } : {})), { sysScope: null });
};
var getRuleEngineFetcher = function () {
    var componentPresetFetcher = new component_preset_fetcher_js_1.ComponentPresetFetcher();
    var controllerPresetFetcher = new controller_preset_fetcher_js_1.ControllerPresetFetcher();
    var eventFetcher = new event_fetcher_js_1.EventFetcher();
    var clientScriptFetcher = new client_script_fetcher_js_1.ClientScriptFetcher();
    var componentPresets = componentPresetFetcher.getAll();
    var controllerPesets = controllerPresetFetcher.getAll();
    return {
        GetComponentPresetById: function (id) { var _a; return (_a = componentPresets[id]) !== null && _a !== void 0 ? _a : null; },
        GetControllerPresetById: function (id) { var _a; return (_a = controllerPesets[id]) !== null && _a !== void 0 ? _a : null; },
        GetEventDefinitionById: function (id) { var _a; return (_a = eventFetcher.GetEventById(id)) !== null && _a !== void 0 ? _a : null; },
        GetClientScriptById: function (id) { var _a; return (_a = clientScriptFetcher.GetClientScriptById(id)) !== null && _a !== void 0 ? _a : null; },
        GetAllClientScripts: function (id) { var _a; return (_a = clientScriptFetcher.GetClientScriptsByMcpSysId(id)) !== null && _a !== void 0 ? _a : null; }
    };
};
exports.getRuleEngineFetcher = getRuleEngineFetcher;
var createEarlyEvalViolationNotification = function (dataBroker) { return ({
    elementId: dataBroker.elementId,
    elementLabel: dataBroker.elementLabel,
    level: constants_js_1.EARLY_EVAL_RULE_LEVEL,
    message: constants_js_1.DESCRIPTION_FOR_EARLY_EVAL_RULE,
    notificationText: constants_js_1.NOTIFICATION_TEXT_FOR_EARLY_EVAL_RULE,
    ruleSysId: constants_js_1.EARLY_EVAL_RULE_SYS_ID,
    sectionType: 'data',
    category: constants_js_1.IMPROVING_PERFORMANCE_CATEGORY,
    target: []
}); };
exports.createEarlyEvalViolationNotification = createEarlyEvalViolationNotification;
