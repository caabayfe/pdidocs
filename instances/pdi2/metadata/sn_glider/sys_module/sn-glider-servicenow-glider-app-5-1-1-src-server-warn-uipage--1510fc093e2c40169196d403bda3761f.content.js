"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRule = executeRule;
var glide_1 = require("@servicenow/glide");
function executeRule(current, previous) {
    var appFileSysId = current.getUniqueValue();
    var customizedMetadataGr = new glide_1.GlideRecord('sn_glider_source_artifact_m2m');
    customizedMetadataGr.addQuery('application_file', appFileSysId);
    customizedMetadataGr.query();
    if (customizedMetadataGr.next()) {
        glide_1.gs.addInfoMessage(glide_1.gs.getMessage('This application file has been customized with source code. Please see this file in Servicenow Studio to learn more.'));
    }
}
