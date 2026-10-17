var SkillBuilderNaaUtils = Class.create();
SkillBuilderNaaUtils.prototype = {
    initialize: function() {
        this.CUSTOM_SKILLS_SKILL_FAMILY = "a5efaf1c93764210aa5730f16489186d";
        this.MODALITY_VAR_SET_CONFIG_TYPE = "7dfdff5893b64210aa5730f164891837";
        this.VIEW_TRIGGER_MODALITY_VAR_SET_CONFIG_TYPE = "b89b1f0b7f821210076726d6ac86650e";
        this.PROMPT_CONFIG_TYPE = "5a63045793dc1210aa5730f1648918a4";
        this.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE = "d175c9117faa1210f465c3b76d8665c9";
        this.OTHER_SKILLS_LINK = "/now/now-assist-admin/other-skills";
        this.CUSTOM_FEATURE_LINK = "/now/now-assist-admin/skills/";
        this.CUSTOM_SKILL_LIST_LINK = "/now/now-assist-admin/skill-list/";
        this.naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
        this.naaSkillConfigAPI = new sn_nowassist_admin.NowAssistSkillConfig();
        this.TABLES = {
            SKILL_CONFIG: "sn_nowassist_skill_config",
            SKILL_FAMILY: "sn_nowassist_skill_family",
            SKILL_CONFIG_VAR_SET: "sn_nowassist_skill_config_var_set",
            GEN_AI_SKILL: "sys_gen_ai_skill",
            GEN_AI_SKILL_CONFIG: "sys_gen_ai_skill_config",
            CS_CNXT_PRF: "sys_cs_context_profile",
            CS_CNXT_PRF_SKILL: "sys_cs_context_profile_skill",
            GEN_AI_SKILL_APP: "sys_gen_ai_skill_applicability",
            UI_ACTION: "sys_ui_action",
            CAPABILITY: "sys_one_extend_capability",
            OE_DEFINITION_CONFIG: "sys_one_extend_definition_config",
            GEN_AI_PROVIDER_MAPPING: "sys_generative_ai_provider_mapping",
            UX_FORM_ACTION: "sys_ux_form_action",
            UI_ACTION_ROLES: "sys_ui_action_role",
            USER_ROLES: "sys_user_role"
        };
    },

    createSkillConfig: function(capabilityId, capabilityData) {
        try {
            if (!gs.nil(capabilityId)) {
                var data = {
                    name: capabilityData.name,
                    description: capabilityData.description,
                    skill_table: this.TABLES.CAPABILITY,
                    skill_id: capabilityId,
                    skill_family: this.CUSTOM_SKILLS_SKILL_FAMILY,
                    state: '0'
                };
                var skillConfigId = NAASkillConfigManipulatorUtil.upsertSkillConfig('', data, true);
                if (!gs.nil(skillConfigId)) {
                    NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigId, {});
                    NAASkillConfigUtil.populateInternalName(skillConfigId);
                }
                return skillConfigId;
            } else {
                gs.error("SkillBuilderNaaUtils-createSkillConfig: Unable to create skill config, capabilityId is empty");
            }
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-createSkillConfig: skill config creation failed due to error: " + error);
        }
    },

    upsertSkillConfig: function(skillConfigId, skillConfigPayload) {
        try {
            if (gs.nil(skillConfigId) || gs.nil(skillConfigPayload)) {
                gs.error("SkillBuilderNaaUtils-upsertSkillConfig: Unable to update skill config, skillConfigId or  skillConfigPayload is empty");
            }
            return NAASkillConfigManipulatorUtil.upsertSkillConfig(skillConfigId, skillConfigPayload);
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-upsertSkillConfig: skill config update failed due to error: " + e);
        }
    },

    isAdmin: function() {
        return gs.hasRole('admin');
    },

    _hasEditAccess: function(glideRecord) {
        return this.isAdmin() || glideRecord.canWrite();
    },


    upsertSkillConfigModalityVarSet: function(skillConfigId, varSetData = {}, varSetDetails = {
        name: "__delivery_step__",
        config_type: this.MODALITY_VAR_SET_CONFIG_TYPE
    }) {
        try {
            var varSetId = this._getModalityVarSet(skillConfigId, varSetDetails.config_type);
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            var _createVarSet = false;
            if (gs.nil(varSetId)) {
                _createVarSet = true;
                varSetGr.initialize();

                varSetGr.setValue("name", varSetDetails.name);
                varSetGr.setValue("skill_config", skillConfigId);
                varSetGr.setValue("config_type", varSetDetails.config_type);

            } else {
                varSetGr.get(varSetId);
            }

            for (var varSetVar in varSetData) {
                varSetGr.vars[varSetVar] = varSetData[varSetVar];
            }
            if (this._hasEditAccess(varSetGr)) {
                if (_createVarSet) varSetGr.insert();
                else varSetGr.update();
            }
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-upsertSkillConfigModalityVarSet: skill config var set creation failed due to error: " + error);
        }

    },

    _getModalityVarSet: function(skillConfigId, varSetConfigType = this.MODALITY_VAR_SET_CONFIG_TYPE) {
        var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
        varSetGr.addQuery("skill_config", skillConfigId);
        varSetGr.query();
        while (varSetGr.next()) {
            if (varSetGr.getValue('config_type') == varSetConfigType) {
                return varSetGr.getUniqueValue();
            }
        }
        return null;
    },

    checkIfUiActionExists: function(skillConfigId) {
        var modalityVarSetId = this._getModalityVarSet(skillConfigId);
        if (!gs.nil(modalityVarSetId)) {
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            varSetGr.get(modalityVarSetId);
            if (gs.nil(varSetGr.vars['ui_action_id']))
                return false;
            else
                return true;
        } else
            return false;
    },

	checkIfFlowActionExists: function(skillConfigId) {
        var modalityVarSetId = this._getModalityVarSet(skillConfigId, this.VIEW_TRIGGER_MODALITY_VAR_SET_CONFIG_TYPE);
        if (!gs.nil(modalityVarSetId)) {
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            varSetGr.get(modalityVarSetId);
            return varSetGr.vars['enable_workflow_trigger'];
        } else
            return false;
    },

    createUiAction: function(skillConfigId, uiActionData) {
        if (gs.nil(skillConfigId) || gs.nil(uiActionData)) {
            gs.error("SkillBuilderNaaUtils-createUiAction: UI action creation failed becasue of invalid data");
            return;
        }
        try {
            var uiActionExists = this.checkIfUiActionExists(skillConfigId);
            if (!uiActionExists && uiActionData.checked) {
                var uiActionSysId = this.naaGlobalUtil._grRecordCreator(this.TABLES.UI_ACTION, {
                    "name": uiActionData.name,
                    "table": uiActionData.table,
                    "script": this._generateCodeSnippet(skillConfigId) || "",
                    "condition": "new sn_nowassist_admin.NowAssistSkillConfig().isSkillConfigurationActive('" + skillConfigId + "')",
                    "active": false,
                    "form_button": true,
                    "form_button_v2": true
                });

                if (global.JSUtil.notNil(uiActionSysId)) {
                    var uxFormActionId = this.naaGlobalUtil._grRecordCreator(this.TABLES.UX_FORM_ACTION, {
                        "name": uiActionData.name,
                        "action_type": "ui_action",
                        "table": uiActionData.table,
                        "ui_action": uiActionSysId,
                        "active": true
                    });
                }

                this.upsertSkillConfigModalityVarSet(skillConfigId, {
                    ui_action_id: uiActionSysId,
                    enable_ui_action: uiActionData.checked
                });
            } else {
                this.upsertSkillConfigModalityVarSet(skillConfigId, {
                    enable_ui_action: uiActionData.checked
                });
            }
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-createUiAction: UI action creation failed due to error: " + error);
        }
    },

    createWorkflowAction: function(skillConfigId) {
        if (gs.nil(skillConfigId)) {
            gs.error("SkillBuilderNaaUtils-createWorkflowAction: Workflow action creation failed becasue of invalid data");
            return;
        }
        try {
            this.upsertSkillConfigModalityVarSet(skillConfigId, {
                enable_workflow_trigger: false
            }, {
                name: "View trigger",
                config_type: this.VIEW_TRIGGER_MODALITY_VAR_SET_CONFIG_TYPE
            });
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-createWorkflowAction: Workflow action creation failed due to error: " + error);
        }
    },

    upsertGenAISkillRecord: function(skillConfigId, isNAP = true) {
        try {
            var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
            skillConfigGr.get(skillConfigId);
            if (gs.nil(skillConfigGr.getValue('nap_skill_applicability')) && this._hasEditAccess(skillConfigGr)) {

                var genAiSkillId = this.naaGlobalUtil._grRecordCreator(this.TABLES.GEN_AI_SKILL, {
                    "skill_name": skillConfigGr.getValue("name"),
                    "skill_table": "sys_one_extend_capability",
                    "skill_document": skillConfigGr.getValue("skill_id")
                });

                var genAiSkillConfigId = this.naaGlobalUtil._grRecordCreator(this.TABLES.GEN_AI_SKILL_CONFIG, {
                    "hint": skillConfigGr.getValue("name"),
                    "active": true,
                    "discoverable": true,
                    "visible": true,
                    "skill_id": genAiSkillId
                });

                var genAiAppId = this.naaGlobalUtil._grRecordCreator(this.TABLES.GEN_AI_SKILL_APP, {
                    "skill_id": genAiSkillId,
                    "roles": "now_assist_panel_user"
                });

                skillConfigGr.setValue('nap_skill_applicability', genAiAppId);
                skillConfigGr.update();
            }
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-upsertGenAISkillRecord: gen AI Skill creation failed due to error: " + error);
        }

    },

    createNapAction: function(skillConfigId, napActionData) {
        if (gs.nil(skillConfigId) || gs.nil(napActionData)) {
            gs.error("SkillBuilderNaaUtils-createNapAction: nap action creation failed because of invalid data");
        }
        try {
            this.upsertGenAISkillRecord(skillConfigId, true);
            this.upsertSkillConfigModalityVarSet(skillConfigId, {
                enable_nap: napActionData.checked
            });
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-createNapAction: nap action creation failed due to error: " + error);
        }
    },

    _getVAModalityActiveStatus: function(skillConfigId) {
        try {
            var vaChatExperiences = this.getConfiguredChatExperiences(skillConfigId, false);
            return vaChatExperiences?.length > 0;
        } catch (e) {
            gs.error("SkillBuilderNaaUtils: Unable to fetch VA Active status");
        }
        return false;
    },

    _getSystemPropertyForVAModalityEnabled: function() {
        return gs.getProperty('sn_nowassist_admin.enable_va_modality').toString() == 'true';

    },

    createUpdateVAModalityAction: function(skillConfigId, associatedChatExperiences, enableConversationalExperience) {
        if (gs.nil(skillConfigId)) {
            gs.error("SkillBuilderNaaUtils-createUpdateVAModalityAction: VA Modality action creation failed becasue of invalid data");
            return;
        }
        try {
            this.upsertGenAISkillRecord(skillConfigId, false);
            this.upsertSkillConfigModalityVarSet(skillConfigId, {
                enable_conversational_experience: enableConversationalExperience,
                associated_chat_experiences: associatedChatExperiences
            });

            this.updateContextProfileSkillRecord(skillConfigId, associatedChatExperiences);

        } catch (error) {
            gs.error("SkillBuilderNaaUtils-createUpdateVAModalityAction: VA Modality action creation failed due to error: " + error.toString());
        }
    },

    getSkillConfigs: function(pageSize, orderByField, orderByDirection, offSet, encodedQuery) {
        try {
            var skillConfigs = [];
            //get skill configs
            var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
            skillConfigGr.addQuery('skill_table', 'sys_one_extend_capability');
            if (!gs.nil(encodedQuery))
                skillConfigGr.addEncodedQuery(encodedQuery);
            if (gs.nil(offSet))
                offSet = 0;
            if (!gs.nil(pageSize))
                skillConfigGr.chooseWindow(offSet, offSet + pageSize);
            if (!gs.nil(orderByField) && !gs.nil(orderByDirection) && orderByDirection == "ascending")
                skillConfigGr.orderBy(orderByField);
            if (!gs.nil(orderByField) && !gs.nil(orderByDirection) && orderByDirection == "descending")
                skillConfigGr.orderByDesc(orderByField);
            skillConfigGr.query();
            while (skillConfigGr.next()) {
                var skillConfigStatusData = NAASkillConfigUtil._getSkillConfigStatus(skillConfigGr.getUniqueValue());

                var isActive = !gs.nil(skillConfigStatusData) ? skillConfigStatusData.active : skillConfigGr.getValue('active') ?? "false";
                isActive = NAAValidator.interpretBoolean(isActive);

                var defaultCapabilityDefinitionForSkillConfig = this.getDefaultCapabilityDefinitionForSkillConfig(skillConfigGr.getUniqueValue()) || "";
                var parentSkillConfig = this.naaSkillConfigAPI.getSkillConfigParent(skillConfigGr.getUniqueValue());
                var provider = this.getDefaultProviderName(skillConfigGr.getValue('skill_id'), defaultCapabilityDefinitionForSkillConfig) || {};
                skillConfigs.push({
                    id: skillConfigGr.getUniqueValue(),
                    name: skillConfigGr.getValue("name"),
                    description: skillConfigGr.getDisplayValue("description"),
                    active: isActive,
                    skill_id: skillConfigGr.getValue('skill_id'),
                    provider: provider.provider,
                    genAIProvider: provider.genAIProvider,
                    defaultCapabilityDefinitionId: defaultCapabilityDefinitionForSkillConfig || "",
                    feature: skillConfigGr.getDisplayValue("skill_family"),
                    workflow: this.getSkillFamilyName(skillConfigGr.getValue('skill_family'), 'workflow') || "",
                    product: this.getSkillFamilyName(skillConfigGr.getValue('skill_family'), 'product') || "",
                    parent: parentSkillConfig ? parentSkillConfig?.getValue('parent') : null,
                    parentSkillConfigName: parentSkillConfig ? parentSkillConfig?.getDisplayValue('parent') : "",
                    created_by: skillConfigGr.getValue("sys_created_by"),
                    created_on: skillConfigGr.getValue("sys_created_on"),
                    updated_on: skillConfigGr.getValue("sys_updated_on"),
                    updated_by: skillConfigGr.getValue("sys_updated_by"),
                    type: NAASkillConfigUtil.getTypeOfSkillConfig(skillConfigGr.getUniqueValue()),
                    scope: skillConfigGr.getValue('sys_scope'),
                    scopeName: skillConfigGr.getDisplayValue('sys_scope'),
                    state: gs.nil(skillConfigGr.getValue('state')) || skillConfigGr.getValue('state') == '1' ? '1' : '0',
                    prompts: this.getPromptsForSkillConfig(skillConfigGr.getUniqueValue()),
                    is_template: skillConfigGr.getValue('is_template') == '1' ? '1' : '0',
                    edited_in_nask: skillConfigGr.getValue('edited_in_nask') == '1' ? '1' : '0',
                    domain: skillConfigGr.getDisplayValue('sys_domain'),
                    internalName: NAASkillConfigUtil._getInternalName(skillConfigGr),
                });
            }
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-getSkillConfigs: failed to fetch all skill configs: " + error.message);
        }

        return skillConfigs;
    },

    getDefaultProviderName: function(capabilityId, defaultCapabilityDefinitionForSkillConfig) {
        var oneExtendDefinitionConfigGr = new GlideRecord(this.TABLES.OE_DEFINITION_CONFIG);
        oneExtendDefinitionConfigGr.addQuery("capability", capabilityId);
        if (global.JSUtil.notNil(defaultCapabilityDefinitionForSkillConfig)) {
            oneExtendDefinitionConfigGr.addQuery("definition", defaultCapabilityDefinitionForSkillConfig);
        } else {
            oneExtendDefinitionConfigGr.addQuery("default", "true");
        }
        oneExtendDefinitionConfigGr.query();
        if (oneExtendDefinitionConfigGr.next()) {
            var definitionApi = oneExtendDefinitionConfigGr.definition.api;
            if (!gs.nil(definitionApi)) {
                var genAiProviderMappingGr = new GlideRecord(this.TABLES.GEN_AI_PROVIDER_MAPPING);
                genAiProviderMappingGr.addQuery("provider_implementation", definitionApi);
                genAiProviderMappingGr.query();
                if (genAiProviderMappingGr.next()) {
                    return {
                        provider: genAiProviderMappingGr.getDisplayValue("gen_ai_provider") || "",
                        genAIProvider: genAiProviderMappingGr.getValue("gen_ai_provider") || ""
                    };
                }
            }
        }
        return {};
    },

    getSkillFamilyName: function(skillFamilyId, type) {
        var skillFamilyGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
        if (skillFamilyGr.get(skillFamilyId)) {
            if (skillFamilyGr.getValue('type') == type) {
                return skillFamilyGr.getValue('name');
            } else {
                if (!gs.nil(skillFamilyGr.getValue('parent'))) {
                    return this.getSkillFamilyName(skillFamilyGr.getValue('parent'), type);
                } else return "";
            }
        }
    },

    getSkillFamilyId: function(skillFamilyId, type) {
        var skillFamilyGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
        if (skillFamilyGr.get(skillFamilyId)) {
            if (skillFamilyGr.getValue('type') == type) {
                return skillFamilyGr.getValue('sys_id');
            } else {
                if (!gs.nil(skillFamilyGr.getValue('parent'))) {
                    return this.getSkillFamilyId(skillFamilyGr.getValue('parent'), type);
                } else return "";
            }
        }
    },

    getSkillConfig: function(skillConfigId) {
        var skillConfigs = this.getSkillConfigs("", "", "", "", "sys_id=" + skillConfigId) || [];
        var skillConfig = skillConfigs && skillConfigs.length == 1 && skillConfigs[0] ? skillConfigs[0] : null;
        return skillConfig;
    },

    getWorkflowsProductsFeatures: function(role) {
        var excludeOOB = true;
        if (!gs.nil(role) && role === 'maint')
            excludeOOB = false;
        var workflowGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
        workflowGr.addQuery("type", "workflow");
        workflowGr.addQuery("parent", "null");
        workflowGr.query();
        var items = [];
        while (workflowGr.next()) {
            var item = {
                id: workflowGr.getUniqueValue(),
                label: workflowGr.getValue('name'),
                products: [],
                features: this.getFeatures(workflowGr.getUniqueValue(), excludeOOB)
            };
            var productGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
            productGr.addQuery("type", "product");
            productGr.addQuery("parent", workflowGr.getUniqueValue());
            productGr.query();
            while (productGr.next()) {
                var productItem = {
                    id: productGr.getUniqueValue(),
                    label: productGr.getValue('name'),
                    features: []
                };

                productItem.features = this.getFeatures(productGr.getUniqueValue(), excludeOOB);
                item.products.push(productItem);
            }
            items.push(item);
        }

        return items;
    },

    getFeatures: function(parent, excludeOOB = true) {
        var features = [];
        var featureGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
        featureGr.addQuery("type", "feature");
        featureGr.addQuery("parent", parent);
        if (excludeOOB)
            featureGr.addQuery("category", 'custom');
        featureGr.query();
        while (featureGr.next()) {
            features.push({
                id: featureGr.getUniqueValue(),
                label: featureGr.getValue('name'),
                category: gs.nil(featureGr.getValue('category')) || featureGr.getValue('category') == 'oob' ? 'oob' : 'custom',
                description: featureGr.getValue('description')
            });
        }
        return features;
    },

    toggleUiActionState: function(uiActionId, active) {
        if (gs.nil(uiActionId) || gs.nil(active)) {
            gs.error("SkillBuilderNaaUtils-toggleUiActionState: Invalid params");
            return;
        }
        try {
            this.naaGlobalUtil.updateRecord(this.TABLES.UI_ACTION, uiActionId, {
                active: active
            });
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-toggleUiActionState: toggle ui action failed due to: " + error);
        }
    },

    updateUiActionRoles: function(uiActionId, rolesIds) {
        if (gs.nil(uiActionId)) {
            gs.error("SkillBuilderNaaUtils-updateUiActionRoles: Invalid params");
            return;
        }

        try {
            var existingUIActionRoles = this.getUiActionRoles(uiActionId);
            var rolesToBeDeleted = [];
            var rolesToBeAdded = [];
            var rolesToBeCommon = [];

            rolesIds?.forEach(roleId => {
                if (existingUIActionRoles.some(i => i.sys_id === roleId)) {
                    rolesToBeCommon.push(roleId);
                } else {
                    rolesToBeAdded.push({
                        "sys_ui_action": uiActionId,
                        "sys_user_role": roleId
                    });
                }
            });

            existingUIActionRoles.forEach(actionRole => {
                if (!rolesToBeCommon.some(i => i === actionRole.sys_id)) {
                    rolesToBeDeleted.push(actionRole.action_role_sys_id);
                }
            });

            rolesToBeAdded.forEach(role => {
                this.naaGlobalUtil._grRecordCreator(this.TABLES.UI_ACTION_ROLES, role);
            });

            rolesToBeDeleted.forEach(uiActionRole => {
                this.naaGlobalUtil.deleteFilterRecord(this.TABLES.UI_ACTION_ROLES, uiActionRole);
            });

        } catch (error) {
            gs.error("SkillBuilderNaaUtils-updateUiActionRoles: update ui action roles failed due to: " + error);
        }

    },

    getUiActionState: function(uiActionId) {
        if (gs.nil(uiActionId)) {
            gs.error("SkillBuilderNaaUtils-getUiActionState: Invalid params");
            return;
        }
        try {
            return this.naaGlobalUtil.getRecord(this.TABLES.UI_ACTION, uiActionId, ['active']);
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-toggleUiActionState: toggle ui action failed due to: " + error);
        }
    },

    getUiActionRoles: function(uiActionId) {
        if (gs.nil(uiActionId)) {
            gs.error("SkillBuilderNaaUtils-getUiActionState: Invalid params");
            return;
        }
        try {
            var gr = new GlideRecord(this.TABLES.UI_ACTION_ROLES);
            gr.addQuery(this.TABLES.UI_ACTION, uiActionId);
            var roles = [];
            gr.query();

            while (gr.next()) {
                roles.push({
                    sys_id: gr?.getValue(this.TABLES.USER_ROLES),
                    id: gr?.getDisplayValue(this.TABLES.USER_ROLES),
                    label: gr?.getDisplayValue(this.TABLES.USER_ROLES),
                    action_role_sys_id: gr?.getValue("sys_id")
                });
            }

            return roles;
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-toggleUiActionState: toggle ui action failed due to: " + error);
        }
    },

    updateSkillConfigLocation: function(skillConfigId, skillFamilyId, featureId, featureData) {
        try {
            if (featureId === "custom" && !gs.nil(featureData)) {
                var featureGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
                if (this._hasEditAccess(featureGr)) {
                    featureGr.initialize();
                    featureGr.setValue('name', featureData.name);
                    featureGr.setValue('description', featureData.description);
                    featureGr.setValue('parent', skillFamilyId);
                    featureGr.setValue('type', 'feature');
                    featureGr.setValue('category', featureData.category || 'custom');
                    featureGr.setValue('image_url', 'images/custom-feature-image.svg');
                    featureGr.setValue('preview_image', 'images/custom-feature-background-image.svg');
                    featureId = featureGr.insert();
                }
            } else if (!gs.nil(featureId) && !gs.nil(featureData) && featureId != this.CUSTOM_SKILLS_SKILL_FAMILY) {
                var existingFeatureGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
                if (existingFeatureGr.get(featureId) && this._hasEditAccess(existingFeatureGr)) {
                    existingFeatureGr.setValue('name', featureData.name);
                    existingFeatureGr.setValue('description', featureData.description);
                    existingFeatureGr.update();
                }
            }
            if (!gs.nil(featureId)) {
                var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
                if (skillConfigGr.get(skillConfigId) && this._hasEditAccess(skillConfigGr)) {
                    skillConfigGr.setValue('skill_family', featureId);
                    skillConfigGr.update();
                }
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-updateSkillConfigLocation: update skill family location failed due to: " + e.toString());
        }


    },

    getTableFromUiAction: function(uiActionId) {
        return this.naaGlobalUtil.getRecord(this.TABLES.UI_ACTION, uiActionId, ['table']).table;
    },

    getUiActionDeliverySetting: function(skillConfigId) {
        var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
        skillConfigGr.get(skillConfigId);
        var skillConfig = {
            enable_ui_action: false,
            skill_name: skillConfigGr.getValue('name'),
            ui_action_id: "",
            ui_action_link: "",
            ui_action_table: ""
        };
        var modalityVarSetId = this._getModalityVarSet(skillConfigId);
        if (!gs.nil(modalityVarSetId)) {
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            if (varSetGr.get(modalityVarSetId)) {

                var vars = varSetGr.vars;
                var variables = {};
                for (var item in vars) {
                    if (item != "sys_meta") {
                        variables[item] = vars[item].toString();
                    }
                }
                skillConfig.enable_ui_action = variables['enable_ui_action'].toString() === "true";
                if (!gs.nil(variables['ui_action_id'])) {
                    skillConfig.ui_action_id = variables['ui_action_id'].toString();
                    skillConfig.ui_action_table = this.getTableFromUiAction(variables['ui_action_id'].toString());
                    skillConfig.ui_action_link = "/sys_ui_action.do?sys_id=" + variables['ui_action_id'].toString();
                }
            }
        }
        return skillConfig;
    },

    getNAPDeliverySetting: function(skillConfigId) {
        var enable_nap = false;
        var modalityVarSetId = this._getModalityVarSet(skillConfigId);
        if (!gs.nil(modalityVarSetId)) {
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            if (varSetGr.get(modalityVarSetId)) {

                var vars = varSetGr.vars;
                var variables = {};
                for (var item in vars) {
                    if (item != "sys_meta") {
                        variables[item] = vars[item].toString();
                    }
                }
                enable_nap = variables['enable_nap'].toString() === "true";

            }
        }
        return enable_nap;
    },

    /*
     * This method will fetch the delivery setting values for required skill variables.
     * @param {String} skillConfigId - Skill configuration Id.
     * @param {String} varSetMap - map of skill variables for which the delivery setting values to be fetched
     * @return {String} varSetSysId.
     */
    getDeliverySettings: function(skillConfigId, varSetMap) {
        var modalityVarSetId = this._getModalityVarSet(skillConfigId);
        var variables = {};
        if (!gs.nil(modalityVarSetId)) {
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            if (varSetGr.get(modalityVarSetId)) {

                var vars = varSetGr.vars;
                for (var item in vars) {
                    if (item != "sys_meta" && varSetMap[item]) {
                        variables[item] = vars[item]?.toString();
                    }
                }
            }
        }
        return variables;
    },

    getWorkflowActionDeliverySetting: function(skillConfigId) {
        var enable_workflow_trigger = false;
        var isWorkflowActionEnabled = false;
        var modalityVarSetId = this._getModalityVarSet(skillConfigId, this.VIEW_TRIGGER_MODALITY_VAR_SET_CONFIG_TYPE);
        if (!gs.nil(modalityVarSetId)) {
            isWorkflowActionEnabled = true;
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            if (varSetGr.get(modalityVarSetId)) {
                enable_workflow_trigger = varSetGr?.vars?.enable_workflow_trigger?.toString() === "true";
            }
        }
        return {
            isWorkflowActionEnabled: isWorkflowActionEnabled,
            enable_workflow_trigger: enable_workflow_trigger
        };
    },

    getVADeliverySetting: function(skillConfigId) {
        var modalityVarSetId = this._getModalityVarSet(skillConfigId);
        if (!gs.nil(modalityVarSetId)) {
            var varSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            if (varSetGr.get(modalityVarSetId)) {
                return {
                    enable_conversational_experience: gs.nil(varSetGr.vars['enable_conversational_experience']) ? false : varSetGr.vars['enable_conversational_experience'].toString() === "true",
                    associated_chat_experiences: gs.nil(varSetGr.vars['associated_chat_experiences']) ? [] : varSetGr.vars['associated_chat_experiences'].split(",")
                };
            }
        }
        return {
            enable_conversational_experience: false,
            associated_chat_experiences: []
        };
    },

    getGenAiSkillId: function(skillConfigId) {
        var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
        if (skillConfigGr.get(skillConfigId)) {
            var skillApplicability = skillConfigGr.getValue('nap_skill_applicability');
            var skillGenAIApplicabilityGr = new GlideRecord(this.TABLES.GEN_AI_SKILL_APP);
            if (skillGenAIApplicabilityGr.get(skillApplicability)) {
                return skillGenAIApplicabilityGr.getValue('skill_id');
            }
        }
        return null;
    },

    getConfiguredChatExperiences: function(skillConfigId, isNAP) {
        try {
            var skillId = this.getGenAiSkillId(skillConfigId);
            return this.getChatExperienceForSkillId(skillId, isNAP);
        } catch (e) {
            gs.error("SkillBuilderNaaUtils- getConfiguredChatExperiences: Unable to get configured chat experirnces" + e.toString());
            return null;
        }
    },

    updateContextProfileSkillRecord: function(skillConfigId, associatedChatExperienceSysIds) {
        try {
            var skillId = this.getGenAiSkillId(skillConfigId);

            var snConvStudioUtil = new sn_convo_studio.Skill();
            return snConvStudioUtil.updateContextProfiles(skillId, associatedChatExperienceSysIds);

        } catch (e) {
            gs.error("SkillBuilderNaaUtils: Unable to update Context Profile skill record" + e.toString());
            return null;
        }

    },

    getChatExperienceForSkillId: function(skillId, isNAP) {
        try {
            var contextProfileSkillGr = new GlideRecord(this.TABLES.CS_CNXT_PRF_SKILL);
            contextProfileSkillGr.addQuery('skill_id', skillId);
            contextProfileSkillGr.query();
            var chatExperiencesList = [];
            while (contextProfileSkillGr.next()) {
                var chatExperience = {};
                chatExperience.sysId = contextProfileSkillGr.getUniqueValue();
                chatExperience.contextProfileId = contextProfileSkillGr.getValue('context_profile');
                chatExperience.contextProfileName = contextProfileSkillGr.getDisplayValue('context_profile');
                var contextProfileGr = new GlideRecord(this.TABLES.CS_CNXT_PRF);
                contextProfileGr.get(chatExperience.contextProfileId);
                if (contextProfileGr.get(chatExperience.contextProfileId)) {
                    var modelType = contextProfileGr.getValue('model_type');
                    if (isNAP && modelType === 'nowassistpanel') {
                        chatExperiencesList.push(chatExperience);
                    }
                    if (!isNAP && modelType !== 'nowassistpanel') {
                        chatExperiencesList.push(chatExperience);
                    }
                }

            }
            return chatExperiencesList;
        } catch (e) {
            gs.error("SkillBuilderNaaUtils: Unable to fetch Chat Experience for SkillId " + e.toString());
            return [];
        }

    },

    getVADeploymentChannels: function() {
        let results = [];
        try {
            var gr = new GlideRecord(this.TABLES.CS_CNXT_PRF);
            gr.addActiveQuery();
            gr.addQuery('model_type', '!=', 'nowassistpanel');
            gr.addQuery('assistant_applicability_type', 'IN', 'profile,group');
            gr.query();

            while (gr.next()) {
                results.push({
                    id: gr.getUniqueValue(),
                    label: gr.getValue('name'),
                    modelType: gr.getValue('model_type'),
                    applicability_type: gr.getValue('assistant_applicability_type')
                });
            }
        } catch (error) {
            gs.error("Failed to get VA channels : " + error.message);
        }
        return results;
    },

    getSkillFamilyHierarchy: function(skillConfigId) {
        var familyConfig = {
            feature: "",
            product: "",
            workflow: "",
        };

        var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
        if (skillConfigGr.get(skillConfigId)) {
            familyConfig.feature = skillConfigGr.getValue('skill_family');
            familyConfig.product = this.getSkillFamilyId(skillConfigGr.getValue('skill_family'), 'product');
            familyConfig.workflow = this.getSkillFamilyId(skillConfigGr.getValue('skill_family'), 'workflow');
        }
        return familyConfig;
    },

    _generateCodeSnippet: function(skillConfigId) {
        var codeSnippet = "";
        var skillConfig = this.getSkillConfig(skillConfigId);
        var capabilityId = (skillConfig || {})["skill_id"] || "";
        if (global.JSUtil.notNil(skillConfigId) && global.JSUtil.notNil(capabilityId)) {
            var capabilityInputsScript = this._getCapabilityInputsForPayload(capabilityId) || "";
            codeSnippet = capabilityInputsScript;
        }
        var oneExtendExecute = "JSON.stringify(skillResponse)";
        var errorMessage = sn_i18n.Message.getMessage("sn_nowassist_admin", "Something went wrong while executing skill.");
        codeSnippet += `\nvar capabilityId = '${capabilityId}'; \nvar request = {\n\texecutionRequests: [{\n\t\tpayload: inputsPayload,\n\t\tcapabilityId: capabilityId,\n\t\tmeta: {\n\t\t\tskillConfigId: '${skillConfigId}'\n\t\t}\n\t}], \n\tmode: 'sync' \n};\n\ntry {\n\tvar response = sn_one_extend.OneExtendUtil.executeSecure(request) || {}; \n\tvar skillResponse = ((response["capabilities"] || {})[capabilityId] || {})["response"]; \n\tgs.addInfoMessage(${oneExtendExecute});\n} catch(e) {\n\tgs.error(e);\n\tgs.addErrorMessage('${errorMessage}');\n}\naction.setRedirectURL(current);`;

        return codeSnippet;
    },

    _getCapabilityInputsForPayload(capabilityId) {
        var codeSnippet = 'var inputsPayload = {};\n';
        var capabilityAttributes = this._getCapabilityAttributes(capabilityId) || {};
        var inputs = capabilityAttributes["inputs"] || {};
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i] || {};
            var attributeName = input["attributeName"] || "";
            var attributeValue = input["attributeValue"];
            var attributeDataType = input["attributeDataType"] || "";
            if (global.JSUtil.notNil(attributeName)) {
                if (attributeDataType === 'glide_record') {
                    var schema = input["schema"] || {};
                    attributeValue = {
                        tableName: schema["tableName"] || "",
                        sysId: "",
                        queryString: ""
                    };
                    codeSnippet += `// ${attributeName} is a input of type: ${attributeDataType}\n`;
                    codeSnippet += `inputsPayload['${attributeName}'] = {\n`;
                    codeSnippet += `  tableName: '${attributeValue.tableName}',\n`;
                    codeSnippet += `  sysId: current.getValue('sys_id'),\n`;
                    codeSnippet += `  queryString: ''\n`;
                    codeSnippet += `};\n`;
                } else {
                    codeSnippet += `// ${attributeName} is a input of type: ${attributeDataType}\n`;
                    codeSnippet += `inputsPayload['${attributeName}'] = current.getValue('${attributeName}');\n`;
                }
            }
        }
        return codeSnippet;
    },

    _getCapabilityAttributes: function(capabilityId) {
        var capabilityAttributes = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityId);
        var _this = this;
        if (global.JSUtil.notNil(capabilityAttributes)) {
            if (global.JSUtil.notNil(capabilityAttributes.inputs)) {
                (capabilityAttributes.inputs || []).forEach(function(input) {
                    _this._transformCapabilityAttribute(input);
                });
            }
            if (global.JSUtil.notNil(capabilityAttributes.outputs)) {
                (capabilityAttributes.outputs || []).forEach(function(output) {
                    _this._transformCapabilityAttribute(output);
                });
            }
        }
        return capabilityAttributes;
    },

    _transformCapabilityAttribute: function(item) {
        if (item) {
            try {
                item.schema = JSON.parse(item.schema || "{}") || {};
            } catch (error) {
                gs.info("Error parsing schema:", error);
                item.schema = {};
            }
        }
    },

    getLinkToNAA: function(skillConfigId) {
        if (gs.nil(skillConfigId)) {
            gs.error("SkillBuilderNaaUtils-getLinkToNAA: Invalid params");
            return;
        }
        try {
            var skillConfigGr = new GlideRecord(this.TABLES.SKILL_CONFIG);
            if (skillConfigGr.get(skillConfigId)) {
                var skillFamily = skillConfigGr.getValue('skill_family');
                if (skillFamily === this.CUSTOM_SKILLS_SKILL_FAMILY)
                    return this.OTHER_SKILLS_LINK;
                else {
                    var skillFamilyGr = new GlideRecord(this.TABLES.SKILL_FAMILY);
                    if (skillFamilyGr.get(skillFamily)) {
                        return this.CUSTOM_SKILL_LIST_LINK + skillFamilyGr.getValue('parent');
                    }

                }
            } else {
                gs.error("SkillBuilderNaaUtils-getLinkToNAA: Skill config does not exist");
                return;
            }
        } catch (error) {
            gs.error("SkillBuilderNaaUtils-getLinkToNAA: Unable to fetch link to NAA due to : " + error);
            return;
        }
    },

    /*
     * This method will create or update var set which stores prompts specific to a skill config
     * @param {String} skillConfigId - Skill configuration Id.
     * @param {String} prompts - coma separated sysIds os sys_generative_ai_config records.
     * @return {String} varSetSysId.
     */
    upsertPromptsToSkillConfig: function(skillConfigId, prompts) {
        try {
            if (gs.nil(skillConfigId)) {
                gs.error("SkillBuilderNaaUtils-upsertPromptsToSkillConfig: Invalid params");
                return;
            }
            var skillConfigVarSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
            skillConfigVarSetGr.addQuery('config_type', this.PROMPT_CONFIG_TYPE);
            skillConfigVarSetGr.setLimit(1);
            skillConfigVarSetGr.query();
            if (this._hasEditAccess(skillConfigVarSetGr)) {
                if (skillConfigVarSetGr.next()) {
                    skillConfigVarSetGr.vars['prompts'] = prompts;
                    return skillConfigVarSetGr.update();
                } else {
                    skillConfigVarSetGr.initialize();
                    skillConfigVarSetGr.setValue('name', 'Skill config prompts');
                    skillConfigVarSetGr.setValue('skill_config', skillConfigId);
                    skillConfigVarSetGr.setValue('config_type', this.PROMPT_CONFIG_TYPE);
                    skillConfigVarSetGr.setValue('hide_step', true);
                    skillConfigVarSetGr.vars['prompts'] = prompts;
                    return skillConfigVarSetGr.insert();
                }
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-upsertPromptsToSkillConfig: Unable to add/update prompts to skill config.");
            return;
        }

    },

    getPromptsForSkillConfig: function(skillConfigId) {
        try {
            if (gs.nil(skillConfigId)) {
                gs.error("SkillBuilderNaaUtils-getPromptsForSkillConfig: Invalid params");
                return;
            }
            var skillConfigVarSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
            skillConfigVarSetGr.addQuery('config_type', this.PROMPT_CONFIG_TYPE);
            skillConfigVarSetGr.setLimit(1);
            skillConfigVarSetGr.query();
            if (skillConfigVarSetGr.next()) {
                return !gs.nil(skillConfigVarSetGr.vars['prompts']) ? skillConfigVarSetGr.vars['prompts'].toString() : null;
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-getPromptsForSkillConfig: Unable to fetch prompts for a skill config.");
            return;
        }
    },

    /*
     * This method will create or update var set which stores default capability_definition specific to a skill config
     * @param {String} skillConfigId - Skill configuration Id.
     * @param {String} defaultCapabilityDefinition -  sysId os sys_one_extend_capability_definition record
     * @return {String} varSetSysId.
     */
    upsertDefaultCapabilityDefinitionToSkillConfig: function(skillConfigId, defaultCapabilityDefinitionId) {
        try {
            if (gs.nil(skillConfigId)) {
                gs.error("SkillBuilderNaaUtils-upsertDefaultDefinitionToSkillConfig: Invalid params");
                return;
            }
            var skillConfigVarSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
            skillConfigVarSetGr.addQuery('config_type', this.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE);
            skillConfigVarSetGr.setLimit(1);
            skillConfigVarSetGr.query();
            if (this._hasEditAccess(skillConfigVarSetGr)) {
                if (skillConfigVarSetGr.next()) {
                    skillConfigVarSetGr.vars['default_capability_definition'] = defaultCapabilityDefinitionId;
                    return skillConfigVarSetGr.update();
                } else {
                    skillConfigVarSetGr.initialize();
                    skillConfigVarSetGr.setValue('name', 'Default Capability Definition');
                    skillConfigVarSetGr.setValue('skill_config', skillConfigId);
                    skillConfigVarSetGr.setValue('config_type', this.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE);
                    skillConfigVarSetGr.setValue('hide_step', true);
                    skillConfigVarSetGr.vars['default_capability_definition'] = defaultCapabilityDefinitionId;
                    return skillConfigVarSetGr.insert();
                }
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-upsertDefaultDefinitionToSkillConfig: Unable to add/update default capability definition to skill config.");
            return;
        }

    },

    getDefaultCapabilityDefinitionForSkillConfig: function(skillConfigId) {
        try {
            if (gs.nil(skillConfigId)) {
                gs.error("SkillBuilderNaaUtils-getDefaultCapabilityDefinitionForSkillConfig: Invalid params");
                return;
            }
            var skillConfigVarSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
            skillConfigVarSetGr.addQuery('config_type', this.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE);
            skillConfigVarSetGr.setLimit(1);
            skillConfigVarSetGr.query();
            if (skillConfigVarSetGr.next()) {
                return !gs.nil(skillConfigVarSetGr.vars['default_capability_definition']) ? skillConfigVarSetGr.vars['default_capability_definition'].toString() : null;
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-getDefaultCapabilityDefinitionForSkillConfig: Unable to fetch  default capability definition for a skill config.");
            return;
        }
    },

    /**
     * Retrieves the NACM details for a given capability ID.
     *
     * This method uses the NacmActionUtils utility to fetch both active and inactive NACM action records 
     * associated with the specified capability. It returns an object containing two properties:
     * - `activeRecords`: List of active NACM actions
     * - `inactiveRecords`: List of inactive NACM actions
     *
     * @param {String} capabilityId - The unique identifier of the capability for which NACM details are to be retrieved.
     * @returns {Object} An object with the following structure:
     *                   {
     *                     activeRecords: [Array of active NACM action records],
     *                     inactiveRecords: [Array of inactive NACM action records]
     *                   }
     *                   Returns an empty object if an error occurs.
     *
     * @example
     * var nacmDetails = SkillBuilderNaaUtils.getNacmDetailsForCapability('cap_12345');
     * gs.info(nacmDetails.activeRecords.length + ' active records found');
     *
     * @logs Error using `gs.error` if NACM details retrieval fails.
     */
    getNacmDetailsForCapability: function(capabilityId) {
        var details = {};
        try {
            var nacmUtil = new sn_wwna.NacmActionUtils();
            details['activeRecords'] = nacmUtil.getNAcmActions(capabilityId, true);
            details['inactiveRecords'] = nacmUtil.getNAcmActions(capabilityId, false);
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-getNacmDetailsForCapability: Unable to fetch NACM details for a skill config :" + e.message);
        }
        return details;
    },

    getNacmDetailsForSkillConfig: function(skillConfigId) {
        try {
            if (NAAPluginUtil.isNowAssistContextMenuPluginInstalled()) {
                var capabilityId, name, activeRecords, inactiveRecords;
                var skillConfig = NAASkillConfigUtil.getSkillConfig(skillConfigId);
                capabilityId = skillConfig?.skill_id;
                name = skillConfig?.name;
                if (!gs.nil(capabilityId)) {
                    var details = this.getNacmDetailsForCapability(capabilityId);
                    activeRecords = details['activeRecords'];
                    inactiveRecords = details['inactiveRecords'];
                }
                return {
                    skill_name: name,
                    activeRecords: activeRecords,
                    inactiveRecords: inactiveRecords
                };
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-getNacmDetailsForSkillConfig: Unable to fetch NACM details for a skill config :" + e.toString());
        }

    },

    updateNacmDetailsForSkillConfig: function(skillConfigId, value) {
        try {
            if (NAAPluginUtil.isNowAssistContextMenuPluginInstalled()) {
                var nacmUtil = new sn_wwna.NacmActionUtils();
                var capabilityId;
                var skillConfig = NAASkillConfigUtil.getSkillConfig(skillConfigId);
                capabilityId = skillConfig?.skill_id;
                if (!gs.nil(capabilityId)) {
                    // call API
                    return nacmUtil.updateNAcmAction(capabilityId, {
                        "active": value
                    });
                }
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-updateNacmDetailsForSkillConfig: Unable to update NACM details for the skill config :" + e.toString());
        }
    },


    setVarSetVisibility: function(skillConfigId, varSetSysId, hide) {
        try {
            if (gs.nil(skillConfigId) || gs.nil(varSetSysId) || gs.nil(hide)) {
                gs.error("SkillBuilderNaaUtils-setVarSetVisibility: Invalid params");
                return;
            }
            var skillConfigVarSetGr = new GlideRecord(this.TABLES.SKILL_CONFIG_VAR_SET);
            skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
            skillConfigVarSetGr.addQuery('sys_id', varSetSysId);
            skillConfigVarSetGr.query();
            if (this._hasEditAccess(skillConfigVarSetGr) && skillConfigVarSetGr.next()) {
                skillConfigVarSetGr.hide_step = hide;
                return skillConfigVarSetGr.update();
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-setVarSetVisibility: Unable to toggle var_set visibility");
        }
        return;

    },


    setViewTriggerVarSetVisibility: function(skillConfigId, hide) {
        try {
            if (gs.nil(skillConfigId)) {
                gs.error("SkillBuilderNaaUtils-setViewTriggerVarSetVisibility: Invalid params");
                return;
            }
            var viewTriggerModalityVarSetId = this._getModalityVarSet(skillConfigId, this.VIEW_TRIGGER_MODALITY_VAR_SET_CONFIG_TYPE);
            if (viewTriggerModalityVarSetId) {
                return this.setVarSetVisibility(skillConfigId, viewTriggerModalityVarSetId, hide);
            }
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-setViewTriggerVarSetVisibility: Unable to toggle view trigger visibility");
        }
        return;

    },

    getWorkFlowEnabledSkills: function(workFlowId, productId, featureId) {
        try {

            var skillFamily;
            if (featureId) {
                skillFamily = featureId;
            } else if (productId) {
                skillFamily = productId;
            } else {
                skillFamily = workFlowId;
            }

            var skillsForGivenFamily = NAASkillConfigUtil.getSkills(skillFamily, true);
            var workFlowActivatedSkills = [];

            skillsForGivenFamily.forEach(i => {
                if (this.getWorkflowActionDeliverySetting(i.id).enable_workflow_trigger) {
                    workFlowActivatedSkills.push(i);
                }
            });
            return workFlowActivatedSkills;
        } catch (e) {
            gs.error("SkillBuilderNaaUtils-getWorkFlowEnabledSkills: Unable to get workflow enabled skills");
        }
        return;

    },

    /**
     * Retrieves the internal name for a given skill configuration ID.
     * 
     * Logic:
     * - Attempts to fetch the skill config record from the table using the provided ID.
     * - If the record exists:
     *    - Checks if the `internal_name` field has a non-empty value.
     *    - If it does, returns that value.
     *    - If not, constructs the internal name dynamically using the skill name and ID.
     * - If the record does not exist, logs an error and returns an empty string.
     * 
     * @param {String} skill_config_id - The sys_id of the skill configuration record.
     * @returns {String} - The existing or dynamically generated internal name.
     */
    getInternalName: function(skill_config_id) {
        return NAASkillConfigUtil.getInternalName(skill_config_id);
    },

    type: 'SkillBuilderNaaUtils'
}
