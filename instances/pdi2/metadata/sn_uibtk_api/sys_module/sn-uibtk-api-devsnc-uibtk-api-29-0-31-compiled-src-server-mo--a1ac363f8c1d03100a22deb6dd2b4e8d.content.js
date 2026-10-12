
      "use strict";
exports.__esModule = true;
exports.ComponentPresetFetcher = void 0;
var glide_1 = require("@servicenow/glide");
var safe_json_parse_js_1 = require("../utils/safe-json-parse.js");
var ComponentPresetFetcher = /** @class */ (function () {
    function ComponentPresetFetcher() {
    }
    ComponentPresetFetcher.prototype.getAll = function () {
        var grPreset = new glide_1.GlideRecord('sys_ux_component_preset');
        grPreset.query();
        var presets = {};
        while (grPreset.next()) {
            presets[grPreset.getUniqueValue()] = {
                sysId: grPreset.getUniqueValue(),
                name: grPreset.getValue('name'),
                controller: grPreset.getValue('controller'),
                controllerDependencies: (0, safe_json_parse_js_1.safeJSONparse)(grPreset.getValue('controller_dependencies')),
                isRepeater: grPreset.getValue('is_repeater') === '1',
                isRepeatedElement: grPreset.getValue('is_repeated_element') === '1',
                eventHandlers: (0, safe_json_parse_js_1.safeJSONparse)(grPreset.getValue('event_handlers')),
                properties: (0, safe_json_parse_js_1.safeJSONparse)(grPreset.getValue('properties')),
                sysScope: null
            };
        }
        return presets;
    };
    return ComponentPresetFetcher;
}());
exports.ComponentPresetFetcher = ComponentPresetFetcher;
