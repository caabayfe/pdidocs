
      "use strict";
exports.__esModule = true;
exports.ClientScriptFetcher = void 0;
var glide_1 = require("@servicenow/glide");
var ClientScriptFetcher = /** @class */ (function () {
    function ClientScriptFetcher() {
        this.clientScriptLookupMap = new Map();
    }
    ClientScriptFetcher.prototype.GetClientScriptById = function (id) {
        if (this.clientScriptLookupMap.has(id)) {
            return this.clientScriptLookupMap.get(id);
        }
        var grClientScript = new glide_1.GlideRecord('sys_ux_client_script');
        if (grClientScript.get(id)) {
            var clientScript = {
                sysId: grClientScript.getUniqueValue(),
                name: grClientScript.getValue('name'),
                script: grClientScript.getValue('script'),
                target: grClientScript.getValue('target')
            };
            this.clientScriptLookupMap.set(id, clientScript);
            return clientScript;
        }
        else {
            return null; // clientScript not found
        }
    };
    ClientScriptFetcher.prototype.GetClientScriptsByMcpSysId = function (mcpSysId) {
        var clientScripts = [];
        var grClientScript = new glide_1.GlideRecord('sys_ux_client_script');
        grClientScript.addQuery('macroponent', '=', mcpSysId);
        grClientScript.query();
        while (grClientScript.next()) {
            var clientScript = {
                sysId: grClientScript.getUniqueValue(),
                name: grClientScript.getValue('name'),
                script: grClientScript.getValue('script'),
                target: grClientScript.getValue('target')
            };
            clientScripts.push(clientScript);
        }
        return clientScripts;
    };
    return ClientScriptFetcher;
}());
exports.ClientScriptFetcher = ClientScriptFetcher;
