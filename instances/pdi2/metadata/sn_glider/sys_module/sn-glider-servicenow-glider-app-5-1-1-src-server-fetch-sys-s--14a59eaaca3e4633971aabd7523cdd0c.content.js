"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = process;
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
var glide_1 = require("@servicenow/glide");
var sn_glider_1 = require("@servicenow/glide/sn_glider");
function process(request, response) {
    try {
        var sysScopeQuery = glide_1.gs.getProperty('sn_glider.config_app.sys_scope_query', 'sys_class_name!=sys_app^private=false^ORprivateISEMPTY');
        var sysScopedApplications = new glide_1.GlideRecord('sys_scope');
        sysScopedApplications.addEncodedQuery(sysScopeQuery, false);
        sysScopedApplications.query();
        var ideBuildSupport = new sn_glider_1.IDEBuildSupport();
        var apps = [];
        while (sysScopedApplications.next()) {
            var recordData = {};
            for (var prop in sysScopedApplications) {
                if (sysScopedApplications.hasOwnProperty(prop)) {
                    recordData[prop] = sysScopedApplications.getValue(prop);
                }
            }
            var sourceFileCount = ideBuildSupport.getAppSourceFileCount(sysScopedApplications.getUniqueValue(), []);
            recordData.sourceFileCount = sourceFileCount;
            apps.push(recordData);
        }
        response.setBody(apps);
        response.setStatus(200);
        return response;
    }
    catch (e) {
        var errorMessage = '[IDE][Configuration] Failed to retrieve Sys Scoped Applications';
        glide_1.gs.error(errorMessage, e);
        response.setStatus(500);
        return response.setError(e);
    }
}
