"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exists;
/* eslint-disable */
/* global gs, request, response */
var glide_1 = require("@servicenow/glide");
function exists(request, response) {
    try {
        var metadataSysId = request.queryParams.metadata_sys_id;
        var metadataTable = request.queryParams.metadata_table;
        if (!metadataSysId || !metadataTable) {
            response.setStatus(400);
            response.setBody({ error: glide_1.gs.getMessage('[IDE] metadata_sys_id and metadata_table are required') });
            return;
        }
        var hasSourceArtifact = checkSourceArtifact(metadataSysId);
        var hasAppSourceFiles = checkAppSourceFiles(metadataSysId, metadataTable);
        response.setStatus(200);
        response.setBody({
            hasSourceArtifact: hasSourceArtifact,
            hasAppSourceFiles: hasAppSourceFiles
        });
    }
    catch (e) {
        var errorMsg = "[IDE] Failed to check source code existence: ".concat(e && e.message ? e.message : e);
        glide_1.gs.error(errorMsg);
        response.setStatus(500);
        response.setBody({ error: errorMsg });
    }
}
function checkSourceArtifact(metadataSysId) {
    var gr = new glide_1.GlideRecord('sn_glider_source_artifact_m2m');
    gr.addQuery('application_file', metadataSysId);
    gr.addNotNullQuery('source_artifact');
    gr.setLimit(1);
    gr.query();
    return gr.hasNext();
}
function checkAppSourceFiles(metadataSysId, metadataTable) {
    var metadataGr = new glide_1.GlideRecord(metadataTable);
    metadataGr.addQuery('sys_id', metadataSysId);
    metadataGr.setLimit(1);
    metadataGr.query();
    if (!metadataGr.next()) {
        return false;
    }
    var scopeId = metadataGr.getValue('sys_scope');
    if (!scopeId) {
        return false;
    }
    // Check for source files under the scoped app path (now-file:/<scopeId>/...)
    var fileIndexGr = new glide_1.GlideRecord('sn_glider_ide_file_index');
    fileIndexGr.addQuery('uri', 'STARTSWITH', "now-file:/".concat(scopeId, "/"));
    fileIndexGr.addNullQuery('dtime');
    fileIndexGr.setLimit(1);
    fileIndexGr.query();
    if (fileIndexGr.hasNext()) {
        return true;
    }
    // Check for source files under a monorepo path.
    // Monorepo URIs don't contain the scopeId — instead, a now.config.json file
    // in the file index links the monorepo to the scope via its scopeId field.
    return checkMonoRepoSourceFiles(scopeId);
}
function checkMonoRepoSourceFiles(scopeId) {
    var gr = new glide_1.GlideRecord('sn_glider_ide_file_index');
    gr.addQuery('uri', 'ENDSWITH', '/now.config.json');
    gr.addQuery('uri', 'DOES NOT CONTAIN', scopeId);
    gr.addNullQuery('dtime');
    gr.addNotNullQuery('content');
    gr.addNotNullQuery('checksum');
    gr.query();
    while (gr.next()) {
        try {
            // Monorepo now.config.json must be at least 3 levels deep (e.g. now-file:/foo/bar/now.config.json)
            var uri = gr.getValue('uri');
            var segments = uri.split('/').filter(Boolean);
            if (segments.length <= 3) {
                continue;
            }
            var contentRecord = gr.content.getRefRecord();
            var content = glide_1.gs.base64Decode(contentRecord.getValue('content') || '');
            var nowConfig = JSON.parse(content);
            if (nowConfig.scopeId && nowConfig.scopeId === scopeId) {
                return true;
            }
        }
        catch (_a) {
            // Skip entries with invalid content
        }
    }
    return false;
}
