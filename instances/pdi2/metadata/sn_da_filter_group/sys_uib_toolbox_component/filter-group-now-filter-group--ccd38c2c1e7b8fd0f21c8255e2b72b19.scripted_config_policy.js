
	// UI Policy for now-filter-group component
	function policy(args) {
		"use strict";
var policy_export_var = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/scripted-policy/index.js
  var scripted_policy_exports = {};
  __export(scripted_policy_exports, {
    applyPolicies: () => applyPolicies
  });

  // src/filter-group/constants.js
  var LAYOUT_HORIZONTAL = "horizontal";

  // src/scripted-policy/index.js
  function updateVisibility({ api, trigger }, prop, callback, dependencies) {
    if (!trigger || dependencies.includes(trigger)) {
      api.updateVisibility(prop, callback());
    }
  }
  function updateToDefaultValue({ api, trigger }, prop, condition, defaultValue, dependencies) {
    if ((!trigger || dependencies.includes(trigger)) && condition()) {
      api.updateValue(prop, defaultValue);
    }
  }
  function applyPolicies(invokerProps) {
    const { api, properties } = invokerProps;
    const { showLabel, layout, filterMaxWidth, showBorder, showApply, showClear, showReset, showSelectedValuesInPill } = properties;
    updateVisibility(invokerProps, "label", () => showLabel, ["showLabel"]);
    updateVisibility(invokerProps, "bare", () => !showBorder, ["showBorder"]);
    updateToDefaultValue(invokerProps, "bare", () => showBorder, false, ["showBorder"]);
    updateVisibility(invokerProps, "showRoundCorners", () => showBorder && !showSelectedValuesInPill, ["showBorder", "showSelectedValuesInPill"]);
    updateToDefaultValue(invokerProps, "showRoundCorners", () => !(showBorder && !showSelectedValuesInPill), false, ["showBorder", "showSelectedValuesInPill"]);
    updateVisibility(invokerProps, "combineActions", () => showClear && showReset, ["showClear", "showReset"]);
    updateToDefaultValue(invokerProps, "combineActions", () => !(showClear && showReset), false, ["showClear", "showReset"]);
    updateVisibility(invokerProps, "showSeparator", () => showApply || showClear || showReset, ["showApply", "showClear", "showReset"]);
    updateToDefaultValue(invokerProps, "showSeparator", () => !(showApply || showClear || showReset), true, ["showApply", "showClear", "showReset"]);
    updateVisibility(invokerProps, "filterMaxWidth", () => layout === LAYOUT_HORIZONTAL, ["layout"]);
    filterMaxWidth < 100 && api.updateValue("filterMaxWidth", 300);
  }
  return __toCommonJS(scripted_policy_exports);
})();

		policy_export_var.applyPolicies(args);
	}
	
