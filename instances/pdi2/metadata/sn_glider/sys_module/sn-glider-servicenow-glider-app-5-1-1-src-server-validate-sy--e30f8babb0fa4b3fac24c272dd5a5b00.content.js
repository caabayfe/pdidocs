"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = process;
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
var glide_1 = require("@servicenow/glide");
function process(request, response) {
    try {
        var appId = request.pathParams.app_id;
        // Validate input
        if (!appId) {
            var errMsg = glide_1.gs.getMessage('[IDE][Get Applications] app_id cannot be null or empty');
            glide_1.gs.error(errMsg);
            response.setStatus(400);
            response.setBody({
                error: errMsg
            });
            return;
        }
        var appGr = new glide_1.GlideRecord('sys_app');
        var isFluentApp = false;
        var isFirstPartyApp = false;
        // Check if record exists and determine if it's a Fluent App
        if (appGr.get(appId)) {
            var hasPackageJson = !!appGr.getValue('package_json');
            var ideCreated = appGr.getValue('ide_created') === 'IDE';
            isFluentApp = hasPackageJson || ideCreated;
            isFirstPartyApp = true;
        }
        response.setStatus(200);
        response.setBody({
            isFluentApp: isFluentApp,
            isFirstParty: isFirstPartyApp
        });
    }
    catch (error) {
        var errorMsg = "[IDE][Get Applications] Unexpected error: ".concat(error && error.message ? error.message : error);
        glide_1.gs.error(errorMsg);
        response.setStatus(500);
        response.setBody({
            error: errorMsg
        });
    }
}
