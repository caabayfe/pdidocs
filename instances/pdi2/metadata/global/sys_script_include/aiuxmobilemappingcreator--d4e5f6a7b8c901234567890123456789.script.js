var AiuxMobileMappingCreator = Class.create();
AiuxMobileMappingCreator.prototype = {
    initialize: function() {},

    /**
     * Creates or updates a sys_sg_native_client record.
     *
     * @param {Object} inputData
     *
     * Required fields:
     *   {string} inputData.name             - Name of the mobile app config (sys_sg_native_client.name)
     *   {string} inputData.aiux_web_experience  - sys_id of the sys_aix_experience record
     *   {string} inputData.type             - Native client type (e.g. "agent")
     *
     * Optional sys_sg_native_client fields:
     *   {string}  inputData.configuration_script_tabs     - script body or sys_id for sys_sg_aiux_configuration_script (type=navigation_tabs)
     *   {string}  inputData.configuration_script_tabs_name - name for tabs configuration script (used when creating new script)
     *   {string}  inputData.configuration_script_settings - script body or sys_id for sys_sg_aiux_configuration_script (type=settings)
     *   {string}  inputData.configuration_script_settings_name - name for settings configuration script (used when creating new script)
     *   {boolean} inputData.useSysId                      - if true, treat configuration_script_* values as sys_ids instead of script bodies
     *   {number} inputData.order
     *   {string} inputData.required_roles
     *   {boolean} inputData.force_local_login
     *   {string} inputData.client_theme    - sys_id of sys_sg_client_theme
     *   {string} inputData.vision_ios_app_id
     *   {string} inputData.vision_android_app_id
     *   {string} inputData.vision_api_key
     *   {string} inputData.empty_state     - sys_id of sys_sg_empty_state
     *   {string} inputData.mobile_theme    - sys_id of sys_ux_theme
     *   {string} inputData.push_application - sys_id of sys_push_application
     *
     * @return {Object} { success: boolean, nativeClientSysId: string, error: string }
     */
    createMobileConfiguration: function(inputData) {
        if (!inputData) {
            return this._error("inputData is required");
        }
        if (!inputData.name) {
            return this._error("inputData.name is required");
        }
        if (!inputData.aiux_web_experience) {
            return this._error("inputData.aiux_web_experience is required");
        }
        if (!inputData.type) {
            return this._error("inputData.type is required");
        }

        var nativeClientSysId = this._createNativeClient(inputData);
        if (!nativeClientSysId) {
            return this._error("Failed to create sys_sg_native_client record");
        }

        return {
            success: true,
            nativeClientSysId: nativeClientSysId
        };
    },

    /**
     * Updates a sys_sg_aiux_configuration_script record.
     *
     * @param {string} sysId - The sys_id of the configuration script record
     * @param {string} script - The new script body
     * @param {string} expectedType - Optional: expected script type (navigation_tabs, settings)
     * @return {Object} { success: boolean, error: string }
     */
    updateConfigurationScript: function(sysId, script, expectedType) {
        if (!sysId) {
            return this._error("sysId is required");
        }
        if (!script) {
            return this._error("script is required");
        }
        var scriptGR = new GlideRecord("sys_sg_aiux_configuration_script");
        if (!scriptGR.get(sysId)) {
            return this._error("sys_sg_aiux_configuration_script record not found: " + sysId);
        }

        if (expectedType && scriptGR.getValue("type") !== expectedType) {
            return this._error("configuration script type mismatch: expected " + expectedType + ", got " + scriptGR.getValue("type"));
        }

        scriptGR.setValue("script", script);
        if (!scriptGR.update()) {
            return this._error("failed to update sys_sg_aiux_configuration_script record: " + sysId);
        }
        return { success: true };
    },

    _createNativeClient: function(inputData) {
        var optionalFields = [
            "order", "required_roles", "force_local_login",
            "client_theme", "vision_ios_app_id", "vision_android_app_id",
            "vision_api_key", "empty_state", "mobile_theme", "push_application"
        ];

        var existing = new GlideRecord("sys_sg_native_client");
        existing.addQuery("name", inputData.name);
        existing.addQuery("type", inputData.type);
        existing.setLimit(1);
        existing.query();

        var gr;
        if (existing.next()) {
            gr = existing;
        } else {
            gr = new GlideRecord("sys_sg_native_client");
            gr.initialize();
            gr.setValue("name", inputData.name);
            gr.setValue("type", inputData.type);
            gr.setValue("aiux_web_experience", inputData.aiux_web_experience);
        }

        if (JSUtil.nil(inputData.order)) {
            gr.setValue("order", 999);
        }

        for (var i = 0; i < optionalFields.length; i++) {
            var field = optionalFields[i];
            if (!JSUtil.nil(inputData[field])) {
                gr.setValue(field, inputData[field]);
            }
        }

        var configScriptEntries = [
            { input: "configuration_script_tabs",     type: "navigation_tabs", nameInput: "configuration_script_tabs_name" },
            { input: "configuration_script_settings", type: "settings",        nameInput: "configuration_script_settings_name" }
        ];
        var resolvedScripts = [];
        for (var j = 0; j < configScriptEntries.length; j++) {
            var entry = configScriptEntries[j];
            if (!JSUtil.nil(inputData[entry.input])) {
                var resolvedSysId = this._resolveConfigurationScript(
                    inputData[entry.input], entry.type, inputData.useSysId, inputData[entry.nameInput]
                );
                if (resolvedSysId) {
                    resolvedScripts.push(resolvedSysId);
                }
            }
        }

        var sysId = gr.isNewRecord() ? gr.insert() : gr.update();
        if (!sysId) {
            gs.error("AiuxMobileMappingCreator: failed to save sys_sg_native_client, errors: " + gr.getErrors());
            return null;
        }

        for (var k = 0; k < resolvedScripts.length; k++) {
            this._linkConfigurationScript(sysId, resolvedScripts[k]);
        }

        return sysId;
    },

    _linkConfigurationScript: function(nativeClientSysId, configScriptSysId) {
        if (JSUtil.nil(configScriptSysId)) {
            return;
        }
        var m2mGR = new GlideRecord("sys_sg_aiux_configuration");
        m2mGR.addQuery("native_client", nativeClientSysId);
        m2mGR.addQuery("configuration_script", configScriptSysId);
        m2mGR.query();
        if (m2mGR.next()) {
            return;
        }
        m2mGR = new GlideRecord("sys_sg_aiux_configuration");
        m2mGR.initialize();
        m2mGR.setValue("native_client", nativeClientSysId);
        m2mGR.setValue("configuration_script", configScriptSysId);
        if (!m2mGR.insert()) {
            gs.error("AiuxMobileMappingCreator: failed to link native_client " + nativeClientSysId + " to configuration_script " + configScriptSysId);
        }
    },

    _resolveConfigurationScript: function(value, type, useSysId, scriptName) {
        if (useSysId) {
            return value;
        }
        var scriptGR = new GlideRecord("sys_sg_aiux_configuration_script");
        scriptGR.initialize();
        scriptGR.setValue("script", value);
        scriptGR.setValue("type", type);
        if (!JSUtil.nil(scriptName)) {
            scriptGR.setValue("name", scriptName);
        }
        var sysId = scriptGR.insert();
        if (!sysId) {
            gs.error("AiuxMobileMappingCreator: failed to insert configuration_script record of type " + type);
            return null;
        }
        return sysId;
    },

    _error: function(message) {
        gs.error("AiuxMobileMappingCreator: " + message);
        return { success: false, error: message };
    },

    type: 'AiuxMobileMappingCreator'
};
