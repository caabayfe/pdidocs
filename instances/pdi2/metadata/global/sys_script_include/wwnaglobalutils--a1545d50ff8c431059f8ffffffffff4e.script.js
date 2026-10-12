var WWNAGlobalUtils = Class.create();
WWNAGlobalUtils.prototype = {
    initialize: function() {
        this.logger = new sn_wwna.WWNALogger();
    },
    getAttribute: function(tableName, columnName, attributeName) {
        var dictGr = new GlideRecord("sys_dictionary");
        dictGr.addQuery("name", tableName);
        dictGr.addQuery("element", columnName);
        dictGr.query();
        var fieldDecorations = '';
        if (dictGr.next()) {
            var attributes = new GlideAttributes(dictGr.getValue("attributes"));
            fieldDecorations = attributes.getAttribute(attributeName);
        }
        return fieldDecorations;
    },
    setOrRemoveAttribute: function(tableName, columnName, attributeName, newValue) {
        if (newValue) {
            SNC.DictionaryAttribute.set(tableName, columnName, attributeName, newValue);
        } else {
            SNC.DictionaryAttribute.remove(tableName, columnName, attributeName);
        }
    },
    createMacro: function(macroObject) {
        var uiMacroGr = new GlideRecord('sys_ui_macro');
        var scopeName = gs.getCurrentApplicationScope();
        uiMacroGr.initialize();
        Object.keys(macroObject).forEach((key) => {
            uiMacroGr.setValue(key, macroObject[key]);
        });
        var sysId = uiMacroGr.insert();
        return {
            success: true,
            sysId: sysId
        };
    },
    deleteMacro: function(macroName) {
        if (!macroName) {
            return;
        }
        var uiMacroGr = new GlideRecord('sys_ui_macro');
        uiMacroGr.addQuery('name', macroName);
        uiMacroGr.addQuery('scoped_name', macroName);
        uiMacroGr.query();
        while (uiMacroGr.next()) {
            uiMacroGr.deleteRecord();
        }
        return {
            success: true
        };
    },
    updateMacro: function(queryParams, dataToUpdate) {
        if (!queryParams || !dataToUpdate) {
            return {
                success: false,
                message: 'QueryParams or DataToUpdate not Present'
            };
        }
        if (!Object.keys(queryParams).length || !Object.keys(dataToUpdate).length) {
            return {
                success: false,
                message: 'Empty QueryParams or DataToUpdate'
            };
        }
        var uiMacroGr = new GlideRecord('sys_ui_macro');
        Object.keys(queryParams).forEach((key) => {
            if (queryParams[key].operator && queryParams[key].value) {
                uiMacroGr.addQuery(key, queryParams[key].operator, queryParams[key].value);
            } else if (queryParams[key]) {
                uiMacroGr.addQuery(key, queryParams[key]);
            }
        });
        let keysToUpdate = Object.keys(dataToUpdate);
        uiMacroGr.query();
        while (uiMacroGr.next()) {
            keysToUpdate.forEach((key) => {
                uiMacroGr.setValue(key, dataToUpdate[key]);
            });
            uiMacroGr.update();
        }
        return {
            success: true
        };
    },
    updateReplaceOnUpgrade(name) {
        if (name) {
            var gr = new GlideRecord('sys_update_xml');
            gr.addQuery('name', name);
            gr.addQuery('replace_on_upgrade', false);
            gr.query();
            if (gr.next()) {
                gr.setValue('replace_on_upgrade', true);
                gr.update();
            }
        }

    },
    createPayload: function(payloadObj = {}, isOpenPromptRequest = false, otherParams = {}) {
        const payload = {
            skill_description: payloadObj.skill_description,
            skill_name: payloadObj.skill_name,
            drafted_text: payloadObj.drafted_text || '',
            context: payloadObj.context || '',
            additional_context: payloadObj.additional_context || '',
            selected_text: payloadObj.selected_text || '',
            skill_id: payloadObj.skill_id,
            skill_config_id: payloadObj.skill_config_id,
            document_id: payloadObj.document_sys_id,
            document_table: payloadObj.document_table_name,
            caller: payloadObj.caller,
            user_query: payloadObj.user_query || '',
            trigger_source: payloadObj.trigger_source,
            model_output: payloadObj.model_output || '',
            knowledge_graph_id: payloadObj.knowledge_graph_id || '',
            modified_query_for_knowledge_graph: payloadObj.modified_query_for_knowledge_graph || '',
            action_type: payloadObj.trigger_source ? (sn_wwna.WWNAConstants.WWNA_TRIGGER_SOURCE_TO_ACTION_TYPE[payloadObj.trigger_source] ?? '') : '',
            currentMenuAction: payloadObj.currentMenuAction || {},
            conversation_history: payloadObj.conversation_history ? typeof payloadObj.conversation_history === 'object' ? JSON.stringify(payloadObj.conversation_history) : payloadObj.conversation_history : '[]',
            isOpenPromptRequest
        };

        return payload;

    },
    getErrorMessage: function(responseObj = {}) {
        if (responseObj?.message === sn_wwna.WWNAConstants.ONE_EXTEND_ACL_FAILURE_ERROR_MESSAGE) {
            return sn_wwna.WWNAConstants.WWNA_ACL_FAILURE_MESSAGE;
        } else {
            return sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE;
        }
    },
    hasAccessToSkill: function(inputSkillConfigId, skillIdToVerify, defaultSkillConfigId) {
        var result = true;
        try {
            var naaSkillConfigUtil = new sn_nowassist_admin.NowAssistSkillConfig();
            if (inputSkillConfigId && skillIdToVerify && defaultSkillConfigId && naaSkillConfigUtil.getSkillConfigHasAccess) {
                var skillConfigs = naaSkillConfigUtil._getSkillConfigs([inputSkillConfigId], null, true);
                var hasAccessToInputSkillConfigId = naaSkillConfigUtil.getSkillConfigHasAccess(inputSkillConfigId);
                if (skillConfigs[inputSkillConfigId]?.skill_id === skillIdToVerify || hasAccessToInputSkillConfigId) {
                    result = hasAccessToInputSkillConfigId;
                } else {
                    result = naaSkillConfigUtil.getSkillConfigHasAccess(defaultSkillConfigId);
                }
            }
        } catch (err) {
            this.logger.error("WWNA: Failed to Validate Skill Access Check: " + err.message);
        }
        return result;

    },
    getSkillInputVariables: function(capabilityId, payload = {}) {
        let result = {};
        try {
			if(!capabilityId){
				return result;
			}
            const SKILL_BUILDER_CONSTANTS = new sn_skill_builder.SkillBuilderConstants();
            const skillInputs = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityId)?.inputs || [];

            skillInputs.forEach((skillInputObject) => {
                if (skillInputObject.attributeDataType === SKILL_BUILDER_CONSTANTS.SYS_ONE_EXTEND_DEFINITION_ATTRIBUTE_DATA_TYPES.GLIDE_RECORD) {
                    result[skillInputObject.attributeName] = JSON.parse(skillInputObject.schema || '{}');
                    if (result[skillInputObject.attributeName].tableName === payload.document_table) {
                        result[skillInputObject.attributeName].sysId = payload.document_id;
                    }
                } else {
                    result[skillInputObject.attributeName] = skillInputObject.defaultValue || null;
                }
            });
            return result;
        } catch (err) {
            this.logger.error("WWNA: Failed to Get Skill Input Variables: " + err?.message);
            return result;
        }
    },
    type: 'WWNAGlobalUtils'
};
