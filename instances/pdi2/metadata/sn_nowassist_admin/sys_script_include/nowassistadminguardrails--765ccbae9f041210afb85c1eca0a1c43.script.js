var NowAssistAdminGuardrails = Class.create();
NowAssistAdminGuardrails.prototype = {
    initialize: function() {
        this.GEN_AI_CONTROL_SETTING_DATA = "sys_gen_ai_control_setting_data";
        this.GEN_AI_CONTROL_DATA = "sys_gen_ai_control_data";
        this.TRUST_BUILDER_ID = "03b158497f0b8210ee61def20d866577";
        this.NAA_SKILL_CONFIG = "sn_nowassist_skill_config";
        this.NAA_SKILL_FAMILY = "sn_nowassist_skill_family";
        this.OFFENSIVENESS_METRIC_NAME = "Offensiveness";
        this.PROMPT_INJECTION_METRIC_NAME = "Prompt Injection";
        this.OFFENSIVENESS_RAW_RESPONSE = "Offensiveness Raw Response";
        this.PROMPT_INJECTION_RAW_RESPONSE = "Prompt Injection Raw Response";
    },

    isTrustBuilderEnabled: function() {
        var isTrustBuilderEnabled = false;
        try {
            var controlSettingDataGr = new GlideRecord(this.GEN_AI_CONTROL_SETTING_DATA);
            controlSettingDataGr.get(this.TRUST_BUILDER_ID);
            controlSettingDataGr.addQuery("active", true);
            controlSettingDataGr.query();
            if (controlSettingDataGr.next()) {
                isTrustBuilderEnabled = controlSettingDataGr.getDisplayValue('value') === "true";
            }
            return isTrustBuilderEnabled;
        } catch (error) {
            gs.error("Error in isTrustBuilderEnabled method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    _getControlData: function(skillId) {
        try {
            var controlDataGr = new GlideRecord(this.GEN_AI_CONTROL_DATA);
            controlDataGr.addQuery("target", skillId);
            controlDataGr.addQuery("target_type", "sn_nowassist_skill_config");
            controlDataGr.query();
            if (controlDataGr.next()) {
                return controlDataGr.getUniqueValue();
            }
            return "";
        } catch (error) {
            gs.error("Error in _getControlData method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    _getControlSettingData: function(skillId, type) {
        var controlSetting = {};
        var _self = this;
        try {
            if (!gs.nil(type)) {
                var controlId = _self._getControlData(skillId);
                if (controlId !== "") {
                    var controlSettingDataGr = new GlideRecord(this.GEN_AI_CONTROL_SETTING_DATA);
                    controlSettingDataGr.addQuery("control_data", controlId);
                    controlSettingDataGr.addQuery("control_setting.name", type);
                    controlSettingDataGr.query();
                    if (controlSettingDataGr.next()) {
                        controlSetting["id"] = controlSettingDataGr.getUniqueValue();
                        controlSetting["detectionImpact"] = controlSettingDataGr.getValue('value');
                        controlSetting["lastUpdatedBy"] = controlSettingDataGr.getValue('sys_updated_by');
                        controlSetting["lastUpdatedOn"] = controlSettingDataGr.getValue('sys_updated_on');
                        return controlSetting;
                    }
                }
                return {
                    "detectionImpact": "",
                };
            }
        } catch (error) {
            gs.error("Error in _getControlSettingData method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    _getControlSettingDataByType: function(type) {
        var controlSetting = {};
        var _self = this;
        try {
            if (!gs.nil(type)) {
                var controlSettingDataGr = new GlideRecord(this.GEN_AI_CONTROL_SETTING_DATA);
                controlSettingDataGr.addQuery("control_setting.name", type);
                controlSettingDataGr.query();
                if (controlSettingDataGr.next()) {
                    controlSetting["id"] = controlSettingDataGr.getUniqueValue();
                    controlSetting["detectionImpact"] = controlSettingDataGr.getValue('value');
                    return controlSetting;
                }
                return {
                    "detectionImpact": "",
                };
            }
        } catch (error) {
            gs.error("Error in _getControlSettingDataByType method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    getDetectionImpact: function(skills, type) {
        var _self = this;
        try {
            for (let skill of skills) {
                var result = this._getControlSettingData(skill?.id, type);
                if (result?.detectionImpact !== "") {
                    return result;
                }
            }
            return {
                detectionImpact: ""
            };
        } catch (error) {
            gs.error("Error in getDetectionImpact method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    setActiveControl: function(skillId, detectionImpact, type) {
        var _self = this;
        try {
            if (!gs.nil(type)) {
                var request = {
                    "name": "TB " + skillId,
                    "target": _self.NAA_SKILL_CONFIG,
                    "targetId": skillId,
                    "control": "Trustbuilder (Now Assist Skill)",
                    "settings": {
                        "name": type,
                        "value": detectionImpact
                    }
                };
                return sn_one_extend.OneExtendUtil.setActiveControl(request);
            }
        } catch (error) {
            gs.error("Error in setActiveControl method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    updateDetectionImpact: function(skills, detectionImpact, type) {
        var _self = this;
        var result = [];
        try {
            skills.forEach(function(skill) {
                // If the skill is active or record exists in the table, update
                if (skill?.active || (_self._getControlSettingData(skill?.id, type))?.detectionImpact !== "") {
                    result.push(_self.setActiveControl(skill?.id, detectionImpact, type));
                }
            });
            return result;
        } catch (error) {
            gs.error("Error in updateDetectionImpact method, NowAssistAdminGuardrails : " + error.toString());
        }
    },
    updateDetectionImpactForPromptInjection: function(detectionImpact) {
        var _self = this;
        var request = {
            "name": "Trustbuilder",
            "target": "global",
            "targetId": "",
            "control": "Trustbuilder",
            "settings": {
                "name": _self.PROMPT_INJECTION_METRIC_NAME,
                "value": detectionImpact
            }
        };
        return sn_one_extend.OneExtendUtil.setActiveControl(request);
    },
    getExportURL: function(skillConfigSysIdList, metricName) {
        var _self = this;
        var metricRawResponse;
        try {
            metricRawResponse = (metricName === _self.OFFENSIVENESS_METRIC_NAME) ? _self.OFFENSIVENESS_RAW_RESPONSE : (metricName === _self.PROMPT_INJECTION_METRIC_NAME ? _self.PROMPT_INJECTION_RAW_RESPONSE : "");
            var path = "sn_nowassist_admin_sys_gen_ai_export_data.do?CSV&sysparm_fields=meta_skill_config_id,metric_name,meta_sys_created_by,meta_started_at,meta_caller,meta_conversation,meta_sys_domain,meta_feedback,meta_time_taken,meta_status,meta_metadata_table,meta_metadata_document,log_value,metric_sys_generative_ai_log&sysparm_query=metric_name=" + metricName + "^log_name=" + metricRawResponse;

            if (skillConfigSysIdList.length > 0) {
                skillConfigSysIdList.forEach((skillId, index) => {
                    path += (index === 0 ? "^" : "^OR");
                    path += "meta_skill_config_id=".concat(skillId);
                });
            }
			path+='^ORDERBYDESCmeta_started_at';
            return path;
        } catch (error) {
            gs.error("Error in getExportURL method, NowAssistAdminGuardrails : " + error.toString());
        }
    },

    type: 'NowAssistAdminGuardrails'
};
