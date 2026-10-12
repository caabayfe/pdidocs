
      "use strict";
exports.__esModule = true;
exports.ControllerPresetFetcher = void 0;
var glide_1 = require("@servicenow/glide");
var safe_json_parse_js_1 = require("../utils/safe-json-parse.js");
var ControllerPresetFetcher = /** @class */ (function () {
    function ControllerPresetFetcher() {
    }
    ControllerPresetFetcher.prototype.getAll = function () {
        var grPreset = new glide_1.GlideRecord('sys_ux_controller_preset');
        grPreset.query();
        var presets = {};
        while (grPreset.next()) {
            presets[grPreset.getUniqueValue()] = {
                sysId: grPreset.getUniqueValue(),
                eventHandlers: (0, safe_json_parse_js_1.safeJSONparse)(grPreset.getValue('event_handlers')),
                properties: (0, safe_json_parse_js_1.safeJSONparse)(grPreset.getValue('properties')),
                name: grPreset.getValue('name'),
                controller: grPreset.getValue('controller'),
                connectedController: grPreset.getValue('connected_controller'),
                sysScope: null
            };
        }
        return presets;
    };
    return ControllerPresetFetcher;
}());
exports.ControllerPresetFetcher = ControllerPresetFetcher;
