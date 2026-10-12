var NowAssistConfig = Class.create();
NowAssistConfig.prototype = {
    initialize: function() {
        this.SETTINGS = "sn_nowassist_settings";
        this.USER_ROLES = "sys_user_role";
    },

    enableNowAssist: function() {
        var gr = new GlideRecord(this.SETTINGS);
        gr.addQuery("type", "general");
        gr.addActiveQuery();
        gr.query();
        if (gr.next()) {
            gr.variable.now_assist_enabled = true;
            gr.update();
        }
    },

    enableNowAssistPanel: function() {
        var gr = new GlideRecord(this.SETTINGS);
        gr.addQuery("type", "nap");
        gr.addActiveQuery();
        gr.query();
        if (gr.next()) {
            gr.variable.nap_enabled = true;
            gr.update();
        }
    },

    enableNowAssistPanelVoiceinput: function() {
        var gr = new GlideRecord(this.SETTINGS);
        try {
            gr.addQuery("type", "nap");
            gr.addActiveQuery();
            gr.query();
            if (gr.next()) {
                gr.variable.nap_voice_input_enabled = true;
                gr.update();
            }
            return true;
        } catch (e) {
            gs.error("Error occurred while enabling the Now assist panel Voice input", e.toString());
            return false;
        }
    },

    disableNowAssistPanelVoiceinput: function() {
        var gr = new GlideRecord(this.SETTINGS);
        try {
            gr.addQuery("type", "nap");
            gr.addActiveQuery();
            gr.query();
            if (gr.next()) {
                gr.variable.nap_voice_input_enabled = false;
                gr.update();
            }
            return true;
        } catch (e) {
            gs.error("Error occurred while disabling the Now assist panel Voice input", e.toString());
            return false;
        }
    },

    enableNowAssistAndNAP: function() {
        this.enableNowAssist();
        this.enableNowAssistPanel();
    },

    isNowAssistEnabled: function() {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "general");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            return nowAssistSettingsGr.variable.now_assist_enabled.toString() == "true";
        }
        return false;
    },

    isNowAssistPanelEnabled: function() {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "nap");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            return nowAssistSettingsGr.variable.nap_enabled.toString() === "true";
        }
        return false;
    },
    getManageLLMConfigurations: function() {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "general");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            return nowAssistSettingsGr.variable.manage_llms_configuration;
        }
        return false;
    },
    setManageLLMConfigurations: function(data) {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "general");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            Object.keys(data).forEach(key=>{
				nowAssistSettingsGr.variable.manage_llms_configuration[key]=data[key];
			});
			nowAssistSettingsGr.update();
        }
        return true;
    },
	getLLMConsentData: function() {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "general");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            return nowAssistSettingsGr.variable.azure_open_ai_provider_consent_data;
        }
        return false;
    },
    setLLMConsentData: function(data) {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "general");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            Object.keys(data).forEach(key=>{
				nowAssistSettingsGr.variable.azure_open_ai_provider_consent_data[key]=data[key];
			});
			nowAssistSettingsGr.update();
        }
        return true;
    },

    isNowAssistPanelVoiceInputEnabled: function() {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "nap");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            return nowAssistSettingsGr.variable.nap_voice_input_enabled.toString() === "true";
        }
        return false;
    },

    disableNowAssistPanel: function() {
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addQuery("type", "nap");
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        if (nowAssistSettingsGr.next()) {
            var keys = Object.keys(nowAssistSettingsGr.variable);
            // To preserve the sys_variable values
            keys.forEach(function(key) {
                if (key === 'nap_enabled') {
                    nowAssistSettingsGr.variable[key] = false;
                }
            });
            //nowAssistSettingsGr.setValue('roles', rolesString);
            nowAssistSettingsGr.update();
        }
    },

    /*
    	This method  will return NowAssist settings as per the type provided in the input.
    	Asumption: There will be only one *active* setting for a specific type
    */
    getSettings: function(type) {
        var result = {};
        if (!gs.nil(type)) {
            var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
            nowAssistSettingsGr.addActiveQuery();
            nowAssistSettingsGr.addQuery("type", type);
            nowAssistSettingsGr.query();
            if (nowAssistSettingsGr.next()) {
                result.name = nowAssistSettingsGr.getValue("name");
                result.props = this._getVariables(nowAssistSettingsGr);
            }
        }
        return result;
    },

    _getVariables: function(glideRecord) {
        var variables = {};
        for (var item in glideRecord.variable) {
            variables[item] = glideRecord.variable[item] ? glideRecord.variable[item].toString() : glideRecord.variable[item];
        }
        return variables;
    },

    getAllSettings: function() {
        var result = {};
        var nowAssistSettingsGr = new GlideRecord(this.SETTINGS);
        nowAssistSettingsGr.addActiveQuery();
        nowAssistSettingsGr.query();
        while (nowAssistSettingsGr.next()) {
            var type = nowAssistSettingsGr.getValue("type");
            result[type] = this.getSettings(type);
        }
        return result;
    },

    type: 'NowAssistConfig'
};
