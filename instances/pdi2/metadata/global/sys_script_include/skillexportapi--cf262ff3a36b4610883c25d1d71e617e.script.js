var SkillExportAPI = Class.create();
SkillExportAPI.prototype = {
    initialize: function(skillId, optionalParams) {
        this.skillId = skillId;
        this.configId = (optionalParams && optionalParams.configId) || undefined;
        this.isInternal = (optionalParams && optionalParams.isInternal) || false;
        this.scopeToUpdateSet = (optionalParams && optionalParams.scopeToUpdateSet) || {};
        this.parentUpdateSetId = (optionalParams && optionalParams.parentUpdateSetId) || undefined;
        this.parentScope = (optionalParams && optionalParams.parentScope) || undefined;
        this.childCapabilities = [];
    },

    _createUpdateSetForScope: function(scope) {
        var skillName = this.skillName || "Default skill";
        var updateSetGR = new GlideRecord("sys_update_set");
        updateSetGR.initialize();
        var updateSetName = skillName + "-" + scope;
        //there is a possibility of same named child updatesets when tool capability is same and
        //this is causing issues with postgres, hence appending with rand number of 6 digits as that's max len we can have
        if (!gs.nil(this.parentUpdateSetId)) {
            updateSetName = skillName + "-" + scope + "-" + Math.floor(Math.random() * 1000000);
        }
        updateSetGR.setValue("name", updateSetName);
        updateSetGR.setValue("application", scope);
        if (this.parentScope && this.parentUpdateSetId) {
            updateSetGR.setValue("parent", this.parentUpdateSetId);
        }
        var updateSetId = updateSetGR.insert();
        this.scopeToUpdateSet[scope] = updateSetId;
        return updateSetId;
    },

    _saveToUpdateSet: function(glideRecord) {
        var glideUpdateManager;
        var scope = String(glideRecord.sys_scope || "global");
        var updateSetSysId = this.scopeToUpdateSet[scope];

        if (!updateSetSysId) {
            updateSetSysId = this._createUpdateSetForScope(scope);
        }

        try {
            glideUpdateManager = new GlideUpdateManager2(updateSetSysId);
        } catch (e) {
            var glideUpdateSet = new GlideUpdateSet();
            glideUpdateSet.set(updateSetSysId);
            glideUpdateManager = new GlideUpdateManager2();
        }
        glideUpdateManager.saveRecord(glideRecord);
    },

    _setReplaceOnUpgrade: function() {
        for (var scope in this.scopeToUpdateSet) {
            var updateSetId = this.scopeToUpdateSet[scope];
            var sysUpdateGr = new GlideRecord('sys_update_xml');
            sysUpdateGr.addQuery('update_set', updateSetId);
            sysUpdateGr.query();
            while (sysUpdateGr.next()) {
                sysUpdateGr.setValue('replace_on_upgrade', true);
                sysUpdateGr.update();
            }
        }
    },

    _getRelatedRecords: function(relatedRecordTable, referenceField, referenceValue) {
        var gr = new GlideRecord(relatedRecordTable);
        if (gr.isValid()) {
            gr.addQuery(referenceField, referenceValue);
            gr.query();
        }
        return gr;
    },

    _saveRelatedRecords: function(relatedRecordTable, referenceField, referenceValue) {
        var gr = this._getRelatedRecords(relatedRecordTable, referenceField, referenceValue);
        while (gr.next()) {
            this._saveToUpdateSet(gr);
        }
    },

    _saveDiagramBuilderRecord: function(resourceMappingGr) {
        var metaData = JSON.parse(resourceMappingGr.getValue('metadata') || '{}');
        var instanceId = metaData.diagramInstanceId || "";
        if (gs.nil(instanceId)) return;
        var diagramBuilderInstanceGr = new GlideRecord('sn_diagram_builder_instance');
        if (diagramBuilderInstanceGr.get(instanceId)) {
            this._saveToUpdateSet(diagramBuilderInstanceGr);
        }
    },

    _saveValidResourceEdges: function(fromResourceMappingId) {
        var edgeGr = new GlideRecord("sys_one_extend_resource_edge");
        if (edgeGr.isValid()) {
            edgeGr.addQuery("from_resource", fromResourceMappingId);
            edgeGr.addQuery("to_resource.parent_capability", this.skillId);
            edgeGr.query();
            while (edgeGr.next()) {
                this._saveToUpdateSet(edgeGr);
            }
        }
    },

    _saveValidatorRecord: function(validatorId) {
        var validatorGr = new GlideRecord("sys_generative_ai_validator");
        if (validatorGr.get(validatorId)) {
            this._saveToUpdateSet(validatorGr);
        }
    },

    _saveUIActionRecord: function(uiActionId) {
        var uiActionGr = new GlideRecord("sys_ui_action");
        if (uiActionGr.get(uiActionId)) {
            this._saveToUpdateSet(uiActionGr);
            this._saveRelatedRecords("sys_ux_form_action", "ui_action", uiActionGr.getUniqueValue());
        }
    },

    _saveSkillAclRecords: function(skillConfigId) {
        try {
            var securityUtils = new global.GenAiSkillSecurityUtils();
            securityUtils.initialize();
            var result = securityUtils.getAllAclsForSkill(skillConfigId, '', 0, 'sys_updated_on');
            if (result.error || !result.response) {
                gs.warn("SkillExportAPI: Failed to fetch ACLs for skill config " + skillConfigId + ": " + (result.errorMessage || "Unknown error"));
                return;
            }
            var acls = result.response || [];
            for (var i = 0; i < acls.length; i++) {
                var aclSysId = acls[i].id;
                var aclGr = new GlideRecord("sys_security_acl");
                if (aclGr.get(aclSysId)) {
                    this._saveToUpdateSet(aclGr);
                    this._saveRelatedRecords("sys_security_acl_role", "sys_security_acl", aclSysId);
                } else {
                    gs.warn("SkillExportAPI: ACL record not found for sys_id " + aclSysId);
                }
            }
        } catch (e) {
            gs.error("SkillExportAPI: Error exporting ACL records for skill config " + skillConfigId + ": " + e.message);
        }
    },

    _saveAgentAccessRoleConfigRecords: function(skillConfigId) {
        try {
            // Use direct GlideRecord query instead of DAO (DAO methods may not exist)
            var configGr = new GlideRecord("sys_agent_access_role_configuration");
            configGr.addQuery("agent", skillConfigId);
            configGr.query();
            var count = 0;
            while (configGr.next()) {
                this._saveToUpdateSet(configGr);
                this._saveAgentAccessRoleMappingRecords(configGr.getUniqueValue());
                count++;
            }
            if (count > 0) {
                gs.info("SkillExportAPI: Exported " + count + " agent access role config records for skill config " + skillConfigId);
            }
        } catch (e) {
            gs.error("SkillExportAPI: Error exporting agent access role config records for skill config " + skillConfigId + ": " + e.message);
        }
    },

    _saveAgentAccessRoleMappingRecords: function(agentAccessConfigId) {
        try {
            var mappingGr = new GlideRecord("sys_agent_access_role_mapping");
            mappingGr.addQuery("agent_access_config", agentAccessConfigId);
            mappingGr.query();
            var count = 0;
            while (mappingGr.next()) {
                this._saveToUpdateSet(mappingGr);
                count++;
            }
            if (count > 0) {
                gs.info("SkillExportAPI: Exported " + count + " agent access role mapping records for agent access config " + agentAccessConfigId);
            }
        } catch (e) {
            gs.error("SkillExportAPI: Error exporting agent access role mapping records for agent access config " + agentAccessConfigId + ": " + e.message);
        }
    },

    _getDefaultStrategyId: function(capabilityId) {
        var strategyGr = new GlideRecord("sys_one_extend_eval_strategy");
        strategyGr.addQuery("capability", capabilityId);
        strategyGr.addQuery("default", true);
        strategyGr.query();
        return strategyGr;
    },

    _saveDefinitionRelatedRecords: function(definitionGr) {
        var definitionId = definitionGr.getUniqueValue();
        var genAIConfigGr = this._getRelatedRecords("sys_generative_ai_config", "definition", definitionId);
        while (genAIConfigGr.next()) {
            this._saveToUpdateSet(genAIConfigGr);
            this._saveRelatedRecords("sys_generative_ai_prompt_config", "ai_config", genAIConfigGr.getUniqueValue());

            var requestValidatorGr = this._getRelatedRecords("sys_generative_ai_request_validator", "document_id", genAIConfigGr.getUniqueValue());
            while (requestValidatorGr.next()) {
                this._saveToUpdateSet(requestValidatorGr);
                this._saveValidatorRecord(requestValidatorGr.getValue("validator"));
            }

            var responseValidatorGr = this._getRelatedRecords("sys_generative_ai_response_validator", "definition", genAIConfigGr.getUniqueValue());
            while (responseValidatorGr.next()) {
                this._saveToUpdateSet(responseValidatorGr);
                this._saveValidatorRecord(responseValidatorGr.getValue("validator"));
            }
        }

        requestValidatorGr = new GlideRecord("sys_generative_ai_request_validator");
        var qc = requestValidatorGr.addQuery('definition', definitionId);
        qc.addOrCondition('document_id', definitionId);
        requestValidatorGr.query();
        while (requestValidatorGr.next()) {
            this._saveToUpdateSet(requestValidatorGr);
            this._saveValidatorRecord(requestValidatorGr.getValue("validator"));
        }

        responseValidatorGr = this._getRelatedRecords("sys_generative_ai_response_validator", "definition", definitionId);
        while (responseValidatorGr.next()) {
            this._saveToUpdateSet(responseValidatorGr);
            this._saveValidatorRecord(responseValidatorGr.getValue("validator"));
        }

    },

    _canExportSkill: function(capabilityGr) {
        if (this.isInternal) {
            return true;
        }

        if (capabilityGr.getValue("sys_policy") != "read") {
            return true;
        }
        return false;
    },

    exportSkill: function(isRecursiveCall) {
        if (!isRecursiveCall) {
            this.currentUpdateSetSysId = gs.getPreference("sys_update_set");
        }

        var capabilityGr = new GlideRecord("sys_one_extend_capability");
        if (capabilityGr.get(this.skillId)) {
            if (!this._canExportSkill(capabilityGr)) {
                return;
            }
            this.skillName = capabilityGr.getValue("name");
            if (!isRecursiveCall) {
                this.parentScope = capabilityGr.getValue("sys_scope");
                this.parentUpdateSetId = this._createUpdateSetForScope(this.parentScope);
            }

            this._saveToUpdateSet(capabilityGr);
        } else {
            return {
                "isError": true,
                "errorMessage": "Invalid skill id"
            };
        }

        if (this.configId) {
            var skillConfigGr = new GlideRecord("sn_nowassist_skill_config");
            if (skillConfigGr.get(this.configId)) {
                this._saveToUpdateSet(skillConfigGr);
                this._saveRelatedRecords("sn_nowassist_skill_config_applicability", "skill_config", skillConfigGr.getUniqueValue());
                var skillFamilyId = skillConfigGr.getValue("skill_family");
                if (skillFamilyId) {
                    var skillFamilyGr = new GlideRecord("sn_nowassist_skill_family");
                    if (skillFamilyGr.get(skillFamilyId)) {
                        this._saveToUpdateSet(skillFamilyGr);
                    }
                }
                var napSkillAppSysId = skillConfigGr.getValue("nap_skill_applicability");
                if (napSkillAppSysId) {
                    var aiSkillAppGr = new GlideRecord("sys_gen_ai_skill_applicability");
                    if (aiSkillAppGr.get(napSkillAppSysId)) {
                        this._saveToUpdateSet(aiSkillAppGr);
                    }
                    var skillId = aiSkillAppGr.getValue("skill_id");
                    if (skillId) {
                        var aiSkillGr = new GlideRecord("sys_gen_ai_skill");
                        if (aiSkillGr.get(skillId)) {
                            this._saveToUpdateSet(aiSkillGr);
                        }
                    }
                }
                var varSetGr = this._getRelatedRecords("sn_nowassist_skill_config_var_set", "skill_config", skillConfigGr.getUniqueValue());
                while (varSetGr.next()) {
                    this._saveToUpdateSet(varSetGr);
                    if (varSetGr.vars.enable_ui_action && varSetGr.vars.ui_action_id) {
                        this._saveUIActionRecord(varSetGr.vars.ui_action_id);
                    }
                }
            }

            var skillConfigStatusGr = this._getRelatedRecords("sn_nowassist_skill_config_status", "skill_config", skillConfigGr.getUniqueValue());
            while (skillConfigStatusGr.next()) {
                this._saveToUpdateSet(skillConfigStatusGr);
            }

            this._saveSkillAclRecords(skillConfigGr.getUniqueValue());
            this._saveAgentAccessRoleConfigRecords(skillConfigGr.getUniqueValue());
        }

        this._saveRelatedRecords("sys_one_extend_definition_attribute", "capability", this.skillId);
        this._saveRelatedRecords("sys_one_extend_definition_config", "capability", this.skillId);
        this._saveRelatedRecords("sys_one_extend_eval_attribute", "capability", this.skillId);
        this._saveRelatedRecords("sys_one_extend_eval_suggestion", "capability", this.skillId);

        this._saveRelatedRecords("wwna_quick_actions", "skill", this.skillId);

        var definitionGr = this._getRelatedRecords("sys_one_extend_capability_definition", "capability", this.skillId);
        while (definitionGr.next()) {
            this._saveToUpdateSet(definitionGr);
            this._saveDefinitionRelatedRecords(definitionGr);
        }

        var featureMappingGr = this._getRelatedRecords("sys_gen_ai_feature_mapping", "document", this.skillId);
        while (featureMappingGr.next()) {
            this._saveToUpdateSet(featureMappingGr);
            this._saveRelatedRecords("sys_gen_ai_strategy_mapping", "feature", featureMappingGr.getUniqueValue());
        }

        var resourceMappingGr = this._getRelatedRecords("sys_one_extend_resource_mapping", "parent_capability", this.skillId);
        while (resourceMappingGr.next()) {
            this._saveToUpdateSet(resourceMappingGr);
            this._saveDiagramBuilderRecord(resourceMappingGr);
            this._saveRelatedRecords("sys_one_extend_resource_attribute_mapping", "resource_mapping", resourceMappingGr.getUniqueValue());
            this._saveRelatedRecords("sys_one_extend_resource_param_value", "resource_mapping", resourceMappingGr.getUniqueValue());
            this._saveValidResourceEdges(resourceMappingGr.getUniqueValue());
            var childCapabilityGr = resourceMappingGr.resource_capability && resourceMappingGr.resource_capability.getRefRecord();
            if (childCapabilityGr.getUniqueValue() != this.skillId && this._canExportSkill(childCapabilityGr)) {
                //  export all child capabilities
                new SkillExportAPI(childCapabilityGr.getUniqueValue(), {
                    "parentUpdateSetId": this.parentUpdateSetId,
                    "parentScope": this.parentScope,
                    "isInternal": this.isInternal
                }).exportSkill(true);

                this.childCapabilities.push(resourceMappingGr.getValue("resource_capability"));
            }
        }

        var strategyGr = this._getDefaultStrategyId(this.skillId);
        if (strategyGr.next()) {
            this._saveToUpdateSet(strategyGr);
            this._saveRelatedRecords("sys_one_extend_eval_strategy_metric", "eval_strategy", strategyGr.getUniqueValue());
        }

        if (!isRecursiveCall) {
            new GlideUpdateSet().set(this.currentUpdateSetSysId);
        }

        this._setReplaceOnUpgrade();

        for (var updateSetKey in this.scopeToUpdateSet) {
            var updateSetGR = new GlideRecord("sys_update_set");
            updateSetGR.get(this.scopeToUpdateSet[updateSetKey]);
            updateSetGR.setValue("state", "complete");
            updateSetGR.update();
        }

        return {
            "isError": false,
            "sysId": this.parentUpdateSetId
        };
    },


    type: 'SkillExportAPI'
};
