"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = process;
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
var glide_1 = require("@servicenow/glide");
function process(request, response) {
    var sysIdsParam = request.queryParams.sys_ids;
    var scopeId = request.queryParams.scope_id;
    if (!sysIdsParam || !scopeId) {
        response.setStatus(400);
        return response.setError('Missing required query parameter: sys_ids (comma-separated list) or scope_id');
    }
    function fetchLatestUpdatedMetadata(sysIdsArray, applicationId) {
        var allRecords = [];
        // Query for each sys_id to find matching sys_update_xml records
        for (var i = 0; i < sysIdsArray.length; i++) {
            var sysId = sysIdsArray[i];
            var gr = new glide_1.GlideRecord('sys_update_xml');
            // The name field contains patterns like: sys_ws_operation_<sys_id>
            gr.addQuery('name', 'CONTAINS', sysId);
            gr.addNotNullQuery('update_set');
            // Optimize query with application filter if provided
            if (applicationId) {
                gr.addQuery('application', applicationId);
            }
            gr.orderByDesc('sys_updated_on');
            gr.setLimit(1);
            gr.query();
            // Collect all matching records
            if (gr.next()) {
                allRecords.push({
                    sys_id: gr.getValue('sys_id'),
                    sys_updated_on: new glide_1.GlideDateTime(gr.getValue('sys_updated_on')).getNumericValue(),
                    sys_updated_by: gr.getValue('sys_updated_by'),
                    sys_created_on: new glide_1.GlideDateTime(gr.getValue('sys_created_on')).getNumericValue(),
                    sys_scope: gr.getValue('application'),
                    sys_class_name: gr.getValue('sys_class_name'),
                    name: gr.getValue('name'),
                    target_name: gr.getValue('target_name')
                });
            }
        }
        // Sort by sys_updated_on descending to get the latest
        if (allRecords.length > 0) {
            allRecords.sort(function (a, b) { return b.sys_updated_on - a.sys_updated_on; });
            // Return the record with the highest sys_updated_on
            return allRecords[0];
        }
        return null;
    }
    try {
        // Convert to string in case it's an object
        var sysIdsString = String(sysIdsParam);
        var sysIdsArray = sysIdsString.split(',').map(function (id) { return id.trim(); });
        if (sysIdsArray.length === 0) {
            response.setStatus(400);
            return response.setError('sys_ids parameter must contain at least one sys_id');
        }
        var metadata = fetchLatestUpdatedMetadata(sysIdsArray, scopeId);
        if (metadata) {
            response.setStatus(200);
            response.setBody(metadata);
            return;
        }
        // Return an empty response if no metadata found
        response.setStatus(200);
        response.setBody({});
    }
    catch (e) {
        glide_1.gs.error("[IDE][Sync] Error fetching latest updated metadata:".concat(e && e.message ? e.message : e));
        response.setStatus(500);
        response.setError("".concat(e && e.message ? e.message : e));
    }
}
